# Immersive homepage hero QA - 2026-10-19

Source visual truth: user-selected competitor composition, captured at `docs/evidence/hero-competitor-review/signs-inc-1920.png`, plus the user-supplied Signs.inc screenshot. The accepted brief adapts its integrated dark navigation, manufacturing background, left benefit-led copy, portrait scene carousel and bottom proof strip to Custom Sign Forge. This is not a pixel-for-pixel clone: orange branding, customer sign-in, existing product taxonomy, accurate manufacturing metrics and AI concept labels are intentional differences.

Implementation evidence: `docs/evidence/hero-immersive/desktop-1920.png`, `reception-1920.png`, `hospitality-1920.png`, `mobile-390.png`, `mobile-menu.png`, and `geometry.json`. Source and implementation desktop CSS viewport1920x1080; actual saved pixels1905x1072, with the same IAB density/surface differences. `compare-full.png` places both captures on an equal1905x1072 canvas with24px separation, without stretching; it was opened and inspected. Focused `compare-typography.png` compares the actual title/copy/action regions with disclosed different crop widths, not as a pixel overlay. Full/native-size screenshots were also inspected for sign text, image sharpness and small labels. Mobile CSS390x844 gives375x812 actual pixels.

## Comparison history and findings

- P2 mobile title initially left “Out.” isolated on its own line. Added a nonbreaking “Stand Out.” span, keeping an intentional balanced four-line mobile title. Shortened supporting copy. The opened `compare-mobile-copy.png` shows the actual before/after at equal375x812. Scene selection differs in that comparison, but copy/layout assessment is confined to the left/mobile copy region.
- P2 mobile menu initially inherited dark orange quotation text on a dark panel. Overrode this scoped homepage link to light peach rgb(243,178,141). The opened `compare-mobile-menu.png` shows the corrected text beside the initial capture; other navigation remains white, and focused product category controls retain their Escape behaviour.
- P2 landscape reception/hospitality sources could not preserve complete sign wording in a portrait panel. Generated dedicated portrait compositions from those references, inspected both source assets and browser scenes, and used object-fit:contain with a4:5 image area. AVEN and SABLE remain fully visible. New sources1113x1413 and1040x1300; no source image was hard-cropped. Desktop card scales with available height while retaining its portrait ratio.
- P2 the first desktop height calculation placed the proof-band labels at the viewport/ribbon boundary. Reduced stage minimum/padding and fitted the portrait width to available height. Final1920 DOM hero height1045px leaves the full proof band visible before the local preview ribbon; header logo and copy both start at272.5px. No horizontal overflow at360/390/900/1280/1440/1920.
- The quotation browser check exposed that a custom CTA category would be normalised by existing attribution code. The hero now emits the existing schema directly: `/get-a-quote/?source=homepage-hero&entry=%2F&cta=content`. Final browser activation preserves that exact target inside the sign-in return. No global attribution or auth rules were modified.

## Five fidelity surfaces

- Fonts/typography: Georgia regular/italic editorial headline, orange benefit emphasis; existing Manrope for navigation/buttons and Source Sans3 for body. Intentional adaptation of the competitor's DM Serif Display treatment. Desktop headline44-64px, mobile39-43px, supporting copy18-21px, controls14-16px, with nonbreaking final phrase to avoid an isolated word.
- Spacing/layout: shared1360px navigation/hero alignment, responsive56/48/32/20px gutters; right520px maximum portrait card, numbered controls and a separate proof band. White navigation is integrated into the background on the homepage only. Mobile stacks content and offers full-width CTAs and a dark disclosure menu.
- Colours/tokens: original brand orange for primary action and peach emphasis for dark surfaces, white logo/text and muted pale supporting text. A real workshop photograph is subdued with grayscale/opacity and a solid dark overlay. No artificial manufacturing imagery or CSS-drawn assets.
- Image fidelity: original cafe preserved, two individually generated portrait concepts plus400/800px variants; complete word shapes and proper halo/non-lit effects inspected. Whole portraits contained in their slots; lower captions cover planned quiet space. Existing logo assets and Phosphor icons retained. Provenance/prompts in `docs/hero-v3-assets.json`.
- Copy/content: concise benefit headline, specific custom options, three labelled illustrative concepts, product links, account/quote actions, and manufacturing metrics from the central profile. Experience is attributed to senior craftspeople rather than company age; competitor ratings, certification and service promises were not adopted.

