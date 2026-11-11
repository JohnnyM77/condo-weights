import { whoIs, ensureTable, json } from "../../../lib/auth.js";

// PUT /api/days/2026-11-11  body: that day's log  ->  saves it for the logged-in person
export async function onRequestPut({ request, env, params }) {
  const email = await whoIs(request, env);
  if (!email) return json({ error: "not logged in" }, 401);
  const date = String(params.date || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return json({ error: "bad date" }, 400);
  const text = await request.text();
  if (text.length > 50_000) return json({ error: "too big" }, 413);
  let body;
  try { body = JSON.parse(text); } catch { return json({ error: "bad json" }, 400); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return json({ error: "bad body" }, 400);
  await ensureTable(env);
  await env.DB.prepare(
    "INSERT INTO days (email, date, data, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(email, date) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at"
  ).bind(email, date, JSON.stringify(body), new Date().toISOString()).run();
  return json({ ok: true });
}
