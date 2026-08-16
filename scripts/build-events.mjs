import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import { XMLParser } from "fast-xml-parser";

const root = process.cwd();
const outputDir = path.join(root, "data", "generated");
fs.mkdirSync(outputDir, { recursive: true });

const cleanText = (value = "") =>
  value
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

const asNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

function classifyMusk(text) {
  if (/\b(tesla|cybertruck|model [3xy]|vehicle|fsd|full self.?driving|autonom|supercharger)\b/i.test(text)) {
    return { topic: "Tesla & EV", asset: "TSLA", benchmark: "QQQ" };
  }
  if (/\b(xai|grok|artificial intelligence|ai |optimus|robot|neuralink)\b/i.test(text)) {
    return { topic: "AI & robotics", asset: "TSLA", benchmark: "QQQ" };
  }
  return null;
}

function classifyTrump(text) {
  if (/\b(tariffs?|trade|china|import|export)\b/i.test(text)) {
    return { topic: "Trade & tariffs", asset: "QQQ", benchmark: "SPY" };
  }
  if (/\b(inflation|economy|economic|interest rate|federal reserve|\bfed\b|jobs report|stock markets?)\b/i.test(text)) {
    return { topic: "Economy & rates", asset: "SPY", benchmark: "QQQ" };
  }
  if (/\b(nvidia)\b/i.test(text)) {
    return { topic: "Technology policy", asset: "NVDA", benchmark: "QQQ" };
  }
  if (/\b(ai|artificial intelligence|chip|semiconductor|technology|big tech)\b|A\.I\./i.test(text)) {
    return { topic: "Technology policy", asset: "QQQ", benchmark: "SPY" };
  }
  return null;
}

function loadMusk() {
  const file = path.join(root, "all_musk_posts.csv");
  if (!fs.existsSync(file)) return [];
  const rows = parse(fs.readFileSync(file), { columns: true, skip_empty_lines: true, relax_quotes: true });
  const records = rows
    .filter((row) => row.createdAt >= "2023-01-01" && row.createdAt <= "2025-04-13T23:59:59Z")
    .filter((row) => row.isReply !== "True" && row.isRetweet !== "True")
    .map((row) => ({
      id: `musk-${row.id}`,
      person: "musk",
      personName: "Elon Musk",
      role: "Founder power",
      platform: "X",
      publishedAt: row.createdAt,
      text: cleanText(row.fullText),
      sourceUrl: row.url,
      likes: asNumber(row.likeCount),
      reposts: asNumber(row.retweetCount),
      views: asNumber(row.viewCount),
    }))
    .filter((row) => row.text.length >= 24);
  const reviewedIds = new Set([
    "musk-1730278921248161877", // Cybertruck production line
    "musk-1752922071229722990", // Texas incorporation vote
    "musk-1756751879701156059", // seasonal demand incentive
    "musk-1778881361249800203", // FSD subscription price
    "musk-1785406795814510785", // Supercharger expansion pace
    "musk-1819797937414611313", // Tesla AI compute cluster
    "musk-1884467091899593076", // unsupervised FSD milestone
    "musk-1906727530607808546", // Austin robotaxi timeline
  ]);
  return records
    .filter((record) => reviewedIds.has(record.id))
    .map((record) => ({ ...record, classification: classifyMusk(record.text) }))
    .filter((record) => record.classification);
}

function loadTrump() {
  const file = path.join(root, "Kaggle_Trump_2009_2025.csv");
  if (!fs.existsSync(file)) return [];
  const rows = parse(fs.readFileSync(file), { columns: true, skip_empty_lines: true, relax_quotes: true });
  const records = rows
    .filter((row) => row.date >= "2023-01-01" && row.date <= "2025-12-31T23:59:59Z")
    .filter((row) => row.repost_flag !== "True")
    .map((row) => ({
      id: `trump-${row.id}`,
      person: "trump",
      personName: "Donald Trump",
      role: "Policy power",
      platform: row.platform || "Truth Social",
      publishedAt: row.date,
      text: cleanText(row.text),
      sourceUrl: row.post_url,
      likes: asNumber(row.favorite_count),
      reposts: asNumber(row.repost_count),
      views: null,
    }))
    .filter((row) => row.text.length >= 35);
  const reviewedIds = new Set([
    "trump-112909351574797350", // August 2024 market selloff statement
    "trump-113546215051155542", // Mexico and Canada tariff announcement
    "trump-113573130299319701", // BRICS currency and tariff statement
    "trump-113683654440040843", // EU energy purchases and tariffs
    "trump-1909258777380974625", // tariff revenue and Fed rate pressure
    "trump-114341773968885783", // NVIDIA US investment announcement
    "trump-114352766082542122", // direct Powell rate criticism
    "trump-114664632971715644", // US-China rare-earth deal statement
  ]);
  return records
    .filter((record) => reviewedIds.has(record.id))
    .map((record) => ({ ...record, classification: classifyTrump(record.text) }))
    .filter((record) => record.classification);
}

