/**
 * Finds images that index.html asks for but that are missing (or spelled/cased differently) in assets/images.
 * Run from the portfolio folder:   node check-images.js
 */
const fs = require("fs"), path = require("path");
const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
const P = eval(html.match(/var P=(\[[\s\S]*?\n\]);/)[1]);
const L = [...html.matchAll(/var L[12]="([^"]+)"/g)].flatMap(m => m[1].split(","));
const toWebp = f => f.replace(/\.(png|jpe?g)$/i, ".webp");
const root = path.join(__dirname, "assets", "images");
const list = d => fs.existsSync(d) ? fs.readdirSync(d) : [];
const stem = f => f.toLowerCase().replace(/\.[a-z]+$/, "").replace(/[^a-z0-9]/g, "");

function check(title, dir, wanted) {
  const files = list(dir), set = new Set(files);
  const missing = wanted.filter(w => !set.has(w));
  console.log(`\n=== ${title}: ${wanted.length} used, ${missing.length} missing ===`);
  missing.forEach(w => {
    const near = files.filter(f => stem(f) === stem(w) || stem(f).includes(stem(w)) || stem(w).includes(stem(f))).slice(0, 3);
    console.log("  MISSING  " + w + (near.length ? "   ->  similar file(s): " + near.join(", ") : "   (nothing similar found)"));
  });
  const used = new Set(wanted);
  const unused = files.filter(f => !used.has(f));
  if (unused.length) console.log("  (files in the folder that the page does not use: " + unused.join(", ") + ")");
}
check("Project screenshots", path.join(root, "projects"), P.map(r => r.split("|")[3]).filter(f => !f.startsWith("../")).map(toWebp));
check("Client logos", path.join(root, "Clients-logo"), [...new Set(L.map(toWebp))]);
console.log("\nDone. Send me this output if anything is MISSING.");
