# HelloBreak website

Independent website repository for the HelloBreak home, help and privacy pages.

Production: https://hello-break.luopeike.com · Support: cameoshell09@gmail.com

Default language: English (US). All eight languages match the App: `en-US`, `zh-Hans`, `zh-Hant`, `es`, `ja`, `ko`, `fr`, `de`.

Run `npm run verify` to generate and validate 24 localized pages. Run `npm run dev` for preview at http://127.0.0.1:4173. No package installation is required.

## Cloudflare Pages

Connect this GitHub repository with production branch `main`, framework preset **None**, build command `npm run build`, output directory `dist`, repository root as root directory, and Node.js 22 (set in `.node-version`). Attach custom domain `hello-break.luopeike.com`. Subsequent pushes to `main` trigger deployments.

`site.config.json` defines the canonical origin and support email. Optional `SITE_ORIGIN` and `SUPPORT_EMAIL` environment variables override them for a separate deployment. The root page defaults to English (US); language-specific pages use stable directory URLs.

`content/locales.json` and translations are standalone snapshots from the parent App's `Localization/` source. Run the parent `scripts/generate-localizations.py` after translation changes. The website builds without the parent repository. `assets/brand.css` comes from the shared HelloBreak design system. `assets/icons/` contains exports of the shared HelloBreak icon. No analytics, ads, cookies, or remote font services are included by the site.
