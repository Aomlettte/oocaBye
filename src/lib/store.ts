import "server-only";
import { Redis } from "@upstash/redis";
import type { BoardPayload, Comment, Player, Stroke } from "./types";

// Storage: Upstash Redis when env vars exist (Vercel Marketplace sets them),
// otherwise an in-memory store so `npm run dev` works with zero setup.

const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

const redis = url && token ? new Redis({ url, token }) : null;

if (!redis && process.env.VERCEL) {
  console.warn("[ooca-bye] No Redis env vars found — data will not persist.");
}

const K = {
  players: "ooca:players",
  read: "ooca:read",
  seen: "ooca:seen",
  boardOrder: "ooca:board:order",
  boardStrokes: "ooca:board:strokes",
  boardRev: "ooca:board:rev",
  comments: (id: string) => `ooca:comments:${id}`,
};

type Mem = {
  players: Map<string, Player>;
  read: Map<string, number>;
  seen: Map<string, number>;
  board: { order: string[]; strokes: Map<string, Stroke>; rev: number };
  comments: Map<string, Comment[]>;
};
const g = globalThis as unknown as { __oocaMem?: Mem };
const mem: Mem = (g.__oocaMem ??= {
  players: new Map(),
  read: new Map(),
  seen: new Map(),
  board: { order: [], strokes: new Map(), rev: 0 },
  comments: new Map(),
});
// Older dev-server memory objects may predate newer fields.
mem.seen ??= new Map();
mem.board ??= { order: [], strokes: new Map(), rev: 0 };

const key = (name: string) => name.trim().toLowerCase();

export async function getPlayer(name: string): Promise<Player | null> {
  if (!redis) return mem.players.get(key(name)) ?? null;
  return (await redis.hget<Player>(K.players, key(name))) ?? null;
}

/** Creates the player if new; returns the existing one otherwise (keeps their color). */
export async function upsertPlayer(p: Player): Promise<Player> {
  if (!redis) {
    const existing = mem.players.get(key(p.name));
    if (existing) return existing;
    mem.players.set(key(p.name), p);
    return p;
  }
  const created = await redis.hsetnx(K.players, key(p.name), p);
  if (created) return p;
  return (await getPlayer(p.name)) ?? p;
}

export async function listPlayers(): Promise<Player[]> {
  const all = redis
    ? Object.values((await redis.hgetall<Record<string, Player>>(K.players)) ?? {})
    : [...mem.players.values()];
  return all.sort((a, b) => a.joinedAt - b.joinedAt);
}

export async function getReadMap(): Promise<Record<string, number>> {
  if (!redis) return Object.fromEntries(mem.read);
  return (await redis.hgetall<Record<string, number>>(K.read)) ?? {};
}

export async function markRead(letterId: string): Promise<number> {
  const now = Date.now();
  if (!redis) {
    if (!mem.read.has(letterId)) mem.read.set(letterId, now);
    return mem.read.get(letterId)!;
  }
  await redis.hsetnx(K.read, letterId, now);
  return Number(await redis.hget(K.read, letterId)) || now;
}

export async function listComments(letterId: string): Promise<Comment[]> {
  if (!redis) return mem.comments.get(letterId) ?? [];
  return (await redis.lrange<Comment>(K.comments(letterId), 0, -1)) ?? [];
}

export async function addComment(c: Comment): Promise<void> {
  if (!redis) {
    mem.comments.set(c.letterId, [...(mem.comments.get(c.letterId) ?? []), c]);
    return;
  }
  await redis.rpush(K.comments(c.letterId), c);
}

export async function commentCounts(ids: string[]): Promise<Record<string, number>> {
  if (!redis) return Object.fromEntries(ids.map((id) => [id, mem.comments.get(id)?.length ?? 0]));
  const p = redis.pipeline();
  ids.forEach((id) => p.llen(K.comments(id)));
  const counts = await p.exec<number[]>();
  return Object.fromEntries(ids.map((id, i) => [id, counts[i] ?? 0]));
}

/** Presence: remember when each player last checked in. */
export async function touchSeen(name: string): Promise<void> {
  if (!redis) {
    mem.seen.set(name, Date.now());
    return;
  }
  await redis.hset(K.seen, { [name]: Date.now() });
}

export async function getSeen(): Promise<Record<string, number>> {
  if (!redis) return Object.fromEntries(mem.seen);
  return (await redis.hgetall<Record<string, number>>(K.seen)) ?? {};
}

export async function clearSeen(name: string): Promise<void> {
  if (!redis) {
    mem.seen.delete(name);
    return;
  }
  await redis.hdel(K.seen, name);
}

/* ---------- shared drawing board ----------
   Strokes live in a hash (id -> stroke) with a list for draw order.
   `rev` bumps whenever strokes are removed, telling clients to reload fully. */

export const BOARD_LIMIT = 1500;

export async function getBoard(sinceRev: number, since: number): Promise<BoardPayload> {
  if (!redis) {
    const { order, strokes, rev } = mem.board;
    const full = sinceRev !== rev || since > order.length;
    const ids = full ? order : order.slice(since);
    return { rev, total: order.length, full, strokes: ids.map((id) => strokes.get(id)!).filter(Boolean) };
  }
  const [revRaw, total] = await redis.pipeline().get<number>(K.boardRev).llen(K.boardOrder).exec<[number | null, number]>();
  const rev = Number(revRaw ?? 0);
  const full = sinceRev !== rev || since > total;
  const ids = await redis.lrange<string>(K.boardOrder, full ? 0 : since, -1);
  if (!ids.length) return { rev, total, full, strokes: [] };
  const map = (await redis.hmget<Record<string, Stroke>>(K.boardStrokes, ...ids)) ?? {};
  return { rev, total, full, strokes: ids.map((id) => map[id]).filter(Boolean) };
}

export async function addStroke(stroke: Stroke): Promise<boolean> {
  if (!redis) {
    if (mem.board.order.length >= BOARD_LIMIT) return false;
    mem.board.strokes.set(stroke.id, stroke);
    mem.board.order.push(stroke.id);
    return true;
  }
  if ((await redis.llen(K.boardOrder)) >= BOARD_LIMIT) return false;
  await redis.pipeline().hset(K.boardStrokes, { [stroke.id]: stroke }).rpush(K.boardOrder, stroke.id).exec();
  return true;
}

export async function getStroke(id: string): Promise<Stroke | null> {
  if (!redis) return mem.board.strokes.get(id) ?? null;
  return (await redis.hget<Stroke>(K.boardStrokes, id)) ?? null;
}

export async function removeStroke(id: string): Promise<void> {
  if (!redis) {
    mem.board.strokes.delete(id);
    mem.board.order = mem.board.order.filter((x) => x !== id);
    mem.board.rev++;
    return;
  }
  await redis.pipeline().lrem(K.boardOrder, 0, id).hdel(K.boardStrokes, id).incr(K.boardRev).exec();
}

export async function clearBoard(): Promise<void> {
  if (!redis) {
    mem.board = { order: [], strokes: new Map(), rev: mem.board.rev + 1 };
    return;
  }
  await redis.pipeline().del(K.boardOrder).del(K.boardStrokes).incr(K.boardRev).exec();
}
