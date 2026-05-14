import { useState, useEffect } from "react";
import { T1, T3 } from "../utils/glass";

interface Props {
  /** When true, renders bigger (used when bookmarks are hidden) */
  large?: boolean;
}

export function HeroSection({ large = false }: Props) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const hh = now.getHours().toString().padStart(2, "0");
  const mm = now.getMinutes().toString().padStart(2, "0");
  const dateStr = now.toLocaleDateString("zh-CN", {
    year: "numeric", month: "long", day: "numeric", weekday: "long",
  });

  const clockSize = large ? "clamp(96px, 18vw, 180px)" : "clamp(72px, 13vw, 112px)";

  return (
    <div
      className="flex flex-col items-center gap-3 px-4 select-none"
      style={{ animation: "fadeIn 0.6s ease-out" }}
    >
      <div
        className="flex items-end gap-2"
        style={{ lineHeight: 1, fontVariantNumeric: "tabular-nums" }}
      >
        <span
          style={{
            fontSize: clockSize,
            fontWeight: 100,
            color: T1,
            letterSpacing: -4,
            textShadow: "0 2px 12px rgba(0,0,0,0.30)",
          }}
        >
          {hh}
          <span style={{ opacity: 0.35, margin: "0 4px" }}>:</span>
          {mm}
        </span>
      </div>
      <p style={{ fontSize: large ? 16 : 14, color: T3, marginTop: -8, textShadow: "0 1px 6px rgba(0,0,0,0.25)" }}>
        {dateStr}
      </p>
    </div>
  );
}
