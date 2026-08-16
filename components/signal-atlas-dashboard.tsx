"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  Bot,
  ChevronRight,
  CheckCircle2,
  CircleDot,
  Clock3,
  Database,
  ExternalLink,
  FileText,
  Globe2,
  Landmark,
  LineChart as LineChartIcon,
  MessageSquareText,
  Newspaper,
  Radar,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type {
  LivePayload,
  MarketEvent,
  NewsEvidencePayload,
  OrchestrationReport,
  PersonId,
  SignalType,
  SourceType,
} from "@/lib/types";
import { SignalUniverse } from "@/components/signal-universe";

type Locale = "en" | "ko";
type SourceFilter = SourceType | "all";
type ReactionLens = "all" | "market" | "news" | "attention";
type ResearchSection = "explorer" | "comparison" | "sources" | "methodology";

const copy = {
  en: {
    explorer: "Signal Atlas",
    sources: "Data sources",
    method: "Methodology",
    pricing: "Pricing",
    request: "Request access",
    language: "한국어",
    kicker: "CROSS-DOMAIN SIGNAL INTELLIGENCE",
    heroA: "See how a signal spreads",
    heroB: "across markets, media, and attention.",
    hero: "Track one public signal across actual prices, news publication volume, and public-attention evidence—then inspect a transparent, AI-ready evidence audit.",
    explore: "Open the atlas",
    how: "How we measure",
    signal: "Signal",
    original: "Original evidence",
    price: "Price path",
    realClose: "Actual market close",
    context: "Context",
    attention: "News + public attention",
    reviewed: "Evidence-ready signals",
    classes: "Source types",
    largest: "Largest 1D excess",
    sync: "Latest sync",
    signalsKicker: "SIGNAL ATLAS",
    signalsTitle: "Explore one signal through three reaction lenses",
    signalsDesc:
      "Switch between actual market prices, raw news publication counts, and explicitly scoped public-attention evidence.",
    caveat: "Observed reaction, not predicted impact.",
    all: "All signals",
    policy: "Policy",
    executive: "Executive",
    industry: "Industry",
    policySub: "Public policy statements",
    executiveSub: "Company-leader posts",
    industrySub: "Industry narrative",
    search: "Search signals, topics, or assets",
    allAssets: "All assets",
    allEntities: "All entities",
    reaction: "Reaction",
    recent: "Recent",
    records: "signals",
    excess: "1D excess",
    viewOriginal: "View original",
    originalLabel: "Original statement",
    abnormal: "Abnormal return 1D",
    volume: "Volume multiple",
    persistence: "3D persistence",
    versus: "vs previous 20 sessions",
    cumulative: "cumulative excess",
    actualWindow: "ACTUAL PRICE WINDOW",
    actualTitle: "Closing price · five sessions before to five after",
    event: "Signal",
    eventClose: "Signal-session close",
    mapping: "Why this asset mapping?",
    engagement: "ATTENTION EVIDENCE",
    likes: "likes",
    reposts: "reposts",
    views: "views",
    live: "LIVE PUBLIC SIGNAL",
    daily: "Daily refresh",
    pending: "Metrics lock after the aligned market session closes.",
    openOriginal: "Open original statement",
    snapshot: "MARKET SNAPSHOT",
    cached: "Latest cached close",
    association: "Association only. This is not a trade recommendation.",
    compareKicker: "IMPACT COMPARISON",
    compareTitle: "Different signals, different reaction patterns",
    compareDesc:
      "Compare transparent averages across the reviewed library; no opaque score is used.",
    avgAbs: "Avg. absolute 1D excess",
    evidenceCount: "reviewed signals",
    sourceKicker: "DATA SOURCES",
    sourceTitle: "Freshness you can inspect",
    sourceDesc:
      "Every layer exposes its provider, cadence, access model, and status.",
    dataset: "Dataset",
    provider: "Provider",
    cadence: "Cadence",
    access: "Access",
    status: "Status",
    methodKicker: "METHODOLOGY",
    methodTitle: "Evidence matures instead of pretending to predict",
    methodDesc:
      "Every signal moves from classification to amplification, market confirmation, confidence audit, and a readable report.",
    alignTitle: "Preserve source and time",
    alignBody:
      "We separate exact timestamps from date-only publications and align after-hours signals to the next trading session.",
    chartTitle: "Compare three reactions",
    chartBody:
      "Actual closes, raw GDELT article counts, and scoped tracked-source mentions keep their original units.",
    preserveTitle: "Audit the conclusion",
    preserveBody:
      "The auditor lowers certainty for proxies, missing coverage, and weak time alignment. Association is never presented as causal proof.",
    whyKicker: "WHY SIGNAL ATLAS",
    whyTitle: "From a public signal to an inspectable evidence report.",
    whyBody:
      "People and assets are filters. The product is the path across original source, media amplification, public attention, market reaction, and confidence audit.",
    plan: "Plans",
    free: "All evidence-ready signals, daily Trump feed, and real event price windows.",
    pro: "Custom entities, assets, alerts, and licensed near-real-time connectors.",
    team: "Shared watchlists, reports, API access, and managed data sources.",
    footer:
      "Research and monitoring only. No investment advice; temporal association does not establish causality.",
    noResults: "No signals match these filters.",
    snapshotMode: "Snapshot",
  },
  ko: {
    explorer: "시그널 탐색",
    sources: "데이터 출처",
    method: "분석 방법",
    pricing: "요금제",
    request: "접근 신청",
    language: "English",
    kicker: "시장·미디어·관심도 통합 시그널 인텔리전스",
    heroA: "하나의 시그널이",
    heroB: "어디까지 퍼지는지 확인하세요.",
    hero: "공개 시그널 전후의 실제 가격, 뉴스 발행량, 대중 관심 근거를 함께 추적하고 투명한 AI-ready 증거 감사 과정을 확인합니다.",
    explore: "시그널 지도 열기",
    how: "분석 방식 보기",
    signal: "시그널",
    original: "원문 근거",
    price: "가격 흐름",
    realClose: "실제 종가",
    context: "맥락",
    attention: "뉴스 + 대중 관심",
    reviewed: "근거 준비 시그널",
    classes: "출처 유형",
    largest: "최대 1일 초과반응",
    sync: "최근 동기화",
    signalsKicker: "시그널 아틀라스",
    signalsTitle: "하나의 시그널을 세 가지 반응 렌즈로 탐색하세요",
    signalsDesc:
      "실제 시장 가격, 뉴스 원문 발행량, 범위가 명시된 대중 관심 근거를 전환하며 비교합니다.",
    caveat: "예측 점수가 아닌 관찰된 반응입니다.",
    all: "전체 시그널",
    policy: "정책",
    executive: "기업 리더",
    industry: "산업",
    policySub: "정책·공적 발언",
    executiveSub: "기업 리더 SNS",
    industrySub: "산업 내러티브",
    search: "발언, 주제 또는 자산 검색",
    allAssets: "모든 자산",
    allEntities: "모든 인물",
    reaction: "반응순",
    recent: "최신순",
    records: "개 시그널",
    excess: "1일 초과",
    viewOriginal: "원문 보기",
    originalLabel: "영문 원문",
    abnormal: "1일 초과수익률",
    volume: "거래량 배수",
    persistence: "3일 지속성",
    versus: "직전 20거래일 대비",
    cumulative: "누적 초과수익률",
    actualWindow: "실제 가격 구간",
    actualTitle: "종가 · 시그널 전후 각 5거래일",
    event: "발언일",
    eventClose: "발언일 종가",
    mapping: "왜 이 자산과 연결했나요?",
    engagement: "관심도 근거",
    likes: "좋아요",
    reposts: "재게시",
    views: "조회",
    live: "최신 공개 시그널",
    daily: "하루 1회 갱신",
    pending: "정렬된 시장 세션이 마감된 뒤 반응 지표가 확정됩니다.",
    openOriginal: "원문 발언 열기",
    snapshot: "시장 스냅샷",
    cached: "최근 저장 종가",
    association: "연관성 탐색용이며 매매 추천이 아닙니다.",
    compareKicker: "반응 비교",
    compareTitle: "시그널 유형마다 다른 반응 패턴",
    compareDesc: "불투명한 점수 없이 검토된 사례의 평균 원지표를 비교합니다.",
    avgAbs: "평균 절대 1일 초과반응",
    evidenceCount: "개 검토 시그널",
    sourceKicker: "데이터 출처",
    sourceTitle: "신선도를 직접 확인하세요",
    sourceDesc:
      "제공자, 갱신 주기, 접근 방식과 현재 상태를 투명하게 표시합니다.",
    dataset: "데이터셋",
    provider: "제공자",
    cadence: "갱신",
    access: "접근",
    status: "상태",
    methodKicker: "분석 방법",
    methodTitle: "예측하는 척하지 않고 증거를 성숙시킵니다",
    methodDesc:
      "모든 시그널은 분류·정보 확산·시장 확인·신뢰도 감사·리포트 단계를 거칩니다.",
    alignTitle: "출처와 시각 보존",
    alignBody:
      "정확한 타임스탬프와 날짜 단위 발행을 구분하고 장 마감 후 시그널은 다음 거래 세션으로 정렬합니다.",
    chartTitle: "세 가지 반응 비교",
    chartBody:
      "실제 종가, GDELT 원시 기사 수, 범위가 제한된 추적 소스 언급량을 원래 단위로 제공합니다.",
    preserveTitle: "결론 신뢰도 감사",
    preserveBody:
      "프록시 자산, 누락된 범위, 약한 시간 정렬은 신뢰도를 낮춥니다. 시간적 연관성을 인과 증거로 제시하지 않습니다.",
    whyKicker: "왜 SIGNAL ATLAS인가",
    whyTitle: "공개 시그널에서 검증 가능한 증거 리포트까지.",
    whyBody:
      "인물과 자산은 필터일 뿐입니다. 원문·미디어 확산·대중 관심·시장 반응·신뢰도 감사를 하나의 증거 경로로 연결합니다.",
    plan: "요금제",
    free: "근거 준비 시그널 전체, Trump 일일 피드, 실제 이벤트 가격 구간.",
    pro: "사용자 지정 인물·자산, 알림, 정식 라이선스 기반 준실시간 연결.",
    team: "공유 워치리스트, 팀 리포트, API, 데이터 출처 관리.",
    footer:
      "리서치·모니터링 전용입니다. 투자 조언이 아니며 시간적 연관성은 인과관계를 증명하지 않습니다.",
    noResults: "조건에 맞는 시그널이 없습니다.",
    snapshotMode: "스냅샷",
  },
} as const;

