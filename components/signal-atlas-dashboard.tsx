"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  ChevronRight,
  CircleDot,
  Clock3,
  Cpu,
  Database,
  ExternalLink,
  Globe2,
  Landmark,
  LineChart as LineChartIcon,
  Radar,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { LivePayload, MarketEvent, PersonId, SignalType } from "@/lib/types";

type Locale = "en" | "ko";
type SignalFilter = SignalType | "all";

const copy = {
  en: {
    explorer: "Signal Atlas",
    sources: "Data sources",
    method: "Methodology",
    pricing: "Pricing",
    request: "Request access",
    language: "한국어",
    kicker: "PUBLIC-SIGNAL MARKET INTELLIGENCE",
    heroA: "See the signal.",
    heroB: "Then read the market.",
    hero: "Explore how public statements connect with real asset prices, trading activity, and attention—without claiming causality or predicting the next move.",
    explore: "Open the atlas",
    how: "How we measure",
    signal: "Signal",
    original: "Original evidence",
    price: "Price path",
    realClose: "Actual market close",
    context: "Context",
    attention: "Volume + attention",
    reviewed: "Reviewed signals",
    classes: "Signal classes",
    largest: "Largest 1D excess",
    sync: "Latest sync",
    signalsKicker: "SIGNAL ATLAS",
    signalsTitle: "Explore the market around a public signal",
    signalsDesc: "Choose a signal to inspect the actual closing price before and after its aligned trading session.",
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
    compareDesc: "Compare transparent averages across the reviewed library; no opaque score is used.",
    avgAbs: "Avg. absolute 1D excess",
    evidenceCount: "reviewed signals",
    sourceKicker: "DATA SOURCES",
    sourceTitle: "Freshness you can inspect",
    sourceDesc: "Every layer exposes its provider, cadence, access model, and status.",
    dataset: "Dataset",
    provider: "Provider",
    cadence: "Cadence",
    access: "Access",
    status: "Status",
    methodKicker: "METHODOLOGY",
    methodTitle: "Actual prices, transparent context",
    methodDesc: "The chart is now the asset’s real close—not a benchmark-normalized line.",
    alignTitle: "Align the session",
    alignBody: "After-hours, weekend, and holiday signals move to the next available trading session.",
    chartTitle: "Show the real price path",
    chartBody: "We plot D-5 through D+5 actual closes and mark the signal session directly on the chart.",
    preserveTitle: "Keep comparison metrics",
    preserveBody: "Excess return and volume remain as context, never as proof of causality or a forecast.",
    whyKicker: "WHY SIGNAL ATLAS",
    whyTitle: "From public information to inspectable price evidence.",
    whyBody: "People are one filter, not the product. The product is a repeatable evidence path across policy, executive, and industry signals.",
    plan: "Plans",
    free: "24 reviewed signals, daily Trump feed, and real event price windows.",
    pro: "Custom entities, assets, alerts, and licensed near-real-time connectors.",
    team: "Shared watchlists, reports, API access, and managed data sources.",
    footer: "Research and monitoring only. No investment advice; temporal association does not establish causality.",
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
    kicker: "공개 정보 기반 시장 인텔리전스",
    heroA: "신호를 보고,",
    heroB: "시장의 실제 움직임을 읽으세요.",
    hero: "공개 발언 전후의 실제 자산 가격, 거래 활동, 관심도 변화를 탐색합니다. 인과관계를 단정하거나 다음 가격을 예측하지 않습니다.",
    explore: "시그널 지도 열기",
    how: "분석 방식 보기",
    signal: "시그널",
    original: "원문 근거",
    price: "가격 흐름",
    realClose: "실제 종가",
    context: "맥락",
    attention: "거래량 + 관심도",
    reviewed: "검토된 시그널",
    classes: "시그널 유형",
    largest: "최대 1일 초과반응",
    sync: "최근 동기화",
    signalsKicker: "시그널 아틀라스",
    signalsTitle: "공개 정보 전후의 시장을 탐색하세요",
    signalsDesc: "시그널을 선택하면 정렬된 거래일 전후의 실제 종가 움직임을 확인할 수 있습니다.",
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
    sourceDesc: "제공자, 갱신 주기, 접근 방식과 현재 상태를 투명하게 표시합니다.",
    dataset: "데이터셋",
    provider: "제공자",
    cadence: "갱신",
    access: "접근",
    status: "상태",
    methodKicker: "분석 방법",
    methodTitle: "실제 가격과 투명한 맥락",
    methodDesc: "차트는 벤치마크로 정규화한 선이 아니라 해당 자산의 실제 종가입니다.",
    alignTitle: "거래일 정렬",
    alignBody: "장 마감 후·주말·휴일의 시그널은 다음 실제 거래일에 정렬합니다.",
    chartTitle: "실제 가격 흐름 표시",
    chartBody: "D-5부터 D+5까지 실제 종가를 그리고 시그널 거래일을 차트에 직접 표시합니다.",
    preserveTitle: "비교 지표는 맥락으로 유지",
    preserveBody: "초과수익률과 거래량은 인과 증명이나 예측이 아닌 참고 맥락으로 제공합니다.",
    whyKicker: "왜 SIGNAL ATLAS인가",
    whyTitle: "공개 정보에서 검증 가능한 가격 근거까지.",
    whyBody: "인물은 하나의 필터일 뿐입니다. 정책·기업 리더·산업 시그널을 같은 증거 경로로 비교하는 것이 제품의 핵심입니다.",
    plan: "요금제",
    free: "검토된 시그널 24개, Trump 일일 피드, 실제 이벤트 가격 구간.",
    pro: "사용자 지정 인물·자산, 알림, 정식 라이선스 기반 준실시간 연결.",
    team: "공유 워치리스트, 팀 리포트, API, 데이터 출처 관리.",
    footer: "리서치·모니터링 전용입니다. 투자 조언이 아니며 시간적 연관성은 인과관계를 증명하지 않습니다.",
    noResults: "조건에 맞는 시그널이 없습니다.",
    snapshotMode: "스냅샷",
  },
} as const;

