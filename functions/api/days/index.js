import { whoIs, ensureTable, json } from "../../../lib/auth.js";

// GET /api/days  ->  { email, days: { "2026-11-11": {...}, ... } }  for the logged-in person only
export async function onRequestGet({ request, env }) {
  const email = await whoIs(request, env);
  if (!email) return json({ error: "not logged in" }, 401);
  await ensureTable(env);
  const { results } = await env.DB.prepare("SELECT date, data FROM days WHERE email = ?").bind(email).all();
  const days = {};
  for (const r of results) {
    try { days[r.date] = JSON.parse(r.data); } catch {}
  }
  return json({ email, days });
}
