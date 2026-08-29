export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(): Promise<T | null>;
  all<T = unknown>(): Promise<{ results: T[] }>;
  run(): Promise<{ success: boolean }>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

export interface Env {
  DB: D1Database;
  MODERATE_TOKEN: string;
  IP_HASH_SECRET: string;
  TURNSTILE_SECRET_KEY?: string;
  TURNSTILE_SECRET?: string;
  TURNSTILE_SITE_KEY?: string;
  NOTIFY?: { fetch: typeof fetch };
}

export type PagesContext<E = Env> = {
  request: Request;
  env: E;
  waitUntil: (promise: Promise<unknown>) => void;
  params: Record<string, string>;
};

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HOUR_MS = 60 * 60 * 1000;

export function json(data: unknown, status = 200, extra: HeadersInit = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...extra,
    },
  });
}

export function jsonError(message: string, status: number): Response {
  return json({ error: message }, status);
}

export function isJournalSlug(slug: string): boolean {
  return slug.length >= 2 && slug.length <= 120 && SLUG_RE.test(slug);
}

export function plainText(input: unknown): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, " ")
    .replace(/&gt;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#0*39;/g, "'")
    .replace(/&#x0*27;/gi, "'")
    .replace(/[<>]/g, " ")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function getClientIp(request: Request): string {
  return request.headers.get("CF-Connecting-IP") || request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() || "";
}

export async function hashIp(ip: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(ip || "unknown"));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function timingSafeEqual(a: string, b: string): Promise<boolean> {
  const enc = new TextEncoder();
  const ha = new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(a)));
  const hb = new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(b)));
  let out = 0;
  for (let i = 0; i < ha.length; i++) out |= ha[i] ^ hb[i];
  return out === 0;
}

export function readBearerOrQuery(request: Request): string {
  const auth = request.headers.get("Authorization") || "";
  if (auth.startsWith("Bearer ")) return auth.slice(7).trim();
  return new URL(request.url).searchParams.get("token") || "";
}

export async function authorizeModerate(request: Request, expected: string): Promise<boolean> {
  if (!expected) return false;
  const got = readBearerOrQuery(request);
  if (!got) return false;
  return timingSafeEqual(got, expected);
}

export function turnstileSecret(env: Env): string {
  return env.TURNSTILE_SECRET_KEY || env.TURNSTILE_SECRET || "";
}

export async function verifyTurnstile(token: string, ip: string, secret: string): Promise<boolean> {
  if (!token || !secret) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret,
        response: token,
        remoteip: ip,
      }),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

export function hourAgoIso(): string {
  return new Date(Date.now() - HOUR_MS).toISOString();
}

export const LIMITS = {
  nameMin: 2,
  nameMax: 80,
  bodyMin: 8,
  bodyMax: 1500,
  postsPerHour: 5,
} as const;
