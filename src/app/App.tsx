import { useState, useRef, useEffect } from "react";
import { SettingsProvider, useSettings, WALLPAPERS, BING_DAILY_URL, YUMUS_URLS } from "./contexts/SettingsContext";
import { TabsView } from "./components/TabsView";
import { WallpaperButton } from "./components/WallpaperButton";
import { HideBookmarksButton } from "./components/HideBookmarksButton";
import { SettingsButton } from "./components/SettingsPanel";
import { SearchBar } from "./components/SearchBar";

function getImageUrl(wallpaper: string, customWallpaperUrl: string, cacheBust: Record<string, number>): string | null {
  if (wallpaper === "bing") return BING_DAILY_URL;
  if (YUMUS_URLS[wallpaper]) {
    const cb = (cacheBust[wallpaper] || 0);
    return `${YUMUS_URLS[wallpaper]}&_=${cb}`;
  }
  if (wallpaper === "custom" && customWallpaperUrl) return customWallpaperUrl;
  return null; // CSS gradient wallpaper
}

function getGradientBg(wallpaper: string): string {
  const wp = WALLPAPERS.find(w => w.id === wallpaper) ?? WALLPAPERS[0];
  return wp.bg;
}

function AppShell() {
  const { wallpaper, customWallpaperUrl, wallpaperCacheBust } = useSettings();
  const [bookmarksHidden, setBookmarksHidden] = useState(false);

  const imageUrl = getImageUrl(wallpaper, customWallpaperUrl, wallpaperCacheBust);
  const [loadedUrl, setLoadedUrl] = useState<string | null>(imageUrl);
  const preloadRef = useRef<HTMLImageElement | null>(null);

  // Preload image wallpapers — always fall through to gradient instantly
  useEffect(() => {
    if (!imageUrl) {
      // CSS gradient — no loading needed
      setLoadedUrl(null);
      return;
    }
    // Start loading new image
    const img = new Image();
    preloadRef.current = img;
    let cancelled = false;
    img.onload = () => { if (!cancelled) setLoadedUrl(imageUrl); };
    img.onerror = () => { if (!cancelled) setLoadedUrl(null); }; // fallback to gradient
    img.src = imageUrl;
    return () => { cancelled = true; };
  }, [imageUrl]);

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Inter", "PingFang SC", "Hiragino Sans GB", sans-serif',
        color: "var(--lg-text-1)",
      }}
    >
      {/* Wallpaper layer */}
      <div className="fixed inset-0" style={{ zIndex: 0 }}>
        {/* Gradient base — shows when no image wallpaper, or while image is loading */}
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            background: getGradientBg(wallpaper),
            opacity: !imageUrl || loadedUrl !== imageUrl ? 1 : 0,
          }}
        />
        {/* Image wallpaper — crossfades in once loaded */}
        {imageUrl && (
          <img
            key={imageUrl}
            src={imageUrl}
            alt=""
            className="absolute inset-0"
            style={{
              width: "100%", height: "100%",
              objectFit: "cover",
              opacity: loadedUrl === imageUrl ? 1 : 0,
              transition: "opacity 700ms cubic-bezier(0.22,1,0.36,1)",
            }}
          />
        )}
      </div>
      <main className="relative h-full overflow-y-auto" style={{ paddingBottom: 140, zIndex: 1 }}>
        <TabsView bookmarksHidden={bookmarksHidden} />
      </main>

      <div
        className="fixed left-1/2 px-4 flex justify-center"
        style={{
          bottom: 32,
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 820,
          zIndex: 150,
          pointerEvents: "none",
        }}
      >
        <div style={{ pointerEvents: "auto", width: "100%", display: "flex", justifyContent: "center" }}>
          <SearchBar />
        </div>
      </div>

      {/* Action buttons — responsive: top-right on mobile, left column on desktop */}
      <div
        className="fixed flex sm:flex-col gap-3 items-center top-4 right-4 sm:top-auto sm:right-auto sm:left-5 sm:bottom-5"
        style={{ zIndex: 200 }}
      >
        <HideBookmarksButton hidden={bookmarksHidden} onToggle={() => setBookmarksHidden(v => !v)} />
        <SettingsButton />
        <WallpaperButton />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <AppShell />
    </SettingsProvider>
  );
}
