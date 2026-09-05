# EngiPlugins Website

Static website for the independent EngiPlugins project. English public content; no released plugins, checkout, analytics, contact forms or external fonts.

## Editing the website

Node.js 22 or newer is required. The website build has no third-party dependencies.

1. Edit page content in `src/pages/`.
2. Update shared navigation, email and site URL in `src/data/site.json`.
3. Edit header/footer in `src/partials/` and styles in `assets/css/`.
4. Run `node scripts/build.mjs` to generate `dist/`.
5. Run `node scripts/check-site.mjs` to check internal links and essential page metadata.
6. Run `node scripts/serve.mjs`, then visit `http://127.0.0.1:4173`.

The original root `index.html` remains the previous public website until the approved release is deployed. The new website is generated in `dist/`. Never upload the entire working folder as the deployment artifact.

## Publishing

The GitHub Actions workflow builds, checks and publishes only `dist/` after an approved change reaches `main`. Source files, original design assets and local QA reports are not included in the public website. GitHub Pages must use **GitHub Actions** as its publishing source for this workflow. No paid hosting is required for this implementation. Review GitHub Pages permitted-use conditions against the actual public scope before release.

The site is currently in `prelaunch` phase: it may present the project but cannot expose products, trials, checkout or PayPal links. The release check enforces those limits. Before commercial launch, add the operator's complete professional address, finish the product-specific privacy and licence terms, complete legal review, set `legalReviewed` to `true`, and change the phase. `node scripts/check-site.mjs --release` blocks either phase when its required safeguards are missing.

Draft privacy and terms pages are excluded from the sitemap and marked noindex. Noindex is not access control. The current draft preview is local only.

## Future products

`src/data/products.json` is intentionally empty. `src/templates/product.html` is an unpublished editorial template. Add a product only after its actual features, tested compatibility, documentation, trial/licence terms and Marketplace URL are approved. Product templates are not included in the current build.

## Assets

Original logo and banner were supplied by the owner. The hero artwork is an image-generated adaptation of that branding, not a software screenshot. Original PNG files remain available for reference but are excluded from deployment; the website uses optimised WebP derivatives. No competitor design, code, artwork or testimonials are included.

## QA

Check desktop, tablet, small mobile, keyboard navigation, 200% zoom, reduced motion, broken links, 404 responses and every page. Run HTML validation and Lighthouse before release. Record actual results, including browser and measurement environment; do not infer PASS from the absence of a reported problem. Local Lighthouse measurements do not establish real-user performance on GitHub Pages.

## Recovery

Initial public commit: `a58a15f2c0670c039709b990ec688b56f9b2b2cf`. A local checkpoint and complete Git bundle were created before implementation. Revert a release through Git; do not erase history.
