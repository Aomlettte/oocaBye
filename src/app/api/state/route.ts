import { RECIPIENTS } from "@/data/recipients";
import { commentCounts, getReadMap, listPlayers } from "@/lib/store";
import type { GameState } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const [players, read, counts] = await Promise.all([
    listPlayers(),
    getReadMap(),
    commentCounts(RECIPIENTS.map((r) => r.id)),
  ]);
  const state: GameState = { players, read, commentCounts: counts };
  return Response.json(state);
}
