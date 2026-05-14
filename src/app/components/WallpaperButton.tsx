import { useState, useEffect, useRef } from "react";
import { Image as ImageIcon } from "lucide-react";
import { glassDock, T1, T2, T3 } from "../utils/glass";
import { WallpaperPicker } from "./WallpaperPicker";
import { useSettings } from "../contexts/SettingsContext";

interface BingInfo {
  title: string;
  copyright: string;
  copyright_link?: string;
  start_date?: string;
}

const BING_INFO_URL = "https://bing.biturl.top/?resolution=1920&format=json&index=0&mkt=zh-CN";

export function WallpaperButton() {
  const { wallpaper } = useSettings();
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [tipHovered, setTipHovered] = useState(false);
  const [info, setInfo] = useState<BingInfo | null>(null);
  const closeTimer = useRef<number | null>(null);

  const cancelClose = () => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const scheduleClose = (fn: () => void) => {
    cancelClose();
    closeTimer.current = window.setTimeout(fn, 200);
  };

  useEffect(() => {
    if (wallpaper !== "bing") return;
    let cancelled = false;
    fetch(BING_INFO_URL)
      .then(r => r.json())
      .then(j => { if (!cancelled) setInfo(j); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [wallpaper]);

  const showTooltip = (hovered || tipHovered) && wallpaper === "bing" && info;

  const formatDate = (s?: string) => {
    if (!s || s.length !== 8) return "";
    return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(true)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="flex items-center justify-center shrink-0"
        style={{
          ...glassDock,
          width: 48, height: 48, borderRadius: 24,
          color: T2,
          transition: "transform 200ms cubic-bezier(0.22,1,0.36,1)",
          transform: hovered ? "scale(1.06)" : "scale(1)",
        }}
        aria-label="壁纸"
      >
        <ImageIcon size={20} />
      </button>

      {showTooltip && (
        <div
          role="link"
          tabIndex={0}
          onMouseEnter={() => setTipHovered(true)}
          onMouseLeave={() => setTipHovered(false)}
          onClick={() => {
            const href = info!.copyright_link || "https://www.bing.com";
            window.open(href, "_blank", "noopener,noreferrer");
          }}
          className="hidden sm:block absolute left-full top-0 ml-3 p-3"
          style={{
            ...glassDock,
            borderRadius: 16,
            zIndex: 201,
            maxWidth: 320,
            animation: "fadeIn 180ms ease",
            cursor: "pointer",
          }}
          title="访问壁纸来源"
        >
          <span
            aria-hidden
            style={{
              position: "absolute",
              left: -20, top: 0, bottom: 0, width: 20,
              background: "transparent",
            }}
          />
          <div style={{ fontSize: 13, fontWeight: 600, color: T1, lineHeight: 1.35 }}>
            {info!.title || "Bing 每日壁纸"}
          </div>
          {info!.copyright && (
            <div style={{ fontSize: 11, color: T2, lineHeight: 1.4 }}>
              {info!.copyright}
            </div>
          )}
          {info!.start_date && (
            <div style={{ fontSize: 10, color: T3, marginTop: 2 }}>
              {formatDate(info!.start_date)}
            </div>
          )}
        </div>
      )}

      <WallpaperPicker open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
