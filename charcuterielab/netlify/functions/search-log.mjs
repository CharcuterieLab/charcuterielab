// Search log (2 Nov 2026). The site search sends each finished search here
// (the words and how many results it got; nothing about the person), and the
// counts are kept per month in Netlify Blobs.
//
//   POST /api/search-log      {"q":"brie","n":12,"where":"page"}
//   GET  /api/search-log?key=YOUR_KEY            this month's report
//   GET  /api/search-log?key=YOUR_KEY&m=2026-11  any month
//
// The report needs one Netlify environment variable: SEARCH_REPORT_KEY (any
// long random word you choose). Logging works without it.
import { getStore } from "@netlify/blobs";

const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const month = (d = new Date()) => d.toISOString().slice(0, 7);

export default async (req) => {
  const store = getStore("search-log");
  const url = new URL(req.url);
  if (req.method === "GET") {
    const key = process.env.SEARCH_REPORT_KEY;
    if (!key || url.searchParams.get("key") !== key) return new Response("Not found", { status: 404 });
    const m = /^\d{4}-\d{2}$/.test(url.searchParams.get("m") || "") ? url.searchParams.get("m") : month();
    const log = (await store.get(m, { type: "json" })) || { total: 0, q: {} };
    const rows = Object.entries(log.q).sort((a, b) => b[1].c - a[1].c);
    const zero = rows.filter(([, v]) => v.n === 0);
    const table = (list) => `<table><tr><th>Search</th><th>Times</th><th>Results</th><th>From</th><th>Last</th></tr>${list.slice(0, 300).map(([q, v]) => `<tr><td><a href="/search/?q=${encodeURIComponent(q)}">${esc(q)}</a></td><td>${v.c}</td><td>${v.n}</td><td>${esc(Object.keys(v.w || {}).join(", "))}</td><td>${esc((v.l || "").slice(0, 10))}</td></tr>`).join("")}</table>`;
    const html = `<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Search log ${m}</title><style>body{font:15px/1.45 system-ui,sans-serif;margin:24px;color:#2b1d14}table{border-collapse:collapse;margin:8px 0 28px}td,th{border-bottom:1px solid #e3d6c4;padding:5px 10px;text-align:left}th{font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:#7a5c22}a{color:#8f4422}</style><h1>Site search, ${esc(m)}</h1><p>${log.total} searches, ${rows.length} different. <a href="?key=${encodeURIComponent(key)}&m=${month(new Date(Date.now() - 31 * 864e5))}">Last month</a></p><h2>No results (${zero.length}): pages to write or words to add</h2>${table(zero)}<h2>All searches</h2>${table(rows)}`;
    return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
  }
  if (req.method !== "POST") return json(405, { ok: false });
  const origin = req.headers.get("origin") || "";
  if (origin && !/^https?:\/\/(([a-z0-9-]+\.)*charcuterielab\.com|[a-z0-9-]+--[a-z0-9-]+\.netlify\.app|[a-z0-9-]+\.netlify\.app|localhost(:\d+)?|127\.0\.0\.1(:\d+)?)$/i.test(origin)) return json(403, { ok: false });
  let d;
  try { d = await req.json(); } catch { return json(400, { ok: false }); }
  const q = String(d.q || "").toLowerCase().replace(/[^a-z0-9$&' -]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
  if (q.length < 2 || /@|https?:/.test(String(d.q || ""))) return json(200, { ok: true });
  const n = Math.max(0, Math.min(9999, parseInt(d.n, 10) || 0));
  const where = ["page", "header", "header-pick", "redirect"].includes(d.where) ? d.where : "page";
  const m = month();
  try {
    const log = (await store.get(m, { type: "json" })) || { total: 0, q: {} };
    if (!log.q[q] && Object.keys(log.q).length >= 5000) return json(200, { ok: true });
    const v = log.q[q] || { c: 0, n, w: {} };
    v.c += 1; v.n = n; v.w[where] = (v.w[where] || 0) + 1; v.l = new Date().toISOString();
    log.q[q] = v; log.total += 1;
    await store.setJSON(m, log);
  } catch (e) {
    console.log("search-log failed", e && e.message);
  }
  return json(200, { ok: true });
};

export const config = { path: "/api/search-log" };
