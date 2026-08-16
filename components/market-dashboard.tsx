"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  Check,
  ChevronRight,
  CircleDot,
  Clock3,
  Database,
  ExternalLink,
  LineChart as LineChartIcon,
  Radar,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { LivePayload, MarketEvent, PersonId } from "@/lib/types";

type PersonFilter = PersonId | "all";

const personMeta: Record<PersonId, { short: string; initials: string; accent: string; summary: string }> = {
  trump: {
    short: "Trump",
    initials: "DT",
    accent: "amber",
    summary: "Policy power · Trade, rates, and technology policy",
  },
  musk: {
    short: "Musk",
    initials: "EM",
    accent: "blue",
    summary: "Founder power · Direct TSLA and technology exposure",
  },
  altman: {
    short: "Altman",
    initials: "SA",
    accent: "violet",
    summary: "Narrative power · Explicitly labeled AI proxy assets",
  },
};

const formatPercent = (value: number) => `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
const formatCompact = (value: number | null) => {
  if (value === null) return "—";
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
};
const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
const formatTime = (value: string) =>
  new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(
    new Date(value),
  );

function PersonMark({ person, size = "md" }: { person: PersonId; size?: "sm" | "md" }) {
  const meta = personMeta[person];
  return <span className={`person-mark ${meta.accent} ${size}`}>{meta.initials}</span>;
}

function MetricValue({ value }: { value: number }) {
  return <span className={value > 0 ? "positive" : value < 0 ? "negative" : "neutral"}>{formatPercent(value)}</span>;
}

function SourceState({ state }: { state: "Fresh" | "Stale" | "Error" }) {
  return (
    <span className={`source-state ${state.toLowerCase()}`}>
      <span /> {state}
    </span>
  );
}

export function MarketDashboard({ events, initialLive }: { events: MarketEvent[]; initialLive: LivePayload }) {
  const [person, setPerson] = useState<PersonFilter>("trump");
  const [asset, setAsset] = useState("All assets");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"reaction" | "recent">("reaction");
  const [selectedId, setSelectedId] = useState(
    [...events].filter((event) => event.person === "trump").sort((a, b) =>
      Math.abs(b.metrics.abnormalReturn1D) - Math.abs(a.metrics.abnormalReturn1D),
    )[0]?.id ?? events[0]?.id,
  );
  const [live, setLive] = useState(initialLive);
  const [liveLoading, setLiveLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/live")
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("Live request failed"))))
      .then((payload: LivePayload) => active && setLive(payload))
      .catch(() => undefined)
      .finally(() => active && setLiveLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const assets = useMemo(() => ["All assets", ...Array.from(new Set(events.map((event) => event.asset))).sort()], [events]);
  const filtered = useMemo(() => {
    const result = events.filter((event) => {
      const personMatch = person === "all" || event.person === person;
      const assetMatch = asset === "All assets" || event.asset === asset;
      const queryMatch = `${event.text} ${event.topic} ${event.asset}`.toLowerCase().includes(query.toLowerCase());
      return personMatch && assetMatch && queryMatch;
    });
    return result.sort((a, b) =>
      sort === "recent"
        ? new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        : Math.abs(b.metrics.abnormalReturn1D) - Math.abs(a.metrics.abnormalReturn1D),
    );
  }, [asset, events, person, query, sort]);

  const selected = filtered.find((event) => event.id === selectedId) ?? filtered[0] ?? events[0];
  const largest = [...events].sort((a, b) => Math.abs(b.metrics.abnormalReturn1D) - Math.abs(a.metrics.abnormalReturn1D))[0];
  const latestSignal = live.signals[0];

  const choosePerson = (next: PersonFilter) => {
    setPerson(next);
    setAsset("All assets");
  };

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Market Mover home">
          <span className="brand-symbol"><TrendingUp size={18} strokeWidth={2.5} /></span>
          <span>MARKET MOVER</span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#explorer">Explorer</a>
          <a href="#sources">Data sources</a>
          <a href="#methodology">Methodology</a>
          <a href="#pricing">Pricing</a>
        </nav>
        <a className="header-cta" href="mailto:hello@marketmover.demo?subject=Market%20Mover%20access">
          Request access <ArrowUpRight size={15} />
        </a>
      </header>

      <section className="hero" id="top">
        <div className="hero-grid" />
        <div className="hero-copy">
          <div className="eyebrow"><CircleDot size={14} /> EVIDENCE-FIRST MARKET INTELLIGENCE</div>
          <h1>When influential people speak,<br /><span>what did the market actually do?</span></h1>
          <p>
            Trace public statements to observable asset reactions—source by source, session by session, and always
            measured against a benchmark.
          </p>
          <div className="hero-actions">
            <a className="button primary" href="#explorer">Explore the evidence <ArrowRight size={16} /></a>
            <a className="button ghost" href="#methodology">How it works</a>
          </div>
        </div>
        <div className="hero-proof" aria-hidden="true">
          <div className="proof-orbit orbit-one" />
          <div className="proof-orbit orbit-two" />
          <div className="proof-center"><Radar size={30} /></div>
          <div className="proof-node node-one"><span>Statement</span><strong>Original source</strong></div>
          <div className="proof-node node-two"><span>Reaction</span><strong>Asset − benchmark</strong></div>
          <div className="proof-node node-three"><span>Context</span><strong>Volume + persistence</strong></div>
        </div>
      </section>

      <section className="overview section-shell" aria-label="Coverage overview">
        <div className="stat-card">
          <div className="stat-icon"><Users size={18} /></div>
          <div><span>Tracked movers</span><strong>3</strong><small>Policy · Founder · Narrative</small></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Database size={18} /></div>
          <div><span>Reviewed events</span><strong>{events.length}</strong><small>8 verified cases per person</small></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><BarChart3 size={18} /></div>
          <div><span>Largest 1D reaction</span><strong>{formatPercent(Math.abs(largest.metrics.abnormalReturn1D))}</strong><small>{largest.asset} vs {largest.benchmark}</small></div>
        </div>
        <div className="stat-card live-card">
          <div className="stat-icon"><RefreshCw size={18} className={liveLoading ? "spin" : ""} /></div>
          <div><span>Latest sync</span><strong>{live.mode === "live" ? "Live" : "Snapshot"}</strong><small>{formatTime(live.fetchedAt)}</small></div>
          <SourceState state={live.sources.some((source) => source.state === "Fresh") ? "Fresh" : "Stale"} />
        </div>
      </section>

      <section className="section-shell explorer-section" id="explorer">
        <div className="section-heading">
          <div>
            <span className="section-kicker">EVENT EXPLORER</span>
            <h2>Follow the evidence trail</h2>
            <p>Select a statement to compare the linked asset with its benchmark around the event session.</p>
          </div>
          <div className="method-badge"><ShieldCheck size={16} /> No forecasts. No causality claims.</div>
        </div>

        <div className="person-tabs" role="tablist" aria-label="Filter by person">
          <button className={person === "all" ? "active" : ""} onClick={() => choosePerson("all")}>All movers <span>{events.length}</span></button>
          {(["trump", "musk", "altman"] as PersonId[]).map((id) => (
            <button key={id} className={person === id ? "active" : ""} onClick={() => choosePerson(id)}>
              <PersonMark person={id} size="sm" />
              <span className="tab-copy"><strong>{personMeta[id].short}</strong><small>{personMeta[id].summary.split(" · ")[0]}</small></span>
              <span>{events.filter((event) => event.person === id).length}</span>
            </button>
          ))}
        </div>

        <div className="explorer-toolbar">
          <label className="search-box">
            <Search size={16} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search statements or topics" />
          </label>
          <select value={asset} onChange={(event) => setAsset(event.target.value)} aria-label="Filter by asset">
            {assets.map((item) => <option key={item}>{item}</option>)}
          </select>
          <div className="segmented" aria-label="Sort events">
            <button className={sort === "reaction" ? "active" : ""} onClick={() => setSort("reaction")}>Reaction</button>
            <button className={sort === "recent" ? "active" : ""} onClick={() => setSort("recent")}>Recent</button>
          </div>
        </div>

        <div className="explorer-grid">
          <div className="event-list" aria-label="Market events">
            <div className="list-heading"><span>{filtered.length} evidence records</span><span>1D excess</span></div>
            {filtered.map((event) => (
              <button key={event.id} className={`event-row ${event.id === selected.id ? "selected" : ""}`} onClick={() => setSelectedId(event.id)}>
                <PersonMark person={event.person} size="sm" />
                <span className="event-copy">
                  <span className="row-meta"><strong>{event.personName}</strong><i>{event.topic}</i></span>
                  <span className="event-text">{event.text}</span>
                  <span className="row-foot">{formatDate(event.publishedAt)} · {event.asset} vs {event.benchmark}</span>
                </span>
                <span className="row-reaction"><MetricValue value={event.metrics.abnormalReturn1D} /><ChevronRight size={15} /></span>
              </button>
            ))}
            {!filtered.length && <div className="empty-state">No evidence records match these filters.</div>}
          </div>

          <article className="evidence-panel">
            <div className="evidence-head">
              <div className="evidence-person"><PersonMark person={selected.person} /><div><strong>{selected.personName}</strong><span>{selected.role} · {selected.platform}</span></div></div>
              <span className={`coverage-badge ${selected.coverage.toLowerCase()}`}>{selected.coverage} link</span>
            </div>
            <blockquote>“{selected.text}”</blockquote>
            <div className="source-line">
              <span><Clock3 size={14} /> {formatTime(selected.publishedAt)}</span>
              <a href={selected.sourceUrl} target="_blank" rel="noreferrer">View original <ExternalLink size={13} /></a>
            </div>

            <div className="metric-strip">
              <div><span>Abnormal return 1D</span><strong><MetricValue value={selected.metrics.abnormalReturn1D} /></strong><small>{selected.asset} − {selected.benchmark}</small></div>
              <div><span>Volume multiple</span><strong>{selected.metrics.volumeMultiple.toFixed(2)}×</strong><small>vs previous 20 sessions</small></div>
              <div><span>3D persistence</span><strong>{selected.metrics.persistence}</strong><small><MetricValue value={selected.metrics.cumulativeAbnormal3D} /> cumulative excess</small></div>
            </div>

            <div className="chart-head">
              <div><span>EVENT WINDOW</span><strong>Cumulative return from prior close</strong></div>
              <div className="asset-pair"><b>{selected.asset}</b><span>vs</span>{selected.benchmark}</div>
            </div>
            <div className="reaction-chart">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={selected.window} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
                  <CartesianGrid stroke="#e7e9e4" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" tickFormatter={(day) => (day === 0 ? "Event" : `D${day > 0 ? "+" : ""}${day}`)} tick={{ fill: "#7b8178", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(value) => `${value}%`} tick={{ fill: "#7b8178", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(value) => [`${Number(value).toFixed(2)}%`]} labelFormatter={(day) => (day === 0 ? "Event session" : `Trading day ${day}`)} />
                  <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11 }} />
                  <ReferenceLine y={0} stroke="#afb4ad" />
                  <ReferenceLine x={0} stroke="#8d958a" strokeDasharray="4 4" />
                  <Line name={selected.asset} type="monotone" dataKey="asset" stroke="#1d7651" strokeWidth={2.6} dot={{ r: 3, fill: "#1d7651" }} activeDot={{ r: 5 }} />
                  <Line name={selected.benchmark} type="monotone" dataKey="benchmark" stroke="#9ba29a" strokeWidth={2} dot={{ r: 2.5, fill: "#9ba29a" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="rationale"><Sparkles size={15} /><p><strong>Why this mapping?</strong>{selected.rationale}</p></div>
            <div className="engagement-row"><span>Source engagement</span><span>{formatCompact(selected.engagement.likes)} likes</span><span>{formatCompact(selected.engagement.reposts)} reposts</span>{selected.engagement.views !== null && <span>{formatCompact(selected.engagement.views)} views</span>}</div>
          </article>

          <aside className="live-panel">
            <div className="live-head">
              <div><span className="pulse" /><strong>LIVE SIGNAL</strong></div>
              <span>Daily refresh</span>
            </div>
            {latestSignal ? (
              <>
                <div className="live-person"><PersonMark person="trump" size="sm" /><div><strong>Donald Trump</strong><span>{formatTime(latestSignal.publishedAt)}</span></div></div>
                <p className="live-copy">“{latestSignal.text}”</p>
                <div className="live-tags"><span>{latestSignal.topic}</span><span>Public RSS</span></div>
                <div className="pending-box"><Clock3 size={16} /><div><strong>{latestSignal.state}</strong><span>Metrics lock after the aligned market session closes.</span></div></div>
                <a href={latestSignal.sourceUrl} target="_blank" rel="noreferrer" className="text-link">Open original statement <ExternalLink size={13} /></a>
              </>
            ) : <div className="empty-state">The current feed is temporarily unavailable.</div>}
            <div className="market-snapshot">
              <div className="aside-title"><span>MARKET SNAPSHOT</span><small>Latest cached close</small></div>
              {Object.entries(live.prices).map(([symbol, quote]) => (
                <div className="quote-row" key={symbol}><strong>{symbol}</strong><span>${quote.price.toFixed(2)}</span><small>{quote.asOf}</small></div>
              ))}
            </div>
            <div className="live-note"><ShieldCheck size={15} /> Association only. This signal is not a trade recommendation.</div>
          </aside>
        </div>
      </section>

      <section className="sources-section" id="sources">
        <div className="section-shell">
          <div className="section-heading light-heading">
            <div><span className="section-kicker">DATA SOURCES</span><h2>Freshness you can inspect</h2><p>Every layer exposes its provider, cadence, access model, and last successful sync.</p></div>
            <span className="as-of">As of {formatTime(live.fetchedAt)}</span>
          </div>
          <div className="source-table">
            <div className="source-table-head"><span>Dataset</span><span>Provider</span><span>Cadence</span><span>Access</span><span>Status</span></div>
            {live.sources.map((source) => (
              <div className="source-row" key={source.id}>
                <div><strong>{source.label}</strong><small>{source.note}</small></div>
                <span>{source.provider}</span><span>{source.cadence}</span>
                <span><i className={source.access === "Free" ? "free-badge" : "paid-badge"}>{source.access}</i></span>
                <div><SourceState state={source.state} /><small>{formatDate(source.lastSuccessAt)}</small></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="method-section section-shell" id="methodology">
        <div className="section-heading centered">
          <div><span className="section-kicker">METHODOLOGY</span><h2>Transparent by construction</h2><p>Three observable measurements. Clear alignment rules. No invented score.</p></div>
        </div>
        <div className="method-grid">
          <div className="method-card"><span>01</span><LineChartIcon size={22} /><h3>Align the session</h3><p>Statements after 4:00 PM ET, on weekends, or on market holidays move to the next trading session.</p></div>
          <div className="method-card"><span>02</span><BarChart3 size={22} /><h3>Measure the reaction</h3><p>We subtract the benchmark return, compare volume with the prior 20 sessions, and track three-day excess return.</p></div>
          <div className="method-card"><span>03</span><ShieldCheck size={22} /><h3>Preserve the caveat</h3><p>Results show temporal association—not causality, prediction, investment advice, or a hidden “impact score.”</p></div>
        </div>
        <div className="formula-bar"><span>ABNORMAL RETURN 1D</span><strong>Linked asset return</strong><i>−</i><strong>Benchmark return</strong><span className="formula-note">Benchmarks: QQQ or SPY</span></div>
      </section>

      <section className="difference-section">
        <div className="section-shell difference-grid">
          <div><span className="section-kicker">WHY MARKET MOVER</span><h2>From a person’s words<br />to inspectable evidence.</h2><p>Most products begin with a ticker, a social feed, or an institution-scale dataset. Market Mover begins with the source statement and keeps every analytical link visible.</p></div>
          <div className="evidence-path">
            <div><span>01</span><strong>Person</strong><small>Who said it?</small></div><ChevronRight />
            <div><span>02</span><strong>Original</strong><small>What exactly?</small></div><ChevronRight />
            <div><span>03</span><strong>Asset</strong><small>Why linked?</small></div><ChevronRight />
            <div><span>04</span><strong>Reaction</strong><small>Versus what?</small></div>
          </div>
        </div>
      </section>

      <section className="pricing-section section-shell" id="pricing">
        <div className="section-heading centered"><div><span className="section-kicker">PRICING</span><h2>Start with evidence. Scale the monitoring.</h2><p>Pay for faster research workflows—not trading calls.</p></div></div>
        <div className="pricing-grid">
          <div className="price-card"><span className="plan">FREE</span><div className="price"><strong>$0</strong><span>forever</span></div><p>Explore the core evidence library.</p><ul><li><Check />3 tracked people</li><li><Check />5 market assets</li><li><Check />Daily Trump refresh</li><li><Check />8 reviewed cases per person</li></ul><a href="#explorer">Explore free</a></div>
          <div className="price-card featured"><div className="popular">RESEARCHER FAVORITE</div><span className="plan">PRO</span><div className="price"><strong>$19</strong><span>/ month</span></div><p>Monitor the people and assets you care about.</p><ul><li><Check />Custom people and tickers</li><li><Check />Near-real-time paid connectors</li><li><Check />Alerts and saved reports</li><li><Check />CSV and PDF export</li></ul><a href="mailto:hello@marketmover.demo?subject=Market%20Mover%20Pro">Request access <ArrowUpRight size={15} /></a></div>
          <div className="price-card"><span className="plan">TEAM</span><div className="price"><strong>$99</strong><span>/ month</span></div><p>Build a shared research operation.</p><ul><li><Check />Shared watchlists</li><li><Check />Collaborative reports</li><li><Check />API access</li><li><Check />Managed data sources</li></ul><a href="mailto:hello@marketmover.demo?subject=Market%20Mover%20Team">Talk to us</a></div>
        </div>
      </section>

      <footer>
        <div className="footer-brand"><span className="brand-symbol"><TrendingUp size={17} /></span><div><strong>MARKET MOVER</strong><span>Evidence behind market reactions.</span></div></div>
        <p>For research and monitoring only. Not investment advice. Historical association does not establish causality.</p>
        <div><a href="#methodology">Methodology</a><a href="#sources">Sources</a><a href="mailto:hello@marketmover.demo"><Bell size={14} /> Access</a></div>
      </footer>
    </main>
  );
}
