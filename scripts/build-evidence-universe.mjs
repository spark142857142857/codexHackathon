import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const catalogFile = path.join(root, "data", "generated", "signal-catalog.json");
const reviewedFile = path.join(root, "data", "generated", "events.json");
const outputFile = path.join(root, "data", "generated", "evidence-universe.json");
const atlasFile = path.join(root, "data", "generated", "atlas-events.json");
const ASSETS = ["SPY", "QQQ", "TSLA", "NVDA", "MSFT", "BTC-USD", "SOXX"];
const MARKET_CONTEXT_ASSETS = ["SPY", "QQQ", "BTC-USD"];
const MARKET_TOPICS = new Set(["Trade & tariffs", "Economy & rates", "Technology policy", "Tesla & EV", "AI & robotics", "Energy & climate", "Crypto"]);
const MEDIA_PATTERN = /\b(reuters|bloomberg|cnbc|wsj|nytimes|bbc|cnn|foxnews|theguardian|apnews|forbes|politico|axios|washingtonpost)\b/i;
const round = (value) => Math.round(value * 100) / 100;

function representativeScore(row) {
  const engagement = [row.engagement.likes, row.engagement.reposts, row.engagement.views]
    .reduce((sum, value) => sum + Math.max(0, Number(value) || 0), 0);
  return (row.reviewed ? 1_000_000 : 0) + (row.topic !== "Unclassified" ? 100_000 : 0)
    + Math.log10(engagement + 1) * 1_000 + Math.min(row.text.length, 420);
}

function relevanceScore(row) {
  const engagement = [row.engagement.likes, row.engagement.reposts, row.engagement.views]
    .reduce((sum, value) => sum + Math.max(0, Number(value) || 0), 0);
  return (row.reviewed ? 100 : 0) + (MARKET_TOPICS.has(row.topic) ? 50 : 0)
    + Math.log10(engagement + 1) * 5 + Math.min(row.assets.length, 4) * 3 + Math.min(row.hashtags.length, 4)
    + (row.externalUrls ?? []).filter((url) => MEDIA_PATTERN.test(url)).length * 60;
}

