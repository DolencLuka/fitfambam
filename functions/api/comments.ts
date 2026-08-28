import {
  type Env,
  type PagesContext,
  json,
  jsonError,
  isJournalSlug,
  plainText,
  getClientIp,
  hashIp,
  turnstileSecret,
  verifyTurnstile,
  hourAgoIso,
  LIMITS,
} from "../_lib/util";

type PublicComment = {
  id: string;
  name: string;
  body: string;
  created_at: string;
};

export async function onRequestGet(context: PagesContext<Env>): Promise<Response> {
  try {
    const slug = new URL(context.request.url).searchParams.get("slug") || "";
    if (!isJournalSlug(slug)) {
      return jsonError("Invalid slug.", 400);
    }

    const { results } = await context.env.DB.prepare(
      "SELECT id, name, body, created_at FROM comments WHERE slug = ? AND status = 'approved' ORDER BY created_at ASC",
    )
      .bind(slug)
      .all<PublicComment>();

    return json(results ?? []);
  } catch {
    return jsonError("Could not load comments.", 500);
  }
}

export async function onRequestPost(context: PagesContext<Env>): Promise<Response> {
  try {
    let body: Record<string, unknown>;
    try {
      body = (await context.request.json()) as Record<string, unknown>;
    } catch {
      return jsonError("Invalid JSON.", 400);
    }

    const honeypot = typeof body.website === "string" ? body.website.trim() : "";
    if (honeypot) {
      return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
    }

    const slug = plainText(body.slug).toLowerCase();
    const name = plainText(body.name);
    const text = plainText(body.body);

    if (!isJournalSlug(slug)) {
      return jsonError("Invalid slug.", 400);
    }
    if (name.length < LIMITS.nameMin || name.length > LIMITS.nameMax) {
      return jsonError("Name must be 2-80 characters.", 400);
    }
    if (text.length < LIMITS.bodyMin || text.length > LIMITS.bodyMax) {
      return jsonError("Comment must be 8-1500 characters.", 400);
    }

    const ip = getClientIp(context.request);
    const secret = turnstileSecret(context.env);
    const token =
      (typeof body["cf-turnstile-response"] === "string" && body["cf-turnstile-response"]) ||
      (typeof body.cf_turnstile_response === "string" && body.cf_turnstile_response) ||
      "";

    const ok = await verifyTurnstile(token, ip, secret);
    if (!ok) {
      return jsonError("Verification failed.", 403);
    }

    if (!context.env.IP_HASH_SECRET) {
      return jsonError("Could not save comment.", 500);
    }

    const ipHash = await hashIp(ip, context.env.IP_HASH_SECRET);
    const since = hourAgoIso();
    const countRow = await context.env.DB.prepare(
      "SELECT COUNT(*) AS n FROM comments WHERE ip_hash = ? AND created_at >= ?",
    )
      .bind(ipHash, since)
      .first<{ n: number }>();

    if (Number(countRow?.n ?? 0) >= LIMITS.postsPerHour) {
      return jsonError("Too many comments. Try again later.", 429);
    }

    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    await context.env.DB.prepare(
      "INSERT INTO comments (id, slug, name, body, created_at, status, ip_hash) VALUES (?, ?, ?, ?, ?, 'pending', ?)",
    )
      .bind(id, slug, name, text, createdAt, ipHash)
      .run();

    return json({ ok: true }, 201);
  } catch {
    return jsonError("Could not save comment.", 500);
  }
}
