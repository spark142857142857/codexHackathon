# Market Mover - Tracking Words That Move Markets

Market Signal Atlas is an evidence-first dashboard that follows public signals across markets, media, and public attention. It combines actual asset prices, scoped social evidence, and an inspectable six-stage research workflow without claiming causality or predicting the next move.

**Live demo:** [market-mover.vercel.app](https://market-mover.vercel.app)

**한국어 UI:** [market-mover.vercel.app/ko](https://market-mover.vercel.app/ko)

The core path is deliberately inspectable:

`public signal → source + ontology → media/social amplification → actual market reaction → confidence audit → report`

The product now separates the full source universe from the reviewed demo layer:

`145,442 raw rows → 32,393 eligible originals → 1,162 cluster representatives → 735 evidence-ready social signals + 7 verified newsroom signals`

## Demo scope

- Sources: Social posts, company newsrooms, SEC filings, and public hearings
- Core people: Donald Trump, Elon Musk, and Sam Altman
- Assets: SPY, QQQ, TSLA, NVDA, MSFT, BTC-USD, and SOXX
- Candidate universe: all 32,393 non-reply/non-repost Musk and Trump originals since 2023, searchable through a paginated server API
- Evidence universe: one representative per 1,162 cluster, with deterministic enrichment for every market-relevant cluster that has a valid price window
- Main Signal Atlas: currently 735 evidence-ready Trump/Musk signals plus seven verified newsroom announcements, without a fixed product cap
- Reviewed reference library: 33 retained source records, including seven official OpenAI/NVIDIA newsroom announcements
- Current signal: Trump public statements from an independent public RSS archive
- Market refresh: five daily prices through Twelve Data when configured
- Metrics: Abnormal Return 1D, Volume Multiple, and 3D Persistence
- Reaction lenses: actual daily closes, GDELT raw article counts when captured, tracked-source mentions, hashtags, and public engagement
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

No AI key is required. `/api/research` runs the six roles deterministically from observed fields. The architecture is AI-ready for a future licensed connector or optional model-assisted classification, but the public deployment does not claim that generative AI completed the analysis.

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
- Main Atlas source mix: 193 social signals and seven official newsroom announcements
- News-volume snapshots: GDELT DOC 2.0 `TimelineVolRaw`; each stored case preserves its query and raw daily article counts
- Public-attention scope: mentions and hashtags cover only the tracked Musk/Trump source corpora and are never labeled as platform-wide counts
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
5. Missing global news or social coverage stays explicitly unavailable; recent RSS signals stay `Pending` until a market session is observable.
6. Optional Batch scripts remain a future AI-assisted classification path, not a dependency or a completed capability of the public demo.

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
- `GET /api/signals` searches and paginates all originals, cluster representatives, or the evidence-ready layer.
- `POST /api/research` runs the six deterministic evidence roles for a selected reviewed signal without an AI key.
- `GET /api/cron/refresh` requires `Authorization: Bearer $CRON_SECRET` and refreshes the upstream caches.
- `vercel.json` schedules the refresh for `23:00 UTC` once daily, compatible with Vercel Hobby limits.

External-provider failures and quota exhaustion fall back to the bundled snapshot. The UI reports `Stale` rather than presenting cached data as current.

## Product positioning

Stocktwits is community-sentiment oriented, Quiver Quantitative aggregates ticker-centric alternative datasets, and RavenPack offers institution-scale event infrastructure. Market Signal Atlas focuses on an inspectable cross-domain evidence path and confidence audit for each public signal.

The demo includes pricing concepts only. It does not implement accounts, payments, databases, or free real-time X ingestion. The public demo is deterministic; AI is a conditional future extension.

## Deploy to Vercel

1. Import this GitHub repository in Vercel.
2. Add `TWELVE_DATA_API_KEY` and `CRON_SECRET` for daily current-data refreshes. The bundled static evidence works without either value.
3. Deploy. The Next.js preset and cron configuration are detected automatically.

## Disclaimer

For research and monitoring only. Not investment advice. Historical association does not establish causality or predict future performance.
