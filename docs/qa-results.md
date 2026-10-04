# QA and performance

**Latest evidence:** [applications, homepage, source enrichment and Studio refinement](applications-home-studio-refinement.md), [browser observations](performance-refinement-browser.json), [asset measurements](performance-refinement-assets.json) and [screenshots](screenshots/README.md). All 30 tests, final production build and read-only HTTP smoke pass. Earlier sections below are historical.

## Original build — 3 October 2026

The final optimized Next.js build and TypeScript checks pass. Seven meaningful automated core tests pass, plus the read-only HTTP smoke suite in `scripts/smoke.mjs`. No real email, CRM lead, warehouse instruction, external service subscription or company deployment occurred.

## Automated verification

`npm test` uses an isolated temporary SQLite database and synthetic `qa@example.test` data. It verifies the six supported decor/finish relationships (no Kaschmir/Sand Gloss), unknown IDs and invalid assignments/cameras, required enquiry data and real approval dates, private ownership and explicit sharing/revocation, saved-before-outbox and scoped idempotency, atomic concurrent job claims, role separation/independent review/audit/publication, and cross-origin/oversized/unsupported input failures.

With the local server running, `node scripts/smoke.mjs` verifies real HTTP catalogue reads/counts, invalid filters, valid and nonexistent product URLs, DE/EN equivalent metadata/document language, TR withheld, private/admin/document access denied, staging robots/sitemap and the server-rendered studio controls with no initial canvas. This includes the layout-shift regression described below.

## Browser verification

| Journey | Evidence / result |
|---|---|
| Catalog → PDP | Search `373` returns two valid finishes; source swatch loads immediately; shortlist selection survives navigation. Unknown family/SKU/dimensions and suitability are explicitly pending. |
| Localization | EN OliveGreen Frosted links to the same stable ID in DE. Document language becomes `de`; German product/CTA text renders. |
| 3D studio | Front panel, kitchen and furniture unit render. Material selection, front/detail/perspective, orbit, reset, keyboard zoom and three light choices use the shared implementation. Comparison uses the same geometry/camera/exposure/light. |
| Private save | Server snapshot returned a project UUID. Material/camera edits clear association and disable share/export until another save. Query-selected new studies clear prior association; a late save cannot overwrite newer edits. |
| Share/revoke | Explicit visible-field acknowledgement creates an expiring token. Shared page restores only the whitelisted study. Revoke makes the real URL display “Shared project unavailable”; API returns 404. |
| Enquiry | Three exact shortlisted IDs and the saved project ID reached the form. Synthetic company/country/project details saved successfully and returned an enquiry reference. No dispatch or messages occur. |
| Export | The sandboxed review shows dated project ID, three stable IDs, assignments and actual illustrative canvas image. The exact generated HTML is preserved in [surface-study.html](examples/surface-study.html). No enquiry reference appears for a study with no associated saved enquiry. The in-app browser did not expose its Blob download event; native file-download capture remains unverified, while summary generation/review and the delivered HTML are verified. |
| Failure | Development-only `?qa=context-loss` invokes the actual `WEBGL_lose_context` extension. UI returns to useful 2D comparison with retained selections and retry. Normal production ignores that diagnostic query. Loading and fetch error states exist; slow-network/device failure matrix remains a launch test. |
| Console | Final production studio tab reported no warnings/errors. A development cleanup warning after deliberately losing context was observed; it did not block fallback. |

## Responsive and accessibility evidence

Home/studio screenshots were inspected at **390×844, 768×1024 and 1440×900**. Mobile catalogue/PDP, saved enquiry, revoked link, export and context-loss evidence are also included. No horizontal page overflow was observed at those widths. See [screenshot index](screenshots/README.md).

Keyboard tests verified the first Tab reaches the visible skip link; Enter transfers focus to `main`. Compact navigation opens by keyboard. Front/zoom camera controls activate by Enter, show visible focus and change the canvas. Dialog controls are labeled; the export can be opened/closed by keyboard. DOM selection and identifying text remain available without a canvas. AX snapshots expose names, pressed/selected states, form labels, status and errors. This is manual keyboard/AX evidence, **not full screen-reader or WCAG conformance certification**.

