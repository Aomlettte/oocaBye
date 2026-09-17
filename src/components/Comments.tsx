"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { api, formatTime } from "@/lib/client";
import { useT } from "@/lib/i18n";
import type { Comment, Player } from "@/lib/types";
import { Avatar } from "./Avatar";
import { Icon } from "./Doodles";

const POLL_MS = 5000;

export function Comments({
  letterId,
  me,
  authorKey,
  onPosted,
}: {
  letterId: string;
  me: Player;
  authorKey: string | null;
  onPosted: () => void;
}) {
  const t = useT();
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLLIElement>(null);

  const load = useCallback(() => {
    api
      .comments(letterId, me.name, authorKey)
      .then(({ comments }) => setComments(comments))
      .catch(() => setComments((c) => c ?? []));
  }, [letterId, me.name, authorKey]);

  useEffect(() => {
    load();
    const timer = setInterval(load, POLL_MS);
    return () => clearInterval(timer);
  }, [load]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setError(null);
    try {
      const { comment } = await api.comment(letterId, me.name, body, authorKey);
      setComments((c) => [...(c ?? []), comment]);
      setText("");
      onPosted();
      requestAnimationFrame(() => endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="comments" aria-labelledby="comments-title">
      <h3 id="comments-title" className="section-title section-title--sm">
        {t.commentsTitle}
      </h3>

      {comments === null ? (
        <p className="comments__empty">{t.loading}</p>
      ) : comments.length === 0 ? (
        <p className="comments__empty">{t.commentsEmpty}</p>
      ) : (
        <ul className="comments__list">
          <AnimatePresence initial={false}>
            {comments.map((c) => (
              <motion.li
                key={c.id}
                className={`comment ${c.isAuthor ? "is-author" : ""}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {c.isAuthor ? (
                  <span className="avatar comment__author-avatar" style={{ width: 40, height: 40 }} aria-hidden>
                    <Icon name="pencil" width={20} height={20} />
                  </span>
                ) : (
                  <Avatar name={c.name} color={c.color} size={40} />
                )}
                <div className="comment__bubble">
                  <div className="comment__meta">
                    <b>{c.name}</b>
                    {c.isAuthor && <span className="author-badge">{t.authorBadge}</span>}
                    <time dateTime={new Date(c.at).toISOString()}>{formatTime(c.at, t.locale)}</time>
                  </div>
                  <p>{c.text}</p>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
          <li ref={endRef} aria-hidden className="comments__end" />
        </ul>
      )}

      <form className="composer doodle-box" onSubmit={send}>
        {authorKey ? (
          <span className="avatar comment__author-avatar" style={{ width: 40, height: 40 }} aria-hidden>
            <Icon name="pencil" width={20} height={20} />
          </span>
        ) : (
          <Avatar name={me.name} color={me.color} size={40} />
        )}
        <label htmlFor="comment-text" className="sr-only">
          {t.commentLabel}
        </label>
        <textarea
          id="comment-text"
          className="composer__input"
          placeholder={authorKey ? t.replyPlaceholder : t.commentPlaceholder}
          rows={1}
          maxLength={300}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
        />
        <button className="doodle-btn doodle-btn--icon doodle-btn--ink" disabled={!text.trim() || sending} aria-label={t.send}>
          <Icon name="send" />
        </button>
      </form>
      {error && (
        <p className="modal__inline-error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
