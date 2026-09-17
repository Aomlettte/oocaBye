import "server-only";
import { timingSafeEqual } from "node:crypto";
import { matchRecipient } from "@/data/recipients";

/** True when the request carries the author's secret (set AUTHOR_KEY in Vercel). */
export function isAuthorKey(key: unknown): boolean {
  const secret = process.env.AUTHOR_KEY;
  if (!secret || typeof key !== "string" || !key) return false;
  const a = Buffer.from(key);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function isRecipient(name: unknown, letterId: string): boolean {
  return typeof name === "string" && matchRecipient(name)?.id === letterId;
}

/** The owner opens first; once they stamp it, the letter is open to everyone. */
export function canOpen(opts: { letterId: string; name: unknown; key: unknown; readAt: number | undefined }) {
  return isAuthorKey(opts.key) || isRecipient(opts.name, opts.letterId) || Boolean(opts.readAt);
}

export function cleanName(name: unknown): string | null {
  if (typeof name !== "string") return null;
  const n = name.replace(/\s+/g, " ").trim().slice(0, 24);
  return n.length ? n : null;
}
