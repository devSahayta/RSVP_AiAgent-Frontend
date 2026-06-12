// components/ChatWindow.jsx
import { useEffect, useRef, useState } from "react";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import useAuthUser from "../hooks/useAuthUser";
import { showError } from "../utils/toast";

/* ── Avatar colours — must match ChatList ─────────────────────── */
const AVA = [
  "#B45309",
  "#0369A1",
  "#0D9488",
  "#7C3AED",
  "#B91C1C",
  "#1D4ED8",
  "#047857",
  "#BE185D",
];
const avaColor = (s) => AVA[(s || "U").charCodeAt(0) % AVA.length];

/* ── Icons ────────────────────────────────────────────────────── */
const IconSend = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path
      d="M22 2L11 13"
      stroke="#000"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M22 2L15 22L11 13L2 9L22 2Z"
      stroke="#000"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconBot = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2a2 2 0 0 1 2 2 2 2 0 0 1-2 2 2 2 0 0 1-2-2 2 2 0 0 1 2-2m8 7H4V7h16v2m-8 2c3.31 0 6 2.69 6 6H6c0-3.31 2.69-6 6-6m0 2a4 4 0 0 0-4 4h8a4 4 0 0 0-4-4z" />
  </svg>
);

const IconBack = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path
      d="M15 18l-6-6 6-6"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* ── Block reason text ────────────────────────────────────────── */
const BLOCK_MSG = {
  NO_USER_REPLY: "User hasn't replied yet — send a template to start.",
  WINDOW_EXPIRED: "24-hour window expired — send a template to re-engage.",
  TEMPLATE_ONLY_WAITING_FOR_USER:
    "Template sent. Waiting for the user to reply…",
};