const people: Record<PersonId, { initials: string; accent: string }> = {
  trump: { initials: "DT", accent: "amber" },
  musk: { initials: "EM", accent: "blue" },
  altman: { initials: "SA", accent: "violet" },
  nvidia: { initials: "NV", accent: "green" },
  tesla: { initials: "TS", accent: "blue" },
  openai: { initials: "OA", accent: "violet" },
  "us-senate": { initials: "US", accent: "amber" },
};

const sourceOrder: SourceType[] = ["Social", "News", "Filing", "Hearing"];

function PersonMark({
  person,
  size = "md",
}: {
  person: PersonId;
  size?: "sm" | "md";
}) {
  const meta = people[person];
  return (
    <span className={`person-mark ${meta.accent} ${size}`}>
      {meta.initials}
    </span>
  );
}
function formatPercent(value: number) {
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
}
function formatCompact(value: number | null, locale: Locale) {
  if (value === null) return "—";
  return new Intl.NumberFormat(locale === "ko" ? "ko-KR" : "en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function MetricValue({ value }: { value: number }) {
  return (
    <span
      className={value > 0 ? "positive" : value < 0 ? "negative" : "neutral"}
    >
      {formatPercent(value)}
    </span>
  );
}

function SourceState({
  state,
  locale,
}: {
  state: "Fresh" | "Stale" | "Error";
  locale: Locale;
}) {
  const labels =
    locale === "ko"
      ? { Fresh: "최신", Stale: "지연", Error: "오류" }
      : { Fresh: "Fresh", Stale: "Stale", Error: "Error" };
  return (
    <span className={`source-state ${state.toLowerCase()}`}>
      <span /> {labels[state]}
    </span>
  );
}

function signalLabel(type: SignalType, locale: Locale) {
  if (locale === "en") return type;
  return type === "Policy signal"
    ? "정책 시그널"
    : type === "Executive signal"
      ? "기업 리더 시그널"
      : "산업 시그널";
}

function sourceLabel(type: SourceType, locale: Locale) {
  if (locale === "en") return type;
  return type === "Social"
    ? "SNS"
    : type === "News"
      ? "뉴스"
      : type === "Filing"
        ? "공시"
        : "청문회";
}

function sourceIcon(type: SourceType) {
  return type === "Social"
    ? MessageSquareText
    : type === "News"
      ? Newspaper
      : type === "Filing"
        ? FileText
        : Landmark;
}

function confidenceLabel(
  value: OrchestrationReport["confidence"],
  locale: Locale,
) {
  if (locale === "en") return value;
  return value === "High" ? "높음" : value === "Medium" ? "보통" : "낮음";
}

function topicLabel(topic: string, locale: Locale) {
  if (locale === "en") return topic;
  const labels: Record<string, string> = {
    "Trade & tariffs": "무역·관세",
    "Economy & rates": "경제·금리",
    "Technology policy": "기술 정책",
    "Tesla & EV": "Tesla·전기차",
    "AI security": "AI 보안",
    "AI strategy": "AI 전략",
    "AI products": "AI 제품",
    Robotics: "로보틱스",
    "AI capability": "AI 역량",
    "Model update": "모델 업데이트",
    "AI policy & infrastructure": "AI 정책·인프라",
    "Earnings filing": "실적 공시",
    "AI infrastructure": "AI 인프라",
    "AI product launch": "AI 제품 발표",
  };
  return labels[topic] ?? topic;
}

function persistenceLabel(value: string, locale: Locale) {
  if (locale === "en") return value;
  return value === "Persisted"
    ? "지속"
    : value === "Reversed"
      ? "반전"
      : "약화";
}

export function SignalAtlasDashboard({
  events,
  initialLive,
  locale = "en",
}: {
  events: MarketEvent[];
  initialLive: LivePayload;
  locale?: Locale;
}) {
  const c = copy[locale];
  const dateLocale = locale === "ko" ? "ko-KR" : "en-US";
  const [sourceType, setSourceType] = useState<SourceFilter>("all");
  const [lens, setLens] = useState<ReactionLens>("all");
  const [asset, setAsset] = useState<string>(c.allAssets);
  const [entity, setEntity] = useState<string>(c.allEntities);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"reaction" | "recent">("reaction");
  const [selectedId, setSelectedId] = useState(
    events.find((event) =>
      event.attentionWindow.some((point) => point.newsCount !== null),
    )?.id ?? events[0]?.id,
  );
  const [live, setLive] = useState(initialLive);
  const [liveLoading, setLiveLoading] = useState(true);
  const [research, setResearch] = useState<OrchestrationReport | null>(null);
  const [researchLoading, setResearchLoading] = useState(false);
  const [activeNav, setActiveNav] = useState<ResearchSection>("explorer");
  const [interpretStep, setInterpretStep] = useState(0);
  const [news, setNews] = useState<NewsEvidencePayload | null>(null);
  const navClickLock = useRef<ResearchSection | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/live")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((payload: LivePayload) => active && setLive(payload))
      .catch(() => undefined)
      .finally(() => active && setLiveLoading(false));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const sections = (
      ["explorer", "comparison", "sources", "methodology"] as ResearchSection[]
    )
      .map((id) => document.getElementById(id))
      .filter((item): item is HTMLElement => Boolean(item));
    const observer = new IntersectionObserver(
      (entries) => {
        if (navClickLock.current) {
          const clicked = entries.find(
            (entry) =>
              entry.target.id === navClickLock.current && entry.isIntersecting,
          );
          if (clicked) {
            setActiveNav(clicked.target.id as ResearchSection);
            navClickLock.current = null;
          }
          return;
        }
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveNav(visible.target.id as ResearchSection);
      },
      { rootMargin: "-18% 0px -68% 0px", threshold: [0, 0.15, 0.35] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const assets = useMemo(
    () => Array.from(new Set(events.map((event) => event.asset))).sort(),
    [events],
  );
  const entities = useMemo(
    () => Array.from(new Set(events.map((event) => event.personName))).sort(),
    [events],
  );
  const activeSourceTypes = sourceOrder.filter((type) =>
    events.some((event) => event.sourceType === type),
  );
  const filtered = useMemo(
    () =>
      events
        .filter((event) => {
          const typeMatch =
            sourceType === "all" || event.sourceType === sourceType;
          const assetMatch = asset === c.allAssets || event.asset === asset;
          const entityMatch =
            entity === c.allEntities || event.personName === entity;
          const haystack =
            `${event.text} ${event.summaryKo} ${event.topic} ${event.asset} ${event.sourceType} ${event.tags.join(" ")} ${event.hashtags.join(" ")}`.toLowerCase();
          return (
            typeMatch &&
            assetMatch &&
            entityMatch &&
            haystack.includes(query.toLowerCase())
          );
        })
        .sort((a, b) =>
          sort === "recent"
            ? +new Date(b.publishedAt) - +new Date(a.publishedAt)
            : Math.abs(b.metrics.abnormalReturn1D) -
              Math.abs(a.metrics.abnormalReturn1D),
        ),
    [
      asset,
      c.allAssets,
      c.allEntities,
      entity,
      events,
      query,
      sourceType,
      sort,
    ],
  );

  const selected =
    filtered.find((event) => event.id === selectedId) ??
    filtered[0] ??
    events[0];
  const largest = [...events].sort(
    (a, b) =>
      Math.abs(b.metrics.abnormalReturn1D) -
      Math.abs(a.metrics.abnormalReturn1D),
  )[0];
  const eventPrice =
    selected.priceWindow.find((point) => point.session === 0)?.close ?? 0;
  const activeNews = news?.eventId === selected.id ? news : null;
  const effectiveAttention = selected.attentionWindow.map((point) => ({
    ...point,
    newsCount: activeNews?.counts[point.date] ?? point.newsCount,
  }));
  const chartData = selected.priceWindow.map((point, index) => ({
    ...point,
    ...effectiveAttention[index],
    label:
      point.session === 0
        ? c.event
        : `D${point.session > 0 ? "+" : ""}${point.session}`,
  }));
  const formatDate = (value: string) =>
    new Intl.DateTimeFormat(dateLocale, {
      timeZone: "Asia/Seoul",
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(value));
  const formatTime = (value: string) =>
    new Intl.DateTimeFormat(dateLocale, {
      timeZone: "Asia/Seoul",
      hour12: false,
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));

  const rssSource = live.sources.find((source) => source.id === "trump-rss");
  const sourceState = rssSource?.state ?? "Stale";
  const latestSignal = live.signals[0];
  const activeResearch = research ?? selected.orchestration;
  const newsLoading = activeNews === null;
  const hasNewsData = effectiveAttention.some(
    (point) => point.newsCount !== null,
  );
  const newsCases = events.filter((event) =>
    event.attentionWindow.some((point) => point.newsCount !== null),
  );
  const peakNews = Math.max(
    0,
    ...events.flatMap((event) =>
      event.attentionWindow.map((point) => point.newsCount ?? 0),
    ),
  );
  const peakMentions = Math.max(
    0,
    ...events.flatMap((event) =>
      event.attentionWindow.map((point) => point.trackedMentions ?? 0),
    ),
  );

  const selectSignal = (eventId: string) => {
    setSelectedId(eventId);
    const next = events.find((event) => event.id === eventId);
    setResearch(next?.orchestration ?? null);
    setInterpretStep(0);
  };

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/news?eventId=${encodeURIComponent(selected.id)}`, {
      signal: controller.signal,
    })
      .then((response) =>
        response.ok
          ? response.json()
          : Promise.reject(new Error("News evidence failed")),
      )
      .then((payload: NewsEvidencePayload) => setNews(payload))
      .catch((error) => {
        if (error.name !== "AbortError")
          setNews({
            eventId: selected.id,
            status: "unavailable",
            fetchedAt: new Date().toISOString(),
            query: "",
            counts: {},
            articles: [],
            message: "News evidence request failed",
          });
      });
    return () => controller.abort();
  }, [selected.id]);

  const goToSection = (id: ResearchSection) => {
    navClickLock.current = id;
    setActiveNav(id);
  };

  const researchNav: Array<{
    id: ResearchSection;
    label: string;
    icon: typeof Radar;
  }> = [
    { id: "explorer", label: c.explorer, icon: Radar },
    {
      id: "comparison",
      label: locale === "ko" ? "반응 비교" : "Reaction comparison",
      icon: BarChart3,
    },
    { id: "sources", label: c.sources, icon: Database },
    { id: "methodology", label: c.method, icon: ShieldCheck },
  ];

  const interpretation = [
    {
      label: locale === "ko" ? "① 무슨 일이 있었나" : "1. What happened",
      title: locale === "ko" ? "원문 시그널" : "Original signal",
      body:
        locale === "ko"
          ? `${selected.personName}의 ${sourceLabel(selected.sourceType, locale)} 원문이 ${formatTime(selected.publishedAt)}에 게시되었습니다. 출처 링크와 원문을 그대로 보존합니다.`
          : `${selected.personName}'s ${sourceLabel(selected.sourceType, locale).toLowerCase()} was published at ${formatTime(selected.publishedAt)}. The original text and source link are preserved.`,
    },
    {
      label: locale === "ko" ? "② 왜 연결했나" : "2. Why it maps",
      title: c.mapping,
      body:
        locale === "ko"
          ? `${selected.asset}을(를) ${topicLabel(selected.topic, locale)} 시그널의 연결 자산으로 분류했습니다. ${selected.benchmark}는 인과관계가 아니라 시장 맥락을 분리하기 위한 비교 기준입니다.`
          : selected.rationale,
    },
    {
      label: locale === "ko" ? "③ 무엇이 움직였나" : "3. What moved",
      title: locale === "ko" ? "관찰된 반응" : "Observed reaction",
      body:
        locale === "ko"
          ? `${selected.asset}의 1일 초과반응은 ${formatPercent(selected.metrics.abnormalReturn1D)}, 거래량은 직전 20거래일 평균의 ${selected.metrics.volumeMultiple.toFixed(2)}배였습니다. 3거래일 상태는 ${persistenceLabel(selected.metrics.persistence, locale)}입니다.`
          : `${selected.asset} posted ${formatPercent(selected.metrics.abnormalReturn1D)} abnormal return over one day, with ${selected.metrics.volumeMultiple.toFixed(2)}× its prior 20-session average volume. The three-day state is ${selected.metrics.persistence.toLowerCase()}.`,
    },
    {
      label: locale === "ko" ? "④ 얼마나 믿을까" : "4. How certain",
      title: locale === "ko" ? "해석의 한계" : "Interpretation limits",
      body:
        locale === "ko"
          ? `이 화면은 시간적으로 함께 관찰된 시장·뉴스·관심도 증거를 보여줄 뿐 인과관계를 증명하지 않습니다. 값이 없는 경우 추정하지 않으며, ${confidenceLabel(activeResearch.confidence, locale)} 신뢰도의 사후 검토로 읽어야 합니다.`
          : `This view shows market, news, and attention evidence observed around the same time; it does not establish causality. Missing values are not estimated, and the result should be read as a ${activeResearch.confidence.toLowerCase()}-confidence post-event review.`,
    },
  ];

  const runResearch = async () => {
    setResearchLoading(true);
    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: selected.id }),
      });
      if (!response.ok) throw new Error("Research request failed");
      setResearch((await response.json()) as OrchestrationReport);
    } finally {
      setResearchLoading(false);
    }
  };

  return (
    <div className="app-frame" lang={locale === "ko" ? "ko" : "en"}>
      <aside
        className="research-sidebar"
        aria-label={locale === "ko" ? "리서치 섹션" : "Research sections"}
      >
        <a className="sidebar-brand" href="#top">
          <span className="brand-symbol">
            <Radar size={18} />
          </span>
          <span>
            MARKET
            <br />
            SIGNAL ATLAS
          </span>
        </a>
        <span className="sidebar-kicker">RESEARCH</span>
        <nav>
          {researchNav.map(({ id, label, icon: Icon }) => (
            <a
              key={id}
              className={activeNav === id ? "active" : ""}
              href={`#${id}`}
              onClick={() => goToSection(id)}
            >
              <Icon size={16} />
              <span>{label}</span>
            </a>
          ))}
        </nav>
        <div className="sidebar-meta">
          <div>
            <strong>{events.length}</strong>
            <span>
              {locale === "ko" ? "검토 가능 시그널" : "evidence-ready signals"}
            </span>
          </div>
          <div>
            <strong>{activeSourceTypes.length}</strong>
            <span>
              {locale === "ko" ? "원문 출처 유형" : "original source types"}
            </span>
          </div>
          <p>
            {locale === "ko"
              ? "연구·모니터링 도구이며 투자 조언이나 인과관계 증명이 아닙니다."
              : "A research and monitoring tool—not investment advice or proof of causality."}
          </p>
        </div>
      </aside>
      <main className="app-main">
        <header className="site-header">
          <a className="brand" href="#top">
            <span className="brand-symbol">
              <Radar size={18} />
            </span>
            <span>MARKET SIGNAL ATLAS</span>
          </a>
          <nav className="top-section-nav">
            {researchNav.map(({ id, label }) => (
              <a
                key={id}
                className={activeNav === id ? "active" : ""}
                href={`#${id}`}
                onClick={() => goToSection(id)}
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="header-actions">
            <a className="language-link" href={locale === "ko" ? "/" : "/ko"}>
              <Globe2 size={14} />
              {c.language}
            </a>
            <a className="header-cta" href="mailto:hello@marketmover.demo">
              {c.request}
              <ArrowUpRight size={14} />
            </a>
          </div>
        </header>

        <section className="hero atlas-hero" id="top">
          <div className="hero-grid" />
          <div className="hero-copy">
            <div className="eyebrow">
              <CircleDot size={14} />
              {c.kicker}
            </div>
            <h1>
              {c.heroA}
              <br />
              <span>{c.heroB}</span>
            </h1>
            <p>{c.hero}</p>
            <div className="hero-actions">
              <a className="button primary" href="#universe">
                {locale === "ko" ? "전체 데이터 보기" : "Explore all data"}
                <ArrowRight size={16} />
              </a>
              <a className="button ghost" href="#methodology">
                {c.how}
              </a>
            </div>
          </div>
          <div className="hero-proof" aria-hidden="true">
            <div className="proof-orbit orbit-one" />
            <div className="proof-orbit orbit-two" />
            <div className="proof-center">
              <Radar size={30} />
            </div>
            <div className="proof-node node-one">
              <span>{c.signal}</span>
              <strong>{c.original}</strong>
            </div>
            <div className="proof-node node-two">
              <span>{c.price}</span>
              <strong>{c.realClose}</strong>
            </div>
            <div className="proof-node node-three">
              <span>{c.context}</span>
              <strong>{c.attention}</strong>
            </div>
          </div>
        </section>

        <section className="overview section-shell" aria-label="Overview">
          <div className="stat-card">
            <div className="stat-icon">
              <Database size={18} />
            </div>
            <div>
              <span>{c.reviewed}</span>
              <strong>{events.length}</strong>
              <small>
                {locale === "ko"
                  ? "가격·관심도·6단계 감사가 연결된 사례"
                  : "Price, attention, and six-stage audit attached"}
              </small>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <CircleDot size={18} />
            </div>
            <div>
              <span>{c.classes}</span>
              <strong>{activeSourceTypes.length}</strong>
              <small>
                {activeSourceTypes
                  .map((type) => sourceLabel(type, locale))
                  .join(" · ")}
              </small>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <BarChart3 size={18} />
            </div>
            <div>
              <span>{c.largest}</span>
              <strong>
                {formatPercent(Math.abs(largest.metrics.abnormalReturn1D))}
              </strong>
              <small>
                {largest.asset} vs {largest.benchmark}
              </small>
            </div>
          </div>
          <div className="stat-card live-card">
            <div className="stat-icon">
              <RefreshCw size={18} className={liveLoading ? "spin" : ""} />
            </div>
            <div>
              <span>{c.sync}</span>
              <strong>
                {sourceState === "Fresh"
                  ? locale === "ko"
                    ? "Trump RSS 연결됨"
                    : "Trump RSS connected"
                  : locale === "ko"
                    ? "RSS 스냅샷"
                    : "RSS snapshot"}
              </strong>
              <small>
                {rssSource
                  ? `${rssSource.cadence} · ${formatTime(rssSource.lastSuccessAt)}`
                  : formatTime(live.fetchedAt)}
              </small>
            </div>
            <SourceState state={sourceState} locale={locale} />
          </div>
        </section>

        {latestSignal && (
          <section className="latest-signal section-shell">
            <div>
              <span className="pending-pill">
                <Clock3 size={13} />
                Pending
              </span>
              <div>
                <small>
                  {locale === "ko"
                    ? "최신 TRUMP 시그널 · 시장 반응 대기"
                    : "LATEST TRUMP SIGNAL · MARKET REACTION PENDING"}
                </small>
                <p>{latestSignal.text}</p>
                <span>
                  {latestSignal.topic} · {formatTime(latestSignal.publishedAt)}
                </span>
              </div>
            </div>
            <a href={latestSignal.sourceUrl} target="_blank" rel="noreferrer">
              {locale === "ko" ? "원문 보기" : "View source"}
              <ExternalLink size={13} />
            </a>
            <p>
              {locale === "ko"
                ? "시장 세션 정렬과 후속 근거가 완성될 때까지 반응 수치를 확정하지 않습니다."
                : "Reaction metrics remain unconfirmed until the market session aligns and follow-up evidence matures."}
            </p>
          </section>
        )}

        <SignalUniverse locale={locale} />

        <section className="section-shell explorer-section" id="explorer">
          <div className="section-heading">
            <div>
              <span className="section-kicker">{c.signalsKicker}</span>
              <h2>{c.signalsTitle}</h2>
              <p>{c.signalsDesc}</p>
            </div>
            <div className="method-badge">
              <ShieldCheck size={16} />
              {c.caveat}
            </div>
          </div>
          <div className="person-tabs signal-tabs" role="tablist">
            <button
              className={sourceType === "all" ? "active" : ""}
              onClick={() => setSourceType("all")}
            >
              <Radar size={18} />
              <span className="tab-copy">
                <strong>{c.all}</strong>
                <small>
                  {events.length} {c.records}
                </small>
              </span>
            </button>
            {sourceOrder.map((type) => {
              const Icon = sourceIcon(type);
              return (
                <button
                  key={type}
                  className={sourceType === type ? "active" : ""}
                  onClick={() => setSourceType(type)}
                >
                  <Icon size={18} />
                  <span className="tab-copy">
                    <strong>{sourceLabel(type, locale)}</strong>
                    <small>
                      {locale === "ko"
                        ? "원문 출처 기준"
                        : "By original source"}
                    </small>
                  </span>
                  <span>
                    {events.filter((event) => event.sourceType === type).length}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="explorer-toolbar">
            <label className="search-box">
              <Search size={16} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={c.search}
              />
            </label>
            <select
              value={asset}
              onChange={(event) => setAsset(event.target.value)}
              aria-label="Asset"
            >
              <option>{c.allAssets}</option>
              {assets.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <select
              value={entity}
              onChange={(event) => setEntity(event.target.value)}
              aria-label="Entity"
            >
              <option>{c.allEntities}</option>
              {entities.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <div className="segmented">
              <button
                className={sort === "reaction" ? "active" : ""}
                onClick={() => setSort("reaction")}
              >
                {c.reaction}
              </button>
              <button
                className={sort === "recent" ? "active" : ""}
                onClick={() => setSort("recent")}
              >
                {c.recent}
              </button>
            </div>
          </div>

          <div className="explorer-grid atlas-grid">
            <div className="event-list">
              <div className="list-heading">
                <span>
                  {filtered.length} {c.records}
                </span>
                <span>{c.excess}</span>
              </div>
              {filtered.map((event) => (
                <button
                  key={event.id}
                  className={`event-row ${event.id === selected.id ? "selected" : ""}`}
                  onClick={() => selectSignal(event.id)}
                >
                  <PersonMark person={event.person} size="sm" />
                  <span className="event-copy">
                    <span className="row-meta">
                      <strong>{sourceLabel(event.sourceType, locale)}</strong>
                      <i>{topicLabel(event.topic, locale)}</i>
                    </span>
                    <span className="event-text">
                      {locale === "ko" ? event.summaryKo : event.text}
                    </span>
                    <span className="row-foot">
                      {formatDate(event.publishedAt)} · {event.asset}
                    </span>
                  </span>
                  <span className="row-reaction">
                    <MetricValue value={event.metrics.abnormalReturn1D} />
                    <ChevronRight size={15} />
                  </span>
                </button>
              ))}
              {!filtered.length && (
                <div className="empty-state">{c.noResults}</div>
              )}
            </div>

            <article className="evidence-panel">
              <div className="evidence-head">
                <div className="evidence-person">
                  <PersonMark person={selected.person} />
                  <div>
                    <strong>{selected.personName}</strong>
                    <span>
                      {sourceLabel(selected.sourceType, locale)} ·{" "}
                      {selected.platform} ·{" "}
                      {signalLabel(selected.signalType, locale)}
                    </span>
                  </div>
                </div>
                <span
                  className={`coverage-badge ${selected.coverage.toLowerCase()}`}
                >
                  {topicLabel(selected.topic, locale)}
                </span>
              </div>
              <blockquote>
                “{locale === "ko" ? selected.summaryKo : selected.text}”
              </blockquote>
              {locale === "ko" && (
                <div className="original-excerpt">
                  <span>{c.originalLabel}</span>
                  {selected.text}
                </div>
              )}
              <div className="source-line">
                <span>
                  <Clock3 size={14} />
                  {formatTime(selected.publishedAt)} ·{" "}
                  {selected.timePrecision === "date"
                    ? locale === "ko"
                      ? "날짜 단위"
                      : "date precision"
                    : locale === "ko"
                      ? "정확한 시각"
                      : "exact time"}
                </span>
                <a href={selected.sourceUrl} target="_blank" rel="noreferrer">
                  {c.viewOriginal}
                  <ExternalLink size={13} />
                </a>
              </div>
              <div className="metric-strip">
                <div>
                  <span>{c.abnormal}</span>
                  <strong>
                    <MetricValue value={selected.metrics.abnormalReturn1D} />
                  </strong>
                  <small>
                    {selected.asset} − {selected.benchmark}
                  </small>
                </div>
                <div>
                  <span>{c.volume}</span>
                  <strong>{selected.metrics.volumeMultiple.toFixed(2)}×</strong>
                  <small>{c.versus}</small>
                </div>
                <div>
                  <span>{c.persistence}</span>
                  <strong>
                    {persistenceLabel(selected.metrics.persistence, locale)}
                  </strong>
                  <small>
                    <MetricValue
                      value={selected.metrics.cumulativeAbnormal3D}
                    />{" "}
                    {c.cumulative}
                  </small>
                </div>
              </div>
              <div
                className="reaction-lenses"
                role="tablist"
                aria-label={locale === "ko" ? "반응 렌즈" : "Reaction lenses"}
              >
                {(["all", "market", "news", "attention"] as ReactionLens[]).map(
                  (item) => (
                    <button
                      key={item}
                      className={lens === item ? "active" : ""}
                      onClick={() => setLens(item)}
                    >
                      {item === "all"
                        ? locale === "ko"
                          ? "전체 비교"
                          : "Compare all"
                        : item === "market"
                          ? locale === "ko"
                            ? "시장"
                            : "Market"
                          : item === "news"
                            ? locale === "ko"
                              ? "뉴스"
                              : "News"
                            : locale === "ko"
                              ? "대중 관심"
                              : "Public attention"}
                    </button>
                  ),
                )}
              </div>
              <div className="chart-head">
                <div>
                  <span>
                    {lens === "market"
                      ? c.actualWindow
                      : locale === "ko"
                        ? "반응 타임라인"
                        : "REACTION TIMELINE"}
                  </span>
                  <strong>
                    {lens === "market"
                      ? c.actualTitle
                      : lens === "news"
                        ? locale === "ko"
                          ? "GDELT 일별 뉴스 발행량"
                          : "Daily GDELT article count"
                        : lens === "attention"
                          ? locale === "ko"
                            ? "추적 계정 언급·해시태그 빈도"
                            : "Tracked-account mentions and hashtags"
                          : locale === "ko"
                            ? "실제 종가와 정보 확산을 같은 시점에서 비교"
                            : "Actual close and information diffusion on one timeline"}
                  </strong>
                </div>
                <div className="asset-pair">
                  <b>{selected.asset}</b>
                  <span>{c.eventClose}</span>${eventPrice.toFixed(2)}
                </div>
              </div>
              <div className="reaction-chart actual-price-chart">
                <ResponsiveContainer width="100%" height="100%">
                  {lens === "market" ? (
                    <LineChart
                      data={chartData}
                      margin={{ top: 18, right: 14, left: -5, bottom: 0 }}
                    >
                      <CartesianGrid
                        stroke="#e7e9f2"
                        strokeDasharray="3 3"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="label"
                        tick={{ fill: "#717991", fontSize: 9 }}
                        axisLine={false}
                        tickLine={false}
                        interval={1}
                      />
                      <YAxis
                        domain={["auto", "auto"]}
                        tickFormatter={(value) =>
                          `$${Number(value).toFixed(0)}`
                        }
                        tick={{ fill: "#717991", fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        formatter={(value) => [
                          `$${Number(value).toFixed(2)}`,
                          selected.asset,
                        ]}
                      />
                      <ReferenceLine
                        x={c.event}
                        stroke="#6455c6"
                        strokeDasharray="4 4"
                      />
                      <Line
                        isAnimationActive={false}
                        type="monotone"
                        dataKey="close"
                        name={selected.asset}
                        stroke="#237657"
                        strokeWidth={2.7}
                        dot={{ r: 2.7, fill: "#237657" }}
                      />
                      <ReferenceDot
                        x={c.event}
                        y={eventPrice}
                        r={5}
                        fill="#6455c6"
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    </LineChart>
                  ) : (
                    <ComposedChart
                      data={chartData}
                      margin={{ top: 18, right: 10, left: -5, bottom: 0 }}
                    >
                      <CartesianGrid
                        stroke="#e7e9f2"
                        strokeDasharray="3 3"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="label"
                        tick={{ fill: "#717991", fontSize: 9 }}
                        axisLine={false}
                        tickLine={false}
                        interval={1}
                      />
                      <YAxis
                        yAxisId="left"
                        hide={lens !== "all"}
                        domain={["auto", "auto"]}
                        tickFormatter={(value) =>
                          `$${Number(value).toFixed(0)}`
                        }
                        tick={{ fill: "#66786e", fontSize: 9 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        tick={{ fill: "#717991", fontSize: 9 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip />
                      <ReferenceLine
                        x={c.event}
                        stroke="#6455c6"
                        strokeDasharray="4 4"
                      />
                      {lens === "all" && (
                        <Line
                          isAnimationActive={false}
                          yAxisId="left"
                          type="monotone"
                          dataKey="close"
                          name={`${selected.asset} ${locale === "ko" ? "종가" : "close"}`}
                          stroke="#237657"
                          strokeWidth={2.5}
                          dot={false}
                        />
                      )}
                      {(lens === "all" || lens === "news") && (
                        <Bar
                          isAnimationActive={false}
                          yAxisId="right"
                          dataKey="newsCount"
                          name={
                            locale === "ko" ? "뉴스 발행량" : "News articles"
                          }
                          fill="#8eb7a2"
                          radius={[3, 3, 0, 0]}
                        />
                      )}
                      {(lens === "all" || lens === "attention") && (
                        <Line
                          isAnimationActive={false}
                          yAxisId="right"
                          type="monotone"
                          dataKey="trackedMentions"
                          name={
                            locale === "ko"
                              ? "추적 계정 언급"
                              : "Tracked mentions"
                          }
                          stroke="#7564c2"
                          strokeWidth={2}
                          dot={{ r: 2 }}
                        />
                      )}
                      {lens === "attention" && (
                        <Bar
                          isAnimationActive={false}
                          yAxisId="right"
                          dataKey="hashtagCount"
                          name={locale === "ko" ? "해시태그" : "Hashtags"}
                          fill="#d2a95f"
                          radius={[3, 3, 0, 0]}
                        />
                      )}
                    </ComposedChart>
                  )}
                </ResponsiveContainer>
              </div>
              {lens === "news" && !hasNewsData && (
                <div className="data-unavailable">
                  <Newspaper size={15} />
                  <span>
                    {locale === "ko"
                      ? "이 사례의 과거 뉴스 발행량 스냅샷은 없습니다. 값을 추정하지 않고 비워 둡니다."
                      : "No historical news-volume snapshot is available for this case. The values are left empty rather than estimated."}
                  </span>
                </div>
              )}
              <div
                className={`news-source-status ${activeNews?.status ?? "loading"}`}
              >
                <Newspaper size={16} />
                <div>
                  <strong>
                    {newsLoading
                      ? locale === "ko"
                        ? "GDELT 뉴스 근거 확인 중"
                        : "Checking GDELT news evidence"
                      : activeNews?.status === "live"
                        ? locale === "ko"
                          ? "GDELT 실시간 응답"
                          : "Live GDELT response"
                        : activeNews?.status === "snapshot"
                          ? locale === "ko"
                            ? "검토된 뉴스 스냅샷"
                            : "Reviewed news snapshot"
                          : locale === "ko"
                            ? "뉴스 근거 없음"
                            : "News evidence unavailable"}
                  </strong>
                  <span>
                    {newsLoading
                      ? locale === "ko"
                        ? "실패하면 검토 스냅샷 또는 값 없음으로 표시합니다."
                        : "Failures resolve to a reviewed snapshot or no value."
                      : activeNews?.status === "live"
                        ? locale === "ko"
                          ? `쿼리 ${activeNews.query} · 기사 제목 ${activeNews.articles.length}개`
                          : `Query ${activeNews.query} · ${activeNews.articles.length} article headlines`
                        : activeNews?.status === "snapshot"
                          ? locale === "ko"
                            ? "저장된 실제 발행량만 표시하며 새 값을 만들지 않습니다."
                            : "Only stored publication counts are shown; no new values are invented."
                          : locale === "ko"
                            ? "수집된 값이 없어 추정하지 않습니다."
                            : "No collected value is available, so nothing is estimated."}
                  </span>
                </div>
              </div>
              {!!activeNews?.articles.length && (
                <div className="news-headlines">
                  {activeNews.articles.slice(0, 2).map((article) => (
                    <a
                      key={article.url}
                      href={article.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <span>
                        {article.domain}
                        {article.publishedAt ? ` · ${article.publishedAt}` : ""}
                      </span>
                      <strong>{article.title}</strong>
                      <ExternalLink size={13} />
                    </a>
                  ))}
                </div>
              )}
              <div className="interpretation-panel">
                <div
                  className="interpretation-tabs"
                  role="tablist"
                  aria-label={
                    locale === "ko" ? "4단계 해석" : "Four-step interpretation"
                  }
                >
                  {interpretation.map((item, index) => (
                    <button
                      key={item.label}
                      className={interpretStep === index ? "active" : ""}
                      onClick={() => setInterpretStep(index)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <div className="interpretation-content">
                  <span>
                    {locale === "ko"
                      ? `해석 ${interpretStep + 1}/4`
                      : `INTERPRETATION ${interpretStep + 1}/4`}
                  </span>
                  <strong>{interpretation[interpretStep].title}</strong>
                  <p>{interpretation[interpretStep].body}</p>
                  {interpretStep === 0 && (
                    <a
                      href={selected.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {c.viewOriginal}
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
              <div className="attention-layer">
                <div className="attention-title">
                  <span>
                    {locale === "ko"
                      ? "관심도 근거와 범위"
                      : "ATTENTION EVIDENCE & SCOPE"}
                  </span>
                  <small>
                    {selected.hashtags.length
                      ? selected.hashtags.join(" · ")
                      : locale === "ko"
                        ? "해시태그 없음"
                        : "No observed hashtags"}
                  </small>
                </div>
                <div className="attention-bars">
                  {[
                    [c.likes, selected.engagement.likes],
                    [c.reposts, selected.engagement.reposts],
                    [c.views, selected.engagement.views],
                  ]
                    .filter((item) => item[1] !== null)
                    .map(([label, value]) => (
                      <div key={String(label)}>
                        <span>{label}</span>
                        <div>
                          <i
                            style={{
                              width: `${Math.min(100, Math.max(8, Math.log10(Number(value) + 1) * 18))}%`,
                            }}
                          />
                        </div>
                        <strong>{formatCompact(Number(value), locale)}</strong>
                      </div>
                    ))}
                </div>
                <p className="coverage-note">{selected.attentionCoverage}</p>
              </div>
            </article>

            <aside className="live-panel research-desk">
              <div className="live-head">
                <div>
                  <Bot size={15} />
                  <strong>
                    {locale === "ko"
                      ? "증거 리서치 데스크"
                      : "EVIDENCE RESEARCH DESK"}
                  </strong>
                </div>
                <span>
                  {activeResearch.mode === "deterministic"
                    ? locale === "ko"
                      ? "결정론적 감사"
                      : "Deterministic audit"
                    : locale === "ko"
                      ? "검토 스냅샷"
                      : "Reviewed snapshot"}
                </span>
              </div>
              <div className="research-verdict">
                <span>
                  {locale === "ko" ? "증거 판정" : "EVIDENCE VERDICT"}
                </span>
                <strong>
                  {locale === "ko"
                    ? activeResearch.verdict === "Reaction detected"
                      ? "반응 관찰"
                      : activeResearch.verdict === "Mixed evidence"
                        ? "혼합된 증거"
                        : "증거 부족"
                    : activeResearch.verdict}
                </strong>
                <small>
                  {locale === "ko"
                    ? `신뢰도 ${confidenceLabel(activeResearch.confidence, locale)}`
                    : `${activeResearch.confidence} confidence`}
                </small>
                <p>
                  {locale === "ko"
                    ? activeResearch.summaryKo
                    : activeResearch.summaryEn}
                </p>
              </div>
              <button
                className="run-research"
                onClick={runResearch}
                disabled={researchLoading}
              >
                <Sparkles size={15} className={researchLoading ? "spin" : ""} />
                {researchLoading
                  ? locale === "ko"
                    ? "근거 감사 중…"
                    : "Auditing evidence…"
                  : locale === "ko"
                    ? "증거 감사 실행"
                    : "Run evidence audit"}
              </button>
              <div className="agent-pipeline">
                {activeResearch.stages.map((stage, index) => (
                  <div
                    className={`agent-stage ${stage.state.toLowerCase()}`}
                    key={stage.id}
                  >
                    <span className="stage-index">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <strong>
                        {stage.id === "classify"
                          ? locale === "ko"
                            ? "시그널 분류"
                            : "Signal Classifier"
                          : stage.id === "map"
                            ? locale === "ko"
                              ? "온톨로지 매핑"
                              : "Ontology Mapper"
                            : stage.id === "amplify"
                              ? locale === "ko"
                                ? "정보 확산 분석"
                                : "Amplification"
                              : stage.id === "market"
                                ? locale === "ko"
                                  ? "시장 반응 계산"
                                  : "Market Reaction"
                                : stage.id === "audit"
                                  ? locale === "ko"
                                    ? "신뢰도 감사"
                                    : "Confidence Auditor"
                                  : locale === "ko"
                                    ? "리포트 작성"
                                    : "Report Writer"}
                      </strong>
                      <p>
                        {locale === "ko" ? stage.summaryKo : stage.summaryEn}
                      </p>
                      <small>
                        {stage.state} ·{" "}
                        {confidenceLabel(stage.confidence, locale)}
                      </small>
                    </div>
                    {stage.state === "Complete" ? (
                      <CheckCircle2 size={14} />
                    ) : (
                      <Clock3 size={14} />
                    )}
                  </div>
                ))}
              </div>
              <div className="market-snapshot">
                <div className="aside-title">
                  <span>
                    {locale === "ko" ? "증거 성숙 단계" : "EVIDENCE MATURITY"}
                  </span>
                  <small>
                    {locale === "ko" ? "사후 검증형" : "Post-event"}
                  </small>
                </div>
                <div className="maturity-track">
                  <span className="done">Initial</span>
                  <span className="done">Amplification</span>
                  <span className="done">Market</span>
                  <span className="done">Report</span>
                </div>
              </div>
              <div className="live-note">
                <ShieldCheck size={15} />
                {c.association}
              </div>
            </aside>
          </div>
        </section>

        <section className="comparison-section" id="comparison">
          <div className="section-shell">
            <div className="section-heading">
              <div>
                <span className="section-kicker">
                  {locale === "ko"
                    ? "세 가지 반응 레이어"
                    : "THREE REACTION LAYERS"}
                </span>
                <h2>
                  {locale === "ko"
                    ? "금융 반응만으로 끝내지 않습니다"
                    : "The signal does not stop at the price chart"}
                </h2>
                <p>
                  {locale === "ko"
                    ? "시장·미디어·대중 관심을 서로 다른 근거와 단위로 보여주며, 없는 값은 추정하지 않습니다."
                    : "Market, media, and public attention keep their own evidence and units; missing values are never estimated."}
                </p>
              </div>
            </div>
            <div className="comparison-grid">
              <div className="comparison-card">
                <div className="comparison-icon">
                  <LineChartIcon size={20} />
                </div>
                <span>{locale === "ko" ? "시장 반응" : "Market reaction"}</span>
                <h3>
                  {formatPercent(
                    events.reduce(
                      (sum, event) =>
                        sum + Math.abs(event.metrics.abnormalReturn1D),
                      0,
                    ) / events.length,
                  )}
                </h3>
                <p>
                  {locale === "ko"
                    ? "평균 절대 1일 초과반응"
                    : "Average absolute 1D excess"}
                </p>
                <div>
                  <small>
                    {events.length} {locale === "ko" ? "개 시그널" : "signals"}
                  </small>
                  <strong>
                    {locale === "ko"
                      ? "실제 종가 · 거래량 · 벤치마크 맥락"
                      : "Actual closes · volume · benchmark context"}
                  </strong>
                </div>
              </div>
              <div className="comparison-card">
                <div className="comparison-icon">
                  <Newspaper size={20} />
                </div>
                <span>
                  {locale === "ko" ? "미디어 반응" : "Media reaction"}
                </span>
                <h3>{formatCompact(peakNews, locale)}</h3>
                <p>
                  {locale === "ko"
                    ? "관찰 구간 최대 일별 뉴스 수"
                    : "Peak daily article count in observed windows"}
                </p>
                <div>
                  <small>
                    {newsCases.length}{" "}
                    {locale === "ko" ? "개 GDELT 스냅샷" : "GDELT-backed cases"}
                  </small>
                  <strong>
                    {locale === "ko"
                      ? "원시 기사 수 · 쿼리 공개"
                      : "Raw article count · query disclosed"}
                  </strong>
                </div>
              </div>
              <div className="comparison-card">
                <div className="comparison-icon">
                  <MessageSquareText size={20} />
                </div>
                <span>
                  {locale === "ko" ? "대중 관심" : "Public attention"}
                </span>
                <h3>{formatCompact(peakMentions, locale)}</h3>
                <p>
                  {locale === "ko"
                    ? "관찰 구간 추적 계정 최대 언급 수"
                    : "Peak tracked-account mentions"}
                </p>
                <div>
                  <small>
                    {locale === "ko"
                      ? "전체 SNS 수치가 아님"
                      : "Not a platform-wide count"}
                  </small>
                  <strong>
                    {locale === "ko"
                      ? "해시태그 · 참여도 · 범위 표시"
                      : "Hashtags · engagement · scoped coverage"}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="sources-section" id="sources">
          <div className="section-shell">
            <div className="section-heading light-heading">
              <div>
                <span className="section-kicker">{c.sourceKicker}</span>
                <h2>{c.sourceTitle}</h2>
                <p>{c.sourceDesc}</p>
              </div>
              <span className="as-of">{formatTime(live.fetchedAt)}</span>
            </div>
            <div className="source-table">
              <div className="source-table-head">
                <span>{c.dataset}</span>
                <span>{c.provider}</span>
                <span>{c.cadence}</span>
                <span>{c.access}</span>
                <span>{c.status}</span>
              </div>
              {live.sources.map((source) => (
                <div className="source-row" key={source.id}>
                  <div>
                    <strong>{source.label}</strong>
                    <small>{source.note}</small>
                  </div>
                  <span>{source.provider}</span>
                  <span>{source.cadence}</span>
                  <span>
                    <i
                      className={
                        source.access === "Free" ? "free-badge" : "paid-badge"
                      }
                    >
                      {source.access}
                    </i>
                  </span>
                  <div>
                    <SourceState state={source.state} locale={locale} />
                    <small>{formatDate(source.lastSuccessAt)}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="method-section section-shell" id="methodology">
          <div className="section-heading centered">
            <div>
              <span className="section-kicker">{c.methodKicker}</span>
              <h2>{c.methodTitle}</h2>
              <p>{c.methodDesc}</p>
            </div>
          </div>
          <div className="method-grid">
            <div className="method-card">
              <span>01</span>
              <Clock3 size={22} />
              <h3>{c.alignTitle}</h3>
              <p>{c.alignBody}</p>
            </div>
            <div className="method-card">
              <span>02</span>
              <LineChartIcon size={22} />
              <h3>{c.chartTitle}</h3>
              <p>{c.chartBody}</p>
            </div>
            <div className="method-card">
              <span>03</span>
              <ShieldCheck size={22} />
              <h3>{c.preserveTitle}</h3>
              <p>{c.preserveBody}</p>
            </div>
          </div>
        </section>

        <section className="difference-section">
          <div className="section-shell difference-grid">
            <div>
              <span className="section-kicker">{c.whyKicker}</span>
              <h2>{c.whyTitle}</h2>
              <p>{c.whyBody}</p>
            </div>
            <div className="evidence-path">
              <div>
                <span>01</span>
                <strong>{c.signal}</strong>
                <small>
                  {locale === "ko" ? "무슨 정보인가?" : "What happened?"}
                </small>
              </div>
              <ChevronRight />
              <div>
                <span>02</span>
                <strong>{locale === "ko" ? "확산" : "Amplify"}</strong>
                <small>
                  {locale === "ko" ? "뉴스와 관심은?" : "Did it spread?"}
                </small>
              </div>
              <ChevronRight />
              <div>
                <span>03</span>
                <strong>{locale === "ko" ? "시장" : "Market"}</strong>
                <small>
                  {locale === "ko" ? "무엇이 움직였나?" : "What moved?"}
                </small>
              </div>
              <ChevronRight />
              <div>
                <span>04</span>
                <strong>{locale === "ko" ? "감사" : "Audit"}</strong>
                <small>
                  {locale === "ko" ? "얼마나 믿나?" : "How certain?"}
                </small>
              </div>
            </div>
          </div>
        </section>

        <section className="pricing-section section-shell" id="pricing">
          <div className="section-heading centered">
            <div>
              <span className="section-kicker">{c.plan}</span>
              <h2>
                {locale === "ko"
                  ? "탐색은 무료로, 모니터링은 필요에 맞게."
                  : "Explore freely. Scale the monitoring."}
              </h2>
            </div>
          </div>
          <div className="pricing-grid compact-pricing">
            <div className="price-card">
              <span className="plan">FREE</span>
              <div className="price">
                <strong>$0</strong>
              </div>
              <p>{c.free}</p>
              <a href="#explorer">{c.explore}</a>
            </div>
            <div className="price-card featured">
              <span className="plan">PRO</span>
              <div className="price">
                <strong>$19</strong>
                <span>/ month</span>
              </div>
              <p>{c.pro}</p>
              <a href="mailto:hello@marketmover.demo">
                {c.request}
                <ArrowUpRight size={14} />
              </a>
            </div>
            <div className="price-card">
              <span className="plan">TEAM</span>
              <div className="price">
                <strong>$99</strong>
                <span>/ month</span>
              </div>
              <p>{c.team}</p>
              <a href="mailto:hello@marketmover.demo">{c.request}</a>
            </div>
          </div>
        </section>

        <footer>
          <div className="footer-brand">
            <span className="brand-symbol">
              <Radar size={17} />
            </span>
            <div>
              <strong>MARKET SIGNAL ATLAS</strong>
              <span>
                {locale === "ko"
                  ? "시장·미디어·대중 관심의 증거 지도"
                  : "An evidence map across markets, media, and public attention"}
              </span>
            </div>
          </div>
          <p>{c.footer}</p>
          <div>
            <a href="#methodology">{c.method}</a>
            <a href="#sources">{c.sources}</a>
            <a href="mailto:hello@marketmover.demo">
              <Bell size={14} />
              {c.request}
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
