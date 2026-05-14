import { useState, useEffect } from "react";
import { X, Folder } from "lucide-react";
import { glassCard, accent, T1, T2, T3, F2, BORDER } from "../utils/glass";
import { TabBookmark, useSettings } from "../contexts/SettingsContext";

interface Props {
  open: boolean;
  bookmark: TabBookmark | null;
  /** When creating a new bookmark, pre-set folder */
  defaultFolderId?: string;
  onClose: () => void;
  onSave: (b: Omit<TabBookmark, "id"> & { id?: string }) => void;
  onDelete?: (id: string) => void;
}

const COMMON_DOMAIN_NAMES: Record<string, string> = {
  "github.com": "GitHub",
  "youtube.com": "YouTube",
  "google.com": "Google",
  "twitter.com": "X",
  "x.com": "X",
  "facebook.com": "Facebook",
  "instagram.com": "Instagram",
  "zhihu.com": "知乎",
  "bilibili.com": "哔哩哔哩",
  "baidu.com": "百度",
  "douyin.com": "抖音",
  "taobao.com": "淘宝",
  "jd.com": "京东",
  "weibo.com": "微博",
  "qq.com": "腾讯",
  "163.com": "网易",
  "reddit.com": "Reddit",
  "stackoverflow.com": "Stack Overflow",
  "npmjs.com": "npm",
  "vercel.com": "Vercel",
  "netlify.com": "Netlify",
  "notion.so": "Notion",
  "figma.com": "Figma",
};

