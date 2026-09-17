import { initials } from "@/lib/client";

export function Avatar({
  name,
  color,
  size = 40,
  online = false,
  className = "",
}: {
  name: string;
  color: string;
  size?: number;
  /** Shows a green "online" dot on the bottom-right. */
  online?: boolean;
  className?: string;
}) {
  const face = (
    <span
      className={`avatar ${className}`}
      style={{ width: size, height: size, background: color, fontSize: size * 0.42 }}
      title={name}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
  if (!online) return face;
  return (
    <span className="avatar-wrap">
      {face}
      <span className="online-dot" style={{ width: Math.max(10, size * 0.26), height: Math.max(10, size * 0.26) }} />
    </span>
  );
}
