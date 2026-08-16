import { XMLParser } from "fast-xml-parser";
import { liveFallback } from "@/lib/data";
import type { LivePayload, LiveSignal, SourceStatus } from "@/lib/types";

const symbols = ["SPY", "QQQ", "TSLA", "NVDA", "MSFT"];

function cleanText(value: string) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function topicFor(text: string) {
  if (/\b(tariffs?|trade|china|import|export)\b/i.test(text)) return "Trade & tariffs";
  if (/\b(inflation|economy|economic|interest rate|federal reserve|\bfed\b|jobs)\b/i.test(text)) {
    return "Economy & rates";
  }
  if (/\b(ai|artificial intelligence|chip|semiconductor|technology|big tech)\b/i.test(text)) {
    return "Technology policy";
  }
  return "Public statement";
}

async function fetchTrumpSignals(force: boolean): Promise<LiveSignal[]> {
  const response = await fetch("https://www.trumpstruth.org/feed", {
    headers: { "User-Agent": "MarketMoverHackathon/1.0" },
    ...(force ? { cache: "no-store" as const } : { next: { revalidate: 86_400, tags: ["market-live"] } }),
  });
  if (!response.ok) throw new Error(`Trump RSS returned ${response.status}`);

  const parser = new XMLParser({ ignoreAttributes: false, removeNSPrefix: true });
  const xml = parser.parse(await response.text());
  const rawItems = xml?.rss?.channel?.item;
  const items = Array.isArray(rawItems) ? rawItems : rawItems ? [rawItems] : [];

  return items.slice(0, 5).map((item: Record<string, unknown>) => {
    const text = cleanText(String(item.title ?? ""));
    return {
      id: String(item.originalId ?? item.guid ?? item.link),
      text,
      publishedAt: new Date(String(item.pubDate)).toISOString(),
      sourceUrl: String(item.originalUrl ?? item.link),
      topic: topicFor(text),
      state: "Pending market session" as const,
    };
  });
}

async function fetchTwelvePrice(symbol: string, apiKey: string, force: boolean) {
  const url = new URL("https://api.twelvedata.com/time_series");
  url.searchParams.set("symbol", symbol);
  url.searchParams.set("interval", "1day");
  url.searchParams.set("outputsize", "1");
  url.searchParams.set("apikey", apiKey);
  const response = await fetch(url, {
    ...(force ? { cache: "no-store" as const } : { next: { revalidate: 86_400, tags: ["market-live"] } }),
  });
  if (!response.ok) throw new Error(`Twelve Data ${symbol} returned ${response.status}`);
  const json = await response.json();
  const latest = json?.values?.[0];
  if (!latest?.close) throw new Error(json?.message ?? `No price for ${symbol}`);
  return [symbol, { price: Number(latest.close), asOf: String(latest.datetime) }] as const;
}

export async function getLivePayload({ force = false }: { force?: boolean } = {}): Promise<LivePayload> {
  const now = new Date().toISOString();
  let signals = liveFallback.signals;
  let prices = liveFallback.prices;
  let rssFresh = false;
  let pricesFresh = false;

  try {
    const nextSignals = await fetchTrumpSignals(force);
    if (nextSignals.length) {
      signals = nextSignals;
      rssFresh = true;
    }
  } catch {
    // The bundled snapshot keeps the demo usable when the archive is unavailable.
  }

  const apiKey = process.env.TWELVE_DATA_API_KEY;
  if (apiKey) {
    try {
      prices = Object.fromEntries(await Promise.all(symbols.map((symbol) => fetchTwelvePrice(symbol, apiKey, force))));
      pricesFresh = true;
    } catch {
      // Preserve the last build-time market snapshot on quota or provider errors.
    }
  }

  const sources: SourceStatus[] = [
    {
      id: "trump-rss",
      label: "Trump public statements",
      provider: "Trump's Truth RSS",
      cadence: "Daily demo refresh",
      access: "Free",
      state: rssFresh ? "Fresh" : "Stale",
      lastSuccessAt: rssFresh ? now : liveFallback.sources[0]?.lastSuccessAt ?? liveFallback.fetchedAt,
      note: "Independent public archive; production uses a licensed Truth API.",
    },
    {
      id: "market-data",
      label: "US market prices",
      provider: apiKey ? "Twelve Data Basic" : "Bundled market snapshot",
      cadence: "Daily",
      access: "Free",
      state: pricesFresh ? "Fresh" : "Stale",
      lastSuccessAt: pricesFresh ? now : liveFallback.sources[1]?.lastSuccessAt ?? liveFallback.fetchedAt,
      note: apiKey
        ? "Five-symbol demo scope; cached if the provider quota is unavailable."
        : "Add TWELVE_DATA_API_KEY to enable the daily live refresh.",
    },
    {
      id: "x-connectors",
      label: "Musk and Altman live posts",
      provider: "X API",
      cadence: "Near real time in Pro",
      access: "Paid connector",
      state: "Stale",
      lastSuccessAt: liveFallback.sources[2]?.lastSuccessAt ?? liveFallback.fetchedAt,
      note: "Historical cases are included; live X ingestion is intentionally disabled in Free.",
    },
  ];

  return {
    fetchedAt: now,
    mode: rssFresh || pricesFresh ? "live" : "fallback",
    signals,
    prices,
    sources,
  };
}
