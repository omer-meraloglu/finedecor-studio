# Company imagery — 6 October 2026

The current rendered [German Company page](https://www.finedecor.de/ueber-fine-decor/) contains eight unique editorial photos: a laboratory study, three Fine Decor/Bielefeld gallery images and four FineLine/Oelde gallery images. Carousel clones are deduplicated. Shared logos remain in the header/footer; language flags and template icons are not editorial gallery photos.

All eight photos now appear on both local Company routes: the laboratory image introduces the page, followed by the seven remaining images in visible responsive grids. Source photos retain their complete 2:1 framing, descriptive localized alt text and short source captions. Width/height reserve space; gallery photos load lazily. Repeated explanatory prose was replaced with the gallery while history, contact links and scoped quality information remain.

The white facade with Fine Decor signage previously used as this site's first Company image (`/media/interior.jpg`) now appears in Home's company section. Its focal crop keeps the full sign visible at mobile width. Home keeps its five-section structure and existing restrained/reduced-motion behavior.

The Golden M graphic is included as an explicitly labelled source archive, with current certification scope unverified and a link to the original page. No certification, technical performance, stock or operating-capacity claim was added. The public source's broad image alt claims were not copied.

## Assets and verification

[Source inventory](company-image-sources.json) and [rights manifest](asset-rights-manifest.json) record exact URLs, visual descriptions, dimensions, bytes and SHA-256. Six new photos and one graphic add **227,105 bytes**. Two existing photos are reused; all eight Company photos total **292,193 bytes**, plus the **19,195-byte** archived graphic. Source bytes are preserved; no measured material or product-specific data is inferred from photography.

- Final optimized build `QXfqTRRITIxA3k9FmAo0R` and TypeScript pass.
- Existing read-only HTTP smoke passes, covering catalog integrity, exact Studio links, navigation, localized forms, private access and staging SEO.
- Browser DOM inspection confirms all eight photos loaded at their source 600×300 dimensions; the archive graphic loaded at 250×250.
- Company screenshots were inspected at EN 1440×900, EN 390×844 and DE 768×1024. Mobile uses a single gallery column; no horizontal overflow at mobile/tablet. Source-gallery links and archived-scope text are exposed to the accessibility tree.
- Home's moved photo was inspected at 1440×900 and 390×844; the mobile image remains inside the page width with the complete Fine Decor sign visible.
- Browser console showed no warnings/errors in the final inspected tab. This is viewport/browser lab evidence, not a physical-device or full accessibility certification. No new unit tests were introduced for this presentation-only change; previous enquiry/catalog logic is unchanged.

See [screenshots](screenshots/README.md). After local verification, the user separately authorized committing and pushing this image update to the existing GitHub repository and hosted review. Company-domain release and current certification approval remain separate dependencies.
