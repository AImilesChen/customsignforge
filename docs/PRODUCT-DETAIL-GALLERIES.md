# Product overview and detail galleries

The overview opens with a wide architectural sign scene and a concise project CTA. There is no in-page category menu. The global Products link and its independent category disclosure remain available. Seven alternating image/text sections explain the six product families, separating lightbox and neon effects. Primary scene images now show designed logos, supporting lettering, material depth and lighting in context.

All six product detail pages include three construction considerations, a large featured design concept and an explained gallery. There are 25 concepts: five halo-lit directions and four for every other family. Gallery entries explain the appearance, intended setting, design characteristics and information needed to adapt the idea. Four-scene pages end with a wide composition; mobile layouts use one column. Images can be enlarged using the existing accessible modal. Repeated full-scene photos were removed from metal and acrylic construction details.

Every scene links to an authenticated enquiry with the product and concept ID preserved. Valid combined-product variants are also retained. The form resolves known concept IDs within the chosen product and pre-fills an editable note. This continues through existing enquiry storage and WhatsApp summaries; no new database fields or migration are needed. Contact requirements, authentication and private uploads remain in place.

Each family has six FAQs and three specific technical explanations. Configuration, materials, exposure, mounting and destination requirements remain subject to project confirmation. Generated imagery is explicitly labelled as design concepts, with fabrication references kept separately; no generated scene is presented as a delivered customer project.

## Image deliverables

- 16 selected images: one overview hero and 15 new sign compositions, generated with the built-in image_gen tool.
- Optimised WebP masters in `public/assets/product-depth/` and 400/800/1200px responsive versions in `public/assets/responsive/product-depth/`.
- [Generation prompts](product-depth-prompts.json), including the reference approach.
- [Asset provenance, dimensions and hashes](product-depth-assets.json).
- Original generated PNGs archived outside the public repository in the project's `design-assets/product-depth-sources/` folder.

The reference was the user's competitor screenshot: sign-dominant photography, individual logo marks, secondary lettering and legible construction. New brand compositions were generated independently. The raw PNGs are retained as source material; only optimised website derivatives are published.

## Verification

Unit tests check scene lookup, cross-product rejection, exact enquiry context, valid variants and asset provenance. Public smoke scripts check the overview, all six detail routes, image responses and anonymous sign-in handoffs without submitting customer data. Browser review covers desktop/mobile composition, image enlargement, FAQ disclosure and navigation. Evidence is stored under ignored `docs/evidence/product-depth/`.
