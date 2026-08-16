import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const catalogFile = path.join(root, "data", "generated", "signal-catalog.json");
const outputDir = path.join(root, "data", "batch");
const outputFile = process.argv[2] ? path.resolve(process.argv[2]) : path.join(outputDir, "signal-classification.jsonl");
const model = process.env.OPENAI_BATCH_MODEL || process.env.OPENAI_MODEL || "gpt-5.4-nano";

if (!fs.existsSync(catalogFile)) throw new Error("Run npm run catalog:build first.");
const catalog = JSON.parse(fs.readFileSync(catalogFile, "utf8"));
fs.mkdirSync(path.dirname(outputFile), { recursive: true });

const system = [
  "Classify a public post for an evidence-first signal-monitoring product.",
  "Return only one JSON object with keys: isSignal (boolean), topic (short string), assets (array limited to SPY, QQQ, TSLA, NVDA, MSFT), signalType (Policy, Executive, Industry, or Other), entities (string array), clusterLabel (short reusable label), confidence (Low, Medium, or High), reason (one sentence).",
  "A signal must contain a concrete policy, company, product, market, technology, or industry claim. Do not infer news coverage, social amplification, price reaction, or causality.",
].join(" ");

const lines = catalog.records.map((record) => JSON.stringify({
  custom_id: record.id,
  method: "POST",
  url: "/v1/responses",
  body: {
    model,
    input: [
      { role: "system", content: system },
      { role: "user", content: JSON.stringify({ entity: record.entity, publishedAt: record.publishedAt, text: record.text }) },
    ],
    max_output_tokens: 220,
  },
}));

fs.writeFileSync(outputFile, `${lines.join("\n")}\n`);
console.log(`Prepared ${lines.length.toLocaleString()} /v1/responses requests at ${outputFile}`);
console.log("Upload this JSONL with purpose=batch, create a 24h Batch, then import the downloaded output with npm run ai:batch:import -- <file>.");