function domainFromUrl(raw: string): string {
  try {
    const u = new URL(/^https?:\/\//.test(raw) ? raw : "https://" + raw);
    let host = u.hostname.replace(/^www\./, "");
    // Check common domains first
    if (COMMON_DOMAIN_NAMES[host]) return COMMON_DOMAIN_NAMES[host];
    // Extract the meaningful part (before the last two segments)
    const parts = host.split(".");
    if (parts.length >= 2) {
      // "github.com" → "Github", "stackoverflow.com" → "Stackoverflow"
      const main = parts[parts.length - 2];
      return main.charAt(0).toUpperCase() + main.slice(1);
    }
    return host.charAt(0).toUpperCase() + host.slice(1);
  } catch {
    return "";
  }
}

const EMOJIS = ["🌐","📧","📝","🎨","🐙","▶️","🐦","🎵","💬","🔷","📚","🏀","🖊","☁️","🛒","🍔","✈️","🏠","📷","🎮","💼","💡","🔍","⚡","🚀","🎯","📊","🔧","🎬","📺"];
const COLORS = ["#6c8cff","#ff453a","#30d158","#ffd60a","#ff9f0a","#bf5af2","#ea4c89","#5e6ad2","#f24e1e","#1da1f2","#1ed760","#6e5494","#000000","#ffffff"];

export function BookmarkEditor({ open, bookmark, defaultFolderId, onClose, onSave, onDelete }: Props) {
  const { tabFolders } = useSettings();
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [emoji, setEmoji] = useState("");
  const [color, setColor] = useState("#6c8cff");
  const [folderId, setFolderId] = useState<string | undefined>(undefined);
  const [faviconFailed, setFaviconFailed] = useState(false);
  const [labelManuallySet, setLabelManuallySet] = useState(false);

  const favIconUrl: string = (() => {
    if (!url.trim()) return "";
    try {
      const u = new URL(/^https?:\/\//.test(url.trim()) ? url.trim() : "https://" + url.trim());
      return `${u.origin}/favicon.ico`;
    } catch {
      return "";
    }
  })();

  useEffect(() => {
    if (bookmark) {
      setLabel(bookmark.label); setUrl(bookmark.url);
      setEmoji(bookmark.emoji); setColor(bookmark.color);
      setFolderId(bookmark.folderId);
    } else {
      setLabel(""); setUrl(""); setEmoji(""); setColor("#6c8cff");
      setFolderId(defaultFolderId);
    }
    setFaviconFailed(false);
    setLabelManuallySet(bookmark !== null);
  }, [bookmark, open, defaultFolderId]);

  // Try to fetch actual page title from the URL
  useEffect(() => {
    if (!url.trim() || labelManuallySet || !/^https?:\/\//.test(url.trim())) return;
    const t = setTimeout(async () => {
      try {
        const resp = await fetch(url.trim(), { signal: AbortSignal.timeout(3000) });
        const html = await resp.text();
        const m = html.match(/<title[^>]*>([^<]*)<\/title>/i);
        if (m?.[1]?.trim()) setLabel(m[1].trim());
      } catch { /* CORS blocked — domain fallback already applied */ }
    }, 600);
    return () => clearTimeout(t);
  }, [url, labelManuallySet]);

  if (!open) return null;

  const submit = () => {
    if (!label.trim() || !url.trim()) return;
    let finalUrl = url.trim();
    if (!/^https?:\/\//.test(finalUrl)) finalUrl = "https://" + finalUrl;
    onSave({ id: bookmark?.id, label: label.trim(), url: finalUrl, emoji, color, folderId });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center px-4"
      style={{ zIndex: 400, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", animation: "fadeIn 200ms ease" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
        style={{ ...glassCard, animation: "scaleIn 250ms cubic-bezier(0.22,1,0.36,1)" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <span style={{ fontSize: 17, fontWeight: 600, color: T1 }}>
            {bookmark ? "编辑书签" : "新建书签"}
          </span>
          <button
            onClick={onClose}
            className="flex items-center justify-center"
            style={{ width: 28, height: 28, borderRadius: 14, background: F2, color: T2 }}
            aria-label="关闭"
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex justify-center py-2">
          <div
            className="flex items-center justify-center relative"
            style={{
              width: 64, height: 64, borderRadius: 18,
              background: `${color}25`,
              border: `0.5px solid ${color}55`,
              fontSize: 32,
              boxShadow: `0 4px 16px ${color}30`,
              overflow: "hidden",
            }}
          >
            {favIconUrl && !faviconFailed ? (
              <img
                src={favIconUrl}
                alt=""
                width={36}
                height={36}
                style={{ width: 36, height: 36, objectFit: "contain" }}
                onError={() => setFaviconFailed(true)}
              />
            ) : emoji ? (
              <span>{emoji}</span>
            ) : (
              <div
                style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: `${color}22`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color, fontSize: 16, fontWeight: 600,
                }}
              >
                {(label || url).charAt(0).toUpperCase() || "?"}
              </div>
            )}
            {!emoji && favIconUrl && !faviconFailed && (
              <span
                className="absolute"
                style={{
                  bottom: 2, right: 4, fontSize: 8, color: color,
                  fontWeight: 600, opacity: 0.7,
                }}
              >
                fav
              </span>
            )}
          </div>
        </div>

        <label className="flex flex-col gap-1.5">
          <span style={{ fontSize: 12, color: T2 }}>名称</span>
          <input
            type="text"
            value={label}
            onChange={e => {
              setLabel(e.target.value);
              setLabelManuallySet(true);
              if (!url.trim() && e.target.value.trim()) {
                const name = e.target.value.trim().toLowerCase().replace(/[\s_]+/g, "");
                setUrl(name + ".com");
              }
            }}
            placeholder="如：GitHub"
            style={{
              height: 40, padding: "0 12px", borderRadius: 12,
              background: F2,
              border: `0.5px solid ${BORDER}`,
              color: T1, fontSize: 14, outline: "none",
            }}
            autoFocus
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span style={{ fontSize: 12, color: T2 }}>网址</span>
          <input
            type="url"
            value={url}
            onChange={e => {
              setUrl(e.target.value);
              if (!labelManuallySet) {
                const domain = domainFromUrl(e.target.value);
                if (domain) setLabel(domain);
              }
            }}
            placeholder="如：github.com"
            style={{
              height: 40, padding: "0 12px", borderRadius: 12,
              background: F2,
              border: `0.5px solid ${BORDER}`,
              color: T1, fontSize: 14, outline: "none",
            }}
          />
        </label>

        {tabFolders.length > 0 && (
          <label className="flex flex-col gap-1.5">
            <span style={{ fontSize: 12, color: T2 }}>所在文件夹</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setFolderId(undefined)}
                style={{
                  padding: "6px 12px", borderRadius: 99, fontSize: 12, fontWeight: 500,
                  background: folderId === undefined ? "rgba(108,140,255,0.22)" : F2,
                  color: folderId === undefined ? accent : T2,
                  border: folderId === undefined ? `0.5px solid rgba(108,140,255,0.45)` : `0.5px solid ${BORDER}`,
                  display: "inline-flex", alignItems: "center", gap: 4,
                }}
              >
                根目录
              </button>
              {tabFolders.map(f => (
                <button
                  key={f.id}
                  onClick={() => setFolderId(f.id)}
                  style={{
                    padding: "6px 12px", borderRadius: 99, fontSize: 12, fontWeight: 500,
                    background: folderId === f.id ? "rgba(108,140,255,0.22)" : F2,
                    color: folderId === f.id ? accent : T2,
                    border: folderId === f.id ? `0.5px solid rgba(108,140,255,0.45)` : `0.5px solid ${BORDER}`,
                    display: "inline-flex", alignItems: "center", gap: 4,
                  }}
                >
                  <Folder size={12} />
                  {f.label}
                </button>
              ))}
            </div>
          </label>
        )}

        {(!!bookmark || emoji) && (
          <div className="flex flex-col gap-1.5">
            <span style={{ fontSize: 12, color: T2 }}>
              自定义图标 <span style={{ color: T3 }}>（选填，默认使用网页图标）</span>
            </span>
            <div
              className="grid grid-cols-10 gap-1 p-2 rounded-xl overflow-y-auto"
              style={{ background: F2, maxHeight: 100 }}
            >
              {EMOJIS.map(e => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  style={{
                    fontSize: 18, padding: 4, borderRadius: 8,
                    background: emoji === e ? "rgba(108,140,255,0.25)" : "transparent",
                    transition: "all 100ms ease",
                  }}
                  aria-label={e}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <span style={{ fontSize: 12, color: T2 }}>颜色</span>
          <div className="flex gap-1.5 flex-wrap">
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{
                  width: 24, height: 24, borderRadius: 12,
                  background: c,
                  border: color === c ? `2px solid ${accent}` : `0.5px solid ${BORDER}`,
                  transition: "all 100ms ease",
                  transform: color === c ? "scale(1.15)" : "scale(1)",
                }}
                aria-label={c}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-2 mt-2">
          {bookmark && onDelete && (
            <button
              onClick={() => { onDelete(bookmark.id); onClose(); }}
              style={{
                height: 40, padding: "0 16px", borderRadius: 20,
                background: "rgba(255,69,58,0.15)",
                color: "#ff453a", fontSize: 14, fontWeight: 500,
              }}
            >
              删除
            </button>
          )}
          <div className="flex-1" />
          <button
            onClick={onClose}
            style={{
              height: 40, padding: "0 18px", borderRadius: 20,
              background: F2,
              color: T1, fontSize: 14, fontWeight: 500,
            }}
          >
            取消
          </button>
          <button
            onClick={submit}
            disabled={!label.trim() || !url.trim()}
            style={{
              height: 40, padding: "0 18px", borderRadius: 20,
              background: accent, color: "white",
              fontSize: 14, fontWeight: 500,
              opacity: !label.trim() || !url.trim() ? 0.4 : 1,
            }}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
