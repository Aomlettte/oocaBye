"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { matchRecipient, type Recipient } from "@/data/recipients";
import { useT } from "@/lib/i18n";
import type { GameState, Person, Player } from "@/lib/types";
import { Icon, Mascot, PixelHeart, Squiggle } from "./Doodles";
import { DrawingBoard } from "./DrawingBoard";
import { EnvelopeCard } from "./EnvelopeCard";
import { PresenceBar } from "./PresenceBar";

// Slight, fixed tilts so the mailbox looks hand-placed (stable across renders).
const TILTS = [-4, 3, -2, 5, -3];

export function Home({
  me,
  isAuthor,
  authorKey,
  recipients,
  state,
  people,
  onOpen,
  onLeave,
}: {
  me: Player;
  isAuthor: boolean;
  authorKey: string | null;
  recipients: Recipient[];
  state: GameState;
  people: Person[];
  onOpen: (id: string) => void;
  onLeave: () => void;
}) {
  const t = useT();
  const mine = matchRecipient(me.name);
  const readCount = recipients.filter((r) => state.read[r.id]).length;
  const [toast, setToast] = useState<string | null>(null);

  const tryOpen = (r: Recipient) => {
    const open = isAuthor || mine?.id === r.id || Boolean(state.read[r.id]);
    if (open) return onOpen(r.id);
    setToast(t.sealed(r.name));
    setTimeout(() => setToast(null), 2600);
  };

  return (
    <div className="home">
      <header className="topbar">
        <div className="brand">
          <Mascot wave={false} width={40} height={44} />
          <span>ooca babye</span>
        </div>
        <div className="me">
          {isAuthor && <span className="author-badge">✎ {t.authorBadge}</span>}
          <PresenceBar people={people} me={me.name} />
          <span className="me__name">{me.name}</span>
          <button className="doodle-btn doodle-btn--icon me__leave" onClick={onLeave} aria-label={t.switchUser}>
            <Icon name="logout" />
          </button>
        </div>
      </header>

      <section className="hero">
        <motion.div
          className="hero__art hero__art--left"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <Mascot width="100%" height="100%" />
        </motion.div>

        <motion.div
          className="hero__copy"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
        >
          <p className="hero__eyebrow">letters before I go</p>
          <h1 className="hero__title">
            {t.heroTitle.map((line, i) => (
              <span key={i} className="hero__line">
                {line}
              </span>
            ))}
          </h1>
          <Squiggle className="hero__squiggle" />
          <p className="hero__sub">
            {(isAuthor ? t.heroAuthor : mine ? t.heroMine(mine.name) : t.heroGuest).map((line, i) => (
              <span key={i} className="hero__line">
                {line}
              </span>
            ))}
          </p>
        </motion.div>

        <motion.svg
          className="hero__art hero__art--right"
          viewBox="0 0 200 220"
          aria-hidden
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* hand-drawn mailbox */}
          <g
            filter="url(#rough)"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M40 90 C 40 50, 70 36, 100 36 L 150 36 C 176 38, 186 60, 184 90 L 184 140 L 40 140 Z" fill="#fffdf8" />
            <path d="M100 36 C 130 38, 140 64, 140 90 L 140 140" />
            <path d="M58 92 h 60" />
            <path d="M112 142 C 112 170, 110 196, 112 214" />
            <path d="M100 214 h 26" />
            <path d="M160 70 L 160 30 L 190 30 L 190 48 L 160 48" fill="currentColor" />
            <path d="M18 214 C 60 210, 150 216, 196 212" />
            <path d="M60 60 l 20 -8 l 4 14" />
          </g>
        </motion.svg>
      </section>

      <section className="mailbox" aria-labelledby="mailbox-title">
        <div className="mailbox__head">
          <h2 id="mailbox-title" className="section-title">
            {t.mailbox}
          </h2>
          <p className="mailbox__progress">
            {t.readCount(readCount, recipients.length)}
            <span className="progress-dots" aria-hidden>
              {recipients.map((r) => (
                <i key={r.id} className={state.read[r.id] ? "is-on" : ""} />
              ))}
            </span>
          </p>
        </div>

        <ul className="mailbox__grid">
          {recipients.map((r, i) => (
            <motion.li
              key={r.id}
              initial={{ opacity: 0, y: 30, rotate: 0 }}
              animate={{ opacity: 1, y: 0, rotate: TILTS[i % TILTS.length] }}
              transition={{ delay: 0.25 + i * 0.08, type: "spring", stiffness: 180, damping: 18 }}
            >
              <EnvelopeCard
                recipient={r}
                isMine={mine?.id === r.id}
                readAt={state.read[r.id]}
                comments={state.commentCounts[r.id] ?? 0}
                locked={!isAuthor && mine?.id !== r.id && !state.read[r.id]}
                onClick={() => tryOpen(r)}
              />
            </motion.li>
          ))}
        </ul>
      </section>

      <DrawingBoard me={me} authorKey={authorKey} />

      <footer className="footer">
        <Squiggle className="footer__squiggle" />
        <p className="footer__credit">
          {t.footerMade} <PixelHeart size={15} /> · {t.footerCredit}
        </p>
      </footer>

      <motion.div
        className="toast doodle-box"
        role="status"
        initial={false}
        animate={toast ? { y: 0, opacity: 1 } : { y: 24, opacity: 0 }}
      >
        {toast}
      </motion.div>
    </div>
  );
}
