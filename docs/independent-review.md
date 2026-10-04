# Independent backend and content-safety review

Reviewed on 3 October 2026 (Europe/Istanbul). Scope: source inspection, pure validation tests, and two authorized targeted studio-state fixes. No live leads, messages, external services or company accounts were used. This is a review of the local demo, not a security or legal certification.

## Findings reported to implementation owner

| ID | Severity | Finding | Location and recommended correction |
|---|---|---|---|
| R-01 | Blocking | Every valid enquiry fails because the `SampleRequest` insert declares seven placeholders for a six-column table and supplies six values. No request or outbox job survives the transaction. | `app/api/[...path]/route.ts:22`, `lib/schema.sql:17`. Name the six columns explicitly and use six placeholders; verify persisted request and three outbox rows. |
| R-02 | Important | The abuse limit uses only a client-controlled session cookie. A client can omit or rotate it to obtain a new bucket. | `app/api/[...path]/route.ts:10`, `lib/store.ts:12-13`. Add an independent server/connection bucket. Trust forwarded client IP only under a documented trusted proxy. |
| R-03 | Important | Concurrent outbox workers can select the same job and both deliver it. The status update does not conditionally claim the row before awaiting an adapter. | `lib/adapters.ts:6`. Atomically change a pending/failed row to processing; deliver only if the claim changed one row. Preserve downstream idempotency keys. |
| R-04 | Important | The technical approval validator accepts impossible calendar dates and a review date before the issue date. | `lib/validation.ts:8`. Validate ISO calendar dates and ordering, and define approval expiry rules before production. |
| R-05 | Important for publication | A referrer policy on API responses does not protect the HTML document containing a share token in its URL. Following external links from that document can disclose its bearer token through the referrer. | `app/api/[...path]/route.ts:8` and share HTML route. Apply `Referrer-Policy: no-referrer` to the document/global application headers. |

## Controls observed in source

- Project state uses a strict allowlist and validates scene, lighting, camera bounds, existing stable variant IDs and assignment membership.
- Project ownership is tied to a random 256-bit HTTP-only session cookie. Project reads, sharing and revocation check owner hashes. Share tokens use 256 random bits, are stored as hashes, expire after 30 days and can be revoked.
- Shared project state does not contain enquiry/contact columns or owner credentials. Its user-entered name becomes visible only after sharing acknowledgement; the UI must explicitly instruct users to keep personal and confidential information out of that name.
- Request validation enforces selected IDs, rejects unsupported combinations through catalog identifiers, checks project ownership and selected-ID membership, and requires service acknowledgement. Demo requests are marked `fulfilmentBlocked`.
- An idempotency key is scoped to the browser owner and compared to a body hash. Changed content under a reused key conflicts. Request and outbox creation occur in one transaction.
- SQL values use bindings. No uploaded files, real notification sends, CRM writes or optional tracking integrations exist in the inspected code.
- Role credentials are generated server-side in `.env.local`, hashed in the local database, and absent from the catalog payload. Draft creation, independent technical review and administrator publication have separate permissions and audit events.
- The catalog exposes six explicitly marked source-observed demo variants. Family assignments, SKU, dimensions, application suitability and current documents stay unresolved. No environmental or test approval is fabricated.

## Explicit production dependencies

- The approval flow currently publishes an editorial revision as `published-demo`; it does not mutate the immutable catalog or convert demo variants into owner-approved products. A real CMS/PIM workflow must apply reviewed payloads, preview changes and preserve versions before production publication.
- Technical evidence confirmation fields demonstrate the review workflow; they do not independently establish an evidence document's validity, applicable variant scope, rights or current currency. Owner and technical approver review remains required.
- Non-public technical document storage must use private files or signed server access. An authorization check that returns a directly public URL would not protect the underlying document; no such document is seeded here.
- Configure a trusted proxy and ingress size limits, a scheduled worker with job leases, secret rotation, database backups, retention/deletion, regional legal review and security hardening before internet exposure.
- The leftover scaffold `app/chatgpt-auth.ts` treats authentication headers as trusted. It must remain unused for local authorization unless a trusted ingress strips incoming copies and supplies verified headers.

## Verification status

Findings were sent promptly to the implementation owner. Fix status and behavioral/lab tests must be recorded by the implementation owner after the final code is in place. This reviewer did not start a server or run mutation-producing API tests.

## Source re-review

The explicit six-column enquiry insert, independent global abuse bucket, streamed 16 KiB body limit, actual calendar-date validation/order and global `no-referrer` headers are now present. Catalog reads apply technically approved, administrator-published demo editorial notes; variants remain demo/nonfulfillable. The production CMS/PIM dependency is reduced to full technical/product fields and owner-approved data rather than editorial-note publication.

