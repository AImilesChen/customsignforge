# Homepage hero: workshop, scenes and manufacturing strengths

The approved direction follows the supplied Signs.inc homepage composition: a photographic manufacturing backdrop, integrated navigation, concise benefit-led copy, a portrait scene carousel and a horizontal strengths band. The implementation keeps Custom Sign Forge's orange palette, existing logo, customer sign-in and quote workflow. This is an adaptation for the brand, not a copy of the competitor's claims.

## Content and layout

- Homepage navigation uses the white brand logo on the dark backdrop. Inner pages retain the graphite logo and white header. Product overview and category links, About Us, contact, account and quotation remain available. Mobile navigation opens an opaque dark panel with readable light text.
- A real existing workshop photograph provides the subdued full-width background. No generated manufacturing or team photograph was introduced.
- Main headline: “Custom Signs. Built to Make Your Brand Stand Out.” Georgia provides the editorial display face, with the existing Manrope controls and Source Sans 3 body copy. Orange emphasis is reserved for the benefit and primary action.
- The quote button preserves `source=homepage-hero&entry=%2F&cta=content` through the customer sign-in return, using the existing attribution schema. The secondary action opens `/products/`.
- Three portrait scenes show a storefront, reception and hospitality entrance. Each includes its product type, short benefit, product-page link and AI concept disclosure. The existing storefront image is preserved. Reception and hospitality were newly generated as portrait compositions rather than cropped from landscape images. All scene images use `object-fit: contain` and a4:5 image region so the whole image remains visible.
- The bottom band uses the central manufacturing profile:10+ years refers to senior craftspeople's experience,100+ to the production team and30+ to production machines. “Made to your brand” describes the customisation offer. None is presented as a founding date, customer rating or certification.

## Carousel behaviour

Autoplay advances every6.5 seconds. Hover, keyboard focus and a hidden browser document pause advancement. The pause/start control is explicit. Manual previous/next or numbered scene selection stops autoplay until the visitor starts it again. OS reduced-motion preference disables autoplay and the scene entrance animation. Scene controls are labelled and the selected button exposes `aria-current`; announcements are disabled during automatic rotation and polite during manual exploration.

The image panel retains its portrait ratio across desktop and mobile. Phone layouts stack the copy and carousel, use full-width primary/secondary actions, and retain customer sign-in in the header. The mobile menu also provides a quotation link.

## Assets and verification

Asset provenance and complete generation prompts: `docs/hero-v3-assets.json`. Generated files and400/800px WebP variants are committed; originals and source landscape images remain unchanged. Generated source output is1113x1413 for reception and1040x1300 for hospitality. The reception ratio differs slightly from4:5; containment preserves all pixels rather than trimming it.

Visual evidence: `docs/evidence/hero-immersive/`. `design-qa.md` records the competitor comparison, focused typography and mobile iterations. Browser checks cover scene selection, menu/category disclosure, keyboard dismissal, responsive geometry and the authenticated quote return. `node scripts/home-hero-public-smoke.mjs` checks public rendering, assets, quote context and the inner-page header. Set `TEST_ORIGIN` to run it against a local build.
