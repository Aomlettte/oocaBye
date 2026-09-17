"use client";

import { createContext, useContext } from "react";
import { matchRecipient } from "@/data/recipients";

export type Lang = "th" | "en";

/** The site speaks the language of whoever is logged in (Billy gets English). */
export function langFor(name?: string | null): Lang {
  return (name && matchRecipient(name)?.lang) || "th";
}

const th = {
  // name gate
  gateHello: "สวัสดี!",
  gateWho: "คุณคือใคร",
  gatePick: "แตะชื่อของคุณ แล้วเราจะหาจดหมายให้",
  gateRolling: "กำลังสุ่มสีประจำตัวให้…",
  gateYourColor: "สีประจำตัวของคุณคือ",
  gateWelcome: (n: string) => `ยินดีต้อนรับ, ${n}`,
  gateHint: (n: string) => `มีจดหมายส่งถึง ${n} 1 ฉบับล่ะ!`,
  gateGo: "ไปที่ตู้จดหมาย",
  gateNotMe: "ไม่ใช่ฉัน เลือกใหม่",

  // home
  authorBadge: "ผู้เขียน",
  switchUser: "เปลี่ยนชื่อ",
  online: "ออนไลน์",
  offline: "ออฟไลน์",
  you: "คุณ",
  whoIsHere: (n: number) => `ออนไลน์อยู่ ${n} คน`,
  heroTitle: ["Once a", "Tech & Product", "Team"],
  heroAuthor: ["คุณคือผู้เขียน", "เปิดอ่านและตอบเพื่อนได้ทุกซอง"],
  heroMine: (n: string) => [`มีซองหนึ่งเขียนชื่อ ${n} ไว้`, "ลองหาดูนะ"],
  heroGuest: ["ซองที่เจ้าของอ่านแล้ว", "ใครก็เข้าไปอ่านและคุยกันได้"],
  mailbox: "ตู้จดหมาย",
  readCount: (a: number, b: number) => `อ่านแล้ว ${a}/${b}`,
  sealed: (n: string) => `ซองนี้ยังปิดผนึกอยู่ รอ ${n} เปิดอ่านก่อนนะ`,
  boardTitle: "กระดานวาดเล่น",
  boardSub: "วาดอะไรทิ้งไว้ให้กันหน่อย ทุกคนเห็นกระดานเดียวกัน",
  boardEmpty: "ยังว่างอยู่เลย เริ่มวาดก่อนใครสิ",
  boardTools: "เครื่องมือวาด",
  boardUndo: "ย้อนรอยวาดของฉัน",
  boardRedo: "ทำซ้ำรอยที่ย้อนไป",
  boardSave: "เซฟกระดานเป็นรูป",
  boardClear: "ล้างกระดาน",
  boardClearConfirm: "ล้างกระดานทั้งหมดเลยไหม? ของทุกคนจะหายหมดและกู้คืนไม่ได้นะ",
  boardClearYes: "ล้างเลย",
  cancel: "ไม่ล้าง",
  brushPen: "ปากกา",
  brushFill: "เทสี",
  brushEraser: "ยางลบ",
  brushPaw: "อุ้งเท้า",
  brushSize: "ขนาดหัวแปรง",
  brushColor: "สี",
  footerMade: "Made with",
  footerCredit: "Aomzin · 18 Sep 2026",

  // envelope
  statusRead: "อ่านแล้ว",
  statusWaiting: (n: string) => `รอ ${n} เปิด`,
  statusMine: "ของคุณ!",
  statusUnread: "ยังไม่ได้อ่าน",
  letterTo: (n: string) => `จดหมายถึง ${n}`,

  // letter
  letter: "จดหมาย",
  back: "กลับไปก่อน",
  close: "ปิด",
  save: "เซฟเป็นรูป",
  saving: "กำลังเซฟ…",
  saveFailed: "บันทึกรูปไม่สำเร็จ ลองแคปหน้าจอแทนได้นะ",
  drawingAlt: "รูปวาด",
  stampPrompt: "อ่านจบแล้ว? ปั๊มตราไว้เป็นหลักฐานหน่อย แล้วเพื่อน ๆ จะเข้ามาอ่านได้",
  stampBtn: "ปั๊ม! อ่านแล้ว",
  stamping: "กำลังปั๊ม…",
  stampLabel: "อ่านแล้ว",
  stampedOn: (d: string) => `ปั๊มว่าอ่านแล้วเมื่อ ${d}`,

  // comments
  commentsTitle: "คุยกันใต้จดหมาย",
  loading: "กำลังโหลด…",
  commentsEmpty: "ยังเงียบอยู่เลย เป็นคนแรกที่เขียนอะไรหน่อยสิ",
  commentLabel: "เขียนคอมเมนต์",
  commentPlaceholder: "เขียนอะไรถึงกันหน่อย…",
  replyPlaceholder: "ตอบกลับในฐานะผู้เขียน…",
  send: "ส่ง",

  locale: "th-TH",
};

