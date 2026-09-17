import { AUTHOR } from "@/data/letters";
import { matchRecipient } from "@/data/recipients";
import { isAuthorKey } from "@/lib/access";
import { AUTHOR_COLOR, AVATAR_COLORS } from "@/lib/palette";
import { addStroke, clearBoard, getBoard, getStroke, removeStroke } from "@/lib/store";
import type { Stroke } from "@/lib/types";

export const dynamic = "force-dynamic";

const MAX_POINTS = 400;
const COLORS = new Set([AUTHOR_COLOR, ...AVATAR_COLORS]);
const TOOLS = new Set<string>(["pen", "paw", "fill", "eraser"]);

/** Who is asking: the writer (via key) or one of the five friends. */
function whoIs(body: { name?: unknown; key?: unknown }) {
  if (isAuthorKey(body.key)) return { name: AUTHOR.name, isAuthor: true };
  const r = matchRecipient(String(body.name ?? ""));
  return r ? { name: r.name, isAuthor: false } : null;
}

// GET /api/board?rev=3&since=120 — new strokes since index, or the full board if rev changed.
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const rev = Number(q.get("rev") ?? -1);
  const since = Math.max(0, Number(q.get("since") ?? 0) || 0);
  return Response.json(await getBoard(rev, since));
}

// POST /api/board { name, key?, stroke }
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const who = whoIs(body);
  if (!who) return Response.json({ error: "who?" }, { status: 403 });

  const s = body.stroke ?? {};
  const pts: unknown = s.pts;
  const valid =
    typeof s.id === "string" &&
    /^[\w-]{8,64}$/.test(s.id) &&
    TOOLS.has(s.tool) &&
    [0, 1, 2].includes(s.size) &&
    COLORS.has(s.color) &&
    Array.isArray(pts) &&
    pts.length >= 2 &&
    pts.length % 2 === 0 &&
    pts.length <= MAX_POINTS * 2 &&
    pts.every((n) => Number.isInteger(n) && n >= 0 && n <= 1000);
  if (!valid) return Response.json({ error: "bad stroke" }, { status: 400 });

  const stroke: Stroke = {
    id: s.id,
    by: who.name,
    tool: s.tool,
    size: s.size,
    color: s.color,
    pts: pts as number[],
    at: Date.now(),
  };
  if (!(await addStroke(stroke))) return Response.json({ error: "full" }, { status: 409 });
  return Response.json({ stroke });
}

// DELETE /api/board { name, key?, id? }  — undo your own stroke; the writer may clear all (no id).
export async function DELETE(req: Request) {
  const body = await req.json().catch(() => ({}));
  const who = whoIs(body);
  if (!who) return Response.json({ error: "who?" }, { status: 403 });

  if (!body.id) {
    await clearBoard();
    return new Response(null, { status: 204 });
  }
  const stroke = await getStroke(String(body.id));
  if (!stroke) return new Response(null, { status: 204 });
  if (stroke.by !== who.name && !who.isAuthor) return Response.json({ error: "not yours" }, { status: 403 });
  await removeStroke(stroke.id);
  return new Response(null, { status: 204 });
}
