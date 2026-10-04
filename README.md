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

Latest refinement: [Material Studio upgrade](docs/studio-upgrade.md), including the new workspace, scenes, deliberate study selections, undo/redo, keyboard controls, printable exports and QA evidence. Earlier [motion and enquiry refinement](docs/motion-polish.md) remains documented.

## Try the core journey

1. Search Collections for `373`. Open OliveGreen Frosted or Gloss; Kaschmir/Sand Gloss deliberately do not exist.
2. Add surfaces to the shortlist. Open Material Studio, choose a scene, then **Load interactive 3D**.
3. Select A, Accent or B, then choose a surface. Use scene-specific Front/Detail, keyboard rotation, undo/redo and neutral/daylight/warm lighting. Only cabinet/front slots accept assignment; trying a surface does not keep it in the study.
4. Name and save a private snapshot. Additional shortlist references must be imported deliberately. Share requires explicit acknowledgement of visible fields. The local URL works only where this server is reachable; no cloud publishing is implied. Revoke invalidates every token for that snapshot.
5. Review the saved study and export it as printable HTML. It includes IDs, project ID/date and illustrative preview limitations. It is not a technical specification.
6. Request samples. The local confirmation returns a saved enquiry reference; no mail or dispatch occurs. Use the visible direct email/phone for a real enquiry.
7. Visit `/en/admin`; use one local role token from `.env.local`. Editorial draft → independent technical review → administrator publication. The demo editorial note is applied to the demo PDP; demo status and fulfilment block remain immutable.

## Local storage and privacy

SQLite lives in `.local-data/finedecor.sqlite`, outside public assets and excluded from Git. The process creates the directory with private permissions. Projects belong to an opaque HttpOnly, SameSite session cookie; share secrets are hashed in storage. Enquiries are separate and never appear in shared project payloads. Optional tracking/embeds/AI/AR are off. Owner-reviewed privacy and retention policy is required before launch.

For a local reset: stop the server, copy `.local-data/` to a private backup if needed, then remove `.local-data/finedecor.sqlite` and SQLite companion files. Restart to seed an empty demo store. Clear this site's browser storage to reset device shortlist/settings. Do not remove `.env.local` unless intentionally rotating local role tokens. Never package or publish either directory/file.

See [the handoff index](docs/README.md) for architecture, content provenance, CMS/API guides, measurements, screenshots and deployment/rollback checklist. All technical/company statements requiring owner approval are recorded there. TR is modeled but not published. The website stays `noindex`.
# finedecor-studio