/* ── Helpers ──────────────────────────────────────────────────── */
const parseTs = (ts) => {
  try {
    return ts ? new Date(ts) : new Date();
  } catch {
    return new Date();
  }
};
const fmtTime = (ts) =>
  parseTs(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const startDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

const fmtDateLabel = (date) => {
  const today = startDay(new Date());
  const diff = Math.round((today - startDay(date)) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7)
    return startDay(date).toLocaleDateString([], { weekday: "long" });
  return startDay(date).toLocaleDateString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const sortMsgs = (arr) =>
  [...(arr || [])]
    .map((m) => ({
      ...m,
      created_at: m.created_at || new Date().toISOString(),
    }))
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

const getName = (info) =>
  info?.full_name?.trim() ||
  info?.person_name?.trim() ||
  info?.name?.trim() ||
  info?.phone_number?.trim() ||
  "User";

const parseBtns = (b) => {
  if (!b) return [];
  try {
    return typeof b === "string" ? JSON.parse(b) : b;
  } catch {
    return [];
  }
};

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function ChatWindow({
  chatId,
  userInfo,
  chatMode,
  setChatMode,
  onBack,
}) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [sendBlocked, setSendBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [isResuming, setIsResuming] = useState(false);

  const endRef = useRef(null);
  const lastTsRef = useRef(null);
  const { getToken } = useKindeAuth();

  /* ── Scroll ────────────────────────────────────────────────── */
  const nearBottom = () => {
    const el = endRef.current?.parentElement;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 150;
  };
  const scrollDown = (beh = "smooth") =>
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: beh }), 60);

  /* ── Load messages ─────────────────────────────────────────── */
  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      return;
    }
    let dead = false;
    let timer;

    const load = async (init = false) => {
      try {
        const r = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/chats/${chatId}/messages`,
        );
        const d = await r.json();
        if (!d?.ok || !Array.isArray(d.messages)) return;
        const sorted = sortMsgs(d.messages);
        const lastTs = sorted.at(-1)?.created_at;
        if (!init && lastTsRef.current === lastTs) return;
        lastTsRef.current = lastTs;
        if (!dead) {
          const scroll = init || nearBottom();
          setMessages(sorted);
          if (scroll) scrollDown("auto");
        }
      } catch (e) {
        console.error("Messages:", e);
      }
    };

    load(true);
    timer = setInterval(() => load(false), 3000);
    return () => {
      dead = true;
      clearInterval(timer);
    };
  }, [chatId]);

  useEffect(() => {
    scrollDown();
  }, [messages.length]);

  /* Reset block on chat switch */
  useEffect(() => {
    setSendBlocked(false);
    setBlockReason(null);
  }, [chatId]);

  /* ── Send ──────────────────────────────────────────────────── */
  const sendMessage = async () => {
    const text = inputText.trim();
    if (!text || !chatId || isSending) return;
    try {
      setIsSending(true);
      const token = await getToken();
      const r = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/admin/chat/send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ chat_id: chatId, message: text }),
        },
      );
      const d = await r.json();
      if (!r.ok) {
        setSendBlocked(true);
        setBlockReason(d.code || null);
        showError(d.error || "Message not allowed");
        setInputText("");
        return;
      }
      setSendBlocked(false);
      setBlockReason(null);
      setMessages((p) => [
        ...p,
        {
          message_id: `t-${Date.now()}`,
          sender_type: "admin",
          message: text,
          created_at: new Date().toISOString(),
        },
      ]);
      setInputText("");
      scrollDown();
    } catch {
      showError("Failed to send");
    } finally {
      setIsSending(false);
    }
  };

  /* ── Resume AI ─────────────────────────────────────────────── */
  const resumeAI = async () => {
    if (!chatId || isResuming) return;
    try {
      setIsResuming(true);
      const token = await getToken();
      const r = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/admin/chat/resume-ai`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ chat_id: chatId }),
        },
      );
      if (r.ok) {
        setChatMode("AI");
        setSendBlocked(false);
        setBlockReason(null);
      } else showError("Failed to resume AI");
    } catch {
      showError("Failed to resume AI");
    } finally {
      setIsResuming(false);
    }
  };

  /* ── Download ──────────────────────────────────────────────── */
  const download = async (url, name = "file") => {
    try {
      const blob = await fetch(url).then((r) => r.blob());
      const a = Object.assign(document.createElement("a"), {
        href: URL.createObjectURL(blob),
        download: name,
      });
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      alert("Download failed");
    }
  };

  /* ── Helpers ───────────────────────────────────────────────── */
  const isSent = (s) => s === "admin" || s === "ai";
  const isSystem = (s) => s === "system";
  const lbl = (s) =>
    s === "admin" ? "Admin" : s === "ai" ? "AI" : s === "user" ? "User" : null;

  const name = getName(userInfo);
  const mode = chatMode || "AI";
  const color = avaColor(name);

  /* ═══════════════════════════════════════════════════════════ */
  return (
    <div className="wa-chat-window">
      {/* HEADER */}
      <div className="wa-chat-header">
        {onBack && (
          <button
            className="wa-back-btn"
            onClick={onBack}
            aria-label="Back to chats"
          >
            <IconBack />
          </button>
        )}

        <div
          className="wa-header-ava"
          style={{ background: color }}
          aria-hidden="true"
        >
          {name.charAt(0).toUpperCase()}
        </div>

        <div className="wa-header-info">
          <div className="wa-header-name">{name}</div>
          <div className="wa-header-sub">
            {userInfo?.phone_number && (
              <span className="wa-header-phone">{userInfo.phone_number}</span>
            )}
            <span
              className={`wa-mode-badge ${mode === "MANUAL" ? "manual" : "ai"}`}
            >
              <span className="wa-mode-dot" />
              {mode === "MANUAL" ? "Manual" : "AI active"}
            </span>
          </div>
        </div>

        <div className="wa-header-actions">
          {mode === "MANUAL" ? (
            <button
              className="wa-hdr-btn ok"
              onClick={resumeAI}
              disabled={isResuming}
            >
              <IconBot />
              <span>{isResuming ? "Resuming…" : "Resume AI"}</span>
            </button>
          ) : (
            <button className="wa-hdr-btn" disabled>
              <IconBot />
              <span>AI handling</span>
            </button>
          )}
        </div>
      </div>

      {/* MESSAGES */}
      <div className="wa-messages">
        {messages.map((msg, i) => {
          const sent = isSent(msg.sender_type);
          const sys = isSystem(msg.sender_type);
          const cur = parseTs(msg.created_at);
          const prev = messages[i - 1];
          const showSep =
            !prev ||
            startDay(cur).getTime() !==
              startDay(parseTs(prev.created_at)).getTime();
          const sender = lbl(msg.sender_type);

          return (
            <div key={msg.message_id || i} className="wa-msg-row">
              {showSep && (
                <div className="wa-date-sep">{fmtDateLabel(cur)}</div>
              )}

              <div
                className={[
                  "wa-bubble",
                  sys ? "sys" : "",
                  sent ? "sent" : "",
                  !sent && !sys ? "recv" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {/* Image */}
                {msg.message_type === "image" && msg.media_path ? (
                  <div className="wa-img-wrap">
                    <img
                      src={msg.media_path}
                      alt="Image"
                      className="wa-chat-img"
                      onClick={() => window.open(msg.media_path, "_blank")}
                    />
                    <div
                      className="wa-img-dl"
                      title="Download"
                      onClick={() =>
                        download(msg.media_path, `img-${msg.message_id}.jpg`)
                      }
                    >
                      ↓
                    </div>
                  </div>
                ) : /* Document */
                msg.message_type === "document" && msg.media_path ? (
                  <div
                    className="wa-doc-wrap"
                    onClick={() => window.open(msg.media_path, "_blank")}
                  >
                    <div className="wa-doc-ico">📄</div>
                    <div className="wa-doc-info">
                      <div className="wa-doc-name">Document</div>
                      <div className="wa-doc-sub">Tap to view</div>
                    </div>
                    <div
                      className="wa-doc-dl"
                      onClick={(e) => {
                        e.stopPropagation();
                        download(msg.media_path, `doc-${msg.message_id}.pdf`);
                      }}
                    >
                      ↓
                    </div>
                  </div>
                ) : (
                  /* Text */
                  <div className="wa-bubble-text">{msg.message}</div>
                )}

                {/* Template buttons */}
                {msg.message_type === "template" &&
                  parseBtns(msg.buttons).length > 0 && (
                    <div className="wa-tpl-btns">
                      {parseBtns(msg.buttons).map((btn, j) => (
                        <button key={j} className="wa-tpl-btn">
                          {btn.text}
                        </button>
                      ))}
                    </div>
                  )}

                {/* Meta */}
                {!sys && (
                  <div
                    className={`wa-bubble-meta ${!sent ? "split" : "right"}`}
                  >
                    {sender && <span className="wa-sender-lbl">{sender}</span>}
                    <span>{fmtTime(msg.created_at)}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* INPUT */}
      <div className="wa-input-bar">
        {sendBlocked && blockReason ? (
          <div className="wa-block-notice" role="alert">
            ⚠ {BLOCK_MSG[blockReason] || "Send a template to continue."}
          </div>
        ) : (
          <input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Type a message…"
            autoComplete="off"
            aria-label="Type a message"
          />
        )}

        <button
          className="wa-send-btn"
          onClick={sendMessage}
          disabled={isSending || sendBlocked}
          aria-label="Send message"
        >
          {isSending ? (
            <span
              style={{
                color: "#000",
                fontSize: 14,
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              …
            </span>
          ) : (
            <IconSend />
          )}
        </button>
      </div>
    </div>
  );
}
