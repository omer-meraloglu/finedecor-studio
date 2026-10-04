# API and adapters

All endpoints return JSON, are same-origin, and use no-store. Bodies are streamed with a 16 KB limit; Zod schemas are strict. Local per-session buckets and independent service-wide buckets rate-limit abuse. Production needs a trusted reverse-proxy IP/connection boundary and distributed quotas; arbitrary forwarded IP headers are not trusted. Origin is checked against `FD_PUBLIC_ORIGIN`, default `http://127.0.0.1:4173`.

| Method | Endpoint | Behavior |
|---|---|---|
| GET | `/api/catalog?q=&finish=&colour=&family=` | Validated filters; variants plus distinct family/decor/finish/material data. Only approved demo editorial revisions overlay the seed. |
| GET | `/api/projects` | Current browser's private snapshots only. |
| POST | `/api/projects` | Validated variant IDs, fixed slots, scene/light/camera; creates immutable private snapshot. |
| GET | `/api/projects/:id` | Browser ownership required. |
| POST | `/api/projects/:id/share` | `{acknowledgeVisible:true}` required; returns a random token with 30-day expiry. |
| POST | `/api/projects/:id/revoke` | Browser ownership; revokes all tokens. |
| GET | `/api/shares/:token` | Only whitelisted project fields, expiry/revocation checked, missing-variant state. |
| POST | `/api/enquiries` | Service request fields, locale, selected IDs, optional owned project, UUID idempotency key; stores first then enqueues. |
| GET | `/api/documents/:id` | Approved public metadata only; authorization required for restricted records. No approved documents exist in demo. |
| GET | `/api/admin` | Role token required; drafts, safe audit, queue and count. Contact data is not exposed. |
| POST | `/api/admin/drafts` | Editor/administrator; editorial label and review note. |
| POST | `/api/admin/review` | Technical role; valid calendar dates/order, HTTPS evidence, version, explicit rights and scope confirmations. |
| POST | `/api/admin/publish` | Administrator; independent technical approval required. Publishes a demo editorial note only. |
| POST | `/api/admin/retry` | Administrator; retries failed local jobs. `{simulate:true}` exercises successful local acceptance. No real messages. |

`IntegrationAdapter` is the typed server-only boundary for CRM, warehouse and email. Each delivery receives a stable idempotency key. Local adapters return `LOCAL_DEMO_NOT_CONFIGURED`; errors remain visible in the queue with exponential retry timestamps and three automatic attempts. Jobs are claimed atomically before awaiting delivery. Actively processing jobs are never reset by ordinary retries. Production requires a scheduled worker, stale-lease recovery after crashes, provider idempotency, and monitoring. Manual retry is explicit and should remain audited.

`AnalyticsAdapter` exists with tracking disabled. AI/AR/optional embeds are disabled feature flags. No API secrets enter client bundles. No uploads are accepted. Private technical files must be served from authorized storage with signed short-lived access in production; do not put them in `public/` or use static reusable private URLs.

Retain contact information only under the owner-reviewed regional policy. Implement retention jobs, audit-preserving record deletion and a data-subject procedure before launch. The local safe reset is documented in README. Shared projects must always remain separate from enquiries.
