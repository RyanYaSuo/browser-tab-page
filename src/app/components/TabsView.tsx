import { useState, useEffect } from "react";
import { Bookmark, Folder, X } from "lucide-react";
import { HeroSection } from "./HeroSection";
import { WeatherWidget } from "./WeatherWidget";
import { BookmarkEditor } from "./BookmarkEditor";
import { FolderEditor } from "./FolderEditor";
import { useSettings, TabBookmark, TabFolder } from "../contexts/SettingsContext";
import { glassCard, glassWhite, accent, T1, T2, T3, BORDER } from "../utils/glass";

function faviconUrl(url: string): string {
  try {
    const u = new URL(/^https?:\/\//.test(url) ? url : "https://" + url);
    // Load directly from the website — no third-party service needed
    return `${u.origin}/favicon.ico`;
  } catch {
    return "";
  }
}

const DOMAIN_EMOJI: Record<string, string> = {
  "github.com": "🐙", "figma.com": "🎨", "notion.so": "📝",
  "notion.com": "📝", "youtube.com": "▶️", "youtu.be": "▶️",
  "google.com": "🔍", "gmail.com": "📧", "mail.google.com": "📧",
  "twitter.com": "🐦", "x.com": "🐦", "spotify.com": "🎵",
  "linear.app": "🔷", "baidu.com": "🌐", "bilibili.com": "📺",
  "zhihu.com": "💬", "weibo.com": "📢", "douyin.com": "🎵",
  "taobao.com": "🛒", "jd.com": "🛒", "amazon.com": "🛒",
  "amazon.cn": "🛒", "netflix.com": "🎬", "apple.com": "🍎",
  "microsoft.com": "💼", "vercel.com": "▲",
  "stackoverflow.com": "📚", "npmjs.com": "📦",
  "docker.com": "🐳", "react.dev": "⚛️",
  "nextjs.org": "▲", "tailwindcss.com": "🌊",
};

function domainEmoji(url: string): string {
  try {
    const u = new URL(/^https?:\/\//.test(url) ? url : "https://" + url);
    const hostname = u.hostname.replace(/^www\./, "");
    // Try exact match first, then 2-part domain
    const parts = hostname.split(".");
    const twoPart = parts.slice(-2).join(".");
    return DOMAIN_EMOJI[hostname] || DOMAIN_EMOJI[twoPart] || "";
  } catch {
    return "";
  }
}

interface BookmarkTileProps {
  b: TabBookmark;
  onEdit: (b: TabBookmark) => void;
  draggable?: boolean;
  isDragging?: boolean;
  isDropTarget?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: () => void;
  onDrop?: (e: React.DragEvent) => void;
}

const RETRY_DELAYS = [30000, 120000, 300000, 900000]; // 30s, 2min, 5min, 15min

function BookmarkTile({
  b, onEdit,
  draggable, isDragging, isDropTarget,
  onDragStart, onDragEnd, onDragOver, onDragLeave, onDrop,
}: BookmarkTileProps) {
  const [hovered, setHovered] = useState(false);
  const [favFailed, setFavFailed] = useState(false);
  const [retryRound, setRetryRound] = useState(0);
  const baseFav = faviconUrl(b.url);
  // Use retryRound as a cache buster so the browser actually re-requests on retry
  const fav = baseFav && retryRound > 0 ? `${baseFav}?r=${retryRound}` : baseFav;
  const showFav = !!fav && !favFailed;

  // Retry loading favicon when server becomes accessible
  useEffect(() => {
    if (!favFailed || !baseFav || retryRound >= RETRY_DELAYS.length) return;
    const t = setTimeout(() => {
      setFavFailed(false);
      setRetryRound(r => r + 1);
    }, RETRY_DELAYS[retryRound]);
    return () => clearTimeout(t);
  }, [favFailed, baseFav, retryRound]);

  const hasEmoji = b.emoji || domainEmoji(b.url);

  return (
    <div
      data-ctx="bookmark"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onContextMenu={e => { e.preventDefault(); e.stopPropagation(); onEdit(b); }}
      className="relative"
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      style={{ opacity: isDragging ? 0.4 : 1, transition: "opacity 150ms ease" }}
    >
      <a
        href={b.url}
        target="_blank"
        rel="noopener noreferrer"
        draggable={false}
        className="flex flex-col items-center justify-center gap-2 py-3 transition-transform duration-200"
        style={{ transform: hovered || isDropTarget ? "translateY(-3px)" : "translateY(0)" }}
        aria-label={b.label}
      >
        <div
          className="flex items-center justify-center transition-all duration-200"
          style={{
            width: 40, height: 40,
            filter: isDropTarget
              ? "drop-shadow(0 0 0 2px #6c8cff) drop-shadow(0 8px 24px rgba(108,140,255,0.30))"
              : hovered
                ? "drop-shadow(0 8px 24px rgba(0,0,0,0.18)) brightness(1.1)"
                : "drop-shadow(0 2px 4px rgba(0,0,0,0.10))",
            transform: isDropTarget ? "scale(1.08)" : "scale(1)",
          }}
        >
          {showFav ? (
            <img
              src={fav}
              alt=""
              width={36}
              height={36}
              style={{ width: 36, height: 36, objectFit: "contain" }}
              onError={() => setFavFailed(true)}
            />
          ) : hasEmoji ? (
            <span style={{ fontSize: 28 }}>{b.emoji || domainEmoji(b.url)}</span>
          ) : (
            <div
              className="flex items-center justify-center"
              style={{
                width: 36, height: 36, borderRadius: "50%",
                background: `${b.color}22`,
                fontSize: 16, fontWeight: 600, lineHeight: 1,
                color: b.color,
                boxShadow: `0 2px 6px ${b.color}22`,
              }}
            >
              {b.label.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <span
          style={{
            fontSize: 12, color: T1, fontWeight: 500,
            maxWidth: "100%", overflow: "hidden",
            textOverflow: "ellipsis", whiteSpace: "nowrap",
            textShadow: "0 1px 3px rgba(0,0,0,0.20)",
          }}
        >
          {b.label}
        </span>
      </a>
    </div>
  );
}

interface FolderTileProps {
  f: TabFolder;
  count: number;
  preview: TabBookmark[];
  onOpen: () => void;
  onEdit: () => void;
  isDropTarget?: boolean;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: () => void;
  onDrop?: (e: React.DragEvent) => void;
}

function CellFavicon({ url, emoji }: { url: string; emoji: string }) {
  const [failed, setFailed] = useState(false);
  const [retryRound, setRetryRound] = useState(0);
  const baseFav = faviconUrl(url);
  const fav = baseFav && retryRound > 0 ? `${baseFav}?r=${retryRound}` : baseFav;

  useEffect(() => {
    if (!failed || !baseFav || retryRound >= RETRY_DELAYS.length) return;
    const t = setTimeout(() => {
      setFailed(false);
      setRetryRound(r => r + 1);
    }, RETRY_DELAYS[retryRound]);
    return () => clearTimeout(t);
  }, [failed, baseFav, retryRound]);

  if (!failed && fav) {
    return (
      <img
        src={fav}
        alt=""
        style={{ width: 14, height: 14, objectFit: "contain" }}
        onError={() => setFailed(true)}
      />
    );
  }
  return <span style={{ fontSize: 11 }}>{emoji || domainEmoji(url) || ""}</span>;
}

function FolderTile({
  f, count, preview, onOpen, onEdit,
  isDropTarget, onDragOver, onDragLeave, onDrop,
}: FolderTileProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      data-ctx="folder"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onContextMenu={e => { e.preventDefault(); onEdit(); }}
      className="relative"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <button
        onClick={onOpen}
        className="w-full flex flex-col items-center justify-center gap-2 py-3 transition-transform duration-200"
        style={{ transform: hovered || isDropTarget ? "translateY(-3px)" : "translateY(0)" }}
        aria-label={`打开 ${f.label}`}
      >
        <div
          className="grid grid-cols-2 gap-0.5 p-[5px] transition-all duration-200"
          style={{
            width: 44, height: 44, borderRadius: 14,
            background: `${f.color}1f`,
            border: isDropTarget ? `2px solid ${accent}` : `0.5px solid ${f.color}33`,
            boxShadow: isDropTarget
              ? `0 0 0 2px ${accent}33, 0 8px 24px rgba(108,140,255,0.30)`
              : hovered
                ? `0 8px 24px ${f.color}33, 0 2px 8px rgba(0,0,0,0.10)`
                : "0 1px 4px rgba(0,0,0,0.06)",
            transform: isDropTarget ? "scale(1.08)" : "scale(1)",
            filter: !isDropTarget ? "drop-shadow(0 2px 4px rgba(0,0,0,0.10))" : undefined,
          }}
        >
          {[0, 1, 2, 3].map(i => {
            const b = preview[i];
            return (
              <div
                key={i}
                className="flex items-center justify-center"
                style={{
                  borderRadius: 5,
                  background: b ? "var(--lg-fill-1)" : "transparent",
                  overflow: "hidden",
                  fontSize: 11,
                }}
              >
                {b ? <CellFavicon url={b.url} emoji={b.emoji} /> : null}
              </div>
            );
          })}
        </div>
        <span
          style={{
            fontSize: 12, color: T1, fontWeight: 500,
            maxWidth: "100%", overflow: "hidden",
            textOverflow: "ellipsis", whiteSpace: "nowrap",
            textShadow: "0 1px 3px rgba(0,0,0,0.20)",
          }}
        >
          {f.label} <span style={{ color: T3 }}>({count})</span>
        </span>
      </button>
    </div>
  );
}

const DRAG_MIME = "application/x-bookmark-id";

interface TabsViewProps {
  bookmarksHidden?: boolean;
}

export function TabsView({ bookmarksHidden = false }: TabsViewProps) {
  const {
    tabBookmarks, addTabBookmark, updateTabBookmark, removeTabBookmark,
    tabFolders, addTabFolder, updateTabFolder, removeTabFolder,
  } = useSettings();

  const [editingBookmark, setEditingBookmark] = useState<TabBookmark | null>(null);
  const [editingFolder, setEditingFolder] = useState<TabFolder | null>(null);
  const [bmOpen, setBmOpen] = useState(false);
  const [folderOpen, setFolderOpen] = useState(false);
  const [openFolderId, setOpenFolderId] = useState<string | null>(null);
  const [ctxPos, setCtxPos] = useState<{ x: number; y: number } | null>(null);
  const [folderDefaultId, setFolderDefaultId] = useState<string | undefined>(undefined);

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  const onBookmarkDragStart = (id: string) => (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData(DRAG_MIME, id);
    setDraggingId(id);
  };
  const onBookmarkDragEnd = () => { setDraggingId(null); setDropTargetId(null); };
  const onTileDragOver = (id: string) => (e: React.DragEvent) => {
    if (!draggingId || draggingId === id) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dropTargetId !== id) setDropTargetId(id);
  };
  const onTileDragLeave = (id: string) => () => {
    if (dropTargetId === id) setDropTargetId(null);
  };

  // Drop a bookmark onto another bookmark → create folder with both
  const onDropOnBookmark = (targetId: string) => (e: React.DragEvent) => {
    e.preventDefault();
    const sourceId = draggingId ?? e.dataTransfer.getData(DRAG_MIME);
    setDraggingId(null);
    setDropTargetId(null);
    if (!sourceId || sourceId === targetId) return;
    const source = tabBookmarks.find(b => b.id === sourceId);
    const target = tabBookmarks.find(b => b.id === targetId);
    if (!source || !target) return;

    // Use target's color, generic emoji + name "新建文件夹"
    const newId = addTabFolder({ label: "新建文件夹", emoji: "📁", color: target.color });
    updateTabBookmark(target.id, { folderId: newId });
    updateTabBookmark(source.id, { folderId: newId });
  };

  // Drop a bookmark onto a folder → move into folder
  const onDropOnFolder = (folderId: string) => (e: React.DragEvent) => {
    e.preventDefault();
    const sourceId = draggingId ?? e.dataTransfer.getData(DRAG_MIME);
    setDraggingId(null);
    setDropTargetId(null);
    if (!sourceId) return;
    updateTabBookmark(sourceId, { folderId });
  };

  const ungrouped = tabBookmarks.filter(b => !b.folderId);
  const inFolder = (fid: string) => tabBookmarks.filter(b => b.folderId === fid);
  const isEmpty = tabFolders.length === 0 && ungrouped.length === 0;

  const openNewBookmark = (folderId?: string) => {
    setEditingBookmark(null);
    setFolderDefaultId(folderId);
    setBmOpen(true);
  };
  const openEditBookmark = (b: TabBookmark) => {
    setEditingBookmark(b);
    setFolderDefaultId(undefined);
    setBmOpen(true);
  };
  const openNewFolder = () => { setEditingFolder(null); setFolderOpen(true); };
  const openEditFolder = (f: TabFolder) => { setEditingFolder(f); setFolderOpen(true); };

  const onSaveBookmark = (data: Omit<TabBookmark, "id"> & { id?: string }) => {
    if (data.id) updateTabBookmark(data.id, data);
    else addTabBookmark(data);
  };
  const onSaveFolder = (data: Omit<TabFolder, "id"> & { id?: string }) => {
    if (data.id) updateTabFolder(data.id, data);
    else addTabFolder(data);
  };

  const openedFolder = openFolderId ? tabFolders.find(f => f.id === openFolderId) : null;

  // Capture-phase context menu — fires BEFORE React's handlers
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      // Bookmarks/folders have their own onContextMenu — let React handle it
      if (el.closest('[data-ctx]')) return;
      // Inside modals (z-index >= 350) or the page context menu itself
      if (el.closest('[style*="z-index: 35"], [style*="z-index: 40"], [style*="z-index: 70"], [style*="z-index: 71"]')) return;
      // Inside input fields
      if (el.closest('input, textarea')) return;
      e.preventDefault();
      setCtxPos({ x: e.clientX, y: e.clientY });
    };
    document.addEventListener("contextmenu", handler, true);
    return () => document.removeEventListener("contextmenu", handler, true);
  }, []);

  return (
    <div>
      <div
        style={{
          paddingTop: bookmarksHidden ? "calc(50vh - 140px)" : "30vh",
          transition: "padding-top 600ms cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <HeroSection large={bookmarksHidden} />
      </div>

      <div className="flex justify-center mt-4">
        <WeatherWidget />
      </div>

      <div
        className="px-4 sm:px-6 lg:px-8 pb-4"
        style={{
          marginTop: 40,
          opacity: bookmarksHidden ? 0 : 1,
          transform: bookmarksHidden ? "translateY(16px)" : "translateY(0)",
          pointerEvents: bookmarksHidden ? "none" : "auto",
          transition: "opacity 400ms ease, transform 400ms cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <div className="max-w-[960px] mx-auto">
          {isEmpty ? (
            <div
              className="flex flex-col items-center justify-center gap-3 py-16 select-none"
              style={{ animation: "fadeIn 0.5s ease" }}
            >
              <div
                className="flex items-center justify-center"
                style={{
                  width: 56, height: 56, borderRadius: 20,
                  background: "var(--lg-fill-1)",
                  color: T3,
                }}
              >
                <Bookmark size={24} />
              </div>
              <span style={{ fontSize: 14, color: T2 }}>
                还没有书签，右键点击空白处添加
              </span>
              <button
                onClick={() => openNewBookmark()}
                style={{
                  height: 36, padding: "0 20px", borderRadius: 18,
                  background: accent, color: "white",
                  fontSize: 13, fontWeight: 500,
                }}
              >
                添加第一个书签
              </button>
            </div>
          ) : (
            <div
              className="grid gap-3"
              style={{ gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))" }}
            >
            {tabFolders.map(f => (
              <FolderTile
                key={f.id}
                f={f}
                count={inFolder(f.id).length}
                preview={inFolder(f.id).slice(0, 4)}
                onOpen={() => setOpenFolderId(f.id)}
                onEdit={() => openEditFolder(f)}
                isDropTarget={dropTargetId === f.id}
                onDragOver={onTileDragOver(f.id)}
                onDragLeave={onTileDragLeave(f.id)}
                onDrop={onDropOnFolder(f.id)}
              />
            ))}

            {ungrouped.map(b => (
              <BookmarkTile
                key={b.id}
                b={b}
                onEdit={openEditBookmark}
                draggable
                isDragging={draggingId === b.id}
                isDropTarget={dropTargetId === b.id}
                onDragStart={onBookmarkDragStart(b.id)}
                onDragEnd={onBookmarkDragEnd}
                onDragOver={onTileDragOver(b.id)}
                onDragLeave={onTileDragLeave(b.id)}
                onDrop={onDropOnBookmark(b.id)}
              />
            ))}
          </div>
        )}
        </div>
      </div>

      {ctxPos && (
        <>
          <div className="fixed inset-0" style={{ zIndex: 70 }} onClick={() => setCtxPos(null)} />
          <div
            className="fixed flex flex-col p-1.5"
            style={{
              ...glassCard,
              zIndex: 71,
              left: ctxPos.x, top: ctxPos.y,
              minWidth: 160,
              animation: "fadeIn 100ms ease",
            }}
          >
            <button
              onClick={() => { setCtxPos(null); openNewBookmark(); }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
              style={{ fontSize: 13, color: T1 }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--lg-hover-bg)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
            >
              <Bookmark size={14} /> 新建书签
            </button>
            <button
              onClick={() => { setCtxPos(null); openNewFolder(); }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
              style={{ fontSize: 13, color: T1 }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--lg-hover-bg)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
            >
              <Folder size={14} /> 新建文件夹
            </button>
          </div>
        </>
      )}

      {/* Folder contents modal */}
      {openedFolder && (
        <div
          className="fixed inset-0 flex items-center justify-center px-4"
          style={{ zIndex: 350, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", animation: "fadeIn 200ms ease" }}
          onClick={() => setOpenFolderId(null)}
          onContextMenu={e => { e.preventDefault(); e.stopPropagation(); }}
        >
          <div
            className="w-full max-w-2xl p-6 flex flex-col gap-4 max-h-[80vh]"
            style={{ ...glassWhite, animation: "scaleIn 250ms cubic-bezier(0.22,1,0.36,1)" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: 36, height: 36, borderRadius: 12,
                    background: `${openedFolder.color}22`,
                    border: `0.5px solid ${openedFolder.color}44`,
                    fontSize: 20,
                  }}
                >
                  {openedFolder.emoji}
                </div>
                <span style={{ fontSize: 17, fontWeight: 600, color: T1 }}>{openedFolder.label}</span>
                <span style={{ fontSize: 12, color: T3 }}>
                  {inFolder(openedFolder.id).length} 个书签
                </span>
              </div>
              <button
                onClick={() => setOpenFolderId(null)}
                className="flex items-center justify-center"
                style={{ width: 28, height: 28, borderRadius: 14, background: "var(--lg-fill-2)", color: T2 }}
                aria-label="关闭"
              >
                <X size={14} />
              </button>
            </div>

            <div
              className="grid gap-3 overflow-y-auto"
              style={{ gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))" }}
              onContextMenu={e => { e.preventDefault(); openNewBookmark(openedFolder.id); }}
            >
              {inFolder(openedFolder.id).map(b => (
                <BookmarkTile
                  key={b.id}
                  b={b}
                  onEdit={openEditBookmark}
                  draggable
                  isDragging={draggingId === b.id}
                  onDragStart={onBookmarkDragStart(b.id)}
                  onDragEnd={onBookmarkDragEnd}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <BookmarkEditor
        open={bmOpen}
        bookmark={editingBookmark}
        defaultFolderId={folderDefaultId}
        onClose={() => setBmOpen(false)}
        onSave={onSaveBookmark}
        onDelete={removeTabBookmark}
      />
      <FolderEditor
        open={folderOpen}
        folder={editingFolder}
        onClose={() => setFolderOpen(false)}
        onSave={onSaveFolder}
        onDelete={(id) => { removeTabFolder(id); if (openFolderId === id) setOpenFolderId(null); }}
      />
    </div>
  );
}
