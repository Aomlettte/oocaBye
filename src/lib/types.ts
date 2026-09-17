export type Player = {
  name: string;
  color: string;
  joinedAt: number;
};

export type Comment = {
  id: string;
  letterId: string;
  name: string;
  color: string;
  text: string;
  isAuthor: boolean;
  at: number;
};

export type GameState = {
  players: Player[];
  /** letterId -> timestamp the recipient stamped it as read */
  read: Record<string, number>;
  commentCounts: Record<string, number>;
};

export type Person = {
  name: string;
  /** null until the friend has picked their name once */
  color: string | null;
  online: boolean;
  isAuthor: boolean;
};

export type LetterPayload = {
  id: string;
  to: string;
  greeting: string;
  body: string;
  drawing?: { src: string; caption?: string };
  author: { name: string; signOff: string };
  readAt: number | null;
  canStamp: boolean;
};

export type BrushTool = "pen" | "paw" | "fill" | "eraser";

/** One stroke on the shared drawing board. Coordinates are 0–1000 on a 3:2 board. */
export type Stroke = {
  id: string;
  by: string;
  tool: BrushTool;
  /** 0 = small, 1 = medium, 2 = large */
  size: 0 | 1 | 2;
  color: string;
  /** flat [x0, y0, x1, y1, …] */
  pts: number[];
  at: number;
};

export type BoardPayload = {
  rev: number;
  total: number;
  /** true when `strokes` is the whole board (client should replace, not append) */
  full: boolean;
  strokes: Stroke[];
};