export type Dict = typeof th;

const en: Dict = {
  gateHello: "Hello!",
  gateWho: "who are you?",
  gatePick: "Tap your name and we'll find your letter",
  gateRolling: "Picking your color…",
  gateYourColor: "your color is",
  gateWelcome: (n) => `Welcome, ${n}`,
  gateHint: (n) => `You've got 1 letter, ${n}!`,
  gateGo: "To the mailbox",
  gateNotMe: "Not me, pick again",

  authorBadge: "writer",
  switchUser: "Switch name",
  online: "online",
  offline: "offline",
  you: "you",
  whoIsHere: (n) => `${n} online`,
  heroTitle: ["Once a", "Tech & Product", "Team"],
  heroAuthor: ["You're the writer", "open and reply to every letter"],
  heroMine: (n) => [`One envelope says ${n}`, "can you find it?"],
  heroGuest: ["Once a letter is read,", "everyone can join the chat"],
  mailbox: "Mailbox",
  readCount: (a, b) => `${a}/${b} read`,
  sealed: (n) => `Still sealed. Waiting for ${n} to open it first`,
  boardTitle: "Doodle board",
  boardSub: "Leave a drawing for everyone — you all share one board",
  boardEmpty: "Still empty. Be the first to draw!",
  boardTools: "Drawing tools",
  boardUndo: "Undo my stroke",
  boardRedo: "Redo my stroke",
  boardSave: "Save board as image",
  boardClear: "Clear board",
  boardClearConfirm: "Clear the whole board? Everyone's drawings go, and it can't be undone.",
  boardClearYes: "Clear it",
  cancel: "Keep it",
  brushPen: "Pen",
  brushFill: "Fill",
  brushEraser: "Eraser",
  brushPaw: "Paw",
  brushSize: "Brush size",
  brushColor: "Color",
  footerMade: "Made with",
  footerCredit: "Aomzin · 18 Sep 2026",

  statusRead: "read",
  statusWaiting: (n) => `waiting for ${n}`,
  statusMine: "yours!",
  statusUnread: "unread",
  letterTo: (n) => `Letter to ${n}`,

  letter: "Letter",
  back: "Go back",
  close: "Close",
  save: "Save as image",
  saving: "Saving…",
  saveFailed: "Couldn't save the image. A screenshot works too!",
  drawingAlt: "drawing",
  stampPrompt: "Finished reading? Stamp it, and your friends can come read it too",
  stampBtn: "Stamp! I've read it",
  stamping: "Stamping…",
  stampLabel: "READ",
  stampedOn: (d) => `Stamped as read on ${d}`,

  commentsTitle: "Chat under the letter",
  loading: "Loading…",
  commentsEmpty: "Quiet so far. Be the first to write something",
  commentLabel: "Write a comment",
  commentPlaceholder: "Say something…",
  replyPlaceholder: "Reply as the writer…",
  send: "Send",

  locale: "en-GB",
};

export const DICTS: Record<Lang, Dict> = { th, en };

const LangContext = createContext<Lang>("th");
export const LangProvider = LangContext.Provider;

export function useT(): Dict {
  return DICTS[useContext(LangContext)];
}
