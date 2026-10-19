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
