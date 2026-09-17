"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { toPng } from "html-to-image";
import { useEffect, useRef, useState } from "react";
import { api, downloadOrShare, formatDate } from "@/lib/client";
import { useT } from "@/lib/i18n";
import type { LetterPayload, Player } from "@/lib/types";
import { Comments } from "./Comments";
import { Icon, ReadStamp, Squiggle } from "./Doodles";

// closed → flap opens → paper slides out → paper becomes the popup
type Stage = "closed" | "flap" | "rise" | "letter";

const EASE = [0.22, 1, 0.36, 1] as const;

export function LetterModal({
  letterId,
  me,
  authorKey,
  onClose,
  onChange,
}: {
  letterId: string;
  me: Player;
  authorKey: string | null;
  onClose: () => void;
  onChange: () => void;
}) {
  const t = useT();
  const reduce = useReducedMotion();
  const [stage, setStage] = useState<Stage>(reduce ? "letter" : "closed");
  const [letter, setLetter] = useState<LetterPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stamping, setStamping] = useState(false);
  const [justStamped, setJustStamped] = useState(false);
  const [saving, setSaving] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    api
      .letter(letterId, me.name, authorKey)
      .then((l) => alive && setLetter(l))
      .catch((e: Error) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, [letterId, me.name, authorKey]);

  // Drive the opening sequence once the letter has loaded.
  // Depends on *whether* it loaded, not on the letter itself — otherwise
  // stamping (which updates the letter) would replay the envelope animation.
  const hasLetter = Boolean(letter);
  useEffect(() => {
    if (!hasLetter || reduce) return;
    const timers = [
      setTimeout(() => setStage("flap"), 350),
      setTimeout(() => setStage("rise"), 1050),
      setTimeout(() => setStage("letter"), 1900),
    ];
    return () => timers.forEach(clearTimeout);
  }, [hasLetter, reduce]);

  // Lock page scroll + close on Escape.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  async function stamp() {
    if (!letter) return;
    setStamping(true);
    try {
      const { readAt } = await api.stamp(letter.id, me.name);
      setLetter({ ...letter, readAt });
      setJustStamped(true);
      onChange();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setStamping(false);
    }
  }

  async function save() {
    if (!cardRef.current || !letter) return;
    setSaving(true);
    try {
      await document.fonts.ready;
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 3,
        backgroundColor: "#f6f4ef",
        style: { transform: "none", margin: "0" },
      });
      const blob = await (await fetch(dataUrl)).blob();
      await downloadOrShare(blob, `ooca-babye-${letter.id}.png`, letter.greeting);
    } catch {
      setError(t.saveFailed);
    } finally {
      setSaving(false);
    }
  }

  const showLetter = stage === "letter" && letter;

  return (
    <motion.div
      className="modal"
      role="dialog"
      aria-modal="true"
      aria-label={letter ? letter.greeting : t.letter}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="modal__backdrop" onClick={onClose} />

      <AnimatePresence mode="wait">
        {!showLetter ? (
          <motion.div
            key="envelope"
            className="modal__stage"
            exit={{ opacity: 0, y: 60, transition: { duration: 0.35 } }}
          >
            <EnvelopeOpening stage={stage} name={letter?.to} />
            {error && (
              <div className="modal__error doodle-box" role="alert">
                <p>{error}</p>
                <button className="doodle-btn" onClick={onClose}>
                  {t.back}
                </button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="letter"
            className="modal__scroll no-scrollbar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="modal__column">
              <div className="modal__toolbar">
                <button className="doodle-btn doodle-btn--icon" onClick={onClose} aria-label={t.close}>
                  <Icon name="close" />
                </button>
                <button className="doodle-btn" onClick={save} disabled={saving}>
                  <Icon name="download" />
                  {saving ? t.saving : t.save}
                </button>
              </div>

              <motion.article
                initial={reduce ? false : { y: 120, scale: 0.72, rotate: -3 }}
                animate={{ y: 0, scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 120, damping: 17 }}
              >
                {/* Everything inside cardRef is what the saved image looks like. */}
                <div ref={cardRef} className={`letter-frame ${saving ? "is-capture" : ""}`}>
                  <div className="letter paper-sheet">
                    <header className="letter__head">
                      <h2 className="letter__greeting">{letter.greeting}</h2>
                      <span className="letter__postmark">
                        ooca babye
                        <br />
                        post
                      </span>
                    </header>

                    <Squiggle className="letter__rule" />

                    <div className="letter__body">
                      {letter.body.split(/\n\s*\n/).map((p, i) => (
                        <p key={i}>{p}</p>
                      ))}
                    </div>

                    {letter.drawing && (
                      <figure className="letter__drawing">
                        <span className="tape tape--l" aria-hidden />
                        <span className="tape tape--r" aria-hidden />
                        {/* eslint-disable-next-line @next/next/no-img-element -- plain img keeps html-to-image happy */}
                        <img src={letter.drawing.src} alt={letter.drawing.caption ?? t.drawingAlt} />
                        {letter.drawing.caption && <figcaption>{letter.drawing.caption}</figcaption>}
                      </figure>
                    )}

                    <footer className="letter__sign">
                      <span>{letter.author.signOff}</span>
                      <span className="letter__signature">— {letter.author.name}</span>
                    </footer>

                    <AnimatePresence>
                      {letter.readAt && (
                        <motion.div
                          className="letter__stamp"
                          initial={justStamped ? { scale: 2.6, opacity: 0, rotate: -40 } : false}
                          animate={{ scale: 1, opacity: 0.88, rotate: -14 }}
                          transition={{ type: "spring", stiffness: 420, damping: 16 }}
                        >
                          <ReadStamp label={t.stampLabel} date={formatDate(letter.readAt, t.locale)} width="100%" height="100%" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.article>

              {/* Same sheet of paper continues below the letter, so stamping doesn't start a new page. */}
              <div className="sheet-cont">
                <div className="sheet-cont__note">
                  {letter.canStamp && !letter.readAt ? (
                    <>
                      <p>{t.stampPrompt}</p>
                      <button className="doodle-btn doodle-btn--ink" onClick={stamp} disabled={stamping}>
                        {stamping ? t.stamping : t.stampBtn}
                      </button>
                    </>
                  ) : (
                    letter.readAt && <p>{t.stampedOn(formatDate(letter.readAt, t.locale))}</p>
                  )}
                </div>

                {error && (
                  <p className="modal__inline-error" role="alert">
                    {error}
                  </p>
                )}

                <Comments letterId={letter.id} me={me} authorKey={authorKey} onPosted={onChange} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function EnvelopeOpening({ stage, name }: { stage: Stage; name?: string }) {
  const open = stage !== "closed";
  const rising = stage === "rise";

  return (
    <motion.div
      className="open-env"
      initial={{ scale: 0.6, y: 80, opacity: 0, rotate: -6 }}
      animate={{ scale: 1, y: rising ? 70 : 0, opacity: 1, rotate: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      <div className="open-env__back" />

      <motion.div
        className="open-env__paper paper-sheet"
        initial={{ y: "8%" }}
        animate={{ y: rising ? "-78%" : "8%" }}
        transition={{ duration: 0.8, ease: EASE }}
      >
        <span className="open-env__lines" aria-hidden>
          <i />
          <i />
          <i />
          <i />
        </span>
      </motion.div>

      <svg className="open-env__pocket" viewBox="0 0 300 200" preserveAspectRatio="none" aria-hidden>
        <path
          d="M3 60 L 150 130 L 297 60 L 297 197 L 3 197 Z"
          fill="#fffdf8"
          stroke="#161616"
          strokeWidth="3"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        <path d="M3 197 L 118 115 M 297 197 L 182 115" stroke="#161616" strokeWidth="2" opacity="0.5" vectorEffect="non-scaling-stroke" />
      </svg>

      <span className="open-env__name">{name ? `to ${name}` : "…"}</span>

      <motion.svg
        className={`open-env__flap ${open ? "is-open" : ""}`}
        viewBox="0 0 300 130"
        preserveAspectRatio="none"
        aria-hidden
        initial={{ scaleY: 1 }}
        animate={{ scaleY: open ? -1 : 1 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <path
          d="M3 3 L 150 120 L 297 3 Z"
          fill="#fffdf8"
          stroke="#161616"
          strokeWidth="3"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        <circle cx="150" cy="92" r="14" fill="#161616" />
      </motion.svg>
    </motion.div>
  );
}
