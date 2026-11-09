# HelloBreak website

Independent website repository for the HelloBreak home, help and privacy pages.

Production: https://hello-break.luopeike.com · Support: cameoshell09@gmail.com

The product name is **HelloBreak in every language**; do not localize the brand name.

Default language: English (US). All eight languages match the App: `en-US`, `zh-Hans`, `zh-Hant`, `es`, `ja`, `ko`, `fr`, `de`.

Run `npm run verify` to generate and validate 24 localized pages. Run `npm run dev` for preview at http://127.0.0.1:4173. No package installation is required.

## Cloudflare Pages

Connect this GitHub repository with production branch `main`, framework preset **None**, build command `npm run build`, output directory `dist`, repository root as root directory, and Node.js 22 (set in `.node-version`). Attach custom domain `hello-break.luopeike.com`. Subsequent pushes to `main` trigger deployments.

`site.config.json` defines the canonical origin and support email. Optional `SITE_ORIGIN` and `SUPPORT_EMAIL` environment variables override them for a separate deployment. The root page defaults to English (US); language-specific pages use stable directory URLs.

`_headers` sets `Cache-Control: no-transform` so Cloudflare preserves direct support-email links and does not inject email-obfuscation JavaScript. This configuration applies only to this Pages site.

`content/locales.json` and translations are standalone snapshots from the parent App's `Localization/` source. Run the parent `scripts/generate-localizations.py` after translation changes. The website builds without the parent repository. `assets/brand.css` comes from the shared HelloBreak design system. `assets/icons/` contains exports of the shared HelloBreak icon. No analytics, ads, cookies, or remote font services are included by the site.

Current product copy covers individual app/category limits, Safari and standalone/connected Chrome website budgets, a once-daily 60-second breathing guide with 15-minute temporary access, independent 15–240-minute Focus sessions scheduled within seven days, and report device scope. Apple reports default to this device; shared-device reports are distinct from local website counters. No iCloud quota synchronization is claimed. Internal TestFlight and App Review submission are distinct from a public release; the site retains release-preparation copy until public availability is verified. Website checks do not establish physical-device shielding, expiry callbacks or performance.

`content/store-metadata.json` is a tracked standalone snapshot of the canonical App metadata: names, subtitles, introductory paragraphs and promotional text for both platforms in all eight languages, with source hashes. From this checkout nested inside the App repo, run `npm run sync:app` after editing root Fastlane metadata, then `node scripts/sync-app-metadata.mjs --check`. Cloudflare builds use the committed snapshot and do not need the parent App checkout. H1s and platform introductions use that snapshot; website-specific search descriptions and FAQs live in `content/seo.json`.

Commit the eight locale snapshots together when syncing shared App strings. Keep website-only SEO/template changes in a separate commit when practical, and push the finished batch to avoid deploying intermediate copy. `dist/`, local `.wrangler/` state, logs and environment credentials are excluded from Git.

## Search and AI discovery

`content/seo.json` supplies website-only titles, descriptions, product explanations and eight substantive FAQ answers in all eight languages. Keep these consistent with real App behavior. `content/product.json` records the reviewed product boundaries and actual content update date. The build preserves canonical routes and hreflang links, adds meaningful lastmod dates to the 24-URL sitemap, and emits WebSite, SoftwareApplication and page JSON-LD. FAQ markup matches visible answers; it is semantic data, not a promise of a Google FAQ rich result (Google retired that feature in May 2026). No ratings, prices or public availability are invented. JSON-LD is inert data; no executable JavaScript is added.

`llms.txt` is an optional English overview and index of official localized pages. It is generated from the configured origin, contains the same product boundaries as the visible pages, and does not change crawler permissions. Google Search does not require or specially use this file for its AI features; it is not a ranking or citation guarantee. Focus editorial work on clear answers, factual platform differences and useful setup guidance. See [Google's AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide).

`site.config.json` also stores the public Google Search Console verification token. Preserve it across deployments. The origin robots file allows crawling and lists the sitemap; Cloudflare may prepend its existing managed policy. No zone-wide AI training or bot policy is changed by this repository.

`npm run verify` checks localization completeness, unique metadata, canonical routes, visible structured answers, local assets, the verification token and sitemap/llms links. Asset query fingerprints refresh cached CSS and favicons when their content changes.

`deployment.json` records the deployed source commit using `CF_PAGES_COMMIT_SHA` (or the local Git HEAD). After pushing, compare that public receipt with website HEAD before verifying production bytes. Review the release-preparation text when the App becomes publicly available. Keep lastmod tied to meaningful content changes rather than updating it on every build.

## Bing Webmaster Tools

The production property `https://hello-break.luopeike.com/` was added and verified on November 9, 2026 using a dedicated Cloudflare DNS record. Retain this verification record:

| Type | Full name | Target | Proxy |
| --- | --- | --- | --- |
| CNAME | `eb6dea99ba046ec8fdc81d4bf12c7a1f.hello-break.luopeike.com` | `verify.bing.com` | DNS only |

Both Cloudflare and Google public DNS resolvers returned this exact CNAME. The existing proxied website record `hello-break.luopeike.com → hello-break.pages.dev` was preserved, as was Google Search Console verification. This DNS verification method does not require a Bing HTML marker or XML file.

`https://hello-break.luopeike.com/sitemap.xml` was submitted to [Bing's Sitemaps dashboard](https://www.bing.com/webmasters/sitemaps?siteUrl=https://hello-break.luopeike.com/). The submission readback was **1 known sitemap / Processing / 0 errors / 0 warnings / 0 URLs discovered**. The sitemap contains 24 canonical URLs across eight languages; that source count does not establish crawling or indexing. This is a dated submission record, not a live status feed.
