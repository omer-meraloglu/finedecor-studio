# Homepage and enquiry streamlining — 6 October 2026

This update follows the simpler presentation of [Fine Decor’s production homepage](https://www.finedecor.de/), inspected on 6 October. It retains the existing source imagery, logo, olive palette and evidence limitations. No catalogue or technical approvals changed. After local verification, the user separately authorized committing and pushing this update to the existing repository. No company-domain changes or actual email/dispatch occurred.

## Result

- Home now has five focused sections: offer and source imagery, three surface entry points, Studio, company and samples. Longer repeated family/process/archive blocks were removed from Home; their destinations remain available.
- The manual three-image gallery has a finite fade/scale transition. Existing section reveals and hover feedback remain restrained; reduced-motion CSS disables movement. No automatic slideshow or new animation loop was introduced.
- Product “Inspect in 3D” is a link to `/{locale}/studio?variant={stable-id}`. A validated explicit variant opens a fresh Kitchen study in 3D, even after a previous 2D visit. Device shortlist entries remain intact. Studio locale switching preserves the validated variant. Product pages show the source swatch immediately and no longer embed a second Studio below the product.
- Navigation order is Collections, Applications, Company, Material Studio, Knowledge, Contact in both locales and mobile navigation.
- Request and Contact share a short, labelled form: name, company, work email, country/region, application and message. Request also offers samples/technical advice and selected surface references. Email and phone remain visible. Shipping and marketing fields are absent.

## Enquiry boundaries

Local mode validates through the existing schema/API, saves the enquiry first and creates idempotent outbox jobs. It displays a saved local reference. CRM, warehouse and email remain local demo adapters; draft materials block fulfilment.

Hosted review has no durable enquiry store. Its form validates, then prepares an editable email draft in component memory. The user separately chooses Open email draft or Copy draft. The website never claims the enquiry was sent. The recipient is fixed to `info@finedecor.de`; subject/body are encoded. Drafts over the 1,800-character mailto limit use a subject-only link and the full-text copy fallback. Contact details are not persisted to device storage, share links, logs or analytics. Direct server delivery still requires a configured, approved service and durable storage.

Selection/context edits invalidate stale success or draft state. Editing details retains fields. Sample enquiries require a validated selected ID; technical enquiries allow no selection. Removing a reference preserves an explicit technical choice. Native required fields, schema errors, live statuses, focus management, honeypot and duplicate submission controls are present.

## Verification

Final optimized Next build `OaMHZnnnWHb6wBTd8Jdl3` and TypeScript pass. All **35 automated tests** pass, including four draft tests for localized exact references, invalid IDs, fixed/encoded mailto recipients and long-draft fallback. Read-only HTTP smoke passes in both local and isolated hosted mode: 86 source combinations, invalid products/filters, localized product-to-Studio links, navigation order, enquiry forms, private endpoint guards and staging SEO. Hosted guards still return 503 for unavailable persistence; they were not weakened.

Browser checks used Codex’s in-app Chromium browser on macOS with localhost/warm assets, no network throttling and viewport overrides. They are lab checks, not physical-device or field Core Web Vitals measurements.

| Check | Observed result |
|---|---|
| Home baseline/new at 1280×720 | Main DOM text token count 384 → 100; page height 5361 → 2576 px. Tokens use whitespace splitting of `main.textContent`, not an editorial word count. |
| Responsive Home | EN 390×844 and 1440×900; DE 768×1024. Source-image selection changes caption/image. No horizontal overflow at mobile/tablet; no Home canvas. |
| Product → Studio | `demo-932-gloss` opens Kitchen, 3D selected, exactly one canvas, front assignment identical to the URL. Existing shortlist remains five entries. Earlier check also verified `demo-505-2-frosted` after a 2D visit and EN→DE Studio routing. |
| Local Contact | Empty submit shows required errors and focuses the summary. Synthetic technical enquiry saves with zero selected IDs and blocked demo fulfilment. |
| Local Request | Synthetic sample enquiry saves exactly `["demo-932-gloss"]`; CRM/warehouse/email jobs are pending. Only those known synthetic records were inspected. No downstream message is sent. |
| Hosted Request | Prepare → editable review; exact Red/932/Gloss ID in draft; edit changes encoded mailto body; Copy reports success. Edit details restores fields. Switching to technical, then removing Red preserves the selected kind. |
| Hosted Contact | Technical enquiry with no selection prepares a review draft. Open email draft was deliberately not activated during QA. |
| Responsive forms/navigation | Contact EN 390×844, Request DE 390×844 and 768×1024 plus desktop forms. No horizontal overflow; mobile input font 16 px. Mobile Company is the third primary link. |

AX evidence covers labels, selected states, required errors, status text and focused error/review/success regions. Full screen-reader, OS reduced-motion and physical-phone tests remain release gates; no WCAG certification or fresh field-performance claim is made. Previous numeric 3D/performance reports remain historical.

See [screenshots](screenshots/README.md), [architecture](architecture.md) and [integration notes](api-integrations.md). All 86 surfaces remain illustrative demo references pending product approval and physical-sample verification.
