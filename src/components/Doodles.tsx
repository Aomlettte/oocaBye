import type { SVGProps } from "react";

// All drawings are hand-made SVG paths with round caps + a tiny
// displacement filter so strokes look like pen on paper.

export function RoughFilterDefs() {
  return (
    <svg width="0" height="0" aria-hidden style={{ position: "absolute" }}>
      <defs>
        <filter id="rough" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="3" />
          <feDisplacementMap in="SourceGraphic" scale="2.2" />
        </filter>
      </defs>
    </svg>
  );
}

const pen = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 3,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Site mascot: long wavy hair, blunt bangs, round glasses, hugging a letter. */
export function Mascot({ wave = true, ...props }: SVGProps<SVGSVGElement> & { wave?: boolean }) {
  const paper = "#fffdf8";
  // Strokes that sit on top of the dark hair get a paper halo so they stay visible.
  const halo = { ...pen, stroke: paper, strokeWidth: 9 };
  return (
    <svg viewBox="0 -4 220 256" role="img" aria-label="ตัวการ์ตูนถือจดหมาย" {...props}>
      <g filter="url(#rough)">
        {/* long wavy hair (behind face) */}
        <path
          fill="currentColor"
          d="M50 118 C 44 60, 80 30, 115 30 C 150 30, 186 60, 180 118 C 196 130, 176 146, 190 160 C 204 174, 180 188, 194 204 C 206 220, 184 236, 168 228 C 158 222, 164 210, 172 214 C 160 198, 156 182, 160 164 L 150 150 L 80 150 L 70 164 C 74 182, 70 198, 58 214 C 66 210, 72 222, 62 228 C 46 236, 24 220, 36 204 C 50 188, 26 174, 40 160 C 54 146, 34 130, 50 118 Z"
        />
        <path
          {...pen}
          stroke={paper}
          strokeWidth={1.6}
          opacity={0.55}
          d="M42 138 C 54 150, 36 166, 48 180 C 58 192, 38 204, 48 218 M 188 138 C 176 150, 194 166, 182 180 C 172 192, 192 204, 182 218"
        />
        {/* face */}
        <path
          {...pen}
          fill={paper}
          d="M56 102 C 52 142, 74 166, 115 166 C 156 166, 178 142, 174 102 C 168 66, 62 66, 56 102 Z"
        />
        {/* blunt straight bangs */}
        <path
          fill="currentColor"
          d="M50 106 C 46 56, 82 32, 115 32 C 150 32, 184 56, 180 106 L 176 101 L 150 100 L 146 104 L 142 100 L 92 100 L 88 103 L 84 100 L 54 101 Z"
        />
        {/* glasses */}
        <circle cx="94" cy="121" r="15" {...pen} strokeWidth={2.6} />
        <circle cx="136" cy="121" r="15" {...pen} strokeWidth={2.6} />
        <path {...pen} strokeWidth={2.6} d="M109 120 q 6 -5 12 0 M 79 118 L 60 113 M 151 118 L 170 113" />
        {/* eyes: happy closed */}
        <path {...pen} strokeWidth={2.6} d="M87 124 q 7 -7 14 0 M 129 124 q 7 -7 14 0" />
        {/* cheeks */}
        <ellipse cx="78" cy="142" rx="7" ry="4" fill="#f4b6c2" opacity="0.9" />
        <ellipse cx="152" cy="142" rx="7" ry="4" fill="#f4b6c2" opacity="0.9" />
        {/* mouth */}
        <path {...pen} d="M105 141 q 10 9 20 0" />
        {/* body */}
        <path {...halo} d="M80 166 C 70 190, 64 214, 62 236 M 150 166 C 160 190, 166 214, 168 236" />
        <path {...pen} d="M80 166 C 70 190, 64 214, 62 236 M 150 166 C 160 190, 166 214, 168 236" />
        {/* letter */}
        <g transform="rotate(-8 112 206)">
          <rect x="72" y="182" width="84" height="54" rx="3" {...pen} fill={paper} />
          <path {...pen} d="M72 184 L 114 214 L 156 184" />
          <path d="M108 210 l 6 -6 l 6 6 l -6 7 z" fill="currentColor" />
        </g>
        {/* hands */}
        <path {...pen} fill={paper} d="M72 196 q -9 6 0 14" />
        {wave ? (
          <g className="mascot-wave">
            <path {...halo} d="M170 150 C 186 136, 196 118, 198 98" />
            <path {...pen} d="M170 150 C 186 136, 196 118, 198 98" />
            <path {...pen} d="M192 92 l 6 6 m 2 -14 l 2 10 m 10 -4 l -8 8" />
          </g>
        ) : (
          <path {...pen} fill={paper} d="M156 196 q 9 6 0 14" />
        )}
      </g>
    </svg>
  );
}

