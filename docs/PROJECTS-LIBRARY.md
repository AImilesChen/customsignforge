# Projects design library

The Projects index separates24 illustrative sign concepts (four per product family) from six real fabrication samples. Existing URLs remain available and18 detail routes are added. A dedicated showroom hero replaces the repeated AVEN image. Product-type buttons are the main filter, application is secondary, and the mixed initial list shows12 cards before Load More. Result counts, active states and the recoverable empty state update together.

Each concept detail explains the setting, design decisions, proposed configuration, a clearly labelled fabrication reference, site preparation and custom options. Samples are not represented as details of a delivered concept. Related designs prioritise the same product family. Generated concepts do not claim completed deliveries. The gallery contains24 unique cover assets; homepage scene photographs are excluded from this set. Five new4:3 compositions replace repeated or unsuitable panoramas, with responsive variants and provenance in gallery-v2-assets.json.

`src/data/project-gallery.json` holds the24 reviewed concept presentations. The older project-presentations.json remains the baseline for existing fabrication presentations and migration tests. Each product scene has a projectSlug linking its card and enquiry to the published CMS record; unpublished or mismatched records do not appear in the product gallery. The CMS controls publication, title, introduction, image and gallery. Edited body text remains visible as additional information.

Migration0013_expanded_design_gallery.sql adds18 records only when the slug is absent and upgrades the six existing concepts field by field only when both draft and published values match the0010 baseline. Edited drafts, SEO, galleries and unpublished/occupied slugs are preserved. No-op fields are skipped so reapplication does not increase versions.

The enquiry link carries the exact project slug, product style and source path. The existing customer sign-in requirement and form/file flow remain in place. No new email or WhatsApp message is sent by this release.

Validation covers migration preservation/idempotence, four-per-family/unique-cover completeness, valid CMS fields and exact case/concept quotation context. Projects smoke checks31 pages (index plus30 details); product-depth smoke checks the six product routes and24 case handoffs. Browser review covers filters, load more, clear/empty states, detail navigation, image enlargement and customer sign-in return. Current evidence is under ignored docs/evidence/gallery-v2/.
