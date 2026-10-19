# Product overview and detail galleries

The overview opens with a wide architectural sign scene and a concise project CTA. There is no in-page category menu. The global Products link and its independent category disclosure remain available. Seven alternating image/text sections explain the six product families, separating lightbox and neon effects. Primary scene images now show designed logos, supporting lettering, material depth and lighting in context.

All six product pages now place a named design gallery directly after the hero and before technical explanations. Each has four cases in a two-column desktop/single-column phone grid. Cards show the case title, setting and light/material characteristics, with View Design and Request a Similar Look actions. The same24 cases are available in the Projects library; the card resolves its published record by projectSlug. Existing image enlargement is retained. Long explanations live in case details instead of repeating beside every image.

Every scene enquiry retains product, concept ID and project slug, plus a valid variant where applicable. Customer sign-in preserves the complete return path. The existing form recognises the case and saves its project relation through the existing schema. Migration0013 adds the published case records; no enquiry schema or authentication changes are needed. Contact requirements and private uploads remain intact.

Each family has six FAQs and three specific technical explanations. Configuration, materials, exposure, mounting and destination requirements remain subject to project confirmation. Generated imagery is explicitly labelled as design concepts, with fabrication references kept separately; no generated scene is presented as a delivered customer project.

## Image deliverables

- Original product-depth asset set:16 selected images, including the overview hero and15 sign compositions.
- Gallery expansion adds five compositions generated with built-in image_gen: dedicated library hero, clinic front-lit sign, unlit architecture entrance, teal reception halo sign and dining halo sign. WebP masters and400/800/1200px variants are in assets/gallery-v2 and assets/responsive/gallery-v2. Source PNGs are archived outside the public repository under design-assets/gallery-v2-sources. See gallery-v2-assets.json for provenance, dimensions, hashes and prompt briefs.
- Optimised WebP masters in `public/assets/product-depth/` and 400/800/1200px responsive versions in `public/assets/responsive/product-depth/`.
- [Generation prompts](product-depth-prompts.json), including the reference approach.
- [Asset provenance, dimensions and hashes](product-depth-assets.json).
- Original generated PNGs archived outside the public repository in the project's `design-assets/product-depth-sources/` folder.

The reference was the user's competitor screenshot: sign-dominant photography, individual logo marks, secondary lettering and legible construction. New brand compositions were generated independently. The raw PNGs are retained as source material; only optimised website derivatives are published.

## Verification

Unit tests check scene lookup, cross-product rejection, exact enquiry context, valid variants and asset provenance. Public smoke scripts check the overview, all six detail routes, image responses and anonymous sign-in handoffs without submitting customer data. Browser review covers desktop/mobile composition, image enlargement, FAQ disclosure and navigation. Evidence is stored under ignored `docs/evidence/product-depth/`.