/** Closed envelope art. `seal` shows a wax-seal lock when the letter is waiting for its owner. */
export function EnvelopeArt({
  seal = false,
  ...props
}: SVGProps<SVGSVGElement> & { seal?: boolean }) {
  return (
    <svg viewBox="0 0 240 160" aria-hidden {...props}>
      <g filter="url(#rough)">
        <path
          {...pen}
          style={{ fill: "#fffdf8" }}
          d="M10 16 C 70 13, 170 12, 230 15 C 232 60, 231 110, 229 146 C 170 148, 70 149, 11 146 C 9 100, 8 60, 10 16 Z"
        />
        <path {...pen} d="M12 18 C 60 60, 90 84, 120 96 C 150 84, 180 60, 228 18" />
        <path {...pen} strokeWidth={2} d="M12 144 L 92 82 M 228 144 L 148 82" opacity="0.55" />
        {/* stamp corner */}
        <rect x="184" y="28" width="30" height="36" {...pen} strokeWidth={2} strokeDasharray="3 3" />
        <path {...pen} strokeWidth={2} d="M190 52 q 9 -16 18 0" />
        <circle cx="199" cy="40" r="3" fill="currentColor" />
        {seal && (
          <g>
            <circle cx="120" cy="96" r="15" fill="currentColor" />
            <path
              d="M113 97 v -4 a 7 7 0 0 1 14 0 v 4"
              fill="none"
              stroke="#fffdf8"
              strokeWidth={2.2}
              strokeLinecap="round"
            />
            <rect x="110" y="96" width="20" height="10" rx="2" fill="#fffdf8" />
          </g>
        )}
      </g>
    </svg>
  );
}

/** Round rubber-stamp mark with a paw print: "read" + date around the rim. */
export function ReadStamp({
  label,
  date,
  ...props
}: SVGProps<SVGSVGElement> & { label: string; date?: string }) {
  const ink = "#1b1b1b";
  return (
    <svg viewBox="0 0 160 160" role="img" aria-label={label} {...props}>
      <defs>
        <path id="stamp-top" d="M 28 80 A 52 52 0 0 1 132 80" />
        <path id="stamp-bottom" d="M 24 84 A 56 56 0 0 0 136 84" />
        <filter id="ink" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="8" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.3 1.55" result="mask" />
          <feComposite in="SourceGraphic" in2="mask" operator="in" />
        </filter>
      </defs>
      <g filter="url(#ink)">
        <circle cx="80" cy="80" r="72" fill="none" stroke={ink} strokeWidth={5} />
        <circle cx="80" cy="80" r="62" fill="none" stroke={ink} strokeWidth={2} />
        <text fontSize="14" fill={ink} letterSpacing="2.5" fontFamily="var(--font-hand)">
          <textPath href="#stamp-top" startOffset="50%" textAnchor="middle">
            {label} · OOCA BABYE
          </textPath>
        </text>
        {/* paw print */}
        <g fill={ink} transform="rotate(-8 80 86)">
          <path d="M80 80 C 94 80, 104 92, 102 101 C 100 109, 90 106, 80 106 C 70 106, 60 109, 58 101 C 56 92, 66 80, 80 80 Z" />
          <ellipse cx="56" cy="72" rx="7" ry="9.5" transform="rotate(-24 56 72)" />
          <ellipse cx="70" cy="58" rx="7.5" ry="10" transform="rotate(-8 70 58)" />
          <ellipse cx="90" cy="58" rx="7.5" ry="10" transform="rotate(8 90 58)" />
          <ellipse cx="104" cy="72" rx="7" ry="9.5" transform="rotate(24 104 72)" />
        </g>
        {date && (
          <text fontSize="12" fill={ink} letterSpacing="1.5" fontFamily="var(--font-hand)">
            <textPath href="#stamp-bottom" startOffset="50%" textAnchor="middle">
              {date}
            </textPath>
          </text>
        )}
      </g>
    </svg>
  );
}

/** Small envelope with a red notice dot while there's an unread letter. */
export function MailIcon({ unread, size = 30 }: { unread: boolean; size?: number }) {
  return (
    <span className="mail-icon" style={{ width: size, height: size * 0.8 }}>
      <svg viewBox="0 0 30 24" width="100%" height="100%" aria-hidden>
        <path
          {...pen}
          strokeWidth={2.2}
          fill="#fffdf8"
          d="M2.5 4 C 10 3.4, 20 3.3, 27.5 4 C 27.9 10, 27.8 15, 27.4 21 C 20 21.6, 10 21.6, 2.6 21 C 2.2 15, 2.1 10, 2.5 4 Z"
        />
        <path {...pen} strokeWidth={2.2} d="M3 4.6 C 8 9, 11.5 12, 15 13.6 C 18.5 12, 22 9, 27 4.6" />
      </svg>
      {unread && <span className="notice-dot" />}
    </span>
  );
}

/** Blocky pixel-art heart. */
export function PixelHeart({ size = 16, ...props }: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg viewBox="0 0 11 10" width={size} height={size} role="img" aria-label="love" {...props}>
      <path
        fill="currentColor"
        shapeRendering="crispEdges"
        d="M1 1h3v1H1zM7 1h3v1H7zM0 2h5v1H0zM6 2h5v1H6zM0 3h11v1H0zM0 4h11v1H0zM1 5h9v1H1zM2 6h7v1H2zM3 7h5v1H3zM4 8h3v1H4zM5 9h1v1H5z"
      />
    </svg>
  );
}

