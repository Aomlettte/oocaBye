import { matchRecipient } from "@/data/recipients";
import { randomColor } from "@/lib/palette";
import { getReadMap, touchSeen, upsertPlayer } from "@/lib/store";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const recipient = matchRecipient(String(body.name ?? ""));
  const name = recipient?.name;
  if (!recipient || !name) return Response.json({ error: "เลือกชื่อจากรายชื่อนะ" }, { status: 400 });
  const player = await upsertPlayer({ name, color: randomColor(), joinedAt: Date.now() });
  const [read] = await Promise.all([getReadMap(), touchSeen(name)]);
  return Response.json({ player, letterRead: Boolean(read[recipient.id]) });
}
