// Prints the Party Planner numbers as JSON, for the printable PDFs
// (scripts/party-pdfs.py). Same plan() as the web pages, so they always agree.
import { BOARD_FOR, COUNTS, MODES, plan, timeline } from "./party.mjs";
const out = { modes: MODES, counts: {} };
for (const n of COUNTS) out.counts[n] = { board: BOARD_FOR[n], plans: Object.fromEntries(Object.keys(MODES).map((m) => [m, plan(n, m)])), timeline: timeline(n) };
for (const n of [25, 50, 75, 100, 150]) out.counts[n] = out.counts[n] || { board: 49, plans: Object.fromEntries(Object.keys(MODES).map((m) => [m, plan(n, m)])), timeline: timeline(n) };
console.log(JSON.stringify(out));
