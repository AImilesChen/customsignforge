# Cloudflare deployment

Production uses `deployment/wrangler.jsonc` and a separate `dist-production/` output directory. Local development continues to use the root Wrangler configuration and `dist/`. The production build disables Astro's unused session storage; administrator sessions use the application's D1 tables.

## Resources

- Worker: `customsignforge`.
- D1: `customsignforge-production`.
- Private R2 bucket: `customsignforge-production-media`; uploaded images are served by the application only after publication.
- Custom domains: `customsignforge.com`, `www.customsignforge.com`; www redirects to the apex over HTTPS.
- Turnstile: the production enquiry widget accepts those two hostnames. Server verification checks the hostname and `quote` action.
- Email: `LOGIN_EMAIL` can send from `hello@customsignforge.com`. Administrator login mail is restricted to the private administrator allowlist. Customer login codes are sent only after an explicit sign-in request, with Turnstile and IP/address/global send limits. Google OAuth is independent and becomes available when both credentials are configured.

## Build and update

1. Install locked dependencies with `npm ci --legacy-peer-deps`.
2. Authenticate the official Wrangler CLI in the deployment environment.
3. Run `npm test`, `npm run check`, and `npm run build:production`.
4. Apply pending schema changes with `node scripts/run.mjs wrangler d1 migrations apply DB --remote --config deployment/wrangler.jsonc`. Back up the production database before data changes. Never import a local test database into production.
5. Run `npm run deploy:production`.

Initial content uses `scripts/seed.sql` with `INSERT OR IGNORE`. It must not be used to replace operator edits. Asset uploads are part of the Worker deployment; the original supplier brochure is not uploaded.

## Private values

Store `SESSION_SECRET`, `ADMIN_EMAILS` and `TURNSTILE_SECRET` as Worker secrets, using protected local or CI inputs. Do not put values in the Wrangler JSON, commit them, or paste them into build logs. The session signing secret is separate from local development. Google login additionally needs `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

`MAIL_FROM`, the public Turnstile site key and public URLs are ordinary variables. Email login prefers the native Cloudflare binding; the existing Resend adapter remains available for other environments.

The build checks production bindings, disables local password login, rejects local environment files in the output, and scans for known private values. `dist-production/`, local credentials, exports and QA evidence are ignored by Git. Upload only the generated client assets and Worker modules through Wrangler, not the whole project directory.

## Release status and verification

The owner authorised public-page indexing on 20 October 2026. `PUBLISH_READY=true` enables eligible marketing pages, robots.txt and sitemap.xml. Account, sign-in, enquiry, administrator and review pages remain excluded. Policy drafts and individually non-indexable concepts remain noindex and outside the sitemap. Indexing eligibility is not a guarantee of search-engine inclusion.

Check HTTPS, the www redirect, linked pages and assets, anonymous admin/API rejection, disabled development login and Turnstile rejection. A positive form test must pass the real Turnstile widget; do not put a test bypass in production. If Google credentials or an actual login round trip have not been tested, report that limitation explicitly.

GitHub holds source code. This deployment uses Wrangler; pushing a commit does not automatically deploy it until a separate CI integration is configured.


## Measurement and maintenance (18 October 2026)

Migration 0006 adds first-party event storage. Events require an explicit analytics choice, have a strict payload allowlist, and contain no enquiry comments, contact fields, reference numbers or WhatsApp message URLs. Without consent, enquiry URL campaign tags can still be saved with the requested enquiry; no cross-page attribution storage or event requests are activated. First attribution is retained on the consenting device for up to 90 days; current campaign attribution uses tab session storage. Preferences are valid for 180 days. Withdrawal clears campaign storage and stops future events.

The production Worker entry is `src/worker.ts`, using the official Astro handler plus a daily scheduled cleanup at 03:17 UTC. Cleanup expires 90-day events and expired authentication/rate-limit records; it never automatically deletes customer enquiries. Invocation payload logging is disabled; sampled Workers observability is enabled for runtime errors. First-party account-deduplicated analytics remain separate from the consent-gated GA4, Microsoft Clarity and Shipsolo/Plausible integration enabled on 20 October 2026. Meta and advertising trackers remain disabled. See `docs/ANALYTICS-SEARCH.md` for scope, exclusions and verification.

Admin measurement separates consenting browser events from manually confirmed business results. Business results are grouped by lead creation dates and use follow-up history, excluding duplicate/spam records. These are not unique-visitor counts or proof that a WhatsApp message was received. Direct chat clicks are anonymous events, not fabricated saved enquiries; actual direct contacts can be manually entered with a required source/evidence note.

## Backup and recovery

Before a schema change, export D1 into an ignored `.runtime/` directory and verify the SQL can be restored into an isolated SQLite database. Keep exports out of the repository, deployment assets and public R2 media. Delete local exports when the release review no longer needs them; business retention and backup rotation require the operator's approval. No automated customer-record retention policy is implied by the analytics cleanup.

D1 Time Travel is always enabled on the supported production backend. The recovery window depends on the account plan (7 days Free, 30 days Paid). A bookmark was retrieved from this project's production database on 18 October 2026. Reading a bookmark is not a recovery drill. Restoring production in place overwrites subsequent records and requires an incident-specific recovery decision; do not restore production as a routine test. An isolated restore test is the safe default.

Reference: https://developers.cloudflare.com/d1/reference/time-travel/
Custom Worker entry: https://docs.astro.build/en/guides/integrations-guide/cloudflare/#changed-custom-entrypoint-api

## GitHub workflows

`.github/workflows/verify.yml` runs tests, type checks and the production build on pushes and pull requests. `deploy.yml` is prepared to deploy the exact verified main-branch commit, with production deployment concurrency protection and additive D1 migrations. Deployment is intentionally inactive unless repository variable `CF_AUTO_DEPLOY` is `true` and a scoped `CLOUDFLARE_API_TOKEN` secret exists. Never copy a local Wrangler OAuth token into GitHub.

Create a deployment token restricted as far as Cloudflare permits to this account, Worker and database; store it using GitHub's protected secret interface. Confirm the `production` environment, then enable `CF_AUTO_DEPLOY`. No successful automated deployment is claimed until a run has passed. Existing Worker application secrets remain on Cloudflare and must not be included in source or build output.

Customer Google login is now required by the operator. Use a web OAuth client with redirect URI `https://customsignforge.com/auth/google/callback`, authorised origin `https://customsignforge.com`, and only the `openid email` scopes. Configure the client secret through the protected Worker secret interface and test the allowlist, callback and logout. Customer sign-in starts at `/auth/customer/google`; administrator sign-in remains `/auth/google`. Both use the configured callback, with separate signed state audiences and cookies, and produce separate customer/admin sessions. A customer account does not grant administrative access.


