interface Env {
  DB: D1Database;
  MODERATE_TOKEN: string;
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex" },
  });
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

function authorized(request: Request, token: string): boolean {
  if (!token) return false;
  const header = request.headers.get("authorization") || "";
  const bearer = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
  const query = new URL(request.url).searchParams.get("token") || "";
  return timingSafeEqual(bearer, token) || timingSafeEqual(query, token);
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  if (!authorized(context.request, context.env.MODERATE_TOKEN)) return json({ error: "no" }, 401);
  const status = new URL(context.request.url).searchParams.get("status") || "pending";
  if (!["pending", "approved", "rejected"].includes(status)) return json({ error: "bad status" }, 400);
  const rows = await context.env.DB.prepare(
    "SELECT id, slug, name, body, created_at, status FROM comments WHERE status = ? ORDER BY created_at ASC",
  )
    .bind(status)
    .all();
  return json(rows.results ?? []);
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  if (!authorized(context.request, context.env.MODERATE_TOKEN)) return json({ error: "no" }, 401);
  let payload: { id?: string; action?: string };
  try {
    payload = (await context.request.json()) as { id?: string; action?: string };
  } catch {
    return json({ error: "bad json" }, 400);
  }
  const id = typeof payload.id === "string" ? payload.id : "";
  const action = payload.action;
  if (!id || (action !== "approve" && action !== "reject")) return json({ error: "bad action" }, 400);
  const status = action === "approve" ? "approved" : "rejected";
  const result = await context.env.DB.prepare("UPDATE comments SET status = ? WHERE id = ?")
    .bind(status, id)
    .run();
  if (!result.meta.changes) return json({ error: "missing" }, 404);
  return json({ ok: true, status });
};
