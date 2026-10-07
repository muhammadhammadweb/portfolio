/**
 * check-links.js
 * index.html ke saare external links (Portfolio + Clients marquee) check karta hai.
 *
 * Chalane ka tareeqa (index.html wale folder me):
 *   node check-links.js
 *
 * Node 18+ chahiye (built-in fetch). Koi npm install nahi.
 */

const fs = require("fs");
const path = require("path");

const HTML_FILE = path.join(__dirname, "index.html");
const TIMEOUT_MS = 15000;
const CONCURRENCY = 6;
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

// Ye status aksar bot-protection ki wajah se aate hain, site asal me live hoti hai
const BLOCKED_STATUSES = new Set([401, 403, 405, 429, 999]);

function extractUrls(html) {
  const urls = [];
  // <a href="..." ... target="_blank"> (single line ya multi-line, rel="noopener" ke saath ya bina)
  const regex = /<a\s+href="(https?:\/\/[^"]+)"[^>]*target="_blank"/g;
  let match;
  while ((match = regex.exec(html)) !== null) urls.push(match[1]);
  return [...new Set(urls)];
}

async function request(url, method) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, {
      method,
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": UA, Accept: "text/html,*/*" },
    });
  } finally {
    clearTimeout(timer);
  }
}

async function checkUrl(url) {
  let lastError = null;
  for (const method of ["HEAD", "GET"]) {
    try {
      const res = await request(url, method);
      if (res.ok) return { url, status: res.status, state: "live" };
      if (method === "GET") {
        return {
          url,
          status: res.status,
          state: BLOCKED_STATUSES.has(res.status) ? "blocked" : "dead",
        };
      }
      // HEAD fail hui to GET se dobara try hoga
    } catch (err) {
      lastError = err.name === "AbortError" ? "timeout" : err.cause?.code || err.message;
    }
  }
  return { url, status: null, state: "dead", error: lastError };
}

async function main() {
  if (!fs.existsSync(HTML_FILE)) {
    console.error("index.html is script ke saath wale folder me nahi mila.");
    process.exit(1);
  }

  const urls = extractUrls(fs.readFileSync(HTML_FILE, "utf-8"));
  console.log(`${urls.length} links mile. Check ho rahe hain...\n`);

  const results = [];
  let next = 0;

  async function worker() {
    while (next < urls.length) {
      const result = await checkUrl(urls[next++]);
      results.push(result);
      const icon = { live: "✅", blocked: "⚠️ ", dead: "❌" }[result.state];
      const detail = result.error ? result.error : `status ${result.status}`;
      console.log(`${icon} ${result.url} — ${result.state.toUpperCase()} (${detail})`);
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  const live = results.filter((r) => r.state === "live");
  const blocked = results.filter((r) => r.state === "blocked");
  const dead = results.filter((r) => r.state === "dead");

  console.log("\n--- Summary ---");
  console.log(`Live: ${live.length} | Blocked (browser me khol ke dekho): ${blocked.length} | Dead: ${dead.length}`);
  if (blocked.length) {
    console.log("\nBlocked (shayad live, bot-protection):");
    blocked.forEach((r) => console.log(`  - ${r.url} (${r.status})`));
  }
  if (dead.length) {
    console.log("\nDead / unreachable:");
    dead.forEach((r) => console.log(`  - ${r.url} (${r.error || "status " + r.status})`));
  } else {
    console.log("\nKoi dead link nahi mila 🎉");
  }
}

main();
