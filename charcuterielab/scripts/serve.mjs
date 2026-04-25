import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { readFile, stat } from "node:fs/promises";

const dist = join(process.cwd(), "dist");
const port = Number(process.env.PORT || 4173);

const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".txt": "text/plain; charset=utf-8"
};

function resolvePath(url) {
  const clean = decodeURIComponent(new URL(url, "http://localhost").pathname);
  const requested = normalize(clean).replace(/^(\.\.[/\\])+/, "");
  return join(dist, requested === "/" ? "index.html" : requested);
}

createServer(async (req, res) => {
  try {
    let file = resolvePath(req.url);
    const info = await stat(file).catch(() => null);
    if (info?.isDirectory()) file = join(file, "index.html");

    const body = await readFile(file);
    res.writeHead(200, { "Content-Type": types[extname(file)] || "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
}).listen(port, () => {
  console.log(`Charcuterie Lab preview: http://localhost:${port}`);
});
