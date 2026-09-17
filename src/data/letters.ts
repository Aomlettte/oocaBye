import "server-only";

// ✍️ Edit your letters here.
// - body: paragraphs separated by a blank line
// - drawing: put your image in /public/drawings and point to it (png/jpg/svg).
//   Keep it in /public (same origin) so "save as image" can include it.

export const AUTHOR = {
  /** How your name shows on letters and in comments. */
  name: "Aomzin",
  signOff: "รักและคิดถึงเสมอ",
};

export type Letter = {
  id: string;
  greeting: string;
  body: string;
  /** Overrides AUTHOR.signOff (e.g. English for Billy). */
  signOff?: string;
  drawing?: { src: string; caption?: string };
};

export const LETTERS: Record<string, Letter> = {
  bam: {
    id: "bam",
    greeting: "ถึง Bam",
    body: `ขอบคุณที่อยู่ด้วยกันมาตลอดนะ ทุกวันที่ทำงานมีเธอช่วยให้เรื่องยากกลายเป็นเรื่องง่ายขึ้นเยอะเลย

ขอให้ได้เจอแต่งานที่สนุก คนที่ใจดี และมีเวลาพักบ้างนะ อย่าลืมกินข้าวให้ตรงเวลาด้วย

Thank you for every little laugh at the desk. I'll miss you a lot.`,
    drawing: { src: "/drawings/bam.png" },
  },
  beckham: {
    id: "beckham",
    greeting: "ถึง Beckham",
    body: `ยังจำวันแรกที่เจอกันได้อยู่เลย ตอนนั้นยังไม่รู้เลยว่าจะกลายเป็นเพื่อนที่คุยกันได้ทุกเรื่อง

ขอให้ทุกโปรเจกต์ต่อจากนี้ราบรื่น และขอให้ยังเป็นคนตลกแบบนี้ต่อไปนะ

Keep being awesome. See you outside of work!`,
    drawing: { src: "/drawings/beckham.png" },
  },
  mhok: {
    id: "mhok",
    greeting: "ถึง Mhok",
    body: `ขอบคุณที่คอยรับฟังเสมอ ไม่ว่าจะวันดีหรือวันแย่ เธอเป็นคนที่ทำให้ที่ทำงานอบอุ่นขึ้นจริง ๆ

ขอให้ได้ทำสิ่งที่รัก และได้รับความรักกลับมาเยอะ ๆ นะ

Take care of yourself, okay?`,
    drawing: { src: "/drawings/mhok.png" },
  },
  junior: {
    id: "junior",
    greeting: "ถึง Junior",
    body: `ถึงจะชื่อ Junior แต่เรื่องงานนี่ไม่จูเนียร์เลยนะ เก่งขึ้นทุกวันจนน่าอิจฉา

ขอให้กล้าลองอะไรใหม่ ๆ ต่อไป แล้วอย่าลืมมาเล่าให้ฟังด้วย

Proud of you. Always.`,
    drawing: { src: "/drawings/junior.png" },
  },
  billy: {
    id: "billy",
    greeting: "Dear Billy",
    body: `Thank you for every joke and every snack you shared. You turned ordinary days into good ones.

Wishing you good health, great projects, and a big raise.

Let's grab a drink soon!`,
    signOff: "Miss you always",
    drawing: { src: "/drawings/billy.png" },
  },
};
