/**
 * SutrakAssistant.jsx — Production Ready
 *
 * Full-height side panel (30% desktop / 100% mobile) with draggable trigger.
 * Mount once in MainLayout.jsx inside auth-protected layout:
 *
 *   import SutrakAssistant from "./components/SutrakAssistant/SutrakAssistant";
 *   {isAuthenticated && !hideNavBar && <SutrakAssistant />}
 *
 * Requires: react-router-dom, @kinde-oss/kinde-auth-react
 */

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const QUICK_ACTIONS = [
  {
    icon: "calendar",
    label: "Create event",
    prompt: "I want to create a new event",
  },
  {
    icon: "robot",
    label: "Create agent",
    prompt: "I want to create a new agent",
  },
  { icon: "users", label: "My events", prompt: "Show me all my events" },
  {
    icon: "doc",
    label: "Create template",
    prompt: "I want to create a new WhatsApp template",
  },
  {
    icon: "brand-whatsapp",
    label: "Send template",
    prompt: "I want to send a WhatsApp template to my guests",
  },
];

const FILE_TYPES = [
  {
    ext: "csv",
    color: "#6ee7b7",
    bg: "#0b2218",
    label: "CSV",
    sub: "Guest list",
  },
  {
    ext: "xlsx",
    color: "#4ade80",
    bg: "#081c0e",
    label: "Excel",
    sub: "Spreadsheet",
  },
  {
    ext: "docx",
    color: "#60a5fa",
    bg: "#0a1628",
    label: "Word",
    sub: "Document",
  },
  { ext: "pdf", color: "#f87171", bg: "#280a0a", label: "PDF", sub: "Any PDF" },
  {
    ext: "jpg",
    color: "#f472b6",
    bg: "#280a1a",
    label: "Image",
    sub: "JPG / PNG",
  },
  {
    ext: "mp4",
    color: "#c084fc",
    bg: "#1a0a28",
    label: "Video",
    sub: "MP4 / MOV",
  },
];

const ACCEPTED =
  ".csv,.xlsx,.xls,.doc,.docx,.pdf,.txt,.jpg,.jpeg,.png,.gif,.webp,.mp4,.mov,.avi,.mkv,.webm";

// Meta's WhatsApp template media limits.
const MAX_FILE_SIZE = {
  image: 5 * 1024 * 1024,
  video: 16 * 1024 * 1024,
  document: 40 * 1024 * 1024,
};

function getFileCategory(name) {
  const ext = name.split(".").pop().toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "image";
  if (["mp4", "mov", "avi", "mkv", "webm"].includes(ext)) return "video";
  return "document";
}

// ─── Icon ────────────────────────────────────────────────────────────────────
const ICON_PATHS = {
  calendar:
    "M8 2v3M16 2v3M3.5 9.09h17M21 8.5V17c0 3-1.5 4-4 4H7c-2.5 0-4-1-4-4V8.5c0-3 1.5-4 4-4h10c2.5 0 4 1 4 4z",
  robot:
    "M12 8V4M8.56 3.69a4 4 0 00-2.87 2.86M15.44 3.69a4 4 0 012.87 2.86M3 14v-2a9 9 0 0118 0v2M3 14a2 2 0 002 2h14a2 2 0 002-2v-1a9 9 0 00-18 0v1zM9 17v1a3 3 0 006 0v-1M9 12h.01M15 12h.01",
  users:
    "M16 11c1.66 0 3-1.34 3-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z",
  "brand-whatsapp":
    "M3 21l1.65-3.8a9 9 0 113.4 2.9L3 21M9 10c0 .55.45 1 1 1h.01M12 10c0 .55.45 1 1 1h.01M15 10c0 .55.45 1 1 1h.01",
  send: "M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z",
  plus: "M12 5v14M5 12h14",
  x: "M18 6L6 18M6 6l12 12",
  sparkles:
    "M9.937 15.5A2 2 0 008.5 14.063l-6.135-1.582a.5.5 0 010-.962L8.5 9.936A2 2 0 009.937 8.5l1.582-6.135a.5.5 0 01.963 0L14.063 8.5A2 2 0 0015.5 9.937l6.135 1.581a.5.5 0 010 .963L15.5 14.063a2 2 0 00-1.437 1.437l-1.582 6.135a.5.5 0 01-.963 0z",
  refresh:
    "M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15",
  check: "M20 6L9 17l-5-5",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6z",
  list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  dashboard: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  warning:
    "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01",
  csv: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
  image:
    "M21 15a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2zM8.5 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM21 15l-5-5L5 15",
  video:
    "M15 10l4.553-2.276A1 1 0 0121 8.724v6.552a1 1 0 01-1.447.894L15 14zM3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z",
  doc: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M9 13h6M9 17h4",
  arrow_right: "M5 12h14M12 5l7 7-7 7",
};

function Icon({ name, size = 16, color = "currentColor", style = {} }) {
  const d = ICON_PATHS[name] || ICON_PATHS.sparkles;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0, display: "block", ...style }}
    >
      {d
        .split("M")
        .filter(Boolean)
        .map((seg, i) => (
          <path key={i} d={"M" + seg} />
        ))}
    </svg>
  );
}

// ─── FileTypeIcon ─────────────────────────────────────────────────────────────
function FileTypeIcon({ ext }) {
  const map = {
    csv: { name: "csv", color: "#6ee7b7" },
    xlsx: { name: "csv", color: "#4ade80" },
    xls: { name: "csv", color: "#4ade80" },
    pdf: { name: "doc", color: "#f87171" },
    doc: { name: "doc", color: "#60a5fa" },
    docx: { name: "doc", color: "#60a5fa" },
    txt: { name: "doc", color: "#888" },
    jpg: { name: "image", color: "#f472b6" },
    jpeg: { name: "image", color: "#f472b6" },
    png: { name: "image", color: "#f472b6" },
    gif: { name: "image", color: "#f472b6" },
    webp: { name: "image", color: "#f472b6" },
    mp4: { name: "video", color: "#c084fc" },
    mov: { name: "video", color: "#c084fc" },
    avi: { name: "video", color: "#c084fc" },
    mkv: { name: "video", color: "#c084fc" },
    webm: { name: "video", color: "#c084fc" },
  };
  const t = map[ext?.toLowerCase()] || { name: "doc", color: "#888" };
  return <Icon name={t.name} size={14} color={t.color} />;
}

// ─── TypingDots ───────────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div
      style={{
        display: "flex",
        gap: 4,
        padding: "4px 2px",
        alignItems: "center",
      }}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#555",
            display: "inline-block",
            animation: "sa-dot 1.4s ease-in-out infinite",
            animationDelay: `${i * 0.16}s`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Markdown renderer ────────────────────────────────────────────────────────