### Verified automation status

On 18 October 2026 the owner authorised a dedicated deployment token, saved as an encrypted `production` environment secret. Its permissions are Workers Scripts Edit and D1 Edit for the selected account. The repository variable `CF_AUTO_DEPLOY` is enabled. The workflow has successfully verified and deployed source commit `3c675059746b3c776abe4a2d304a38c8c5dd5e8f` (run 39131815433), including migrations, custom-domain deployment, scheduled maintenance configuration and public smoke checks. The token value was never committed. Treat future runs as independent releases and check their result.

Production administrator email sign-in, draft/publication isolation, R2 publication privacy, manual entry and follow-up have now been tested. A backup was restored into an isolated temporary Cloudflare database; business-table counts matched the export, and the temporary database was removed. Production was not rolled back. Store backup exports privately; longer-term business retention, rotation and alert destinations are still pending operator confirmation.

Consent version 2 deliberately asks for a fresh choice when analytics become active; version 1 preview preferences do not activate measurement. Source/date filters apply to events and lead cohorts; manually entered actual spend is an in-memory estimate, with no ad-account integration or claim of platform attribution.


## Customer accounts and authenticated enquiries (18 October 2026)

The owner explicitly changed the earlier no-customer-account scope. The public header now contains Sign In / My Account on desktop and mobile. Anonymous quote-page requests redirect to `/sign-in/` and retain the product, reference and campaign query in a bounded, allowlisted return path. Only authenticated customer sessions can submit `/api/enquiries`; admin sessions alone do not satisfy that gate. Browse-only pages and public business contact links remain available.

Migration `0007_customer_accounts.sql` adds customer accounts, independent customer sessions and email challenges, plus a nullable enquiry owner. Existing enquiry records are retained without automatically assigning them to a customer. Do not grant ownership to old or manually entered records merely because someone knows an enquiry reference or an email address. The API always derives the owner from the verified server session, and checks ownership on retries and reads. Private staff notes and business classifications are not returned through the customer API.

Customer email verification is browser-bound, single use, expires in ten minutes and allows five attempts per challenge. Requested code emails are rate-limited and require the customer-login Turnstile action in production. Customer sessions last up to seven days and are revoked on sign-out; session-bound customer CSRF tokens are required for writes. Daily maintenance expires both customer sessions and pending customer email challenges, without deleting accounts or enquiry records.

Google customers are not restricted to the administrator allowlist. Google-managed verified emails (Gmail or Workspace) can sign in with verified OIDC claims and a stable subject; unmanaged third-party email addresses are directed to email verification to prove current mailbox control. The shared callback verifies signature/issuer/audience/nonce/PKCE/state and cannot upgrade customer identity to administrator access. Keep OAuth credentials as Worker secrets. The Google consent audience and any test-user restrictions must be validated in an actual customer sign-in; a valid redirect alone is not a full acceptance test.

The local `send_email` binding simulates code delivery. Local browser QA may use the reserved `customer-qa@example.test` fixture and a controlled test challenge in the local database. That is not evidence of external email delivery and must never be copied to production. No production test-auth endpoint, dummy OTP or CAPTCHA bypass is included. The public release smoke script never sends emails or creates a customer account.

Cookie/Privacy/Terms technical drafts now describe customer identity and login state; optional analytics exclude sign-in and account pages. Account retention/closure and other unresolved business-policy facts remain subject to review.


## 20 October 2026 - External analytics and public indexing

Public integration IDs are in `src/data/analytics.json`. Consent version 4 requires a fresh analytics choice before loading the three external collectors. GSC configuration was already handled by the owner and must not be replaced. No new Google permissions or DNS ownership tokens are added by this release.
