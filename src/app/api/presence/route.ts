import { AUTHOR } from "@/data/letters";
import { matchRecipient, RECIPIENTS } from "@/data/recipients";
import { isAuthorKey } from "@/lib/access";
import { AUTHOR_COLOR } from "@/lib/palette";
import { clearSeen, getSeen, listPlayers, touchSeen } from "@/lib/store";
import type { Person } from "@/lib/types";

export const dynamic = "force-dynamic";

/** Clients ping every 5s while the tab is visible; silence longer than this = offline. */
const ONLINE_MS = 12_000;

// POST /api/presence  { name, key?, leave? }
// Heartbeat (or goodbye) from one browser; returns everyone's status.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const self = isAuthorKey(body.key) ? AUTHOR.name : matchRecipient(String(body.name ?? ""))?.name;

  if (self) await (body.leave ? clearSeen(self) : touchSeen(self));
  if (body.leave) return new Response(null, { status: 204 });

  const [seen, players] = await Promise.all([getSeen(), listPlayers()]);
  const now = Date.now();
  const isOnline = (n: string) => now - Number(seen[n] ?? 0) < ONLINE_MS;
  const colorOf = new Map(players.map((p) => [p.name, p.color]));

  const people: Person[] = [
    { name: AUTHOR.name, color: AUTHOR_COLOR, online: isOnline(AUTHOR.name), isAuthor: true },
    ...RECIPIENTS.map((r) => ({
      name: r.name,
      color: colorOf.get(r.name) ?? null,
      online: isOnline(r.name),
      isAuthor: false,
    })),
  ];
  return Response.json({ people });
}
