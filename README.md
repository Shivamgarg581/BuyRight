# BuyRight — evidence-aware price intelligence

BuyRight is a GitHub Pages product for checking everyday prices, comparing true unit costs, understanding local evidence and preserving uncertainty instead of inventing shop quotes.

## Launch data

The shipped official snapshot is a dated 25 September 2026 Department of Consumer Affairs Price Monitoring System observation. The site displays the source and date next to the figures. It is a reference layer, not a claim about one particular shop.

Local market prices are not hard-coded. Community observations enter through a structured public GitHub Issue, remain in a review queue, and only appear on the site after a maintainer applies the verified-price label. The hourly workflow exports only those verified issues.

Agricultural mandi context can be extended with e-NAM / AGMARKNET without collapsing those observations into the official retail layer.

## Product capabilities

- Official grocery/essential price references
- Search across official products and verified local products
- Entered-price checking from queries such as sugar 50
- Deterministic true-unit-price comparison for kg, g, litre, ml and piece
- Reference basket calculator
- Market/price coverage view
- Historical snapshot charting
- Price-change pulse and a data-backed surprise finder
- MRP comparison tool
- Hidden-cost calculator
- Receipt arithmetic checker
- Shrinkflation/effective-unit-price checker
- Community price-report workflow with human verification
- Source/date/uncertainty visibility
- Offline shell via service worker with last-known dataset fallback
- No third-party runtime dependency in the public page

## GitHub architecture

main is the launch branch.

- GitHub Pages: public frontend
- index.html: complete application
- data/official-prices.json: official source snapshot
- data/community-prices.json: verified local observations only
- data/price-history.json: dated official history
- .github/workflows/sync-official-prices.yml: daily official sync
- .github/workflows/sync-community.yml: hourly verified-community export
- scripts/sync_official.py: fail-closed source parser
- .github/ISSUE_TEMPLATE/price-report.yml: structured local observation intake
- sw.js: resilient offline cache

No browser-side secret is required.

## Trust rules

Official, community, derived and future AI-generated information are separate classes. The application does not label an estimate as a live shop quote. Missing evidence is displayed as unknown.

All price calculations in the browser are deterministic. AI is not required for arithmetic, normalization or critical data decisions.

## Security boundary

The supplied security brief is treated as the architecture baseline: defense in depth, least privilege, data provenance, poisoned-data resistance, privacy minimization, abuse controls, disaster recovery, observability and secure CI/CD. SECURITY.md maps the static launch to that baseline and identifies controls that require a backend before private accounts, payments or privileged APIs are introduced.

## Run locally

Because the app is static, a local HTTP server is enough:

python -m http.server 8080

Then open http://localhost:8080.

## Launch

1. Merge production-rebuild into main.
2. Keep GitHub Pages configured for main + repository root.
3. Confirm the custom CNAME is intentional.
4. Run both Actions workflows manually once.
5. Submit and verify a real local price observation.
6. Protect main and enable repository security features.

See LAUNCH_CHECKLIST.md for the release gate.
