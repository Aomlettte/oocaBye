import type { Metadata, Viewport } from "next";
import { Itim, Sriracha } from "next/font/google";
import "./globals.css";

// Both faces are handwritten and ship Thai + Latin glyphs, so mixed lines stay even.
const itim = Itim({
  variable: "--font-hand",
  weight: "400",
  subsets: ["thai", "latin"],
});

const sriracha = Sriracha({
  variable: "--font-pen",
  weight: "400",
  subsets: ["thai", "latin"],
});

export const metadata: Metadata = {
  title: "ooca babye — จดหมายถึงเพื่อน",
  description: "จดหมายลาจากเพื่อนร่วมงาน หาจดหมายที่มีชื่อของคุณ แล้วเปิดอ่านนะ",
};

export const viewport: Viewport = {
  themeColor: "#f6f4ef",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${itim.variable} ${sriracha.variable}`}>
      <body>{children}</body>
    </html>
  );
}