function loadAltman() {
  const file = path.join(root, "data", "sam-events.source.json");
  return JSON.parse(fs.readFileSync(file, "utf8")).map((row) => ({
    ...row,
    person: "altman",
    personName: "Sam Altman",
    role: "AI narrative power",
    platform: "X",
    benchmark: "QQQ",
    classification: { topic: row.topic, asset: row.asset, benchmark: "QQQ" },
  }));
}

function loadKoreanSummaries() {
  return JSON.parse(fs.readFileSync(path.join(root, "data", "event-summaries.ko.json"), "utf8"));
}

async function fetchChart(symbol) {
  const start = Math.floor(new Date("2022-01-01T00:00:00Z").getTime() / 1000);
  const end = Math.floor(Date.now() / 1000) + 86400;
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${start}&period2=${end}&interval=1d&events=history`;
  const response = await fetch(url, { headers: { "User-Agent": "MarketMoverHackathon/1.0" } });
  if (!response.ok) throw new Error(`Market data ${symbol}: ${response.status}`);
  const json = await response.json();
  const result = json.chart?.result?.[0];
  if (!result) throw new Error(`No market data for ${symbol}`);
  const quote = result.indicators.quote[0];
  return result.timestamp
    .map((timestamp, index) => ({
      date: new Date(timestamp * 1000).toISOString().slice(0, 10),
      close: quote.close[index],
      volume: quote.volume[index],
    }))
    .filter((row) => Number.isFinite(row.close) && Number.isFinite(row.volume));
}

function easternDate(iso) {
  const date = new Date(iso);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type) => Number(parts.find((part) => part.type === type)?.value);
  const base = new Date(Date.UTC(get("year"), get("month") - 1, get("day")));
  if (get("hour") >= 16) base.setUTCDate(base.getUTCDate() + 1);
  return base.toISOString().slice(0, 10);
}

const pct = (value) => Math.round(value * 100) / 100;

function buildReaction(event, assetSeries, benchmarkSeries) {
  const target = easternDate(event.publishedAt);
  const assetIndex = assetSeries.findIndex((row) => row.date >= target);
  if (assetIndex < 21 || assetIndex + 5 >= assetSeries.length) throw new Error(`Insufficient market window for ${event.id}`);
  const sessionDate = assetSeries[assetIndex].date;
  const benchmarkIndex = benchmarkSeries.findIndex((row) => row.date === sessionDate);
  if (benchmarkIndex < 1 || benchmarkIndex + 2 >= benchmarkSeries.length) throw new Error(`Benchmark mismatch for ${event.id}`);

  const assetBase = assetSeries[assetIndex - 1].close;
  const benchmarkBase = benchmarkSeries[benchmarkIndex - 1].close;
  const at = (offset) => {
    const a = assetSeries[assetIndex + offset].close / assetBase - 1;
    const b = benchmarkSeries[benchmarkIndex + offset].close / benchmarkBase - 1;
    return { asset: pct(a * 100), benchmark: pct(b * 100), abnormal: pct((a - b) * 100) };
  };

  const dayOne = at(0);
  const dayThree = at(2);
  const trailing = assetSeries.slice(assetIndex - 20, assetIndex).map((row) => row.volume);
  const avgVolume = trailing.reduce((sum, value) => sum + value, 0) / trailing.length;
  let persistence = "Faded";
  if (Math.sign(dayOne.abnormal) !== Math.sign(dayThree.abnormal)) persistence = "Reversed";
  else if (Math.abs(dayThree.abnormal) >= Math.abs(dayOne.abnormal) * 0.5) persistence = "Persisted";

  return {
    metrics: {
      abnormalReturn1D: dayOne.abnormal,
      volumeMultiple: pct(assetSeries[assetIndex].volume / avgVolume),
      cumulativeAbnormal3D: dayThree.abnormal,
      persistence,
    },
    window: [
      { day: -1, asset: 0, benchmark: 0 },
      { day: 0, ...at(0) },
      { day: 1, ...at(1) },
      { day: 3, ...at(2) },
    ].map(({ day, asset, benchmark }) => ({ day, asset, benchmark })),
    priceWindow: assetSeries.slice(assetIndex - 5, assetIndex + 6).map((row, index) => ({
      session: index - 5,
      date: row.date,
      close: pct(row.close),
    })),
    sessionDate,
  };
}

function rationale(person, classification) {
  if (person === "trump") return `Policy-language match linked to ${classification.asset}; ${classification.benchmark} is shown as the broad-market control.`;
  if (person === "musk") return `Company or technology statement linked directly to ${classification.asset}; ${classification.benchmark} is the market control.`;
  return `${classification.asset} is an explicitly labeled AI proxy, not a company directly owned or operated by Sam Altman.`;
}

async function buildLiveFallback(priceSeries) {
  const parser = new XMLParser({ ignoreAttributes: false, removeNSPrefix: true });
  let signals = [];
  try {
    const response = await fetch("https://www.trumpstruth.org/feed", { headers: { "User-Agent": "MarketMoverHackathon/1.0" } });
    const xml = parser.parse(await response.text());
    const items = Array.isArray(xml.rss.channel.item) ? xml.rss.channel.item : [xml.rss.channel.item];
    signals = items.slice(0, 5).map((item) => ({
      id: String(item.originalId ?? item.guid),
      text: cleanText(String(item.title)),
      publishedAt: new Date(item.pubDate).toISOString(),
      sourceUrl: String(item.originalUrl ?? item.link),
      topic: classifyTrump(String(item.title))?.topic ?? "Public statement",
      state: "Pending market session",
    }));
  } catch {
    signals = [];
  }

  const prices = Object.fromEntries(
    Object.entries(priceSeries).map(([symbol, rows]) => {
      const latest = rows.at(-1);
      return [symbol, { price: pct(latest.close), asOf: latest.date }];
    }),
  );
  const now = new Date().toISOString();
  return {
    fetchedAt: now,
    mode: "fallback",
    signals,
    prices,
    sources: [
      {
        id: "trump-rss",
        label: "Trump public statements",
        provider: "Trump's Truth RSS",
        cadence: "Daily demo refresh",
        access: "Free",
        state: signals.length ? "Fresh" : "Stale",
        lastSuccessAt: now,
        note: "Independent public archive; production uses licensed Truth API.",
      },
      {
        id: "market-data",
        label: "US market prices",
        provider: "Twelve Data / cached fallback",
        cadence: "Daily",
        access: "Free",
        state: "Fresh",
        lastSuccessAt: now,
        note: "Five-symbol demo scope. Display licensing required for commercial use.",
      },
      {
        id: "x-connectors",
        label: "Musk and Altman live posts",
        provider: "X API",
        cadence: "Near real time in Pro",
        access: "Paid connector",
        state: "Stale",
        lastSuccessAt: now,
        note: "Historical cases are available; live X ingestion is intentionally disabled in Free.",
      },
    ],
  };
}

async function main() {
  const raw = [...loadTrump(), ...loadMusk(), ...loadAltman()];
  const koreanSummaries = loadKoreanSummaries();
  if (raw.length < 20) throw new Error(`Expected at least 20 source events, got ${raw.length}`);

  const symbols = ["SPY", "QQQ", "TSLA", "NVDA", "MSFT"];
  const series = Object.fromEntries(await Promise.all(symbols.map(async (symbol) => [symbol, await fetchChart(symbol)])));
  const events = raw.map((event) => {
    const classification = event.classification;
    const reaction = buildReaction(event, series[classification.asset], series[classification.benchmark]);
    return {
      id: event.id,
      person: event.person,
      personName: event.personName,
      role: event.role,
      platform: event.platform,
      publishedAt: event.publishedAt,
      text: event.text,
      sourceUrl: event.sourceUrl,
      topic: classification.topic,
      signalType: event.person === "trump" ? "Policy signal" : event.person === "musk" ? "Executive signal" : "Industry signal",
      tags: [classification.topic, classification.asset, event.personName],
      summaryKo: koreanSummaries[event.id] ?? event.text,
      asset: classification.asset,
      benchmark: classification.benchmark,
      coverage: event.person === "trump" ? "Policy" : event.person === "altman" ? "Proxy" : "Direct",
      engagement: { likes: event.likes, reposts: event.reposts, views: event.views },
      metrics: reaction.metrics,
      window: reaction.window,
      priceWindow: reaction.priceWindow,
      eventSession: reaction.sessionDate,
      rationale: rationale(event.person, classification),
    };
  });

  events.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  fs.writeFileSync(path.join(outputDir, "events.json"), `${JSON.stringify(events, null, 2)}\n`);
  const fallback = await buildLiveFallback(series);
  fs.writeFileSync(path.join(outputDir, "live-fallback.json"), `${JSON.stringify(fallback, null, 2)}\n`);
  console.log(`Generated ${events.length} events and ${Object.keys(fallback.prices).length} price snapshots.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
