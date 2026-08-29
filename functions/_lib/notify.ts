import { journalPath, journalTitle } from "./journal-titles";
import type { Env } from "./util";

export async function notifyPendingComment(
  env: Env,
  row: { name: string; slug: string; body: string },
): Promise<void> {
  if (!env.NOTIFY) return;

  const title = journalTitle(row.slug);
  const postPath = journalPath(row.slug);
  const moderate = env.MODERATE_TOKEN
    ? `https://fitfambam.com/moderate?token=${env.MODERATE_TOKEN}`
    : "https://fitfambam.com/moderate";

  const subject = `Pending note: ${title.replace(/[\r\n]+/g, " ").trim()}`;
  const text = [
    `Name: ${row.name}`,
    `Post: ${title}`,
    `https://fitfambam.com${postPath}`,
    "",
    "Note:",
    row.body,
    "",
    "Moderate:",
    moderate,
  ].join("\n");

  const res = await env.NOTIFY.fetch("https://fitfambam-notify/send", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ subject, text }),
  });
  if (!res.ok) throw new Error("notify failed");
}
