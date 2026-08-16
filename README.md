# Market Signal Atlas

Market Signal Atlas is an evidence-first dashboard that follows reviewed public signals across markets, media, and public attention. It combines actual asset prices, raw news-publication counts, scoped social evidence, and an inspectable AI research workflow without claiming causality or predicting the next move.

**Live demo:** [market-mover.vercel.app](https://market-mover.vercel.app)

**한국어 UI:** [market-mover.vercel.app/ko](https://market-mover.vercel.app/ko)

The core path is deliberately inspectable:

`public signal → source + ontology → media/social amplification → actual market reaction → confidence audit → report`

The product now separates the full source universe from the reviewed demo layer:

`145,442 raw rows → 32,393 eligible originals → rules / AI Batch → 1,117 seed clusters → conditional evidence agents → 28 reviewed showcases`

## Demo scope

- Sources: Social posts, company newsrooms, SEC filings, and public hearings
- Core people: Donald Trump, Elon Musk, and Sam Altman
- Assets: SPY, QQQ, TSLA, NVDA, and MSFT
- Candidate universe: all 32,393 non-reply/non-repost Musk and Trump originals since 2023, searchable through a paginated server API
- Evidence library: 28 human-reviewed showcases, including 24 person-led social cases and four cross-source cases
- Current signal: Trump public statements from an independent public RSS archive
- Market refresh: five daily prices through Twelve Data when configured
- Metrics: Abnormal Return 1D, Volume Multiple, and 3D Persistence
- Reaction lenses: actual daily closes, GDELT raw article counts when captured, tracked-source mentions, hashtags, and public engagement
- Price window: actual daily closes from five sessions before through five sessions after each signal
- AI research desk: classifier, ontology mapper, amplification analyst, deterministic market analyst, confidence auditor, and bilingual report writer
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
OPENAI_API_KEY=your_key
OPENAI_MODEL=gpt-5.4-nano
ENABLE_LIVE_AI=true
```

The app remains usable without an OpenAI key: `/api/research` returns the bundled reviewed evidence report. Live AI orchestration runs only when both `OPENAI_API_KEY` and `ENABLE_LIVE_AI=true` are set.

The public deployment does **not** claim that the full corpus has already been AI-classified. Until a completed Batch output is imported, catalog rows are visibly marked `Rules preclassified`, `Needs AI`, or `Reviewed`.

## Commands

```bash
npm run data:build  # Rebuild the reviewed JSON artifacts from local source CSVs
npm run catalog:build  # Rebuild all 32,393 candidate rows and rule-seeded clusters
npm run ai:batch:prepare  # Create one /v1/responses JSONL request per candidate
npm run ai:batch:import -- data/batch/completed-output.jsonl
npm run lint
npm run test
npm run build
```

## Data pipeline

Large source CSVs are intentionally excluded from Git and production. `scripts/build-events.mjs` builds the reviewed market-reaction cases. `scripts/build-signal-catalog.mjs` ingests every eligible original from the complete local Musk and Trump corpora and emits a deployable, server-only catalog under `data/generated/`. The browser receives only the requested page, never the full 20 MB catalog.

- Musk history: local `all_musk_posts.csv`
- Trump history: local `Kaggle_Trump_2009_2025.csv`
- Sam Altman cases: reviewed records derived from the [SuperX 2026 Top 50](https://superx.so/tweets/sam-altman)
- Cross-source cases: original OpenAI/NVIDIA announcements, a Tesla SEC filing, and a U.S. Senate AI hearing
- News-volume snapshots: GDELT DOC 2.0 `TimelineVolRaw`; each stored case preserves its query and raw daily article counts
- Public-attention scope: mentions and hashtags cover only the tracked Musk/Trump source corpora and are never labeled as platform-wide counts
- Current Trump statements: independent [Trump's Truth public RSS archive](https://www.trumpstruth.org/about)
- Current prices: [Twelve Data Basic](https://twelvedata.com/pricing)
- Paid roadmap: official [X Search API](https://docs.x.com/x-api/posts/search/introduction)

The current corpus boundary is explicit: complete local history is available for Musk and Trump, while Sam Altman remains limited to eight reviewed cases because no complete local source corpus is available.

## Full-corpus AI orchestration

Running six agents independently for every source row would create hundreds of thousands of synchronous model calls. The implemented router keeps the same analytical intent while making the workload operable:

1. Deterministic eligibility rules ingest every original and preserve its source URL.
2. Cheap rules create preliminary topics, assets, and time-bucket clusters without pretending to be AI.
3. `ai:batch:prepare` writes 32,393 unique `/v1/responses` requests to a generated JSONL transport file.
4. A completed Batch output is imported into `data/ai-classifications.source.json`, then `catalog:build` merges the AI decisions.
5. Only relevant clusters advance to news/social amplification, market calculation, confidence audit, and reporting.

OpenAI documents Batch as an asynchronous fit for large-dataset classification, with separate rate limits, lower cost, and a 24-hour completion window: [Batch API guide](https://developers.openai.com/api/docs/guides/batch). Batch input/output JSONL files are reproducible transport artifacts and remain outside Git; the compact merged catalog and classification source are committed.

Original statement URLs are preserved in every event record. The independent Trump archive is suitable for this free demo; a commercial version should use a licensed official feed and review market-data display rights.

## Methodology

If a statement is published after 4:00 PM Eastern, on a weekend, or on a market holiday, the next trading session becomes the event session.

- **Abnormal Return 1D** = linked asset one-day return − benchmark one-day return
- **Volume Multiple** = event-session volume ÷ average volume over the previous 20 sessions
- **3D Persistence** = cumulative three-session excess return, labeled Persisted, Faded, or Reversed

The main event chart shows the linked asset's actual close and marks the aligned signal session. Benchmark-adjusted returns remain visible as comparison context. The dashboard shows temporal association only; it does not establish causality, generate buy/sell recommendations, or compress evidence into an opaque impact score.

The News lens displays raw GDELT article counts only for captured historical windows. Missing news history stays empty. The Public Attention lens reports tracked-corpus mentions, observed hashtags, and source engagement with its coverage limitation visible next to the chart.

## API and scheduled refresh

- `GET /api/live` returns the latest Trump signals, five-symbol snapshot, and source freshness.
- `GET /api/signals` searches and paginates the full candidate universe with entity, topic, and classification-stage filters.
- `POST /api/research` orchestrates the research roles when live AI is enabled and otherwise returns the reviewed snapshot for the selected signal.
- `GET /api/cron/refresh` requires `Authorization: Bearer $CRON_SECRET` and refreshes the upstream caches.
- `vercel.json` schedules the refresh for `23:00 UTC` once daily, compatible with Vercel Hobby limits.

External-provider failures and quota exhaustion fall back to the bundled snapshot. The UI reports `Stale` rather than presenting cached data as current.

## Product positioning

Stocktwits is community-sentiment oriented, Quiver Quantitative aggregates ticker-centric alternative datasets, and RavenPack offers institution-scale event infrastructure. Market Signal Atlas focuses on an inspectable cross-domain evidence path and confidence audit for each public signal.

The demo includes pricing concepts only. It does not implement accounts, payments, databases, or free real-time X ingestion. Live AI is optional; the public demo remains deterministic without a key.

## Deploy to Vercel

1. Import this GitHub repository in Vercel.
2. Add `TWELVE_DATA_API_KEY` and `CRON_SECRET`. Optionally add `OPENAI_API_KEY`, `OPENAI_MODEL`, and `ENABLE_LIVE_AI=true` for live orchestration.
3. Deploy. The Next.js preset and cron configuration are detected automatically.

## Disclaimer

For research and monitoring only. Not investment advice. Historical association does not establish causality or predict future performance.
