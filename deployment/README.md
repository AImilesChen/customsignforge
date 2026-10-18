# Cloudflare deployment

Production uses `deployment/wrangler.jsonc` and a separate `dist-production/` output directory. Local development continues to use the root Wrangler configuration and `dist/`. The production build disables Astro's unused session storage; administrator sessions use the application's D1 tables.

## Resources

- Worker: `customsignforge`.
- D1: `customsignforge-production`.
- Private R2 bucket: `customsignforge-production-media`; uploaded images are served by the application only after publication.
- Custom domains: `customsignforge.com`, `www.customsignforge.com`; www redirects to the apex over HTTPS.
- Turnstile: the production enquiry widget accepts those two hostnames. Server verification checks the hostname and `quote` action.
- Email: `LOGIN_EMAIL` can send from `hello@customsignforge.com`. The application restricts login mail to the private administrator allowlist. Google OAuth is independent and remains disabled until its credentials are configured.

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

`PUBLISH_READY=false` keeps pages out of search engines while business policy review is pending. This is an indexing setting, not access control: the deployed site is publicly reachable. Keep this distinction clear in launch reporting.

Check HTTPS, the www redirect, linked pages and assets, anonymous admin/API rejection, disabled development login and Turnstile rejection. A positive form test must pass the real Turnstile widget; do not put a test bypass in production. If Google credentials or an actual login round trip have not been tested, report that limitation explicitly.

GitHub holds source code. This deployment uses Wrangler; pushing a commit does not automatically deploy it until a separate CI integration is configured.
