import { useState, useEffect, useRef } from "react";
import { Search, X, Check } from "lucide-react";
import { accent, T1, T2, T3, BORDER, glassCard } from "../utils/glass";

const ENGINES = [
  { id: "google", label: "Google", url: "https://www.google.com/search?q=" },
  { id: "baidu",  label: "百度",   url: "https://www.baidu.com/s?wd="      },
  { id: "bing",   label: "Bing",   url: "https://www.bing.com/search?q="   },
];

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [engine, setEngine] = useState("baidu");
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const currentEngine = ENGINES.find(e => e.id === engine)!;

  const doSearch = () => {
    if (!query.trim()) return;
    window.open(currentEngine.url + encodeURIComponent(query.trim()), "_blank");
    setQuery("");
  };

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const h = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    window.addEventListener("mousedown", h);
    return () => window.removeEventListener("mousedown", h);
  }, [menuOpen]);

  const expanded = hovered || focused || menuOpen;

  return (
    <div
      ref={wrapRef}
      className="relative"
      style={{
        width: "100%",
        maxWidth: expanded ? 760 : 440,
        transition: "max-width 550ms cubic-bezier(0.22,1,0.36,1)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="flex items-center gap-2 pl-2 pr-5 w-full"
        style={{
          height: 52,
          borderRadius: 30,
          background: "var(--lg-fill-1)",
          border: `0.5px solid ${BORDER}`,
          backdropFilter: "blur(24px) saturate(1.4)",
          WebkitBackdropFilter: "blur(24px) saturate(1.4)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
        }}
      >
        <button
          onClick={() => setMenuOpen(v => !v)}
          className="flex items-center gap-1.5 flex-shrink-0 focus-visible:outline-none"
          style={{
            height: 36,
            padding: "0 10px 0 12px",
            borderRadius: 18,
            background: menuOpen ? "var(--lg-fill-2)" : "transparent",
            color: T2,
            transition: "background 150ms ease",
          }}
          onMouseEnter={e => { if (!menuOpen) (e.currentTarget as HTMLButtonElement).style.background = "var(--lg-hover-bg)"; }}
          onMouseLeave={e => { if (!menuOpen) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
          aria-label="选择搜索引擎"
        >
          <Search size={16} style={{ color: T2 }} />
          <span style={{ fontSize: 12, fontWeight: 500, color: T2 }}>{currentEngine.label}</span>
        </button>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={e => e.key === "Enter" && doSearch()}
          placeholder="搜索或输入网址…"
          className="flex-1 bg-transparent outline-none focus-visible:outline-none min-w-0"
          style={{ fontSize: 16, color: T1, fontWeight: 500, caretColor: accent }}
          aria-label="搜索"
        />
        {query ? (
          <button
            onClick={() => setQuery("")}
            style={{ color: T3, flexShrink: 0 }}
            aria-label="清空"
          >
            <X size={16} />
          </button>
        ) : (
          <kbd
            style={{
              fontSize: 10, color: T3, padding: "2px 6px",
              borderRadius: 5, border: `0.5px solid ${BORDER}`, flexShrink: 0,
            }}
          >
            ⌘K
          </kbd>
        )}
      </div>

      {menuOpen && (
        <div
          className="absolute flex flex-col p-1.5"
          style={{
            ...glassCard,
            bottom: 60,
            left: 0,
            minWidth: 160,
            zIndex: 60,
            animation: "fadeIn 150ms ease",
          }}
        >
          {ENGINES.map(e => (
            <button
              key={e.id}
              onClick={() => { setEngine(e.id); setMenuOpen(false); inputRef.current?.focus(); }}
              className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg transition-colors"
              style={{ fontSize: 13, color: T1 }}
              onMouseEnter={ev => { (ev.currentTarget as HTMLButtonElement).style.background = "var(--lg-hover-bg)"; }}
              onMouseLeave={ev => { (ev.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
            >
              <span>{e.label}</span>
              {engine === e.id && <Check size={14} style={{ color: accent }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