const people: Record<PersonId, { initials: string; accent: string }> = {
  trump: { initials: "DT", accent: "amber" },
  musk: { initials: "EM", accent: "blue" },
  altman: { initials: "SA", accent: "violet" },
};

const typeOrder: SignalType[] = ["Policy signal", "Executive signal", "Industry signal"];

function PersonMark({ person, size = "md" }: { person: PersonId; size?: "sm" | "md" }) {
  const meta = people[person];
  return <span className={`person-mark ${meta.accent} ${size}`}>{meta.initials}</span>;
}

function formatPercent(value: number) {
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function formatCompact(value: number | null, locale: Locale) {
  if (value === null) return "—";
  return new Intl.NumberFormat(locale === "ko" ? "ko-KR" : "en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function MetricValue({ value }: { value: number }) {
  return <span className={value > 0 ? "positive" : value < 0 ? "negative" : "neutral"}>{formatPercent(value)}</span>;
}

function SourceState({ state, locale }: { state: "Fresh" | "Stale" | "Error"; locale: Locale }) {
  const labels = locale === "ko" ? { Fresh: "최신", Stale: "지연", Error: "오류" } : { Fresh: "Fresh", Stale: "Stale", Error: "Error" };
  return <span className={`source-state ${state.toLowerCase()}`}><span /> {labels[state]}</span>;
}

function signalLabel(type: SignalType, locale: Locale) {
  if (locale === "en") return type;
  return type === "Policy signal" ? "정책 시그널" : type === "Executive signal" ? "기업 리더 시그널" : "산업 시그널";
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
  };
  return labels[topic] ?? topic;
}

function persistenceLabel(value: string, locale: Locale) {
  if (locale === "en") return value;
  return value === "Persisted" ? "지속" : value === "Reversed" ? "반전" : "약화";
}

export function SignalAtlasDashboard({ events, initialLive, locale = "en" }: { events: MarketEvent[]; initialLive: LivePayload; locale?: Locale }) {
  const c = copy[locale];
  const dateLocale = locale === "ko" ? "ko-KR" : "en-US";
  const [signalType, setSignalType] = useState<SignalFilter>("all");
  const [asset, setAsset] = useState<string>(c.allAssets);
  const [entity, setEntity] = useState<string>(c.allEntities);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"reaction" | "recent">("reaction");
  const [selectedId, setSelectedId] = useState([...events].sort((a, b) => Math.abs(b.metrics.abnormalReturn1D) - Math.abs(a.metrics.abnormalReturn1D))[0]?.id);
  const [live, setLive] = useState(initialLive);
  const [liveLoading, setLiveLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/live").then((response) => response.ok ? response.json() : Promise.reject())
      .then((payload: LivePayload) => active && setLive(payload)).catch(() => undefined)
      .finally(() => active && setLiveLoading(false));
    return () => { active = false; };
  }, []);

  const assets = useMemo(() => Array.from(new Set(events.map((event) => event.asset))).sort(), [events]);
  const entities = useMemo(() => Array.from(new Set(events.map((event) => event.personName))).sort(), [events]);
  const filtered = useMemo(() => events.filter((event) => {
    const typeMatch = signalType === "all" || event.signalType === signalType;
    const assetMatch = asset === c.allAssets || event.asset === asset;
    const entityMatch = entity === c.allEntities || event.personName === entity;
    const haystack = `${event.text} ${event.summaryKo} ${event.topic} ${event.asset}`.toLowerCase();
    return typeMatch && assetMatch && entityMatch && haystack.includes(query.toLowerCase());
  }).sort((a, b) => sort === "recent" ? +new Date(b.publishedAt) - +new Date(a.publishedAt) : Math.abs(b.metrics.abnormalReturn1D) - Math.abs(a.metrics.abnormalReturn1D)), [asset, c.allAssets, c.allEntities, entity, events, query, signalType, sort]);

  const selected = filtered.find((event) => event.id === selectedId) ?? filtered[0] ?? events[0];
  const largest = [...events].sort((a, b) => Math.abs(b.metrics.abnormalReturn1D) - Math.abs(a.metrics.abnormalReturn1D))[0];
  const latestSignal = live.signals[0];
  const eventPrice = selected.priceWindow.find((point) => point.session === 0)?.close ?? 0;
  const chartData = selected.priceWindow.map((point) => ({ ...point, label: point.session === 0 ? c.event : `D${point.session > 0 ? "+" : ""}${point.session}` }));
  const formatDate = (value: string) => new Intl.DateTimeFormat(dateLocale, { timeZone: "Asia/Seoul", month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
  const formatTime = (value: string) => new Intl.DateTimeFormat(dateLocale, { timeZone: "Asia/Seoul", hour12: false, month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));

  const comparisons = useMemo(() => typeOrder.map((type) => {
    const group = events.filter((event) => event.signalType === type);
    const average = group.reduce((sum, event) => sum + Math.abs(event.metrics.abnormalReturn1D), 0) / group.length;
    const topAsset = [...group].sort((a, b) => Math.abs(b.metrics.abnormalReturn1D) - Math.abs(a.metrics.abnormalReturn1D))[0]?.asset;
    return { type, count: group.length, average, topAsset };
  }), [events]);

  const typeCopy = (type: SignalType) => type === "Policy signal" ? [c.policy, c.policySub, Landmark] as const : type === "Executive signal" ? [c.executive, c.executiveSub, BriefcaseBusiness] as const : [c.industry, c.industrySub, Cpu] as const;
  const sourceState = live.sources.some((source) => source.state === "Fresh") ? "Fresh" : "Stale";

  return (
    <main lang={locale === "ko" ? "ko" : "en"}>
      <header className="site-header">
        <a className="brand" href="#top"><span className="brand-symbol"><Radar size={18} /></span><span>MARKET SIGNAL ATLAS</span></a>
        <nav><a href="#explorer">{c.explorer}</a><a href="#comparison">{locale === "ko" ? "반응 비교" : "Comparison"}</a><a href="#sources">{c.sources}</a><a href="#methodology">{c.method}</a></nav>
        <div className="header-actions"><a className="language-link" href={locale === "ko" ? "/" : "/ko"}><Globe2 size={14} />{c.language}</a><a className="header-cta" href="mailto:hello@marketmover.demo">{c.request}<ArrowUpRight size={14} /></a></div>
      </header>

      <section className="hero atlas-hero" id="top"><div className="hero-grid" /><div className="hero-copy"><div className="eyebrow"><CircleDot size={14} />{c.kicker}</div><h1>{c.heroA}<br /><span>{c.heroB}</span></h1><p>{c.hero}</p><div className="hero-actions"><a className="button primary" href="#explorer">{c.explore}<ArrowRight size={16} /></a><a className="button ghost" href="#methodology">{c.how}</a></div></div><div className="hero-proof" aria-hidden="true"><div className="proof-orbit orbit-one" /><div className="proof-orbit orbit-two" /><div className="proof-center"><Radar size={30} /></div><div className="proof-node node-one"><span>{c.signal}</span><strong>{c.original}</strong></div><div className="proof-node node-two"><span>{c.price}</span><strong>{c.realClose}</strong></div><div className="proof-node node-three"><span>{c.context}</span><strong>{c.attention}</strong></div></div></section>

      <section className="overview section-shell" aria-label="Overview">
        <div className="stat-card"><div className="stat-icon"><Database size={18} /></div><div><span>{c.reviewed}</span><strong>{events.length}</strong><small>{locale === "ko" ? "원문 링크가 있는 큐레이션 사례" : "Curated cases with original links"}</small></div></div>
        <div className="stat-card"><div className="stat-icon"><CircleDot size={18} /></div><div><span>{c.classes}</span><strong>3</strong><small>{locale === "ko" ? "정책 · 기업 리더 · 산업" : "Policy · Executive · Industry"}</small></div></div>
        <div className="stat-card"><div className="stat-icon"><BarChart3 size={18} /></div><div><span>{c.largest}</span><strong>{formatPercent(Math.abs(largest.metrics.abnormalReturn1D))}</strong><small>{largest.asset} vs {largest.benchmark}</small></div></div>
        <div className="stat-card live-card"><div className="stat-icon"><RefreshCw size={18} className={liveLoading ? "spin" : ""} /></div><div><span>{c.sync}</span><strong>{live.mode === "live" ? "Live" : c.snapshotMode}</strong><small>{formatTime(live.fetchedAt)}</small></div><SourceState state={sourceState} locale={locale} /></div>
      </section>

      <section className="section-shell explorer-section" id="explorer">
        <div className="section-heading"><div><span className="section-kicker">{c.signalsKicker}</span><h2>{c.signalsTitle}</h2><p>{c.signalsDesc}</p></div><div className="method-badge"><ShieldCheck size={16} />{c.caveat}</div></div>
        <div className="person-tabs signal-tabs" role="tablist">
          <button className={signalType === "all" ? "active" : ""} onClick={() => setSignalType("all")}><Radar size={18} /><span className="tab-copy"><strong>{c.all}</strong><small>{events.length} {c.records}</small></span></button>
          {typeOrder.map((type) => { const [label, sub, Icon] = typeCopy(type); return <button key={type} className={signalType === type ? "active" : ""} onClick={() => setSignalType(type)}><Icon size={18} /><span className="tab-copy"><strong>{label}</strong><small>{sub}</small></span><span>{events.filter((event) => event.signalType === type).length}</span></button>; })}
        </div>
        <div className="explorer-toolbar"><label className="search-box"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={c.search} /></label><select value={asset} onChange={(event) => setAsset(event.target.value)} aria-label="Asset"><option>{c.allAssets}</option>{assets.map((item) => <option key={item}>{item}</option>)}</select><select value={entity} onChange={(event) => setEntity(event.target.value)} aria-label="Entity"><option>{c.allEntities}</option>{entities.map((item) => <option key={item}>{item}</option>)}</select><div className="segmented"><button className={sort === "reaction" ? "active" : ""} onClick={() => setSort("reaction")}>{c.reaction}</button><button className={sort === "recent" ? "active" : ""} onClick={() => setSort("recent")}>{c.recent}</button></div></div>

        <div className="explorer-grid atlas-grid">
          <div className="event-list"><div className="list-heading"><span>{filtered.length} {c.records}</span><span>{c.excess}</span></div>{filtered.map((event) => <button key={event.id} className={`event-row ${event.id === selected.id ? "selected" : ""}`} onClick={() => setSelectedId(event.id)}><PersonMark person={event.person} size="sm" /><span className="event-copy"><span className="row-meta"><strong>{signalLabel(event.signalType, locale)}</strong><i>{topicLabel(event.topic, locale)}</i></span><span className="event-text">{locale === "ko" ? event.summaryKo : event.text}</span><span className="row-foot">{formatDate(event.publishedAt)} · {event.asset}</span></span><span className="row-reaction"><MetricValue value={event.metrics.abnormalReturn1D} /><ChevronRight size={15} /></span></button>)}{!filtered.length && <div className="empty-state">{c.noResults}</div>}</div>

          <article className="evidence-panel"><div className="evidence-head"><div className="evidence-person"><PersonMark person={selected.person} /><div><strong>{selected.personName}</strong><span>{signalLabel(selected.signalType, locale)} · {selected.platform}</span></div></div><span className={`coverage-badge ${selected.coverage.toLowerCase()}`}>{topicLabel(selected.topic, locale)}</span></div><blockquote>“{locale === "ko" ? selected.summaryKo : selected.text}”</blockquote>{locale === "ko" && <div className="original-excerpt"><span>{c.originalLabel}</span>{selected.text}</div>}<div className="source-line"><span><Clock3 size={14} />{formatTime(selected.publishedAt)}</span><a href={selected.sourceUrl} target="_blank" rel="noreferrer">{c.viewOriginal}<ExternalLink size={13} /></a></div>
            <div className="metric-strip"><div><span>{c.abnormal}</span><strong><MetricValue value={selected.metrics.abnormalReturn1D} /></strong><small>{selected.asset} − {selected.benchmark}</small></div><div><span>{c.volume}</span><strong>{selected.metrics.volumeMultiple.toFixed(2)}×</strong><small>{c.versus}</small></div><div><span>{c.persistence}</span><strong>{persistenceLabel(selected.metrics.persistence, locale)}</strong><small><MetricValue value={selected.metrics.cumulativeAbnormal3D} /> {c.cumulative}</small></div></div>
            <div className="chart-head"><div><span>{c.actualWindow}</span><strong>{c.actualTitle}</strong></div><div className="asset-pair"><b>{selected.asset}</b><span>{c.eventClose}</span>${eventPrice.toFixed(2)}</div></div><div className="reaction-chart actual-price-chart"><ResponsiveContainer width="100%" height="100%"><LineChart data={chartData} margin={{ top: 18, right: 14, left: -5, bottom: 0 }}><CartesianGrid stroke="#e7e9e4" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="label" tick={{ fill: "#7b8178", fontSize: 9 }} axisLine={false} tickLine={false} interval={1} /><YAxis domain={["auto", "auto"]} tickFormatter={(value) => `$${Number(value).toFixed(0)}`} tick={{ fill: "#7b8178", fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, selected.asset]} labelFormatter={(label) => `${label}`} /><ReferenceLine x={c.event} stroke="#bc704b" strokeDasharray="4 4" label={{ value: c.event, fill: "#9b5737", fontSize: 9, position: "insideTopRight" }} /><Line type="monotone" dataKey="close" name={selected.asset} stroke="#1d7651" strokeWidth={2.7} dot={{ r: 2.7, fill: "#1d7651" }} activeDot={{ r: 5 }} /><ReferenceDot x={c.event} y={eventPrice} r={5} fill="#bc704b" stroke="#fff" strokeWidth={2} /></LineChart></ResponsiveContainer></div>
            <div className="rationale"><Sparkles size={15} /><p><strong>{c.mapping}</strong>{locale === "ko" ? `${selected.asset}을(를) ${topicLabel(selected.topic, locale)} 시그널의 연결 자산으로 보고, ${selected.benchmark} 대비 초과반응은 보조 맥락으로만 제공합니다.` : selected.rationale}</p></div>
            <div className="attention-layer"><div className="attention-title"><span>{c.engagement}</span><small>{locale === "ko" ? "원문 플랫폼 공개 수치" : "Public source metrics"}</small></div><div className="attention-bars">{[[c.likes, selected.engagement.likes], [c.reposts, selected.engagement.reposts], [c.views, selected.engagement.views]].filter((item) => item[1] !== null).map(([label, value]) => <div key={String(label)}><span>{label}</span><div><i style={{ width: `${Math.min(100, Math.max(8, Math.log10(Number(value) + 1) * 18))}%` }} /></div><strong>{formatCompact(Number(value), locale)}</strong></div>)}</div></div>
          </article>

          <aside className="live-panel"><div className="live-head"><div><span className="pulse" /><strong>{c.live}</strong></div><span>{c.daily}</span></div>{latestSignal && <><div className="live-person"><PersonMark person="trump" size="sm" /><div><strong>Donald Trump</strong><span>{formatTime(latestSignal.publishedAt)}</span></div></div><p className="live-copy">“{latestSignal.text}”</p><div className="live-tags"><span>{topicLabel(latestSignal.topic, locale)}</span><span>Public RSS</span></div><div className="pending-box"><Clock3 size={16} /><div><strong>{locale === "ko" ? "시장 반응 대기" : latestSignal.state}</strong><span>{c.pending}</span></div></div><a href={latestSignal.sourceUrl} target="_blank" rel="noreferrer" className="text-link">{c.openOriginal}<ExternalLink size={13} /></a></>}<div className="market-snapshot"><div className="aside-title"><span>{c.snapshot}</span><small>{c.cached}</small></div>{Object.entries(live.prices).map(([symbol, quote]) => <div className="quote-row" key={symbol}><strong>{symbol}</strong><span>${quote.price.toFixed(2)}</span><small>{quote.asOf}</small></div>)}</div><div className="live-note"><ShieldCheck size={15} />{c.association}</div></aside>
        </div>
      </section>

      <section className="comparison-section" id="comparison"><div className="section-shell"><div className="section-heading"><div><span className="section-kicker">{c.compareKicker}</span><h2>{c.compareTitle}</h2><p>{c.compareDesc}</p></div></div><div className="comparison-grid">{comparisons.map((item) => { const [label, sub, Icon] = typeCopy(item.type); return <div className="comparison-card" key={item.type}><div className="comparison-icon"><Icon size={20} /></div><span>{label}</span><h3>{formatPercent(item.average)}</h3><p>{c.avgAbs}</p><div><small>{item.count} {c.evidenceCount}</small><strong>{sub} · {item.topAsset}</strong></div></div>; })}</div></div></section>

      <section className="sources-section" id="sources"><div className="section-shell"><div className="section-heading light-heading"><div><span className="section-kicker">{c.sourceKicker}</span><h2>{c.sourceTitle}</h2><p>{c.sourceDesc}</p></div><span className="as-of">{formatTime(live.fetchedAt)}</span></div><div className="source-table"><div className="source-table-head"><span>{c.dataset}</span><span>{c.provider}</span><span>{c.cadence}</span><span>{c.access}</span><span>{c.status}</span></div>{live.sources.map((source) => <div className="source-row" key={source.id}><div><strong>{source.label}</strong><small>{source.note}</small></div><span>{source.provider}</span><span>{source.cadence}</span><span><i className={source.access === "Free" ? "free-badge" : "paid-badge"}>{source.access}</i></span><div><SourceState state={source.state} locale={locale} /><small>{formatDate(source.lastSuccessAt)}</small></div></div>)}</div></div></section>

      <section className="method-section section-shell" id="methodology"><div className="section-heading centered"><div><span className="section-kicker">{c.methodKicker}</span><h2>{c.methodTitle}</h2><p>{c.methodDesc}</p></div></div><div className="method-grid"><div className="method-card"><span>01</span><Clock3 size={22} /><h3>{c.alignTitle}</h3><p>{c.alignBody}</p></div><div className="method-card"><span>02</span><LineChartIcon size={22} /><h3>{c.chartTitle}</h3><p>{c.chartBody}</p></div><div className="method-card"><span>03</span><ShieldCheck size={22} /><h3>{c.preserveTitle}</h3><p>{c.preserveBody}</p></div></div></section>

      <section className="difference-section"><div className="section-shell difference-grid"><div><span className="section-kicker">{c.whyKicker}</span><h2>{c.whyTitle}</h2><p>{c.whyBody}</p></div><div className="evidence-path"><div><span>01</span><strong>{c.signal}</strong><small>{locale === "ko" ? "무슨 정보인가?" : "What happened?"}</small></div><ChevronRight /><div><span>02</span><strong>{locale === "ko" ? "출처" : "Source"}</strong><small>{locale === "ko" ? "근거는 어디인가?" : "Where is proof?"}</small></div><ChevronRight /><div><span>03</span><strong>{locale === "ko" ? "자산" : "Asset"}</strong><small>{locale === "ko" ? "왜 연결했나?" : "Why linked?"}</small></div><ChevronRight /><div><span>04</span><strong>{locale === "ko" ? "실제 가격" : "Real price"}</strong><small>{locale === "ko" ? "어떻게 움직였나?" : "How did it move?"}</small></div></div></div></section>

      <section className="pricing-section section-shell" id="pricing"><div className="section-heading centered"><div><span className="section-kicker">{c.plan}</span><h2>{locale === "ko" ? "탐색은 무료로, 모니터링은 필요에 맞게." : "Explore freely. Scale the monitoring."}</h2></div></div><div className="pricing-grid compact-pricing"><div className="price-card"><span className="plan">FREE</span><div className="price"><strong>$0</strong></div><p>{c.free}</p><a href="#explorer">{c.explore}</a></div><div className="price-card featured"><span className="plan">PRO</span><div className="price"><strong>$19</strong><span>/ month</span></div><p>{c.pro}</p><a href="mailto:hello@marketmover.demo">{c.request}<ArrowUpRight size={14} /></a></div><div className="price-card"><span className="plan">TEAM</span><div className="price"><strong>$99</strong><span>/ month</span></div><p>{c.team}</p><a href="mailto:hello@marketmover.demo">{c.request}</a></div></div></section>

      <footer><div className="footer-brand"><span className="brand-symbol"><Radar size={17} /></span><div><strong>MARKET SIGNAL ATLAS</strong><span>{locale === "ko" ? "공개 정보와 시장 반응의 증거 지도" : "An evidence map for public signals and markets"}</span></div></div><p>{c.footer}</p><div><a href="#methodology">{c.method}</a><a href="#sources">{c.sources}</a><a href="mailto:hello@marketmover.demo"><Bell size={14} />{c.request}</a></div></footer>
    </main>
  );
}
