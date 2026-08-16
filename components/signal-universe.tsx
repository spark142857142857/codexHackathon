"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Boxes, CheckCircle2, ExternalLink, Filter, Search, ShieldCheck } from "lucide-react";
import type { CandidateClassificationMethod, SignalCatalogResponse, SignalScope } from "@/lib/types";

type Locale = "en" | "ko";
type MethodFilter = CandidateClassificationMethod | "all";

const labels = {
  en: {
    kicker: "SIGNAL UNIVERSE",
    title: "From 32,393 originals to an evidence-ready signal atlas",
    desc: "Every eligible original remains searchable. One representative per cluster removes repetition, then every market-relevant cluster with a valid price window receives price, volume, volatility, and scoped attention evidence.",
    raw: "Raw source rows", eligible: "Eligible originals", clusters: "Cluster reps", reviewed: "Reviewed references", enriched: "Evidence-ready", showing: "Current layer",
    search: "Search all candidate texts, topics, assets…", allPeople: "All people", allMethods: "All stages", allTopics: "All topics",
    result: "matching candidates", source: "Original", noResults: "No candidates match these filters.",
    methods: { human_reviewed: "Reviewed", ai: "Optional AI label", rules: "Rules classified", pending: "Unclassified" },
    pipeline: ["Raw corpus", "Eligibility", "Cluster reps", "Evidence enrichment", "Audited report"],
    honest: "The public demo keeps rule-based calculations and model-assisted reports visibly separate. Missing source evidence is never filled by a model.",
    pipelineBadge: "Auditable evidence pipeline",
    limitation: "Full local history: Trump + Musk. Sam Altman is currently limited to reviewed cases because no complete local corpus is available.",
    scopes: { all: "All originals", representatives: "Cluster representatives", evidence: "Evidence-ready" },
    inspect: "Inspect six-stage evidence", hide: "Hide evidence", mediaCoverage: "Tracked-corpus media links only",
  },
  ko: {
    kicker: "전체 시그널 유니버스",
    title: "32,393개 원문을 근거 중심 시그널 아틀라스로 정리했습니다",
    desc: "조건을 통과한 모든 원문은 검색 가능하게 유지합니다. 군집마다 대표 1개로 반복을 줄이고, 유효한 가격 구간이 있는 모든 시장 관련 군집에 실제 가격·거래량·변동성·범위가 명시된 관심도 근거를 붙였습니다.",
    raw: "원본 데이터 행", eligible: "후보 원문", clusters: "군집 대표", reviewed: "검토 참고자료", enriched: "근거 준비 완료", showing: "현재 레이어",
    search: "전체 후보의 원문·주제·자산 검색…", allPeople: "모든 인물", allMethods: "모든 단계", allTopics: "모든 주제",
    result: "개 후보 검색됨", source: "원문", noResults: "조건에 맞는 후보가 없습니다.",
    methods: { human_reviewed: "검토 완료", ai: "선택형 AI 라벨", rules: "규칙 분류", pending: "미분류" },
    pipeline: ["원본 데이터", "후보 필터", "군집 대표", "근거 보강", "감사 리포트"],
    honest: "공개 데모는 규칙 기반 계산과 모델 보조 리포트를 구분합니다. 출처 근거가 없는 값은 모델로 채우지 않습니다.",
    pipelineBadge: "검증 가능한 근거 파이프라인",
    limitation: "전체 로컬 이력은 Trump·Musk이며, Sam Altman은 완전한 원본 코퍼스가 없어 현재 검토 사례만 제공합니다.",
    scopes: { all: "전체 원문", representatives: "군집 대표", evidence: "근거 준비 완료" },
    inspect: "6단계 근거 보기", hide: "근거 접기", mediaCoverage: "추적 코퍼스의 미디어 링크만 집계",
  },
} as const;

const fmt = (value: number, locale: Locale) => new Intl.NumberFormat(locale === "ko" ? "ko-KR" : "en-US").format(value);

