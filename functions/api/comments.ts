interface Env {
  DB: D1Database;
  TURNSTILE_SECRET_KEY: string;
  IP_HASH_SECRET: string;
}

const NAME_MIN = 2;
const NAME_MAX = 80;
const BODY_MIN = 8;
const BODY_MAX = 1500;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000;

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

function plainText(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/&/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

async function hmacHex(secret: string, value: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function clientIp(request: Request): string {
  return request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "";
}

async function verifyTurnstile(secret: string, token: string, ip: string): Promise<boolean> {
  if (!secret || !token) return false;
  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", token);
  if (ip) body.set("remoteip", ip);
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body,
  });
  if (!res.ok) return false;
  const data = (await res.json()) as { success?: boolean };
  return data.success === true;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const slug = plainText(new URL(context.request.url).searchParams.get("slug") || "");
  if (!SLUG_RE.test(slug) || slug.length > 120) return json({ error: "bad slug" }, 400);
  const rows = await context.env.DB.prepare(
    "SELECT id, name, body, created_at FROM comments WHERE slug = ? AND status = 'approved' ORDER BY created_at ASC",
  )
    .bind(slug)
    .all<{ id: string; name: string; body: string; created_at: string }>();
  return json(rows.results ?? []);
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  let payload: Record<string, unknown>;
  try {
    payload = (await context.request.json()) as Record<string, unknown>;
  } catch {
    return json({ error: "bad json" }, 400);
  }

  const honeypot = plainText(payload.website);
  if (honeypot) return new Response(null, { status: 204 });

  const slug = plainText(payload.slug);
  const name = plainText(payload.name);
  const body = plainText(payload.body);
  const token = typeof payload["cf-turnstile-response"] === "string" ? payload["cf-turnstile-response"] : "";

  if (!SLUG_RE.test(slug) || slug.length > 120) return json({ error: "bad slug" }, 400);
  if (name.length < NAME_MIN || name.length > NAME_MAX) return json({ error: "bad name" }, 400);
  if (body.length < BODY_MIN || body.length > BODY_MAX) return json({ error: "bad note" }, 400);

  const ip = clientIp(context.request);
  const ok = await verifyTurnstile(context.env.TURNSTILE_SECRET_KEY, token, ip);
  if (!ok) return json({ error: "check failed" }, 400);

  const salt = context.env.IP_HASH_SECRET;
  if (!salt) return json({ error: "unavailable" }, 500);
  const ipHash = await hmacHex(salt, ip || "unknown");
  const windowStart = new Date(Date.now() - RATE_WINDOW_MS).toISOString();
  const countRow = await context.env.DB.prepare(
    "SELECT COUNT(*) AS n FROM comments WHERE ip_hash = ? AND created_at > ?",
  )
    .bind(ipHash, windowStart)
    .first<{ n: number }>();
  if ((countRow?.n ?? 0) >= RATE_LIMIT) return json({ error: "slow down" }, 429);

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  await context.env.DB.prepare(
    "INSERT INTO comments (id, slug, name, body, created_at, status, ip_hash) VALUES (?, ?, ?, ?, ?, 'pending', ?)",
  )
    .bind(id, slug, name, body, createdAt, ipHash)
    .run();

  return json({ ok: true }, 201);
};
