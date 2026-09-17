"use client";

import type { BoardPayload, Comment, GameState, LetterPayload, Person, Player, Stroke } from "./types";

const ME_KEY = "ooca-bye:me";
const AUTHOR_KEY = "ooca-bye:author-key";

function safeGet(k: string) {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
}
function safeSet(k: string, v: string | null) {
  try {
    if (v === null) localStorage.removeItem(k);
    else localStorage.setItem(k, v);
  } catch {
    /* private mode — the session just won't be remembered */
  }
}

export function loadMe(): Player | null {
  const raw = safeGet(ME_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Player;
  } catch {
    return null;
  }
}
export const saveMe = (p: Player | null) => safeSet(ME_KEY, p ? JSON.stringify(p) : null);
export const loadAuthorKey = () => safeGet(AUTHOR_KEY);
export const saveAuthorKey = (k: string | null) => safeSet(AUTHOR_KEY, k);

async function json<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "เกิดข้อผิดพลาด ลองใหม่อีกครั้งนะ");
  return data as T;
}

const who = (name: string, key: string | null): HeadersInit => ({
  "x-player-name": encodeURIComponent(name),
  ...(key ? { "x-author-key": key } : {}),
});

export const api = {
  join: (name: string) =>
    fetch("/api/join", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name }),
    }).then((r) => json<{ player: Player; letterRead: boolean }>(r)),

  checkAuthor: (key: string) =>
    fetch("/api/author", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ key }),
    }).then((r) => json<{ ok: boolean; name: string | null }>(r)),

  state: () => fetch("/api/state", { cache: "no-store" }).then((r) => json<GameState>(r)),

  presence: (name: string, key: string | null) =>
    fetch("/api/presence", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, key }),
    }).then((r) => json<{ people: Person[] }>(r)),

  board: (rev: number, since: number) =>
    fetch(`/api/board?rev=${rev}&since=${since}`, { cache: "no-store" }).then((r) => json<BoardPayload>(r)),

  draw: (name: string, key: string | null, stroke: Omit<Stroke, "by" | "at">) =>
    fetch("/api/board", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, key, stroke }),
    }).then((r) => json<{ stroke: Stroke }>(r)),

  undoStroke: (name: string, key: string | null, id: string) =>
    fetch("/api/board", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, key, id }),
    }),

  clearBoard: (name: string, key: string | null) =>
    fetch("/api/board", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, key }),
    }),

  /** Fire-and-forget goodbye that survives the tab closing. */
  leave: (name: string, key: string | null) => {
    const body = new Blob([JSON.stringify({ name, key, leave: true })], { type: "application/json" });
    if (!navigator.sendBeacon?.("/api/presence", body)) {
      fetch("/api/presence", { method: "POST", body, keepalive: true }).catch(() => {});
    }
  },

  letter: (id: string, name: string, key: string | null) =>
    fetch(`/api/letter?id=${id}`, { headers: who(name, key), cache: "no-store" }).then((r) =>
      json<LetterPayload>(r),
    ),

  stamp: (id: string, name: string) =>
    fetch("/api/letter", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, name }),
    }).then((r) => json<{ readAt: number }>(r)),

  comments: (id: string, name: string, key: string | null) =>
    fetch(`/api/comments?id=${id}`, { headers: who(name, key), cache: "no-store" }).then((r) =>
      json<{ comments: Comment[] }>(r),
    ),

  comment: (id: string, name: string, text: string, key: string | null) =>
    fetch("/api/comments", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, name, text, key }),
    }).then((r) => json<{ comment: Comment }>(r)),
};

export function initials(name: string) {
  const chars = Array.from(name.trim());
  // Thai leading vowels (เ แ โ ใ ไ) read wrong alone — keep the consonant with them.
  const n = /^[\u0E40-\u0E44]/.test(chars[0] ?? "") ? 2 : 1;
  return chars.slice(0, n).join("").toUpperCase() || "?";
}

export function formatDate(ts: number, locale = "th-TH") {
  return new Date(ts).toLocaleDateString(locale, { day: "numeric", month: "short", year: "2-digit" });
}

export function formatTime(ts: number, locale = "th-TH") {
  return new Date(ts).toLocaleString(locale, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Phones get the share sheet (straight to Photos); everything else downloads. */
export async function downloadOrShare(blob: Blob, fileName: string, title: string) {
  const file = new File([blob], fileName, { type: blob.type || "image/png" });
  if (matchMedia("(pointer: coarse)").matches && navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title }).catch(() => {});
    return;
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
