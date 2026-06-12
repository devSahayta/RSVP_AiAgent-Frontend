// components/ChatList.jsx
import { useEffect, useState, useRef, useCallback } from "react";

const LIMIT = 50;

/* ── Avatar colours (warm + cool contrast) ───────────────────── */
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

/* ── Time ─────────────────────────────────────────────────────── */
const fmtTime = (ts) => {
  if (!ts) return "";
  const d = new Date(ts);
  const now = new Date();
  const yest = new Date(now);
  yest.setDate(now.getDate() - 1);
  if (d.toDateString() === now.toDateString())
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (d.toDateString() === yest.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { day: "2-digit", month: "short" });
};

/* ── Unread (localStorage) ────────────────────────────────────── */
const seenKey = (id) => `sk2_${id}`;
const isUnread = (c) => {
  if (!c.last_message || !c.last_message_at) return false;
  const seen = localStorage.getItem(seenKey(c.chat_id));
  return seen ? new Date(c.last_message_at) > new Date(seen) : true;
};

/* ── Merge helpers ────────────────────────────────────────────── */
const mergeChats = (prev, next) => {
  const m = new Map(prev.map((c) => [c.chat_id, c]));
  next.forEach((c) => m.set(c.chat_id, c));
  return [...m.values()].sort(
    (a, b) =>
      new Date(b.last_message_at || 0) - new Date(a.last_message_at || 0),
  );
};

/* ── Skeleton ─────────────────────────────────────────────────── */
function Skeletons() {
  return (
    <>
      {[68, 52, 72, 45, 60, 55].map((w, i) => (
        <div key={i} className="wa-sk">
          <div className="wa-sk-ava" />
          <div className="wa-sk-lines">
            <div className="wa-sk-line" style={{ width: `${w}%` }} />
            <div className="wa-sk-line s" />
          </div>
        </div>
      ))}
    </>
  );
}

