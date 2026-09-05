import { readFile, readdir, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const files = (await readdir(dist)).filter((f) => f.endsWith(".html"));
const failures = [];
const titles = new Set();
let links = 0;
const cache = new Map(
  await Promise.all(
    files.map(async (f) => [f, await readFile(path.join(dist, f), "utf8")]),
  ),
);
for (const [file, html] of cache) {
  const assert = (condition, message) => {
    if (!condition) failures.push(`${file}: ${message}`);
  };
  assert(
    (html.match(/<h1[\s>]/g) || []).length === 1,
    "exactly one h1 required",
  );
  assert(html.includes('<html lang="en">'), "language missing");
  assert(html.includes('name="description"'), "description missing");
  assert(!/\{\{\w+\}\}/.test(html), "unresolved template placeholder");
  assert(
    !/<(?:iframe|form)\b/.test(html),
    "unexpected third-party embed or form",
  );
  const title = html.match(/<title>(.*?)<\/title>/)?.[1];
  assert(title && !titles.has(title), "title missing or duplicated");
  titles.add(title);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
  assert(ids.length === new Set(ids).size, "duplicate element ID");
  for (const img of html.matchAll(/<img\b[^>]*>/g))
    assert(/\balt="[^"]*"/.test(img[0]), "image without alt attribute");
  for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const href = match[1];
    if (/^(https?:|mailto:)/.test(href)) continue;
    links++;
    const url = new URL(href, `https://engiplugins.github.io/${file}`);
    const target = url.pathname.endsWith("/")
      ? url.pathname + "index.html"
      : url.pathname;
    try {
      await access(path.join(dist, target));
    } catch {
      failures.push(`${file}: broken local link ${href}`);
      continue;
    }
    if (url.hash) {
      const targetHtml = cache.get(target.slice(1));
      if (!targetHtml?.includes(`id="${url.hash.slice(1)}"`))
        failures.push(`${file}: missing anchor ${href}`);
    }
  }
}
const js = await readFile(path.join(dist, "assets/js/navigation.js"), "utf8");
if (
  /\b(fetch|XMLHttpRequest|localStorage|sessionStorage)\b|document\.cookie/.test(
    js,
  )
)
  failures.push("unexpected tracking/network/browser storage code");
if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else
  console.log(
    `PASS: ${files.length} pages, ${links} local links/assets, headings, titles, anchors and tracking checks.`,
  );
if (process.argv.includes("--release")) {
  const site = JSON.parse(
    await readFile(path.join(root, "src/data/site.json"), "utf8"),
  );
  const products = JSON.parse(
    await readFile(path.join(root, "src/data/products.json"), "utf8"),
  );
  if (site.phase === "prelaunch") {
    if (!Array.isArray(products) || products.length !== 0) {
      console.error("RELEASE BLOCKED: pre-launch site cannot contain products.");
      process.exitCode = 1;
    }
    const combined = [...cache.values()].join("\n");
    if (/paypal\.com|href="[^"]*(?:buy|checkout|trial)/i.test(combined)) {
      console.error(
        "RELEASE BLOCKED: pre-launch site contains a payment or trial link.",
      );
      process.exitCode = 1;
    }
    if (!cache.get("products.html")?.includes("no products available")) {
      console.error(
        "RELEASE BLOCKED: pre-launch product status is not explicit.",
      );
      process.exitCode = 1;
    }
  } else {
    if (!site.legalReviewed) {
      console.error("RELEASE BLOCKED: commercial legal review is incomplete.");
      process.exitCode = 1;
    }
    if (
      [...cache.values()].some((html) =>
        html.includes("Pre-launch notice."),
      )
    ) {
      console.error(
        "RELEASE BLOCKED: pre-launch notice remains on commercial site.",
      );
      process.exitCode = 1;
    }
  }
}
