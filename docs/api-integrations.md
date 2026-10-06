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

Request and Contact use `components/enquiry-form.tsx` and the same strict request schema. Contact defaults to technical advice and permits no surface selection; sample enquiries require at least one valid variant. The local form holds a retry key for an unchanged payload, disables edits during submission, and ignores results for a superseded request context. The local API checks optional project ownership and selected-ID membership, stores the enquiry and three outbox jobs transactionally, then returns the enquiry reference. Its success message means saved for local review; it does not mean an email was sent.

Retain contact information only under the owner-reviewed regional policy. Implement retention jobs, audit-preserving record deletion and a data-subject procedure before launch. The local safe reset is documented in README. Shared projects must always remain separate from enquiries.


## Vercel review guard — updated 6 October 2026

`VERCEL=1` selects hosted-review capability through `lib/runtime.ts`. Public catalog reads validate filters against the source snapshot without opening SQLite or setting an application session cookie. Project/share/enquiry/admin/document persistence endpoints return 503 with a scoped explanation before reading contact data or opening storage. Device project drafts remain private on the browser; share/export are disabled. Set a trusted `FD_PUBLIC_ORIGIN` for metadata, or use Vercel-provided project/deployment origin variables; request headers do not determine canonical origin. This is an explicit review mode, not a production database adapter.

Hosted Request and Contact forms keep contact fields and the draft in component memory. They do not call `/api/enquiries`, write contact data to browser storage, add it to route parameters, or report it to logs/analytics. On validation, `lib/enquiry-draft.ts` creates an editable, localized email body with exact source IDs, names, decor codes and finish labels. The fixed recipient is `info@finedecor.de`; the subject and body are URI-encoded. The user separately chooses **Open email draft** or **Copy draft**, then reviews and sends in their email app. No delivery confirmation is inferred. If the encoded mailto URI exceeds 1,800 characters, the open action carries only the subject and the UI directs the user to copy the full draft first. Clipboard failure leaves selectable draft text available. Email/phone remain direct fallbacks. No email, real lead or sample dispatch is sent by this implementation or its verification.

Studio enquiry navigation carries only validated public variant IDs in `variants`, preserving the device shortlist. The selection resolver gives those IDs priority within the 12-item request limit and reports excluded extra shortlist references; no contact data enters the URL.
