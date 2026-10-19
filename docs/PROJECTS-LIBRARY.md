# Projects design library

The Projects index separates six AI-generated installation directions from six real fabrication samples. Existing project URLs remain available. The list uses consistent 4:3 scene photography, application and sign-style filters, result counts and a recoverable empty state. Sample cards use containment to preserve visible construction details.

Each scene detail explains the intended setting, three design decisions, a proposed configuration, two relevant visual references, site preparation and custom options. Sample pages explain specific construction decisions. Concepts do not claim customer deliveries, fixed materials, dimensions or certification. Gallery captions distinguish illustrative details from real samples. Asset provenance stays in the existing supplier, homepage and product asset ledgers.

`src/data/project-presentations.json` holds the reviewed presentation content. The published CMS record controls visibility, title, intro, hero image, classification, application, product relation and gallery. Edited CMS body text remains visible as additional information. Unknown project slugs use a Markdown fallback. Unpublished records are never added to the visible list from the source catalogue.

Migration `0010_projects_library.sql` updates only recognised starter fields when both draft and published values still match the baseline. Custom drafts, SEO, edited galleries, source records and unpublished entries are preserved. Four new concept records are inserted only if their slug is absent. Reapplying the migration is safe.

The enquiry link carries the exact project slug, product style and source path. The existing customer sign-in requirement and form/file flow remain in place. No new email or WhatsApp message is sent by this release.

Validation: migration preservation/idempotence and CRLF tests; CMS round-trip checks; filter intersection and quote-context tests; Astro check and production build; `scripts/projects-public-smoke.mjs` checks all 13 pages and image assets. Browser review covers desktop/mobile, filtering and login handoff. Screenshots and runtime QA outputs are local evidence under ignored `docs/evidence/projects-redesign/`.
