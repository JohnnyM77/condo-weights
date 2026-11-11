// Checks the Cloudflare Access login token on every request and returns the person's email.
// Needs two settings in Cloudflare Pages (Settings > Variables and Secrets):
//   TEAM_DOMAIN  e.g. johnny.cloudflareaccess.com
//   POLICY_AUD   the "Application Audience (AUD) Tag" from your Access application
let certCache = { at: 0, keys: [] };

function b64url(s) {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  return Uint8Array.from(atob(s), c => c.charCodeAt(0));
}

async function getKeys(team) {
  if (Date.now() - certCache.at < 3600_000 && certCache.keys.length) return certCache.keys;
  const r = await fetch(`https://${team}/cdn-cgi/access/certs`);
  const j = await r.json();
  certCache = { at: Date.now(), keys: j.keys || [] };
  return certCache.keys;
}

export async function whoIs(request, env) {
  const token = request.headers.get("Cf-Access-Jwt-Assertion");
  if (!token || !env.TEAM_DOMAIN || !env.POLICY_AUD) return null;
  const [h, p, sig] = token.split(".");
  if (!h || !p || !sig) return null;
  const header = JSON.parse(new TextDecoder().decode(b64url(h)));
  const payload = JSON.parse(new TextDecoder().decode(b64url(p)));
  const jwk = (await getKeys(env.TEAM_DOMAIN)).find(k => k.kid === header.kid);
  if (!jwk) return null;
  const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
  const ok = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, b64url(sig), new TextEncoder().encode(`${h}.${p}`));
  if (!ok) return null;
  const aud = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!aud.includes(env.POLICY_AUD)) return null;
  if (payload.exp && payload.exp * 1000 < Date.now()) return null;
  if (payload.iss !== `https://${env.TEAM_DOMAIN}`) return null;
  return (payload.email || "").toLowerCase() || null;
}

export async function ensureTable(env) {
  await env.DB.prepare(
    "CREATE TABLE IF NOT EXISTS days (email TEXT NOT NULL, date TEXT NOT NULL, data TEXT NOT NULL, updated_at TEXT NOT NULL, PRIMARY KEY (email, date))"
  ).run();
}

export const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
