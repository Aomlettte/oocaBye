import type { BrushTool, Stroke } from "./types";

/** The board is a fixed 3:2 space of 0–1000 units, so every device sees the same drawing. */
export const BOARD_W = 1000;
export const BOARD_H = 667;

export const PEN_SIZES = [4, 9, 17];
export const PAW_SIZES = [16, 26, 38];
export const ERASER_SIZES = [20, 38, 64];

/** Paw prints are stamped along the path at this spacing (multiples of the paw radius). */
const PAW_STEP = 2.4;
const PAW_SWAY = 0.75;

function pawPath(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, angle: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.ellipse(0, r * 0.34, r * 0.62, r * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
  const toes: [number, number, number][] = [
    [-0.66, -0.16, -0.5],
    [-0.27, -0.55, -0.16],
    [0.27, -0.55, 0.16],
    [0.66, -0.16, 0.5],
  ];
  for (const [tx, ty, rot] of toes) {
    ctx.beginPath();
    ctx.ellipse(tx * r, ty * r, r * 0.22, r * 0.3, rot, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** Draws one stroke in board units; the caller scales the context. */
export function drawStroke(ctx: CanvasRenderingContext2D, stroke: Pick<Stroke, "tool" | "size" | "color" | "pts">) {
  const { pts, color } = stroke;
  if (pts.length < 2 || stroke.tool === "fill") return;
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;

  if (stroke.tool === "eraser") {
    // rubs out whatever is underneath, back to blank paper
    ctx.globalCompositeOperation = "destination-out";
  }

  if (stroke.tool !== "paw") {
    ctx.lineWidth = brushSizes(stroke.tool)[stroke.size];
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(pts[0], pts[1]);
    if (pts.length === 2) {
      // a tap: a single dot
      ctx.lineTo(pts[0] + 0.01, pts[1]);
    } else {
      // smooth through the midpoints so hand-drawn lines don't look faceted
      for (let i = 2; i < pts.length - 2; i += 2) {
        const mx = (pts[i] + pts[i + 2]) / 2;
        const my = (pts[i + 1] + pts[i + 3]) / 2;
        ctx.quadraticCurveTo(pts[i], pts[i + 1], mx, my);
      }
      ctx.lineTo(pts[pts.length - 2], pts[pts.length - 1]);
    }
    ctx.stroke();
    ctx.restore();
    return;
  }

  // paw: stamp prints along the path, swaying left and right like footsteps
  const r = PAW_SIZES[stroke.size];
  if (pts.length === 2) {
    pawPath(ctx, pts[0], pts[1], r, 0);
    ctx.restore();
    return;
  }
  const step = r * PAW_STEP;
  let carry = 0;
  let side = 1;
  pawPath(ctx, pts[0], pts[1], r, Math.atan2(pts[3] - pts[1], pts[2] - pts[0]) + Math.PI / 2);
  for (let i = 2; i < pts.length; i += 2) {
    const dx = pts[i] - pts[i - 2];
    const dy = pts[i + 1] - pts[i - 1];
    const len = Math.hypot(dx, dy);
    if (!len) continue;
    carry += len;
    while (carry >= step) {
      carry -= step;
      side *= -1;
      const t = 1 - carry / len;
      const px = pts[i - 2] + dx * t;
      const py = pts[i - 1] + dy * t;
      const angle = Math.atan2(dy, dx) + Math.PI / 2;
      pawPath(ctx, px - (dy / len) * r * PAW_SWAY * side, py + (dx / len) * r * PAW_SWAY * side, r, angle);
    }
  }
  ctx.restore();
}

export function brushSizes(tool: BrushTool) {
  if (tool === "paw") return PAW_SIZES;
  if (tool === "eraser") return ERASER_SIZES;
  return PEN_SIZES;
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/**
 * Paint-bucket fill in canvas pixels: spreads from the clicked point until it
 * hits ink, so any outline without a gap can be filled. Everyone replays the
 * same fills in the same order, so the board matches on every device.
 */
export function floodFill(ctx: CanvasRenderingContext2D, px: number, py: number, hex: string) {
  const { width: w, height: h } = ctx.canvas;
  const x0 = Math.round(px);
  const y0 = Math.round(py);
  if (x0 < 0 || y0 < 0 || x0 >= w || y0 >= h) return;

  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  const at = (x: number, y: number) => (y * w + x) * 4;
  const start = at(x0, y0);
  const target = [d[start], d[start + 1], d[start + 2], d[start + 3]];
  const [r, g, bl] = hexToRgb(hex);
  if (Math.abs(target[0] - r) < 8 && Math.abs(target[1] - g) < 8 && Math.abs(target[2] - bl) < 8 && target[3] === 255) {
    return; // already this color
  }

  const TOL = 60 * 60;
  const matches = (i: number) => {
    const da = d[i + 3] - target[3];
    const dr = d[i] - target[0];
    const dg = d[i + 1] - target[1];
    const db = d[i + 2] - target[2];
    // transparent pixels only match other transparent ones
    if (target[3] < 10) return d[i + 3] < 10;
    return d[i + 3] > 10 && dr * dr + dg * dg + db * db + da * da < TOL;
  };

  const stack = [[x0, y0]];
  const seen = new Uint8Array(w * h);
  while (stack.length) {
    const [sx, sy] = stack.pop()!;
    let x = sx;
    while (x > 0 && matches(at(x - 1, sy))) x--;
    let spanUp = false;
    let spanDown = false;
    for (; x < w && matches(at(x, sy)); x++) {
      const p = at(x, sy);
      if (seen[sy * w + x]) continue;
      seen[sy * w + x] = 1;
      d[p] = r;
      d[p + 1] = g;
      d[p + 2] = bl;
      d[p + 3] = 255;
      const up = sy > 0 && matches(at(x, sy - 1));
      if (up && !spanUp) stack.push([x, sy - 1]);
      spanUp = up;
      const down = sy < h - 1 && matches(at(x, sy + 1));
      if (down && !spanDown) stack.push([x, sy + 1]);
      spanDown = down;
    }
  }
  ctx.putImageData(img, 0, 0);
}
