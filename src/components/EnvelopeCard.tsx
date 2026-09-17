"use client";

import { motion, useAnimationControls } from "framer-motion";
import type { Recipient } from "@/data/recipients";
import { formatDate } from "@/lib/client";
import { useT } from "@/lib/i18n";
import { EnvelopeArt, Icon, ReadStamp } from "./Doodles";

export function EnvelopeCard({
  recipient,
  isMine,
  readAt,
  comments,
  locked,
  onClick,
}: {
  recipient: Recipient;
  isMine: boolean;
  readAt?: number;
  comments: number;
  locked: boolean;
  onClick: () => void;
}) {
  const t = useT();
  const controls = useAnimationControls();

  const handle = () => {
    if (locked) controls.start({ x: [0, -8, 8, -5, 5, 0], transition: { duration: 0.4 } });
    onClick();
  };

  const status = readAt
    ? t.statusRead
    : locked
      ? t.statusWaiting(recipient.name)
      : isMine
        ? t.statusMine
        : t.statusUnread;

  return (
    <motion.button
      className={`envelope ${isMine ? "is-mine" : ""} ${locked ? "is-locked" : ""}`}
      onClick={handle}
      animate={controls}
      whileHover={{ y: -6, rotate: 0 }}
      whileTap={{ scale: 0.97 }}
      aria-label={`${t.letterTo(recipient.name)} — ${status}`}
    >
      {isMine && !readAt && (
        <span className="envelope__note" aria-hidden>
          {t.statusMine}
          <svg viewBox="0 0 40 30" width="34" height="26">
            <path
              d="M4 4 C 10 20, 22 24, 34 24 M 26 17 L 35 24 L 26 29"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </svg>
        </span>
      )}

      <span className="envelope__art">
        <EnvelopeArt seal={locked} width="100%" height="100%" />
        <span className="envelope__to">
          <small>to</small> {recipient.name}
        </span>
        {readAt && (
          <ReadStamp className="envelope__stamp" label={t.stampLabel} date={formatDate(readAt, t.locale)} />
        )}
      </span>

      <span className="envelope__meta">
        <span>{status}</span>
        {comments > 0 && (
          <span className="envelope__count">
            <Icon name="chat" width={18} height={18} /> {comments}
          </span>
        )}
      </span>
    </motion.button>
  );
}
