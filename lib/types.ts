export type PersonId =
  "trump" | "musk" | "altman" | "nvidia" | "tesla" | "openai" | "us-senate";
export type SignalType =
  "Policy signal" | "Executive signal" | "Industry signal";
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
  close: number | null;
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
  mode: "reviewed_snapshot" | "deterministic" | "openai";
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
  relatedAssets: string[];
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
  priceWindows: Record<string, PricePoint[]>;
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

export type CandidateClassificationMethod =
  "human_reviewed" | "ai" | "rules" | "pending";
export type CandidateRelevance =
  "signal" | "candidate" | "uncertain" | "not_signal";

export interface SignalCandidate {
  id: string;
  entity: string;
  entityId: "trump" | "musk";
  sourceType: "Social";
  platform: string;
  publishedAt: string;
  text: string;
  sourceUrl: string;
  externalUrls: string[];
  hashtags: string[];
  engagement: {
    likes: number | null;
    reposts: number | null;
    views: number | null;
  };
  topic: string;
  assets: string[];
  classificationMethod: CandidateClassificationMethod;
  relevance: CandidateRelevance;
  confidence: EvidenceConfidence;
  clusterId: string;
  duplicateCount: number;
  reviewed: boolean;
  aiReason: string | null;
  evidence?: CandidateEvidence;
}

export interface NewsArticle {
  title: string;
  url: string;
  domain: string;
  publishedAt: string | null;
}

export interface SocialPostEvidence {
  text: string;
  url: string;
  author: string;
  publishedAt: string;
}

export interface SocialEvidence {
  status: "live" | "snapshot" | "unavailable";
  provider: string;
  query: string;
  counts: Record<string, number>;
  hashtagCounts: Record<string, number>;
  hashtags: Array<{ tag: string; count: number }>;
  posts: SocialPostEvidence[];
  message: string;
}

export interface NewsEvidencePayload {
  eventId: string;
  status: "live" | "snapshot" | "unavailable";
  fetchedAt: string;
  provider: string;
  query: string;
  counts: Record<string, number>;
  articles: NewsArticle[];
  social: SocialEvidence;
  message: string;
}

export interface CandidateEvidence {
  asset: string;
  relatedAssets: string[];
  benchmark: string;
  eventSession: string;
  abnormalReturn1D: number;
  volumeMultiple: number;
  cumulativeAbnormal3D: number;
  volatilityMultiple: number;
  persistence: PersistenceState;
  trackedMentions: number;
  linkedMediaReferences: number;
  attentionCoverage: string;
  priceWindow: PricePoint[];
  priceWindows: Record<string, PricePoint[]>;
  window: WindowPoint[];
  attentionWindow: AttentionPoint[];
  orchestration: OrchestrationReport;
}

export type SignalScope = "all" | "representatives" | "evidence";

export interface EvidenceUniverseMeta {
  generatedAt: string;
  representativeCount: number;
  enrichedCount: number;
  assetCoverage: string[];
  methodology: string[];
}

export interface EvidenceRecord extends CandidateEvidence {
  id: string;
  score: number;
  coverage: "Direct" | "Policy" | "Proxy";
}

export interface EvidenceUniverse {
  meta: EvidenceUniverseMeta;
  representativeIds: string[];
  evidence: EvidenceRecord[];
}

export interface SignalCatalogMeta {
  generatedAt: string;
  rawCorpusTotal: number;
  eligibleCandidates: number;
  reviewedShowcases: number;
  reviewedInCatalog: number;
  aiClassified: number;
  aiPending: number;
  clusterCount: number;
  entityCounts: Record<string, number>;
  methodCounts: Record<string, number>;
  note: string;
}

export interface SignalCatalog {
  meta: SignalCatalogMeta;
  records: SignalCandidate[];
}

export interface SignalCatalogResponse {
  meta: SignalCatalogMeta;
  universe: EvidenceUniverseMeta;
  scope: SignalScope;
  items: SignalCandidate[];
  pagination: { page: number; limit: number; total: number; pages: number };
  facets: { topics: Array<{ value: string; count: number }> };
}
