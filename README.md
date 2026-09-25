# BuyRight — Price Intelligence Platform

BuyRight helps people avoid overpaying by turning a seller quote into a buying decision:

- Check whether a price is below, around, or above a reference.
- Normalize different pack sizes into a common unit.
- Compare products and market context.
- Build a basket and compare estimated totals.
- Check MRP vs charged price for applicable packaged goods.
- Check receipt arithmetic.
- Check shrinkflation using old/current pack size and price.
- Add hidden delivery/platform/other costs.
- Save price alerts in the browser.
- View product trend history and data-source context.

## Current deployment

This repository is framework-free and works as a GitHub Pages site. The main experience is in index.html.

The current site contains a clearly labeled 24 Sep 2026 snapshot of official Department of Consumer Affairs prices for monitored commodities. Local market values shown in the demo are illustrative model values and must not be presented as live shop quotes.

## Production data architecture

Use three data classes:

1. Official consumer-price reference: Department of Consumer Affairs Price Monitoring System.
2. Agricultural market reference: e-NAM / AGMARKNET for mandi/market context.
3. Local observations: shop/user reports with timestamp, market, quantity, unit, source and verification state.

Never merge these into one unlabeled number.

## GitHub Pages

1. Push changes to main.
2. GitHub → Settings → Pages.
3. Select deployment from main and /root.
4. Keep CNAME when a custom domain is used.

## Safety / trust rules

- Retail and wholesale values must be labeled separately.
- Normalize quantity before comparison.
- Preserve source + timestamp.
- Mark user reports separately from official data.
- Do not call an estimated local value a live quote.
- Do not infer a legal violation from price alone; link the applicable official rule/channel.

## Next production layer

Add Supabase (or another backend) for users, products, markets, price records, local submissions, verification/moderation, statistics, alerts and audit logs.

Then replace the demo data snapshot with a controlled data pipeline and keep the same UI contracts.

## Advanced zero-cost layer

The current front end is static and GitHub-Pages compatible. It includes:

- Local AI-style intent routing for price, pack, basket and MRP questions; no paid AI key in the browser.
- Locale-aware currency formatting with an optional daily FX lookup through Frankfurter; cached fallback keeps the UI usable offline.
- Optional on-demand Open Food Facts barcode/product metadata lookup; no price is inferred from product metadata.
- PWA manifest + service worker for resilient offline shell caching.
- Runtime error/rejection recovery, network timeouts, cached fallbacks and reduced-motion support.
- CSS/JS animation layer: reveal motion, particles, pointer glow, responsive transitions and interaction feedback.
- Multilingual shell: English, Hindi, Spanish, French, German, Arabic, Bengali and Portuguese.
- Multi-currency shell: INR, USD, EUR, GBP, AED, JPY, CAD, AUD, CHF, CNY, SGD, BDT, BRL and ZAR.
- No affiliate placements, promoted products or seller-ranking incentives in the current UI.

## Live data principle

The price engine must keep **official reference prices**, **wholesale/mandi context**, and **local/community observations** as separate source classes. Local prices should only be labeled live when they come from a timestamped, verified observation or an approved feed.

## Free / zero-budget choices

GitHub Pages is the hosting layer. Static app assets require no server bill. Frankfurter exposes exchange-rate data without an API key, and Open Food Facts provides product metadata by barcode, with documented read limits. These are optional features and have timeouts/fallbacks. No paid dependency is required for the core price tools.