## Functional verification and limits

- Browser: three numbered scenes, previous/next, autoplay advancement observed from hotel to storefront, explicit pause/start, product menu and six category links, Escape, phone menu, quotation login gate/exact return and product overview link. No browser console errors observed. Asset containment and responsive geometry checked across the listed widths.
- Reduced motion and hidden-document guards were reviewed in code; OS preference switching and a screen reader were not exercised. This is not a full accessibility audit. Alternate source photography and less prominent utility controls are intentional brand/product differences, not unresolved clone drift.
- Existing59 tests passed. Astro check94 files,0 errors/warnings/hints after the unused import cleanup. Development and production builds/private-value scan passed. Local homepage, About and new hero public smoke checks passed; production validation is recorded separately after deployment.

## Implementation checklist

- [x] Integrated home-only navigation and preserved inner-page header.
- [x] Complete photographic background, copy, carousel and proof strip.
- [x] Portrait assets, responsive variants and accurate provenance.
- [x] Fixed mobile wrapping/menu contrast and desktop proof-band fit.
- [x] Compared actual source/implementation and inspected focused regions.
- [x] Verified main browser interactions and exact quotation return.

Remaining P3: assess conversion after receiving real visitor data; replacing illustrative concepts with future photographed deliveries is an editorial option. No actionable P0/P1/P2 visual or functional findings remain in this scoped implementation.

final result: passed

---

# Homepage hero size restoration - 2026-10-19

User requested restoring the larger homepage hero image after the shared alignment change reduced it. Scope: hero layout only; original hero-cafe.webp, navigation, About and manufacturing content remain unchanged.

The hero now has its own centred1680px maximum frame, a45/55 text/image split after the64px gap, and a710px image-height cap. The rest of the site retains the1360px frame. Top-aligned image cropping preserves the complete sign lettering.

Local1920px viewport:1680px hero frame, equal112.5px margins in the1905px layout viewport; image888.8125x710px. Compared with the previous1360px frame, image width increases from699.84px by27%. Current-run screenshots: docs/evidence/hero-restore/local-1920.png, local-1440.png, local-1280.png and local-390.png. Desktop and mobile screenshots inspected; widths1920/1440/1280/390 show no horizontal overflow and quote/project buttons remain within the viewport. Mobile retains the stacked layout. No image assets were changed.

Production build and private-value scan passed. Existing homepage and About public smokes passed against the local build. CI and production verification are recorded in the release log after deployment.

---

# About page, manufacturing metrics and shared alignment QA - 2026-10-19

Source visual truth: user-approved story/reference screenshot `C:/Users/NINGMEI/AppData/Local/Temp/codex-clipboard-45d1ac99-8777-435a-858b-342ba6f7a063.png` (1333x523); user-supplied homepage layout complaint `codex-clipboard-5ac24af4-3934-4089-95e8-f426c8223db0.png`; current-run wide-page evidence `docs/evidence/about-layout-audit/home-wide.png`. The user approved an About structure of introduction, numeric strengths, team, fabrication, quality/packing and enquiry; this is a scoped redesign, not a literal competitor clone.

Implementation screenshots: `docs/evidence/about-v2/home-1920.png`, `about-desktop.png`, `team-initial.png`, `quality-initial.png`, `home-team-desktop.png`, `mobile-about.png`, `mobile-metrics.png`, `mobile-home-metrics.png`, `mobile-menu.png`. Desktop homepage CSS1920x1080, actual1905x1072; About/home-team CSS1280x900, actual1265x889. Mobile CSS360x800, actual345x767. Surface/scrollbar differences are not treated as layout drift.

Comparison evidence: `compare-home-alignment.png` places the before/after1920 captures on the same canvas, and `compare-about-composition.png` places the approved story reference beside the actual About introduction/metrics. Both were opened and inspected together. The section-only reference is contained without stretching into a1280x900 cell; no pixel-exact typography claim is made. Native-size captures were separately inspected for figure visibility, menu labels, small copy, packing crop and numeric baselines.

## Iteration history and fixes

