import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo, useRef } from "react";
import { useGistSync, SyncStatus } from "../hooks/useGistSync";
import { detectLuminance } from "../utils/luminance";

export type Theme = "dark" | "light";

export interface Wallpaper {
  id: string;
  name: string;
  bg: string;
  preview: string;
  theme: Theme;
}

export const WALLPAPERS: Wallpaper[] = [
  {
    id: "graphite",
    name: "石墨",
    theme: "light",
    preview: "linear-gradient(135deg, #ececee, #d8d9dd)",
    bg: `radial-gradient(ellipse 70% 60% at 12% 10%, rgba(180,185,195,0.35) 0%, transparent 55%),
         radial-gradient(ellipse 60% 70% at 90% 90%, rgba(160,165,180,0.30) 0%, transparent 55%),
         linear-gradient(160deg, #ececee 0%, #e2e3e7 50%, #d8d9dd 100%)`,
  },
  {
    id: "aurora",
    name: "极光",
    theme: "light",
    preview: "linear-gradient(135deg, #c7d8ff, #e3ccff)",
    bg: `radial-gradient(ellipse 70% 60% at 12% 10%, rgba(100,160,255,0.40) 0%, transparent 55%),
         radial-gradient(ellipse 60% 70% at 90% 90%, rgba(200,150,255,0.40) 0%, transparent 55%),
         linear-gradient(160deg, #f4f7ff 0%, #eef0fa 50%, #f8f5ff 100%)`,
  },
  {
    id: "dusk",
    name: "暮光",
    theme: "light",
    preview: "linear-gradient(135deg, #ffd6c8, #ffe0b3)",
    bg: `radial-gradient(ellipse 70% 60% at 12% 10%, rgba(255,180,160,0.40) 0%, transparent 55%),
         radial-gradient(ellipse 60% 70% at 90% 90%, rgba(255,200,140,0.40) 0%, transparent 55%),
         linear-gradient(160deg, #fff4ec 0%, #ffe9d8 50%, #ffd9b8 100%)`,
  },
  {
    id: "mist",
    name: "薄雾",
    theme: "light",
    preview: "linear-gradient(135deg, #e8f0f5, #d8e3ec)",
    bg: `radial-gradient(ellipse 70% 60% at 50% 0%, rgba(200,220,235,0.5) 0%, transparent 60%),
         linear-gradient(160deg, #f4f8fb 0%, #e8eef3 50%, #dce5ec 100%)`,
  },
  {
    id: "sage",
    name: "苔藓",
    theme: "light",
    preview: "linear-gradient(135deg, #d8e8d8, #c8dcc8)",
    bg: `radial-gradient(ellipse 70% 60% at 12% 10%, rgba(170,200,170,0.35) 0%, transparent 55%),
         radial-gradient(ellipse 60% 70% at 90% 90%, rgba(190,210,180,0.30) 0%, transparent 55%),
         linear-gradient(160deg, #eef3ec 0%, #e0e8de 50%, #d2dccf 100%)`,
  },
  {
    id: "midnight",
    name: "深夜",
    theme: "dark",
    preview: "linear-gradient(135deg, #1a2238, #0a0f1e)",
    bg: `radial-gradient(ellipse 70% 60% at 12% 10%, rgba(80,130,255,0.35) 0%, transparent 55%),
         radial-gradient(ellipse 60% 70% at 90% 90%, rgba(170,100,255,0.30) 0%, transparent 55%),
         linear-gradient(160deg, #050a1a 0%, #0a1228 50%, #060d20 100%)`,
  },
];

export const BING_DAILY_URL = "https://bing.ee123.net/img/?type=hp";

export const YUMUS_URLS: Record<string, string> = {
  "yumus-360-4k": "https://www.yumus.cn/api/?target=img&brand=360&type=0",
  "yumus-360-scenery": "https://www.yumus.cn/api/?target=img&brand=360&type=3",
  "yumus-360-anime": "https://www.yumus.cn/api/?target=img&brand=360&type=5",
};

export interface TabBookmark {
  id: string;
  label: string;
  url: string;
  emoji: string;
  color: string;
  folderId?: string;
}

export interface TabFolder {
  id: string;
  label: string;
  emoji: string;
  color: string;
}

/** Subset of Settings that gets synced to the cloud */
export type CloudData = Pick<Settings, "wallpaper" | "customWallpaperUrl" | "customWallpaperTheme" | "tabBookmarks" | "tabFolders">;

interface Settings {
  wallpaper: string;
  customWallpaperUrl: string;
  customWallpaperTheme: Theme;
  tabBookmarks: TabBookmark[];
  tabFolders: TabFolder[];
  githubToken: string;
  gistId: string;
  wallpaperCacheBust: Record<string, number>;
  themeOverride: Theme | null;
}

