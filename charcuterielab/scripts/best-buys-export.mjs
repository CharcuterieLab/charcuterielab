// Prints the Best Buys hub as JSON cards (name, #1 pick, value pick, score),
// for scripts/lead-pdfs.py, so the Top Picks printable matches the hub.
import { readdir, readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parseHub, BEST_CATS } from "./best-buys.mjs";
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const blog = join(root, "content", "blog");
const posts = new Map((await readdir(blog)).filter((f) => f.endsWith(".md")).map((f) => [f.slice(0, -3), { image: "" }]));
const md = await readFile(join(blog, "best-charcuterie-brands.md"), "utf8");
const body = md.replace(/^---[\s\S]*?---/, "");
const { cards } = parseHub(body, posts);
console.log(JSON.stringify({ cats: BEST_CATS.map(([, k, label]) => [k, label]), cards }));