export function SignalUniverse({ locale }: { locale: Locale }) {
  const c = labels[locale];
  const [payload, setPayload] = useState<SignalCatalogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [entity, setEntity] = useState("all");
  const [method, setMethod] = useState<MethodFilter>("all");
  const [topic, setTopic] = useState("all");
  const [page, setPage] = useState(1);
  const [scope, setScope] = useState<SignalScope>("evidence");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const requestUrl = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), limit: "12", q: query, entity, method, topic, scope });
    return `/api/signals?${params}`;
  }, [entity, method, page, query, scope, topic]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setLoading(true);
      fetch(requestUrl, { cache: "no-store", signal: controller.signal })
        .then((response) => response.ok ? response.json() : Promise.reject(new Error("Signal catalog failed")))
        .then((data: SignalCatalogResponse) => setPayload(data))
        .catch((error) => { if (error.name !== "AbortError") setPayload(null); })
        .finally(() => setLoading(false));
    }, query ? 280 : 0);
    return () => { controller.abort(); window.clearTimeout(timer); };
  }, [query, requestUrl]);

  const resetPage = (setter: (value: string) => void) => (value: string) => { setter(value); setPage(1); };
  const meta = payload?.meta;

  return (
    <section className="universe-section" id="universe">
      <div className="section-shell">
        <div className="section-heading universe-heading"><div><span className="section-kicker">{c.kicker}</span><h2>{c.title}</h2><p>{c.desc}</p></div><div className="method-badge"><ShieldCheck size={16} />{c.pipelineBadge}</div></div>

        <div className="universe-stats">
          {[[c.raw, meta?.rawCorpusTotal], [c.eligible, meta?.eligibleCandidates], [c.clusters, payload?.universe.representativeCount], [c.enriched, payload?.universe.enrichedCount], [c.reviewed, meta?.reviewedShowcases]].map(([label, value]) => <div key={String(label)}><span>{label}</span><strong>{typeof value === "number" ? fmt(value, locale) : "—"}</strong></div>)}
        </div>

        <div className="pipeline-track">
          {c.pipeline.map((stage, index) => <div key={stage} className="done"><span>{String(index + 1).padStart(2, "0")}</span><strong>{stage}</strong>{index < c.pipeline.length - 1 && <ArrowRight size={14} />}</div>)}
        </div>
        <div className="universe-notes"><p><CheckCircle2 size={15} />{c.honest}</p><p><Boxes size={15} />{c.limitation}</p></div>

        <div className="catalog-shell">
          <div className="scope-switch" role="tablist">{(["all", "representatives", "evidence"] as SignalScope[]).map((item) => <button key={item} className={scope === item ? "active" : ""} onClick={() => { setScope(item); setPage(1); }}>{c.scopes[item]}<span>{item === "all" ? fmt(meta?.eligibleCandidates ?? 0, locale) : item === "representatives" ? fmt(payload?.universe.representativeCount ?? 0, locale) : fmt(payload?.universe.enrichedCount ?? 0, locale)}</span></button>)}</div>
          <div className="catalog-toolbar">
            <label className="search-box"><Search size={16} /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder={c.search} /></label>
            <div className="catalog-filter"><Filter size={14} /><select value={entity} onChange={(event) => resetPage(setEntity)(event.target.value)}><option value="all">{c.allPeople}</option><option value="trump">Donald Trump</option><option value="musk">Elon Musk</option></select></div>
            <select value={method} onChange={(event) => { setMethod(event.target.value as MethodFilter); setPage(1); }}><option value="all">{c.allMethods}</option>{Object.entries(c.methods).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
            <select value={topic} onChange={(event) => resetPage(setTopic)(event.target.value)}><option value="all">{c.allTopics}</option>{payload?.facets.topics.map((item) => <option key={item.value} value={item.value}>{item.value} ({fmt(item.count, locale)})</option>)}</select>
          </div>

          <div className="catalog-summary"><span>{loading ? "…" : fmt(payload?.pagination.total ?? 0, locale)} {c.result}</span><span>{c.showing}: {c.scopes[scope]}</span></div>
          <div className={`catalog-list ${loading ? "loading" : ""}`}>
            {payload?.items.map((record) => <article className="candidate-row" key={record.id}>
              <div className={`candidate-mark ${record.entityId}`}>{record.entityId === "trump" ? "DT" : "EM"}</div>
              <div className="candidate-copy"><div><strong>{record.entity}</strong><span>{new Intl.DateTimeFormat(locale === "ko" ? "ko-KR" : "en-US", { dateStyle: "medium" }).format(new Date(record.publishedAt))}</span><i className={`method-${record.classificationMethod}`}>{c.methods[record.classificationMethod]}</i>{record.reviewed && <CheckCircle2 size={13} />}</div><p>{record.text || (locale === "ko" ? "텍스트가 없는 링크형 게시물" : "Link-only post without text")}</p><small>{record.topic} · {record.assets.length ? record.assets.join(" · ") : (locale === "ko" ? "연결 자산 미정" : "Asset mapping pending")} · {record.clusterId}</small>{record.evidence && <div className="candidate-evidence"><b>{record.evidence.asset}</b><span>1D {record.evidence.abnormalReturn1D > 0 ? "+" : ""}{record.evidence.abnormalReturn1D.toFixed(2)}%</span><span>{record.evidence.volumeMultiple.toFixed(2)}× vol</span><span>{record.evidence.trackedMentions} {locale === "ko" ? "추적 언급" : "tracked mentions"}</span><span>{record.evidence.linkedMediaReferences} {locale === "ko" ? "미디어 링크" : "media links"}</span></div>}{record.evidence && <button className="evidence-toggle" onClick={() => setExpandedId((value) => value === record.id ? null : record.id)}><Search size={12} />{expandedId === record.id ? c.hide : c.inspect}</button>}{record.evidence && expandedId === record.id && <div className="candidate-detail"><div className="detail-summary"><strong>{locale === "ko" ? record.evidence.orchestration.summaryKo : record.evidence.orchestration.summaryEn}</strong><span>{record.evidence.eventSession} · {record.evidence.volatilityMultiple.toFixed(2)}× volatility · {c.mediaCoverage}</span></div><div className="detail-stages">{record.evidence.orchestration.stages.map((stage, index) => <div key={stage.id}><b>{String(index + 1).padStart(2, "0")} · {stage.id}</b><p>{locale === "ko" ? stage.summaryKo : stage.summaryEn}</p><small>{stage.confidence}</small></div>)}</div></div>}</div>
              <a href={record.sourceUrl} target="_blank" rel="noreferrer" aria-label={c.source}>{c.source}<ExternalLink size={13} /></a>
            </article>)}
            {!loading && !payload?.items.length && <div className="empty-state">{c.noResults}</div>}
          </div>
          <div className="catalog-pagination"><button onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={!payload || payload.pagination.page <= 1}><ArrowLeft size={14} /></button><span>{payload ? `${fmt(payload.pagination.page, locale)} / ${fmt(payload.pagination.pages, locale)}` : "—"}</span><button onClick={() => setPage((value) => Math.min(payload?.pagination.pages ?? value, value + 1))} disabled={!payload || payload.pagination.page >= payload.pagination.pages}><ArrowRight size={14} /></button></div>
        </div>
      </div>
    </section>
  );
}
