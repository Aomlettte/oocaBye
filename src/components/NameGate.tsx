"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { RECIPIENTS } from "@/data/recipients";
import { api } from "@/lib/client";
import { DICTS, langFor } from "@/lib/i18n";
import { AVATAR_COLORS } from "@/lib/palette";
import type { Player } from "@/lib/types";
import { Avatar } from "./Avatar";
import { Icon, MailIcon, Mascot } from "./Doodles";

type Phase = "ask" | "rolling" | "reveal";

export function NameGate({ onEnter }: { onEnter: (p: Player) => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("ask");
  const [error, setError] = useState<string | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [letterRead, setLetterRead] = useState(false);
  const [rollColor, setRollColor] = useState(AVATAR_COLORS[0]);
  const timer = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => () => clearInterval(timer.current), []);

  async function pick(name: string) {
    if (phase !== "ask") return;
    setPicked(name);
    setError(null);
    setPhase("rolling");

    let i = 0;
    timer.current = setInterval(() => {
      i = (i + 1) % AVATAR_COLORS.length;
      setRollColor(AVATAR_COLORS[i]);
    }, 90);

    try {
      const [{ player, letterRead }] = await Promise.all([
        api.join(name),
        new Promise((r) => setTimeout(r, 1400)), // let the roulette spin a bit
      ]);
      clearInterval(timer.current);
      setPlayer(player);
      setLetterRead(letterRead);
      setPhase("reveal");
    } catch (err) {
      clearInterval(timer.current);
      setError((err as Error).message);
      setPhase("ask");
    }
  }

  // Before a name is picked the gate shows both languages; afterwards it follows the player.
  const th = DICTS.th;
  const t = DICTS[langFor(player?.name ?? picked)];

  return (
    <main className="gate">
      <motion.div
        className="gate__mascot"
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <Mascot width="100%" height="100%" />
      </motion.div>

      <AnimatePresence mode="wait">
        {phase !== "reveal" ? (
          <motion.div
            key="ask"
            className="gate__form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <p className="gate__eyebrow">ooca babye · post office</p>
            <h1 className="gate__title">
              {t.gateHello} <span className="hand-underline">{t.gateWho}</span>
            </h1>
            <p className="gate__sub">
              {phase === "rolling" ? (
                t.gateRolling
              ) : (
                <>
                  {th.gatePick}
                  <br />
                  <span className="gate__sub-en">{DICTS.en.gatePick}</span>
                </>
              )}
            </p>

            {phase === "rolling" && picked ? (
              <div className="gate__rolling">
                <Avatar name={picked} color={rollColor} size={96} className="is-rolling" />
                <span className="gate__picked">{picked}</span>
              </div>
            ) : (
              <ul className="name-picker">
                {RECIPIENTS.map((r, i) => (
                  <motion.li
                    key={r.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.06, type: "spring", stiffness: 260, damping: 20 }}
                  >
                    <button className="doodle-btn name-picker__btn" onClick={() => pick(r.name)}>
                      {r.name}
                    </button>
                  </motion.li>
                ))}
              </ul>
            )}

            {error && (
              <p className="gate__error" role="alert">
                {error}
              </p>
            )}
          </motion.div>
        ) : (
          player && (
            <motion.div
              key="reveal"
              className="gate__form"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
            >
              <p className="gate__eyebrow">{t.gateYourColor}</p>
              <motion.div
                initial={{ rotate: -20, scale: 0.4 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 12 }}
              >
                <Avatar name={player.name} color={player.color} size={96} online />
              </motion.div>
              <h1 className="gate__title">{t.gateWelcome(player.name)}</h1>
              <p className="gate__sub gate__hint">
                {t.gateHint(player.name)}
                <motion.span
                  initial={{ rotate: 0 }}
                  animate={letterRead ? {} : { rotate: [0, -12, 10, -6, 0] }}
                  transition={{ delay: 0.6, duration: 0.6, repeat: Infinity, repeatDelay: 1.8 }}
                  style={{ display: "inline-flex" }}
                >
                  <MailIcon unread={!letterRead} />
                </motion.span>
              </p>
              <button className="doodle-btn doodle-btn--ink gate__btn" onClick={() => onEnter(player)} autoFocus>
                {t.gateGo} <Icon name="arrow" />
              </button>
              <button
                className="doodle-btn doodle-btn--ghost"
                onClick={() => {
                  setPlayer(null);
                  setPicked(null);
                  setPhase("ask");
                }}
              >
                {t.gateNotMe}
              </button>
            </motion.div>
          )
        )}
      </AnimatePresence>
    </main>
  );
}
