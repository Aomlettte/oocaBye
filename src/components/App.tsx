"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { matchRecipient, type Recipient } from "@/data/recipients";
import { api, loadAuthorKey, loadMe, saveAuthorKey, saveMe } from "@/lib/client";
import { LangProvider, langFor } from "@/lib/i18n";
import { usePresence } from "@/lib/usePresence";
import { AUTHOR_COLOR } from "@/lib/palette";
import type { GameState, Player } from "@/lib/types";
import { RoughFilterDefs } from "./Doodles";
import { Home } from "./Home";
import { LetterModal } from "./LetterModal";
import { NameGate } from "./NameGate";

const EMPTY: GameState = { players: [], read: {}, commentCounts: {} };
const subscribeNoop = () => () => {};

export function App({ recipients }: { recipients: Recipient[] }) {
  // localStorage only exists in the browser; render nothing until hydrated.
  const hydrated = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const [me, setMe] = useState<Player | null>(null);
  const [authorKey, setAuthorKey] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<GameState>(EMPTY);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated || ready) return;
    const url = new URL(window.location.href);
    const fromUrl = url.searchParams.get("me");
    const stored = loadAuthorKey();
    const candidate = fromUrl ?? stored;

    const finish = (key: string | null, authorName?: string | null) => {
      setAuthorKey(key);
      // The writer skips the name picker and is never one of the five friends.
      if (key && authorName) {
        setMe({ name: authorName, color: AUTHOR_COLOR, joinedAt: 0 });
        setReady(true);
        return;
      }
      const saved = loadMe();
      // Only the five recipients can play; forget anything else saved earlier.
      setMe(saved && matchRecipient(saved.name) ? saved : null);
      setReady(true);
    };

    if (fromUrl) {
      url.searchParams.delete("me");
      window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    }
    if (!candidate) return finish(null);
    api
      .checkAuthor(candidate)
      .then(({ ok, name }) => {
        saveAuthorKey(ok ? candidate : null);
        finish(ok ? candidate : null, name);
      })
      .catch(() => finish(null));
  }, [hydrated, ready]);

  const refresh = useCallback(() => {
    api.state().then(setState).catch(() => {});
  }, []);

  const people = usePresence(me?.name ?? null, authorKey);

  useEffect(() => {
    if (!me) return;
    refresh();
    const t = setInterval(refresh, 10_000);
    return () => clearInterval(t);
  }, [me, refresh]);

  const enter = (p: Player) => {
    saveMe(p);
    setMe(p);
  };

  const leave = () => {
    // Leaving as the writer drops the secret too, so this device becomes a normal player.
    if (authorKey) {
      saveAuthorKey(null);
      setAuthorKey(null);
    }
    saveMe(null);
    setMe(null);
    setOpenId(null);
  };

  const lang = langFor(me?.name);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <LangProvider value={lang}>
      <RoughFilterDefs />
      <AnimatePresence mode="wait">
        {!ready ? null : !me ? (
          <motion.div key="gate" exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <NameGate onEnter={enter} />
          </motion.div>
        ) : (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Home
              me={me}
              isAuthor={Boolean(authorKey)}
              authorKey={authorKey}
              recipients={recipients}
              state={state}
              people={people}
              onOpen={setOpenId}
              onLeave={leave}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {me && openId && (
          <LetterModal
            key={openId}
            letterId={openId}
            me={me}
            authorKey={authorKey}
            onClose={() => setOpenId(null)}
            onChange={refresh}
          />
        )}
      </AnimatePresence>
    </LangProvider>
  );
}
