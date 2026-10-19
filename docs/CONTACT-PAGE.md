# Simplified contact and company information

The contact page now presents one concise project enquiry introduction, email and WhatsApp channels, and a compact company/address section. The large repeated introduction, preparation list and separate Business Information button are removed. The footer also removes that duplicate entry. The operator name still comes from the existing site settings.

The user-confirmed business contact address is `No. 46, Jinqing Avenue, Luqiao District, Taizhou, Zhejiang, China` (`浙江省台州市路桥区金清大道46号`). It is stored in `src/data/contact-content.json` and labelled Business Address; it is not described as a registered office, factory or customer showroom.

The old `/legal-notice/` URL permanently redirects to `/contact/#company-information`, including requests without a trailing slash. Existing policy and company references link to that section. The former company-information draft and its empty registration/tax fields or internal review text are no longer rendered at the old URL.

This is a presentation and navigation change, not a legal-compliance determination. Other policy texts and their review state, the indexing gate, customer sign-in, required enquiry contact details, private files and administrator permissions remain unchanged. No business identifiers are invented, and no database migration is needed.

The project CTA retains `/contact/` as the source through customer sign-in. Email and WhatsApp use the existing confirmed business settings. `scripts/contact-public-smoke.mjs` verifies the rendered page, business address, duplicate-menu removal, both legacy redirects and exact sign-in handoff without sending messages or creating customer records. Browser evidence is stored under ignored `docs/evidence/contact-v2/`.
