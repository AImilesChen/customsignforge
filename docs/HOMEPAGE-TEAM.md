# Homepage team and advantages

The user approved the existing homepage architecture and then supplied two Signs.inc reference screenshots: a short editorial story beside one photograph, followed by simple icon/title/sentence benefit cards. This revision applies those compositions with Custom Sign Forge's warm orange and existing navigation, customer sign-in and enquiry flow.

## Content and layout

- Six product families now appear on the homepage in a three-column, two-row desktop grid. Existing published family routes are reused; unpublished families remain excluded.
- The story uses two short paragraphs and three qualitative strengths. No headcount, years, capacity, certification, local installation or warranty claim is introduced.
- Six cards explain craftsmanship, custom artwork, fabrication, materials/light, checks and communication. They use the installed Phosphor icon library.
- Three real photographs from the authorised brochure replace the AI process illustrations in this section. The main picture shows hands-on workshop activity; clearly labelled buttons let visitors view inspection and packing. Selection works with keyboard activation and is exposed with aria-pressed; the descriptive caption updates politely.
- Warm graphite/orange tokens are retained. Georgia is used locally for the two editorial headings, with the established Manrope and Source Sans 3 for UI and readable copy. No remote font request is added.
- Only off-screen content opts into a single fade/18px entrance after hydration. Content is visible without JavaScript or IntersectionObserver; reduced-motion preference disables the effect and a preference change reveals all pending items. No autoplay, animated counters or scroll hijacking.

## Sources and maintenance

Copy and photograph options: `src/data/home-content.json`. Image provenance: `docs/home-team-assets.json`. Original embedded photographs are encoded as WebP without AI-created workers or equipment. Packing retains the source two-photo image and uses CSS positioning. No brochure screenshot, caption strip, invented statistic or competitor business claim is embedded in the design.

Existing product concept photographs remain labelled as concepts. Team photographs are manufacturing references from the user-provided brochure, not customer installation records.

## Validation

Run `npm test`, `npm run check`, `npm run build:production`, and `node scripts/home-public-smoke.mjs` (set TEST_ORIGIN for local QA). Browser checks cover desktop/mobile, image selection, all six product entries, enquiry context and horizontal overflow. Current visual comparison and browser evidence are recorded in `design-qa.md` and the ignored `docs/evidence/home-team/` directory.