function inlineFormat(text) {
  const parts = [];
  const regex = /\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`/g;
  let last = 0,
    match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    if (match[1] !== undefined)
      parts.push(
        <strong key={match.index} style={{ color: "#e0e0e0", fontWeight: 600 }}>
          {match[1]}
        </strong>,
      );
    else if (match[2] !== undefined)
      parts.push(
        <em key={match.index} style={{ color: "#bbb" }}>
          {match[2]}
        </em>,
      );
    else
      parts.push(
        <code
          key={match.index}
          style={{
            background: "#1e1e1e",
            color: "#a78bfa",
            padding: "1px 5px",
            borderRadius: 4,
            fontSize: "0.88em",
            fontFamily: "monospace",
          }}
        >
          {match[3]}
        </code>,
      );
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length > 0 ? parts : text;
}

function renderMarkdown(text) {
  const lines = text.split("\n");
  const els = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === "") {
      els.push(<div key={i} style={{ height: 6 }} />);
      i++;
      continue;
    }
    // Table
    if (line.trim().startsWith("|") && line.includes("|")) {
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        const cells = lines[i]
          .split("|")
          .filter((_, ci) => ci !== 0 && ci !== lines[i].split("|").length - 1);
        if (!cells.every((c) => /^[-:\s]+$/.test(c)))
          rows.push({ cells, isHeader: rows.length === 0 });
        i++;
      }
      els.push(
        <div
          key={`t${i}`}
          style={{
            overflowX: "auto",
            margin: "8px 0",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <table
            style={{
              borderCollapse: "collapse",
              width: "100%",
              fontSize: 12.5,
            }}
          >
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} style={{ borderBottom: "1px solid #1e1e1e" }}>
                  {row.cells.map((cell, ci) => {
                    const Tag = row.isHeader ? "th" : "td";
                    return (
                      <Tag
                        key={ci}
                        style={{
                          padding: "6px 10px",
                          textAlign: "left",
                          color: row.isHeader ? "#666" : "#c0c0c0",
                          fontWeight: row.isHeader ? 600 : 400,
                          background: row.isHeader ? "#0f0f0f" : "transparent",
                          fontSize: row.isHeader ? 10.5 : 12.5,
                          textTransform: row.isHeader ? "uppercase" : "none",
                          letterSpacing: row.isHeader ? "0.06em" : 0,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {inlineFormat(cell.trim())}
                      </Tag>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }
    if (line.startsWith("## ")) {
      els.push(
        <div
          key={i}
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#e0e0e0",
            margin: "10px 0 5px",
            letterSpacing: "-0.01em",
          }}
        >
          {inlineFormat(line.slice(3))}
        </div>,
      );
      i++;
      continue;
    }
    if (line.startsWith("# ")) {
      els.push(
        <div
          key={i}
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#e8e8e8",
            margin: "10px 0 5px",
          }}
        >
          {inlineFormat(line.slice(2))}
        </div>,
      );
      i++;
      continue;
    }
    if (/^\d+[.)]\s/.test(line.trim())) {
      const num = line.trim().match(/^(\d+)/)?.[1];
      const txt = line.trim().replace(/^\d+[.)]\s+/, "");
      els.push(
        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 4 }}>
          <span
            style={{
              color: "#555",
              fontSize: 12,
              minWidth: 16,
              flexShrink: 0,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {num}.
          </span>
          <span style={{ color: "#c0c0c0", fontSize: 13.5, lineHeight: 1.6 }}>
            {inlineFormat(txt)}
          </span>
        </div>,
      );
      i++;
      continue;
    }
    if (/^[-•·*]\s/.test(line.trim())) {
      const txt = line.trim().replace(/^[-•·*]\s+/, "");
      els.push(
        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 4 }}>
          <span
            style={{
              color: "#444",
              fontSize: 15,
              lineHeight: 1.4,
              flexShrink: 0,
            }}
          >
            ·
          </span>
          <span style={{ color: "#c0c0c0", fontSize: 13.5, lineHeight: 1.6 }}>
            {inlineFormat(txt)}
          </span>
        </div>,
      );
      i++;
      continue;
    }
    els.push(
      <div
        key={i}
        style={{
          color: "#c0c0c0",
          fontSize: 13.5,
          lineHeight: 1.65,
          marginBottom: 2,
        }}
      >
        {inlineFormat(line)}
      </div>,
    );
    i++;
  }
  return els;
}

// ─── FileChip ─────────────────────────────────────────────────────────────────
function FileChip({ file, onRemove }) {
  const ext = file.name.split(".").pop().toLowerCase();
  const colorMap = {
    csv: "#6ee7b7",
    xlsx: "#4ade80",
    xls: "#4ade80",
    pdf: "#f87171",
    doc: "#60a5fa",
    docx: "#60a5fa",
    txt: "#888",
    jpg: "#f472b6",
    jpeg: "#f472b6",
    png: "#f472b6",
    gif: "#f472b6",
    webp: "#f472b6",
    mp4: "#c084fc",
    mov: "#c084fc",
    avi: "#c084fc",
    mkv: "#c084fc",
    webm: "#c084fc",
  };
  const size =
    file.size < 1024
      ? file.size + " B"
      : file.size < 1024 * 1024
        ? Math.round(file.size / 1024) + " KB"
        : (file.size / 1024 / 1024).toFixed(1) + " MB";
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: "5px 8px 5px 9px",
        borderRadius: 9,
        background: "#111",
        border: "1px solid #222",
        maxWidth: 200,
        flexShrink: 0,
      }}
    >
      <FileTypeIcon ext={ext} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            color: "#ccc",
            fontSize: 12,
          }}
        >
          {file.name}
        </div>
        <div style={{ fontSize: 10, color: "#444", marginTop: 1 }}>{size}</div>
      </div>
      <button
        onClick={onRemove}
        onTouchEnd={(e) => {
          e.preventDefault();
          onRemove();
        }}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#444",
          padding: 4,
          display: "flex",
          borderRadius: 4,
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <Icon name="x" size={11} />
      </button>
    </div>
  );
}

// ─── Action Cards ─────────────────────────────────────────────────────────────
function ActionCard({ action, navigate }) {
  if (!action || action.type !== "redirect") return null;
  return (
    <div
      style={{
        marginTop: 12,
        background: "#0f0f0f",
        border: "1px solid #222",
        borderRadius: 12,
        padding: "14px 16px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 12,
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            flexShrink: 0,
            background: "#1a1200",
            border: "1px solid #2a2000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="warning" size={16} color="#f59e0b" />
        </div>
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "#e0e0e0",
              marginBottom: 2,
            }}
          >
            Samvaadik not connected
          </div>
          <div style={{ fontSize: 11.5, color: "#555" }}>
            Connect your account to use WhatsApp features
          </div>
        </div>
      </div>
      <div style={{ marginBottom: 14 }}>
        {[
          "Click the button below to go to the connection page",
          "Enter your Samvaadik API key",
          "Verify and save — you're done",
        ].map((s, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 9,
              marginBottom: 6,
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                flexShrink: 0,
                background: "#1c1c1c",
                border: "1px solid #2a2a2a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                color: "#555",
                fontWeight: 600,
                marginTop: 1,
              }}
            >
              {i + 1}
            </div>
            <span style={{ fontSize: 12, color: "#888", lineHeight: 1.5 }}>
              {s}
            </span>
          </div>
        ))}
      </div>
      <button
        onClick={() => navigate(action.route)}
        style={{
          width: "100%",
          padding: "10px 0",
          borderRadius: 9,
          background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 7,
          fontSize: 13,
          fontWeight: 500,
          color: "#fff",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <Icon name="brand-whatsapp" size={14} color="white" />
        {action.label}
        <Icon name="arrow_right" size={13} color="white" />
      </button>
    </div>
  );
}

function ConnectedCard({ data }) {
  const fields = [
    { label: "Phone", value: data.business_phone || "—" },
    { label: "Status", value: data.status || "active" },
    { label: "Connected on", value: data.connected_at || "—" },
    { label: "Webhook", value: data.webhook_set ? "Set ✓" : "Not set" },
    { label: "WhatsApp ID", value: data.wa_id || "—", full: true },
  ];
  return (
    <div
      style={{
        marginTop: 12,
        background: "#080f0a",
        border: "1px solid #152010",
        borderRadius: 12,
        padding: "14px 16px",
        overflow: "hidden",
        minWidth: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 12,
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            flexShrink: 0,
            background: "#0a1a0d",
            border: "1px solid #152918",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="brand-whatsapp" size={16} color="#3ecf8e" />
        </div>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 500, color: "#e0e0e0" }}>
              Samvaadik Connected
            </span>
            <span
              style={{
                fontSize: 10,
                padding: "1px 7px",
                borderRadius: 20,
                background: "#0a2218",
                color: "#3ecf8e",
                border: "1px solid #12301e",
                flexShrink: 0,
              }}
            >
              Active
            </span>
          </div>
          <div style={{ fontSize: 11.5, color: "#2a4a30", marginTop: 2 }}>
            WhatsApp account ready
          </div>
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 6,
          marginBottom: 6,
        }}
      >
        {fields
          .filter((f) => !f.full)
          .map(({ label, value }) => (
            <div
              key={label}
              style={{
                background: "#0a150c",
                borderRadius: 8,
                padding: "8px 10px",
                minWidth: 0,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: "#1e3a22",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  marginBottom: 3,
                }}
              >
                {label}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "#6ecf90",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {value}
              </div>
            </div>
          ))}
      </div>
      {fields
        .filter((f) => f.full)
        .map(({ label, value }) => (
          <div
            key={label}
            style={{
              background: "#0a150c",
              borderRadius: 8,
              padding: "8px 10px",
              minWidth: 0,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: "#1e3a22",
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                marginBottom: 3,
              }}
            >
              {label}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "#6ecf90",
                wordBreak: "break-all",
                lineHeight: 1.5,
              }}
            >
              {value}
            </div>
          </div>
        ))}
    </div>
  );
}

function AgentCreatedCard({ action, navigate }) {
  const isSmart = action.field_mode === "smart_fields";
  return (
    <div
      style={{
        marginTop: 12,
        background: "#080a14",
        border: "1px solid #141a30",
        borderRadius: 12,
        padding: "14px 16px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 12,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            flexShrink: 0,
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="check" size={17} color="white" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 13.5,
              fontWeight: 600,
              color: "#e8e8e8",
              marginBottom: 2,
            }}
          >
            Agent Created!
          </div>
          <div style={{ fontSize: 11.5, color: "#2a3a5a" }}>
            Your agent is ready to use
          </div>
        </div>
        <span
          style={{
            fontSize: 10,
            padding: "2px 8px",
            borderRadius: 20,
            flexShrink: 0,
            background: isSmart ? "#14082a" : "#08142a",
            color: isSmart ? "#a78bfa" : "#60a5fa",
            border: `1px solid ${isSmart ? "#1e1040" : "#102040"}`,
            whiteSpace: "nowrap",
          }}
        >
          {isSmart ? "Smart Fields" : "Classic"}
        </span>
      </div>
      <div
        style={{
          background: "#0c1020",
          border: "1px solid #1a2440",
          borderRadius: 9,
          padding: "10px 14px",
          marginBottom: 12,
          display: "flex",
          alignItems: "center",
          gap: 8,
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        <Icon name="robot" size={14} color="#6366f1" />
        <span
          style={{
            fontSize: 13,
            color: "#c0cce0",
            fontWeight: 500,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {action.agent_name}
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
        <button
          onClick={() => navigate(`/agents/${action.agent_id}`)}
          style={{
            padding: "9px 0",
            borderRadius: 9,
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            border: "none",
            cursor: "pointer",
            fontSize: 12.5,
            fontWeight: 500,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <Icon name="eye" size={13} color="white" /> View Agent
        </button>
        <button
          onClick={() => navigate("/agents")}
          style={{
            padding: "9px 0",
            borderRadius: 9,
            background: "#0c1020",
            border: "1px solid #1a2440",
            cursor: "pointer",
            fontSize: 12.5,
            color: "#6a80aa",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <Icon name="list" size={13} /> All Agents
        </button>
      </div>
    </div>
  );
}

function EventCreatedCard({ action, navigate, onUploadCsv }) {
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  return (
    <div
      style={{
        marginTop: 12,
        background: "#080f0a",
        border: "1px solid #102018",
        borderRadius: 12,
        padding: "14px 16px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 12,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            flexShrink: 0,
            background: "linear-gradient(135deg,#059669,#10b981)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="check" size={17} color="white" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 13.5,
              fontWeight: 600,
              color: "#e8e8e8",
              marginBottom: 2,
            }}
          >
            Event Created!
          </div>
          <div style={{ fontSize: 11.5, color: "#1e3a28" }}>Ready to go</div>
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 6,
          marginBottom: 12,
        }}
      >
        {[
          { label: "Event", value: action.event_name },
          { label: "Date", value: action.event_date },
          { label: "Agent", value: action.agent_name || "None assigned" },
          {
            label: "CSV",
            value:
              uploaded || action._csvUploaded
                ? "✓ Uploaded"
                : action.csv_file_name || "Not uploaded",
          },
        ].map(({ label, value }) => (
          <div
            key={label}
            style={{
              background: "#0a1510",
              borderRadius: 8,
              padding: "8px 10px",
              minWidth: 0,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: "#1a3020",
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                marginBottom: 3,
              }}
            >
              {label}
            </div>
            <div
              style={{
                fontSize: 12,
                color: uploaded && label === "CSV" ? "#3ecf8e" : "#6ecf90",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {value}
            </div>
          </div>
        ))}
      </div>
      {action.needs_csv_upload && !uploaded && !action._csvUploaded && (
        <div
          style={{
            background: "#0c1a10",
            border: "1px solid #152818",
            borderRadius: 9,
            padding: "9px 12px",
            marginBottom: 10,
            display: "flex",
            alignItems: "center",
            gap: 8,
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          <Icon name="csv" size={14} color="#6ee7b7" />
          <span
            style={{
              fontSize: 12,
              color: "#3a6a48",
              flex: 1,
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {action.csv_file_name}
          </span>
          <button
            onClick={async () => {
              setUploading(true);
              const ok = await onUploadCsv(action.event_id);
              setUploading(false);
              if (ok) setUploaded(true);
            }}
            disabled={uploading}
            style={{
              padding: "5px 12px",
              borderRadius: 7,
              border: "none",
              background: uploading ? "#1a3020" : "#3ecf8e",
              color: uploading ? "#4a8a60" : "#001a0a",
              fontSize: 11.5,
              fontWeight: 600,
              cursor: uploading ? "not-allowed" : "pointer",
              flexShrink: 0,
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {uploading ? "Uploading…" : "Upload now"}
          </button>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
        {/* call-batch page = the pre-call page where user can start calls / send WhatsApp */}
        <button
          onClick={() => navigate(`/call-batch/${action.event_id}`)}
          style={{
            padding: "9px 0",
            borderRadius: 9,
            background: "linear-gradient(135deg,#059669,#10b981)",
            border: "none",
            cursor: "pointer",
            fontSize: 12.5,
            fontWeight: 500,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <Icon name="dashboard" size={13} color="white" /> Open Event
        </button>
        <button
          onClick={() => navigate("/events")}
          style={{
            padding: "9px 0",
            borderRadius: 9,
            background: "#0a1510",
            border: "1px solid #152818",
            cursor: "pointer",
            fontSize: 12.5,
            color: "#3a6a48",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <Icon name="list" size={13} /> All Events
        </button>
      </div>
    </div>
  );
}

// ─── Template cards ───────────────────────────────────────────────────────────
const TEMPLATE_STATUS_COLORS = {
  PENDING: { color: "#f59e0b", bg: "#1a1200", border: "#2a2000" },
  APPROVED: { color: "#3ecf8e", bg: "#0a2218", border: "#12301e" },
  REJECTED: { color: "#f87171", bg: "#280a0a", border: "#3a1010" },
};

// The backend doesn't always flatten the template fields onto the action —
// sometimes only the nested `template`/`data` object is populated. Merge both,
// preferring flattened top-level fields when present.
function normalizeTemplateData(raw) {
  const nested = raw?.template || raw?.data || {};
  return {
    name: raw?.name ?? nested.name,
    category: raw?.category ?? nested.category,
    language: raw?.language ?? nested.language,
    status: raw?.status ?? nested.status,
    header_format: raw?.header_format ?? nested.header_format,
    media_id: raw?.media_id ?? nested.media_id,
    wt_id: raw?.wt_id ?? nested.wt_id,
  };
}

function TemplateCreatedCard({ data: raw }) {
  const data = normalizeTemplateData(raw);
  const status = (data.status || "PENDING").toUpperCase();
  const statusStyle =
    TEMPLATE_STATUS_COLORS[status] || TEMPLATE_STATUS_COLORS.PENDING;
  const fields = [
    { label: "Category", value: data.category || "—" },
    { label: "Language", value: data.language || "—" },
    { label: "Header", value: data.header_format || "TEXT" },
  ];
  return (
    <div
      style={{
        marginTop: 12,
        background: "#080f0a",
        border: "1px solid #102018",
        borderRadius: 12,
        padding: "14px 16px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 12,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            flexShrink: 0,
            background: "linear-gradient(135deg,#059669,#10b981)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="brand-whatsapp" size={17} color="white" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 13.5,
              fontWeight: 600,
              color: "#e8e8e8",
              marginBottom: 2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {data.name || "Template"}
          </div>
          <div style={{ fontSize: 11.5, color: "#5a9c78" }}>
            Submitted to Meta for approval
          </div>
        </div>
        <span
          style={{
            fontSize: 10,
            padding: "2px 8px",
            borderRadius: 20,
            flexShrink: 0,
            background: statusStyle.bg,
            color: statusStyle.color,
            border: `1px solid ${statusStyle.border}`,
            whiteSpace: "nowrap",
          }}
        >
          {status}
        </span>
      </div>
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}
      >
        {fields.map(({ label, value }) => (
          <div
            key={label}
            style={{
              background: "#0a1510",
              borderRadius: 8,
              padding: "8px 10px",
              minWidth: 0,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: "#d9d9d9",
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                marginBottom: 3,
              }}
            >
              {label}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "#8fe0ac",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Purely presentational — the actual upload is kicked off once, directly from
// sendMessage's response handler (same pattern as the CSV auto-upload after
// event_created), not from a child-component effect. That avoids any
// component-mount-timing dependency for a side effect that must run exactly once.
function TemplateMediaUploadCard({ action }) {
  const state = action._uploadState || "uploading";

  if (state === "done")
    return <TemplateCreatedCard data={action._uploadResult} />;

  return (
    <div
      style={{
        marginTop: 12,
        background: state === "error" ? "#1a0a0a" : "#080f0a",
        border: `1px solid ${state === "error" ? "#3a1010" : "#102018"}`,
        borderRadius: 12,
        padding: "14px 16px",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            flexShrink: 0,
            background: state === "error" ? "#280a0a" : "#0a1a0d",
            border: `1px solid ${state === "error" ? "#3a1010" : "#152918"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon
            name="brand-whatsapp"
            size={16}
            color={state === "error" ? "#f87171" : "#3ecf8e"}
          />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "#e0e0e0",
              marginBottom: 2,
            }}
          >
            {state === "error"
              ? "Template upload failed"
              : `Uploading ${action.file_name || "media"}…`}
          </div>
          <div
            style={{
              fontSize: 11.5,
              color: state === "error" ? "#7a3030" : "#555",
            }}
          >
            {state === "error"
              ? action._uploadError || "Upload failed"
              : "Uploading media and submitting template to Meta"}
          </div>
        </div>
        {state === "uploading" && <TypingDots />}
      </div>
    </div>
  );
}

