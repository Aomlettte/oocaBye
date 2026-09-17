import { LETTERS } from "@/data/letters";
import { AUTHOR } from "@/data/letters";
import { canOpen, cleanName, isAuthorKey } from "@/lib/access";
import { AUTHOR_COLOR } from "@/lib/palette";
import { addComment, getPlayer, getReadMap, listComments } from "@/lib/store";
import type { Comment } from "@/lib/types";

export const dynamic = "force-dynamic";

const MAX_LEN = 300;

async function guard(id: string, name: unknown, key: unknown) {
  if (!LETTERS[id]) return Response.json({ error: "ไม่พบจดหมาย" }, { status: 404 });
  const readAt = (await getReadMap())[id];
  if (!canOpen({ letterId: id, name, key, readAt })) {
    return Response.json({ error: "ยังเปิดจดหมายนี้ไม่ได้" }, { status: 403 });
  }
  return null;
}

// GET /api/comments?id=bam
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id") ?? "";
  const name = decodeURIComponent(req.headers.get("x-player-name") ?? "");
  const denied = await guard(id, name, req.headers.get("x-author-key"));
  if (denied) return denied;
  return Response.json({ comments: await listComments(id) });
}

// POST /api/comments  { id, name, text, key? }
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const id = String(body.id ?? "");
  const denied = await guard(id, body.name, body.key);
  if (denied) return denied;

  const text = typeof body.text === "string" ? body.text.trim().slice(0, MAX_LEN) : "";
  if (!text) return Response.json({ error: "พิมพ์อะไรสักหน่อยนะ" }, { status: 400 });

  const author = isAuthorKey(body.key);
  const name = author ? AUTHOR.name : cleanName(body.name);
  if (!name) return Response.json({ error: "กรุณาใส่ชื่อ" }, { status: 400 });
  const player = author ? null : await getPlayer(name);

  const comment: Comment = {
    id: crypto.randomUUID(),
    letterId: id,
    name,
    color: author ? AUTHOR_COLOR : (player?.color ?? "#dddddd"),
    text,
    isAuthor: author,
    at: Date.now(),
  };
  await addComment(comment);
  return Response.json({ comment });
}