/** Wavy hand-drawn divider. */
export function Squiggle(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 300 16" preserveAspectRatio="none" aria-hidden {...props}>
      <path
        {...pen}
        strokeWidth={2.5}
        d="M3 9 C 25 2, 40 15, 62 8 S 100 2, 122 9 S 160 15, 182 8 S 220 2, 242 9 S 280 14, 297 7"
      />
    </svg>
  );
}

type IconName = "close" | "download" | "send" | "pencil" | "heart" | "arrow" | "chat" | "logout" | "paw" | "undo" | "redo" | "trash" | "bucket" | "eraser";

export function Icon({ name, ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  const s = { ...pen, strokeWidth: 2.4 };
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden {...props}>
      {name === "close" && <path {...s} d="M5 5.5 C 9 9, 14 14, 19 18.5 M 18.5 5 C 14 9.5, 10 14, 5.5 19" />}
      {name === "download" && <path {...s} d="M12 3.5 C 12 8, 12.3 12, 12 15.5 M 7.5 11 L 12 15.8 L 16.6 11 M 4 19.5 C 9 20.2, 15 20, 20 19.3" />}
      {name === "send" && <path {...s} d="M3.5 11.5 L 20.5 4 L 14 20.5 L 11 13 Z M 11 13 L 20.5 4" />}
      {name === "pencil" && <path {...s} d="M4 20 L 5 15.5 L 16 4.5 L 19.5 8 L 8.5 19 Z M 13.5 7 L 17 10.5" />}
      {name === "heart" && <path {...s} d="M12 20 C 5 15, 3 11, 4 8 C 5 4.5, 10 4, 12 8 C 14 4, 19 4.5, 20 8 C 21 11, 19 15, 12 20 Z" />}
      {name === "arrow" && <path {...s} d="M3.5 12.3 C 9 11.8, 14 12, 20 12 M 14.5 6.5 L 20.3 12 L 14.5 17.8" />}
      {name === "chat" && <path {...s} d="M4 6 C 4 4.5, 5 4, 7 4 H 17 C 19 4, 20 5, 20 6.5 V 13 C 20 15, 19 16, 17 16 H 11 L 6.5 20 V 16 C 5 16, 4 15, 4 13.5 Z" />}
      {name === "paw" && (
        <g fill="currentColor">
          <ellipse cx="12" cy="16" rx="5" ry="4" />
          <ellipse cx="6.2" cy="10.2" rx="2" ry="2.7" transform="rotate(-25 6.2 10.2)" />
          <ellipse cx="9.8" cy="6.6" rx="2.1" ry="2.9" transform="rotate(-8 9.8 6.6)" />
          <ellipse cx="14.2" cy="6.6" rx="2.1" ry="2.9" transform="rotate(8 14.2 6.6)" />
          <ellipse cx="17.8" cy="10.2" rx="2" ry="2.7" transform="rotate(25 17.8 10.2)" />
        </g>
      )}
      {name === "undo" && <path {...s} d="M9 6 L 4 10.5 L 9 15 M 4.5 10.5 H 14 C 18 10.5, 20 13, 20 16 C 20 18, 19 19.5, 17.5 20.5" />}
      {name === "redo" && <path {...s} d="M15 6 L 20 10.5 L 15 15 M 19.5 10.5 H 10 C 6 10.5, 4 13, 4 16 C 4 18, 5 19.5, 6.5 20.5" />}
      {name === "trash" && <path {...s} d="M4.5 6.5 C 9 5.8, 15 5.8, 19.5 6.5 M 9.5 6 L 10 3.6 H 14 L 14.5 6 M 6.5 7.5 L 7.5 20 C 7.6 21, 8.2 21.4, 9 21.4 H 15 C 15.8 21.4, 16.4 21, 16.5 20 L 17.5 7.5 M 10.5 10.5 L 11 18 M 13.5 10.5 L 13 18" />}
      {name === "bucket" && (
        <>
          <path {...s} d="M4.2 12.4 L 11 5.6 L 18.4 13 C 19 13.6, 19 14.2, 18.4 14.8 L 13.4 19.8 C 12.4 20.8, 11 20.8, 10 19.8 L 4.2 14 C 3.6 13.6, 3.6 13, 4.2 12.4 Z M 8.4 8.2 L 6.6 6.4" />
          <path d="M20.5 15.5 C 22 17.6, 22.6 18.8, 22 19.9 C 21.4 21, 19.6 21, 19 19.9 C 18.4 18.8, 19 17.6, 20.5 15.5 Z" fill="currentColor" />
        </>
      )}
      {name === "eraser" && <path {...s} d="M8.5 20.5 H 20 M 4.6 15.4 L 11.6 8.4 C 12.4 7.6, 13.4 7.6, 14.2 8.4 L 19 13.2 C 19.8 14, 19.8 15, 19 15.8 L 14.4 20.4 H 9.6 L 4.6 15.4 Z M 9.2 12.8 L 15 18.6" />}
      {name === "logout" && <path {...s} d="M10 4.5 H 5.5 V 19.5 H 10 M 9 12 H 20 M 16 8 L 20 12 L 16 16" />}
    </svg>
  );
}
