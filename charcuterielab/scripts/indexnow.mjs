// IndexNow: tell Bing, Yandex, Seznam, Naver (and ChatGPT search via Bing) which pages changed.
// Usage, after Netlify has finished deploying:
//   node scripts/indexnow.mjs --all                         every URL in the live sitemap
//   node scripts/indexnow.mjs /blog/some-post/ /ingredients/brie/   just these pages
const HOST = "charcuterielab.com";
const KEY = "d7bf4eb85a19ca256a684e94bcfd8adf"; // matches public/d7bf4eb85a19ca256a684e94bcfd8adf.txt
const SITE = `https://${HOST}`;

let urls = process.argv.slice(2);
if (urls.includes("--all")) {
  const xml = await (await fetch(`${SITE}/sitemap.xml`)).text();
  urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
} else {
  urls = urls.map((u) => (u.startsWith("http") ? u : SITE + (u.startsWith("/") ? u : "/" + u)));
}
if (!urls.length) {
  console.log("Nothing to send. Pass page paths, or --all.");
  process.exit(1);
}

for (let i = 0; i < urls.length; i += 10000) {
  const urlList = urls.slice(i, i + 10000);
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList }),
  });
  console.log(`Sent ${urlList.length} URLs: HTTP ${res.status} ${res.status === 200 || res.status === 202 ? "(accepted)" : await res.text()}`);
}
