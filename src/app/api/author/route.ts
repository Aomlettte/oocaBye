import { AUTHOR } from "@/data/letters";
import { isAuthorKey } from "@/lib/access";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const ok = isAuthorKey(body.key);
  return Response.json({ ok, name: ok ? AUTHOR.name : null });
}
