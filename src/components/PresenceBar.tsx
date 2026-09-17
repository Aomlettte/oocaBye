"use client";

import { AnimatePresence, motion } from "framer-motion";
import { initials } from "@/lib/client";
import { useT } from "@/lib/i18n";
import type { Person } from "@/lib/types";
import { Mascot } from "./Doodles";

/** Figma-style facepile: who's here right now, online first. */
export function PresenceBar({ people, me }: { people: Person[]; me: string }) {
  const t = useT();
  if (!people.length) return null;

  const sorted = [...people].sort(
    (a, b) => Number(b.online) - Number(a.online) || Number(b.name === me) - Number(a.name === me),
  );
  const onlineCount = people.filter((p) => p.online).length;
  const firstOffline = sorted.findIndex((p) => !p.online);

  return (
    <div className="presence" role="group" aria-label={t.whoIsHere(onlineCount)}>
      <span className="presence__count" aria-hidden>
        {t.whoIsHere(onlineCount)}
      </span>
      <ul className="presence__pile">
        <AnimatePresence initial={false}>
          {sorted.map((p, i) => {
            const label = `${p.name}${p.name === me ? ` (${t.you})` : ""} · ${p.online ? t.online : t.offline}`;
            return (
              <motion.li
                key={p.name}
                layout
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                className={[
                  "presence__item",
                  p.online ? "is-online" : "is-offline",
                  p.name === me && "is-me",
                  i === firstOffline && i > 0 && "is-first-offline",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={{ zIndex: sorted.length - i }}
                tabIndex={0}
                aria-label={label}
              >
                <span
                  className={`avatar presence__face ${p.isAuthor ? "is-author" : ""}`}
                  // Offline faces are drawn solid grey (no transparency) so the overlap stays clean.
                  style={{ background: p.isAuthor || !p.online ? undefined : (p.color ?? "#fffdf8") }}
                  aria-hidden
                >
                  {p.isAuthor ? (
                    <Mascot wave={false} viewBox="24 22 182 182" width="100%" height="100%" />
                  ) : (
                    initials(p.name)
                  )}
                </span>
                <span className="presence__dot" aria-hidden />
                <span className="presence__tip" role="tooltip">
                  <i className={p.online ? "on" : "off"} />
                  {label}
                </span>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </div>
  );
}
