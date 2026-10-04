> Latest source recheck: 4 October 2026. The current visible EN/DE finish galleries contain 86 pairs (41 Frosted/Matt, 45 Gloss/Hochglanz). Exact entries/assets, same-code name conflicts and excluded hidden Glaslaminat data are recorded in [production-catalog-import.json](production-catalog-import.json). New company/product copy and source photographs are recorded in [production-content-sources.json](production-content-sources.json); observed colours in [production-brand-audit.md](production-brand-audit.md). All references remain demos pending PIM/technical approval. Earlier notes below describe the original six-reference seed and remain historical evidence.

# Fine Decor source audit

Checked 3 October 2026 (Europe/Istanbul). Live in-app browser rendering was inspected for the English home/products/contact pages, German careers page and English event archive. Web fetches also inspected the German products/company, English company, Turkish company and Schattdecor announcement. Public marketing content establishes provenance, not technical approval. Final authority remains owner-approved PIM and current applicable technical reports.

## Publishable company context with source attribution

| Topic | Observation | Build decision | Source |
|---|---|---|---|
| Industrial offer | Fine Decor develops and produces PET decorative films for the furniture industry; company dates its founding to 2004. | Use concise context, without market-leadership or customer-result claims. | [English home](https://www.finedecor.de/en/) |
| Current location blocks | Both company locales identify Oelde as head office/production, Aurea 21, 59302 Oelde; Bielefeld warehouse, Am Niedermeyers Feld 8, 33719 Bielefeld. | Display as source-reported locations pending owner confirmation of exact operating/legal descriptions. | [German company](https://www.finedecor.de/ueber-fine-decor/), [English company](https://www.finedecor.de/en/about-fine-decor/) |
| History | Istanbul branch appears in 2009 history. FineLine Innovation is described as a sister company in the 2019 history. | Historical context; do not infer current production or sales responsibilities. | [German company](https://www.finedecor.de/ueber-fine-decor/) |
| General contact | Rendered contact page states Office: Aurea 21, 59302 Oelde; +49 2522 937 97 0; info@finedecor.de. | General Germany enquiry fallback. Regional routing needs approval. | [English contact](https://www.finedecor.de/en/contact/) |
| Participation | Schattdecor announcement dated 21 June 2024 says partnership ends and its 50% stake is sold to founder Hasan Sekmann. It directs Fineflex purchase enquiries to Fine Decor. | No current joint-venture claim. | [Schattdecor announcement](https://www.schattdecor.com/en/news/dissolution-of-the-participation) |

## Small source-observed subset

The rendered [English products page](https://www.finedecor.de/en/our-products/) has separate **Frosted** and **Gloss** tabs. The following six combinations were checked, including active Gloss rendering. These are source identifiers, **not owner-approved sellable SKUs**. Unknown SKU, dimensions, processing, technical report scope and calibrated material assets remain null. Store stable demo IDs that include finish; code alone is insufficient.

| Decor code | Exact source name | Source finish | Swatch source filename |
|---|---|---|---|
| 373 | OliveGreen | Frosted | `41_373-OliveGreen.jpg` |
| 373 | OliveGreen | Gloss | `27_373-OliveGreen-copy.jpg` |
| 425 | SlateGrey | Frosted | `36_425-SlateGrey.jpg` |
| 425 | SlateGrey | Gloss | `23_425-SlateGrey-copy.jpg` |
| 255 | Kaschmir | Frosted | `13_255-Kaschmir.jpg` |
| 1121 | Sand | Frosted | `15_1121-Sand.jpg` |

All six filenames are under `https://www.finedecor.de/wp-content/uploads/2020/11/`. Do not create Kaschmir Gloss or Sand Gloss. Fineflex and lacquered laminate are public family names, but the swatch gallery does not explicitly attach each identifier to a family. Demo family assignments require owner reconciliation. Screens are expressly indicative; swatch photography does not establish measured PBR appearance.

The [German products page](https://www.finedecor.de/unsere-produkte/) lists kitchens, living furniture, shopfitting, bathroom furniture, interior doors and caravans at portfolio level. This supports application navigation only. It does not establish suitability of each selected variant. It offers consultation on colours, widths and application. The public source mentions free DIN A4 samples; owner confirmation of current terms, regions and dispatch is still needed before the new site promises them. No shipping price or delivery date is established.

## Contradiction and evidence ledger

| ID | Issue | Resolution required / treatment |
|---|---|---|
| C-01 | English company has current Oelde/Bielefeld location blocks followed by old prose naming Bielefeld headquarters. | Prefer location block in demo; obtain exact owner-approved office/production descriptions. |
| C-02 | Turkish page reports the Türkiye company founded in 2009, exports to Europe/domestic and other regions, and an Istanbul address. It does not assign exclusive regional sales responsibility. | Keep TR unpublished; approve contact routing and translation. [Regional source](https://www.finedecor.com.tr/hakkimizda) |
| C-03 | .de says PVC has fully been replaced by PET; older Turkish prose says almost all PVC has been replaced. Legacy regional range must be reconciled. | Do not list legacy PVC/3D products as current. |
| C-04 | Text extraction/hidden DOM includes Glaslaminat and old dimension/test tables; current rendered English visible range presents Fineflex/lacquered laminate. | Do not promote hidden/cached glass-laminate tables to current specification. PIM owner must resolve range. |
| C-05 | Marketing mentions recycling/environmental benefits, scratch/chemical/light resistance, REACH and Golden M without current variant-scoped technical documents supplied. | Withhold these product claims/certificate validity from demo. Obtain wording, scope, version, issue/review date, evidence and technical approval. |
| C-06 | English careers extraction contains `[jobs]` and two training examples; German rendered page has different training examples and no verified vacancy list. | Link to source/contact; do not invent current vacancies. [DE careers](https://www.finedecor.de/karriere/), [EN careers](https://www.finedecor.de/en/career/) |
| C-07 | Source EN form privacy link points to the imprint; English/footer legal destinations also vary. | Provide distinct new regional review placeholders with equivalent locale routes; do not copy broken routing. |

## Documents, news, legal and rights

The product page links to `https://www.finedecor.de/pdf/Pflegerichtlinien_PET.pdf` and `https://www.finedecor.de/wp-content/uploads/2020/10/Pflegerichtlinien_PET.pdf`. Retrieval through the web tool failed. Their contents/version/current scope were not verified. Treat as external legacy care sources pending technical review, not approved current downloadable technical reports.

[PR/events](https://www.finedecor.de/en/pr-events/) renders Sicam 2023 and Interzum 2023 alongside older events. Source press links include Möbelfertigung 2019, Material und Technik 2016 and older press. Label archived events/press by source year; do not invent 2026 news or dates. Copyright/reuse approval for third-party press PDFs is separate.

Rendered .de footer links [whistleblower system](https://finedecor.integrityline.com/), [imprint](https://www.finedecor.de/impressum/), [privacy](https://www.finedecor.de/datenschutzerklaerung/) and [cookie directive](https://www.finedecor.de/cookie-richtlinie-eu/). These source documents do not approve the demo's new backend retention, tracking or regional policies.

The user authorizes using source websites for assets in this local demo. The [asset manifest](./asset-rights-manifest.json) records observed originals. Wider publication needs owner rights confirmation. Application photos carry no verified decor assignment, client identity or measured colour fidelity. No normal/roughness/clearcoat scan maps or physical scale/calibration evidence was supplied.