async function fetchChart(symbol) {
  const start = Math.floor(new Date("2022-01-01T00:00:00Z").getTime() / 1000);
  const end = Math.floor(Date.now() / 1000) + 86400;
  const encoded = encodeURIComponent(symbol);
  const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encoded}?period1=${start}&period2=${end}&interval=1d&events=history`, {
    headers: { "User-Agent": "MarketSignalAtlasHackathon/1.0" },
  });
  if (!response.ok) throw new Error(`Market data ${symbol}: ${response.status}`);
  const result = (await response.json()).chart?.result?.[0];
  if (!result) throw new Error(`No market data for ${symbol}`);
  const quote = result.indicators.quote[0];
  return result.timestamp.map((timestamp, index) => ({
    date: new Date(timestamp * 1000).toISOString().slice(0, 10),
    close: quote.close[index], volume: quote.volume[index],
  })).filter((row) => Number.isFinite(row.close) && Number.isFinite(row.volume));
}

function easternSession(iso) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23" }).formatToParts(new Date(iso));
  const get = (type) => Number(parts.find((part) => part.type === type)?.value);
  const date = new Date(Date.UTC(get("year"), get("month") - 1, get("day")));
  if (get("hour") >= 16) date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

function standardDeviation(values) {
  if (values.length < 2) return 0;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  return Math.sqrt(values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (values.length - 1));
}

function primaryMapping(row) {
  if (row.topic === "Crypto") return { asset: "BTC-USD", benchmark: "QQQ", coverage: "Proxy" };
  if (row.topic === "Tesla & EV") return { asset: "TSLA", benchmark: "QQQ", coverage: "Direct" };
  if (["AI & robotics", "Technology policy"].includes(row.topic)) return { asset: "SOXX", benchmark: "QQQ", coverage: "Proxy" };
  return { asset: "SPY", benchmark: "QQQ", coverage: "Policy" };
}

function buildReaction(row, series, mapping) {
  const assetRows = series[mapping.asset];
  const benchmarkRows = series[mapping.benchmark];
  const target = easternSession(row.publishedAt);
  const index = assetRows.findIndex((item) => item.date >= target);
  if (index < 21 || index + 5 >= assetRows.length) return null;
  const eventSession = assetRows[index].date;
  const benchmarkIndex = benchmarkRows.findIndex((item) => item.date === eventSession);
  if (benchmarkIndex < 21 || benchmarkIndex + 2 >= benchmarkRows.length) return null;
  const assetBase = assetRows[index - 1].close;
  const benchmarkBase = benchmarkRows[benchmarkIndex - 1].close;
  const abnormal = (offset) => ((assetRows[index + offset].close / assetBase - 1) - (benchmarkRows[benchmarkIndex + offset].close / benchmarkBase - 1)) * 100;
  const dayOne = abnormal(0);
  const dayThree = abnormal(2);
  const cumulative = (offset) => ({
    asset: round((assetRows[index + offset].close / assetBase - 1) * 100),
    benchmark: round((benchmarkRows[benchmarkIndex + offset].close / benchmarkBase - 1) * 100),
  });
  const trailingVolume = assetRows.slice(index - 20, index).map((item) => item.volume);
  const meanVolume = trailingVolume.reduce((sum, value) => sum + value, 0) / trailingVolume.length;
  const returns = (rows) => rows.slice(1).map((item, i) => item.close / rows[i].close - 1);
  const baseVol = standardDeviation(returns(assetRows.slice(index - 20, index)));
  const eventVol = standardDeviation(returns(assetRows.slice(index - 1, index + 3)));
  let persistence = "Faded";
  if (Math.sign(dayOne) !== Math.sign(dayThree)) persistence = "Reversed";
  else if (Math.abs(dayThree) >= Math.abs(dayOne) * 0.5) persistence = "Persisted";
  const priceWindow = assetRows.slice(index - 5, index + 6).map((item, i) => ({ session: i - 5, date: item.date, close: round(item.close) }));
  const relatedAssets = [...new Set([mapping.asset, ...row.assets.filter((asset) => ASSETS.includes(asset)), ...MARKET_CONTEXT_ASSETS])];
  const priceWindows = Object.fromEntries(relatedAssets.map((symbol) => {
    const byDate = new Map(series[symbol].map((item) => [item.date, item.close]));
    return [symbol, priceWindow.map((point) => ({ ...point, close: byDate.has(point.date) ? round(byDate.get(point.date)) : null }))];
  }));
  return {
    eventSession,
    abnormalReturn1D: round(dayOne), volumeMultiple: round(assetRows[index].volume / meanVolume),
    cumulativeAbnormal3D: round(dayThree), volatilityMultiple: round(baseVol ? eventVol / baseVol : 0), persistence,
    window: [-1, 0, 1, 2].map((offset, index) => ({ day: [-1, 0, 1, 3][index], ...(offset === -1 ? { asset: 0, benchmark: 0 } : cumulative(offset)) })),
    relatedAssets,
    priceWindow,
    priceWindows,
  };
}

function attentionFor(row, records, priceWindow) {
  const eventSession = priceWindow.find((point) => point.session === 0).date;
  const start = new Date(`${eventSession}T00:00:00Z`); start.setUTCDate(start.getUTCDate() - 5);
  const end = new Date(`${eventSession}T23:59:59Z`); end.setUTCDate(end.getUTCDate() + 5);
  const terms = [...new Set([row.topic.split(/[ &]/)[0].toLowerCase(), ...row.hashtags.map((tag) => tag.toLowerCase()), ...row.assets.map((asset) => asset.toLowerCase())])].filter((term) => term.length > 2);
  const matches = records.filter((candidate) => {
    const date = new Date(candidate.publishedAt);
    return date >= start && date <= end && (candidate.id === row.id || candidate.clusterId === row.clusterId
      || terms.some((term) => `${candidate.text} ${candidate.hashtags.join(" ")}`.toLowerCase().includes(term)));
  });
  const attentionWindow = priceWindow.map((point) => {
    const daily = matches.filter((item) => item.publishedAt.slice(0, 10) === point.date);
    return {
      session: point.session,
      date: point.date,
      newsCount: null,
      trackedMentions: daily.length,
      hashtagCount: new Set(daily.flatMap((item) => item.hashtags.map((tag) => tag.toLowerCase()))).size,
    };
  });
  return {
    trackedMentions: matches.length,
    linkedMediaReferences: matches.reduce((sum, item) => sum + (item.externalUrls ?? []).filter((url) => MEDIA_PATTERN.test(url)).length, 0),
    attentionWindow,
  };
}

function orchestration(row, mapping, reaction, attention) {
  const hasAttention = attention.trackedMentions > 1 || attention.linkedMediaReferences > 0;
  const moved = Math.abs(reaction.abnormalReturn1D) >= 1;
  const confidence = mapping.coverage === "Direct" && hasAttention ? "High" : mapping.coverage === "Proxy" ? "Low" : "Medium";
  const verdict = moved && hasAttention ? "Reaction detected" : moved || hasAttention ? "Mixed evidence" : "Insufficient evidence";
  const stage = (id, level, en, ko) => ({ id, state: "Complete", confidence: level, summaryEn: en, summaryKo: ko });
  return {
    mode: "deterministic", confidence, verdict,
    summaryEn: `${row.entity}'s ${row.topic} signal was aligned to ${mapping.asset}. The one-day excess move was ${reaction.abnormalReturn1D.toFixed(2)}%; this is association, not causality.`,
    summaryKo: `${row.entity}의 ${row.topic} 시그널을 ${mapping.asset}에 정렬했습니다. 1일 초과 움직임은 ${reaction.abnormalReturn1D.toFixed(2)}%이며 인과관계가 아닌 관찰된 연관성입니다.`,
    stages: [
      stage("classify", "High", `Rule taxonomy classified ${row.topic}.`, `규칙 분류기가 ${row.topic}으로 분류했습니다.`),
      stage("map", confidence, `${mapping.asset} was mapped as ${mapping.coverage.toLowerCase()} evidence.`, `${mapping.asset}을(를) ${mapping.coverage} 근거로 매핑했습니다.`),
      stage("amplify", hasAttention ? "Medium" : "Low", `${attention.trackedMentions} related mentions and ${attention.linkedMediaReferences} linked media references were found in the tracked corpus.`, `추적 코퍼스에서 관련 언급 ${attention.trackedMentions}건과 미디어 링크 ${attention.linkedMediaReferences}건을 확인했습니다.`),
      stage("market", "High", "Actual closes, volume and volatility were calculated from the static market snapshot.", "정적 시장 스냅샷의 실제 종가·거래량·변동성을 계산했습니다."),
      stage("audit", confidence, "Timing, proxy risk and evidence coverage were audited deterministically.", "시간 정렬·프록시 위험·근거 범위를 결정론적으로 감사했습니다."),
      stage("report", confidence, "A bilingual evidence report was rendered from the audited fields.", "감사된 필드로 한영 증거 리포트를 생성했습니다."),
    ],
    caveats: ["Temporal association does not establish causality.", "Attention covers only the tracked Trump and Musk corpora.", ...(mapping.coverage === "Proxy" ? ["The selected asset is a proxy mapping."] : [])],
  };
}

