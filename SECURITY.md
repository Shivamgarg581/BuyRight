# BuyRight security, privacy, reliability and resilience

This launch follows the supplied BuyRight security architecture as a design baseline. The static GitHub Pages release intentionally keeps its trust boundary small and fails closed when verified data is unavailable.

## Implemented in the launch

- Browser code contains no private API keys, database credentials or service credentials.
- A Content Security Policy meta policy restricts scripts, connections and forms to the intended origins.
- Official observations, verified community observations and derived analysis are separate data classes.
- External official-source ingestion is validated and fails closed when the source date or record count is unexpected.
- Community price reports enter a public GitHub review queue and are exported only after a maintainer applies `verified-price`.
- User reports are explicitly warned not to include private information.
- The app never fabricates a local quote when evidence is missing.
- Historical source snapshots are versioned in Git so corrections remain auditable through repository history.
- The browser can continue serving the last committed dataset when a live upstream source is unavailable.
- Deterministic arithmetic handles unit conversion, basket totals and comparison; AI is not a source of truth.

## Architecture retained for future backend work

The supplied brief calls for defense in depth across browser/client security, identity, authentication, authorization, API security, application security, database security, data security, AI security, ingestion, infrastructure, deployment, dependencies, monitoring, abuse prevention, privacy, disaster recovery, incident response, business continuity, developer security and administrative security.

The next backend phase must add the controls that GitHub Pages cannot provide: server-side authorization, short-lived sessions, passkeys/MFA, CSRF protection for cookie-authenticated mutations, distributed rate limits/WAF, private databases, row-level security, service identities, external SIEM/monitoring, durable audit storage, isolated backups, tested restores, signed artifacts/SBOM, secret management and formal incident runbooks.

## Threat-model focus

Before introducing private accounts or privileged APIs, test account takeover, IDOR/BOLA, API abuse, data poisoning, malicious community submissions, prompt injection, SSRF, file/OCR abuse, dependency compromise, cache leakage, enumeration, race conditions, denial of service and cost/resource exhaustion. Treat external data and AI output as untrusted input, and keep deterministic validation between any model output and critical action.