interface Ctx extends Settings {
  theme: Theme;
  syncStatus: SyncStatus;
  syncError: string | null;
  setWallpaper: (id: string) => void;
  setCustomWallpaperUrl: (url: string) => void;
  setCustomWallpaperTheme: (t: Theme) => void;
  addTabBookmark: (b: Omit<TabBookmark, "id">) => void;
  updateTabBookmark: (id: string, b: Partial<TabBookmark>) => void;
  removeTabBookmark: (id: string) => void;
  addTabFolder: (f: Omit<TabFolder, "id">) => string;
  updateTabFolder: (id: string, f: Partial<TabFolder>) => void;
  removeTabFolder: (id: string) => void;
  setGithubToken: (token: string) => void;
  setGistId: (id: string) => void;
  autoTheme: Theme | null;
  setThemeOverride: (t: Theme | null) => void;
  testConnection: (token: string) => Promise<boolean>;
  autoConnectGist: (token: string) => Promise<boolean>;
  createGist: () => Promise<string | null>;
  connectToGist: (gistId: string) => Promise<boolean>;
  bumpWallpaperCache: (id: string) => void;
}

const DEFAULTS: Settings = {
  wallpaper: "bing",
  customWallpaperUrl: "",
  customWallpaperTheme: "dark",
  tabBookmarks: [
    { id: "1", label: "GitHub",  url: "https://github.com",   emoji: "🐙", color: "#6e5494" },
    { id: "2", label: "Figma",   url: "https://figma.com",    emoji: "🎨", color: "#f24e1e" },
    { id: "3", label: "Notion",  url: "https://notion.so",    emoji: "📝", color: "#000000" },
    { id: "4", label: "YouTube", url: "https://youtube.com",  emoji: "▶️", color: "#ff0000" },
    { id: "5", label: "Gmail",   url: "https://mail.google.com", emoji: "📧", color: "#ea4335" },
    { id: "6", label: "Twitter", url: "https://twitter.com",  emoji: "🐦", color: "#1da1f2" },
    { id: "7", label: "Spotify", url: "https://spotify.com",  emoji: "🎵", color: "#1ed760" },
    { id: "8", label: "Linear",  url: "https://linear.app",   emoji: "🔷", color: "#5e6ad2" },
  ],
  tabFolders: [],
  githubToken: "",
  gistId: "",
  wallpaperCacheBust: {},
  themeOverride: null,
};

const STORAGE_KEY = "liquid-glass-settings-v1";

function loadSettings(): Settings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULTS, ...parsed };
  } catch {
    return DEFAULTS;
  }
}

function pickCloudData(s: Settings): CloudData {
  return {
    wallpaper: s.wallpaper,
    customWallpaperUrl: s.customWallpaperUrl,
    customWallpaperTheme: s.customWallpaperTheme,
    tabBookmarks: s.tabBookmarks,
    tabFolders: s.tabFolders,
  };
}