Sample palette contrast calculations: primary text on paper **13.32:1**; muted body text **5.16:1**; white CTA on olive **6.28:1**; focus ring against paper **3.01:1**. These checks do not substitute for a full colour/zoom/assistive-technology audit. Reduced motion is handled in CSS and the renderer has no perpetual animation; an actual OS reduced-motion matrix was not run.

## Performance lab

Hardware: MacBook Pro, **Apple M1 Pro / 16 GB**, macOS 15.7.4. Browser: Codex in-app Chromium browser, DPR 1. Network: loopback localhost, warm assets, no throttling. Viewport emulation is **not physical mobile hardware**. Full numeric evidence/build ID/asset list is in [performance.json](performance.json).

| View | LCP observed | Layout-shift sum | Largest observed event duration | 3D intent → first frame |
|---|---:|---:|---:|---:|
| Home, 390×844 | 68 ms | 0.0000 | no interaction recorded | — |
| Home, 1440×900 | 96 ms | 0.0000 | no interaction recorded | — |
| Studio, 390×844 | 208 ms | 0.0015 | 40 ms | 380.5 ms |
| Studio, 1440×900 | 108 ms | 0.0196 | 56 ms | 380.6 ms |

The studio originally deferred the entire UI and displaced the footer on hydration (0.6816 mobile shift). It now server-renders controls and 2D, while only the renderer loads on intent. The remaining small shifts come from restoring saved labels/slots.

The Three/scene increment is **586,674 raw bytes / 144,966 gzip bytes**, with no external models or 3D textures. Initial studio script tags total **869,459 raw / 262,087 gzip bytes**, conservatively including nomodule polyfills. Full measured initial scripts + 3D + HTML/CSS/images are below the provisional 3 MB budget (exact tally in JSON). Gzip sizes are deterministic file compression calculations, not a captured HAR transfer total. The HTML contains catalogue controls and source IDs before any canvas.

Rendering is on change; no idle animation loop. It pauses when hidden, disposes geometries/materials/environment/controls/renderer on unmount, caps mobile DPR at 1.5 and schedules mobile movement at 33 ms. The 30 FPS ceiling is implemented, not a measured sustained rate on a phone.

These are single local lab samples. The observer uses lifetime layout-shift sum and maximum event duration, **not the field p75/session-window CLS/full INP algorithms**. Standard cold-network Lighthouse/trace runs, physical agreed phone/GPU/network, iOS/Android/browser matrix, context loss on devices, text scaling and full assistive technology are still required before public release. No field traffic exists; no Core Web Vitals guarantee is claimed.

## Scope and remaining launch gates

All six variants remain demo/draft with no approved family assignment, SKU, application suitability or technical documents. Studio colours/finish response are illustrative. Source rights and exact material calibration need owner approval. Enquiries are visibly local storage with blocked fulfilment. Role tokens and SQLite are local operating tools; production staff identity, private signed documents, versioned database migrations/backups, queue lease recovery, real adapters and monitoring remain isolated dependencies. DE/EN wording/legal/location/routing require review; TR stays unpublished. AI/AR and optional tracking/embeds are off.


## 4 October 2026 refinement

See [motion-polish.md](motion-polish.md) for the current interaction checks, updated screenshots, final asset budget, browser lab observations and explicit remaining test limits. All seven integrity tests, TypeScript, the production build and read-only route smoke passed again. Actual context-loss recovery was rechecked after the renderer lifecycle changes.

## Material Studio upgrade — 4 October 2026

The latest studio implementation, 17 passing checks, browser behavior, responsive screenshots, asset budget and provisional performance/accessibility evidence are recorded in [studio-upgrade.md](studio-upgrade.md). Earlier measurements remain historical.


## Latest source enrichment and four-scene Studio

The 86 observed source combinations remain draft demos: six illustrative 3D materials and 80 source-only 2D references. Regression checks now also cover Table save/share/revoke, full-study capacity without state loss, explicit enquiry ID priority over a full shortlist, exact catalog import and hosted catalog reads with server persistence blocked. Local flows are functional; the Vercel review uses device drafts and direct contact until durable storage/integrations exist. See the latest linked report for responsive/fullscreen evidence, asset budgets and physical-device/assistive-technology limits.
