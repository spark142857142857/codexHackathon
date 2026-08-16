import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const apiKey = process.env.OPENAI_API_KEY;
const stateFile = path.join(root, "data", "batch", "batch-state.json");
const state = fs.existsSync(stateFile) ? JSON.parse(fs.readFileSync(stateFile, "utf8")) : {};
const batchId = process.argv[2] || state.batchId;

if (!apiKey) throw new Error("OPENAI_API_KEY is required to check a Batch job.");
if (!batchId) throw new Error("No batch ID found. Pass one or run npm run ai:batch:submit first.");

const response = await fetch(`https://api.openai.com/v1/batches/${encodeURIComponent(batchId)}`, {
  headers: { Authorization: `Bearer ${apiKey}` },
});
if (!response.ok) throw new Error(`Batch status failed (${response.status}): ${await response.text()}`);
const batch = await response.json();
console.log(`Batch ${batch.id}: ${batch.status} (${batch.request_counts?.completed ?? 0}/${batch.request_counts?.total ?? 0}, ${batch.request_counts?.failed ?? 0} failed)`);

if (batch.status === "completed" && batch.output_file_id) {
  const output = await fetch(`https://api.openai.com/v1/files/${encodeURIComponent(batch.output_file_id)}/content`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!output.ok) throw new Error(`Batch output download failed (${output.status}): ${await output.text()}`);
  const outputFile = path.join(root, "data", "batch", `${batch.id}-output.jsonl`);
  fs.writeFileSync(outputFile, await output.text());
  console.log(`Downloaded results to ${outputFile}`);
  console.log(`Next: npm run ai:batch:import -- "${outputFile}" && npm run catalog:build`);
}
