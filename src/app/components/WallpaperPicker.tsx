import { useState, useEffect } from "react";
import { X, Check, RefreshCw, Link2, Image as ImageIcon } from "lucide-react";
import { glassCard, accent, T1, T2, T3, F2, BORDER } from "../utils/glass";
import { useSettings, WALLPAPERS, BING_DAILY_URL, YUMUS_URLS } from "../contexts/SettingsContext";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function WallpaperPicker({ open, onClose }: Props) {
  const {
    wallpaper, setWallpaper,
    customWallpaperUrl, setCustomWallpaperUrl,
    customWallpaperTheme, setCustomWallpaperTheme,
    wallpaperCacheBust, bumpWallpaperCache,
    themeOverride, setThemeOverride,
    autoTheme,
  } = useSettings();

  const [draftUrl, setDraftUrl] = useState(customWallpaperUrl);

  useEffect(() => { if (open) setDraftUrl(customWallpaperUrl); }, [open, customWallpaperUrl]);

  if (!open) return null;

  const choose = (id: string) => setWallpaper(id);

  const applyCustom = () => {
    const url = draftUrl.trim();
    if (!url) return;
    setCustomWallpaperUrl(url);
    setWallpaper("custom");
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center px-4"
      style={{ zIndex: 400, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", animation: "fadeIn 200ms ease" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg p-6 flex flex-col gap-4 max-h-[85vh] overflow-y-auto"
        style={{ ...glassCard, animation: "scaleIn 250ms cubic-bezier(0.22,1,0.36,1)" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <span style={{ fontSize: 17, fontWeight: 600, color: T1 }}>选择壁纸</span>
          <button
            onClick={onClose}
            className="flex items-center justify-center"
            style={{ width: 28, height: 28, borderRadius: 14, background: F2, color: T2 }}
            aria-label="关闭"
          >
            <X size={14} />
          </button>
        </div>

        {/* ─── Preset gradients — compact swatches ─── */}
        <div className="flex flex-col gap-2">
          <span style={{ fontSize: 12, color: T2, fontWeight: 500 }}>预设渐变</span>
          <div className="flex gap-2 flex-wrap">
            {WALLPAPERS.map(w => {
              const active = w.id === wallpaper;
              return (
                <button
                  key={w.id}
                  onClick={() => choose(w.id)}
                  style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: w.preview,
                    border: active ? `2px solid ${accent}` : `0.5px solid ${BORDER}`,
                    boxShadow: active ? `0 0 0 2px ${accent}33` : "0 1px 4px rgba(0,0,0,0.08)",
                    transition: "all 150ms ease",
                    flexShrink: 0,
                  }}
                  aria-label={w.name}
                  title={w.name}
                />
              );
            })}
          </div>
        </div>

        {/* ─── Online wallpapers — real thumbnails ─── */}
        <div className="flex flex-col gap-2">
          <span style={{ fontSize: 12, color: T2, fontWeight: 500 }}>在线壁纸</span>
          <div className="grid grid-cols-4 gap-3">

            {/* Bing daily */}
            <button
              onClick={() => choose("bing")}
              className="relative flex flex-col items-center gap-2"
              aria-label="必应每日"
            >
              <div
                style={{
                  width: "100%", aspectRatio: "1 / 1", borderRadius: 14,
                  backgroundImage: `url("${BING_DAILY_URL}")`,
                  backgroundSize: "cover", backgroundPosition: "center",
                  border: wallpaper === "bing" ? `2px solid ${accent}` : `0.5px solid ${BORDER}`,
                  boxShadow: wallpaper === "bing" ? `0 4px 16px rgba(108,140,255,0.30)` : "0 2px 8px rgba(0,0,0,0.08)",
                  transition: "all 150ms ease",
                }}
              />
              {wallpaper === "bing" && (
                <div
                  className="absolute flex items-center justify-center"
                  style={{
                    top: 6, right: 6, width: 20, height: 20, borderRadius: 10,
                    background: accent, color: "white",
                  }}
                >
                  <Check size={12} strokeWidth={3} />
                </div>
              )}
              <span style={{ fontSize: 12, color: wallpaper === "bing" ? accent : T2, fontWeight: wallpaper === "bing" ? 600 : 400 }}>
                必应每日
              </span>
            </button>

            {/* yumus.cn 360 — real thumbnail with refresh */}
            {Object.entries(YUMUS_URLS).map(([id, url]) => {
              const active = wallpaper === id;
              const key = wallpaperCacheBust[id] || 0;
              const bustedUrl = `${url}&_=${key}`;
              const labelMap: Record<string, string> = {
                "yumus-360-4k": "360 4K",
                "yumus-360-scenery": "360 风景",
                "yumus-360-anime": "360 动漫",
              };
              return (
                <div key={id} className="relative flex flex-col items-center gap-2">
                  <button
                    onClick={() => choose(id)}
                    className="relative w-full"
                    aria-label={labelMap[id]}
                  >
                    <div
                      style={{
                        width: "100%", aspectRatio: "1 / 1", borderRadius: 14,
                        backgroundImage: `url("${bustedUrl}")`,
                        backgroundSize: "cover", backgroundPosition: "center",
                        border: active ? `2px solid ${accent}` : `0.5px solid ${BORDER}`,
                        boxShadow: active ? `0 4px 16px rgba(108,140,255,0.30)` : "0 2px 8px rgba(0,0,0,0.08)",
                        transition: "all 150ms ease",
                      }}
                    />
                    {active && (
                      <div
                        className="absolute flex items-center justify-center"
                        style={{
                          top: 6, right: 6, width: 20, height: 20, borderRadius: 10,
                          background: accent, color: "white",
                        }}
                      >
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                  <div className="flex items-center gap-1 w-full justify-between">
                    <span style={{ fontSize: 12, color: active ? accent : T2, fontWeight: active ? 600 : 400 }}>
                      {labelMap[id]}
                    </span>
                    <button
                      onClick={e => { e.stopPropagation(); bumpWallpaperCache(id); }}
                      className="flex items-center justify-center"
                      style={{
                        width: 24, height: 24, borderRadius: 8,
                        color: T3, transition: "all 150ms ease",
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--lg-hover-bg)"; (e.currentTarget as HTMLButtonElement).style.color = accent; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = T3 as string; }}
                      aria-label="换一张"
                    >
                      <RefreshCw size={13} />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Custom */}
            <button
              onClick={() => customWallpaperUrl && setWallpaper("custom")}
              className="relative flex flex-col items-center gap-2"
              aria-label="自定义"
            >
              <div
                className="flex items-center justify-center"
                style={{
                  width: "100%", aspectRatio: "1 / 1", borderRadius: 14,
                  background: customWallpaperUrl ? `url("${customWallpaperUrl}") center/cover` : F2,
                  border: wallpaper === "custom" ? `2px solid ${accent}` : `1px dashed ${BORDER}`,
                  color: T3,
                  transition: "all 150ms ease",
                }}
              >
                {!customWallpaperUrl && <ImageIcon size={22} />}
              </div>
              {wallpaper === "custom" && (
                <div
                  className="absolute flex items-center justify-center"
                  style={{
                    top: 6, right: 6, width: 20, height: 20, borderRadius: 10,
                    background: accent, color: "white",
                  }}
                >
                  <Check size={12} strokeWidth={3} />
                </div>
              )}
              <span style={{ fontSize: 12, color: wallpaper === "custom" ? accent : T2, fontWeight: wallpaper === "custom" ? 600 : 400 }}>
                自定义
              </span>
            </button>
          </div>
        </div>

        {/* Custom URL input */}
        <div className="flex flex-col gap-2 pt-2" style={{ borderTop: `0.5px solid ${BORDER}` }}>
          <span style={{ fontSize: 12, color: T2 }}>自定义壁纸链接</span>
          <div className="flex gap-2">
            <div
              className="flex items-center gap-2 px-3 flex-1"
              style={{
                height: 40, borderRadius: 12,
                background: F2,
                border: `0.5px solid ${BORDER}`,
              }}
            >
              <Link2 size={14} style={{ color: T3, flexShrink: 0 }} />
              <input
                type="url"
                value={draftUrl}
                onChange={e => setDraftUrl(e.target.value)}
                onKeyDown={e => e.key === "Enter" && applyCustom()}
                placeholder="粘贴图片 URL…"
                className="flex-1 bg-transparent outline-none"
                style={{ fontSize: 13, color: T1 }}
              />
            </div>
            <button
              onClick={applyCustom}
              disabled={!draftUrl.trim()}
              style={{
                height: 40, padding: "0 18px", borderRadius: 12,
                background: accent, color: "white",
                fontSize: 13, fontWeight: 500,
                opacity: draftUrl.trim() ? 1 : 0.4,
              }}
            >
              应用
            </button>
          </div>
          <span style={{ fontSize: 11, color: T3 }}>
            支持任意可公开访问的图片 URL（jpg / png / webp 等）
          </span>

          <div className="flex items-center justify-between pt-2">
            <span style={{ fontSize: 12, color: T2 }}>文字主题色</span>
            <div className="flex gap-1" style={{ background: F2, padding: 3, borderRadius: 99 }}>
              {(["light", "dark"] as const).map(t => (
                <button
                  key={t}
                  onClick={() => {
                    if (wallpaper === "custom") {
                      setCustomWallpaperTheme(t);
                    } else {
                      setThemeOverride(themeOverride === t ? null : t);
                    }
                  }}
                  style={{
                    padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 500,
                    background: (wallpaper === "custom" ? customWallpaperTheme : themeOverride ?? autoTheme) === t ? "var(--lg-glass-bg)" : "transparent",
                    color: (wallpaper === "custom" ? customWallpaperTheme : themeOverride ?? autoTheme) === t ? accent : T2,
                  }}
                >
                  {t === "light" ? "深色文字" : "浅色文字"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
