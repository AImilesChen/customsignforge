# Thai (Thailand) implementation

The Thai site uses `/th/` and `th-TH`. English, Simplified Chinese and Malay retain their existing routes. The language menu maps to the same page where possible and preserves query strings and fragments. All versions share the same customer account and enquiry records; no new database is needed.

## Lessons from the first Chinese release

The Chinese launch revealed three recurring issues: translated text exceeded the dimensions of navigation and image-adjacent layouts; image frames used the wrong aspect ratio or cropped important sign details; and fallback assets/low-contrast text made some product pages look broken. The Thai implementation keeps the repaired shared public layouts and original image assets, with Thai-specific typography and spacing in `src/styles/thai.css`. Image paths, ratio rules, captions and illustrative-image labels are not translated into new assets. The product overview hero, six product-detail galleries and About images were checked at mobile, tablet and desktop widths.

## Content ownership

- `src/data/th/public.json` covers the shared public page and product-detail source strings.
- `src/data/th/messages.json` covers navigation, customer account, enquiry, privacy and shared interface strings.
- `src/data/th/projects.json` supplies case titles, retaining fictional brand names and distinguishing concepts, client projects and fabrication references.
- `src/data/th/overrides.json` corrects high-visibility product, marketing, enquiry and policy wording. Keep new Thai wording here when changing an existing source string.
- `src/lib/thai-content.mjs` applies controlled text to the shared public data without changing stored customer content or image paths.

The initial catalogs were machine translated and then key pages and forms were reviewed in context. A Thai native speaker should review sales and legal wording before a paid campaign. Do not imply that illustrative images are completed customer projects, or that local installation, warranty or delivery is included unless expressly confirmed in the quote.

## Search terminology review

Before release, the six product names, visible product headings, SEO titles and descriptions were checked against Thai signage suppliers' published product language. The primary terms now include `ป้ายอักษรไฟออกหน้า`, `ป้ายอักษรไฟออกหลัง`, `ป้ายอักษรโลหะ`, `ป้ายอะคริลิก`, and `ป้ายกล่องไฟ LED`; the neon category remains explicitly a *style* so the page does not promise a particular neon material. Examples: [OCTOPUS front-lit letters](https://www.octopus.co.th/products/front-lit-letter-sign), [Wesignlab product categories](https://www.wesignlab.co.th/) and [Piya Advertising lightboxes](https://www.piyaadvertising.com/light-box.html). This is a terminology and intent check, not a claim about search volume or rankings. Google advises writing page titles in the page's own language and aligning them with its visible subject: [Google Search Central title guidance](https://developers.google.com/search/docs/appearance/title-link).

## Privacy, search and release

Thai public routes use self-canonical URLs, `th-TH` hreflang alternatives and sitemap entries. Private account, sign-in, quote, admin, API and preview routes remain noindex and are excluded from external analytics. Policy pages retain their draft/noindex treatment. The chosen language is stored for new enquiries, while customer-entered names, notes and file information remain verbatim. The “have drawings” selection still allows submission without an upload.

Before publication, run `npm run check`, `npm test` and `npm run build:production`; smoke-test all Thai routes and compare the key layouts at 320, 390, 768 and 1440 pixels. Confirm a real Thai login email and enquiry only in an authorized staging environment, not by submitting a live test enquiry. Publication to the live domain is separate from local development.
