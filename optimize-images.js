/**
 * Image optimizer for the portfolio.
 * Converts every PNG/JPG/WEBP in assets/images/projects and assets/images/Clients-logo
 * (and assets/images/loveself.png) into a small, resized .webp with the SAME file name.
 * Originals are moved to  _originals_backup/  (don't push that folder to GitHub).
 *
 * Run from the portfolio root folder (the one that contains index.html):
 *     npm install sharp
 *     node optimize-images.js
 */
const fs = require("fs");
const path = require("path");
let sharp;
try { sharp = require("sharp"); } catch (e) { console.error("Run  npm install sharp  first."); process.exit(1); }

const IMG = path.join(__dirname, "assets", "images");
const BACKUP = path.join(__dirname, "_originals_backup");
const EXT = /\.(png|jpe?g|webp)$/i;

const JOBS = [
  { dir: "projects",     width: 800, maxHeight: 800, quality: 72 }, // screenshots: keep only the top part (cards show the top)
  { dir: "Clients-logo", width: 400, maxHeight: null, quality: 85 }, // logos: small, keep transparency
  { file: "loveself.png", width: 800, maxHeight: 800, quality: 72 },
];

const kb = (n) => (n / 1024).toFixed(0) + " KB";
let totalBefore = 0, totalAfter = 0, count = 0;

async function optimize(src, job, relBackup) {
  const buf = fs.readFileSync(src);
  const before = buf.length;
  let img = sharp(buf, { failOn: "none" }).rotate();
  const meta = await img.metadata();
  img = img.resize({ width: job.width, withoutEnlargement: true });
  let out = await img.webp({ quality: job.quality, alphaQuality: 90, effort: 5 }).toBuffer();

  if (job.maxHeight) {                      // crop very tall full-page screenshots to the top part
    const m2 = await sharp(out).metadata();
    if (m2.height > job.maxHeight) {
      out = await sharp(out)
        .extract({ left: 0, top: 0, width: m2.width, height: job.maxHeight })
        .webp({ quality: job.quality, effort: 5 }).toBuffer();
    }
  }

  const dest = src.replace(EXT, ".webp");
  const isSameFile = dest === src;
  // back up the original, then write the optimized file
  const bk = path.join(BACKUP, relBackup);
  fs.mkdirSync(path.dirname(bk), { recursive: true });
  if (!fs.existsSync(bk)) fs.writeFileSync(bk, buf);
  if (!isSameFile) fs.unlinkSync(src);
  fs.writeFileSync(dest, out);

  totalBefore += before; totalAfter += out.length; count++;
  console.log(`${path.relative(__dirname, dest).padEnd(58)} ${kb(before).padStart(9)} -> ${kb(out.length).padStart(8)}`);
}

(async () => {
  for (const job of JOBS) {
    if (job.dir) {
      const folder = path.join(IMG, job.dir);
      if (!fs.existsSync(folder)) { console.warn("Missing folder:", folder); continue; }
      for (const f of fs.readdirSync(folder)) {
        if (!EXT.test(f)) continue;
        try { await optimize(path.join(folder, f), job, path.join(job.dir, f)); }
        catch (e) { console.warn("Skipped", f, "-", e.message); }
      }
    } else {
      const f = path.join(IMG, job.file);
      if (fs.existsSync(f)) {
        try { await optimize(f, job, job.file); } catch (e) { console.warn("Skipped", job.file, "-", e.message); }
      }
    }
  }
  console.log("\n" + count + " images: " + kb(totalBefore) + " -> " + kb(totalAfter) +
    "  (" + (100 - (totalAfter / Math.max(1, totalBefore)) * 100).toFixed(0) + "% smaller)");
})();
