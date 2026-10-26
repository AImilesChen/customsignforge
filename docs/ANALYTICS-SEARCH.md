# Analytics and search indexing

Owner authorisation: 20 October 2026. Google Search Console was already handled by the owner; this release does not change GSC properties, owners, verification tokens or DNS.

## Services

- GA4: `G-SH4NV0GRN0`, official Google tag. Page views plus `whatsapp_click` and `request_quote` events on eligible public marketing pages. These are contact intent, not confirmed enquiries or orders.
- Microsoft Clarity: `z0hfn4bak2`, official project script. Heatmaps and session recordings, with analytics consent granted and advertising consent denied.
- Shipsolo: provided `https://plausible.shipsolo.io/js/script.js`, `data-domain=customsignforge.com`. Page views and engagement. Upstream self-hosted Plausible script was inspected; it automatically reads URL and referrer and excludes automated browsers.
- Ahrefs Web Analytics: `https://analytics.ahrefs.com/analytics.js`, with the public project data key in `src/data/analytics.json`. It measures page visits and automatically detects outbound link clicks. Ahrefs states that it uses no analytics cookies; it receives page URLs, referrers and device/location signals.
- First-party administrator reports keep their existing verified-account deduplication, retention and authorisation. External services use different visitor/session definitions and should not be presented as the same figures.

## Activation and data boundaries

No external collector loads before consent. Version 5 invalidates prior choices because Ahrefs was added. The banner and Cookie Notice identify all four services and Clarity recordings. Advertising consent, Google signals and ad personalisation remain denied/disabled.

Collectors are production-only, canonical-host-only, and absent from administrator, sign-in, account, enquiry-form, policy and preview pages. Recognised administrators and missing routes are excluded. Public-page customer state contains only a signed-in flag; names, emails and account IDs remain in the protected account/enquiry flow. Unknown query parameters, invalid campaign tags, unsafe fragments and private/query-bearing referrers prevent collector startup because the supplied scripts read these values automatically. Ahrefs may additionally observe outbound links on eligible marketing pages; enquiry-form pages are excluded.

No custom event contains a link URL, WhatsApp text, contact name, email, phone, enquiry reference or file. GA4 events on public pages do not confirm an enquiry submission. Rejection prevents loading. Withdrawal denies GA/Clarity consent, clears their first-party cookies and reloads to unload all third-party listeners. Storage and page-restore events recheck consent. Local previews never contact these providers.

## Search

The owner explicitly approved opening public search indexing. Production `PUBLISH_READY=true` opens eligible homepage, product overview/details, projects overview, company/contact/process/trade and landing pages. Shared indexing logic keeps sitemap and page meta consistent. Per-item `indexable:false`, policy drafts, account/form/admin routes, missing pages and previews remain excluded. Robots advertises the canonical sitemap and blocks private application paths. No search ranking or indexing completion is implied.

## References

- [Google basic consent mode](https://developers.google.com/tag-platform/security/guides/consent?consentmode=basic)
- [Clarity Consent V2](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-consent-api-v2)
- [Clarity masking](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-masking)
- [GA4 configuration](https://developers.google.com/analytics/devguides/collection/ga4/reference/config)

## Validation

Automated checks cover consent gating, one-time loading of all four services, private-path/query/referrer exclusions, safe event payloads, withdrawal, and sitemap/meta parity. Production asset/privacy scan must pass before deployment. Live verification must distinguish published code and script loading from actual authenticated provider dashboard receipt. Ahrefs' automated installation check may not pass because its crawler does not grant analytics consent; this must not be bypassed by activating tracking for unconsenting visitors.
