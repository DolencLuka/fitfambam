import { type Env, type PagesContext, authorizeModerate } from "./_lib/util";
import { journalPath, journalTitle } from "./_lib/journal-titles";

type QueueRow = {
  id: string;
  slug: string;
  name: string;
  body: string;
  created_at: string;
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function onRequestGet(context: PagesContext<Env>): Promise<Response> {
  const unauthorized = new Response("Unauthorized.", {
    status: 401,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });

  try {
    if (!(await authorizeModerate(context.request, context.env.MODERATE_TOKEN))) {
      return unauthorized;
    }

    const pageUrl = new URL(context.request.url);
    const token = pageUrl.searchParams.get("token") || "";
    const statusParam = pageUrl.searchParams.get("status") || "pending";
    const status = statusParam === "approved" || statusParam === "rejected" ? statusParam : "pending";

    const { results } = await context.env.DB.prepare(
      "SELECT id, slug, name, body, created_at FROM comments WHERE status = ? ORDER BY created_at ASC",
    )
      .bind(status)
      .all<QueueRow>();

    const rows = results ?? [];
    const items = rows.length
      ? rows
          .map((row) => {
            const when = escapeHtml(row.created_at);
            const title = escapeHtml(journalTitle(row.slug));
            const href = escapeHtml(journalPath(row.slug));
            const name = escapeHtml(row.name);
            const body = escapeHtml(row.body);
            const id = escapeHtml(row.id);
            const actions =
              status === "pending"
                ? `<p class="actions">
    <button type="button" data-action="approve" data-id="${id}">Approve</button>
    <button type="button" class="ghost" data-action="reject" data-id="${id}">Reject</button>
  </p>`
                : "";
            return `<article class="card" data-id="${id}">
  <p class="post"><a href="${href}">${title}</a></p>
  <p class="meta"><span>${when}</span></p>
  <p class="name">${name}</p>
  <p class="body">${body}</p>
  ${actions}
</article>`;
          })
          .join("\n")
      : `<p class="empty">${status === "pending" ? "Nothing waiting." : status === "approved" ? "No approved notes." : "No rejected notes."}</p>`;

    const nav = (["pending", "approved", "rejected"] as const)
      .map((key) => {
        const label = key[0].toUpperCase() + key.slice(1);
        const href = `/moderate?token=${encodeURIComponent(token)}&status=${key}`;
        return key === status
          ? `<span class="current">${label}</span>`
          : `<a href="${escapeHtml(href)}">${label}</a>`;
      })
      .join("");
    const heading = status[0].toUpperCase() + status.slice(1);

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex, nofollow" />
  <title>Moderate</title>
  <style>
    :root {
      --paper: #f6f5f2;
      --ink: #111111;
      --muted: #5c5c58;
      --line: #e3e2dd;
      --accent: #2f7d8c;
      --raised: #ffffff;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Instrument Sans", "Segoe UI", system-ui, sans-serif;
      background: var(--paper);
      color: var(--ink);
      line-height: 1.5;
    }
    main {
      width: min(40rem, calc(100% - 2.5rem));
      margin: 2.5rem auto 4rem;
    }
    h1 {
      font-family: Outfit, "Avenir Next", "Century Gothic", sans-serif;
      font-weight: 200;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      font-size: 1.15rem;
      margin: 0 0 1.25rem;
    }
    .card {
      background: var(--raised);
      border: 1px solid var(--line);
      padding: 1.1rem 1.15rem;
      margin-bottom: 0.75rem;
    }
    .tabs {
      display: flex;
      gap: 1rem;
      margin: 0 0 1rem;
      font-size: 0.8rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
    .tabs a { color: var(--muted); text-decoration: none; }
    .tabs a:hover { color: var(--ink); }
    .tabs .current { color: var(--ink); }
    .post { margin: 0 0 0.35rem; }
    .post a { color: var(--accent); text-decoration: none; }
    .post a:hover { text-decoration: underline; }
    .meta {
      display: flex;
      gap: 1rem;
      color: var(--muted);
      font-size: 0.8rem;
      margin: 0 0 0.45rem;
    }
    .name { margin: 0 0 0.35rem; font-weight: 600; }
    .body { margin: 0; white-space: pre-wrap; }
    .actions { display: flex; gap: 0.5rem; margin: 0.9rem 0 0; }
    button {
      font-family: Outfit, "Avenir Next", sans-serif;
      font-size: 0.72rem;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      border: 1px solid var(--ink);
      background: var(--ink);
      color: var(--paper);
      padding: 0.55rem 0.9rem;
      cursor: pointer;
    }
    button.ghost {
      background: transparent;
      color: var(--ink);
    }
    button:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
    .empty, .status { color: var(--muted); }
    .status { min-height: 1.4em; margin: 0 0 1rem; font-size: 0.9rem; }
  </style>
</head>
<body>
  <main>
    <h1>${heading}</h1>
    <p class="tabs">${nav}</p>
    <p class="status" data-status></p>
    <div data-queue>
      ${items}
    </div>
  </main>
  <script>
    const statusEl = document.querySelector("[data-status]");
    const queue = document.querySelector("[data-queue]");
    const token = new URLSearchParams(location.search).get("token") || "";
    queue.addEventListener("click", async (event) => {
      const btn = event.target.closest("button[data-action]");
      if (!btn) return;
      btn.disabled = true;
      statusEl.textContent = "";
      try {
        const res = await fetch("/api/moderate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({ id: btn.dataset.id, action: btn.dataset.action }),
        });
        if (!res.ok) {
          statusEl.textContent = "Could not update.";
          btn.disabled = false;
          return;
        }
        const card = btn.closest("article");
        if (card) card.remove();
        if (!queue.querySelector("article")) {
          queue.innerHTML = '<p class="empty">Nothing waiting.</p>';
        }
      } catch {
        statusEl.textContent = "Could not update.";
        btn.disabled = false;
      }
    });
  </script>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow",
        "Referrer-Policy": "same-origin",
      },
    });
  } catch {
    return unauthorized;
  }
}
