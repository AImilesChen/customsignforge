# English and Simplified Chinese

English remains at the original URLs; Simplified Chinese uses `/zh/`. Locale is explicit in the URL, with no IP or browser-language redirects. `src/lib/locale.mjs` owns URL conversion. API, auth callback, uploaded media and administrator routes remain shared. Only approved customer destinations are accepted by `customerNext`.

## Content and presentation

- `src/data/zh/site.json`: six product families, public metadata, application and policy labels.
- `src/data/zh/messages.json`: explicit translations for shared navigation, login, quote, uploads, validation and consent UI. Enum values, product slugs and customer-entered text stay unchanged.
- `src/components/pages/ChinesePages.jsx`: native Chinese public-page presentation and editorial copy using the existing image library and manufacturing metrics. Do not change `manufacturing-profile.json` numbers or their meaning to suit a translation.
- `src/lib/locale-content.mjs`: localized product/project identity, metadata and stable project titles. Concept work keeps its existing noindex flag and is presented as design inspiration, not completed customer deliveries.
- `src/styles/chinese.css`: Chinese typography and native public layouts; the shared mobile header accommodates customer access and language choice on one row, with quote and owner management in the existing menu.
- `src/styles/chinese-about.css`: scoped Chinese About layout. Craft photos use equal 4:3 contain frames; full-size dialogs keep their original image proportions. Quality/packing photos retain portrait frames. About metrics add senior craftspeople's experience with explicit year/person/machine units, without changing shared manufacturing data or claiming company age. Team descriptions stack their headings above copy; closing enquiry content is compact and left aligned.

New CMS records need Chinese editorial content before being promoted in the Chinese site; do not assume an untranslated new English page is finished localization. Administrator content editing menus remain disabled as requested by the owner.

## Shared customer flow

Both languages use the same customer session, CSRF, enquiries and private attachment APIs. The form submits an optional validated `locale` (`en` / `zh`) with stable field codes. Original submission language is saved in `details_json` and shown to the administrator. Viewing an enquiry in another language changes its labels and prepared WhatsApp message, not the saved customer text. Language-only retries reuse the existing idempotency key and record; they do not change the original submission language.

Quote drafts are stored only in the current tab, keyed by customer and product/reference context, with a 24-hour restore limit. They retain progress, original text and retry key across language switches. Uploads are recovered from the existing owner-scoped attachment API. Success and logout clear drafts; storage-disabled browsers can still complete the form. Login-code request state retains its original 10-minute age and never stores the code. The actual browser-bound, single-use code validation and rate limiting remain on the server.

Email is verified through sign-in. Phone/WhatsApp remains mandatory and self-reported. Having drawings does not make uploading mandatory. Chinese sign-in emails and WhatsApp summaries are localized; opening WhatsApp never sends a message automatically.

## Search and analytics

Translated pages render their own HTML language, title, description, H1 and canonical. Eligible English/Chinese pairs include reciprocal `en`, `zh-Hans` and `x-default` alternates in HTML and sitemap. The shared indexing rules retain per-item exclusions, policy draft exclusions, private-page noindex and preview noindex. `robots.txt` also excludes localized private paths.

All three external collectors retain consent version 4 and production-only activation, excluding both language versions of private routes and policy pages, owner sessions, unknown pages and unsafe URL/referrer data. GA4 gets the page language. First-party account deduplication spans languages and preserves the existing reporting rules; customer identities and quote content never become analytics properties.

## Verification

`npm test`, `npm run check`, `npm run build:production`. Locale tests cover redirect safety, private-path bypass protection, schema language, draft isolation/expiry/cleanup, shared enquiry data, original text, language-only retries, optional uploads and localized browser-bound email login. Browser QA should include desktop/mobile, product galleries, language-switching drafts, optional drawings, saved-enquiry summaries and account access. No real customer or production test enquiries are required.
