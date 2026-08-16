import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const input = process.argv[2] ? path.resolve(process.argv[2]) : null;
const output = path.join(root, "data", "ai-classifications.source.json");
if (!input || !fs.existsSync(input)) throw new Error("Usage: npm run ai:batch:import -- <downloaded-output.jsonl>");

const existing = fs.existsSync(output) ? JSON.parse(fs.readFileSync(output, "utf8")) : {};
let imported = 0;
let failed = 0;

function outputText(body) {
  if (typeof body?.output_text === "string") return body.output_text;
  return (body?.output ?? []).flatMap((item) => item.content ?? []).find((item) => item.type === "output_text")?.text ?? "";
}

for (const line of fs.readFileSync(input, "utf8").split(/\r?\n/).filter(Boolean)) {
  try {
    const envelope = JSON.parse(line);
    const text = outputText(envelope.response?.body);
    const jsonText = text.replace(/^```json\s*/i, "").replace(/\s*```$/, "").trim();
    const result = JSON.parse(jsonText);
    existing[envelope.custom_id] = {
      isSignal: Boolean(result.isSignal),
      topic: String(result.topic || "Unclassified").slice(0, 80),
      assets: Array.isArray(result.assets) ? result.assets.filter((asset) => ["SPY", "QQQ", "TSLA", "NVDA", "MSFT"].includes(asset)) : [],
      signalType: String(result.signalType || "Other"),
      entities: Array.isArray(result.entities) ? result.entities.map(String).slice(0, 8) : [],
      clusterLabel: String(result.clusterLabel || "unclassified").slice(0, 120),
      confidence: ["Low", "Medium", "High"].includes(result.confidence) ? result.confidence : "Low",
      reason: String(result.reason || "").slice(0, 300),
    };
    imported += 1;
  } catch {
    failed += 1;
  }
}

fs.writeFileSync(output, `${JSON.stringify(existing, null, 2)}\n`);
console.log(`Imported ${imported.toLocaleString()} classifications; ${failed.toLocaleString()} lines could not be parsed.`);
console.log("Run npm run catalog:build to merge them into the deployable catalog.");
