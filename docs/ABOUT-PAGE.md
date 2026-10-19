# About page and shared homepage alignment

This update follows the user-approved review of the About page and the supplied story/reference screenshots. It restores About Us to the desktop and mobile navigation and replaces the generic editorial page with an image-led team, capabilities and quality story.

## Page structure

1. Short introduction beside a real workshop photograph, with enquiry and team links.
2. Four manufacturing metrics: 100+ production team; 10+ design/development specialists; 30+ production machines; 3,000 square metres of production space.
3. Real office/team photo with design, fabrication and quality/project communication responsibilities. Senior technical craftspeople's experience is described as more than a decade.
4. Cutting, construction/finish and assembly/light references with brief process descriptions.
5. Appearance, lighting and packing explanation with real inspection/packing photographs.
6. Enquiry and public company/contact links. No utility sidebar or repeated long workflow article.

## Numeric meaning and source

The user explicitly requested numeric manufacturing/team strengths and approved these values from page 2 of the supplied 28-page DISMAY brochure. `src/data/manufacturing-profile.json` is the single source for both homepage and About metrics. These values describe the manufacturing operation in that material; the experience value refers to senior technical staff, not Custom Sign Forge's incorporation/brand age. The photograph caption “50-person team” is not treated as a separate total-headcount claim. No invented founding date, client count, certification, sales, lead time or warranty has been added.

Homepage uses 10+ years of senior craftspeople's experience, 100+ production team and 30+ production machines. The years unit is typographically smaller so the figure remains clear on narrow screens. About presents the broader four-metric band plus the experience explanation in the team copy.

## Shared layout

`src/styles/layout.css`, imported after component styles, establishes a 1,360px maximum content frame. Header content, homepage hero copy/image and homepage section edges use the same viewport-based gutters. This removes the old one-sided hero padding and the image bleeding to the right edge. The empty Explore sign styles strip is removed. The original hero photograph is retained, with its sign positioned at the top of the crop so the lettering remains visible.

Desktop navigation includes Products, Projects, How It Works, For Trade, About Us and Contact Us; sign-in/account and quote remain on the right. At narrower widths the existing accessible menu and product discovery controls remain available.

## CMS and release

`0012_about_page.sql` upgrades only published, unchanged old About body defaults, including CRLF versions. Operator-edited drafts/bodies, custom headings, introductions, hero overrides, SEO and additional gallery media are preserved. The new component recognises old/new defaults and keeps custom published body/media visible. No authentication, customer files or enquiry records are changed.

Content: `src/data/about-content.json`; defaults: `src/data/about-defaults.json`; presentation helper: `src/lib/about-page.mjs`. New original team photograph provenance: `docs/about-assets.json`. Existing production photography provenance remains in `docs/home-team-assets.json` and `docs/supplier-assets.json`.

Validation: `npm test`, `npm run check`, `npm run build:production`, `node scripts/about-public-smoke.mjs` and `node scripts/home-public-smoke.mjs`. Set TEST_ORIGIN for local smoke checks. Visual comparisons, responsive measurements and acceptance evidence are recorded in `design-qa.md` and the ignored `docs/evidence/about-v2/` directory.
