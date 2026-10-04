# Fine Decor Material Studio

A complete local B2B review product: Next.js 16.3.8 + React 19.2.6 + Three.js 0.186.1 + TypeScript + SQLite. Requires **Node 24** for the bundled `node:sqlite` API. Source is in this directory; no external account or paid service is required.

```sh
cd /Users/omermeraloglu/Desktop/fine-decor-studio
npm ci
npm run setup
npm run dev
```

Open http://127.0.0.1:4173/en or /de. If Node 24 is not in your PATH on this computer, the bundled runtime is `/Users/omermeraloglu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node`; prepend its directory to PATH before npm commands. `npm run setup` creates three private role tokens in `.env.local` without printing them. Keep them out of source control. Configure `FD_PUBLIC_ORIGIN` if changing the URL. Default port is 4173.

```sh
npm run typecheck
npm test
# With a local server running: node scripts/smoke.mjs
npm run build
npm start
```

The webpack build is deliberate: the local Turbopack production compiler encountered an internal port permission failure. Dev uses Turbopack; production build uses supported webpack. Tests use a separate temporary database and synthetic contact data. They send no messages.

Latest refinement: [applications, homepage and studio](docs/applications-home-studio-refinement.md), covering distinct inspiration photography, a controlled source-image gallery, the production story, a fresh Kitchen preview, the fourth Table scene and native fullscreen with a viewport fallback. The earlier [Material Studio upgrade](docs/studio-upgrade.md) and [motion and enquiry refinement](docs/motion-polish.md) remain documented with their dated QA evidence.

## Try the core journey

1. Search Collections for `373`. Open OliveGreen Frosted or Gloss; Kaschmir/Sand Gloss deliberately do not exist.
2. Add surfaces to the shortlist. A fresh full Material Studio opens the Kitchen scene and loads 3D after the catalog and controls appear. Existing private drafts and saved/shared studies retain their scene. Product-page previews load after **Inspect in 3D**. A useful 2D reference remains available if 3D cannot run.
3. Choose Front panel, Kitchen, Furniture unit or Table. Select A, Accent where available, or B, then choose a surface. Table assigns the film only to its top; hardware, edges, bodies, walls and floors stay fixed. Use scene-specific Front/Detail, keyboard rotation, undo/redo and neutral/daylight/warm lighting. Enter fullscreen for a larger workspace; unsupported browsers receive a labelled view that fills the browser window. Trying a surface does not keep it in the study.
4. Name and save a private snapshot. Additional shortlist references must be imported deliberately. Share requires explicit acknowledgement of visible fields. The local URL works only where this server is reachable; no cloud publishing is implied. Revoke invalidates every token for that snapshot.
5. Review the saved study and export it as printable HTML. It includes IDs, project ID/date and illustrative preview limitations. It is not a technical specification.
6. Request samples. The local confirmation returns a saved enquiry reference; no mail or dispatch occurs. Use the visible direct email/phone for a real enquiry.
7. Visit `/en/admin`; use one local role token from `.env.local`. Editorial draft → independent technical review → administrator publication. The demo editorial note is applied to the demo PDP; demo status and fulfilment block remain immutable.

## Local storage and privacy

SQLite lives in `.local-data/finedecor.sqlite`, outside public assets and excluded from Git. The process creates the directory with private permissions. Projects belong to an opaque HttpOnly, SameSite session cookie; share secrets are hashed in storage. Enquiries are separate and never appear in shared project payloads. Optional tracking/embeds/AI/AR are off. Owner-reviewed privacy and retention policy is required before launch.

For a local reset: stop the server, copy `.local-data/` to a private backup if needed, then remove `.local-data/finedecor.sqlite` and SQLite companion files. Restart to seed an empty demo store. Clear this site's browser storage to reset device shortlist/settings. Do not remove `.env.local` unless intentionally rotating local role tokens. Never package or publish either directory/file.

See [the handoff index](docs/README.md) for architecture, content provenance, CMS/API guides, measurements, screenshots and deployment/rollback checklist. All technical/company statements requiring owner approval are recorded there. TR is modeled but not published. The website stays `noindex`.

## Source enrichment and hosted review

The catalog mirrors 86 currently rendered Fine Decor `.de` colour/finish references (41 Frosted, 45 Gloss), with exact source swatches. They are demonstration references, not confirmed sellable inventory. Six existing references have illustrative 3D materials; 80 additions are 2D-only pending suitable material assets. Source identities, spelling conflicts, hashes and exclusions are recorded in `docs/production-catalog-import.json`. The homepage/company content and brand palette are documented in `docs/production-content-sources.json` and `docs/production-brand-audit.md`.

On Vercel, browsing and 3D work with private device drafts. Server save/share/enquiry/admin operations are deliberately unavailable until durable storage is configured; the hosted enquiry page uses email/phone fallback and collects no contact details. Local Node 24 continues to provide the complete SQLite workflow. Canonical origin uses `FD_PUBLIC_ORIGIN` or trusted Vercel deployment configuration. Staging remains noindex and real integrations remain off.

Final verification for this update: 30 automated checks, optimized build, route smoke, responsive browser inspection and native fullscreen/Escape pass. Evidence and measured budgets: [latest QA](docs/applications-home-studio-refinement.md). Commit/push authorization applies to this update only.
