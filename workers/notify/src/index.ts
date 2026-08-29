import { EmailMessage } from "cloudflare:email";

const FROM = "journal@fitfambam.com";
const TO = "fitfambam@gmail.com";

export interface Env {
  EMAIL: { send(message: EmailMessage): Promise<void> };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "POST") {
      return new Response("Method not allowed.", { status: 405 });
    }

    let payload: { subject?: unknown; text?: unknown };
    try {
      payload = (await request.json()) as { subject?: unknown; text?: unknown };
    } catch {
      return new Response("Invalid JSON.", { status: 400 });
    }

    const subject = typeof payload.subject === "string" ? payload.subject.replace(/[\r\n]+/g, " ").trim() : "";
    const text = typeof payload.text === "string" ? payload.text : "";
    if (!subject || !text) {
      return new Response("Missing subject or text.", { status: 400 });
    }

    const raw = [
      `From: FitFamBam <${FROM}>`,
      `To: ${TO}`,
      `Subject: ${subject}`,
      "MIME-Version: 1.0",
      "Content-Type: text/plain; charset=utf-8",
      "",
      text,
    ].join("\r\n");

    await env.EMAIL.send(new EmailMessage(FROM, TO, raw));
    return new Response("ok");
  },
};
