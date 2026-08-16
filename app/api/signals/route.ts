import type { CandidateClassificationMethod } from "@/lib/types";
import { getSignalCatalog } from "@/lib/signal-catalog";
import { getEvidenceUniverse } from "@/lib/evidence-universe";
import { querySignals } from "@/lib/signal-query";
import type { SignalScope } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const payload = querySignals(getSignalCatalog(), getEvidenceUniverse(), {
    page: Number(params.get("page") || 1),
    limit: Number(params.get("limit") || 20),
    q: params.get("q") || "",
    entity: params.get("entity") || "all",
    method: (params.get("method") || "all") as CandidateClassificationMethod | "all",
    topic: params.get("topic") || "all",
    scope: (params.get("scope") || "all") as SignalScope,
  });
  return Response.json(payload, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" },
  });
}
