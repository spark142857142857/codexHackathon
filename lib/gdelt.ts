import "server-only";

import { XMLParser } from "fast-xml-parser";

import type {
  MarketEvent,
  NewsArticle,
  NewsEvidencePayload,
  SocialEvidence,
  SocialPostEvidence,
} from "@/lib/types";

function gdeltDate(value: string, end = false) {
  return `${value.replaceAll("-", "")}${end ? "235959" : "000000"}`;
}

function queryFor(event: MarketEvent) {
  const terms = [event.personName, event.tags[0] ?? event.topic]
    .map((term) => term.replace(/["()]/g, " ").replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .slice(0, 2);
  return terms.map((term) => `"${term}"`).join(" ");
}

function entityName(event: MarketEvent) {
  return event.personName.replace(/\s+(Newsroom|Investor Relations)$/i, "").trim();
}

function addDays(value: string, amount: number) {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

function eventRange(event: MarketEvent) {
  return {
    first: event.priceWindow[0]?.date ?? event.eventSession,
    last: event.priceWindow.at(-1)?.date ?? event.eventSession,
  };
}

function publicQuery(event: MarketEvent) {
  const entity = entityName(event);
  const context = event.asset === "SPY" || event.asset === "QQQ" ? event.topic.split(" & ")[0] : event.asset;
  return `"${entity}" ${context}`;
}

function baseUrl(event: MarketEvent, mode: string) {
  const { first, last } = eventRange(event);
  const params = new URLSearchParams({
    query: queryFor(event),
    mode,
    format: "json",
    maxrecords: "250",
    startdatetime: gdeltDate(first),
    enddatetime: gdeltDate(last, true),
  });
  return `https://api.gdeltproject.org/api/v2/doc/doc?${params}`;
}

function googleNewsUrl(event: MarketEvent) {
  const { first, last } = eventRange(event);
  const params = new URLSearchParams({
    q: `${publicQuery(event)} after:${first} before:${addDays(last, 1)}`,
    hl: "en-US",
    gl: "US",
    ceid: "US:en",
  });
  return `https://news.google.com/rss/search?${params}`;
}

function blueskyUrl(event: MarketEvent) {
  const { first, last } = eventRange(event);
  const params = new URLSearchParams({
    q: publicQuery(event).replaceAll('"', ""),
    limit: "100",
    sort: "top",
    since: `${first}T00:00:00Z`,
    until: `${last}T23:59:59Z`,
  });
  return `https://api.bsky.app/xrpc/app.bsky.feed.searchPosts?${params}`;
}

function dateKey(value: unknown) {
  const digits = String(value ?? "").replace(/\D/g, "");
  return digits.length >= 8
    ? `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`
    : null;
}

function articleEvidence(payload: unknown) {
  const root = payload as { articles?: Array<Record<string, unknown>> };
  const all: NewsArticle[] = (root.articles ?? []).flatMap((item) => {
      const url = String(item.url ?? "");
      const title = String(item.title ?? "").trim();
      if (!url.startsWith("http") || !title) return [];
      let domain = String(item.domain ?? "");
      if (!domain) {
        try {
          domain = new URL(url).hostname.replace(/^www\./, "");
        } catch {
          domain = "News source";
        }
      }
      return [{ title, url, domain, publishedAt: dateKey(item.seendate) }];
    });
  const counts: Record<string, number> = {};
  for (const article of all) {
    if (article.publishedAt) counts[article.publishedAt] = (counts[article.publishedAt] ?? 0) + 1;
  }
  return { counts, articles: all.slice(0, 2) };
}

function googleNewsEvidence(xml: string) {
  const parser = new XMLParser({ ignoreAttributes: false, trimValues: true });
  const root = parser.parse(xml) as { rss?: { channel?: { item?: Array<Record<string, unknown>> | Record<string, unknown> } } };
  const rawItems = root.rss?.channel?.item;
  const items = Array.isArray(rawItems) ? rawItems : rawItems ? [rawItems] : [];
  const all: NewsArticle[] = items.flatMap((item) => {
    const title = String(item.title ?? "").trim();
    const url = String(item.link ?? "");
    const published = new Date(String(item.pubDate ?? ""));
    const source = item.source as { "#text"?: unknown } | string | undefined;
    const domain = typeof source === "string" ? source : String(source?.["#text"] ?? "Google News source");
    if (!title || !url.startsWith("http") || Number.isNaN(published.valueOf())) return [];
    return [{ title, url, domain, publishedAt: published.toISOString().slice(0, 10) }];
  });
  const counts: Record<string, number> = {};
  for (const article of all) {
    if (article.publishedAt) counts[article.publishedAt] = (counts[article.publishedAt] ?? 0) + 1;
  }
  return { counts, articles: all.slice(0, 2) };
}

function socialFallback(event: MarketEvent): SocialEvidence {
  const counts = Object.fromEntries(event.attentionWindow.map((point) => [point.date, point.trackedMentions ?? 0]));
  const hashtagCounts = Object.fromEntries(event.attentionWindow.map((point) => [point.date, point.hashtagCount ?? 0]));
  const available = Object.values(counts).some(Boolean) || Object.values(hashtagCounts).some(Boolean) || event.hashtags.length > 0;
  return {
    status: available ? "snapshot" : "unavailable",
    provider: "Tracked Trump and Musk corpus",
    query: publicQuery(event),
    counts,
    hashtagCounts,
    hashtags: event.hashtags.map((tag) => ({ tag, count: 1 })),
    posts: [],
    message: available ? "Tracked-corpus social snapshot" : "No public social evidence available",
  };
}

function blueskyEvidence(payload: unknown, event: MarketEvent): SocialEvidence {
  const root = payload as { posts?: Array<{ uri?: string; author?: { handle?: string }; record?: { text?: string; createdAt?: string } }> };
  const counts: Record<string, number> = {};
  const hashtagCounts: Record<string, number> = {};
  const hashtagFrequency = new Map<string, number>();
  const posts: SocialPostEvidence[] = [];
  for (const item of root.posts ?? []) {
    const text = String(item.record?.text ?? "").trim();
    const publishedAt = String(item.record?.createdAt ?? "");
    const date = dateKey(publishedAt);
    if (!text || !date) continue;
    counts[date] = (counts[date] ?? 0) + 1;
    const tags = text.match(/#[\p{L}\p{N}_]+/gu)?.map((tag) => tag.toLowerCase()).filter((tag) => !/^#\d+$/.test(tag) && tag.length > 2) ?? [];
    hashtagCounts[date] = (hashtagCounts[date] ?? 0) + tags.length;
    for (const tag of tags) hashtagFrequency.set(tag, (hashtagFrequency.get(tag) ?? 0) + 1);
    if (posts.length < 2) {
      const handle = String(item.author?.handle ?? "Bluesky user");
      const rkey = String(item.uri ?? "").split("/").at(-1);
      posts.push({ text, author: handle, publishedAt, url: rkey ? `https://bsky.app/profile/${handle}/post/${rkey}` : "https://bsky.app" });
    }
  }
  const hashtags = [...hashtagFrequency.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([tag, count]) => ({ tag, count }));
  if (!Object.keys(counts).length) return socialFallback(event);
  return {
    status: "live",
    provider: "Bluesky public search sample",
    query: publicQuery(event),
    counts,
    hashtagCounts,
    hashtags,
    posts,
    message: `Sampled ${Object.values(counts).reduce((sum, count) => sum + count, 0)} matching public posts`,
  };
}

async function fetchJson(url: string) {
  const response = await fetch(url, {
    headers: { "User-Agent": "MarketSignalAtlas/1.0" },
    next: { revalidate: 86_400, tags: ["gdelt-news"] },
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) throw new Error(`GDELT returned ${response.status}`);
  return response.json() as Promise<unknown>;
}

async function publicNews(event: MarketEvent) {
  try {
    const response = await fetch(googleNewsUrl(event), {
      headers: { "User-Agent": "MarketSignalAtlas/1.0" },
      next: { revalidate: 86_400, tags: ["public-news"] },
      signal: AbortSignal.timeout(12_000),
    });
    if (!response.ok) throw new Error(`Google News RSS returned ${response.status}`);
    const evidence = googleNewsEvidence(await response.text());
    if (Object.keys(evidence.counts).length || evidence.articles.length) {
      return { status: "live" as const, provider: "Google News RSS search", query: publicQuery(event), ...evidence, message: "Public news RSS evidence; up to 100 returned items" };
    }
  } catch {
    // GDELT is a second public source, not a fabricated fallback.
  }
  try {
    const response = await fetchJson(baseUrl(event, "artlist"));
    const evidence = articleEvidence(response);
    if (Object.keys(evidence.counts).length || evidence.articles.length) {
      return { status: "live" as const, provider: "GDELT DOC 2.0", query: queryFor(event), ...evidence, message: "GDELT article evidence; up to 250 returned items" };
    }
  } catch {
    // The reviewed snapshot below is the explicit fallback.
  }
  const counts = Object.fromEntries(event.attentionWindow.flatMap((point) => point.newsCount === null ? [] : [[point.date, point.newsCount]]));
  return {
    status: Object.keys(counts).length ? "snapshot" as const : "unavailable" as const,
    provider: Object.keys(counts).length ? "Reviewed GDELT snapshot" : "No news source",
    query: queryFor(event),
    counts,
    articles: [] as NewsArticle[],
    message: Object.keys(counts).length ? "Reviewed news snapshot" : "No news-volume evidence available",
  };
}

async function publicSocial(event: MarketEvent): Promise<SocialEvidence> {
  try {
    const response = await fetch(blueskyUrl(event), {
      headers: { "User-Agent": "MarketSignalAtlas/1.0" },
      next: { revalidate: 86_400, tags: ["public-social"] },
      signal: AbortSignal.timeout(12_000),
    });
    if (!response.ok) throw new Error(`Bluesky returned ${response.status}`);
    return blueskyEvidence(await response.json(), event);
  } catch {
    return socialFallback(event);
  }
}

export async function getNewsEvidence(
  event: MarketEvent,
): Promise<NewsEvidencePayload> {
  const [news, social] = await Promise.all([publicNews(event), publicSocial(event)]);
  return {
    eventId: event.id,
    fetchedAt: new Date().toISOString(),
    ...news,
    social,
  };
}
