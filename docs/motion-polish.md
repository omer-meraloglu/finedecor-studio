# Motion and journey refinement · 4 October 2026

The site now uses brief editorial motion: a transform-only hero entrance, one-time off-screen section reveals, surface-card feedback, button arrows, a sticky navigation bar and client-side page transitions. Source photography and source swatches remain clearly identified. The third home surface is visible on mobile, and a three-step section connects the library, private studio study and enquiry.

Navigation uses Next Link. The Library provider lives in the shared root layout, preserving shortlist and unsaved project state across client navigation. Locale changes update the document language; the studio language switch opens the equivalent route without replaying the original starting-variant query. Route changes focus the main region. The mobile menu provides shortlist/contact access, focuses its first link on keyboard opening, closes on Escape, outside interaction or focus departure, and scrolls within short landscape viewports.

The WebGL renderer, camera, controls and light environment stay alive when changing a variant, lighting, comparison or reference scene. Materials and lights update in place. Geometry changes dispose and rebuild only the substrate resources. Camera presets and zoom use a 280 ms cubic ease; orbit damping resolves to an exact saved endpoint. Export flushes any camera transition before capturing. Two lightweight scene copies share the same camera and environment; the second renders only for comparison. There is no idle animation loop. Rendering pauses while the document is hidden, and mobile rendering is capped at 30 FPS with a DPR cap of 1.5.

CSS and camera movement respect `prefers-reduced-motion`. Reveals are progressive enhancement: server text remains visible, above-fold sections are excluded, focused content reveals, and preference changes remove prepared states. Camera commands become instant under reduced motion. Reduced-motion handling was reviewed in code; this pass did not change the host OS preference or complete a physical-device/assistive-technology suite.

The catalog now offers clear search, removable filters, source-aware empty states and focus restoration. The enquiry has an in-page surface picker, explicit source IDs, character limits, required-field guidance, an accessible save/error/success state and precise project attachment status. Material edits keep the written brief. Privacy opens separately so reviewing it preserves the form. Identical retries reuse request identity; duplicate submission and stale async responses are guarded. A save that completes after leaving Studio cannot overwrite a newer study in the persistent provider.

## Verification

Production build, TypeScript check, all seven integrity tests and the read-only HTTP smoke passed. The tests retain coverage of catalog relationships, invalid combinations, private ownership, sharing/revocation, schema validation, idempotent enquiry persistence, outbox retries and role approval. No real email, CRM lead or dispatch was sent.

Browser observations at requested 390×844, 768×1024 and 1440×900 viewports found no horizontal overflow. The browser reserves a 15px vertical scrollbar; DOM content widths were 375, 753 and 1425px. A further 844×390 landscape check kept the menu bottom at 389px and made the overflowing menu content scrollable.

Verified in the browser: search clear returns focus; supported product finishes navigate; selected variants and an orbit camera survive locale navigation; main focus and `html lang` follow the route; keyboard opening enters the first menu link; Escape returns focus; leaving the header closes the menu; the renderer instance stays constant through material/light/comparison/scene changes; geometry revision changes only for scenes; Front reaches exactly `[0, 1.05, 5.5]`; idle render counts stop increasing; private project save and a dated HTML export contain the selected IDs and exact camera. A four-ID synthetic local enquiry saved successfully after adding a surface without losing the brief, and confirmation received focus.

Actual WebGL context loss was exercised again in an isolated development preview on port 4174, with its guarded diagnostic. The viewer returned to 2D, removed its canvas and preserved `demo-425-gloss`. The temporary server was stopped. This diagnostic is ignored in production.

| Local lab observation | LCP | Layout shift | Largest observed event | Intent to first 3D frame |
|---|---:|---:|---:|---:|
| Home, mobile viewport | 68 ms | 0 | 0 ms | — |
| Home, desktop viewport | 96 ms | 0 | 0 ms | — |
| Studio, mobile viewport | 72 ms | 0 | 32 ms | 379.2 ms |
| Studio, desktop viewport | 80 ms | 0 | 40 ms | 390.0 ms |

These are single warm loopback observations on the recorded MacBook host, without network/CPU throttling. They are not field p75, Lighthouse scores, certified INP/CLS results or phone benchmarks. Local browser observer data is in [performance-polish-browser.json](performance-polish-browser.json). Asset totals and the exact final build ID are in [performance-polish-assets.json](performance-polish-assets.json); reproduce with `node scripts/measure-assets.mjs` while the production server runs. The raw studio page/assets total remains approximately 1.78 MB, including the deferred Three chunks and a conservative conditional-polyfill allowance, below the provisional 3 MB budget. No extra animation dependency was added.

See the [updated screenshot gallery](screenshots/README.md) and [captured illustrative export](examples/polished-surface-study.html). Original content/rights approval, calibration, regional/legal review, production integrations and agreed phone/network/accessibility testing remain the production dependencies described in the handoff. All six source-referenced variants are still demo data and excluded from fulfilment.
