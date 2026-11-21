import { getStore } from "@netlify/blobs";

const stats = getStore("mundcond-visitor-stats");
const presence = getStore("mundcond-presence");
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Cache-Control": "no-store" };

function dateKeys() {
  const now = new Date();
  const day = now.toISOString().slice(0, 10).replaceAll("-", "");
  const month = now.toISOString().slice(0, 7).replace("-", "");
  return { day, month, now: now.getTime() };
}
async function hashId(id) {
  const bytes = new TextEncoder().encode(id);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, "0")).join("");
}
async function countPrefix(store, prefix) {
  const { blobs } = await store.list({ prefix });
  return blobs.length;
}
async function countOnline(now) {
  const { blobs } = await presence.list({ prefix: "p/" });
  let count = 0;
  for (const item of blobs) {
    const stamp = Number(await presence.get(item.key));
    if (Number.isFinite(stamp) && now - stamp < 75_000) count++;
    else await presence.delete(item.key);
  }
  return count;
}
export default async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  if (req.method !== "GET" && req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: CORS });
  try {
    const { day, month, now } = dateKeys();
    if (req.method === "POST") {
      const payload = await req.json().catch(() => ({}));
      const id = typeof payload.visitorId === "string" ? payload.visitorId : "";
      if (id.length < 20 || id.length > 100) return new Response("Bad visitor ID", { status: 400, headers: CORS });
      const digest = await hashId(id);
      await stats.set(`d/${day}/${digest}`, "1", { onlyIfNew: true });
      await stats.set(`m/${month}/${digest}`, "1", { onlyIfNew: true });
      await presence.set(`p/${digest}`, String(now));
    }
    const [today, monthCount, online] = await Promise.all([
      countPrefix(stats, `d/${day}/`),
      countPrefix(stats, `m/${month}/`),
      countOnline(now)
    ]);
    return new Response(JSON.stringify({ today, month: monthCount, online }), { status: 200, headers: { ...CORS, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("Visitor stats function error:", err);
    return new Response(JSON.stringify({ error: "Stats unavailable" }), { status: 503, headers: { ...CORS, "Content-Type": "application/json" } });
  }
};
