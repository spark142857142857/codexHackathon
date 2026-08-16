# Market Mover build log

## Product decisions

- Reduced the initial five-person concept to three distinct influence types: policy (Trump), founder (Musk), and industry narrative (Altman).
- Removed the proposed Impact Score. The demo exposes abnormal return, relative volume, and three-day persistence directly.
- Kept live free ingestion narrow: current Trump RSS plus five daily market prices. Live Musk and Altman tracking is presented as a paid X connector roadmap.
- Positioned the product around faster monitoring and research rather than investment recommendations.

## Data decisions

- Preserved 28 human-reviewed cases as an explainable showcase layer while moving the full eligible source corpus into a separate searchable catalog.
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

## Signal Atlas pivot

- Reframed the product from personality-led “Market Mover” rankings to policy, executive, and industry signal exploration.
- Replaced the normalized comparison chart with each linked asset's real D-5 through D+5 closing prices and an explicit signal-session marker.
- Retained abnormal return, volume, and persistence as transparent context rather than restoring an opaque impact score.
- Added signal-type comparison and public engagement as an attention evidence layer.
- Added a dedicated `/ko` interface and reviewed Korean summaries while preserving every English original and source URL.

## Cross-domain reaction and orchestration pivot

- Split signal source (`Social`, `News`, `Filing`, `Hearing`) from thematic category (`Policy`, `Executive`, `Industry`).
- Added four reviewed cross-source signals with original OpenAI, NVIDIA, SEC EDGAR, and U.S. Senate links.
- Added Market, News, Public Attention, and combined reaction lenses. Price remains the actual D-5 through D+5 close; GDELT values remain raw article counts.
- Stored GDELT `TimelineVolRaw` snapshots with the exact query and left unavailable histories empty instead of estimating them.
- Scoped social mention and hashtag counts to the tracked Musk/Trump corpora and exposed that limitation in the UI.
- Implemented a six-stage research desk: classifier, ontology mapper, amplification analyst, deterministic market analyst, confidence auditor, and bilingual report writer.
- Added `POST /api/research`. It uses reviewed reports by default and can run live OpenAI orchestration only when explicitly enabled with server-side environment variables.

## Full-corpus orchestration redesign

- Ingested all 145,442 rows from the two complete local source files and retained every eligible original since 2023: 23,357 Trump posts and 9,036 Musk posts.
- Removed the former per-person and total-event ceilings from the ingestion layer. The 28 reviewed records now remain only as evidence-rich demonstrations.
- Added deterministic eligibility, preliminary topic mapping, exact-duplicate detection, and time/topic seed clustering for all 32,393 candidates.
- Added a server-paginated `GET /api/signals` catalog so the full generated dataset stays on the server rather than entering the client bundle.
- Added an OpenAI Batch JSONL preparation/import workflow. No AI-complete label appears until an actual result has been imported.
- Added key-gated Batch upload, creation, status, and result-download scripts; they are implemented but intentionally not executed without billing credentials.
- Routed deeper amplification, market, audit, and report work conditionally at the cluster level; missing news or platform-wide social coverage remains explicitly unavailable.
- Added a bilingual Signal Universe UI with corpus counts, orchestration stages, search, filters, pagination, and the Sam Altman corpus limitation.

## API-free evidence orchestration

- Replaced the public live-model path with six deterministic roles that run from observed source, mapping, attention, and market fields.
- Added one representative per cluster and an evidence-ready layer, preserving all 32,393 originals for search while preventing repeated deep analysis.
- Added committed build-time evidence for BTC-USD and SOXX alongside SPY, QQQ, TSLA, NVDA, and MSFT.
- Added actual D-5 through D+5 closes, abnormal return, volume multiple, volatility multiple, persistence, tracked-corpus mentions, and linked-media references to the priority layer.
- Renamed the visible workflow to Evidence Research and positioned it as AI-ready conditional orchestration rather than completed AI analysis.
- Added an explicit latest-signal `Pending` state so an RSS arrival is never shown as a confirmed market reaction.
- Removed the temporary 200-signal cap. The current build produces 735 eligible social signals plus seven news, one filing, and one hearing signal; future builds grow automatically with valid data.

## Evidence collection and asset-context correction

- Added on-demand Google News RSS search with GDELT DOC as a secondary provider and the reviewed snapshot as the final fallback. Counts and headlines now come from returned articles rather than UI-only labels.
- Added unauthenticated Bluesky public-search sampling for related posts and hashtag occurrences, with the tracked local corpus as an explicitly labeled fallback. This is a public sample, not an X-wide mention count.
- Added `SPY`, `QQQ`, and `BTC-USD` to every signal as common market context while keeping directly related and proxy assets distinct.
- Added per-asset actual-close windows and an asset switcher. The UI prints the original Eastern publication time and market phase, but does not claim an exact intraday price from daily data.
- Fixed the Atlas composer so reviewed filing and hearing signals are no longer discarded by a news-only filter.
- Removed the access-request CTA and replaced decorative AI styling with a quieter evidence-research visual system.
- Added an optional server-only OpenAI Responses API path for bilingual report editing. Deterministic calculations remain the source of truth and are used whenever the feature is disabled, missing a key, or fails.

## Market-first discovery pass

- Added an actual-close market timeline reconstructed from the committed signal price windows, with clickable Direct, Policy, and Proxy markers that open the corresponding evidence record.
- Added a prior-close-indexed multi-asset comparison for every event while preserving the single-asset actual-close view and exact publication-time/session annotation.
- Added topic, mapping, and exact-time filters plus transparent sorting by 1D excess reaction, volume multiple, 3D persistence, or recency.
- Moved the full Signal Universe below the core market timeline and event explorer so the first workflow answers the product question before exposing the data pipeline.
- Kept BTC-USD explicitly labeled as equity-session-sampled context rather than claiming a complete 24/7 intraday series.

## First-visit UI hierarchy pass

- Synchronized the initially selected event and every filtered/sorted fallback with the visible evidence panel, while preserving an explicit user selection when it remains in scope.
- Promoted the working market timeline to the first navigation item, renamed the former summary-card comparison section to Insights, and rewrote the hero around the market-first task.
- Made the indexed multi-asset reaction the default event chart, increased the chart height, and collapsed the deterministic six-stage process behind a concise Evidence Review summary.
- Removed the duplicate desktop sidebar, strengthened selected-event labeling, localized the pending Trump state, and added single-column mobile ordering, touch targets, overflow protection, and readable core text sizes.
