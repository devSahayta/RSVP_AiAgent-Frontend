/**
 * SutrakAssistant.jsx — Redesigned
 *
 * Dark side panel that slides in from the right (30% width on desktop).
 * Triggered by a floating button (bottom-right, draggable).
 * Features:
 *   - Full-height side panel, black bg, Supabase-inspired
 *   - Rich input area with + menu: attach CSV, quick actions
 *   - CSV file upload for event creation flow
 *   - Responsive: full-screen on mobile
 *   - Smooth slide-in/out animation
 *
 * Mount in AppContent (App.jsx):
 *   {isAuthenticated && !hideNavBar && <SutrakAssistant />}
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const QUICK_ACTIONS = [
  {
    icon: "calendar",
    label: "Create event",
    prompt: "I want to create a new event",
  },
  { icon: "robot", label: "List agents", prompt: "Show me all my agents" },
  { icon: "users", label: "My events", prompt: "Show my events" },
  {
    icon: "brand-whatsapp",
    label: "Send template",
    prompt: "I want to send a WhatsApp template",
  },
];

/* ── Helpers ──────────────────────────────────────────────────────────────── */
function Icon({ name, size = 16, style = {} }) {
  const icons = {
    calendar:
      "M8 2v3M16 2v3M3.5 9.09h17M21 8.5V17c0 3-1.5 4-4 4H7c-2.5 0-4-1-4-4V8.5c0-3 1.5-4 4-4h10c2.5 0 4 1 4 4z",
    robot:
      "M12 8V4M8.56 3.69a4 4 0 00-2.87 2.86M15.44 3.69a4 4 0 012.87 2.86M3 14v-2a9 9 0 0118 0v2M3 14a2 2 0 002 2h14a2 2 0 002-2v-1a9 9 0 00-18 0v1zM9 17v1a3 3 0 006 0v-1M9 12h.01M15 12h.01",
    users:
      "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z",
    "brand-whatsapp":
      "M3 21l1.65-3.8a9 9 0 113.4 2.9L3 21M9 10c0 .55.45 1 1 1h.01M12 10c0 .55.45 1 1 1h.01M15 10c0 .55.45 1 1 1h.01",
    send: "M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z",
    plus: "M12 5v14M5 12h14",
    x: "M18 6L6 18M6 6l12 12",
    paperclip:
      "M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48",
    csv: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
    trash: "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
    sparkles:
      "M9.937 15.5A2 2 0 008.5 14.063l-6.135-1.582a.5.5 0 010-.962L8.5 9.936A2 2 0 009.937 8.5l1.582-6.135a.5.5 0 01.963 0L14.063 8.5A2 2 0 0015.5 9.937l6.135 1.581a.5.5 0 010 .963L15.5 14.063a2 2 0 00-1.437 1.437l-1.582 6.135a.5.5 0 01-.963 0z",
    chevron_right: "M9 18l6-6-6-6",
    refresh:
      "M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15",
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0, ...style }}
    >
      {(icons[name] || "")
        .split("M")
        .filter(Boolean)
        .map((d, i) => (
          <path key={i} d={"M" + d} />
        ))}
    </svg>
  );
}

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 4, padding: "4px 2px" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            backgroundColor: "#666",
            animation: "sa-dot 1.4s ease-in-out infinite",
            animationDelay: `${i * 0.16}s`,
            display: "inline-block",
          }}
        />
      ))}
    </div>
  );
}

