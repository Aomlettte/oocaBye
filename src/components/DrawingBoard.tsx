"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BOARD_H, BOARD_W, brushSizes, drawStroke, floodFill } from "@/lib/board";
import { api, downloadOrShare } from "@/lib/client";
import { useT } from "@/lib/i18n";
import { AUTHOR_COLOR, AVATAR_COLORS } from "@/lib/palette";
import type { Player, Stroke } from "@/lib/types";
import { Icon } from "./Doodles";

const POLL_MS = 2500;
const MIN_STEP = 6; // board units between recorded points
const MAX_POINTS = 400;
const PAPER = "#fffdf8";

export function DrawingBoard({ me, authorKey }: { me: Player; authorKey: string | null }) {
  const t = useT();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  // Committed strokes live on an offscreen canvas; the visible one is that plus the live stroke.
  const baseRef = useRef<HTMLCanvasElement>(null);
  const strokesRef = useRef<Stroke[]>([]);
  const syncRef = useRef({ rev: -1, total: 0 });
  const liveRef = useRef<{ pts: number[]; pointer: number } | null>(null);

  const [tool, setTool] = useState<"pen" | "paw" | "fill" | "eraser">("pen");
  const [size, setSize] = useState<0 | 1 | 2>(1);
  const [color, setColor] = useState(authorKey ? AUTHOR_COLOR : me.color);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  const [redoLeft, setRedoLeft] = useState(0);
  const [confirmClear, setConfirmClear] = useState(false);
  // strokes this browser undid, newest last — redo puts them back
  const undoneRef = useRef<Stroke[]>([]);

  const brush = { tool, size, color };

  // the pointer handlers read the brush from a ref, so they never go stale
  const brushRef = useRef(brush);
  useEffect(() => {
    brushRef.current = brush;
  });

  /** Draws base + the stroke currently under the finger. */
  const present = useCallback(() => {
    const base = baseRef.current;
    const view = canvasRef.current;
    if (!base || !view) return;
    const ctx = view.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, view.width, view.height);
    ctx.drawImage(base, 0, 0, view.width, view.height);
    const live = liveRef.current;
    const brush = brushRef.current;
    if (live && live.pts.length >= 2 && brush.tool !== "fill") {
      ctx.scale(view.width / BOARD_W, view.height / BOARD_H);
      // erasing previews as paper-coloured ink; the stored stroke really rubs out
      drawStroke(ctx, {
        ...brush,
        tool: brush.tool === "eraser" ? "pen" : brush.tool,
        color: brush.tool === "eraser" ? PAPER : brush.color,
        pts: live.pts,
      });
    }
  }, []);

  /** Repaints the offscreen canvas from scratch, then shows it. */
  const repaint = useCallback(() => {
    const base = baseRef.current;
    if (!base) return;
    const ctx = base.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, base.width, base.height);
    const sx = base.width / BOARD_W;
    const sy = base.height / BOARD_H;
    for (const stroke of strokesRef.current) {
      if (stroke.tool === "fill") {
        floodFill(ctx, stroke.pts[0] * sx, stroke.pts[1] * sy, stroke.color);
        continue;
      }
      ctx.save();
      ctx.scale(sx, sy);
      drawStroke(ctx, stroke);
      ctx.restore();
    }
    present();
  }, [present]);

  // size canvases to the element (and the screen's pixel ratio)
  useEffect(() => {
    const view = canvasRef.current;
    const wrap = wrapRef.current;
    if (!view || !wrap) return;
    if (!baseRef.current) baseRef.current = document.createElement("canvas");

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(wrap.clientWidth * dpr);
      const h = Math.round((wrap.clientWidth * (BOARD_H / BOARD_W)) * dpr);
      for (const c of [view, baseRef.current!]) {
        c.width = w;
        c.height = h;
      }
      repaint();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [repaint]);

  // pull new strokes while the tab is visible
  const sync = useCallback(async () => {
    try {
      const { rev, total, full, strokes } = await api.board(syncRef.current.rev, syncRef.current.total);
      if (!full && !strokes.length) {
        syncRef.current = { rev, total };
        return;
      }
      const mine = strokesRef.current.filter((s) => s.id.startsWith("local-"));
      strokesRef.current = full ? [...strokes, ...mine] : [...strokesRef.current, ...strokes];
      syncRef.current = { rev, total };
      setCount(strokesRef.current.length);
      repaint();
    } catch {
      /* keep drawing offline; the next poll will catch up */
    }
  }, [repaint]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    const start = () => {
      clearInterval(timer);
      sync();
      timer = setInterval(sync, POLL_MS);
    };
    const onVisibility = () => (document.hidden ? clearInterval(timer) : start());
    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [sync]);

  const toBoard = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * BOARD_W;
    const y = ((e.clientY - r.top) / r.height) * BOARD_H;
    return [Math.round(Math.min(BOARD_W, Math.max(0, x))), Math.round(Math.min(BOARD_H, Math.max(0, y)))];
  };

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (busy) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    liveRef.current = { pts: toBoard(e), pointer: e.pointerId };
    present();
  };

  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const live = liveRef.current;
    if (!live || live.pointer !== e.pointerId) return;
    const [x, y] = toBoard(e);
    const n = live.pts.length;
    if (Math.hypot(x - live.pts[n - 2], y - live.pts[n - 1]) < MIN_STEP) return;
    if (live.pts.length >= MAX_POINTS * 2) return;
    live.pts.push(x, y);
    present();
  };

  const onUp = async (e: React.PointerEvent<HTMLCanvasElement>) => {
    const live = liveRef.current;
    if (!live || live.pointer !== e.pointerId) return;
    liveRef.current = null;
    const pts = brushRef.current.tool === "fill" ? live.pts.slice(0, 2) : live.pts;
    const local: Stroke = {
      id: `local-${crypto.randomUUID()}`,
      by: me.name,
      ...brushRef.current,
      pts,
      at: Date.now(),
    };
    strokesRef.current.push(local);
    setCount(strokesRef.current.length);
    repaint();

    try {
      const { stroke } = await api.draw(me.name, authorKey, {
        id: crypto.randomUUID(),
        tool: local.tool,
        size: local.size,
        color: local.color,
        pts,
      });
      // swap the optimistic copy for the stored one so undo can find it
      const i = strokesRef.current.findIndex((s) => s.id === local.id);
      if (i >= 0) strokesRef.current[i] = stroke;
    } catch (err) {
      strokesRef.current = strokesRef.current.filter((s) => s.id !== local.id);
      setCount(strokesRef.current.length);
      repaint();
      setError((err as Error).message);
      setTimeout(() => setError(null), 3500);
    }
  };

  const undo = async () => {
    const mine = [...strokesRef.current].reverse().find((s) => s.by === me.name && !s.id.startsWith("local-"));
    if (!mine || busy) return;
    setBusy(true);
    strokesRef.current = strokesRef.current.filter((s) => s.id !== mine.id);
    undoneRef.current.push(mine);
    setRedoLeft(undoneRef.current.length);
    setCount(strokesRef.current.length);
    repaint();
    await api.undoStroke(me.name, authorKey, mine.id).catch(() => {});
    syncRef.current = { rev: -1, total: 0 };
    await sync();
    setBusy(false);
  };

  const redo = async () => {
    const back = undoneRef.current.pop();
    if (!back || busy) return;
    setRedoLeft(undoneRef.current.length);
    setBusy(true);
    try {
      const { stroke } = await api.draw(me.name, authorKey, {
        id: crypto.randomUUID(),
        tool: back.tool,
        size: back.size,
        color: back.color,
        pts: back.pts,
      });
      strokesRef.current.push(stroke);
      setCount(strokesRef.current.length);
      repaint();
    } catch (err) {
      undoneRef.current.push(back);
      setRedoLeft(undoneRef.current.length);
      setError((err as Error).message);
      setTimeout(() => setError(null), 3500);
    }
    setBusy(false);
  };

  const clearAll = async () => {
    setConfirmClear(false);
    if (busy) return;
    setBusy(true);
    await api.clearBoard(me.name, authorKey).catch(() => {});
    strokesRef.current = [];
    undoneRef.current = [];
    setRedoLeft(0);
    syncRef.current = { rev: -1, total: 0 };
    await sync();
    setBusy(false);
  };

  const saveImage = async () => {
    const view = canvasRef.current;
    if (!view) return;
    liveRef.current = null;
    present();
    view.toBlob((blob) => blob && downloadOrShare(blob, "ooca-babye-board.png", t.boardTitle));
  };

  const colors = authorKey ? [AUTHOR_COLOR, ...AVATAR_COLORS] : [AUTHOR_COLOR, me.color, ...AVATAR_COLORS.filter((c) => c !== me.color)];

  return (
    <section className="board" aria-labelledby="board-title">
      <div className="board__head">
        <h2 id="board-title" className="section-title section-title--sm">
          {t.boardTitle}
        </h2>
        <p className="board__sub">{t.boardSub}</p>
      </div>

      <div className="board__bar" role="toolbar" aria-label={t.boardTools}>
        <div className="board__group">
          <button
            className={`doodle-btn doodle-btn--icon board__btn ${tool === "pen" ? "is-active" : ""}`}
            onClick={() => setTool("pen")}
            aria-pressed={tool === "pen"}
            aria-label={t.brushPen}
            title={t.brushPen}
          >
            <Icon name="pencil" />
          </button>
          <button
            className={`doodle-btn doodle-btn--icon board__btn ${tool === "paw" ? "is-active" : ""}`}
            onClick={() => setTool("paw")}
            aria-pressed={tool === "paw"}
            aria-label={t.brushPaw}
            title={t.brushPaw}
          >
            <Icon name="paw" />
          </button>
          <button
            className={`doodle-btn doodle-btn--icon board__btn ${tool === "fill" ? "is-active" : ""}`}
            onClick={() => setTool("fill")}
            aria-pressed={tool === "fill"}
            aria-label={t.brushFill}
            title={t.brushFill}
          >
            <Icon name="bucket" />
          </button>
          <button
            className={`doodle-btn doodle-btn--icon board__btn ${tool === "eraser" ? "is-active" : ""}`}
            onClick={() => setTool("eraser")}
            aria-pressed={tool === "eraser"}
            aria-label={t.brushEraser}
            title={t.brushEraser}
          >
            <Icon name="eraser" />
          </button>
        </div>

        <div className="board__middle">
          {tool !== "fill" && (
            <div className="board__group" aria-label={t.brushSize}>
              {brushSizes(tool).map((px, i) => (
                <button
                  key={i}
                  className={`board__size ${size === i ? "is-active" : ""}`}
                  onClick={() => setSize(i as 0 | 1 | 2)}
                  aria-label={`${t.brushSize} ${i + 1}`}
                  aria-pressed={size === i}
                >
                  <span
                    style={{
                      width: px / 2.2,
                      height: px / 2.2,
                      background: tool === "eraser" ? "var(--paper-2)" : color,
                    }}
                  />
                </button>
              ))}
            </div>
          )}

          {tool !== "eraser" && (
            <div className="board__group board__colors" aria-label={t.brushColor}>
              {colors.map((c) => (
                <button
                  key={c}
                  className={`board__color ${color === c ? "is-active" : ""}`}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                  aria-label={c}
                  aria-pressed={color === c}
                />
              ))}
            </div>
          )}
        </div>

        <div className="board__group board__actions">
          <button
            className="doodle-btn doodle-btn--icon board__btn"
            onClick={undo}
            disabled={busy || !count}
            aria-label={t.boardUndo}
            title={t.boardUndo}
          >
            <Icon name="undo" />
          </button>
          <button
            className="doodle-btn doodle-btn--icon board__btn"
            onClick={redo}
            disabled={busy || !redoLeft}
            aria-label={t.boardRedo}
            title={t.boardRedo}
          >
            <Icon name="redo" />
          </button>
          <button
            className="doodle-btn doodle-btn--icon board__btn"
            onClick={saveImage}
            disabled={busy}
            aria-label={t.boardSave}
            title={t.boardSave}
          >
            <Icon name="download" />
          </button>
          <button
            className="doodle-btn doodle-btn--icon board__btn"
            onClick={() => setConfirmClear(true)}
            disabled={busy || !count}
            aria-label={t.boardClear}
            title={t.boardClear}
          >
            <Icon name="trash" />
          </button>
        </div>
      </div>

      <div className="board__canvas-wrap doodle-box" ref={wrapRef}>
        <canvas
          ref={canvasRef}
          className="board__canvas"
          style={{ aspectRatio: `${BOARD_W} / ${BOARD_H}` }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          aria-label={t.boardTitle}
        />
        {count === 0 && <p className="board__empty">{t.boardEmpty}</p>}
      </div>

      {confirmClear && (
        <div className="board__confirm" role="dialog" aria-modal="true">
          <div className="board__confirm-card doodle-box">
            <p>{t.boardClearConfirm}</p>
            <div className="board__confirm-actions">
              <button className="doodle-btn" onClick={() => setConfirmClear(false)} autoFocus>
                {t.cancel}
              </button>
              <button className="doodle-btn doodle-btn--ink" onClick={clearAll}>
                <Icon name="trash" /> {t.boardClearYes}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="modal__inline-error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
