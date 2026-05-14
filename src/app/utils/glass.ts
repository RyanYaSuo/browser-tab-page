import type { CSSProperties } from "react";

/** Glass card — theme-aware via CSS variables */
export const glassCard: CSSProperties = {
  background: "var(--lg-glass-bg)",
  backdropFilter: "blur(48px) saturate(1.5) brightness(1.05)",
  WebkitBackdropFilter: "blur(48px) saturate(1.5) brightness(1.05)",
  border: "0.5px solid var(--lg-glass-border)",
  boxShadow: "var(--lg-glass-shadow)",
  borderRadius: 20,
};

/** White frosted glass — stays light regardless of theme */
export const glassWhite: CSSProperties = {
  background: "rgba(255, 255, 255, 0.75)",
  backdropFilter: "blur(48px) saturate(1.5)",
  WebkitBackdropFilter: "blur(48px) saturate(1.5)",
  border: "0.5px solid rgba(255, 255, 255, 0.25)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.10), 0 1px 0 rgba(255,255,255,0.7) inset",
  borderRadius: 20,
};

export const glassDock: CSSProperties = {
  background: "var(--lg-fill-1)",
  backdropFilter: "blur(24px) saturate(1.4)",
  WebkitBackdropFilter: "blur(24px) saturate(1.4)",
  border: "0.5px solid var(--lg-glass-border)",
  boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
};

export const glassHero: CSSProperties = {
  background: "var(--lg-fill-2)",
  backdropFilter: "blur(24px) saturate(1.2)",
  WebkitBackdropFilter: "blur(24px) saturate(1.2)",
  border: "0.5px solid var(--lg-glass-border)",
  borderRadius: 28,
};

/** Constant accent palette */
export const accent = "#6c8cff";
export const green  = "#30d158";
export const yellow = "#ffd60a";
export const orange = "#ff9f0a";
export const red    = "#ff453a";
export const purple = "#bf5af2";

/** Text colors via CSS variables */
export const T1 = "var(--lg-text-1)";
export const T2 = "var(--lg-text-2)";
export const T3 = "var(--lg-text-3)";
export const T4 = "var(--lg-text-4)";

export const F1 = "var(--lg-fill-1)";
export const F2 = "var(--lg-fill-2)";
export const F3 = "var(--lg-fill-3)";

export const SEP = "var(--lg-separator)";
export const HOVER = "var(--lg-hover-bg)";
export const BORDER = "var(--lg-glass-border)";
