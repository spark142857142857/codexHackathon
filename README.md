# Market Mover

Market Mover is an evidence-first dashboard that connects influential public statements to observable, benchmark-adjusted market reactions. It is a hackathon demo for individual investors and independent researchers—not a prediction product or investment adviser.

**Live demo:** [market-mover.vercel.app](https://market-mover.vercel.app)

The core path is deliberately inspectable:

`person → original statement → linked asset → benchmark-adjusted reaction`

## Demo scope

- People: Donald Trump, Elon Musk, and Sam Altman
- Assets: SPY, QQQ, TSLA, NVDA, and MSFT
- Evidence library: 24 reviewed events, eight per person
- Current signal: Trump public statements from an independent public RSS archive
- Market refresh: five daily prices through Twelve Data when configured
- Metrics: Abnormal Return 1D, Volume Multiple, and 3D Persistence

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

The app remains usable without an API key by returning the bundled build-time snapshot and visibly marking it as stale.

## Commands

```bash
npm run data:build  # Rebuild the reviewed JSON artifacts from local source CSVs
npm run lint
npm run test
npm run build
```

## Data pipeline

Large source CSVs are intentionally excluded from Git and production. `scripts/build-events.mjs` selects reviewed market-related originals, aligns them to trading sessions, downloads daily market history, and emits small JSON files under `data/generated/`.

- Musk history: local `all_musk_posts.csv`
- Trump history: local `Kaggle_Trump_2009_2025.csv`
- Sam Altman cases: reviewed records derived from the [SuperX 2026 Top 50](https://superx.so/tweets/sam-altman)
- Current Trump statements: independent [Trump's Truth public RSS archive](https://www.trumpstruth.org/about)
- Current prices: [Twelve Data Basic](https://twelvedata.com/pricing)
- Paid roadmap: official [X Search API](https://docs.x.com/x-api/posts/search/introduction)

Original statement URLs are preserved in every event record. The independent Trump archive is suitable for this free demo; a commercial version should use a licensed official feed and review market-data display rights.

## Methodology

If a statement is published after 4:00 PM Eastern, on a weekend, or on a market holiday, the next trading session becomes the event session.

- **Abnormal Return 1D** = linked asset one-day return − benchmark one-day return
- **Volume Multiple** = event-session volume ÷ average volume over the previous 20 sessions
- **3D Persistence** = cumulative three-session excess return, labeled Persisted, Faded, or Reversed

The dashboard shows temporal association only. It does not establish causality, generate buy/sell recommendations, or compress evidence into an opaque impact score.

## API and scheduled refresh

- `GET /api/live` returns the latest Trump signals, five-symbol snapshot, and source freshness.
- `GET /api/cron/refresh` requires `Authorization: Bearer $CRON_SECRET` and refreshes the upstream caches.
- `vercel.json` schedules the refresh for `23:00 UTC` once daily, compatible with Vercel Hobby limits.

External-provider failures and quota exhaustion fall back to the bundled snapshot. The UI reports `Stale` rather than presenting cached data as current.

## Product positioning

Stocktwits is community-sentiment oriented, Quiver Quantitative aggregates ticker-centric alternative datasets, and RavenPack offers institution-scale event infrastructure. Market Mover focuses on a narrower evidence chain and comparison between policy, founder, and narrative influence.

The demo includes pricing concepts only. It does not implement accounts, payments, databases, runtime AI, or free real-time X ingestion.

## Deploy to Vercel

1. Import this GitHub repository in Vercel.
2. Add `TWELVE_DATA_API_KEY` and `CRON_SECRET` to Production environment variables.
3. Deploy. The Next.js preset and cron configuration are detected automatically.

## Disclaimer

For research and monitoring only. Not investment advice. Historical association does not establish causality or predict future performance.
