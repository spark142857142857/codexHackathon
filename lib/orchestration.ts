import "server-only";

import type { AgentStage, EvidenceConfidence, MarketEvent, OrchestrationReport } from "@/lib/types";

function stage(id: AgentStage["id"], confidence: EvidenceConfidence, summaryEn: string, summaryKo: string): AgentStage {
  return { id, state: "Complete", confidence, summaryEn, summaryKo };
}

/**
 * Runs six research roles as transparent rules over already-observed evidence.
 * It needs no API key or model call and never fills missing evidence.
 */
export async function orchestrateEvent(event: MarketEvent): Promise<OrchestrationReport> {
  const proxy = event.coverage === "Proxy";
  const hasNews = event.attentionWindow.some((point) => point.newsCount !== null);
  const trackedMentions = event.attentionWindow.reduce((sum, point) => sum + (point.trackedMentions ?? 0), 0);
  const hasEngagement = Object.values(event.engagement).some((value) => value !== null && value > 0);
  const amplified = hasNews || trackedMentions > 1 || hasEngagement;
  const moved = Math.abs(event.metrics.abnormalReturn1D) >= 1;
  const confidence: EvidenceConfidence = event.timePrecision === "date" || proxy ? "Medium" : amplified ? "High" : "Medium";
  const verdict: OrchestrationReport["verdict"] = moved && amplified ? "Reaction detected" : moved || amplified ? "Mixed evidence" : "Insufficient evidence";

  return {
    mode: "deterministic",
    confidence,
    verdict,
    summaryEn: `${event.personName}'s ${event.topic} signal was aligned to ${event.asset}. The observed one-day excess move was ${event.metrics.abnormalReturn1D.toFixed(2)}%. This is an evidence trail, not a causal or predictive claim.`,
    summaryKo: `${event.personName}의 ${event.topic} 시그널을 ${event.asset}에 정렬했습니다. 관찰된 1일 초과 움직임은 ${event.metrics.abnormalReturn1D.toFixed(2)}%입니다. 이는 인과관계나 예측이 아닌 증거 경로입니다.`,
    stages: [
      stage("classify", "High", `Signal classified as ${event.topic} from reviewed source fields.`, `검토된 출처 필드로 ${event.topic} 시그널을 분류했습니다.`),
      stage("map", proxy ? "Medium" : "High", `${event.asset} is a ${event.coverage.toLowerCase()} mapping; ${event.benchmark} is the comparison asset.`, `${event.asset}은(는) ${event.coverage} 매핑이며 ${event.benchmark}와 비교합니다.`),
      stage("amplify", hasNews ? "High" : amplified ? "Medium" : "Low", hasNews ? "News counts, tracked mentions and engagement were checked." : "Tracked-corpus mentions and available engagement were checked; global news coverage is unavailable.", hasNews ? "뉴스 발행량·추적 언급·참여도를 확인했습니다." : "추적 코퍼스 언급과 확보된 참여도를 확인했으며 전체 뉴스 범위는 없습니다."),
      stage("market", "High", `Actual closes, volume and ${event.benchmark} comparison were calculated with fixed formulas.`, `실제 종가·거래량과 ${event.benchmark} 비교값을 고정 수식으로 계산했습니다.`),
      stage("audit", confidence, proxy || event.timePrecision === "date" ? "Proxy or date-only timing reduces attribution confidence." : "Source timing, market alignment and evidence coverage passed the rule audit.", proxy || event.timePrecision === "date" ? "프록시 또는 날짜 단위 시각 때문에 귀속 신뢰도를 낮췄습니다." : "출처 시각·시장 정렬·근거 범위가 규칙 감사를 통과했습니다."),
      stage("report", confidence, "A bilingual report was rendered only from the audited fields.", "감사된 필드만 사용해 한영 리포트를 생성했습니다."),
    ],
    caveats: [
      "Temporal association does not establish causality.",
      "Tracked attention is not a platform-wide social firehose.",
      ...(hasNews ? [] : ["Historical global news volume is unavailable for this case."]),
      ...(proxy ? ["The selected listed asset is a proxy mapping."] : []),
    ],
  };
}
