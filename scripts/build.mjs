import { readFile, writeFile, mkdir, cp } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFile(path.join(root, p), "utf8");
const site = JSON.parse(await read("src/data/site.json"));
const pages = [
  [
    "index.html",
    "Engineering Plugins for AutoCAD & Civil 3D",
    "Independent engineering tools for AutoCAD and Civil 3D. Explore the EngiPlugins project, our approach to CAD automation, documentation and support.",
  ],
  [
    "products.html",
    "Products in Development",
    "Discover the focus of EngiPlugins development: CAD productivity, drawing quality checks and engineering workflow automation.",
  ],
  [
    "documentation.html",
    "Documentation",
    "Find out how EngiPlugins documentation will help you install, use and understand each plugin, with commands, compatibility and known limitations.",
  ],
  [
    "support.html",
    "Support & Contact",
    "Contact EngiPlugins for project enquiries and support. Learn what information to include when reporting a CAD workflow issue.",
  ],
  [
    "about.html",
    "About EngiPlugins",
    "EngiPlugins is an independent project by Yoel Guerrero, developing productivity plugins and automation tools for engineering workflows.",
  ],
  [
    "privacy.html",
    "Privacy Policy",
    "Read how the EngiPlugins website and email enquiries handle information, and learn about our local-first approach to future plugins.",
  ],
  [
    "terms.html",
    "Terms & Legal Notice",
    "Read the EngiPlugins website terms, project status, contact information and notices about independent development and third-party trademarks.",
  ],
  [
    "404.html",
    "Page Not Found",
    "This EngiPlugins page could not be found. Return to the homepage or visit support.",
  ],
];
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
await mkdir(path.join(root, "dist"), { recursive: true });
await cp(path.join(root, "assets"), path.join(root, "dist/assets"), {
  recursive: true,
  filter: (source) => !source.endsWith("-original.png"),
});
for (const [file, title, description] of pages) {
  const content = await read(`src/pages/${file}`);
  const navigation = site.navigation
    .map(
      ([name, href]) =>
        `<a href="${href === "index.html" ? "/" : "/" + href}"${href === file ? ' aria-current="page"' : ""}>${name}</a>`,
    )
    .join("");
  const replace = (text) =>
    text
      .replaceAll("{{navigation}}", navigation)
      .replaceAll("{{email}}", escape(site.email))
      .replaceAll("{{year}}", site.year);
  const is404 = file === "404.html";
  const canonical = site.url + (file === "index.html" ? "/" : "/" + file);
  const noindex =
    is404 ||
    (!site.legalReviewed && ["privacy.html", "terms.html"].includes(file));
  const document = `<!DOCTYPE html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escape(title)} | EngiPlugins</title><meta name="description" content="${escape(description)}"><meta name="theme-color" content="#071f2c">${noindex ? '<meta name="robots" content="noindex, follow">' : ""}${is404 ? "" : `<link rel="canonical" href="${canonical}">`}<meta property="og:type" content="website"><meta property="og:site_name" content="EngiPlugins"><meta property="og:title" content="${escape(title)} | EngiPlugins"><meta property="og:description" content="${escape(description)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${site.url}/assets/images/social-banner.webp"><meta property="og:image:alt" content="EngiPlugins — Engineering Plugins and Automation Tools"><meta name="twitter:card" content="summary_large_image"><link rel="icon" type="image/png" href="/assets/icons/favicon.png"><link rel="apple-touch-icon" href="/assets/icons/apple-touch-icon.png"><link rel="stylesheet" href="/assets/css/tokens.css"><link rel="stylesheet" href="/assets/css/base.css"><link rel="stylesheet" href="/assets/css/components.css"><link rel="stylesheet" href="/assets/css/pages.css"><script src="/assets/js/navigation.js" defer></script></head><body>${replace(await read("src/partials/header.html"))}<main id="main" tabindex="-1">${replace(content)}</main>${replace(await read("src/partials/footer.html"))}</body></html>\n`;
  await writeFile(path.join(root, "dist", file), document);
}
await writeFile(path.join(root, "dist/.nojekyll"), "");
await writeFile(
  path.join(root, "dist/robots.txt"),
  `User-agent: *\nAllow: /\nSitemap: ${site.url}/sitemap.xml\n`,
);
const indexable = pages.filter(
  ([f]) =>
    f !== "404.html" &&
    (site.legalReviewed || !["privacy.html", "terms.html"].includes(f)),
);
await writeFile(
  path.join(root, "dist/sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${indexable.map(([file]) => `<url><loc>${site.url}${file === "index.html" ? "/" : "/" + file}</loc></url>`).join("")}</urlset>\n`,
);
console.log(
  `Built ${pages.length} pages in dist. Legal review: ${site.legalReviewed ? "complete" : "pending (draft pages noindex)"}.`,
);
