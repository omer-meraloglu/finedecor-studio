# Applications, homepage and studio refinement — 4 October 2026

**Historical report:** the six-3D/80-2D state below is superseded by [all-reference 3D and contact refinement](library-contact-refinement.md).

This local update gives the application pages distinct visual context, expands the homepage's source photography and makes the Material Studio easier to enter and inspect. The catalog now contains 86 source-reference demo variants; six have illustrative 3D assets and the remaining 80 use their source swatches in 2D. Photography and reference furniture do not assign a Fine Decor decor, establish application suitability or provide a calibrated material render.

## Application photography

The Kitchen page retains its Fine Decor source photograph. Living furniture, Bathroom furniture, Shopfitting, Doors and Caravans now use five distinct licensed inspiration photographs on both the application overview and the localized detail pages. Responsive focal crops preserve the relevant furniture or interior; image captions identify inspiration imagery and link to the credited source.

| Application | Credit | Published license |
|---|---|---|
| Living furniture | Julia / Beazy | Unsplash License |
| Bathroom furniture | Caroline Badran | Unsplash License |
| Shopfitting | Thom Bradley | Burst Some Rights Reserved |
| Doors | Caroline Badran | Unsplash License |
| Caravans | Alexander Lunyov | Unsplash License |

Source pages, license links, image dimensions, file sizes, checksums and review notes are recorded in the [asset and rights manifest](asset-rights-manifest.json). These photographs are editorial inspiration, with no variant assignment or named client project. Property/trademark rights and public company publication still require owner review. Application consultation pages continue to explain that no approved variant-level suitability mapping has been supplied.

## Homepage

The hero now offers three manually controlled Fine Decor photographs: the existing Kitchen image, the layered material photograph at `film.jpg`, and a source photograph of a film roll on production equipment. Buttons and previous/next controls select the image, pressed states identify the current choice, and localized captions retain provenance. Changes use a finite fade/scale transition; the gallery does not advance automatically. Reduced-motion preferences remove these image transitions.

A production section combines two Fine Decor source photographs with a company introduction and link. The images show production context; the page does not identify the pictured people, claim their current roles, assign a variant to the equipment or assert current production specifications. The Studio teaser now uses `film.jpg` and describes four reference scenes. Existing collection, knowledge, archive and sample enquiry paths remain available.

## Production-site enrichment

The rendered DE/EN product range was rechecked on 4 October 2026. Exactly 41 Frosted and 45 Gloss swatches, with their observed decor names and codes, are imported. Eighty new references remain 2D-only; the six prior IDs, source swatches and illustrative 3D assets remain compatible with saved studies. Different names sharing a code are separate decor identities; hidden legacy blocks and unsupported finish combinations are excluded. Family, SKU, dimensions, application mappings and document approvals remain unknown rather than inferred. The [catalog import ledger](production-catalog-import.json) records every pair, source URL, image dimensions and checksum.

The authorized original logo and verified production olive `#A5A51E` are retained. Darker same-hue action colours provide readable contrast; the source olive is used for identity and restrained accents. White and warm neutral surfaces carry the material imagery. [Palette evidence and contrast calculations](production-brand-audit.md) distinguish exact source colours from accessible UI derivatives.

Homepage family introductions, customer-led surface design and custom-colour/width consultation follow the current public company/product content. Company history includes scoped PET-development and FineLine milestones, with two additional company-gallery images. The [content source record](production-content-sources.json) records source hashes, contradictions and exclusions. Website marketing text is not treated as a technical test report. No current joint venture, certificate, industrial rating, recycled percentage, stock, lead time, price or free-shipping claim was added.

## Studio entry and scene behavior

A fresh full Studio starts in Kitchen and opens 3D after device storage is ready and the catalog/control interface has rendered. An existing private draft or saved/shared study restores its own scene, assignments, comparison, light and camera. A product-page preview still loads the shared renderer only after the user selects Inspect in 3D; its reference scene starts as a panel. Selecting 2D and capability/error fallback remain supported.

Table is the fourth scene alongside Front panel, Kitchen and Furniture unit. Its rectangular tabletop, edge, frame and legs are generic visualization geometry. Only the horizontal top receives the film through the existing `fronts` assignment key; the edge, frame, legs, walls and floor stay fixed. There is no Table accent slot. Changing from Kitchen or Furniture unit to Table drops the unsupported accent assignment, retains current comparison and intentional extra references, and fits the Table camera. Undo can restore the preceding scene and assignments.

Table comparison uses the same scene, saved camera, exposure, lighting and material implementation on both sides. Its Front camera is elevated so the horizontal top stays visible. Table saved projects, share links and localized study exports carry the same validated IDs and view settings as the other scenes. Exports identify Table/Tisch and tabletop roles, preserve preview limitations and remain design studies rather than technical specifications.

The Furniture unit's overlapping coplanar surfaces have been separated to remove depth-buffer flicker (z-fighting). This changes the generic reference geometry; it does not change catalog data or establish film thickness, edge wrapping, forming capability or industrial application suitability.

## Fullscreen

