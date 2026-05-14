import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { glassDock, T2, accent } from "../utils/glass";

interface Props {
  hidden: boolean;
  onToggle: () => void;
}

export function HideBookmarksButton({ hidden, onToggle }: Props) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onToggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex items-center justify-center shrink-0"
      style={{
        ...glassDock,
        width: 48, height: 48, borderRadius: 24,
        color: hidden ? accent : T2,
        transition: "transform 200ms cubic-bezier(0.22,1,0.36,1)",
        transform: hovered ? "scale(1.06)" : "scale(1)",
      }}
      aria-label={hidden ? "显示书签" : "隐藏书签"}
      aria-pressed={hidden}
    >
      {hidden ? <EyeOff size={20} /> : <Eye size={20} />}
    </button>
  );
}
