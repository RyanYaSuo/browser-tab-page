import { useCallback, useRef, useState } from "react";

export type SyncStatus = "idle" | "connecting" | "saving" | "saved" | "error";

const GIST_FILENAME = "browser-tab-settings.json";
const GIST_DESCRIPTION = "浏览器标签页设置";

interface GistFile {
  content: string;
}

interface GistData {
  id: string;
  files: Record<string, GistFile>;
}

interface CloudData {
  wallpaper: string;
  customWallpaperUrl: string;
  customWallpaperTheme: "dark" | "light";
  tabBookmarks: { id: string; label: string; url: string; emoji: string; color: string; folderId?: string }[];
  tabFolders: { id: string; label: string; emoji: string; color: string }[];
}

const GITHUB_API = "https://api.github.com";

export function useGistSync() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [syncError, setSyncError] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const headers = (token: string): Record<string, string> => ({
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github.v3+json",
    "Content-Type": "application/json",
    "User-Agent": "browser-tab-page",
  });

  /** Test if token is valid */
  const testConnection = useCallback(async (token: string): Promise<boolean> => {
    setSyncStatus("connecting");
    setSyncError(null);
    try {
      const res = await fetch(`${GITHUB_API}/gists`, { headers: headers(token) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setSyncStatus("idle");
      return true;
    } catch (e: any) {
      setSyncStatus("error");
      setSyncError(e.message || "连接失败");
      return false;
    }
  }, []);

  /** Fetch cloud data from Gist */
  const fetchData = useCallback(async (token: string, gistId: string): Promise<CloudData | null> => {
    setSyncStatus("connecting");
    setSyncError(null);
    try {
      const res = await fetch(`${GITHUB_API}/gists/${gistId}`, { headers: headers(token) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const gist: GistData = await res.json();
      const file = gist.files?.[GIST_FILENAME];
      if (!file) throw new Error("未找到设置文件");
      const data = JSON.parse(file.content) as CloudData;
      setSyncStatus("idle");
      return data;
    } catch (e: any) {
      setSyncStatus("error");
      setSyncError(e.message || "读取失败");
      return null;
    }
  }, []);

  /** Create a new secret Gist with initial data */
  const createGist = useCallback(async (token: string, data: CloudData): Promise<string | null> => {
    setSyncStatus("saving");
    setSyncError(null);
    try {
      const res = await fetch(`${GITHUB_API}/gists`, {
        method: "POST",
        headers: headers(token),
        body: JSON.stringify({
          description: GIST_DESCRIPTION,
          public: false,
          files: { [GIST_FILENAME]: { content: JSON.stringify(data, null, 2) } },
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const gist: GistData = await res.json();
      setSyncStatus("saved");
      return gist.id;
    } catch (e: any) {
      setSyncStatus("error");
      setSyncError(e.message || "创建 Gist 失败");
      return null;
    }
  }, []);

  /** Save cloud data to existing Gist (with debounce) */
  const saveData = useCallback((token: string, gistId: string, data: CloudData) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSyncStatus("saving");
    setSyncError(null);
    saveTimer.current = setTimeout(async () => {
      try {
        const body: Record<string, any> = {
          files: { [GIST_FILENAME]: { content: JSON.stringify(data, null, 2) } },
        };
        const res = await fetch(`${GITHUB_API}/gists/${gistId}`, {
          method: "PATCH",
          headers: headers(token),
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setSyncStatus("saved");
      } catch (e: any) {
        setSyncStatus("error");
        setSyncError(e.message || "保存失败");
      }
    }, 2000);
  }, []);

  return { syncStatus, syncError, testConnection, fetchData, createGist, saveData };
}