- P1 original wide layout: navigation left40px, hero text308.5px, section272.5px, hero image ending at1905px. The final header logo, hero copy and sections all start at272.5px; quote button, hero image and sections end at1632.5px in a1905px layout viewport. Equal272.5px outer margins; zero horizontal overflow.
- P2 first revised hero crop clipped the top of the lettering. Changed image position to center top. Revised screenshot preserves the complete FORM COFFEE lettering and the contained right edge.
- P2 initial strengths used a reversed flex column that shifted numeric baselines when labels wrapped. Replaced with a two-row grid. All four final metric tops are755.4375px in the About desktop capture.
- P2 narrow-screen figure crowding: the years unit now uses a smaller type size beside10+, with its subject clearly labelled senior craftspeople. About figures use a responsive30-36px font; no figure overflows its metric cell at360px.
- P2 excessive first-screen mobile copy: removed the redundant second hero paragraph; secondary desktop team anchor is omitted only on mobile. Final mobile photo begins at585px, so real workshop imagery appears within the first screen.
- Fixed explicit spaces across heading line breaks so accessible text does not join words/sentences.

## Fidelity surfaces

- Typography: existing Manrope UI/Source Sans3 body with selective Georgia editorial headings and orange emphasis, consistent with the approved reference. About headings40-60px desktop/mobile responsive; body17-22px, figures30-46px with clearly associated labels.
- Spacing/layout: shared1360px frame for navigation, homepage hero/sections and About. Header/page gutters56px desktop,48/32px intermediate,20px mobile. Six-link desktop nav remains legible and collapses under1180px. Empty Explore strip removed. About alternates split photographs and concise explanations, with a four-number band and no editorial utility sidebar.
- Colour: existing graphite, warm paper and orange; figures use pale peach on graphite for contrast. No new gradients or decorative glow.
- Imagery: original authorised workshop, office-team, equipment, component, inspection and packing references. New office image1259x692 has responsive400/800px variants. Existing hero concept remains labelled, no generated workers or altered equipment. Quality/packing montage keeps the source photography.
- Copy: four manufacturing facts (100+ team,10+ design/development,30+ machines,3,000m2) plus more-than-a-decade senior craft experience, traced to page2 of the user-provided brochure. Brand age, certification, delivery guarantees and customer counts are not inferred. Experience and manufacturing figures are centralised for homepage/About consistency.

## Behaviour and verification

- Desktop product dropdown opens, stays within the viewport, and Escape dismisses it. About Us has aria-current on its page. Mobile menu exposes About Us and Request a Quote; activating About navigates and closes the menu.
- Team anchor activation works. Exact About source survives customer sign-in/quotation redirect. Public checks verify all new section anchors and seven image resources, plus the six-family homepage.
- Responsive DOM measurements at360/390/900/1280/1366/1440/1920px show clientWidth=scrollWidth; desktop nav does not overlap account/quote actions. Header and About left edges match at each measured width. Browser error log is empty.
- 59 tests pass, including migration repeatability, CRLF, draft/unpublished/custom field/SEO/gallery preservation and metric/media meaning. Production build/private-value scan and final Astro check are required before release; deployment completion is recorded separately.

No actionable P0/P1/P2 findings remain within this scope. Brochure photos retain their source resolution; no claim of higher-resolution original photography is made.

final result: passed

---

# Earlier QA records

# Homepage team and advantages QA - 2026-10-19

Source visual truth: the two user-selected screenshots, `C:/Users/NINGMEI/AppData/Local/Temp/codex-clipboard-45d1ac99-8777-435a-858b-342ba6f7a063.png` (1333 x 523) and `codex-clipboard-b913615f-3e02-45b7-a869-b77479167e25.png` (1402 x 605). These are composition/density references, not a request to copy competitor claims or branding.

Implementation: `docs/evidence/home-team/desktop-story.png`, `desktop-advantages.png`, `desktop-products.png`, `mobile-story.png`, `mobile-packing.png`, `mobile-advantages.png`. Story and advantages captured at CSS1280 x720; actual PNG1265 x712 excludes the scrollbar/surface edge. Products captured at1280 x900. Mobile CSS390 x844, actual screenshot375 x812; DOM width and scroll width both375. Density not treated as a layout mismatch.

Full-view comparisons: `compare-story.png` and `compare-advantages.png` place the supplied reference and actual browser capture together in one2560 x760 canvas. References fitted into1280 x720 cells without stretching; section-only source crops do not include browser chrome. These comparisons were opened and reviewed. Separate full-resolution captures were inspected for small copy, image crop and mobile controls; no additional focused composite was necessary because the text and controls are clearly readable in the native captures.

