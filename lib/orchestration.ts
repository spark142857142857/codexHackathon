import "server-only";

import type { MarketEvent, OrchestrationReport } from "@/lib/types";

type ResponsePayload = {
  output_text?: string;
  output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
};

function outputText(payload: ResponsePayload) {
  if (payload.output_text) return payload.output_text;
  return payload.output
    ?.flatMap((item) => item.content ?? [])
    .find((item) => item.type === "output_text")?.text ?? "";
}

async function runAgent(label: string, task: string, event: MarketEvent) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");
  const evidence = {
    source: { type: event.sourceType, entity: event.personName, platform: event.platform, publishedAt: event.publishedAt, text: event.text },
    mapping: { topic: event.topic, asset: event.asset, benchmark: event.benchmark, coverage: event.coverage, rationale: event.rationale },
    market: event.metrics,
    attention: event.attentionWindow,
    attentionCoverage: event.attentionCoverage,
  };
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-5.4-nano",
      store: false,
      reasoning: { effort: "low" },
      input: `You are the ${label} in an evidence-first public-signal research desk. ${task}\n\nUse only the supplied evidence. Never claim causality, predict prices, or invent missing coverage. Return concise plain text with the key finding and one limitation.\n\nEVIDENCE:\n${JSON.stringify(evidence)}`,
    }),
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(`OpenAI ${label} failed: ${response.status}`);
  const text = outputText(await response.json() as ResponsePayload).trim();
  if (!text) throw new Error(`OpenAI ${label} returned no text`);
  return text;
}

function parseJsonObject(text: string) {
  const candidate = text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  return JSON.parse(candidate) as Partial<OrchestrationReport>;
}

export async function orchestrateEvent(event: MarketEvent): Promise<OrchestrationReport> {
  if (!process.env.OPENAI_API_KEY || process.env.ENABLE_LIVE_AI !== "true") return event.orchestration;

  try {
    const [classification, mapping, amplification] = await Promise.all([
      runAgent("Signal Classifier Agent", "Classify the signal topic, tone, and evidence maturity.", event),
      runAgent("Ontology Mapper Agent", "Audit the entity-to-issue-to-asset mapping and distinguish direct assets from proxies.", event),
      runAgent("Amplification Agent", "Assess news, tracked mentions, hashtags, and engagement while respecting the stated coverage limits.", event),
    ]);
    const audit = await runAgent(
      "Confidence Auditor Agent",
      `Challenge the proposed interpretation. Consider source timing, proxy risk, broad-market movement, missing social firehose data, and alternative explanations. Other agents reported: CLASSIFIER=${classification} MAPPER=${mapping} AMPLIFICATION=${amplification}`,
      event,
    );
    const writer = await runAgent(
      "Bilingual Report Writer Agent",
      `Synthesize the agent findings into JSON only, with keys summaryEn, summaryKo, confidence (Low|Medium|High), verdict (Reaction detected|Mixed evidence|Insufficient evidence), and caveats (English string array). Do not add markdown. Agent findings: CLASSIFIER=${classification} MAPPER=${mapping} AMPLIFICATION=${amplification} AUDITOR=${audit}`,
      event,
    );
    const parsed = parseJsonObject(writer);
    return {
      ...event.orchestration,
      mode: "openai",
      confidence: parsed.confidence ?? event.orchestration.confidence,
      verdict: parsed.verdict ?? event.orchestration.verdict,
      summaryEn: parsed.summaryEn ?? event.orchestration.summaryEn,
      summaryKo: parsed.summaryKo ?? event.orchestration.summaryKo,
      caveats: Array.isArray(parsed.caveats) ? parsed.caveats : event.orchestration.caveats,
      stages: event.orchestration.stages.map((stage) => {
        const summaries: Partial<Record<typeof stage.id, string>> = { classify: classification, map: mapping, amplify: amplification, audit };
        return summaries[stage.id] ? { ...stage, summaryEn: summaries[stage.id] as string } : stage;
      }),
    };
  } catch {
    return event.orchestration;
  }
}