const SettingsCtx = createContext<Ctx | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const { syncStatus, syncError, testConnection: testGist, fetchData, findExistingGist, createGist: createGistApi, saveData } = useGistSync();
  const initialized = useRef(false);

  // Auto-detected luminance for URL-based wallpapers
  const [autoTheme, setAutoTheme] = useState<Theme | null>(null);

  // Derive theme from wallpaper choice
  // Priority: manual override → auto-detected → preset theme → dark
  const theme: Theme = useMemo(() => {
    if (settings.wallpaper === "custom") return settings.customWallpaperTheme;
    const wp = WALLPAPERS.find(w => w.id === settings.wallpaper);
    if (wp) return wp.theme;
    // URL-based wallpapers (bing, yumus): manual → auto → dark
    return settings.themeOverride ?? autoTheme ?? "dark";
  }, [settings.wallpaper, settings.themeOverride, autoTheme]);

  // Trigger luminance detection when URL-based wallpaper is active
  const prevWallpaper = useRef(settings.wallpaper);
  useEffect(() => {
    if (prevWallpaper.current === settings.wallpaper) return;
    prevWallpaper.current = settings.wallpaper;
    // Only auto-detect for URL-based wallpapers
    if (settings.wallpaper === "bing" || settings.wallpaper.startsWith("yumus-")) {
      setAutoTheme(null);
      let url: string;
      if (settings.wallpaper === "bing") {
        url = BING_DAILY_URL;
      } else {
        const cb = settings.wallpaperCacheBust[settings.wallpaper] || 0;
        url = `${YUMUS_URLS[settings.wallpaper]}&_=${cb}`;
      }
      const abort = new AbortController();
      detectLuminance(url, abort.signal).then(setAutoTheme);
      return () => abort.abort();
    }
    setAutoTheme(null);
  }, [settings.wallpaper, settings.wallpaperCacheBust]);

  // Save to localStorage whenever settings change
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); } catch {}
  }, [settings]);

  // Sync theme to <html>
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // On mount: try to load from Gist if configured
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    if (!settings.githubToken) return;
    if (settings.gistId) {
      // Already have both token and gistId → load data
      fetchData(settings.githubToken, settings.gistId).then(data => {
        if (data) setSettings(s => ({ ...s, ...data }));
      });
    } else {
      // Have token but no gistId → auto-detect existing Gist
      findExistingGist(settings.githubToken).then(id => {
        if (id) {
          fetchData(settings.githubToken, id).then(data => {
            if (data) setSettings(s => ({ ...s, ...data, gistId: id }));
          });
        }
      });
    }
  }, [settings.githubToken, settings.gistId, fetchData, findExistingGist]);

  // Debounce save to Gist on settings changes (cloud-only fields)
  const prevCloudRef = useRef<string>("");
  useEffect(() => {
    if (!settings.githubToken || !settings.gistId) return;
    // Skip the initial mount fetch-triggered save
    const cloudStr = JSON.stringify(pickCloudData(settings));
    if (cloudStr === prevCloudRef.current) return;
    prevCloudRef.current = cloudStr;
    saveData(settings.githubToken, settings.gistId, pickCloudData(settings));
  }, [settings, saveData]);

  const setWallpaper = useCallback((wallpaper: string) =>
    setSettings(s => ({ ...s, wallpaper })), []);
  const setCustomWallpaperUrl = useCallback((customWallpaperUrl: string) =>
    setSettings(s => ({ ...s, customWallpaperUrl })), []);
  const setCustomWallpaperTheme = useCallback((customWallpaperTheme: Theme) =>
    setSettings(s => ({ ...s, customWallpaperTheme })), []);
  const setGithubToken = useCallback((githubToken: string) =>
    setSettings(s => ({ ...s, githubToken })), []);
  const setGistId = useCallback((gistId: string) =>
    setSettings(s => ({ ...s, gistId })), []);

  const setThemeOverride = useCallback((t: Theme | null) =>
    setSettings(s => ({ ...s, themeOverride: t })), []);

  const bumpWallpaperCache = useCallback((id: string) =>
    setSettings(s => ({ ...s, wallpaperCacheBust: { ...s.wallpaperCacheBust, [id]: (s.wallpaperCacheBust[id] || 0) + 1 } })), []);

  const addTabBookmark = useCallback((b: Omit<TabBookmark, "id">) =>
    setSettings(s => ({ ...s, tabBookmarks: [...s.tabBookmarks, { ...b, id: Date.now().toString() }] })), []);
  const updateTabBookmark = useCallback((id: string, b: Partial<TabBookmark>) =>
    setSettings(s => ({ ...s, tabBookmarks: s.tabBookmarks.map(x => x.id === id ? { ...x, ...b } : x) })), []);
  const removeTabBookmark = useCallback((id: string) =>
    setSettings(s => ({ ...s, tabBookmarks: s.tabBookmarks.filter(x => x.id !== id) })), []);
  const addTabFolder = useCallback((f: Omit<TabFolder, "id">) => {
    const id = "f" + Date.now().toString();
    setSettings(s => ({ ...s, tabFolders: [...s.tabFolders, { ...f, id }] }));
    return id;
  }, []);
  const updateTabFolder = useCallback((id: string, f: Partial<TabFolder>) =>
    setSettings(s => ({ ...s, tabFolders: s.tabFolders.map(x => x.id === id ? { ...x, ...f } : x) })), []);
  const removeTabFolder = useCallback((id: string) =>
    setSettings(s => ({
      ...s,
      tabFolders: s.tabFolders.filter(x => x.id !== id),
      tabBookmarks: s.tabBookmarks.map(b => b.folderId === id ? { ...b, folderId: undefined } : b),
    })), []);

  const testConnection = useCallback(async (token: string) => {
    if (!token) return false;
    return testGist(token);
  }, [testGist]);

  const autoConnectGist = useCallback(async (token: string) => {
    if (!token) return false;
    const existingId = await findExistingGist(token);
    if (!existingId) return false;
    const data = await fetchData(token, existingId);
    if (data) {
      setSettings(s => ({ ...s, ...data, gistId: existingId }));
      return true;
    }
    return false;
  }, [findExistingGist, fetchData]);

  const createGist = useCallback(async () => {
    if (!settings.githubToken) return null;
    const id = await createGistApi(settings.githubToken, pickCloudData(settings));
    if (id) setSettings(s => ({ ...s, gistId: id }));
    return id;
  }, [settings.githubToken, createGistApi]);

  const connectToGist = useCallback(async (gistId: string) => {
    if (!settings.githubToken) return false;
    const data = await fetchData(settings.githubToken, gistId);
    if (data) {
      setSettings(s => ({ ...s, ...data, gistId }));
      return true;
    }
    return false;
  }, [settings.githubToken, fetchData]);

  return (
    <SettingsCtx.Provider value={{
      ...settings,
      theme,
      syncStatus,
      syncError,
      setWallpaper, setCustomWallpaperUrl, setCustomWallpaperTheme,
      addTabBookmark, updateTabBookmark, removeTabBookmark,
      addTabFolder, updateTabFolder, removeTabFolder,
      setGithubToken, setGistId,
      autoTheme,
      setThemeOverride,
      testConnection, autoConnectGist, createGist, connectToGist,
      bumpWallpaperCache,
    }}>
      {children}
    </SettingsCtx.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsCtx);
  if (!ctx) throw new Error("useSettings must be used inside SettingsProvider");
  return ctx;
}