## Iteration history

- P2 initial advantages: long headline and tall cards pushed the second row beyond a normal720px view. Shortened the headline to “Custom Signs. Made Around You.”, reduced card padding/icon size, retained17px descriptions, and recaptured. Both rows now appear in the normal desktop view.
- P2 initial story: third qualitative strength wrapped asymmetrically and two paragraphs were unnecessarily long. Shortened the copy and strength to “Final checks”; replaced a cluttered assembly photograph with the clearer hands-on fabrication photo. Revised story comparison passes.

## Required fidelity surfaces

- Typography: selective Georgia editorial titles and orange italic emphasis reproduce the reference hierarchy while Manrope/Source Sans3 remain for UI and body. Desktop story uses a two-line heading, advantages42px, body17-20px. Mobile headings34px and body17-18px remain readable.
- Spacing: left text/right single photograph, balanced white space, rounded image, restrained three-strength row. Six3-column cards replace the reference's eight4-column cards intentionally. Mobile becomes a single column with compact icon/copy alignment; no horizontal overflow.
- Colour: existing graphite, warm paper and orange remain. Competitor blue and unsupported badges/counters are intentionally omitted.
- Imagery: original brochure workshop, inspection and packing photographs replace the illustrative process assets. Main source1255 x691; portrait inspection/packing sources543px wide are not enlarged in generated files. CSS crops were visually checked, including the lower packing photograph. Product entries reuse existing concept assets with their concept note retained.
- Copy: two brief story paragraphs, three qualitative strengths and six title/sentence benefits. No employee total, years, certification, customer count, installation network or warranty copied from the reference.

## Behaviour and checks

Photo buttons activate with click and keyboard Enter, expose aria-pressed and update image/caption. Packing was checked on mobile; quality selection checked on desktop. Server-rendered text stays visible before hydration; only off-screen items enter the single reveal effect. Reduced-motion CSS and preference listener were reviewed; system-level preference toggling was not exercised in the browser. All six product routes, nine unique image assets and the customer sign-in quotation return context pass the dedicated public smoke check. Browser error log is empty. No real enquiry or email was submitted.

No actionable P0/P1/P2 findings remain within this scope.

final result: passed

---

# Earlier homepage QA record

# Homepage V2 design QA

Status: revised comparison passed within the homepage scope. User approved this version for production release on 2026-10-19; deployment outcome is tracked in the repository Actions and project control record.

Source visual truth: `../首页分屏样板_V2.0/01-产品区.png`, `02-作品区.png`, `03-定制与制作证明区.png` (1586×992 each). User additionally confirmed the eight-section homepage architecture; the customization, process and manufacturing explanation therefore occupy separate full-page sections. Brochure content is reference only, not copied.

Initial comparisons: `docs/evidence/home-v2/comparison-products-initial.png`, `comparison-work-initial.png`, `comparison-custom-initial.png`. Browser viewport1440×900; actual browser screenshot1425×891 excludes/normalizes surface edges. References normalized to1440×900 and actual captures placed alongside them in the same canvas. Native full-page rendering is sharper than the viewport helper; initial full-page captures with partial image/ribbon artifacts were rejected as final evidence.

- P2 typography: chapter titles and descriptive text looked smaller than approved samples. Desktop chapter headings raised to60px, supporting text23px, product titles26px. This restores the sample hierarchy without shrinking text to fit.
- P2 layout: content span narrower than reference, header taller and top spacing more conservative. Widened desktop content, reduced homepage header to76px and review padding to48px. Retained required full navigation and actual customer sign-in.
- P2 review metadata: existing review routes inherited the Page Not Found fallback title. Added a local review title without enabling production review pages or search indexing.
- Intentional: product slots are strict4:3 as expressly specified by user architecture, although the generated reference pictures are somewhat taller. All sign words remain visible. Original photos regenerated individually instead of cropping UI screenshots.
- Intentional: third mock's compact combined section becomes customization, then process, then manufacturing/packing discussion in complete homepage, matching user-confirmed architecture. AI process images are explicit illustrations, not claimed real quality/production evidence.

## Revised comparison and required fidelity surfaces