The worker now conditionally claims rows, but the admin retry endpoint still resets actively `processing` rows to `pending`. A second retry while a slow adapter is running can therefore bypass the claim. Reset failed rows only; reclaim processing rows only through an explicitly expired lease.

Further UI findings were reported:

- `components/studio.tsx` mutation updates the local project payload without invalidating its older saved ID. `components/pages.tsx` request submission checks selection membership in that new local payload and may attach the old ID; the server then rejects valid selected surfaces that were added since the last save. Clear the saved association or compare against an immutable saved snapshot.
- Saving merges shortlist IDs into the server project, but leaves the displayed/exported studio state unchanged. The HTML export can omit IDs contained in the saved snapshot. Set the studio state to the saved payload after success.
- The studio initialization effect does not depend on the provider's restored project. Local-storage hydration after the child effect therefore fails to automatically restore the previous scene/selection. Restore once after storage readiness, without overwriting later edits.
- Repeated keyboard zoom has no clamp and can produce camera state rejected by the save validator. Match the orbit distance limits.
- The legacy contact redirect points to the same path and preserves its matching query parameter, creating a redirect loop. Remove the self-redirect.
- Technical-review rights/scope checkbox state is shared across all revision forms. One confirmation marks every draft's confirmation as checked; use per-revision state.

These are source-inspection findings. Final status needs another source check and the implementation owner's behavioral tests after corrections.

## Final disposition

The final source pass supersedes the open findings above. No critical source-level privacy/security blocker remains in the reviewed local-demo scope.

| Finding | Final disposition |
|---|---|
| R-01 enquiry storage | Resolved: explicit six-column insert, with request/outbox transaction retained. |
| R-02 session-only abuse limit | Resolved for the local demo: independent endpoint-wide global bucket plus browser bucket. Internet deployment still requires trusted-ingress limits and documented client-IP handling. |
| R-03 duplicate outbox claim | Resolved: conditional atomic claims; manual retry resets failed rows only. Stale-worker lease recovery remains a production dependency. |
| R-04 approval dates | Resolved: real calendar dates and review/issue ordering. Evidence validity and expiry policy remain owner/technical responsibilities. |
| R-05 share referrer | Resolved: `no-referrer` applies globally to HTML and API responses. |
| Edited project / old enquiry association | Resolved: studio changes and camera interaction clear the stored project/enquiry association. |
| Saved project versus export IDs | Resolved: successful unchanged saves update studio, device and server state with the merged variant IDs. |
| Initial local project restore | Resolved: restoration waits for the provider state and does not overwrite a later edit. |
| Keyboard zoom and legacy contact redirect | Resolved in source: bounded zoom and self-redirect removed. Root separately verified the canvas camera synchronization behavior. |
| Scope/rights confirmations | Resolved: checkbox state is keyed by revision. |
| Demo publication | Resolved for demo editorial notes: reviewed/published notes overlay the catalog and PDP. Full approved technical/PIM publication remains outside the supplied data scope. |

Two final studio-state edges were corrected with authorization in `components/studio.tsx`:

- Opening a valid query-selected variant starts a fresh unassociated private study rather than retaining another saved project ID.
- Saves capture a state revision and snapshot. A response cannot overwrite material, scene, name, camera or saved-project selection changes made while that save is in flight; the saved snapshot remains available in the saved-project list.

Validation evidence: three selected pure tests passed for catalog relationships, strict project state, and request/approval rules using bundled Node **24.19.0**. TypeScript typecheck passed after the studio changes. The default shell Node **20.11.0** cannot import `node:sqlite`; setup requires the documented Node 24 runtime. No live API or messaging integration was exercised by this reviewer. The root agent's production build includes the final studio changes (the built client chunk contains the snapshot-guard path).

The remaining release dependencies are owner-approved product/evidence data, calibrated appearance assets, complete technical/PIM CMS fields, private document storage, trusted deployment/ingress, scheduled worker leases, production adapters, regional legal/retention review and broader device/assistive-technology checks. Demo variants remain excluded from fulfilment.


## Final browser regression disposition

Root lab tracing found the studio controls were wrapped in a client-only dynamic import in pages.tsx. The footer initially occupied the viewport, then shifted out on hydration (mobile0.6816). The wrapper now imports Studio normally; SceneView alone remains dynamic and intent-only. Final source HTTP smoke verifies SSR control/ID content and no canvas. Root measured mobile shift0.0015 and desktop0.0196 after this correction. Keyboard zoom/reset was also visually verified after imperative camera synchronization. Export now exposes a sandboxed review before downloading; generated dated HTML/preview/IDs were inspected and preserved as an example, while the in-app browser download event could not be captured.