The workspace requests native browser fullscreen from the user's fullscreen control. The active workspace includes its tools, a visible exit action and save access where appropriate. Escape and exit restore normal layout and focus; navigating away cleans up the active view. Keyboard focus is kept within the expanded workspace while it is active.

When native fullscreen is unavailable, rejected or fails to open, a labelled fallback fills the browser window. Its status explicitly describes that browser-window behavior. It does not claim native fullscreen succeeded. The fallback retains the exit action, keyboard isolation and study state. Browser behavior is part of the verification below; no universal device-support claim is made.

## Automated verification

All 30 tests pass, and the final production build passes. Checks include supported catalog relationships; strict project/enquiry validation; private project ownership; save/share/revoke; selected-ID integrity; enquiry idempotency and outbox behavior; role permissions; current assignment/reference reconciliation; comparison cleanup; bounded undo/redo; scene-specific cameras; export escaping and localized labels.

Table-specific tests cover an actual private save/share/revoke round trip, exact saved camera/assignment/comparison values, rejection of an unsupported accent, scene transition cleanup, undo restoration and EN/DE tabletop export labels. The tests use a temporary database and synthetic data. They send no real messages, leads or dispatch requests.

## Browser verification

The optimized local product was inspected in the Codex in-app Chromium browser at 390×844, 768×1024 and 1440×900. No horizontal page overflow was observed. [Screenshot evidence](screenshots/README.md) includes application imagery, source content, the repaired unit sides and Table comparison. Screenshots taken before the final source import are explicitly identified in that index.

- All six application overview images are distinct and load. Living, Bathroom, Shopfitting, Doors and Caravans details use their appropriate image and credit; Kitchen retains the company photograph.
- Homepage gallery controls switch between Kitchen, Material and Production. EN/DE source family sections and company-gallery images render at mobile/tablet/desktop widths. Movement is finite, with CSS/renderer reduced-motion handling; no OS preference or physical-device motion matrix was changed or certified.
- A fresh Studio opens Kitchen/3D; existing Table studies restore their own comparison, light and camera. Furniture-unit views from both sides show separated geometry without the earlier side flicker. Table comparison renders the same scene/camera/light on both sides, with only the top assigned.
- Native fullscreen was verified with the workspace matching `:fullscreen`; a visible exit action and Escape both return to the normal workspace, restore focus, remove inert isolation and preserve the renderer instance. The viewport fallback was code-reviewed, not forced in this browser.
- A Table project saved locally, opened through an explicit share link with exact IDs/camera/light, and became unavailable after revocation. Its dated summary contains Table/top roles and chosen IDs, with no enquiry reference before a saved enquiry.
- Search `932` returns the actual Red/Gloss reference. New source-only PDPs show an honest 2D-only control. Selecting a source-only variant in the Studio returns to a useful 2D swatch rather than applying invented PBR values.
- Capacity regressions cover a full 12-reference study and a full shortlist: rejected additions preserve state; explicit study IDs take priority in the enquiry, while the original device shortlist is preserved and excluded extra references are acknowledged.
- A separate hosted-review server verified device draft save/reload, source catalog reads, native fullscreen, source-only fallback and enquiry email/phone fallback. It showed no contact-entry form and made no downstream requests. No real lead, email or dispatch was sent.

Keyboard and accessibility-tree observations verify named tabs, pressed/selected controls, exit focus, DOM material selection and status/error text. This is manual keyboard/AX evidence, not full screen-reader or WCAG conformance certification. Prior genuine context-loss evidence remains in [earlier Studio QA](studio-upgrade.md); context loss was not forced again for this final catalog import.

Final file budgets and build identity are in [asset measurements](performance-refinement-assets.json); local observations and limitations are in [browser measurements](performance-refinement-browser.json). Network is warm loopback without throttling, using a desktop Mac with responsive emulation. This does not establish physical mobile performance, field Core Web Vitals or universal fullscreen support.

## Hosted-review behavior

The user authorized one Git commit/push to the existing Vercel-linked repository for this update. Vercel's stateless filesystem is not used as a durable enquiry database. Hosted review reads the source catalog, keeps private drafts/shortlists on the device and directs real enquiries to the company's public email/phone. Server snapshots, share/export, admin writes and enquiry persistence are visibly unavailable there until durable production services are configured. API guards reject those operations before contact data or storage access. Local SQLite save/share/revoke/enquiry/outbox behavior remains available for review. Secrets, local databases and role credentials are excluded from Git and the source archive.

## Fidelity and release limits

The [material manifest](material-manifest.json) records the illustrative colours, finish parameters, scene geometry, lights and camera handling. No calibrated maps, physical scans, measured roughness or industrial gloss conversions were added. Every preview remains labelled “Illustrative preview — verify with a physical sample.” A Table scene demonstrates a reference substrate; it does not prove that a particular variant is suitable for tables or any manufacturing process.

The project remains a review product with `noindex`, including the authorized Vercel review update. Production still needs owner-approved catalog relationships, technical/care documents, image/logo publication review, calibrated material capture, regional/legal review, durable storage, real integration adapters and agreed physical-device/network verification. AI, AR and optional tracking remain disabled. Setup is in the [root README](../README.md); follow the existing [deployment and rollback checklist](deployment-checklist.md) before any authorized release.
