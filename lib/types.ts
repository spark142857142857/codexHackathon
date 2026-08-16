export type PersonId = "trump" | "musk" | "altman" | "nvidia" | "tesla" | "openai" | "us-senate";
export type SignalType = "Policy signal" | "Executive signal" | "Industry signal";
export type SourceType = "Social" | "News" | "Filing" | "Hearing";
export type EvidenceConfidence = "Low" | "Medium" | "High";
export type AgentStageState = "Complete" | "Monitoring" | "Pending";
export type PersistenceState = "Persisted" | "Faded" | "Reversed";
export type SourceState = "Fresh" | "Stale" | "Error";

export interface WindowPoint {
  day: number;
  asset: number;
  benchmark: number;
}

export interface PricePoint {
  session: number;
  date: string;
  close: number;
}

export interface AttentionPoint {
  session: number;
  date: string;
  newsCount: number | null;
  trackedMentions: number | null;
  hashtagCount: number | null;
}

export interface AgentStage {
  id: "classify" | "map" | "amplify" | "market" | "audit" | "report";
  state: AgentStageState;
  confidence: EvidenceConfidence;
  summaryEn: string;
  summaryKo: string;
}

export interface OrchestrationReport {
  mode: "reviewed_snapshot" | "openai";
  confidence: EvidenceConfidence;
  verdict: "Reaction detected" | "Mixed evidence" | "Insufficient evidence";
  summaryEn: string;
  summaryKo: string;
  stages: AgentStage[];
  caveats: string[];
}

export interface ReactionMetrics {
  abnormalReturn1D: number;
  volumeMultiple: number;
  cumulativeAbnormal3D: number;
  persistence: PersistenceState;
}

export interface MarketEvent {
  id: string;
  person: PersonId;
  personName: string;
  role: string;
  platform: string;
  sourceType: SourceType;
  timePrecision: "exact" | "date";
  publishedAt: string;
  text: string;
  sourceUrl: string;
  topic: string;
  signalType: SignalType;
  tags: string[];
  hashtags: string[];
  summaryKo: string;
  asset: string;
  benchmark: string;
  coverage: "Direct" | "Policy" | "Proxy";
  engagement: {
    likes: number | null;
    reposts: number | null;
    views: number | null;
  };
  metrics: ReactionMetrics;
  window: WindowPoint[];
  priceWindow: PricePoint[];
  attentionWindow: AttentionPoint[];
  attentionCoverage: string;
  eventSession: string;
  rationale: string;
  orchestration: OrchestrationReport;
}

export interface SourceStatus {
  id: string;
  label: string;
  provider: string;
  cadence: string;
  access: "Free" | "Paid connector";
  state: SourceState;
  lastSuccessAt: string;
  note: string;
}

export interface LiveSignal {
  id: string;
  text: string;
  publishedAt: string;
  sourceUrl: string;
  topic: string;
  state: "Pending market session" | "Observed";
}

export interface LivePayload {
  fetchedAt: string;
  mode: "live" | "fallback";
  signals: LiveSignal[];
  prices: Record<string, { price: number; asOf: string }>;
  sources: SourceStatus[];
}
