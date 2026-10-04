# Public Fine Decor brand palette — 4 October 2026

The current `.de` visual sources establish **#A5A51E** as Fine Decor’s olive. It appears in the original company logo, the Elementor global accent, a homepage contact band, and branded header/footer button rules. This review records public evidence; an owner-approved corporate identity manual has not been supplied.

The [English homepage](https://www.finedecor.de/en/) was fetched again during this build. Its stylesheet references identify the [Elementor kit](https://www.finedecor.de/wp-content/uploads/elementor/css/post-11.css), [homepage styles](https://www.finedecor.de/wp-content/uploads/elementor/css/post-1778.css), [header styles](https://www.finedecor.de/wp-content/uploads/elementor/css/post-2414.css), and [footer styles](https://www.finedecor.de/wp-content/uploads/elementor/css/post-1830.css). The [original logo](https://www.finedecor.de/wp-content/uploads/2020/09/FineDecor_Logo_m.png) was verified against the existing local logo: identical 6,975-byte file, SHA-256 `155d0ff7ed5d9015e068dc0ad0986d0a4e4d593c5b56e4baae46a4aba1080551`, 200×102 pixels. Its 2,124 opaque coloured pixels use RGB 165/165/30, or **#A5A51E**. The logo itself was retained unchanged.

| Observed value | Public source role |
|---|---|
| #A5A51E | Logo, global accent, branded buttons and homepage band |
| #9F9E00 | Kit button background, field borders and inline heading override |
| #333333 | Global primary text |
| #7D7D7D | Kit body text |
| #A1A9AF | Global text token |
| #FFFFFF | Kit/page background and button text |

The HTML also contains the generic Twenty Twenty theme accent #E22658. It was excluded: the company’s branded Elementor rules and original logo provide the relevant olive evidence. No external stylesheet, script, font download or tracker was imported into the local product.

## Local implementation

[Global CSS](../app/globals.css) now records the exact source olives as `--brand-olive` and `--brand-olive-secondary`. Logos and decorative accents can use the original colour. Action backgrounds and olive text use **#636312**, obtained by multiplying the source RGB channels by 0.60. Hover uses **#53530F**, the same hue darkened by 0.50 with half-up channel rounding. These are explicit local accessibility variations, not claimed additional official brand colours.

Primary text follows source #333333. Supporting text uses a darker neutral #666666. The existing warm paper #F8F8F2 remains; subtle panels, highlights and decorative separators blend 12%, 8% and 30% of the observed olive into that paper, producing #EEEED9, #F1F1E1 and #DFDFB2. Input boundaries use #8B8B19, an 84% source-RGB variation. Focus uses the accessible dark olive.

Only colour tokens and colour declarations changed. Layouts, animation timings, original logo proportions, source swatches and 3D material parameters remain intact. Component-specific homepage styling is maintained separately. The complete palette, source hashes, exact derivations and contrast results are in [production-brand-palette.json](production-brand-palette.json).

## Contrast evidence

Solid sRGB pairs were calculated with WCAG relative luminance and checked against unrounded thresholds. Normal text uses 4.5:1; meaningful non-text boundaries use 3:1. These thresholds come from [W3C’s contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) and [non-text contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).

| Pair | Ratio | Use |
|---|---:|---|
| White / original olive #A5A51E | 2.62:1 | Insufficient for normal CTA text; keep exact olive for identity/decorative accents |
| White / source alternate #9F9E00 | 2.85:1 | Insufficient for normal CTA text |
| White / dark action #636312 | 6.32:1 | Primary action |
| White / dark hover #53530F | 8.04:1 | Action hover |
| #333333 / warm paper | 11.85:1 | Primary text |
| #666666 / warm paper | 5.39:1 | Supporting text |
| #666666 / tinted panel | 4.89:1 | Supporting text on panels |
| #636312 / warm paper | 5.93:1 | Olive text and focus ring |
| #636312 / tinted panel | 5.38:1 | Selected-state text |
| #8B8B19 / warm paper | 3.39:1 | Input boundary |
| #8B8B19 / white | 3.62:1 | Input boundary |

The source body grey #7D7D7D gives 3.86:1 on the retained warm paper; the source global text token #A1A9AF gives 2.38:1 on white. They were not copied into small body text. Decorative separators are not used as the sole input boundary. Exact logo pixels are preserved; the logotype exception is distinct from the readable text/action requirements elsewhere.

These checks cover defined solid-colour pairs. They do not establish WCAG conformance for every rendered element, photograph overlay, transparency, state or component-specific rule. Owner brand review, rendered visual checks, text scaling and assistive-technology QA remain part of the release checklist.
