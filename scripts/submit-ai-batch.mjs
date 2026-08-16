import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const apiKey = process.env.OPENAI_API_KEY;
const input = process.argv[2] ? path.resolve(process.argv[2]) : path.join(root, "data", "batch", "signal-classification.jsonl");
const stateFile = path.join(root, "data", "batch", "batch-state.json");

if (!apiKey) throw new Error("OPENAI_API_KEY is required to submit a paid Batch job.");
if (!fs.existsSync(input)) throw new Error("Batch input is missing. Run npm run ai:batch:prepare first.");

const form = new FormData();
form.append("purpose", "batch");
form.append("file", new Blob([fs.readFileSync(input)], { type: "application/jsonl" }), path.basename(input));
const upload = await fetch("https://api.openai.com/v1/files", {
  method: "POST",
  headers: { Authorization: `Bearer ${apiKey}` },
  body: form,
});
if (!upload.ok) throw new Error(`Batch file upload failed (${upload.status}): ${await upload.text()}`);
const file = await upload.json();

const create = await fetch("https://api.openai.com/v1/batches", {
  method: "POST",
  headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    input_file_id: file.id,
    endpoint: "/v1/responses",
    completion_window: "24h",
    metadata: { project: "market-signal-atlas", job: "full-corpus-classification" },
  }),
});
if (!create.ok) throw new Error(`Batch creation failed (${create.status}): ${await create.text()}`);
const batch = await create.json();
fs.mkdirSync(path.dirname(stateFile), { recursive: true });
fs.writeFileSync(stateFile, `${JSON.stringify({ batchId: batch.id, inputFileId: file.id, submittedAt: new Date().toISOString() }, null, 2)}\n`);
console.log(`Submitted ${batch.id} with status ${batch.status}. State saved to ${stateFile}`);
