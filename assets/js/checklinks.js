/**
 * check-links.js
 * Checks every project URL in index.html and reports which are live/dead.
 *
 * Usage:
 *   node check-links.js
 *
 * Requires Node 18+ (uses built-in fetch). No npm install needed.
 */

const fs = require("fs");
const path = require("path");

const HTML_FILE = path.join(__dirname, "index.html");
const TIMEOUT_MS = 10000;

function extractProjectUrls(html) {
  const urls = [];
  const regex = /<a href="(https?:\/\/[^"]+)" target="_blank">/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    urls.push(match[1]);
  }
  return [...new Set(urls)];
}

async function checkUrl(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    let res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
    });
    // Some servers don't support HEAD properly — retry with GET if it looks off
    if (!res.ok && res.status >= 400) {
      res = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: controller.signal,
      });
    }
    clearTimeout(timeout);
    return { url, status: res.status, ok: res.ok, error: null };
  } catch (err) {
    clearTimeout(timeout);
    return { url, status: null, ok: false, error: err.message };
  }
}

async function main() {
  if (!fs.existsSync(HTML_FILE)) {
    console.error("index.html not found next to this script.");
    process.exit(1);
  }

  const html = fs.readFileSync(HTML_FILE, "utf-8");
  const urls = extractProjectUrls(html);

  console.log(`Found ${urls.length} project URLs. Checking...\n`);

  const results = [];
  const CONCURRENCY = 8;
  let i = 0;

  async function worker() {
    while (i < urls.length) {
      const idx = i++;
      const url = urls[idx];
      const result = await checkUrl(url);
      results.push(result);
      const statusLabel = result.ok
        ? `LIVE (${result.status})`
        : result.error
        ? `DEAD (${result.error})`
        : `DEAD (status ${result.status})`;
      console.log(`${result.ok ? "✅" : "❌"} ${url} — ${statusLabel}`);
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  const dead = results.filter((r) => !r.ok);
  console.log("\n--- Summary ---");
  console.log(`Live: ${results.length - dead.length} / ${results.length}`);
  if (dead.length) {
    console.log(`\nDead / unreachable (${dead.length}):`);
    dead.forEach((r) => console.log(`  - ${r.url}`));
  } else {
    console.log("All project links are live 🎉");
  }
}

main();