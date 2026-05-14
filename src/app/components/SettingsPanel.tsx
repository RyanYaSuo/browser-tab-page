import { useState, useEffect, useRef } from "react";
import { Settings as SettingsIcon, Github, Check, X, RefreshCw, ExternalLink, Cloud, CheckCircle2, Copy, Link } from "lucide-react";
import { glassDock, glassCard, glassWhite, accent, T1, T2, T3, T4, F2, BORDER, green } from "../utils/glass";
import { useSettings } from "../contexts/SettingsContext";

export function SettingsButton() {
  const { syncStatus } = useSettings();
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  const hasIssue = syncStatus === "error";
  const isSyncing = syncStatus === "connecting" || syncStatus === "saving";
  const isReady = syncStatus === "saved";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="flex items-center justify-center shrink-0"
        style={{
          ...glassDock,
          width: 48, height: 48, borderRadius: 24,
          color: isReady ? green : hasIssue ? "#ff453a" : T2,
          transition: "transform 200ms cubic-bezier(0.22,1,0.36,1)",
          transform: hovered ? "scale(1.06)" : "scale(1)",
        }}
        aria-label="设置"
      >
        {isSyncing ? (
          <RefreshCw size={18} style={{ animation: "spin 1s linear infinite" }} />
        ) : (
          <SettingsIcon size={20} />
        )}
      </button>

      <SettingsModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

type Step = 1 | 2 | 3 | "done";

function StepIndicator({ current, step, label }: { current: Step; step: Step; label: string }) {
  const order = { 1: 1, 2: 2, 3: 3, done: 4 };
  const isActive = order[current] >= order[step];
  const isCurrent = current === step;

  return (
    <div className="flex items-center gap-2.5">
      <div
        style={{
          width: 24, height: 24, borderRadius: 12, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: isCurrent ? accent : isActive ? green : F2,
          color: isActive ? "white" : T3,
          transition: "all 300ms ease",
          fontSize: 11, fontWeight: 600,
        }}
      >
        {isActive && step !== current ? <Check size={12} strokeWidth={3} /> : step}
      </div>
      <span style={{ fontSize: 13, color: isCurrent ? T1 : isActive ? T2 : T3, fontWeight: isCurrent ? 600 : 400 }}>
        {label}
      </span>
    </div>
  );
}

function SettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const {
    githubToken, setGithubToken,
    gistId, setGistId,
    syncStatus, syncError,
    testConnection, createGist, connectToGist,
  } = useSettings();

  const [tokenDraft, setTokenDraft] = useState(githubToken);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"ok" | "fail" | null>(null);
  const [creating, setCreating] = useState(false);
  const [gistDraft, setGistDraft] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [connectResult, setConnectResult] = useState<"ok" | "fail" | null>(null);
  const [copied, setCopied] = useState(false);
  const [tokenCopied, setTokenCopied] = useState(false);

  const hasToken = !!githubToken && testResult === "ok";
  const hasGist = !!gistId;
  const step: Step = hasGist ? "done" : hasToken ? 2 : 1;
  const synced = syncStatus === "saved";

  useEffect(() => {
    if (open) {
      setTokenDraft(githubToken);
      setTestResult(null);
      setGistDraft("");
      setConnectResult(null);
      setCopied(false);
    }
  }, [open, githubToken]);

  const handleTest = async () => {
    const token = tokenDraft.trim();
    if (!token) return;
    setTesting(true);
    setTestResult(null);
    const ok = await testConnection(token);
    if (ok) setGithubToken(token);
    setTestResult(ok ? "ok" : "fail");
    setTesting(false);
  };

  const handleCreate = async () => {
    setCreating(true);
    const id = await createGist();
    setCreating(false);
  };

  const handleConnect = async () => {
    const id = gistDraft.trim();
    if (!id) return;
    setConnecting(true);
    setConnectResult(null);
    const ok = await connectToGist(id);
    setConnectResult(ok ? "ok" : "fail");
    setConnecting(false);
  };

  const handleCopyToken = async () => {
    if (!githubToken) return;
    try {
      await navigator.clipboard.writeText(githubToken);
      setTokenCopied(true);
      setTimeout(() => setTokenCopied(false), 2000);
    } catch {}
  };

  const handleCopyGistId = async () => {
    if (!gistId) return;
    try {
      await navigator.clipboard.writeText(gistId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const syncLabel = () => {
    switch (syncStatus) {
      case "idle": return synced ? "已同步" : "";
      case "connecting": return "正在连接 GitHub…";
      case "saving": return "正在保存到云端…";
      case "saved": return "已同步";
      case "error": return `同步出错: ${syncError || "未知错误"}`;
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center px-4"
      style={{ zIndex: 400, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", animation: "fadeIn 200ms ease" }}
      onClick={onClose}
    >
      <div
        className="w-full flex flex-col"
        style={{ maxWidth: 440, ...glassCard, animation: "scaleIn 250ms cubic-bezier(0.22,1,0.36,1)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <span style={{ fontSize: 17, fontWeight: 600, color: T1 }}>设置</span>
          <button
            onClick={onClose}
            className="flex items-center justify-center"
            style={{ width: 28, height: 28, borderRadius: 14, background: F2, color: T2 }}
            aria-label="关闭"
          >
            <X size={14} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-0 px-6 pb-4" style={{ borderBottom: `0.5px solid ${BORDER}` }}>
          <StepIndicator current={step} step={1} label="连接 GitHub" />
          <div style={{ flex: 1, height: 1, background: step === "done" ? green : F2, margin: "0 8px" }} />
          <StepIndicator current={step} step={2} label="创建 Gist" />
          <div style={{ flex: 1, height: 1, background: step === "done" ? green : F2, margin: "0 8px" }} />
          <StepIndicator current={step} step={3} label="自动同步" />
        </div>

        {/* Content */}
        <div className="px-6 py-4 flex flex-col gap-4">

          {/* ─── Step 1: Token ─── */}
          <div style={{ opacity: step === 1 || step === "done" ? 1 : 0.5, transition: "opacity 300ms" }}>
            <div className="flex items-center gap-2 mb-2.5">
              <Github size={16} style={{ color: T2 }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: T1 }}>GitHub Token</span>
              {testResult === "ok" && <Check size={14} style={{ color: green }} />}
            </div>

            {!tokenDraft && testResult === null && (
              <div
                className="flex flex-col gap-3 mb-3"
                style={{ padding: 14, borderRadius: 14, background: F2, fontSize: 12, color: T2, lineHeight: 1.5 }}
              >
                <div style={{ fontWeight: 500, color: T1 }}>还没有 Token？跟着两步完成：</div>
                <div className="flex items-start gap-3">
                  <div style={{
                    width: 22, height: 22, borderRadius: 11, background: accent, color: "white", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600,
                  }}>1</div>
                  <div>
                    <a
                      href="https://github.com/settings/tokens/new?description=browser-tab-sync&scopes=gist"
                      target="_blank" rel="noopener noreferrer"
                      style={{ color: accent, textDecoration: "none", fontWeight: 500 }}
                    >
                      去 GitHub 创建 Token <ExternalLink size={11} style={{ display: "inline", verticalAlign: "middle" }} />
                    </a>
                    <div style={{ marginTop: 2 }}>勾选 <strong>gist</strong> 权限，生成后复制 token</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div style={{
                    width: 22, height: 22, borderRadius: 11, background: accent, color: "white", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600,
                  }}>2</div>
                  <div>粘贴 token 到下方输入框，点击"验证"</div>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="password"
                value={tokenDraft}
                onChange={e => { setTokenDraft(e.target.value); if (testResult) setTestResult(null); }}
                placeholder="ghp_xxxxxxxxxxxx"
                disabled={testResult === "ok"}
                style={{
                  flex: 1, height: 40, padding: "0 12px", borderRadius: 12,
                  background: testResult === "ok" ? `${green}15` : F2,
                  border: `0.5px solid ${testResult === "ok" ? green : BORDER}`,
                  color: T1, fontSize: 13, outline: "none",
                  fontFamily: "monospace",
                }}
              />
              {testResult === "ok" ? (
                <div className="flex gap-1">
                  <div
                    style={{
                      height: 40, padding: "0 16px", borderRadius: 12, display: "flex", alignItems: "center", gap: 4,
                      background: `${green}15`, color: green, fontSize: 13, fontWeight: 500, whiteSpace: "nowrap",
                    }}
                  >
                    <Check size={14} /> 已验证
                  </div>
                  <button
                    onClick={handleCopyToken}
                    title="复制 Token"
                    style={{
                      width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
                      background: tokenCopied ? `${green}15` : "transparent", color: tokenCopied ? green : T2, fontSize: 13, fontWeight: 500, border: "none", cursor: "pointer",
                    }}
                  >
                    {tokenCopied ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                  <button
                    onClick={() => { setTokenDraft(""); setGithubToken(""); setTestResult(null); }}
                    title="删除 Token"
                    style={{
                      width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
                      background: "rgba(255,69,58,0.12)", color: "#ff453a", fontSize: 13, fontWeight: 500, border: "none", cursor: "pointer",
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleTest}
                  disabled={!tokenDraft.trim() || testing}
                  style={{
                    height: 40, padding: "0 16px", borderRadius: 12,
                    background: accent, color: "white",
                    fontSize: 13, fontWeight: 500, whiteSpace: "nowrap",
                    opacity: !tokenDraft.trim() || testing ? 0.5 : 1,
                  }}
                >
                  {testing ? "验证中…" : "验证"}
                </button>
              )}
            </div>

            {testResult === "fail" && (
              <div className="flex flex-col gap-1 mt-2">
                <span style={{ fontSize: 11, color: "#ff453a" }}>Token 无效或没有 gist 权限，请重新创建</span>
                <a
                  href="https://github.com/settings/tokens/new?description=browser-tab-sync&scopes=gist"
                  target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 11, color: accent, textDecoration: "none" }}
                >
                  去 GitHub 创建 Token <ExternalLink size={10} style={{ display: "inline", verticalAlign: "middle" }} />
                </a>
              </div>
            )}

            {step === 1 && testResult !== "ok" && (
              <div style={{ fontSize: 11, color: T3, marginTop: 6, lineHeight: 1.4 }}>
                需要先在 GitHub 创建一个仅 <strong>gist</strong> 权限的 Token，粘贴到上面后验证
              </div>
            )}
          </div>

          {/* ─── Step 2: Gist ─── */}
          {(typeof step === "number" ? step >= 2 : step === "done") && (
            <div style={{ borderTop: `0.5px solid ${BORDER}`, paddingTop: 16 }}>
              <div className="flex items-center gap-2 mb-2.5">
                <Cloud size={16} style={{ color: T2 }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: T1 }}>云端存储</span>
                {hasGist && <Check size={14} style={{ color: green }} />}
              </div>

              {hasGist ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2" style={{ padding: "10px 12px", borderRadius: 12, background: `${green}10` }}>
                    <CheckCircle2 size={16} style={{ color: green, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: T1 }}>
                      已创建私有 Gist
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: T2 }}>
                    此后的书签和壁纸改动将自动同步到云端
                  </div>
                  {/* Gist ID display */}
                  <div
                    className="flex items-center gap-2"
                    style={{
                      padding: "8px 12px", borderRadius: 10,
                      background: F2, fontSize: 12, color: T3,
                    }}
                  >
                    <span style={{ flex: 1, fontFamily: "monospace", fontSize: 11, color: T2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      Gist ID: {gistId}
                    </span>
                    <button
                      onClick={handleCopyGistId}
                      style={{
                        flexShrink: 0, padding: "4px 8px", borderRadius: 6,
                        background: copied ? `${green}15` : "transparent",
                        color: copied ? green : T2, fontSize: 11,
                        display: "flex", alignItems: "center", gap: 3,
                      }}
                      aria-label="复制 Gist ID"
                    >
                      <Copy size={12} />
                      {copied ? "已复制" : "复制"}
                    </button>
                  </div>
                  <div style={{ fontSize: 11, color: T3, lineHeight: 1.4 }}>
                    在其他设备上粘贴此 Gist ID 即可同步同一份数据
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleCreate}
                    disabled={creating}
                    style={{
                      height: 44, padding: "0 20px", borderRadius: 14,
                      background: accent, color: "white",
                      fontSize: 14, fontWeight: 500,
                      opacity: creating ? 0.5 : 1,
                    }}
                  >
                    {creating ? "正在创建…" : "创建新 Gist 并启用同步"}
                  </button>

                  {/* Divider */}
                  <div className="flex items-center gap-2">
                    <div style={{ flex: 1, height: "0.5px", background: BORDER }} />
                    <span style={{ fontSize: 11, color: T3 }}>或者</span>
                    <div style={{ flex: 1, height: "0.5px", background: BORDER }} />
                  </div>

                  {/* Connect to existing Gist */}
                  <div className="flex flex-col gap-2">
                    <span style={{ fontSize: 12, color: T2 }}>连接到已有 Gist（跨设备同步）</span>
                    <div className="flex gap-2">
                      <div
                        className="flex items-center gap-2 px-3 flex-1"
                        style={{
                          height: 40, borderRadius: 12,
                          background: connectResult === "ok" ? `${green}10` : F2,
                          border: `0.5px solid ${connectResult === "ok" ? green : connectResult === "fail" ? "#ff453a" : BORDER}`,
                        }}
                      >
                        <Link size={14} style={{ color: T3, flexShrink: 0 }} />
                        <input
                          type="text"
                          value={gistDraft}
                          onChange={e => { setGistDraft(e.target.value); if (connectResult) setConnectResult(null); }}
                          onKeyDown={e => e.key === "Enter" && handleConnect()}
                          placeholder="粘贴其他设备的 Gist ID…"
                          className="flex-1 bg-transparent outline-none"
                          style={{ fontSize: 13, color: T1, fontFamily: "monospace" }}
                        />
                      </div>
                      <button
                        onClick={handleConnect}
                        disabled={!gistDraft.trim() || connecting}
                        style={{
                          height: 40, padding: "0 18px", borderRadius: 12,
                          background: accent, color: "white",
                          fontSize: 13, fontWeight: 500,
                          opacity: !gistDraft.trim() || connecting ? 0.5 : 1,
                        }}
                      >
                        {connecting ? "连接中…" : "连接"}
                      </button>
                    </div>
                    {connectResult === "ok" && (
                      <span style={{ fontSize: 11, color: green }}>连接成功，已拉取云端书签</span>
                    )}
                    {connectResult === "fail" && (
                      <span style={{ fontSize: 11, color: "#ff453a" }}>Gist ID 无效或数据读取失败，请检查后重试</span>
                    )}
                    <div style={{ fontSize: 11, color: T3, lineHeight: 1.4 }}>
                      从已有设备复制 Gist ID，粘贴到这里即可同步同一份书签数据
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── Step 3 / Done: Sync Status ─── */}
          {(hasGist || synced) && (
            <div style={{ borderTop: `0.5px solid ${BORDER}`, paddingTop: 16 }}>
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw size={14} style={{ color: T2 }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: T1 }}>同步状态</span>
              </div>

              <div className="flex items-center gap-2" style={{ padding: "10px 12px", borderRadius: 12, background: F2 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: 4, flexShrink: 0,
                  background: syncStatus === "saved" ? green : syncStatus === "error" ? "#ff453a" : accent,
                  animation: syncStatus === "saving" || syncStatus === "connecting" ? "pulse 1s ease infinite" : "none",
                }} />
                <span style={{ fontSize: 13, color: T1, flex: 1 }}>
                  {syncLabel() || "等待变更…"}
                </span>
                {synced && <Check size={14} style={{ color: green }} />}
              </div>

              {step === "done" && (
                <div style={{ fontSize: 11, color: T3, marginTop: 6, lineHeight: 1.4 }}>
                  你的数据已自动同步到 GitHub Gist，所有设备共享同一份书签
                </div>
              )}
            </div>
          )}

          {/* ─── Reset: Clear cloud sync ─── */}
          {(hasToken || hasGist) && (
            <div style={{ borderTop: `0.5px solid ${BORDER}`, paddingTop: 16 }}>
              <button
                onClick={() => {
                  setGithubToken("");
                  setGistId("");
                  setTokenDraft("");
                  setTestResult(null);
                }}
                style={{
                  width: "100%", height: 44, borderRadius: 14,
                  background: "rgba(255,69,58,0.12)", color: "#ff453a",
                  fontSize: 14, fontWeight: 500, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}
              >
                清除云端储存（Token + Gist）
              </button>
              <div style={{ fontSize: 11, color: T3, marginTop: 6, lineHeight: 1.4 }}>
                清除后将停止同步，本地数据不会丢失
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ fontSize: 10, color: T4, lineHeight: 1.5, borderTop: `0.5px solid ${BORDER}`, padding: "10px 24px" }}>
          Token 仅存储在浏览器本地，数据以私有 Gist 形式存于你的 GitHub 账号
        </div>
      </div>
    </div>
  );
}
