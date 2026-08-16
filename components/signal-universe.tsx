"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Bot, Boxes, CheckCircle2, ExternalLink, Filter, Search, Sparkles } from "lucide-react";
import type { CandidateClassificationMethod, SignalCatalogResponse } from "@/lib/types";

type Locale = "en" | "ko";
type MethodFilter = CandidateClassificationMethod | "all";

const labels = {
  en: {
    kicker: "SIGNAL UNIVERSE",
    title: "The 28 cases are the reviewed layer—not the whole dataset",
    desc: "Every eligible original post is available through a server-paginated catalog. Rules create a cheap first pass; AI Batch results can replace that classification before deeper evidence agents run.",
    raw: "Raw source rows", eligible: "Eligible originals", clusters: "Seed clusters", reviewed: "Human-reviewed", ai: "AI imported", queued: "Awaiting AI Batch",
    search: "Search all candidate texts, topics, assets…", allPeople: "All people", allMethods: "All stages", allTopics: "All topics",
    result: "matching candidates", source: "Original", noResults: "No candidates match these filters.",
    methods: { human_reviewed: "Reviewed", ai: "AI classified", rules: "Rules preclassified", pending: "Needs AI" },
    pipeline: ["Raw corpus", "Eligibility rules", "AI Batch", "Signal clusters", "Evidence agents"],
    honest: "AI Batch has not run in this deployment. Rule labels are preliminary and missing news/social evidence is never invented.",
    limitation: "Full local history: Trump + Musk. Sam Altman is currently limited to reviewed cases because no complete local corpus is available.",
  },
  ko: {
    kicker: "전체 시그널 유니버스",
    title: "28개는 전체가 아니라 사람이 검토한 쇼케이스입니다",
    desc: "조건을 통과한 모든 원문을 서버 페이지네이션 카탈로그에서 탐색합니다. 규칙으로 저비용 1차 분류하고, AI Batch 결과가 들어오면 이를 교체한 뒤 필요한 군집만 심층 증거 에이전트로 보냅니다.",
    raw: "원본 데이터 행", eligible: "후보 원문", clusters: "1차 군집", reviewed: "사람 검토", ai: "AI 결과 반영", queued: "AI Batch 대기",
    search: "전체 후보의 원문·주제·자산 검색…", allPeople: "모든 인물", allMethods: "모든 단계", allTopics: "모든 주제",
    result: "개 후보 검색됨", source: "원문", noResults: "조건에 맞는 후보가 없습니다.",
    methods: { human_reviewed: "검토 완료", ai: "AI 분류", rules: "규칙 사전분류", pending: "AI 필요" },
    pipeline: ["원본 데이터", "후보 필터", "AI Batch", "시그널 군집", "증거 에이전트"],
    honest: "현재 배포에서는 AI Batch를 아직 실행하지 않았습니다. 규칙 라벨은 예비 판정이며 없는 뉴스·SNS 근거를 AI로 만들어내지 않습니다.",
    limitation: "전체 로컬 이력은 Trump·Musk이며, Sam Altman은 완전한 원본 코퍼스가 없어 현재 검토 사례만 제공합니다.",
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

  const requestUrl = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), limit: "12", q: query, entity, method, topic });
    return `/api/signals?${params}`;
  }, [entity, method, page, query, topic]);

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
        <div className="section-heading universe-heading"><div><span className="section-kicker">{c.kicker}</span><h2>{c.title}</h2><p>{c.desc}</p></div><div className="method-badge"><Bot size={16} />Conditional orchestration</div></div>

        <div className="universe-stats">
          {[[c.raw, meta?.rawCorpusTotal], [c.eligible, meta?.eligibleCandidates], [c.clusters, meta?.clusterCount], [c.reviewed, meta?.reviewedShowcases], [c.ai, meta?.aiClassified]].map(([label, value]) => <div key={String(label)}><span>{label}</span><strong>{typeof value === "number" ? fmt(value, locale) : "—"}</strong></div>)}
        </div>

        <div className="pipeline-track">
          {c.pipeline.map((stage, index) => <div key={stage} className={index === 2 && !meta?.aiClassified ? "waiting" : "done"}><span>{String(index + 1).padStart(2, "0")}</span><strong>{stage}</strong>{index < c.pipeline.length - 1 && <ArrowRight size={14} />}</div>)}
        </div>
        <div className="universe-notes"><p><Sparkles size={15} />{c.honest}</p><p><Boxes size={15} />{c.limitation}</p></div>

        <div className="catalog-shell">
          <div className="catalog-toolbar">
            <label className="search-box"><Search size={16} /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder={c.search} /></label>
            <div className="catalog-filter"><Filter size={14} /><select value={entity} onChange={(event) => resetPage(setEntity)(event.target.value)}><option value="all">{c.allPeople}</option><option value="trump">Donald Trump</option><option value="musk">Elon Musk</option></select></div>
            <select value={method} onChange={(event) => { setMethod(event.target.value as MethodFilter); setPage(1); }}><option value="all">{c.allMethods}</option>{Object.entries(c.methods).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
            <select value={topic} onChange={(event) => resetPage(setTopic)(event.target.value)}><option value="all">{c.allTopics}</option>{payload?.facets.topics.map((item) => <option key={item.value} value={item.value}>{item.value} ({fmt(item.count, locale)})</option>)}</select>
          </div>

          <div className="catalog-summary"><span>{loading ? "…" : fmt(payload?.pagination.total ?? 0, locale)} {c.result}</span><span>{c.queued}: {meta ? fmt(meta.aiPending, locale) : "—"}</span></div>
          <div className={`catalog-list ${loading ? "loading" : ""}`}>
            {payload?.items.map((record) => <article className="candidate-row" key={record.id}>
              <div className={`candidate-mark ${record.entityId}`}>{record.entityId === "trump" ? "DT" : "EM"}</div>
              <div className="candidate-copy"><div><strong>{record.entity}</strong><span>{new Intl.DateTimeFormat(locale === "ko" ? "ko-KR" : "en-US", { dateStyle: "medium" }).format(new Date(record.publishedAt))}</span><i className={`method-${record.classificationMethod}`}>{c.methods[record.classificationMethod]}</i>{record.reviewed && <CheckCircle2 size={13} />}</div><p>{record.text || (locale === "ko" ? "텍스트가 없는 링크형 게시물" : "Link-only post without text")}</p><small>{record.topic} · {record.assets.length ? record.assets.join(" · ") : (locale === "ko" ? "연결 자산 미정" : "Asset mapping pending")} · {record.clusterId}</small></div>
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
