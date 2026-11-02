# HelloBreak website

Independent website repository for the HelloBreak home, help and privacy pages.

Production: https://hello-break.luopeike.com · Support: cameoshell09@gmail.com

Default language: English (US). All eight languages match the App: `en-US`, `zh-Hans`, `zh-Hant`, `es`, `ja`, `ko`, `fr`, `de`.

Run `npm run verify` to generate and validate 24 localized pages. Run `npm run dev` for preview at http://127.0.0.1:4173. No package installation is required.

## Cloudflare Pages

Connect this GitHub repository with production branch `main`, framework preset **None**, build command `npm run build`, output directory `dist`, repository root as root directory, and Node.js 22 (set in `.node-version`). Attach custom domain `hello-break.luopeike.com`. Subsequent pushes to `main` trigger deployments.

`site.config.json` defines the canonical origin and support email. Optional `SITE_ORIGIN` and `SUPPORT_EMAIL` environment variables override them for a separate deployment. The root page defaults to English (US); language-specific pages use stable directory URLs.

`_headers` sets `Cache-Control: no-transform` so Cloudflare preserves direct support-email links and does not inject email-obfuscation JavaScript. This configuration applies only to this Pages site.

`content/locales.json` and translations are standalone snapshots from the parent App's `Localization/` source. Run the parent `scripts/generate-localizations.py` after translation changes. The website builds without the parent repository. `assets/brand.css` comes from the shared HelloBreak design system. `assets/icons/` contains exports of the shared HelloBreak icon. No analytics, ads, cookies, or remote font services are included by the site.

## Search and AI discovery

`content/seo.json` supplies website-only titles, descriptions and four substantive FAQ answers in all eight languages. Keep these consistent with real App behavior. The build preserves the existing canonical routes and hreflang links, generates a 24-URL sitemap, and emits WebSite, SoftwareApplication and page JSON-LD. FAQ markup on help pages matches visible answers. It does not invent ratings, prices or store availability. JSON-LD is inert data; no executable JavaScript is added.

`llms.txt` is an optional English overview and index of official localized pages. It is generated from the configured origin, contains the same product boundaries as the visible pages, and does not change crawler permissions. Google Search does not require or specially use this file for its AI features; it is not a ranking or citation guarantee. Focus editorial work on clear answers, factual platform differences and useful setup guidance. See [Google's AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide).

`site.config.json` also stores the public Google Search Console verification token. Preserve it across deployments. The origin robots file allows crawling and lists the sitemap; Cloudflare may prepend its existing managed policy. No zone-wide AI training or bot policy is changed by this repository.

`npm run verify` checks localization completeness, unique metadata, canonical routes, visible structured answers, local assets, the verification token and sitemap/llms links. Asset query fingerprints refresh cached CSS and favicons when their content changes.
