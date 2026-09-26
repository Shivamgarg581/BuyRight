# BuyRight launch checklist

This branch is production-oriented and contains no illustrative local shop prices. The public app uses the dated official snapshot in `data/official-prices.json`; local observations remain empty until a real submission is verified.

## Before broad promotion

- [ ] Merge `production-rebuild` into `main`.
- [ ] Keep GitHub Pages enabled from the `main` branch root.
- [ ] Confirm the existing CNAME is intentional before launch.
- [ ] Run **Sync official prices** manually from GitHub Actions.
- [ ] Confirm the official dataset date changed/was revalidated successfully.
- [ ] Submit one real local observation through the public report form.
- [ ] Review the issue for privacy and factual quality.
- [ ] Add the `verified-price` label only after verification.
- [ ] Run **Build verified community prices** manually once.
- [ ] Confirm the verified observation appears on the site.
- [ ] Protect `main` with branch rules and required checks.
- [ ] Enable repository secret scanning and push protection where available.
- [ ] Add uptime monitoring before large-scale promotion.

## Important

GitHub Pages is a public static host. It is not the same security boundary as a full SaaS backend. The full security architecture supplied for BuyRight is documented in `SECURITY.md`; backend-only controls must be added before introducing private accounts, sensitive user data, payments, or privileged APIs.