Accepted comparison canvases: `docs/evidence/home-v2/comparison-products-final.png`, `comparison-work-final.png`, `comparison-custom-final.png`; focused readable crop: `comparison-products-focused.png`. Both reference and implementation are in each comparison input. Browser helpers sometimes produced a corrupted full-page snapshot or a viewport resized mid-capture; those captures were rejected and replaced with a stable normal viewport. The accepted products render measures1425×891 pixels for the1440×900 outer viewport, with419×314.25 product slots. The valid work full capture is1425×1027; the longer section deliberately continues below a normal viewport rather than shrinking its text. The custom viewport capture is1440×900. No creative asset was cut out of a UI screenshot.

- Fonts/typography: existing Manrope headings/buttons and Source Sans3 body retained. Desktop chapter hierarchy raised to60px; product titles26px, descriptors22px, use19px. Mobile headings32px, body18–20px. Source images have approximate font metrics; minor exact weight/wrapping differences remain P3 rather than fake pixel-perfect claims.
- Spacing/layout: consistent widened desktop content,28px product/gallery gaps, strict4:3 products, one-large/two-small contextual gallery. Header76px; full homepage sections80px desktop and64px mobile. Source preview header had fewer links; real PRD navigation plus customer account entry is intentionally retained. Broader customization descriptions and separate workflow/evidence areas intentionally expand beyond the compact study, following the confirmed eight-part structure.
- Colors/tokens: paper #F7F7F5, graphite #20252B, muted #626B75 and orange #B94717 retained. No new gradient, glow decoration, shadow cards or fabricated trust metrics.
- Images: ten individual concept photos generated from the accepted direction, with source manifest, intrinsic dimensions and responsive WebP variants. Full sign words visible; front lighting, halo and non-lit metal remain distinct. All process imagery explicitly labelled illustration. Brochure was inspiration only; no brochure images or copy used in the new homepage.
- Copy/content: chapter-specific purpose and short explanatory copy; all text rendered as selectable HTML. Customization covers logo/size, light/finish and environment/mounting; workflow now includes customer sign-in, individual quotation and confirmation. Generated imagery is never labelled completed client work or actual inspection evidence.

## Interaction and responsive verification

- Browser1440×900: actual product entry opens the LED Channel Letters detail page. Reception concept enquiry goes to customer sign-in with `style=backlit-letters` and safe return parameters preserved. No OTP email or enquiry submission was needed for this visual change.
- Browser390×844: real mobile menu opens/closes, FAQ price explanation expands; whole homepage client/scroll width375/375 (scrollbar excluded). Mobile work snapshot `mobile-work.png`; final phone top `mobile-home-top-final.png`. Browser360-wide work layout client/scroll345/345, with readable single-column images. Tablet768 work layout753/753. A rapid1366 resize read still returned the preceding width, so that attempt is not counted as1366 verification.
- Mobile P2 text joining found in the inherited hero and CTA pattern: removed hidden-line-break splitting of adjacent words, using natural text wrapping instead. Reloaded browser accessibility tree confirms “Made for Your Business”; CTA uses a literal space after “WhatsApp.”.
- Browser error log checked after the homepage/interaction run: no error entries. HTTP checks passed23 distinct homepage links and13 image resources, including sign-in redirects.29 existing automated tests pass. Final type check and build results are stored under `.runtime/acceptance/`; no backend or auth changes.
- Viewport override reset, local homepage tab preserved. This is simulated viewport checking, not real-device or full WCAG certification.

## Remaining P3 / limits

- Original photo perspectives differ slightly from raster mockups because each image was regenerated independently; no visible missing sign words.
- Header retains real five-link navigation instead of the sample's abbreviated three-link context.
- Complete homepage content is longer than the three isolated studies; repeated study headers are not repeated inside the real homepage.
- New images are design/process illustrations. They do not resolve operational evidence, legal approval, actual delivery claims, or prior deferred production acceptance items.

Implementation checklist: assets placed; semantic sections and links implemented; source references compared alongside rendered captures; P2 findings fixed and rechecked; mobile menu/FAQ and anonymous quote handoff checked; no actionable P0/P1/P2 findings remain in the scoped visual review.

final result: passed

## Navigation and contact release — 2026-10-19

