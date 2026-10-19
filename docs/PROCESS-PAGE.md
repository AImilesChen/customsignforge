# How It Works — visual process page

The existing `/how-it-works/` route now uses a dedicated presentation, following the approved audit architecture and the website's existing warm-white, charcoal and orange design system. A finished-sign hero and artwork inset introduce four stages: brief, specification and quote, production and checks, and delivery preparation.

Each stage explains what the customer shares, what we work through, and the next confirmation. Preparation guidance covers artwork, approximate dimensions, complete-sign quantity, location, destination and timing. The specification stage includes written order approval; the approval checklist separates artwork, dimensions, finish, mounting, commercial terms and delivery responsibilities. Eight accessible FAQ disclosures address the main starting, quoting, delivery and support questions.

Desktop alternates large images and copy, using 4:3 images to retain the full sign and drawing. Mobile places the stage heading before the image, followed by responsibilities. The overview is an ordered list rather than a second category menu. The former utility sidebar is removed. The hero, relevant stages and final section link to the existing authenticated enquiry with `/how-it-works/` retained as the source. No new form, login method or order-submission behavior is introduced.

## Content and publisher control

`src/data/process-content.json` contains the structured presentation. The existing page record remains editable. Custom titles, introductions, hero images, gallery additions and additional body copy remain supported. Known legacy body text is not rendered again as an additional long article; genuine custom copy remains discoverable in Additional Project Information.

Migration `0011_process_page.sql` replaces only the known default body when both draft and published versions still match. It normalises Windows newlines, leaves unpublished pages and edited drafts alone, and preserves SEO, galleries and field overrides. It is safe to repeat. Fresh seeds and the fallback copy use the same new four-stage body.

Public wording uses direct manufacturing-service language, without invented factory ownership, certificates, delivery guarantees, free design promises or fixed payment conditions. Shipping scope, local installation, electrical work and approvals remain project-specific.

## Images and provenance

- Two new planning/specification illustrations generated with the built-in image_gen tool; full PNGs are archived outside the public repository in `../design-assets/process-v2-sources/`.
- WebP masters in `public/assets/process-v2/`; six responsive derivatives in `public/assets/responsive/process-v2/`.
- [Prompt set](process-image-prompts.json) and [image ledger with dimensions and hashes](process-assets.json).
- Existing ATELIER sign concept links the brief, specification and finished appearance visually. All three are labelled as illustrative imagery, with example drawing dimensions explicitly identified.
- Existing real fabrication references show formed letters, internal lighting and edge detail. Their original supplier-brochure provenance is retained internally; the photos do not represent inspection evidence for a particular customer order.
- Packing uses the existing labelled AI process illustration, not an actual dispatch record.

## Verification and evidence

Unit tests cover the guarded migration, CRLF handling, repeatability, edited drafts, unpublished pages, custom field preservation, known-body detection, image provenance and enquiry parameters. `scripts/process-public-smoke.mjs` verifies the rendered route, four stages, approval area, FAQs, seven image assets and the anonymous sign-in handoff without sending email or submitting an enquiry.

Local browser review covers desktop, tablet and mobile reflow, full sign/drawing framing, FAQ keyboard operation and the process/quote links. Evidence and measurements are stored under ignored `docs/evidence/process-v2/` and `.runtime/acceptance/`.