// ─── Message ──────────────────────────────────────────────────────────────────
function Message({ msg, navigate, uploadCsvAfterEvent }) {
  const isUser = msg.role === "user";
  return (
    <div
      className={isUser ? "sa-msg-user" : "sa-msg-ai"}
      style={{
        display: "flex",
        flexDirection: isUser ? "row-reverse" : "row",
        gap: 10,
        marginBottom: 20,
        alignItems: "flex-start",
      }}
    >
      {!isUser && (
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            flexShrink: 0,
            background: "#111",
            border: "1px solid #1e1e1e",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 1,
          }}
        >
          <Icon name="sparkles" size={13} color="#a78bfa" />
        </div>
      )}
      <div
        style={{
          maxWidth: isUser ? "78%" : "calc(100% - 36px)",
          padding: isUser ? "9px 14px" : "2px 0",
          borderRadius: isUser ? "14px 14px 4px 14px" : 0,
          background: isUser ? "#1a1a1a" : "transparent",
          border: isUser ? "1px solid #242424" : "none",
          color: "#e0e0e0",
          fontSize: 13.5,
          lineHeight: 1.65,
          wordBreak: "break-word",
          overflowWrap: "anywhere",
          width: isUser ? "auto" : "100%",
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        {isUser ? (
          <span style={{ color: "#d0d0d0", whiteSpace: "pre-wrap" }}>
            {msg.content}
          </span>
        ) : (
          <div>
            {renderMarkdown(msg.content)}
            {msg.action?.type === "redirect" && (
              <ActionCard action={msg.action} navigate={navigate} />
            )}
            {msg.action?.type === "agent_created" && (
              <AgentCreatedCard action={msg.action} navigate={navigate} />
            )}
            {msg.action?.type === "event_created" && (
              <EventCreatedCard
                action={msg.action}
                navigate={navigate}
                onUploadCsv={uploadCsvAfterEvent}
              />
            )}
            {msg.action?.type === "template_media_upload_required" && (
              <TemplateMediaUploadCard action={msg.action} />
            )}
            {msg.action?.type === "template_created" && (
              <TemplateCreatedCard data={msg.action} />
            )}
            {msg.connectionData?.connected && (
              <ConnectedCard data={msg.connectionData} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PlusMenu ─────────────────────────────────────────────────────────────────
// Positioned using CSS only — sits above the input area inside the panel flow.
// No getBoundingClientRect, no useEffect, no timing issues.
// The panel itself is position:fixed so this just needs to sit above the toolbar.
function PlusMenu({ menuRef, fileInputRef, onClose, onQuickAction }) {
  return (
    <div
      ref={menuRef}
      style={{
        position: "absolute",
        bottom: "calc(100% + 6px)",
        left: 0,
        right: 0,
        background: "#111",
        border: "1px solid #222",
        borderRadius: 14,
        padding: 10,
        zIndex: 100,
        boxShadow: "0 -4px 32px rgba(0,0,0,0.9), 0 4px 16px rgba(0,0,0,0.5)",
        boxSizing: "border-box",
        overflow: "hidden",
        animation: "sa-fadein 0.15s ease-out",
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: "#3a3a3a",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          fontWeight: 600,
          padding: "2px 4px 8px",
        }}
      >
        Attach file
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(85px,1fr))",
          gap: 5,
          marginBottom: 8,
        }}
      >
        {FILE_TYPES.map((ft) => (
          <button
            key={ft.ext}
            onClick={() => {
              fileInputRef.current?.click();
              onClose();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              fileInputRef.current?.click();
              onClose();
            }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 6,
              padding: "9px 10px",
              borderRadius: 10,
              background: "#0d0d0d",
              border: "1px solid #1c1c1c",
              cursor: "pointer",
              width: "100%",
              WebkitTapHighlightColor: "transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#161616";
              e.currentTarget.style.borderColor = "#2a2a2a";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#0d0d0d";
              e.currentTarget.style.borderColor = "#1c1c1c";
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                flexShrink: 0,
                background: ft.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FileTypeIcon ext={ft.ext} />
            </div>
            <div style={{ textAlign: "left", minWidth: 0, width: "100%" }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#d0d0d0",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {ft.label}
              </div>
              <div
                style={{
                  fontSize: 10.5,
                  color: "#444",
                  marginTop: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {ft.sub}
              </div>
            </div>
          </button>
        ))}
      </div>
      <div style={{ height: 1, background: "#1c1c1c", margin: "4px 0 8px" }} />
      <div
        style={{
          fontSize: 10,
          color: "#3a3a3a",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          fontWeight: 600,
          padding: "2px 4px 8px",
        }}
      >
        Quick actions
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(110px,1fr))",
          gap: 5,
        }}
      >
        {QUICK_ACTIONS.map((a) => (
          <button
            key={a.label}
            onClick={() => onQuickAction(a.prompt)}
            onTouchEnd={(e) => {
              e.preventDefault();
              onQuickAction(a.prompt);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 10px",
              borderRadius: 9,
              background: "#0d0d0d",
              border: "1px solid #1c1c1c",
              cursor: "pointer",
              width: "100%",
              WebkitTapHighlightColor: "transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#161616";
              e.currentTarget.style.borderColor = "#2a2a2a";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#0d0d0d";
              e.currentTarget.style.borderColor = "#1c1c1c";
            }}
          >
            <Icon name={a.icon} size={14} color="#555" />
            <span
              style={{
                fontSize: 12,
                color: "#999",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {a.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SutrakAssistant() {
  const { getToken } = useKindeAuth();
  const navigate = useNavigate();

  // ── State ──────────────────────────────────────────────────────────────────
  const [isOpen, setIsOpen] = useState(false);
  const [panelKey, setPanelKey] = useState(0); // increments on open to re-trigger panel animations
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [error, setError] = useState(null);
  const [pendingEventId, setPendingEventId] = useState(null);
  const [ripple, setRipple] = useState(false); // trigger button ripple

  // Drag state
  const [pos, setPos] = useState({ x: null, y: null });
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const dragStart = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);

  // Refs
  const bubbleRef = useRef(null);
  const panelRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const plusMenuRef = useRef(null);
  const plusBtnRef = useRef(null);
  // Holds the CSV file object after sendMessage clears attachedFiles state.
  // uploadCsvAfterEvent reads from here, not from attachedFiles state.
  const pendingCsvRef = useRef(null);
  // Accumulates every attached file (by name) across turns. The backend may
  // ask for confirmation in one turn and only return
  // template_media_upload_required several turns later — by then
  // attachedFiles/filesSnapshot for that turn is empty, so uploadTemplateMedia
  // looks the original File object up here instead.
  const pendingMediaFilesRef = useRef(new Map());

  // ── Scroll to bottom ───────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, isOpen]);

  // ── Focus input when opened ────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  // ── Close plus menu on outside click / touch ───────────────────────────────
  useEffect(() => {
    if (!showPlusMenu) return;
    const handler = (e) => {
      const target = e.target || e.touches?.[0]?.target;
      if (
        plusMenuRef.current &&
        !plusMenuRef.current.contains(target) &&
        plusBtnRef.current &&
        !plusBtnRef.current.contains(target)
      ) {
        setShowPlusMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [showPlusMenu]);

  // ── Drag — pointer events (works on desktop + mobile via pointer API) ──────
  const startDrag = useCallback((e) => {
    // Accept both mouse (button 0) and touch/stylus (no button check)
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    const rect = bubbleRef.current.getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    dragStart.current = { x: e.clientX, y: e.clientY };
    hasMoved.current = false;
    bubbleRef.current.setPointerCapture(e.pointerId); // keeps tracking even off-element
    setDragging(true);
  }, []);

  const onPointerMove = useCallback(
    (e) => {
      if (!dragging) return;
      const dx = Math.abs(e.clientX - dragStart.current.x);
      const dy = Math.abs(e.clientY - dragStart.current.y);
      if (dx > 4 || dy > 4) hasMoved.current = true;
      const bw = bubbleRef.current?.offsetWidth || 44;
      const bh = bubbleRef.current?.offsetHeight || 44;
      setPos({
        x: Math.max(
          8,
          Math.min(
            window.innerWidth - bw - 8,
            e.clientX - dragOffset.current.x,
          ),
        ),
        y: Math.max(
          8,
          Math.min(
            window.innerHeight - bh - 8,
            e.clientY - dragOffset.current.y,
          ),
        ),
      });
    },
    [dragging],
  );

  const onPointerUp = useCallback(() => {
    setDragging(false);
  }, []);

  const handleBubbleClick = () => {
    if (hasMoved.current) return;
    setRipple(true);
    setTimeout(() => setRipple(false), 500);
    const opening = !isOpen;
    setIsOpen(opening);
    if (opening) setPanelKey((k) => k + 1); // re-trigger panel entry animations
  };

  // ── File handling ──────────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const oversized = [];
    const validFiles = files.filter((f) => {
      const category = getFileCategory(f.name);
      const max = MAX_FILE_SIZE[category];
      if (f.size > max) {
        oversized.push(`${f.name} (max ${Math.round(max / (1024 * 1024))}MB for ${category})`);
        return false;
      }
      return true;
    });

    if (oversized.length > 0) {
      setError(`File too large — ${oversized.join(", ")}`);
    }

    if (validFiles.length > 0) {
      setAttachedFiles((prev) => {
        const existing = new Set(prev.map((f) => f.name));
        return [
          ...prev,
          ...validFiles.filter((f) => !existing.has(f.name)),
        ].slice(0, 5);
      });
    }

    setShowPlusMenu(false);
    e.target.value = "";
  };

  const removeFile = (name) =>
    setAttachedFiles((prev) => prev.filter((f) => f.name !== name));

  // ── CSV upload after event creation ────────────────────────────────────────
  // Reads the file from pendingCsvRef (saved before attachedFiles state was cleared).
  // Calls POST /api/events/:eventId/upload-csv — identical logic to createEventWithCsv.
  const uploadCsvAfterEvent = async (eventId) => {
    const csv = pendingCsvRef.current;
    if (!csv || !eventId) {
      console.warn("[uploadCsvAfterEvent] No pending CSV file or eventId");
      return false;
    }
    try {
      const token = await getToken();
      const form = new FormData();
      form.append("dataset", csv); // multer field name must match: upload.single("dataset")
      console.log(
        "[uploadCsvAfterEvent] Uploading",
        csv.name,
        "to event",
        eventId,
      );
      const res = await fetch(
        `${BACKEND_URL}/api/events/${eventId}/upload-csv`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error("[uploadCsvAfterEvent] Server error:", data.error);
        return false;
      }
      console.log("[uploadCsvAfterEvent] Success:", data.message);
      pendingCsvRef.current = null; // clear after success
      return data.success === true;
    } catch (err) {
      console.error("[uploadCsvAfterEvent] Fetch error:", err);
      return false;
    }
  };

  // ── Template media upload (signed URL flow) ────────────────────────────────
  // Called once from sendMessage right after a template_media_upload_required
  // action is received. PUTs the attached file to the Samvaadik signed URL,
  // then asks the backend to finalize template creation.
  const uploadTemplateMedia = async (action) => {
    const file = action._file;
    if (!file) {
      return {
        ok: false,
        error: "Attached file not found. Please re-attach and try again.",
      };
    }
    try {
      const putRes = await fetch(action.signed_url, {
        method: "PUT",
        body: file,
      });
      if (!putRes.ok) {
        return { ok: false, error: `Media upload failed (${putRes.status})` };
      }
      const token = await getToken();
      const res = await fetch(
        `${BACKEND_URL}/api/samvaadik/templates/complete-media-upload`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            storage_path: action.storage_path,
            file_name: action.file_name,
            file_type: action.file_type,
            ...action.template,
          }),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) {
        return { ok: false, error: data.error || `Error ${res.status}` };
      }
      pendingMediaFilesRef.current.delete(action.file_name); // consumed
      return { ok: true, data: data.data || data };
    } catch (err) {
      return {
        ok: false,
        error: err.message || "Upload failed. Please try again.",
      };
    }
  };

  // ── Send message ───────────────────────────────────────────────────────────
  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if ((!msg && attachedFiles.length === 0) || isLoading) return;
    setInput("");
    setError(null);
    setShowWelcome(false);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const fileNames = attachedFiles.map((f) => f.name);
    const userContent =
      fileNames.length > 0
        ? `${msg}${msg ? "\n\n" : ""}[Attached: ${fileNames.join(", ")}]`
        : msg;

    setMessages((prev) => [...prev, { role: "user", content: userContent }]);
    const filesSnapshot = [...attachedFiles];
    // Remember every attached file by name in case a later turn (not this one)
    // is the one that comes back needing it for a media upload.
    filesSnapshot.forEach((f) => pendingMediaFilesRef.current.set(f.name, f));
    // Save CSV file to ref so uploadCsvAfterEvent can access it after state is cleared
    const csvFile = filesSnapshot.find((f) =>
      ["csv", "xlsx", "xls"].includes(f.name.split(".").pop().toLowerCase()),
    );
    if (csvFile) pendingCsvRef.current = csvFile;
    setAttachedFiles([]);
    setIsLoading(true);

    try {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/api/assistant/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: msg,
          conversationHistory,
          ...(filesSnapshot.length > 0 && {
            attachedFiles: filesSnapshot.map((f) => ({
              name: f.name,
              size: f.size,
            })),
          }),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Error ${res.status}`);
      }
      const data = await res.json();
      if (
        data.action?.type === "event_created" &&
        data.action?.needs_csv_upload
      ) {
        const eventId = data.action.event_id;
        setPendingEventId(eventId);
        // Auto-upload immediately — don't rely on user clicking the button
        // Small delay so the success message renders first
        setTimeout(async () => {
          const ok = await uploadCsvAfterEvent(eventId);
          if (ok) {
            setMessages((prev) =>
              prev.map((m, idx) =>
                idx === prev.length - 1 && m.action?.type === "event_created"
                  ? { ...m, action: { ...m.action, _csvUploaded: true } }
                  : m,
              ),
            );
          }
        }, 800);
      }
      // template_media_upload_required needs the original File object (not
      // serializable through the API) to PUT to the signed URL. The file may
      // have been attached several turns earlier, so look it up from the
      // cross-turn map rather than this turn's filesSnapshot.
      let actionToStore = data.action || null;
      if (actionToStore?.type === "template_media_upload_required") {
        const matchedFile = pendingMediaFilesRef.current.get(
          actionToStore.file_name,
        );
        actionToStore = {
          ...actionToStore,
          _file: matchedFile || null,
          _uploadState: "uploading",
        };
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply,
          action: actionToStore,
          connectionData: data.connectionData || null,
        },
      ]);
      setConversationHistory(data.updatedHistory || []);

      // Kick off the upload directly here — same pattern as the CSV
      // auto-upload above — instead of from a child component's effect, so
      // it's guaranteed to run exactly once regardless of render timing.
      if (actionToStore?.type === "template_media_upload_required") {
        const thisAction = actionToStore;
        setTimeout(async () => {
          const res = await uploadTemplateMedia(thisAction);
          setMessages((prev) =>
            prev.map((m) =>
              m.action === thisAction
                ? {
                    ...m,
                    action: {
                      ...m.action,
                      _uploadState: res.ok ? "done" : "error",
                      _uploadResult: res.ok ? res.data : null,
                      _uploadError: res.ok ? null : res.error,
                    },
                  }
                : m,
            ),
          );
        }, 300);
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I ran into an issue. Could you try again?",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setConversationHistory([]);
    setError(null);
    setShowWelcome(true);
    setAttachedFiles([]);
    setPendingEventId(null);
    pendingMediaFilesRef.current.clear();
  };

  const canSend =
    (input.trim().length > 0 || attachedFiles.length > 0) && !isLoading;

  // Bubble position
  const bubbleStyle = useMemo(
    () =>
      pos.x !== null
        ? {
            position: "fixed",
            left: pos.x,
            top: pos.y,
            bottom: "auto",
            right: "auto",
          }
        : {
            position: "fixed",
            bottom: "max(28px, env(safe-area-inset-bottom, 28px))",
            right: 20,
          },
    [pos],
  );

  return (
    <>
      {/* ── Global styles ─────────────────────────────────────────────────── */}
      <style>{`
        /* ── Keyframes ─────────────────────────────────────────────── */
        @keyframes sa-dot        { 0%,80%,100%{opacity:.3;transform:scale(.85);}40%{opacity:1;transform:scale(1);} }
        @keyframes sa-fadein     { from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);} }
        @keyframes sa-msg-user   { from{opacity:0;transform:translateX(12px) scale(.97);}to{opacity:1;transform:translateX(0) scale(1);} }
        @keyframes sa-msg-ai     { from{opacity:0;transform:translateX(-8px) scale(.97);}to{opacity:1;transform:translateX(0) scale(1);} }
        @keyframes sa-pulse      { 0%,100%{box-shadow:0 0 0 0 rgba(139,92,246,.5),0 4px 24px rgba(99,102,241,.35);}50%{box-shadow:0 0 0 10px rgba(139,92,246,0),0 4px 24px rgba(99,102,241,.35);} }
        @keyframes sa-ripple     { 0%{transform:scale(0);opacity:.7;}100%{transform:scale(2.8);opacity:0;} }
        @keyframes sa-icon-in    { from{opacity:0;transform:scale(.5) rotate(-90deg);}to{opacity:1;transform:scale(1) rotate(0deg);} }
        @keyframes sa-icon-out   { from{opacity:0;transform:scale(.5) rotate(90deg);}to{opacity:1;transform:scale(1) rotate(0deg);} }
        @keyframes sa-panel-hdr  { from{opacity:0;transform:translateY(-8px);}to{opacity:1;transform:translateY(0);} }
        @keyframes sa-panel-body { from{opacity:0;}to{opacity:1;} }
        @keyframes sa-panel-foot { from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);} }
        @keyframes sa-welcome-card { from{opacity:0;transform:translateY(10px) scale(.97);}to{opacity:1;transform:translateY(0) scale(1);} }
        @keyframes sa-dot-online { 0%,100%{transform:scale(1);opacity:1;}50%{transform:scale(1.3);opacity:.6;} }
        @keyframes sa-gradient-spin { 0%{background-position:0% 50%;}50%{background-position:100% 50%;}100%{background-position:0% 50%;} }
        @keyframes sa-label-in  { from{opacity:0;transform:translateX(8px);}to{opacity:1;transform:translateX(0);} }
        @keyframes sa-float     { 0%,100%{transform:translateY(0);}50%{transform:translateY(-3px);} }

        /* ── Base classes ───────────────────────────────────────────── */
        .sa-messages { scrollbar-width:thin; scrollbar-color:#1e1e1e transparent; overflow-y:auto; -webkit-overflow-scrolling:touch; overscroll-behavior:contain; }
        .sa-messages::-webkit-scrollbar { width:3px; }
        .sa-messages::-webkit-scrollbar-thumb { background:#1e1e1e; border-radius:3px; }
        .sa-hdr-btn { background:none; border:none; cursor:pointer; color:#444; padding:6px; border-radius:7px; display:flex; align-items:center; transition:background .15s,color .15s; -webkit-tap-highlight-color:transparent; }
        .sa-hdr-btn:hover { background:#1a1a1a; color:#e8e8e8; }
        .sa-hdr-btn:active { background:#222; }
        .sa-send-btn { border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:background .2s,transform .1s; -webkit-tap-highlight-color:transparent; }
        .sa-send-btn:active { transform:scale(0.9); }
        .sa-send-btn:disabled { opacity:.35; cursor:not-allowed; }
        .sa-overlay { pointer-events:none; }
        .sa-overlay.open { pointer-events:auto; }
        .sa-msg-user { animation: sa-msg-user .22s cubic-bezier(.34,1.56,.64,1); }
        .sa-msg-ai   { animation: sa-msg-ai   .22s cubic-bezier(.34,1.56,.64,1); }
        .sa-panel-hdr  { animation: sa-panel-hdr  .28s ease-out both; }
        .sa-panel-body { animation: sa-panel-body .35s ease-out .08s both; }
        .sa-panel-foot { animation: sa-panel-foot .28s ease-out .12s both; }

        /* ── Bubble ─────────────────────────────────────────────────── */
        .sa-bubble-wrap {
          position: relative;
          width: 52px; height: 52px;
          border-radius: 50%;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
        }
        /* Outer glow ring — animated */
        .sa-bubble-wrap::before {
          content: "";
          position: absolute;
          inset: -3px;
          border-radius: 50%;
          background: conic-gradient(from 0deg, #6366f1, #8b5cf6, #a78bfa, #6366f1);
          animation: sa-gradient-spin 3s linear infinite;
          opacity: .7;
          z-index: 0;
        }
        .sa-bubble-wrap::after {
          content: "";
          position: absolute;
          inset: -3px;
          border-radius: 50%;
          background: conic-gradient(from 0deg, #6366f1, #8b5cf6, #a78bfa, #6366f1);
          animation: sa-gradient-spin 3s linear infinite;
          filter: blur(6px);
          opacity: .5;
          z-index: 0;
        }
        .sa-bubble-wrap.is-open::before,
        .sa-bubble-wrap.is-open::after { display: none; }

        .sa-bubble-btn {
          position: relative; z-index: 1;
          width: 52px; height: 52px; border-radius: 50%;
          border: none; cursor: pointer; padding: 0;
          background: #0f0f10;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
          transition: transform .18s cubic-bezier(.34,1.56,.64,1), background .2s;
          -webkit-tap-highlight-color: transparent;
        }
        .sa-bubble-btn.is-open { background: #1a1a1a; }
        .sa-bubble-btn:hover:not(.is-open) { transform: scale(1.07); }
        .sa-bubble-btn:active { transform: scale(.88) !important; }

        /* Gradient fill inside the button — shows through ring */
        .sa-bubble-icon-wrap {
          position: absolute; inset: 0; border-radius: 50%;
          background: linear-gradient(145deg, #6366f1 0%, #7c3aed 60%, #a78bfa 100%);
          display: flex; align-items: center; justify-content: center;
          transition: opacity .25s;
        }
        .sa-bubble-btn.is-open .sa-bubble-icon-wrap { opacity: 0; }
        .sa-bubble-close-wrap {
          position: absolute; inset: 0; border-radius: 50%;
          background: #1a1a1a;
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transition: opacity .25s;
          border: 1px solid #2a2a2a;
        }
        .sa-bubble-btn.is-open .sa-bubble-close-wrap { opacity: 1; }

        @media (max-width:768px) {
          .sa-panel { width:100vw !important; border-left:none !important; border-radius:0 !important; }
          .sa-overlay.open { background:rgba(0,0,0,.55) !important; }
        }
        @media (max-width:480px) { .sa-panel { width:100vw !important; } }
        @media (prefers-reduced-motion: reduce) {
          .sa-msg-user,.sa-msg-ai,.sa-panel-hdr,.sa-panel-body,.sa-panel-foot,
          .sa-bubble-wrap::before,.sa-bubble-wrap::after,.sa-bubble-btn { animation:none !important; transition:none !important; }
        }

        @media (max-width:768px) {
          .sa-panel { width:100vw !important; border-left:none !important; border-radius:0 !important; }
          .sa-overlay.open { background:rgba(0,0,0,.55) !important; }
        }
        @media (max-width:480px) {
          .sa-panel { width:100vw !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .sa-msg-user,.sa-msg-ai,.sa-panel-hdr,.sa-panel-body,.sa-panel-foot,.sa-bubble-inner { animation:none !important; transition:none !important; }
        }
      `}</style>

      {/* ── Overlay (mobile backdrop) ──────────────────────────────────────── */}
      <div
        className={`sa-overlay${isOpen ? " open" : ""}`}
        onClick={() => setIsOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9996,
          background: "transparent",
          transition: "background .3s cubic-bezier(.4,0,.2,1)",
        }}
      />

      {/* ── Side panel ────────────────────────────────────────────────────── */}
      <div
        ref={panelRef}
        key={panelKey}
        className="sa-panel"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(420px, 32vw)",
          minWidth: 320,
          background: "#0a0a0a",
          borderLeft: "1px solid #1c1c1c",
          display: "flex",
          flexDirection: "column",
          zIndex: 9997,
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          opacity: isOpen ? 1 : 0,
          transition: "transform .3s cubic-bezier(.4,0,.2,1), opacity .3s ease",
          fontFamily:
            "-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',sans-serif",
          willChange: "transform",
        }}
      >
        {/* Header */}
        <div
          className="sa-panel-hdr"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "14px 16px",
            borderBottom: "1px solid #161616",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              flexShrink: 0,
              background: "#111",
              border: "1px solid #222",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="sparkles" size={14} color="#a78bfa" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 500, color: "#e8e8e8" }}>
              Sutrak Assistant
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#2a2a2a",
                marginTop: 1,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "#3ecf8e",
                  display: "inline-block",
                }}
              />
              <span style={{ color: "#555" }}>Online</span>
            </div>
          </div>
          {messages.length > 0 && (
            <button
              className="sa-hdr-btn"
              onClick={clearChat}
              title="New chat"
              aria-label="New chat"
            >
              <Icon name="refresh" size={14} />
            </button>
          )}
          <button
            className="sa-hdr-btn"
            onClick={() => setIsOpen(false)}
            title="Close"
            aria-label="Close assistant"
          >
            <Icon name="x" size={15} />
          </button>
        </div>

        {/* Messages */}
        <div
          className="sa-messages sa-panel-body"
          style={{ flex: 1, padding: "18px 16px 8px", overflowX: "hidden" }}
        >
          {showWelcome && messages.length === 0 && (
            <div style={{ animation: "sa-fadein .3s ease-out" }}>
              <div style={{ marginBottom: 24 }}>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 500,
                    color: "#e8e8e8",
                    marginBottom: 6,
                    letterSpacing: "-.01em",
                  }}
                >
                  How can I help?
                </div>
                <div style={{ fontSize: 13, color: "#444", lineHeight: 1.6 }}>
                  Create events, manage agents, send WhatsApp templates, and
                  more.
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                }}
              >
                {QUICK_ACTIONS.map((a, i) => (
                  <button
                    key={a.label}
                    onClick={() => sendMessage(a.prompt)}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      sendMessage(a.prompt);
                    }}
                    style={{
                      background: "#0f0f0f",
                      border: "1px solid #1e1e1e",
                      borderRadius: 10,
                      padding: "12px",
                      cursor: "pointer",
                      textAlign: "left",
                      WebkitTapHighlightColor: "transparent",
                      animation:
                        "sa-welcome-card .35s cubic-bezier(.34,1.2,.64,1) both",
                      animationDelay: `${i * 0.07}s`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#161616";
                      e.currentTarget.style.borderColor = "#2a2a2a";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#0f0f0f";
                      e.currentTarget.style.borderColor = "#1e1e1e";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <div
                      style={{ marginBottom: 7, transition: "transform .15s" }}
                    >
                      <Icon name={a.icon} size={15} color="#555" />
                    </div>
                    <div style={{ fontSize: 12.5, color: "#aaa" }}>
                      {a.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <Message
              key={i}
              msg={msg}
              navigate={navigate}
              uploadCsvAfterEvent={uploadCsvAfterEvent}
            />
          ))}

          {isLoading && (
            <div
              style={{
                display: "flex",
                gap: 10,
                marginBottom: 20,
                animation: "sa-fadein .2s ease-out",
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: "#111",
                  border: "1px solid #1e1e1e",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name="sparkles" size={13} color="#a78bfa" />
              </div>
              <div style={{ paddingTop: 6 }}>
                <TypingDots />
              </div>
            </div>
          )}

          {error && (
            <div
              style={{
                fontSize: 12,
                color: "#f87171",
                padding: "8px 12px",
                background: "rgba(248,113,113,.07)",
                borderRadius: 8,
                border: "1px solid rgba(248,113,113,.15)",
                marginBottom: 12,
              }}
            >
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── PlusMenu (rendered inside panel but above everything) ─────────── */}
        {/* PlusMenu sits inside a relative wrapper in the input area — see below */}

        {/* Input area */}
        <div
          className="sa-panel-foot"
          style={{
            padding: "10px 12px 14px",
            borderTop: "1px solid #161616",
            flexShrink: 0,
            paddingBottom: "max(14px, env(safe-area-inset-bottom, 14px))",
          }}
        >
          {/* Attached file chips */}
          {attachedFiles.length > 0 && (
            <div
              style={{
                marginBottom: 8,
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
              }}
            >
              {attachedFiles.map((f) => (
                <FileChip
                  key={f.name}
                  file={f}
                  onRemove={() => removeFile(f.name)}
                />
              ))}
            </div>
          )}

          <input
            type="file"
            accept={ACCEPTED}
            multiple
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
          />

          {/* Relative wrapper — PlusMenu anchors to this, matching input box width exactly */}
          <div style={{ position: "relative" }}>
            {/* PlusMenu sits above the input box, same width */}
            {showPlusMenu && (
              <PlusMenu
                menuRef={plusMenuRef}
                fileInputRef={fileInputRef}
                onClose={() => setShowPlusMenu(false)}
                onQuickAction={(p) => {
                  setShowPlusMenu(false);
                  setShowWelcome(false);
                  sendMessage(p);
                }}
              />
            )}

            {/* Input box */}
            <div
              style={{
                background: "#0f0f0f",
                border: "1px solid #1e1e1e",
                borderRadius: 13,
                overflow: "hidden",
                transition: "border-color .15s",
              }}
              onFocusCapture={(e) =>
                (e.currentTarget.style.borderColor = "#333")
              }
              onBlurCapture={(e) => {
                if (!showPlusMenu)
                  e.currentTarget.style.borderColor = "#1e1e1e";
              }}
            >
              <textarea
                ref={(e) => {
                  inputRef.current = e;
                  textareaRef.current = e;
                }}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything..."
                rows={1}
                disabled={isLoading}
                aria-label="Message input"
                style={{
                  width: "100%",
                  border: "none",
                  background: "transparent",
                  padding: "12px 14px 6px",
                  /* CRITICAL: 16px minimum prevents iOS Safari auto-zoom */
                  fontSize: 16,
                  lineHeight: 1.45,
                  resize: "none",
                  color: "#e0e0e0",
                  fontFamily: "inherit",
                  maxHeight: 110,
                  overflowY: "auto",
                  outline: "none",
                  boxSizing: "border-box",
                  WebkitAppearance: "none",
                }}
                onInput={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height =
                    Math.min(e.target.scrollHeight, 110) + "px";
                }}
              />
              {/* Toolbar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "4px 8px 9px",
                  gap: 4,
                }}
              >
                {/* + button */}
                <button
                  ref={plusBtnRef}
                  id="sa-plus-btn"
                  onClick={() => setShowPlusMenu((p) => !p)}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    setShowPlusMenu((p) => !p);
                  }}
                  aria-label="Attach file or quick action"
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    background: showPlusMenu ? "#1e1e1e" : "transparent",
                    border: `1px solid ${showPlusMenu ? "#333" : "transparent"}`,
                    cursor: "pointer",
                    color: showPlusMenu ? "#a78bfa" : "#555",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all .15s",
                    flexShrink: 0,
                    WebkitTapHighlightColor: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!showPlusMenu) {
                      e.currentTarget.style.color = "#aaa";
                      e.currentTarget.style.background = "#181818";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!showPlusMenu) {
                      e.currentTarget.style.color = "#555";
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                >
                  <Icon name="plus" size={15} />
                </button>

                <div style={{ flex: 1 }} />

                <span
                  style={{ fontSize: 10.5, color: "#2a2a2a", marginRight: 4 }}
                >
                  {input.length > 0 ? `${input.length}` : "⏎"}
                </span>

                {/* Send button */}
                <button
                  className="sa-send-btn"
                  onClick={() => sendMessage()}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    sendMessage();
                  }}
                  disabled={!canSend}
                  aria-label="Send message"
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    background: canSend ? "#a78bfa" : "#1a1a1a",
                    flexShrink: 0,
                    marginLeft: 2,
                  }}
                >
                  <Icon
                    name="send"
                    size={12}
                    color={canSend ? "#fff" : "#333"}
                  />
                </button>
              </div>
            </div>
          </div>
          {/* end position:relative wrapper */}

          <div
            style={{
              fontSize: 10.5,
              color: "#222",
              textAlign: "center",
              marginTop: 8,
            }}
          >
            Sutrak Assistant · Shift+Enter for new line
          </div>
        </div>
      </div>

      {/* ── Draggable trigger bubble ───────────────────────────────────────── */}
      <div
        ref={bubbleRef}
        style={{
          ...bubbleStyle,
          zIndex: 9999,
          userSelect: "none",
          touchAction: "none",
          WebkitUserSelect: "none",
          cursor: dragging ? "grabbing" : "pointer",
        }}
        onPointerDown={startDrag}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={handleBubbleClick}
      >
        <div className={`sa-bubble-wrap${isOpen ? " is-open" : ""}`}>
          <button
            className={`sa-bubble-btn${isOpen ? " is-open" : ""}`}
            tabIndex={-1}
            aria-label={isOpen ? "Close assistant" : "Open Sutrak Assistant"}
          >
            {/* Ripple */}
            {ripple && (
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,.3)",
                  animation: "sa-ripple .5s ease-out forwards",
                  pointerEvents: "none",
                  zIndex: 3,
                }}
              />
            )}

            {/* Gradient fill — visible when closed */}
            <div className="sa-bubble-icon-wrap">
              {/* Shimmer */}
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(145deg,rgba(255,255,255,.22) 0%,transparent 55%)",
                  pointerEvents: "none",
                }}
              />
              {/* Online dot */}
              <span
                style={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#3ecf8e",
                  border: "1.5px solid #7c3aed",
                  animation: "sa-dot-online 2s ease-in-out infinite",
                  zIndex: 2,
                }}
              />
              <div
                key="open-icon"
                style={{
                  animation: "sa-icon-out .22s cubic-bezier(.34,1.56,.64,1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <Icon name="sparkles" size={21} color="#fff" />
              </div>
            </div>

            {/* Dark fill — visible when open */}
            <div className="sa-bubble-close-wrap">
              <div
                key="close-icon"
                style={{
                  animation: "sa-icon-in .22s cubic-bezier(.34,1.56,.64,1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name="x" size={17} color="#888" />
              </div>
            </div>
          </button>
        </div>
      </div>
    </>
  );
}