Result: passed. Desktop 1440/1366 and mobile 390/360 checked in browser. Header navigation and quote CTA are 16px; desktop header is 88px. All six published product links appear in the disclosure. Escape closes it and returns focus; mobile menu open/close works. Contact form CTA redirects to customer sign-in with its return path. No horizontal overflow at the checked sizes. Local screenshots: docs/evidence/navigation-desktop-local.png and navigation-mobile-local.png (ignored). User explicitly authorized production publication.


# Product detail pages V2 — local implementation QA (2026-10-19)

Scope: six existing product detail routes. The user approved the three complementary backlit samples with “可以”. This chapter supersedes the earlier “samples awaiting approval” state for local implementation. No commit, GitHub push or production deployment was performed.

Source visual truth: `../产品详情页样板_V2.0/01-背发光字-桌面完整页.png` (738×2132), `02-背发光字-手机首屏.png` and `03-背发光字-手机细节区.png` (853×1844 each). Implementation: `http://localhost:4326/products/backlit-letters/` and the five sibling product routes. State: anonymous visitor, cookie choice already dismissed in final captures, FAQs and image dialog closed except explicitly named interaction evidence.

## Comparison inputs and normalization

The source and browser render were opened together on each comparison canvas, not judged as separate images. Desktop CSS viewport1440×900; browser raster1425×891. Mobile CSS viewport390×844; raster375×812. The browser helper excludes/normalizes the viewport edge and scrollbar; these are recorded as actual captured pixels rather than claimed 1:1 DPR screenshots. Comparison canvases use equal stages, uniform aspect-preserving scaling and no stretched images. `docs/evidence/products-v2/screenshot-dimensions.json` records per-file dimensions. Source crop boundaries are pixel coordinates within the original738px-wide mock, not browser scroll positions.

- Full visible hero: `comparison-desktop-hero-final.png`; source crop(0,0,738,461), actual `backlit-desktop-hero.png`.
- Focused detail layout: `comparison-desktop-details-final.png`; source crop(0,397,738,810), actual `backlit-desktop-details-final.png` at scroll810.
- Focused customization: `comparison-desktop-custom-final.png`; source crop(0,791,738,1191), actual `backlit-desktop-custom-final.png` at scroll1620.
- Mobile hero: `comparison-mobile-hero.png`; entire approved phone source and `backlit-mobile-hero.png`, equally contained in390×844 stages.
- Mobile detail iteration: `comparison-mobile-details.png`; source, initial browser and revised `backlit-mobile-details-final.png` together in390×844 stages, browser scroll886.
- All-category review: `*-desktop-final.png`, `*-detail-final.png`, `*-mobile.png`, plus360/768 evidence. Long full-page screenshot attempts were rejected by the browser; viewport and focused-region evidence are used instead. This is not a claim to have captured every footer pixel on every route.

## Findings, fixes and comparison history

1. [P2, fixed] Initial desktop heading and image started too low. Evidence: `comparison-desktop-hero.png` initial column. Replaced centered row with explicit breadcrumb/heading/summary grid; image starts108px, heading246px at1440. Final hero canvas confirms the intended left text/right dominant image and immediate second chapter. Initial cookie banner was dismissed for final comparison; it is not classified as a product-layout defect.
2. [P2, fixed] Mobile detail heading wrapped “See the Glow. See the / Detail.” and the repeated large customization photo delayed the next task. Added deliberate two-line heading, shortened repeated source note, and hid the redundant backlit customization image on phones while keeping its desktop view. Revised mobile detail canvas shows a complete one-large/two-small gallery followed by customization heading. All four specification rows remain rendered.
3. [P2, fixed] Specialty desktop headline wrapped into four lines; the first lightbox hero depicted only one direction. Shortened headline to “Your Reference. / A New Possibility.” and generated an individual lightbox+line-light scene. Revised specialty and lightbox desktop screenshots show two-line hierarchy and both lighting directions.
4. [P2, fixed after combined comparison] Desktop chapter/customization typography remained smaller than the source. Before evidence: `comparison-desktop-hero-before-type.png` and `comparison-desktop-details-before-type.png`. Raised H1 from54 to58px, chapter H2 from38 to44px, intro21 to22px, hero benefits17 to18px, hero action16 to18px and customization rows18 to20px. The enlargement revealed a third line in metal/acrylic titles; shortened those titles to preserve two lines rather than shrinking the font. Final hero/detail/custom canvases were captured and compared again. All six desktop H1 heights now134.53px (two lines); custom heading53.67px. Mobile and tablet retain explicit readable responsive sizes.

