# Material Studio upgrade — 4 October 2026

The local studio now offers a clearer material workspace, more useful reference scenes, synchronized comparison, deliberate study selections and a reliable private project flow. It remains a source-referenced demonstration: the six variants are not approved for fulfilment, and the material appearance is not calibrated.

## What changed

- A larger, stable preview stage, compact scene/mode controls, an expandable canvas and readable A/B labels. Tablet and phone layouts retain the same tools without horizontal overflow.
- Three generic reference scenes with visible substrate edges, door/drawer reveals, handles, kitchen fixtures, a panel stand and furniture legs. Architecture and hardware cannot receive a film assignment.
- Scene-specific perspective, front and detail cameras; eased transitions; keyboard arrow rotation, zoom and reset; equivalent DOM rotation buttons. Arbitrary orbit is labelled Custom view instead of falsely identifying it as a preset.
- More legible illustrative Frosted/Gloss response through shared procedural softbox reflections. Both comparison halves use identical geometry, camera coordinates, lens, exposure and lighting. Explicit accent assignments stay fixed.
- Direct selection of main fronts, accent or comparison B from the DOM library. Search trims whitespace, includes names/codes/IDs, offers clear/reset controls and announces result counts. Accent assignments remain visible as source references in 2D.
- Thirty immutable undo/redo snapshots during the current workspace session. Restoring a snapshot or navigating starts a fresh history; the study itself survives navigation and locale changes. Preview intent lasts for the visit, while a fresh visit starts with source swatches.
- Study variant IDs now contain current assignments/comparison plus deliberately imported inactive shortlist references. Trying and discarding a surface does not retain it. Assigning an additional reference moves it into the active group; it then follows the same replacement rules as other assignments. Importing the global shortlist is an explicit action, with removable additional references.
- Private device drafts and saved server snapshots have distinct states. Name drafts participate in dirty-state and pending-save protection. Save/share/revoke responses cannot overwrite a newer study, and stale links/acknowledgements are cleared when the snapshot changes. The same saved snapshot can be reopened while a newer draft is active.
- Fully localized, printable HTML studies include the exact chosen IDs, role assignments, camera coordinates, date, project ID, captured illustrative image or labelled 2D colour references, and limitations. Camera labels are derived from coordinates. Contact data is excluded. An enquiry reference is included only when it belongs to the current saved project.
- The product-page disclosure now directly loads the shared renderer after that explicit intent. Fresh studio text and source swatches still render before Three.js.

## Implementation and fidelity

The existing Next.js 16.3.8, React 19.2.6 and Three.js 0.186.1 stack is retained; no new dependencies, subscriptions or scene downloads were added. Studio edits use pure helpers in `lib/studio-state.ts`; export generation and escaping live in `lib/study-export.ts`. Project/API schemas remain unchanged. Existing private storage, RBAC, hashed share tokens, rate limiting and enquiry/outbox adapters remain in force.

The renderer persists across material, lighting, camera and scene changes. Scene changes rebuild substrate geometry; both comparison copies share buffers. Shadows are cached for fixed geometry/lights. Rendering stops at rest and pauses when hidden or offscreen. Resolution and the mobile 30 FPS ceiling follow viewport/coarse-pointer changes. Missing material assets, renderer errors and context loss return to a useful 2D view. Cleanup releases geometry, materials, PMREM, observers and WebGL resources.

The [material manifest](material-manifest.json) records manually chosen sRGB colours, illustrative roughness/clearcoat values, procedural lighting, scale limitations and official Three.js documentation. No measured material maps or industrial gloss conversions were introduced. Furniture dimensions and preview edges establish no product dimensions, forming capability or application suitability. Existing image rights and source references remain in the [asset manifest](asset-rights-manifest.json); no new raster assets were created.

## Verification

`npm test`: 17 meaningful checks pass, including catalog relationships, strict project/enquiry validation, ownership, sharing/revocation, idempotency/outbox, roles, current-ID reconciliation, scene transitions, bounded history, export escaping, localized output and camera labels. Production build/type checking and the read-only HTTP smoke check pass.

Browser checks cover material A/B/accent assignment, whitespace search and clear, undo/redo, all three scenes, keyboard camera controls, synchronized lighting, private save, same-snapshot reopening, export, explicit local sharing/revocation, DE/EN continuity and sample-enquiry handoff. The product-page “Inspect in 3D” action loaded `demo-425-gloss` directly in the shared renderer without a second loading action. Samples add current study IDs to the existing user shortlist; if that selection contains references outside the saved study, the enquiry clearly omits the project attachment. Verification sent no real lead, email or dispatch.

The genuine context-loss diagnostic ran against an isolated development database on port 4174. WebGL was lost after the first render: canvas count returned to zero, `demo-425-gloss` remained selected, its source swatch and Retry 3D control appeared, and the console had no warnings/errors. That server was stopped; production data was not used for the diagnostic.

Screenshots were inspected at viewport overrides of 390×844, 768×1024 and 1440×900. Captures are JPEGs at 375×812, 753×1004 and 1425×891 respectively; the export dialog capture is 1440×900. The browser reserves a 15 px scrollbar, so DOM widths are 375, 753 and 1425 px. No horizontal overflow was observed. Sources: [screenshots](screenshots/README.md), [browser evidence](performance-studio-browser.json), [asset measurement](performance-studio-assets.json), [export example](examples/studio-upgrade-study.html).

| Local lab observation | 390×844 | 1440×900 |
|---|---:|---:|
| LCP | 168 ms | 100 ms |
| Layout-shift sum, including restoring a saved comparison | 0.0316 | 0.0529 |
| Maximum observed interaction event | 32 ms | 32 ms |
| Intent to first 3D frame | 403.5 ms | 423.1 ms |

The final build is `6Net-NGGzUWs6BLy0e_ZM`. The measured initial scripts plus deferred Three.js, HTML, CSS and images total **1,858,238 raw bytes**; the deferred renderer is **575,702 raw / 145,209 estimated gzip bytes**. No scene model or texture downloads are required.

A separate midpage mobile reload exposed a 0.2939 layout-shift sum in the preceding build. Restored comparison/accent cards increased the stacked assignment height by 155 px. Compact single-row assignment controls, a stable comparison note and reserved action height reduced the repeated midpage observation to **0.0020**. The final production console had no warnings/errors, and the render count remained at 3 across an idle observation.

These are single warm-loopback observations on a MacBook Pro M1 Pro, 16 GB, macOS 15.7.4, in-app Chromium, DPR 1, without network/CPU throttling. They are not field p75, a certified INP measurement or a physical-phone benchmark. Reduced-motion behavior is implemented and code-reviewed; the OS preference, broad assistive-technology review, agreed physical devices and adverse-network measurements remain production QA dependencies. Core Web Vitals targets are provisional until those checks and field traffic exist.

## Review and release

Use `npm run dev` or `npm run build && npm start`, with Node 24. Open `/en/studio` or `/de/studio`; setup and privacy details are in the [root README](../README.md). The current product stays local and `noindex`. Company-domain deployment, approved PIM/documents, calibrated material captures, legal/regional review, durable production storage and real integration adapters remain separate owner work. AI and AR remain disabled. Follow the existing [deployment/rollback checklist](deployment-checklist.md) before any release.
