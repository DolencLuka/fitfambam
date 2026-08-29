import { EmailMessage } from "cloudflare:email";
import { journalPath, journalTitle } from "./journal-titles";
import type { Env } from "./util";

const FROM = "journal@fitfambam.com";
const TO = "fitfambam@gmail.com";

function oneLine(s: string): string {
  return s.replace(/[\r\n]+/g, " ").trim();
}

export async function notifyPendingComment(
  env: Env,
  row: { name: string; slug: string; body: string },
): Promise<void> {
  if (!env.EMAIL) return;

  const title = journalTitle(row.slug);
  const postPath = journalPath(row.slug);
  const moderate =
    env.MODERATE_TOKEN ? `https://fitfambam.com/moderate?token=${env.MODERATE_TOKEN}` : "https://fitfambam.com/moderate";

  const subject = `Pending note: ${oneLine(title)}`;
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

  const raw = [
    `From: FitFamBam <${FROM}>`,
    `To: ${TO}`,
    `Subject: ${oneLine(subject)}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=utf-8",
    "",
    text,
  ].join("\r\n");

  await env.EMAIL.send(new EmailMessage(FROM, TO, raw));
}