No actionable P0/P1/P2 remains within this implementation scope.

## Required fidelity surfaces

- Fonts/typography: existing self-hosted Manrope headings/actions and Source Sans3 body. Desktop H1 58px/1.16, H2 44px/1.22, introduction22px, option rows20px. Mobile H1 34px, H2 30px, introduction/options18px; primary action16px. Real font metrics and selectable HTML replace the image generator’s approximate glyphs. Minor exact weight and line-spacing differences are acceptable P3.
- Spacing/layout rhythm: desktop1312px maximum content,52px hero column gap,76px chapter spacing, clear one-large/two-small image group and72px customization column gap. Phone margins20px, chapter52px, full image before summary;701–900px stacks the hero. Retained real88px desktop/global responsive header. It contains actual navigation/account links; the source’s approximate smaller phone header and one-line body were not replicated by making real text tiny. Actual phone introduction wraps naturally and the following chapter starts lower. This is an intentional readability/product-navigation constraint.
- Color/tokens: established warm white#F7F7F5, graphite#20252B, muted#626B75, line#DDE1E4, orange#B94717 and final CTA#20272D. No decorative glow or gradient added; lighting comes from the sign photography. Keyboard focus uses the existing visible outline.
- Image quality/assets: thirteen individual generated photographs,39 responsive WebP files and intrinsic dimensions. No visual was cut out of a UI mock and used as an asset. The regenerated bronze macros follow the approved direction. NORTH context reuses the existing concept photo rather than claiming an identical source render. Supplier references remain labelled and use contain instead of clipping their structure. Concept photos remain appearance illustrations, not verified specifications, completed projects or factory inspection evidence. Source ledger: `docs/product-v2-assets.json`.
- Copy/content: product-specific headline, visual detail, four customizable areas, project context where useful, three starting steps, three FAQs and repeated contextual enquiry. Lightbox/neon and specialty use two explicit directions. Original published CMS intro/body/unshown gallery are retained under More Product Information; newly added unknown slugs use the existing fallback layout. Explicit CMS hero replacements retain precedence. These presentation copy fields are repository JSON, not newly introduced admin editor fields.

## Interaction, responsive and functional verification

- Six routes checked at1440,390,360 and768 widths: client/scroll equal (1425/375/345/753 respectively); no horizontal overflow. Headings/images/actions stay within content. Final shortened metal/acrylic headings were rechecked after the type enlargement. This is browser-responsive evidence, not physical-device or target-market network certification.
- Desktop photo opens native modal, Escape closes it and focus returns to the original enlarge button. Phone image modal opens, close button receives focus, button closes it. Native modal retains focus trapping. Evidence `mobile-image-dialog.png`.
- Desktop and phone FAQ expand/collapse; supplemental published body/gallery can be opened. Evidence `mobile-faq-open.png`. A minor repeated AI caption inside the modal is P3 copy polish, not a functional blocker.
- Actual specialty direction click reaches customer sign-in and preserves style, variant, product entry and return path. No OTP, Google authorization, CAPTCHA, enquiry submission or external message was triggered.
- Four direction presets rendered through the real Quote component using React server rendering under a synthetic local test context: selected style and editable notes match lightbox, neon-style, marquee and exposed-light. This checks render initialization, not a new real customer-login acceptance run.
- Read-only local HTTP: six pages200 and130 referenced/base/responsive resources200, zero failures (`resource-check.json`). Existing29 automated business/security tests passed. Final Astro check64files with0errors/0warnings/0hints; production build and sensitive-value/output scan passed. Logs are in `.runtime/acceptance/products-v2-*`.
- Browser error logs checked after responsive navigation and interactions: no errors returned. Earlier dependency-optimization/dev bridge failure was resolved by stopping the stale server and rebuilding its cache; it was not counted as a successful page test.

Implementation checklist: six pages implemented; individual assets encoded; source comparison completed after fixes; responsive/modal/FAQ/return-path checks passed; final production build verified; local preview retained. Deployment is pending a separate release instruction. Existing business/policy/real-message acceptance items are unchanged.

final result: passed