/* ═════════════════════════════════════════════════════════════════
   COMPONENT
═════════════════════════════════════════════════════════════════ */
export default function ChatList({ userId, onSelectChat, activeChatId }) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [morePending, setMorePending] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");

  const offsetRef = useRef(0);
  const sentinel = useRef(null);
  const observer = useRef(null);
  const pollRef = useRef(null);

  /* Derived counts */
  const totalCt = chats.length;
  const unreadCt = chats.filter(isUnread).length;
  const manualCt = chats.filter((c) => c.mode === "MANUAL").length;

  /* ── Fetch ───────────────────────────────────────────────── */
  const fetchChats = useCallback(
    async (offset = 0, append = false) => {
      if (!userId) return;
      append ? setMorePending(true) : setLoading(true);
      try {
        const r = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/chats?user_id=${userId}&limit=${LIMIT}&offset=${offset}`,
        );
        const d = await r.json();
        if (!d?.ok) return;
        const inc = d.chats || [];
        setChats((p) => (append ? mergeChats(p, inc) : inc));
        offsetRef.current = offset + inc.length;
        setHasMore(inc.length === LIMIT);
      } catch (e) {
        console.error("ChatList:", e);
      } finally {
        setLoading(false);
        setMorePending(false);
      }
    },
    [userId],
  );

  useEffect(() => {
    if (!userId) return;
    offsetRef.current = 0;
    fetchChats(0, false);
  }, [userId, fetchChats]);

  /* ── Poll ────────────────────────────────────────────────── */
  useEffect(() => {
    if (!userId) return;
    pollRef.current = setInterval(async () => {
      try {
        const r = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/chats?user_id=${userId}&limit=${LIMIT}&offset=0`,
        );
        const d = await r.json();
        if (d?.ok) setChats((p) => mergeChats(p, d.chats || []));
      } catch {}
    }, 7000);
    return () => clearInterval(pollRef.current);
  }, [userId]);

  /* ── Infinite scroll ─────────────────────────────────────── */
  useEffect(() => {
    observer.current?.disconnect();
    observer.current = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && hasMore && !morePending && !loading)
          fetchChats(offsetRef.current, true);
      },
      { threshold: 0.1 },
    );
    if (sentinel.current) observer.current.observe(sentinel.current);
    return () => observer.current?.disconnect();
  }, [hasMore, morePending, loading, fetchChats]);

  /* ── Select ──────────────────────────────────────────────── */
  const handleSelect = (chat) => {
    localStorage.setItem(seenKey(chat.chat_id), new Date().toISOString());
    onSelectChat(chat.chat_id, chat);
  };

  /* ── Filter ──────────────────────────────────────────────── */
  const q = search.toLowerCase();
  const filtered = chats.filter((c) => {
    const mQ =
      !q ||
      (c.person_name || "").toLowerCase().includes(q) ||
      (c.phone_number || "").includes(q) ||
      (c.last_message || "").toLowerCase().includes(q);
    const mT =
      tab === "all" ||
      (tab === "unread" && isUnread(c)) ||
      (tab === "manual" && c.mode === "MANUAL");
    return mQ && mT;
  });

  /* ── Tab badge ───────────────────────────────────────────── */
  const Num = ({ n, hot }) => (
    <span className={`wa-tab-n${hot ? " hot" : ""}`}>
      {n > 999 ? "999+" : n}
    </span>
  );

  /* ── Render ──────────────────────────────────────────────── */
  return (
    <>
      {/* Top: search + tabs */}
      <div className="wa-sidebar-top">
        <div className="wa-search-row">
          <span className="wa-search-ico" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle
                cx="6.5"
                cy="6.5"
                r="5"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <path
                d="M10.5 10.5L14 14"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <input
            className="wa-search-input"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations…"
            aria-label="Search conversations"
          />
          {search && (
            <button
              className="wa-search-clear"
              onClick={() => setSearch("")}
              aria-label="Clear"
            >
              ✕
            </button>
          )}
        </div>

        <div className="wa-tabs" role="tablist">
          {[
            { id: "all", label: "All", n: totalCt, hot: false },
            { id: "unread", label: "Unread", n: unreadCt, hot: unreadCt > 0 },
            { id: "manual", label: "Manual", n: manualCt, hot: manualCt > 0 },
          ].map(({ id, label, n, hot }) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              className={`wa-tab${tab === id ? " active" : ""}`}
              onClick={() => setTab(id)}
            >
              {label} <Num n={n} hot={hot} />
            </button>
          ))}
        </div>
      </div>

      <div className="wa-sidebar-divider" />

      {/* Chat list */}
      <div className="wa-chatlist-body" role="list" aria-label="Conversations">
        {loading ? (
          <Skeletons />
        ) : filtered.length === 0 ? (
          <div className="wa-list-empty">
            <div className="wa-list-empty-ico">
              {search ? "🔍" : tab === "unread" ? "✅" : "💬"}
            </div>
            <span>
              {search
                ? `No results for "${search}"`
                : tab === "unread"
                  ? "You're all caught up"
                  : tab === "manual"
                    ? "No manual chats right now"
                    : "No conversations yet"}
            </span>
          </div>
        ) : (
          filtered.map((chat) => {
            const unread = isUnread(chat);
            const active = chat.chat_id === activeChatId;
            const initial = (chat.person_name || "U").charAt(0).toUpperCase();
            const color = avaColor(chat.person_name || chat.phone_number || "");

            return (
              <div
                key={chat.chat_id}
                role="listitem"
                className={[
                  "wa-item",
                  active ? "active" : "",
                  unread ? "unread" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => handleSelect(chat)}
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && handleSelect(chat)}
              >
                <div
                  className="wa-ava"
                  style={{ background: color }}
                  aria-hidden="true"
                >
                  {initial}
                  <div
                    className={`wa-pip ${chat.mode === "MANUAL" ? "manual" : "ai"}`}
                    title={chat.mode === "MANUAL" ? "Manual mode" : "AI active"}
                  />
                </div>

                <div className="wa-item-body">
                  <div className="wa-item-row1">
                    <span className="wa-item-name">
                      {chat.person_name || chat.phone_number || "Unknown"}
                    </span>
                    <span className="wa-item-time">
                      {fmtTime(chat.last_message_at)}
                    </span>
                  </div>
                  <div className="wa-item-row2">
                    <span className="wa-item-preview">
                      {chat.last_message || "No messages yet"}
                    </span>
                    {unread && (
                      <span
                        className="wa-unread-dot"
                        aria-label="Unread message"
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        <div ref={sentinel} className="wa-sentinel" aria-hidden="true" />
        {morePending && <div className="wa-load-more">Loading more…</div>}
      </div>
    </>
  );
}
