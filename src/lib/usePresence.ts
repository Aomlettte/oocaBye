"use client";

import { useEffect, useState } from "react";
import { api } from "./client";
import type { Person } from "./types";

const PING_MS = 5000;

/**
 * Heartbeat while this tab is visible; says goodbye when hidden or closed,
 * so friends see people come and go within a few seconds.
 */
export function usePresence(name: string | null, key: string | null): Person[] {
  const [people, setPeople] = useState<Person[]>([]);

  useEffect(() => {
    if (!name) return;
    let timer: ReturnType<typeof setInterval> | undefined;
    let alive = true;

    const ping = () =>
      api
        .presence(name, key)
        .then(({ people }) => alive && setPeople(people))
        .catch(() => {});

    const start = () => {
      clearInterval(timer);
      ping();
      timer = setInterval(ping, PING_MS);
    };
    const stop = () => {
      clearInterval(timer);
      api.leave(name, key);
    };
    const onVisibility = () => (document.hidden ? stop() : start());

    if (!document.hidden) start();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", stop);

    return () => {
      alive = false;
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", stop);
      stop();
    };
  }, [name, key]);

  return people;
}
