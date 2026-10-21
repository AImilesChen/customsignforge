# Bahasa Melayu (Malaysia) implementation

The English site remains at `/`, Simplified Chinese at `/zh/`, and Malay at `/ms/`. The language menu keeps the current page, query string and fragment when the matching page exists. All three variants use one locale registry in `src/lib/locale.mjs`; the Malay document language and search alternate are `ms-MY`.

## Content ownership

- `src/data/ms/public.json` contains Malay wording for the public Chinese-layout sections. `src/lib/malay-content.mjs` applies it to the controlled public site and product-detail data; image paths and numerical figures remain unchanged.
- `src/data/ms/projects.json` supplies the project titles. The underlying case and fabrication records stay the same across languages.
- `src/data/ms/messages.json` contains navigation, customer account, sign-in, enquiry, cookie and shared interface wording. `src/lib/translate.mjs` translates explicit interface strings only. Customer-entered names, notes, addresses, company names and uploaded content are retained verbatim.
- `src/components/pages/ChinesePages.jsx` is now the shared public-page layout for Chinese and Malay. Its existing responsive image frames and about-page illustrations are reused. `src/styles/malay.css` holds only language-specific spacing and typography adjustments.
- The legal company name may appear in Chinese characters where the registered local name is shown. It is a company identifier, not an untranslated interface label.

When editing a public section, add its Malay wording to the catalog before publishing. Avoid copying a full language-specific page or changing a common image frame solely to fit Malay text. Prefer a shorter, natural phrase when the meaning permits. Product descriptions and FAQ should be checked in their page context. Have a Malaysian Malay speaker review sales and legal wording before a major campaign.

## Search and private pages

Public indexable routes emit self-canonical URLs and reciprocal `en`, `zh-Hans`, `ms-MY` and `x-default` alternatives. The sitemap carries the same alternatives. Account, sign-in, enquiry, admin, API, media and preview routes stay out of the sitemap and search index. Draft policy pages also remain noindex. The production publishing setting still controls indexing; this change does not alter it.

The site uses one account and enquiry record across languages. The submission stores the chosen locale for the original customer-facing summary, while the customer may later browse the account in another language. Choosing “I have a drawing” still leaves the upload optional. The Malay sign-in email uses the existing eight-digit, ten-minute, single-use verification flow. No new database migration is required.

## Checks before release

Run `npm run check`, `npm test` and `npm run build:production`. In browser QA, inspect 320, 390, 768 and 1440 pixel widths, especially the header, overview hero, About craft and packing images, and all six product-detail galleries. Each product must show four 4:3 design cases and two matched construction images; the backlit details use their existing wide frame. Check the language menu on a product with a query/fragment, and an enquiry draft across language switches. Check that indexable production HTML and the sitemap expose all three alternates, while private pages remain excluded. Use illustrative images only as labeled design/fabrication references; do not present them as completed customer jobs.

This implementation has been checked locally. Publication to the live domain is tracked separately from local completion.
