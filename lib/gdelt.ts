import "server-only";

import type {
  MarketEvent,
  NewsArticle,
  NewsEvidencePayload,
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

function baseUrl(event: MarketEvent, mode: string) {
  const first = event.priceWindow[0]?.date ?? event.eventSession;
  const last = event.priceWindow.at(-1)?.date ?? event.eventSession;
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

async function fetchJson(url: string) {
  const response = await fetch(url, {
    headers: { "User-Agent": "MarketSignalAtlas/1.0" },
    next: { revalidate: 86_400, tags: ["gdelt-news"] },
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) throw new Error(`GDELT returned ${response.status}`);
  return response.json() as Promise<unknown>;
}

export async function getNewsEvidence(
  event: MarketEvent,
): Promise<NewsEvidencePayload> {
  const query = queryFor(event);
  try {
    // GDELT asks public clients to avoid burst traffic. One article-list request
    // supplies both the headline evidence and conservative daily counts.
    const response = await fetchJson(baseUrl(event, "artlist"));
    const evidence = articleEvidence(response);
    if (Object.keys(evidence.counts).length || evidence.articles.length) {
      return {
        eventId: event.id,
        status: "live",
        fetchedAt: new Date().toISOString(),
        query,
        counts: evidence.counts,
        articles: evidence.articles,
        message: "Live GDELT evidence",
      };
    }
  } catch {
    // The reviewed snapshot below is the explicit fallback.
  }

  const counts = Object.fromEntries(
    event.attentionWindow.flatMap((point) =>
      point.newsCount === null ? [] : [[point.date, point.newsCount]],
    ),
  );
  return {
    eventId: event.id,
    status: Object.keys(counts).length ? "snapshot" : "unavailable",
    fetchedAt: new Date().toISOString(),
    query,
    counts,
    articles: [],
    message: Object.keys(counts).length
      ? "Reviewed news snapshot"
      : "No news-volume evidence available",
  };
}
