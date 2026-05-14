import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { glassCard, accent, T1, T2, F2, BORDER } from "../utils/glass";
import { TabFolder } from "../contexts/SettingsContext";

interface Props {
  open: boolean;
  folder: TabFolder | null;
  onClose: () => void;
  onSave: (f: Omit<TabFolder, "id"> & { id?: string }) => void;
  onDelete?: (id: string) => void;
}

const EMOJIS = ["📁","📂","🗂","⭐","🔖","💼","🛠","🎓","🎮","🎬","🛍","🍔","✈️","🏠","💡","🚀","🎯","📊","🎨","🌐"];
const COLORS = ["#6c8cff","#ff9f0a","#30d158","#ffd60a","#bf5af2","#ea4c89","#f24e1e","#1da1f2","#5e6ad2","#999999"];

export function FolderEditor({ open, folder, onClose, onSave, onDelete }: Props) {
  const [label, setLabel] = useState("");
  const [emoji, setEmoji] = useState("📁");
  const [color, setColor] = useState("#6c8cff");

  useEffect(() => {
    if (folder) {
      setLabel(folder.label); setEmoji(folder.emoji); setColor(folder.color);
    } else {
      setLabel(""); setEmoji("📁"); setColor("#6c8cff");
    }
  }, [folder, open]);

  if (!open) return null;

  const submit = () => {
    if (!label.trim()) return;
    onSave({ id: folder?.id, label: label.trim(), emoji, color });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center px-4"
      style={{ zIndex: 410, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", animation: "fadeIn 200ms ease" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm p-6 flex flex-col gap-4"
        style={{ ...glassCard, animation: "scaleIn 250ms cubic-bezier(0.22,1,0.36,1)" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <span style={{ fontSize: 17, fontWeight: 600, color: T1 }}>
            {folder ? "编辑文件夹" : "新建文件夹"}
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
            className="flex items-center justify-center"
            style={{
              width: 64, height: 64, borderRadius: 18,
              background: `${color}25`,
              border: `0.5px solid ${color}55`,
              fontSize: 32,
              boxShadow: `0 4px 16px ${color}30`,
            }}
          >
            {emoji}
          </div>
        </div>

        <label className="flex flex-col gap-1.5">
          <span style={{ fontSize: 12, color: T2 }}>名称</span>
          <input
            type="text"
            value={label}
            onChange={e => setLabel(e.target.value)}
            placeholder="如：工作"
            style={{
              height: 40, padding: "0 12px", borderRadius: 12,
              background: F2,
              border: `0.5px solid ${BORDER}`,
              color: T1, fontSize: 14, outline: "none",
            }}
            autoFocus
          />
        </label>

        <div className="flex flex-col gap-1.5">
          <span style={{ fontSize: 12, color: T2 }}>图标</span>
          <div className="grid grid-cols-10 gap-1 p-2 rounded-xl" style={{ background: F2 }}>
            {EMOJIS.map(e => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                style={{
                  fontSize: 18, padding: 4, borderRadius: 8,
                  background: emoji === e ? "rgba(108,140,255,0.25)" : "transparent",
                }}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

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
                  transform: color === c ? "scale(1.15)" : "scale(1)",
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-2 mt-2">
          {folder && onDelete && (
            <button
              onClick={() => { onDelete(folder.id); onClose(); }}
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
            style={{ height: 40, padding: "0 18px", borderRadius: 20, background: F2, color: T1, fontSize: 14, fontWeight: 500 }}
          >
            取消
          </button>
          <button
            onClick={submit}
            disabled={!label.trim()}
            style={{
              height: 40, padding: "0 18px", borderRadius: 20,
              background: accent, color: "white",
              fontSize: 14, fontWeight: 500,
              opacity: label.trim() ? 1 : 0.4,
            }}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
