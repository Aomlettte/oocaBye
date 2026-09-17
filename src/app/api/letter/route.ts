import { AUTHOR, LETTERS } from "@/data/letters";
import { RECIPIENTS } from "@/data/recipients";
import { canOpen, isRecipient } from "@/lib/access";
import { getReadMap, markRead } from "@/lib/store";
import type { LetterPayload } from "@/lib/types";

export const dynamic = "force-dynamic";

// GET /api/letter?id=bam  (headers: x-player-name, x-author-key)
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id") ?? "";
  const letter = LETTERS[id];
  const recipient = RECIPIENTS.find((r) => r.id === id);
  if (!letter || !recipient) return Response.json({ error: "ไม่พบจดหมาย" }, { status: 404 });

  const name = decodeURIComponent(req.headers.get("x-player-name") ?? "");
  const key = req.headers.get("x-author-key");
  const readAt = (await getReadMap())[id];

  if (!canOpen({ letterId: id, name, key, readAt })) {
    return Response.json(
      { error: `จดหมายนี้รอ ${recipient.name} เปิดอ่านก่อนนะ` },
      { status: 403 },
    );
  }

  const payload: LetterPayload = {
    id,
    to: recipient.name,
    greeting: letter.greeting,
    body: letter.body,
    drawing: letter.drawing,
    author: { name: AUTHOR.name, signOff: letter.signOff ?? AUTHOR.signOff },
    readAt: readAt ? Number(readAt) : null,
    canStamp: isRecipient(name, id),
  };
  return Response.json(payload);
}

// POST /api/letter  { id, name } — only the recipient can stamp their letter.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const id = String(body.id ?? "");
  if (!LETTERS[id]) return Response.json({ error: "ไม่พบจดหมาย" }, { status: 404 });
  if (!isRecipient(body.name, id)) {
    return Response.json({ error: "ปั๊มได้เฉพาะเจ้าของจดหมาย" }, { status: 403 });
  }
  const readAt = await markRead(id);
  return Response.json({ readAt });
}
