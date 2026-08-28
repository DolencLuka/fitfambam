import {
  type Env,
  type PagesContext,
  json,
  jsonError,
  authorizeModerate,
  plainText,
} from "../_lib/util";

type QueueRow = {
  id: string;
  slug: string;
  name: string;
  body: string;
  created_at: string;
};

const STATUSES = new Set(["pending", "approved", "rejected"]);

export async function onRequestGet(context: PagesContext<Env>): Promise<Response> {
  try {
    if (!(await authorizeModerate(context.request, context.env.MODERATE_TOKEN))) {
      return jsonError("Unauthorized.", 401);
    }

    const statusParam = new URL(context.request.url).searchParams.get("status") || "pending";
    if (!STATUSES.has(statusParam)) {
      return jsonError("Invalid status.", 400);
    }

    const { results } = await context.env.DB.prepare(
      "SELECT id, slug, name, body, created_at FROM comments WHERE status = ? ORDER BY created_at ASC",
    )
      .bind(statusParam)
      .all<QueueRow>();

    return json(results ?? []);
  } catch {
    return jsonError("Could not list comments.", 500);
  }
}

export async function onRequestPost(context: PagesContext<Env>): Promise<Response> {
  try {
    if (!(await authorizeModerate(context.request, context.env.MODERATE_TOKEN))) {
      return jsonError("Unauthorized.", 401);
    }

    let body: Record<string, unknown>;
    try {
      body = (await context.request.json()) as Record<string, unknown>;
    } catch {
      return jsonError("Invalid JSON.", 400);
    }

    const id = plainText(body.id);
    const action = plainText(body.action);
    if (!id || (action !== "approve" && action !== "reject")) {
      return jsonError("Invalid request.", 400);
    }

    const status = action === "approve" ? "approved" : "rejected";
    const existing = await context.env.DB.prepare("SELECT id FROM comments WHERE id = ?")
      .bind(id)
      .first<{ id: string }>();
    if (!existing) {
      return jsonError("Not found.", 404);
    }

    await context.env.DB.prepare("UPDATE comments SET status = ? WHERE id = ?")
      .bind(status, id)
      .run();

    return json({ ok: true, id, status });
  } catch {
    return jsonError("Could not update comment.", 500);
  }
}
