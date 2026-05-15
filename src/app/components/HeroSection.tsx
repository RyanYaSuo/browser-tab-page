import { useState, useEffect } from "react";
import { T1, T3 } from "../utils/glass";

interface Props {
  /** When true, renders bigger (used when bookmarks are hidden) */
  large?: boolean;
}

function greeting(h: number): string {
  if (h >= 5 && h < 12) return "早上好";
  if (h >= 12 && h < 14) return "中午好";
  if (h >= 14 && h < 18) return "下午好";
  return "晚上好";
}

export function HeroSection({ large = false }: Props) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const h = now.getHours();
  const m = now.getMinutes();
  const hh = h.toString().padStart(2, "0");
  const mm = m.toString().padStart(2, "0");
  const dateStr = now.toLocaleDateString("zh-CN", {
    year: "numeric", month: "long", day: "numeric", weekday: "long",
  });

  const clockSize = large ? "clamp(96px, 18vw, 180px)" : "clamp(72px, 13vw, 112px)";

  return (
    <div
      className="flex flex-col items-center gap-3 px-4 select-none"
      style={{ animation: "fadeIn 0.8s cubic-bezier(0.22,1,0.36,1)" }}
    >
      <p
        style={{
          fontSize: large ? 20 : 16,
          color: "var(--lg-text-2)",
          fontWeight: 500,
          letterSpacing: 1,
          textShadow: "0 1px 6px rgba(0,0,0,0.25)",
          animation: "fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) both",
        }}
      >
        {greeting(h)}，Cupid
      </p>
      <div
        className="flex items-end gap-2"
        style={{
          lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
          animation: "fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.1s both",
        }}
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
      <p
        style={{
          fontSize: large ? 16 : 14,
          color: T3,
          marginTop: -8,
          textShadow: "0 1px 6px rgba(0,0,0,0.25)",
          animation: "fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.2s both",
        }}
      >
        {dateStr}
      </p>
    </div>
  );
}
