import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const PUBLIC_IMAGES = path.join(ROOT, "public", "images");
const SRC_DIRS = [
  path.join(ROOT, "src", "data"),
  path.join(ROOT, "src", "components"),
  path.join(ROOT, "src", "app"),
];

function walkFiles(dir, exts) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkFiles(full, exts));
    } else if (!exts || exts.some((ext) => entry.name.endsWith(ext))) {
      results.push(full);
    }
  }
  return results;
}

const referenced = new Set();
const imgRegex = /["'`](\/images\/[a-zA-Z0-9_\-/]+\.(?:jpg|jpeg|png|webp|avif))["'`]/g;

for (const dir of SRC_DIRS) {
  for (const file of walkFiles(dir, [".ts", ".tsx"])) {
    const content = fs.readFileSync(file, "utf8");
    for (const match of content.matchAll(imgRegex)) {
      referenced.add(match[1]);
    }
  }
}

const allDiskFiles = walkFiles(PUBLIC_IMAGES, [".jpg", ".jpeg", ".png", ".webp", ".avif"]).map(
  (f) => "/images/" + path.relative(PUBLIC_IMAGES, f).replace(/\\/g, "/")
);

let hasErrors = false;

console.log(`Checking ${referenced.size} referenced image paths against ${allDiskFiles.length} files in public/images/...`);

for (const ref of referenced) {
  const diskPath = path.join(ROOT, "public", ref);
  if (!fs.existsSync(diskPath)) {
    console.error(`[FAIL] Missing image referenced in code: ${ref}`);
    hasErrors = true;
    continue;
  }
  const stat = fs.statSync(diskPath);
  const sizeKb = stat.size / 1024;
  const isHero = ref.startsWith("/images/hero/");
  if (sizeKb < 5) {
    console.error(`[FAIL] Image too small (< 5 KB): ${ref} (${sizeKb.toFixed(1)} KB)`);
    hasErrors = true;
  } else if (!isHero && sizeKb > 700) {
    console.error(`[FAIL] Image too large (> 700 KB): ${ref} (${sizeKb.toFixed(1)} KB)`);
    hasErrors = true;
  }
}

const unused = allDiskFiles.filter((f) => !referenced.has(f));
if (unused.length > 0) {
  console.log(`\nUnused files in public/images (${unused.length}):`);
  for (const u of unused) {
    console.log(`  - ${u}`);
  }
} else {
  console.log("All files in public/images are referenced (0 unused).");
}

if (hasErrors) {
  process.exit(1);
}
console.log("Image verification passed.");