async function main() {
  if (!fs.existsSync(catalogFile)) throw new Error("Run catalog:build first");
  const catalog = JSON.parse(fs.readFileSync(catalogFile, "utf8"));
  const reviewedEvents = JSON.parse(fs.readFileSync(reviewedFile, "utf8"));
  const byCluster = new Map();
  for (const row of catalog.records) if (!byCluster.has(row.clusterId) || representativeScore(row) > representativeScore(byCluster.get(row.clusterId))) byCluster.set(row.clusterId, row);
  const representatives = [...byCluster.values()].sort((a, b) => relevanceScore(b) - relevanceScore(a) || b.publishedAt.localeCompare(a.publishedAt));
  const series = Object.fromEntries(await Promise.all(ASSETS.map(async (asset) => [asset, await fetchChart(asset)])));
  const evidence = [];
  for (const row of representatives) {
    if (!MARKET_TOPICS.has(row.topic)) continue;
    const mapping = primaryMapping(row);
    const reaction = buildReaction(row, series, mapping);
    if (!reaction) continue;
    const attention = attentionFor(row, catalog.records, reaction.priceWindow);
    evidence.push({ id: row.id, score: round(relevanceScore(row)), ...mapping, ...reaction, ...attention,
      attentionCoverage: "Mentions and linked-media references cover only the tracked Trump and Musk source corpora; they are not global news or social counts.",
      orchestration: orchestration(row, mapping, reaction, attention),
    });
  }
  const payload = { meta: { generatedAt: new Date().toISOString(), representativeCount: representatives.length, enrichedCount: evidence.length, assetCoverage: ASSETS, methodology: ["One highest-evidence representative per rule-seeded cluster.", "Top market-relevant representatives receive deterministic price, volume, volatility and tracked-corpus attention evidence.", "No paid runtime API or generative model is required."] }, representativeIds: representatives.map((row) => row.id), evidence };
  fs.writeFileSync(outputFile, `${JSON.stringify(payload)}\n`);
  const recordsById = new Map(catalog.records.map((row) => [row.id, row]));
  const socialAtlasEvents = evidence.map((item) => {
    const row = recordsById.get(item.id);
    const signalType = row.entityId === "trump" ? "Policy signal" : "Executive signal";
    return {
      id: row.id,
      person: row.entityId,
      personName: row.entity,
      role: row.entityId === "trump" ? "Policy power" : "Founder power",
      platform: row.platform,
      sourceType: "Social",
      timePrecision: "exact",
      publishedAt: row.publishedAt,
      text: row.text,
      sourceUrl: row.sourceUrl,
      topic: row.topic,
      signalType,
      tags: [...new Set([row.topic, ...row.assets])],
      relatedAssets: item.relatedAssets,
      hashtags: row.hashtags,
      summaryKo: item.orchestration.summaryKo,
      asset: item.asset,
      benchmark: item.benchmark,
      coverage: item.coverage,
      engagement: row.engagement,
      metrics: {
        abnormalReturn1D: item.abnormalReturn1D,
        volumeMultiple: item.volumeMultiple,
        cumulativeAbnormal3D: item.cumulativeAbnormal3D,
        persistence: item.persistence,
      },
      window: item.window,
      priceWindow: item.priceWindow,
      priceWindows: item.priceWindows,
      attentionWindow: item.attentionWindow,
      attentionCoverage: `${item.attentionCoverage} Verified media-domain links in the same tracked window: ${item.linkedMediaReferences}.`,
      eventSession: item.eventSession,
      rationale: `${item.asset} is a ${item.coverage.toLowerCase()} mapping for the ${row.topic} signal; ${item.benchmark} is comparison context only.`,
      orchestration: item.orchestration,
    };
  });
  const reviewedCrossSourceEvents = reviewedEvents.filter(
    (event) => event.sourceType !== "Social",
  );
  const atlasEvents = [...reviewedCrossSourceEvents, ...socialAtlasEvents]
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  fs.writeFileSync(atlasFile, `${JSON.stringify(atlasEvents)}\n`);
  console.log(`Generated ${representatives.length.toLocaleString()} representatives and ${evidence.length} evidence-ready signals.`);
}

main();
