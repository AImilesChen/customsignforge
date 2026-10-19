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
