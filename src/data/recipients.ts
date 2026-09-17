// Public info about each letter — safe to ship to the browser.
// The letter body lives in ./letters.ts and is only served by the API.

export type Recipient = {
  id: string;
  name: string;
  /** Other spellings people might type (Thai / nicknames). Compared lowercase. */
  aliases: string[];
  /** UI language for this person. Defaults to Thai. */
  lang?: "th" | "en";
};

export const RECIPIENTS: Recipient[] = [
  { id: "bam", name: "Bam", aliases: ["แบม", "แบมๆ", "bammy"] },
  { id: "beckham", name: "Beckham", aliases: ["เบคแฮม", "เบ็คแฮม", "เบค", "beck"] },
  { id: "mhok", name: "Mhok", aliases: ["หมอก", "mok", "mhoke"] },
  { id: "junior", name: "Junior", aliases: ["จูเนียร์", "จูเนีย", "jr"] },
  { id: "billy", name: "Billy", aliases: ["บิลลี่", "บิลลี", "bill"], lang: "en" },
];

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, "");

/** Returns the recipient whose name matches what the player typed, if any. */
export function matchRecipient(name: string): Recipient | undefined {
  const n = norm(name);
  if (!n) return undefined;
  return RECIPIENTS.find(
    (r) => norm(r.name) === n || r.aliases.some((a) => norm(a) === n),
  );
}
