# Market Mover - Tracking Words That Move Markets

Market Signal Atlas is an evidence-first dashboard that follows public signals across markets, media, and public attention. It combines actual asset prices, scoped social evidence, and an inspectable six-stage research workflow without claiming causality or predicting the next move.

**Live demo:** [market-mover.vercel.app](https://market-mover.vercel.app)

**한국어 UI:** [market-mover.vercel.app/ko](https://market-mover.vercel.app/ko)

The core path is deliberately inspectable:

`public signal → source + ontology → media/social amplification → actual market reaction → confidence audit → report`

The product now separates the full source universe from the reviewed demo layer:

`145,442 raw rows → 32,393 eligible originals → 1,162 cluster representatives → 735 evidence-ready social signals + 9 reviewed cross-source signals`

## Demo scope

- Sources: Social posts, company newsrooms, SEC filings, and public hearings
- Core people: Donald Trump, Elon Musk, and Sam Altman
- Assets: SPY, QQQ, TSLA, NVDA, MSFT, BTC-USD, and SOXX
- Candidate universe: all 32,393 non-reply/non-repost Musk and Trump originals since 2023, searchable through a paginated server API
- Evidence universe: one representative per 1,162 cluster, with deterministic enrichment for every market-relevant cluster that has a valid price window
- Main Signal Atlas: currently 735 evidence-ready Trump/Musk signals plus seven news, one filing, and one hearing signal, without a fixed product cap
- Reviewed reference library: 33 retained source records, including seven official OpenAI/NVIDIA newsroom announcements
- Current signal: Trump public statements from an independent public RSS archive
- Market refresh: five daily prices through Twelve Data when configured
- Metrics: Abnormal Return 1D, Volume Multiple, and 3D Persistence
- Reaction lenses: actual daily closes, GDELT raw article counts when captured, tracked-source mentions, hashtags, and public engagement
- Market-first timeline: SPY, QQQ, or BTC-USD actual-close coverage with clickable Direct, Policy, and Proxy signal markers
- Multi-asset event comparison: linked asset plus SPY, QQQ, and BTC-USD indexed to the prior close, with actual closes retained in the tooltip
- Discovery controls: topic, mapping type, timestamp precision, reaction, volume, persistence, and recency
- Price window: actual daily closes from five sessions before through five sessions after each signal
- Evidence research desk: classifier, ontology mapper, amplification analyst, market analyst, confidence auditor, and bilingual report writer
- Locales: full English and Korean interfaces, with reviewed Korean summaries that preserve the original source text

Sam Altman has no directly listed company in this analysis. NVDA and MSFT are visibly labeled as AI proxy assets and use QQQ as the benchmark.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

To enable daily current-price refreshes, copy `.env.example` to `.env.local` and set:

```dotenv
TWELVE_DATA_API_KEY=your_key
CRON_SECRET=a_long_random_secret
```

No AI key is required for the evidence calculations. `/api/research` falls back to the six deterministic roles. To enable a model-assisted bilingual report, set `OPENAI_API_KEY`, `OPENAI_MODEL`, and `ENABLE_LIVE_AI=true` on the server; the model may rewrite only report text and cannot replace observed prices, news, hashtags, or deterministic metrics.

## Commands

```bash
npm run data:build  # Rebuild the reviewed JSON artifacts from local source CSVs
npm run catalog:build  # Rebuild all 32,393 candidate rows and rule-seeded clusters
npm run evidence:build  # Enrich every market-relevant cluster with a valid price window
npm run ai:batch:prepare  # Create one /v1/responses JSONL request per candidate
npm run ai:batch:submit  # Upload the JSONL and create a paid 24-hour Batch job
npm run ai:batch:sync  # Check status and download completed output
npm run ai:batch:import -- data/batch/completed-output.jsonl
npm run lint
npm run test
npm run build
```

## Data pipeline

Large source CSVs are intentionally excluded from Git and production. `scripts/build-events.mjs` builds reviewed cross-source cases. `scripts/build-signal-catalog.mjs` ingests every eligible original from the complete local Musk and Trump corpora. `scripts/build-evidence-universe.mjs` selects one representative per cluster and adds build-time Yahoo price, volume, volatility, and tracked-corpus attention evidence to every market-relevant representative with a valid price window. The browser receives only requested catalog pages rather than the full source catalog.

- Musk history: local `all_musk_posts.csv`
- Trump history: local `Kaggle_Trump_2009_2025.csv`
- Sam Altman cases: reviewed records derived from the [SuperX 2026 Top 50](https://superx.so/tweets/sam-altman)
- Cross-source cases: original OpenAI/NVIDIA announcements, a Tesla SEC filing, and a U.S. Senate AI hearing
- Main Atlas source mix: 735 social signals, seven news signals, one filing, and one hearing
- News evidence: on-demand Google News RSS search, then GDELT DOC 2.0, then the reviewed GDELT snapshot; returned-item caps and source state remain visible
- Public-attention evidence: on-demand Bluesky public-search samples, then the tracked Musk/Trump corpus snapshot; it is never labeled as X-wide or platform-wide volume
- Current Trump statements: independent [Trump's Truth public RSS archive](https://www.trumpstruth.org/about)
- Current prices: [Twelve Data Basic](https://twelvedata.com/pricing)
- Paid roadmap: official [X Search API](https://docs.x.com/x-api/posts/search/introduction)

The current corpus boundary is explicit: the uncapped Atlas uses complete local Musk and Trump history plus verified OpenAI/NVIDIA newsroom records. Sam Altman remains only in retained reviewed reference data because no complete local source corpus is available.

## Full-corpus evidence orchestration

Running deep analysis independently for every source row would repeat near-identical work. The implemented router keeps the full corpus searchable while making the evidence workload operable without a paid API:

1. Deterministic eligibility rules ingest every original and preserve its source URL.
2. Rules create topics, assets, and time-bucket clusters, then select the highest-evidence representative of each cluster.
3. Every market-relevant representative with a valid price window receives actual price, volume, volatility, tracked mentions, and linked-media-reference evidence at build time.
4. Six deterministic roles classify, map, inspect amplification, calculate market reaction, audit confidence, and render a bilingual report.
5. Public news and Bluesky context are collected on demand and cached daily; source failure falls back to a reviewed snapshot rather than a generated value.
6. Optional OpenAI Responses API report editing is server-side and visibly labeled `openai`; Batch scripts remain a separate bulk-classification path.

Original statement URLs are preserved in every event record. The independent Trump archive is suitable for this free demo; a commercial version should use a licensed official feed and review market-data display rights.

## Methodology

If a statement is published after 4:00 PM Eastern, on a weekend, or on a market holiday, the next trading session becomes the event session.

- **Abnormal Return 1D** = linked asset one-day return − benchmark one-day return
- **Volume Multiple** = event-session volume ÷ average volume over the previous 20 sessions
- **3D Persistence** = cumulative three-session excess return, labeled Persisted, Faded, or Reversed

Every event carries its related assets plus the common market context `SPY`, `QQQ`, and `BTC-USD`. The chart shows one selected asset's actual close at a time. It marks the aligned trading session and prints the original Eastern publication time and whether it was pre-market, in-session, after-hours, or on a non-trading day. An exact intraday price is not claimed without minute data.

The News lens displays daily counts from the returned public-news results. The Public Attention lens displays returned Bluesky posts and hashtag occurrences from a capped sample. If either request fails, the UI identifies the tracked-corpus or reviewed-GDELT fallback.

## API and scheduled refresh

- `GET /api/live` returns the latest Trump signals, five-symbol snapshot, and source freshness.
- `GET /api/signals` searches and paginates all originals, cluster representatives, or the evidence-ready layer.
- `POST /api/research` runs deterministic evidence roles and optionally uses the server-side OpenAI Responses API to edit the bilingual report when explicitly enabled.
- `GET /api/cron/refresh` requires `Authorization: Bearer $CRON_SECRET` and refreshes the upstream caches.
- `vercel.json` schedules the refresh for `23:00 UTC` once daily, compatible with Vercel Hobby limits.

External-provider failures and quota exhaustion fall back to the bundled snapshot. The UI reports `Stale` rather than presenting cached data as current.

## Product positioning

Stocktwits is community-sentiment oriented, Quiver Quantitative aggregates ticker-centric alternative datasets, and RavenPack offers institution-scale event infrastructure. Market Signal Atlas focuses on an inspectable cross-domain evidence path and confidence audit for each public signal.

The demo includes pricing concepts only. It does not implement accounts, payments, databases, or free real-time X ingestion. Model-assisted reports are conditional; evidence calculations remain deterministic.

## Deploy to Vercel

1. Import this GitHub repository in Vercel.
2. Add `TWELVE_DATA_API_KEY` and `CRON_SECRET` for daily current-data refreshes. For shared model-assisted reports, add `OPENAI_API_KEY`, `OPENAI_MODEL=gpt-5.4-nano`, and `ENABLE_LIVE_AI=true` to the Vercel Production environment. Never use a `NEXT_PUBLIC_` prefix for the secret.
3. Deploy. The Next.js preset and cron configuration are detected automatically.

## Disclaimer

For research and monitoring only. Not investment advice. Historical association does not establish causality or predict future performance.