function renderMarkdown(text) {
  const lines = text.split("\n");
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Empty line
    if (line.trim() === "") {
      elements.push(<div key={i} style={{ height: 6 }} />);
      i++;
      continue;
    }

    // Table detection: line with | characters
    if (line.trim().startsWith("|") && line.includes("|")) {
      const tableRows = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        const cells = lines[i]
          .split("|")
          .filter((_, ci) => ci !== 0 && ci !== lines[i].split("|").length - 1);
        const isSeparator = cells.every((c) => /^[-:\s]+$/.test(c));
        if (!isSeparator) {
          tableRows.push({ cells, isHeader: tableRows.length === 0 });
        }
        i++;
      }
      elements.push(
        <div key={`t${i}`} style={{ overflowX: "auto", margin: "8px 0" }}>
          <table
            style={{
              borderCollapse: "collapse",
              width: "100%",
              fontSize: 12.5,
              minWidth: 0,
            }}
          >
            <tbody>
              {tableRows.map((row, ri) => (
                <tr key={ri} style={{ borderBottom: "1px solid #1e1e1e" }}>
                  {row.cells.map((cell, ci) => {
                    const Tag = row.isHeader ? "th" : "td";
                    return (
                      <Tag
                        key={ci}
                        style={{
                          padding: "6px 10px",
                          textAlign: "left",
                          color: row.isHeader ? "#888" : "#c0c0c0",
                          fontWeight: row.isHeader ? 500 : 400,
                          background: row.isHeader ? "#0f0f0f" : "transparent",
                          whiteSpace: "nowrap",
                          fontSize: row.isHeader ? 11 : 12.5,
                          letterSpacing: row.isHeader ? "0.06em" : 0,
                          textTransform: row.isHeader ? "uppercase" : "none",
                          borderBottom: row.isHeader
                            ? "1px solid #222"
                            : "none",
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

    // Heading ##
    if (line.startsWith("## ")) {
      elements.push(
        <div
          key={i}
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#e0e0e0",
            margin: "12px 0 6px",
            letterSpacing: "-0.01em",
          }}
        >
          {line.slice(3)}
        </div>,
      );
      i++;
      continue;
    }
    if (line.startsWith("# ")) {
      elements.push(
        <div
          key={i}
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#e8e8e8",
            margin: "12px 0 6px",
          }}
        >
          {line.slice(2)}
        </div>,
      );
      i++;
      continue;
    }

    // Numbered list: "1. item" or "1 | ..."
    if (/^\d+[.)\s]/.test(line.trim())) {
      const num = line.trim().match(/^(\d+)/)?.[1];
      const text = line.trim().replace(/^\d+[.)\s]+/, "");
      elements.push(
        <div
          key={i}
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 4,
            alignItems: "flex-start",
          }}
        >
          <span
            style={{
              color: "#555",
              fontSize: 12,
              minWidth: 16,
              paddingTop: 1,
              flexShrink: 0,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {num}.
          </span>
          <span style={{ color: "#c0c0c0", fontSize: 13, lineHeight: 1.6 }}>
            {inlineFormat(text)}
          </span>
        </div>,
      );
      i++;
      continue;
    }

    // Bullet: "- item" or "• item" or "· item"
    if (/^[-•·*]\s/.test(line.trim())) {
      const text = line.trim().replace(/^[-•·*]\s+/, "");
      elements.push(
        <div
          key={i}
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 4,
            alignItems: "flex-start",
          }}
        >
          <span
            style={{
              color: "#444",
              fontSize: 14,
              lineHeight: 1.6,
              flexShrink: 0,
              marginTop: 1,
            }}
          >
            ·
          </span>
          <span style={{ color: "#c0c0c0", fontSize: 13, lineHeight: 1.6 }}>
            {inlineFormat(text)}
          </span>
        </div>,
      );
      i++;
      continue;
    }

    // Regular paragraph
    elements.push(
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
  return elements;
}

function inlineFormat(text) {
  // Handle **bold**, *italic*, `code` inline
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
    else if (match[3] !== undefined)
      parts.push(
        <code
          key={match.index}
          style={{
            background: "#1a1a1a",
            color: "#a78bfa",
            padding: "1px 5px",
            borderRadius: 4,
            fontSize: "0.9em",
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

// ── Action Cards rendered inside assistant messages ───────────────────────────
function ActionCard({ action, navigate }) {
  if (!action) return null;

  if (action.type === "redirect") {
    return (
      <div
        style={{
          marginTop: 12,
          background: "#0f0f0f",
          border: "1px solid #222",
          borderRadius: 12,
          padding: "14px 16px",
          animation: "sa-fadein 0.25s ease-out",
        }}
      >
        {/* Samvaadik not connected card */}
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
              background: "#1a1a0a",
              border: "1px solid #2a2800",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
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

        {/* Steps */}
        <div style={{ marginBottom: 14 }}>
          {[
            "Click the button below to go to the connection page",
            "Enter your Samvaadik API key",
            "Verify and save — you're done",
          ].map((step, i) => (
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
                {step}
              </span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={() => navigate(action.route)}
          style={{
            width: "100%",
            padding: "9px 0",
            borderRadius: 9,
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            fontSize: 13,
            fontWeight: 500,
            color: "#fff",
            transition: "opacity 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 21l1.65-3.8a9 9 0 113.4 2.9L3 21" />
          </svg>
          {action.label}
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    );
  }

  return null;
}

// ── Connected summary card ─────────────────────────────────────────────────────
function ConnectedCard({ data }) {
  const fields = [
    { label: "Phone", value: data.business_phone || "—", full: false },
    { label: "Status", value: data.status || "active", full: false },
    { label: "Connected on", value: data.connected_at || "—", full: false },
    {
      label: "Webhook",
      value: data.webhook_set ? "Set ✓" : "Not set",
      full: false,
    },
    // WhatsApp ID gets its own full-width row since it can be long
    { label: "WhatsApp ID", value: data.wa_id || "—", full: true },
  ];

  return (
    <div
      style={{
        marginTop: 12,
        background: "#0a120d",
        border: "1px solid #1a2e1f",
        borderRadius: 12,
        padding: "14px 16px",
        animation: "sa-fadein 0.25s ease-out",
        // Critical: constrain width so nothing bleeds out
        overflow: "hidden",
        minWidth: 0,
        maxWidth: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
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
            background: "#0d1f13",
            border: "1px solid #1a3a1f",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#3ecf8e"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 21l1.65-3.8a9 9 0 113.4 2.9L3 21" />
          </svg>
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
                flexShrink: 0,
                background: "#0d2a1a",
                color: "#3ecf8e",
                border: "1px solid #1a3a22",
              }}
            >
              Active
            </span>
          </div>
          <div style={{ fontSize: 11.5, color: "#3a5a44", marginTop: 2 }}>
            Your WhatsApp account is ready
          </div>
        </div>
      </div>

      {/* 2-col grid for short fields */}
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
                background: "#0d1a10",
                borderRadius: 8,
                padding: "8px 10px",
                minWidth: 0,
                overflow: "hidden", // critical — grid cell must be able to shrink
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: "#2a4a30",
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
                  color: "#7ecfa0",
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

      {/* Full-width row for WhatsApp ID (can be long) */}
      {fields
        .filter((f) => f.full)
        .map(({ label, value }) => (
          <div
            key={label}
            style={{
              background: "#0d1a10",
              borderRadius: 8,
              padding: "8px 10px",
              minWidth: 0,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: "#2a4a30",
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
                color: "#7ecfa0",
                // Word-break instead of ellipsis — shows full ID without overflow
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

function Message({ msg, navigate }) {
  const isUser = msg.role === "user";
  return (
    <div
      style={{
        display: "flex",
        flexDirection: isUser ? "row-reverse" : "row",
        gap: 10,
        marginBottom: 22,
        animation: "sa-fadein 0.2s ease-out",
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
          <Icon name="sparkles" size={13} style={{ color: "#a78bfa" }} />
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
            {/* Render action card if backend sent one */}
            {msg.action && msg.action.type === "redirect" && (
              <ActionCard action={msg.action} navigate={navigate} />
            )}
            {/* Render connected summary card if tool returned connected:true */}
            {msg.connectionData && msg.connectionData.connected && (
              <ConnectedCard data={msg.connectionData} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function FileTypeIcon({ ext }) {
  const icons = {
    csv: {
      d: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
      color: "#6ee7b7",
    },
    xlsx: {
      d: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M8 13l2 2 2-2M8 17l2-2 2 2",
      color: "#4ade80",
    },
    xls: {
      d: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M8 13l2 2 2-2M8 17l2-2 2 2",
      color: "#4ade80",
    },
    pdf: {
      d: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M9 13h1a1 1 0 001-1v-1a1 1 0 00-1-1H9v6M15 13a2 2 0 010 4h-1v-4h1",
      color: "#f87171",
    },
    doc: {
      d: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M9 13h6M9 17h4",
      color: "#60a5fa",
    },
    docx: {
      d: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M9 13h6M9 17h4",
      color: "#60a5fa",
    },
    txt: {
      d: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M9 13h6M9 17h4",
      color: "#888",
    },
  };
  const e = ext.toLowerCase();
  const icon = icons[e] || icons.txt;
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke={icon.color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      {icon.d
        .split("M")
        .filter(Boolean)
        .map((d, i) => (
          <path key={i} d={"M" + d} />
        ))}
    </svg>
  );
}

function FileChip({ file, onRemove }) {
  const ext = file.name.split(".").pop().toLowerCase();
  const colors = {
    csv: "#6ee7b7",
    xlsx: "#4ade80",
    xls: "#4ade80",
    pdf: "#f87171",
    doc: "#60a5fa",
    docx: "#60a5fa",
    txt: "#888",
  };
  const color = colors[ext] || "#a78bfa";
  const sizeStr =
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
        fontSize: 12,
        color: "#aaa",
        maxWidth: 220,
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
        <div style={{ fontSize: 10, color: "#444", marginTop: 1 }}>
          {sizeStr}
        </div>
      </div>
      <button
        onClick={onRemove}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#444",
          padding: "2px",
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
          borderRadius: 4,
          transition: "color 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#888")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#444")}
      >
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────────────────── */
export default function SutrakAssistant() {
  const { getToken } = useKindeAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [error, setError] = useState(null);
  const [showWelcome, setShowWelcome] = useState(true);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const plusMenuRef = useRef(null);

  // Drag state for the trigger button
  const [pos, setPos] = useState({ x: null, y: null });
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const dragStart = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);
  const bubbleRef = useRef(null);

  useEffect(() => {
    if (isOpen && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isOpen]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  // Close plus menu on outside click
  useEffect(() => {
    if (!showPlusMenu) return;
    const handler = (e) => {
      // Close if clicked outside the menu AND outside the + button
      const menu = plusMenuRef.current;
      const btn = document.getElementById("sa-plus-btn");
      if (menu && !menu.contains(e.target) && btn && !btn.contains(e.target)) {
        setShowPlusMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showPlusMenu]);

  // ── Drag ──────────────────────────────────────────────────────────────────
  const onPointerDown = useCallback((e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const rect = bubbleRef.current.getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    dragStart.current = { x: e.clientX, y: e.clientY };
    hasMoved.current = false;
    setDragging(true);
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      if (
        Math.abs(e.clientX - dragStart.current.x) > 4 ||
        Math.abs(e.clientY - dragStart.current.y) > 4
      )
        hasMoved.current = true;
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
    };
    const onUp = () => setDragging(false);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [dragging]);

  const handleBubbleClick = () => {
    if (!hasMoved.current) setIsOpen((o) => !o);
  };

  // ── File upload ───────────────────────────────────────────────────────────
  const ACCEPTED = ".csv,.xlsx,.xls,.doc,.docx,.pdf,.txt";

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setAttachedFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name));
      const newFiles = files.filter((f) => !existing.has(f.name));
      return [...prev, ...newFiles].slice(0, 5); // max 5 files
    });
    setShowPlusMenu(false);
    e.target.value = "";
  };

  const removeFile = (name) =>
    setAttachedFiles((prev) => prev.filter((f) => f.name !== name));

  const getFileType = (file) => {
    const ext = file.name.split(".").pop().toLowerCase();
    if (ext === "csv") return { label: "CSV", color: "#6ee7b7", bg: "#0d2a1e" };
    if (["xlsx", "xls"].includes(ext))
      return { label: "Excel", color: "#4ade80", bg: "#0a2010" };
    if (["doc", "docx"].includes(ext))
      return { label: "Word", color: "#60a5fa", bg: "#0d1a2e" };
    if (ext === "pdf") return { label: "PDF", color: "#f87171", bg: "#2a0d0d" };
    return { label: ext.toUpperCase(), color: "#a78bfa", bg: "#1a0d2a" };
  };

  // ── Send message ──────────────────────────────────────────────────────────
  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || isLoading) return;
    setInput("");
    setError(null);
    setShowWelcome(false);
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }

    const fileNames = attachedFiles.map((f) => f.name);
    const userContent =
      fileNames.length > 0
        ? `${msg}${msg ? "\n\n" : ""}[Attached: ${fileNames.join(", ")}]`
        : msg;

    if (!msg && fileNames.length === 0) return;
    setMessages((prev) => [...prev, { role: "user", content: userContent }]);
    const filesSnapshot = [...attachedFiles];
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
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply,
          action: data.action || null,
          connectionData: data.connectionData || null,
        },
      ]);
      setConversationHistory(data.updatedHistory || []);
    } catch (err) {
      setError(err.message || "Something went wrong");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I ran into an issue. Please try again.",
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
    setCsvFile(null);
  };

  const canSend =
    (input.trim().length > 0 || attachedFiles.length > 0) && !isLoading;

  const bubbleStyle =
    pos.x !== null
      ? {
          position: "fixed",
          left: pos.x,
          top: pos.y,
          bottom: "auto",
          right: "auto",
        }
      : { position: "fixed", bottom: 28, right: 28 };

  return (
    <>
      <style>{`
        @keyframes sa-dot {
          0%, 80%, 100% { opacity: .3; transform: scale(.85); }
          40% { opacity: 1; transform: scale(1); }
        }
        @keyframes sa-fadein {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes sa-slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
        @keyframes sa-slide-out {
          from { transform: translateX(0);   opacity: 1; }
          to   { transform: translateX(100%); opacity: 0; }
        }
        @keyframes sa-pulse-ring {
          0%,100% { box-shadow: 0 0 0 0 rgba(167,139,250,.4); }
          50% { box-shadow: 0 0 0 7px rgba(167,139,250,0); }
        }
        .sa-trigger:hover { transform: scale(1.07) !important; }
        .sa-trigger:active { transform: scale(0.95) !important; }
        .sa-chip-btn:hover { background: #1e1e1e !important; border-color: #333 !important; }
        .sa-plus-item:hover { background: #1a1a1a !important; }
        .sa-hdr-btn:hover { background: #1a1a1a !important; color: #e8e8e8 !important; }
        .sa-qa-btn:hover { background: #1a1a1a !important; border-color: #333 !important; }
        .sa-overlay { pointer-events: none; }
        .sa-overlay.visible { pointer-events: auto; }
        @media (max-width: 768px) {
          .sa-panel { width: 100vw !important; border-left: none !important; }
          .sa-overlay.visible { background: rgba(0,0,0,0.6) !important; pointer-events: auto; }
        }
        .sa-input:focus { outline: none; }
        .sa-input::placeholder { color: #444; }
        .sa-messages { scrollbar-width: thin; scrollbar-color: #2a2a2a transparent; }
        .sa-messages::-webkit-scrollbar { width: 3px; }
        .sa-messages::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 3px; }
      `}</style>

      {/* ── Background overlay (mobile only) ─────────────────────────────── */}
      <div
        className={`sa-overlay${isOpen ? " visible" : ""}`}
        onClick={() => setIsOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9997,
          background: "transparent",
          transition: "background 0.25s",
        }}
      />

      {/* ── Side panel ───────────────────────────────────────────────────── */}
      <div
        className="sa-panel"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(420px, 32vw)",
          minWidth: 340,
          background: "#0a0a0a",
          borderLeft: "1px solid #1c1c1c",
          zIndex: 9998,
          display: "flex",
          flexDirection: "column",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          opacity: isOpen ? 1 : 0,
          transition:
            "transform 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "16px 18px",
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
              border: "1px solid #2a2a2a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="sparkles" size={14} style={{ color: "#a78bfa" }} />
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 13.5,
                fontWeight: 500,
                color: "#e8e8e8",
                letterSpacing: "0.01em",
              }}
            >
              Sutrak Assistant
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#3a3a3a",
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
              <span style={{ color: "#555" }}>Ready</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 2 }}>
            {messages.length > 0 && (
              <button
                className="sa-hdr-btn"
                onClick={clearChat}
                title="New chat"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#444",
                  padding: "6px",
                  borderRadius: 7,
                  display: "flex",
                  alignItems: "center",
                  transition: "background 0.15s, color 0.15s",
                }}
              >
                <Icon name="refresh" size={14} />
              </button>
            )}
            <button
              className="sa-hdr-btn"
              onClick={() => setIsOpen(false)}
              title="Close"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#444",
                padding: "6px",
                borderRadius: 7,
                display: "flex",
                alignItems: "center",
                transition: "background 0.15s, color 0.15s",
              }}
            >
              <Icon name="x" size={15} />
            </button>
          </div>
        </div>

        {/* Messages / Welcome */}
        <div
          className="sa-messages"
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            padding: "20px 18px 8px",
            minWidth: 0,
          }}
        >
          {showWelcome && messages.length === 0 && (
            <div style={{ animation: "sa-fadein 0.3s ease-out" }}>
              <div style={{ marginBottom: 28 }}>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 500,
                    color: "#e8e8e8",
                    marginBottom: 6,
                    letterSpacing: "-0.01em",
                  }}
                >
                  How can I help?
                </div>
                <div style={{ fontSize: 13, color: "#444", lineHeight: 1.6 }}>
                  Create events, manage agents, send WhatsApp templates, and
                  more.
                </div>
              </div>

              {/* Quick action grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                  marginBottom: 24,
                }}
              >
                {QUICK_ACTIONS.map((a) => (
                  <button
                    key={a.label}
                    className="sa-qa-btn"
                    onClick={() => {
                      setShowWelcome(false);
                      sendMessage(a.prompt);
                    }}
                    style={{
                      background: "#0f0f0f",
                      border: "1px solid #1e1e1e",
                      borderRadius: 10,
                      padding: "12px 14px",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "background 0.15s, border-color 0.15s",
                    }}
                  >
                    <div style={{ marginBottom: 6 }}>
                      <Icon name={a.icon} size={15} style={{ color: "#555" }} />
                    </div>
                    <div
                      style={{ fontSize: 12.5, color: "#aaa", fontWeight: 400 }}
                    >
                      {a.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <Message key={i} msg={msg} navigate={navigate} />
          ))}

          {isLoading && (
            <div
              style={{
                display: "flex",
                gap: 10,
                marginBottom: 20,
                animation: "sa-fadein 0.2s ease-out",
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: "#111",
                  border: "1px solid #222",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name="sparkles" size={14} style={{ color: "#a78bfa" }} />
              </div>
              <div style={{ padding: "8px 0" }}>
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
                background: "rgba(248,113,113,0.07)",
                borderRadius: 8,
                border: "1px solid rgba(248,113,113,0.15)",
                marginBottom: 12,
              }}
            >
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div
          style={{
            padding: "10px 12px 14px",
            borderTop: "1px solid #161616",
            flexShrink: 0,
          }}
        >
          {/* Attached files chips */}
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

          {/* Hidden file input */}
          <input
            type="file"
            accept={ACCEPTED}
            multiple
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
          />

          {/* Plus menu — rendered at panel level so overflow never clips it */}
          {showPlusMenu && (
            <div
              ref={plusMenuRef}
              style={{
                position: "fixed",
                bottom: 90,
                right: 12,
                width: "min(396px, 32vw - 24px)",
                background: "#111",
                border: "1px solid #252525",
                borderRadius: 14,
                padding: "8px",
                zIndex: 200,
                boxShadow: "0 -8px 40px rgba(0,0,0,0.7)",
                animation: "sa-fadein 0.15s ease-out",
              }}
            >
              {/* Attach files section */}
              <div
                style={{
                  padding: "4px 8px 6px",
                  fontSize: 10,
                  color: "#3a3a3a",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontWeight: 500,
                }}
              >
                Attach file
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 4,
                  marginBottom: 6,
                }}
              >
                {[
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
                  {
                    ext: "pdf",
                    color: "#f87171",
                    bg: "#280a0a",
                    label: "PDF",
                    sub: "Any PDF",
                  },
                ].map((ft) => (
                  <button
                    key={ft.ext}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 10px",
                      borderRadius: 9,
                      background: "#0d0d0d",
                      border: "1px solid #1c1c1c",
                      cursor: "pointer",
                      transition: "background 0.15s, border-color 0.15s",
                      textAlign: "left",
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
                        borderRadius: 7,
                        flexShrink: 0,
                        background: ft.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <FileTypeIcon ext={ft.ext} />
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 500,
                          color: "#d0d0d0",
                        }}
                      >
                        {ft.label}
                      </div>
                      <div
                        style={{ fontSize: 10.5, color: "#444", marginTop: 1 }}
                      >
                        {ft.sub}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Divider */}
              <div
                style={{
                  height: "1px",
                  background: "#1c1c1c",
                  margin: "4px 0 8px",
                }}
              />

              {/* Quick actions section */}
              <div
                style={{
                  padding: "0 8px 6px",
                  fontSize: 10,
                  color: "#3a3a3a",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontWeight: 500,
                }}
              >
                Quick actions
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 4,
                }}
              >
                {QUICK_ACTIONS.map((a) => (
                  <button
                    key={a.label}
                    onClick={() => {
                      setShowPlusMenu(false);
                      setShowWelcome(false);
                      sendMessage(a.prompt);
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
                      transition: "background 0.15s, border-color 0.15s",
                      textAlign: "left",
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
                    <Icon
                      name={a.icon}
                      size={14}
                      style={{ color: "#555", flexShrink: 0 }}
                    />
                    <span style={{ fontSize: 12, color: "#999" }}>
                      {a.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input box — NO overflow:hidden so the menu above is separate */}
          <div
            style={{
              background: "#0f0f0f",
              border: "1px solid " + (showPlusMenu ? "#2a2a2a" : "#1e1e1e"),
              borderRadius: 13,
              transition: "border-color 0.2s",
            }}
          >
            <textarea
              ref={inputRef}
              className="sa-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              rows={1}
              disabled={isLoading}
              style={{
                width: "100%",
                border: "none",
                background: "transparent",
                padding: "12px 14px 6px",
                fontSize: 13.5,
                lineHeight: 1.55,
                resize: "none",
                color: "#e0e0e0",
                fontFamily: "inherit",
                maxHeight: 110,
                overflowY: "auto",
                boxSizing: "border-box",
                outline: "none",
              }}
              onInput={(e) => {
                e.target.style.height = "auto";
                e.target.style.height =
                  Math.min(e.target.scrollHeight, 110) + "px";
              }}
              onFocus={(e) => {
                e.target.closest("div").style.borderColor = "#333";
              }}
              onBlur={(e) => {
                if (!showPlusMenu)
                  e.target.closest("div").style.borderColor = "#1e1e1e";
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
                id="sa-plus-btn"
                onClick={() => setShowPlusMenu((p) => !p)}
                title="Attach files or quick actions"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 7,
                  background: showPlusMenu ? "#1e1e1e" : "transparent",
                  border:
                    "1px solid " + (showPlusMenu ? "#333" : "transparent"),
                  cursor: "pointer",
                  color: showPlusMenu ? "#a78bfa" : "#555",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s",
                  flexShrink: 0,
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
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>

              <div style={{ flex: 1 }} />

              {/* Hint text */}
              <span style={{ fontSize: 10.5, color: "#2e2e2e" }}>
                {input.length > 0 ? `${input.length} chars` : "⏎ send"}
              </span>

              {/* Send button */}
              <button
                onClick={() => sendMessage()}
                disabled={!canSend}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 7,
                  border: "none",
                  background: canSend ? "#a78bfa" : "#1a1a1a",
                  cursor: canSend ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginLeft: 4,
                  transition: "background 0.2s, transform 0.1s",
                }}
                onMouseEnter={(e) => {
                  if (canSend) e.currentTarget.style.background = "#9061f9";
                }}
                onMouseLeave={(e) => {
                  if (canSend) e.currentTarget.style.background = "#a78bfa";
                }}
                onMouseDown={(e) => {
                  if (canSend) e.currentTarget.style.transform = "scale(0.9)";
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={canSend ? "#fff" : "#333"}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>

          <div
            style={{
              fontSize: 10.5,
              color: "#252525",
              textAlign: "center",
              marginTop: 9,
            }}
          >
            Sutrak Assistant · Shift+Enter for new line
          </div>
        </div>
      </div>

      {/* ── Trigger button (draggable) ───────────────────────────────────── */}
      <div
        ref={bubbleRef}
        style={{
          ...bubbleStyle,
          zIndex: 9999,
          userSelect: "none",
          cursor: dragging ? "grabbing" : "pointer",
        }}
        onPointerDown={onPointerDown}
        onClick={handleBubbleClick}
      >
        <button
          className="sa-trigger"
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: isOpen ? "#1a1a1a" : "#111",
            border: "1px solid " + (isOpen ? "#333" : "#222"),
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "transform 0.15s ease, background 0.2s",
            animation: isOpen
              ? "none"
              : "sa-pulse-ring 2.5s ease-in-out infinite",
            boxShadow: "0 2px 12px rgba(0,0,0,0.5)",
            position: "relative",
          }}
        >
          {!isOpen && (
            <div
              style={{
                position: "absolute",
                top: 1,
                right: 1,
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#3ecf8e",
                border: "1.5px solid #0a0a0a",
              }}
            />
          )}
          {isOpen ? (
            <Icon name="x" size={16} style={{ color: "#777" }} />
          ) : (
            <Icon name="sparkles" size={17} style={{ color: "#a78bfa" }} />
          )}
        </button>
      </div>
    </>
  );
}
