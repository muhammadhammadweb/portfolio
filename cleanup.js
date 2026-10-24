/**
 * Removes files the new portfolio does not use.  Safe by default: it only LISTS what it would delete.
 *     node cleanup.js          -> shows the list (nothing is deleted)
 *     node cleanup.js --yes    -> deletes them
 * Deleted files stay in your Git history, so you can always get them back.
 */
const fs = require("fs"), path = require("path");
const DO = process.argv.includes("--yes");
const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
const P = eval(html.match(/var P=(\[[\s\S]*?\n\]);/)[1]);
const L = [...html.matchAll(/var L[12]="([^"]+)"/g)].flatMap(m => m[1].split(","));
const toWebp = f => f.replace(/\.(png|jpe?g)$/i, ".webp");
const root = path.join(__dirname, "assets", "images");
const rm = [];

function unused(dir, used) {
  const d = path.join(root, dir);
  if (!fs.existsSync(d)) return;
  const keep = new Set(used);
  fs.readdirSync(d).forEach(f => { if (!keep.has(f)) rm.push(path.join(d, f)); });
}
unused("projects", P.map(r => r.split("|")[3]).filter(f => !f.startsWith("../")).map(toWebp));
unused("Clients-logo", L.map(toWebp));

// old site's css/js are not referenced by the new index.html
["assets/css", "assets/js"].forEach(p => {
  const d = path.join(__dirname, p);
  if (fs.existsSync(d)) fs.readdirSync(d).forEach(f => { if (!html.includes(p + "/" + f)) rm.push(path.join(d, f)); });
});
// helper scripts do not need to be on the live site
["check-images.js", "optimize-images.js", "cleanup.js"].forEach(f => {
  /* kept: you may want to run them again. Move them out of the repo if you like. */
});

if (!rm.length) { console.log("Nothing to delete."); process.exit(0); }
let size = 0;
rm.forEach(f => { size += fs.statSync(f).size; console.log((DO ? "deleting  " : "would delete  ") + path.relative(__dirname, f)); if (DO) fs.unlinkSync(f); });
console.log("\n" + rm.length + " files, " + (size / 1024).toFixed(0) + " KB " + (DO ? "deleted." : "(dry run - run with --yes to delete)"));
