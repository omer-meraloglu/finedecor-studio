# Deployment / rollback checklist — owner approval required

## Before any public release

- Obtain the approved PIM subset, exact family/finish relationships, stable SKU mapping, dimensions, application suitability and processing limits. Keep every demo ID excluded from SEO and fulfilment.
- Obtain current family/variant-scoped technical/care documents, claim wording and certification evidence. Do not republish marketing claims as tests or derive PBR values from gloss figures.
- Confirm Oelde/Bielefeld location descriptions, FineLine relationship, Istanbul address and regional sales routing. Do not describe a current Schattdecor joint venture.
- Review source image/logo rights, photograph/scan calibration and actual material scale. Retain indication/physical-sample warnings.
- Review DE/EN translations, legal/privacy/cookie/retention/accessibility text. TR publication and .com.tr consolidation require separate regional review and owner decision.
- Choose durable Node 24 hosting and private database storage with versioned migrations, tested backups and restore. Multi-instance deployments need an appropriate shared database; the local SQLite file is not a distributed store.
- Replace role capabilities with individual staff authentication/MFA, record-level authorization and audit retention. Add signed private-document delivery, trusted-proxy rate limits, CSRF/abuse protections appropriate to the final deployment, security monitoring and incident recovery.
- Configure CRM/email/warehouse adapters server-side, owner-approved recipient/routing and fulfilment guard; verify store-before-delivery, provider idempotency, retry/lease recovery and alerting using synthetic data.
- Configure final origin, regional canonical/hreflang, production sitemap and reviewed 301 migration map. No fabricated Product offers/ratings. Remove staging noindex only after authorized release.
- Measure physical target devices/networks, WebGL failures/context loss, assistive technology, zoom/text scaling, colour contrast and Core Web Vitals. Lab measurements are not field claims.

## Release

1. Capture source commit/tag and database backup.
2. Run typecheck, test and optimized build. Review migration diff and apply to staging.
3. Smoke-test DE/EN catalog → PDP → studio → private save → explicit share/revoke → sample enquiry. Keep real integrations disabled until signed off.
4. Owner approves staging content, legal docs and actual production routing.
5. Deploy to approved infrastructure. Domain/DNS/company systems require a separate explicit instruction. Monitor errors, queue outcomes and vitals.

## Rollback

- Preserve the most recent database backup, source version and migration journal before release.
- Revert application to the known-good source/build. Keep backward-compatible schema changes; do not destructively undo migrations without a reviewed recovery plan.
- Disable downstream adapters if integrity fails; preserve stored enquiries and queued jobs. Audit the incident and replay only stable idempotency keys after repair.
- Restore the database from a reviewed backup only when needed, reconciling requests created since backup. Revoke any compromised project tokens or staff sessions separately.
- Verify catalog IDs, sample storage, locale routing and privacy on the restored version.
