# ooca babye ✉︎

A little farewell post office: friends tap their name, get a random avatar color, find the envelope
addressed to them, open it (envelope → paper animation), stamp it as read, and chat under the letter.

## Edit content

| What | Where |
| --- | --- |
| Letter text, captions, your sign-off name | `src/data/letters.ts` |
| Recipients (the name buttons) | `src/data/recipients.ts` |
| Your drawings | drop files in `public/drawings/` and update `drawing.src` |

Keep drawings in `public/` (same origin) so **Save as image** includes them.

## Rules

- A letter opens only for its recipient until they press **ปั๊ม! อ่านแล้ว**; after that anyone can read and comment.
- You (the writer) can open everything and reply with an "ผู้เขียน" badge: visit `/?me=<AUTHOR_KEY>` once per device.

## Run locally

```bash
npm install
AUTHOR_KEY=dev npm run dev   # data is in-memory without Redis env vars
```

## Deploy to Vercel

1. Push this repo and import it in Vercel.
2. Project → **Storage** → add **Upstash for Redis** (Marketplace) and connect it — it sets `KV_REST_API_URL` / `KV_REST_API_TOKEN`.
3. Project → **Settings → Environment Variables** → add `AUTHOR_KEY` (long random string).
4. Redeploy. Share the URL with friends; open `https://<your-app>.vercel.app/?me=<AUTHOR_KEY>` yourself.
