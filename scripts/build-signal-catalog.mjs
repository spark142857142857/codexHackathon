import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";

const root = process.cwd();
const outputFile = path.join(root, "data", "generated", "signal-catalog.json");
const aiFile = path.join(root, "data", "ai-classifications.source.json");
const reviewedFile = path.join(root, "data", "generated", "events.json");

const cleanText = (value = "") => String(value)
  .replace(/<[^>]+>/g, " ")
  .replace(/&amp;/g, "&")
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/\s+/g, " ")
  .trim();

const bool = (value) => String(value).toLowerCase() === "true";
const numberOrNull = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};
const hash = (value) => crypto.createHash("sha1").update(value).digest("hex").slice(0, 12);
const hashtags = (text) => Array.from(new Set(text.match(/#[\p{L}\p{N}_]+/gu) ?? [])).slice(0, 8);
const urls = (value = "") => Array.from(new Set(String(value).match(/https?:\/\/[^\s,'"\]]+/g) ?? [])).slice(0, 4);

const topicRules = [
  { topic: "Crypto", assets: ["BTC-USD"], pattern: /\b(bitcoin|btc|dogecoin|doge|crypto|cryptocurrency|blockchain)\b/i },
  { topic: "Trade & tariffs", assets: ["SPY", "QQQ"], pattern: /\b(tariffs?|trade|china|imports?|exports?|customs|sanctions?)\b/i },
  { topic: "Economy & rates", assets: ["SPY", "QQQ"], pattern: /\b(inflation|economy|economic|interest rates?|federal reserve|\bfed\b|jobs?|employment|gdp|recession|dollar)\b/i },
  { topic: "Technology policy", assets: ["SOXX", "QQQ", "NVDA"], pattern: /\b(artificial intelligence|a\.i\.|semiconductors?|chips?|nvidia|technology|big tech|data centers?)\b/i },
  { topic: "Tesla & EV", assets: ["TSLA"], pattern: /\b(tesla|cybertruck|model [3sxy]|electric vehicles?|\bev\b|fsd|full self.?driving|robotaxi|superchargers?)\b/i },
  { topic: "AI & robotics", assets: ["SOXX", "QQQ", "NVDA", "MSFT"], pattern: /\b(xai|grok|openai|chatgpt|artificial intelligence|\bai\b|optimus|robots?|robotics|neuralink|language models?|foundation models?|ai models?|compute)\b/i },
  { topic: "Corporate operations", assets: [], pattern: /\b(earnings|revenue|profits?|factory|production|deliveries|incorporat|shareholders?|board|ceo|company)\b/i },
  { topic: "Energy & climate", assets: ["SPY"], pattern: /\b(oil|gas|energy|electricity|solar|battery|climate|emissions?)\b/i },
];

function rulesFor(text) {
  const matches = topicRules.filter((rule) => rule.pattern.test(text));
  if (!matches.length) return { topic: "Unclassified", assets: [], confidence: "Low" };
  return {
    topic: matches[0].topic,
    assets: Array.from(new Set(matches.flatMap((match) => match.assets))).slice(0, 4),
    confidence: matches.length > 1 ? "High" : "Medium",
  };
}

function weekBucket(value) {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return "unknown";
  const first = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((date - first) / 86400000) + first.getUTCDay() + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function loadCsv(file) {
  return parse(fs.readFileSync(path.join(root, file)), {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
  });
}

function loadMusk(rows) {
  return rows
    .filter((row) => String(row.createdAt) >= "2023-01-01")
    .filter((row) => !bool(row.isReply) && !bool(row.isRetweet))
    .map((row) => ({
      id: `musk-${row.id}`,
      entity: "Elon Musk",
      entityId: "musk",
      sourceType: "Social",
      platform: "X",
      publishedAt: row.createdAt,
      text: cleanText(row.fullText),
      sourceUrl: row.url || row.twitterUrl,
      externalUrls: urls(row.fullText).filter((url) => !/\b(x\.com|twitter\.com)\b/i.test(url)),
      engagement: {
        likes: numberOrNull(row.likeCount),
        reposts: numberOrNull(row.retweetCount),
        views: numberOrNull(row.viewCount),
      },
    }));
}

function loadTrump(rows) {
  return rows
    .filter((row) => String(row.date) >= "2023-01-01")
    .filter((row) => !bool(row.repost_flag))
    .map((row) => ({
      id: `trump-${row.id}`,
      entity: "Donald Trump",
      entityId: "trump",
      sourceType: "Social",
      platform: row.platform || "Truth Social",
      publishedAt: row.date,
      text: cleanText(row.text),
      sourceUrl: row.post_url,
      externalUrls: urls(row.urls || row.text).filter((url) => !/\b(truthsocial\.com)\b/i.test(url)),
      engagement: {
        likes: numberOrNull(row.favorite_count),
        reposts: numberOrNull(row.repost_count),
        views: null,
      },
    }));
}

function main() {
  for (const file of ["all_musk_posts.csv", "Kaggle_Trump_2009_2025.csv", "data/generated/events.json"]) {
    if (!fs.existsSync(path.join(root, file))) throw new Error(`Missing required source: ${file}`);
  }

  const reviewedEvents = JSON.parse(fs.readFileSync(reviewedFile, "utf8"));
  const reviewedIds = new Set(reviewedEvents.map((event) => event.id));
  const ai = fs.existsSync(aiFile) ? JSON.parse(fs.readFileSync(aiFile, "utf8")) : {};
  const muskRows = loadCsv("all_musk_posts.csv");
  const trumpRows = loadCsv("Kaggle_Trump_2009_2025.csv");
  const sourceRows = [...loadTrump(trumpRows), ...loadMusk(muskRows)];
  const fingerprintCounts = new Map();
  for (const row of sourceRows) {
    const fingerprint = hash(row.text.toLowerCase().replace(/https?:\/\/\S+/g, "").replace(/[^\p{L}\p{N}]+/gu, " ").trim());
    fingerprintCounts.set(fingerprint, (fingerprintCounts.get(fingerprint) ?? 0) + 1);
    row.fingerprint = fingerprint;
  }

  const records = sourceRows.map((row) => {
    const rule = rulesFor(row.text);
    const aiResult = ai[row.id] ?? null;
    const reviewed = reviewedIds.has(row.id);
    const topic = aiResult?.topic || rule.topic;
    const assets = aiResult?.assets?.length ? aiResult.assets : rule.assets;
    const classificationMethod = reviewed ? "human_reviewed" : aiResult ? "ai" : rule.topic === "Unclassified" ? "pending" : "rules";
    const relevance = reviewed ? "signal" : aiResult ? (aiResult.isSignal ? "signal" : "not_signal") : rule.topic === "Unclassified" ? "uncertain" : "candidate";
    const clusterLabel = aiResult?.clusterLabel || `${row.entityId}:${topic}:${weekBucket(row.publishedAt)}`;
    return {
      id: row.id,
      entity: row.entity,
      entityId: row.entityId,
      sourceType: row.sourceType,
      platform: row.platform,
      publishedAt: new Date(row.publishedAt).toISOString(),
      text: row.text.slice(0, 420),
      sourceUrl: row.sourceUrl,
      externalUrls: row.externalUrls,
      hashtags: hashtags(row.text),
      engagement: row.engagement,
      topic,
      assets,
      classificationMethod,
      relevance,
      confidence: aiResult?.confidence || rule.confidence,
      clusterId: `cluster-${hash(clusterLabel)}`,
      duplicateCount: fingerprintCounts.get(row.fingerprint) ?? 1,
      reviewed,
      aiReason: aiResult?.reason || null,
    };
  }).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  const countBy = (field) => Object.fromEntries(Array.from(new Set(records.map((row) => row[field]))).sort().map((value) => [value, records.filter((row) => row[field] === value).length]));
  const payload = {
    meta: {
      generatedAt: new Date().toISOString(),
      rawCorpusTotal: muskRows.length + trumpRows.length,
      eligibleCandidates: records.length,
      reviewedShowcases: reviewedEvents.length,
      reviewedInCatalog: records.filter((row) => row.reviewed).length,
      aiClassified: records.filter((row) => row.classificationMethod === "ai").length,
      aiPending: records.filter((row) => row.classificationMethod !== "ai").length,
      clusterCount: new Set(records.map((row) => row.clusterId)).size,
      entityCounts: countBy("entityId"),
      methodCounts: countBy("classificationMethod"),
      note: "All eligible Musk and Trump originals since 2023 are included. Sam Altman has no complete local corpus and remains represented by reviewed showcases.",
    },
    records,
  };

  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, `${JSON.stringify(payload)}\n`);
  console.log(`Generated ${records.length.toLocaleString()} candidates, ${payload.meta.clusterCount.toLocaleString()} rule-seeded clusters, ${payload.meta.aiClassified.toLocaleString()} AI imports.`);
}

main();
