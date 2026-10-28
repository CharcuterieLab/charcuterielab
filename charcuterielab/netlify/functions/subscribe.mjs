// Quick subscribe (28 Oct 2026). The email bar under every page title posts
// here, and this adds the reader to beehiiv without them leaving the page.
//
// Needs one Netlify environment variable (Site configuration > Environment
// variables): BEEHIIV_API_KEY, a key from beehiiv > Settings > API.
// The Publication ID is public and set below (an env var of the same name
// overrides it).
const PUBLICATION_ID = "pub_8cf3b727-957f-4e09-b99f-53e1fa7ee062";
const json = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

export default async (req) => {
  if (req.method !== "POST") return json(405, { ok: false, error: "method" });
  const origin = req.headers.get("origin") || "";
  if (origin && !/^https?:\/\/(([a-z0-9-]+\.)*charcuterielab\.com|[a-z0-9-]+--[a-z0-9-]+\.netlify\.app|[a-z0-9-]+\.netlify\.app|localhost(:\d+)?|127\.0\.0\.1(:\d+)?)$/i.test(origin)) return json(403, { ok: false, error: "origin" });
  let data;
  try { data = await req.json(); } catch { return json(400, { ok: false, error: "bad_request" }); }
  // Honeypot: a hidden field people never see but bots fill in.
  if (data.website) return json(200, { ok: true });
  const email = String(data.email || "").trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return json(400, { ok: false, error: "invalid_email" });
  const key = process.env.BEEHIIV_API_KEY;
  const pub = process.env.BEEHIIV_PUBLICATION_ID || PUBLICATION_ID;
  if (!key || !pub) return json(503, { ok: false, error: "not_configured" });
  const page = String(data.page || "/").slice(0, 200);
  const slug = (page.replace(/^\/|\/$/g, "").replace(/[^a-z0-9]+/gi, "_") || "home").slice(0, 80);
  try {
    const r = await fetch(`https://api.beehiiv.com/v2/publications/${encodeURIComponent(pub)}/subscriptions`, {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        email,
        reactivate_existing: false,
        send_welcome_email: true,
        utm_source: "charcuterielab.com",
        utm_medium: "quick_subscribe",
        utm_campaign: `quick_${slug}`,
        referring_site: `https://charcuterielab.com${page.startsWith("/") ? page : "/"}`,
      }),
    });
    if (r.ok) return json(200, { ok: true });
    console.log("beehiiv error", r.status, (await r.text()).slice(0, 300));
    return json(502, { ok: false, error: "upstream" });
  } catch (e) {
    console.log("beehiiv fetch failed", e && e.message);
    return json(502, { ok: false, error: "upstream" });
  }
};

export const config = { path: "/api/subscribe" };
