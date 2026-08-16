# Market Mover build log

## Product decisions

- Reduced the initial five-person concept to three distinct influence types: policy (Trump), founder (Musk), and industry narrative (Altman).
- Removed the proposed Impact Score. The demo exposes abnormal return, relative volume, and three-day persistence directly.
- Kept live free ingestion narrow: current Trump RSS plus five daily market prices. Live Musk and Altman tracking is presented as a paid X connector roadmap.
- Positioned the product around faster monitoring and research rather than investment recommendations.

## Data decisions

- Selected eight non-repost, market-related historical cases per person rather than shipping large undifferentiated datasets.
- Preserved the original public-statement URL for every evidence record.
- Used TSLA as Musk's direct linked asset and NVDA/MSFT as visibly labeled Altman AI proxies.
- Aligned after-hours and non-trading-day statements to the next available market session.
- Generated deployable JSON artifacts while excluding the raw CSVs from Git.

## Reliability decisions

- Kept external API keys on the server in Route Handlers.
- Added an authenticated daily cron endpoint.
- Bundled a build-time snapshot so provider failure, missing credentials, or quota exhaustion cannot break the demo.
- Reported fallback data as stale in the UI.
- Added unit checks for calculations, event counts, unique IDs, source URLs, and proxy labels.

## Codex contribution

Codex was used to inspect the source datasets, define the product boundary, implement the Next.js application and data pipeline, connect public/server-side data sources, add verification, and document deployment and methodological limitations. Human judgment remains explicit in event selection, topic mapping, and linked-asset rationale.

