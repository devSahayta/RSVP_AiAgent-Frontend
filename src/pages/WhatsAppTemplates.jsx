// pages/WhatsAppTemplates.jsx
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { useNavigate } from "react-router-dom";
import {
  RefreshCw,
  Search,
  ExternalLink,
  Image,
  Video,
  Type,
  Link2,
  Variable,
  Clock,
  CheckCircle2,
  ChevronDown,
  MessageSquare,
  AlertCircle,
  Plug,
  X,
  Eye,
} from "lucide-react";

const api = (token) => ({
  get: (url) =>
    fetch(`${import.meta.env.VITE_BACKEND_URL}${url}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json()),
});

const fmtDate = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// Category config — accent line color only, everything else stays neutral
const CAT_COLOR = {
  MARKETING: "#818cf8",
  UTILITY: "#34d399",
  AUTHENTICATION: "#fb923c",
};
const getCatColor = (c) => CAT_COLOR[c] || "#52525b";

const HEADER_ICONS = {
  TEXT: <Type size={13} />,
  IMAGE: <Image size={13} />,
  VIDEO: <Video size={13} />,
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Skeleton = () => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
      gap: 12,
    }}
  >
    {Array.from({ length: 6 }).map((_, i) => (
      <div
        key={i}
        style={{
          height: 148,
          borderRadius: 14,
          background: "#111113",
          border: "1px solid #1f1f23",
          opacity: 1 - i * 0.1,
        }}
      />
    ))}
  </div>
);

// ─── Template card ────────────────────────────────────────────────────────────
const TemplateCard = ({ t, selected, onSelect, pickerMode, onPreview }) => {
  const [open, setOpen] = useState(false);
  const hasVars = t.variables?.length > 0;
  const hasBtns = t.buttons?.length > 0;
  const accentCol = getCatColor(t.category);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => (pickerMode ? onSelect(t) : onPreview && onPreview(t))}
      style={{
        borderRadius: 14,
        border: selected ? `1.5px solid ${accentCol}` : "1px solid #1f1f23",
        cursor: "pointer",
        overflow: "hidden",
        height: 148,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        transition: "border-color 0.15s, box-shadow 0.15s",
        background: "#0f0f13",
        // Subtle reflection shimmer using box-shadow trick
        boxShadow: selected
          ? `0 0 0 3px ${accentCol}22, inset 0 1px 0 rgba(255,255,255,0.04)`
          : "inset 0 1px 0 rgba(255,255,255,0.03), 0 2px 8px rgba(0,0,0,0.4)",
      }}
      whileHover={{
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 16px rgba(0,0,0,0.5)`,
        borderColor: "#27272a",
        y: -2,
        transition: { duration: 0.15 },
      }}
    >
      {/* Accent top line */}
      <div
        style={{
          height: 2,
          background: accentCol,
          opacity: 0.7,
          flexShrink: 0,
        }}
      />

      {/* Main content — fills remaining space */}
      <div
        style={{
          padding: "12px 14px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Top: icon + name + expand */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              flexShrink: 0,
              background: `${accentCol}18`,
              border: `1px solid ${accentCol}30`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: accentCol,
            }}
          >
            {HEADER_ICONS[t.header_format] || <MessageSquare size={13} />}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                color: "#e4e4e7",
                fontWeight: 600,
                fontSize: 12.5,
                fontFamily: "'Trebuchet MS', 'Gill Sans', Verdana, sans-serif",
                margin: "0 0 2px",
                lineHeight: 1.3,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {t.name}
            </p>
            <p
              style={{
                color: accentCol,
                fontSize: 10,
                fontWeight: 600,
                margin: 0,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              {t.category}
            </p>
          </div>

          {pickerMode ? (
            selected && (
              <CheckCircle2
                size={15}
                style={{ color: accentCol, flexShrink: 0, marginTop: 2 }}
              />
            )
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                flexShrink: 0,
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPreview && onPreview(t);
                }}
                title="Preview template"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#3f3f46",
                  padding: 2,
                  display: "flex",
                  transition: "color 0.12s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#71717a")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#3f3f46")}
              >
                <Eye size={13} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen((v) => !v);
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#3f3f46",
                  padding: 2,
                  display: "flex",
                  transition: "color 0.12s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#71717a")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#3f3f46")}
              >
                <ChevronDown
                  size={13}
                  style={{
                    transform: open ? "rotate(180deg)" : "none",
                    transition: "transform 0.15s",
                  }}
                />
              </button>
            </div>
          )}
        </div>

        {/* Middle: badges */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          <span
            style={{
              padding: "2px 7px",
              borderRadius: 20,
              fontSize: 10,
              background: "rgba(59,130,246,0.1)",
              border: "1px solid rgba(59,130,246,0.2)",
              color: "#60a5fa",
              fontFamily: "system-ui",
            }}
          >
            {t.language}
          </span>
          {t.header_format && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 3,
                padding: "2px 7px",
                borderRadius: 20,
                fontSize: 10,
                background: "rgba(251,191,36,0.1)",
                border: "1px solid rgba(251,191,36,0.2)",
                color: "#fbbf24",
                fontFamily: "system-ui",
              }}
            >
              {HEADER_ICONS[t.header_format]} {t.header_format}
            </span>
          )}
          {hasVars && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 3,
                padding: "2px 7px",
                borderRadius: 20,
                fontSize: 10,
                background: "rgba(167,139,250,0.1)",
                border: "1px solid rgba(167,139,250,0.2)",
                color: "#a78bfa",
                fontFamily: "system-ui",
              }}
            >
              <Variable size={9} /> {t.variables.length} var
              {t.variables.length !== 1 ? "s" : ""}
            </span>
          )}
          {hasBtns && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 3,
                padding: "2px 7px",
                borderRadius: 20,
                fontSize: 10,
                background: "rgba(45,212,191,0.1)",
                border: "1px solid rgba(45,212,191,0.2)",
                color: "#2dd4bf",
                fontFamily: "system-ui",
              }}
            >
              <Link2 size={9} /> {t.buttons.length} btn
              {t.buttons.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Bottom: date */}
        <p
          style={{
            color: "#3f3f46",
            fontSize: 10.5,
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontFamily: "system-ui",
          }}
        >
          <Clock size={9} /> {fmtDate(t.created_at)}
        </p>
      </div>

      {/* Expand drawer (overlays the card) — only in non-picker mode */}
      <AnimatePresence>
        {open && !pickerMode && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.16 }}
            style={{
              position: "absolute",
              inset: 0,
              top: 2,
              background: "#0e0e12",
              borderTop: `1px solid ${accentCol}40`,
              overflowY: "auto",
              padding: "12px 14px 12px",
              zIndex: 2,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <p
                style={{
                  color: "#a1a1aa",
                  fontWeight: 600,
                  fontSize: 12,
                  margin: 0,
                  fontFamily: "'Trebuchet MS', Verdana, sans-serif",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: 180,
                }}
              >
                {t.name}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#3f3f46",
                  padding: 2,
                  display: "flex",
                }}
              >
                <ChevronDown
                  size={13}
                  style={{ transform: "rotate(180deg)" }}
                />
              </button>
            </div>

            {hasVars && (
              <div style={{ marginBottom: 8 }}>
                <p
                  style={{
                    fontSize: 9.5,
                    fontWeight: 700,
                    color: "#3f3f46",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    margin: "0 0 5px",
                  }}
                >
                  Variables
                </p>
                {t.variables.map((v, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "3px 8px",
                      borderRadius: 6,
                      background: "#111113",
                      border: "1px solid #1f1f23",
                      marginBottom: 3,
                    }}
                  >
                    <code
                      style={{
                        fontSize: 10,
                        color: accentCol,
                        fontFamily: "monospace",
                        flexShrink: 0,
                      }}
                    >{`{{${i + 1}}}`}</code>
                    <span style={{ color: "#52525b", fontSize: 10 }}>→</span>
                    <span
                      style={{
                        fontSize: 10,
                        color: "#a1a1aa",
                        fontFamily: "monospace",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {v}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {hasBtns && (
              <div>
                <p
                  style={{
                    fontSize: 9.5,
                    fontWeight: 700,
                    color: "#3f3f46",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    margin: "0 0 5px",
                  }}
                >
                  Buttons
                </p>
                {t.buttons.map((b, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "4px 8px",
                      borderRadius: 6,
                      background: "#111113",
                      border: "1px solid #1f1f23",
                      marginBottom: 3,
                    }}
                  >
                    <span
                      style={{
                        padding: "1px 5px",
                        borderRadius: 3,
                        background: "#1c1c1f",
                        color: "#52525b",
                        fontSize: 8.5,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        flexShrink: 0,
                      }}
                    >
                      {b.type}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: "#d4d4d8",
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {b.text}
                    </span>
                    {b.url && (
                      <a
                        href={b.url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          color: "#52525b",
                          display: "flex",
                          flexShrink: 0,
                        }}
                      >
                        <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}

            {!hasVars && !hasBtns && (
              <p
                style={{
                  color: "#3f3f46",
                  fontSize: 11,
                  textAlign: "center",
                  margin: "16px 0 0",
                }}
              >
                No variables or buttons
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── WhatsApp Preview Modal ───────────────────────────────────────────────────
const WhatsAppPreviewModal = ({ template, onClose }) => {
  const { getToken } = useKindeAuth();
  const loading = template?._loading;
  const [mediaUrl, setMediaUrl] = useState(null);
  const [mediaLoading, setMediaLoading] = useState(false);

  // Parse helpers
  const safeParse = (val) => {
    if (!val) return null;
    if (typeof val === "object") return val;
    try {
      return JSON.parse(val);
    } catch {
      return null;
    }
  };

  // Use preview.components → fallback to components
  const rawComps = template?.preview?.components || template?.components || [];
  const components = Array.isArray(rawComps)
    ? rawComps
    : safeParse(rawComps) || [];

  const header = components.find((c) => c.type === "HEADER");
  const body = components.find((c) => c.type === "BODY");
  const footer = components.find((c) => c.type === "FOOTER");
  const btnComp = components.find((c) => c.type === "BUTTONS");

  // Buttons
  const rawBtns = btnComp?.buttons || template?.buttons || [];
  const buttons = Array.isArray(rawBtns) ? rawBtns : safeParse(rawBtns) || [];

  const hasMedia = header?.format === "IMAGE" || header?.format === "VIDEO";

  // Build authenticated media stream URL
  // Sutrak backend streams image bytes directly (Samvaadik fetches from Meta with token)
  useEffect(() => {
    if (!hasMedia || !template?.wt_id || loading) return;
    const buildUrl = async () => {
      try {
        const token = await getToken();
        // We need to pass auth token — use a signed URL approach via fetch + blob
        setMediaLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/samvaadik/templates/${template.wt_id}/media`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (response.ok) {
          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);
          setMediaUrl(blobUrl);
        }
      } catch (err) {
        console.error("Media stream error:", err);
      } finally {
        setMediaLoading(false);
      }
    };
    buildUrl();
    // Cleanup blob URL on unmount
    return () => {
      if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    };
  }, [template?.wt_id, loading]);

  // Replace {{N}} placeholders with sample values
  const vars = Array.isArray(template?.variables) ? template.variables : [];
  const renderBody = (text) => {
    if (!text) return "";
    return text.replace(/\{\{(\d+)\}\}/g, (_, n) => {
      const val = vars[parseInt(n) - 1];
      return val ? `[${val}]` : `{{${n}}}`;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(6px)",
        zIndex: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 12 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        style={{
          width: "100%",
          maxWidth: 400,
          background: "#111113",
          borderRadius: 20,
          border: "1px solid #1f1f23",
          overflow: "hidden",
          boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
        }}
      >
        {/* Modal header */}
        <div
          style={{
            padding: "14px 16px 12px",
            borderBottom: "1px solid #1f1f23",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <p
              style={{
                color: "#e4e4e7",
                fontWeight: 700,
                fontSize: 14,
                margin: 0,
                fontFamily: "'Trebuchet MS', Verdana, sans-serif",
              }}
            >
              {template?.name}
            </p>
            <p style={{ color: "#52525b", fontSize: 11, margin: "2px 0 0" }}>
              Template Preview
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#3f3f46",
              cursor: "pointer",
              padding: 6,
              borderRadius: 6,
              display: "flex",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#71717a")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#3f3f46")}
          >
            <X size={15} />
          </button>
        </div>

        {/* Phone mock */}
        <div style={{ padding: "20px 20px 16px", background: "#0e0e10" }}>
          {/* WhatsApp-like chat background */}
          <div
            style={{
              borderRadius: 14,
              background: "#0f1e0f",
              padding: "12px 10px",
              minHeight: 120,
              backgroundImage:
                "radial-gradient(circle at 20% 80%, rgba(37,211,102,0.03) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(37,211,102,0.02) 0%, transparent 50%)",
            }}
          >
            {loading ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "32px 0",
                  gap: 8,
                  color: "#52525b",
                }}
              >
                <RefreshCw
                  size={14}
                  style={{
                    animation: "spin 1s linear infinite",
                    color: "#25d366",
                  }}
                />
                <span style={{ fontSize: 13 }}>Loading preview...</span>
              </div>
            ) : (
              /* Message bubble */
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div
                  style={{
                    maxWidth: "90%",
                    borderRadius: "12px 2px 12px 12px",
                    background: "#005c4b",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
                    overflow: "hidden",
                  }}
                >
                  {/* HEADER — Image */}
                  {header?.format === "IMAGE" &&
                    (mediaLoading ? (
                      <div
                        style={{
                          background: "#003d2e",
                          padding: "24px",
                          textAlign: "center",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                        }}
                      >
                        <RefreshCw
                          size={13}
                          style={{
                            animation: "spin 1s linear infinite",
                            color: "#25d366",
                          }}
                        />
                        <span style={{ color: "#25d366", fontSize: 11 }}>
                          Loading image...
                        </span>
                      </div>
                    ) : mediaUrl ? (
                      <img
                        src={mediaUrl}
                        alt="Template header"
                        style={{
                          width: "100%",
                          maxHeight: 200,
                          objectFit: "cover",
                          display: "block",
                        }}
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling &&
                            (e.target.nextSibling.style.display = "flex");
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          background: "#003d2e",
                          padding: "20px",
                          textAlign: "center",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <Image size={18} style={{ color: "#25d366" }} />
                        <span style={{ color: "#25d366", fontSize: 11 }}>
                          No image preview
                        </span>
                      </div>
                    ))}

                  {/* HEADER — Video */}
                  {header?.format === "VIDEO" &&
                    (mediaLoading ? (
                      <div
                        style={{
                          background: "#003d2e",
                          padding: "24px",
                          textAlign: "center",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                        }}
                      >
                        <RefreshCw
                          size={13}
                          style={{
                            animation: "spin 1s linear infinite",
                            color: "#25d366",
                          }}
                        />
                        <span style={{ color: "#25d366", fontSize: 11 }}>
                          Loading video...
                        </span>
                      </div>
                    ) : mediaUrl ? (
                      <video
                        src={mediaUrl}
                        controls
                        style={{
                          width: "100%",
                          maxHeight: 220,
                          display: "block",
                          background: "#000",
                        }}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          background: "#003d2e",
                          padding: "20px",
                          textAlign: "center",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            background: "rgba(37,211,102,0.15)",
                            border: "1px solid rgba(37,211,102,0.3)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Video size={18} style={{ color: "#25d366" }} />
                        </div>
                        <span style={{ color: "#25d366", fontSize: 11 }}>
                          No video preview
                        </span>
                      </div>
                    ))}

                  {/* HEADER — TEXT */}
                  {header?.format === "TEXT" && header?.text && (
                    <div
                      style={{
                        padding: "10px 12px 6px",
                        borderBottom: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <p
                        style={{
                          color: "#e9edef",
                          fontWeight: 700,
                          fontSize: 14,
                          margin: 0,
                          lineHeight: 1.4,
                        }}
                      >
                        {header.text}
                      </p>
                    </div>
                  )}

                  {/* BODY */}
                  {body?.text && (
                    <div style={{ padding: "10px 12px 6px" }}>
                      <p
                        style={{
                          color: "#e9edef",
                          fontSize: 13.5,
                          margin: 0,
                          lineHeight: 1.55,
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                        }}
                      >
                        {renderBody(body.text)}
                      </p>
                    </div>
                  )}

                  {/* FOOTER */}
                  {footer?.text && (
                    <div style={{ padding: "2px 12px 8px" }}>
                      <p
                        style={{
                          color: "#8696a0",
                          fontSize: 11.5,
                          margin: 0,
                          lineHeight: 1.4,
                        }}
                      >
                        {footer.text}
                      </p>
                    </div>
                  )}

                  {/* Timestamp */}
                  <div
                    style={{
                      padding: "0 10px 6px",
                      display: "flex",
                      justifyContent: "flex-end",
                    }}
                  >
                    <span style={{ color: "#8696a0", fontSize: 10 }}>
                      12:00 PM ✓✓
                    </span>
                  </div>

                  {/* BUTTONS */}
                  {buttons.length > 0 && (
                    <div
                      style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
                    >
                      {buttons.map((btn, i) => (
                        <div
                          key={i}
                          style={{
                            padding: "10px 12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                            borderBottom:
                              i < buttons.length - 1
                                ? "1px solid rgba(255,255,255,0.06)"
                                : "none",
                          }}
                        >
                          <Link2
                            size={12}
                            style={{ color: "#53bdeb", flexShrink: 0 }}
                          />
                          <span
                            style={{
                              color: "#53bdeb",
                              fontSize: 13,
                              fontWeight: 500,
                            }}
                          >
                            {btn.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Meta info footer */}
        <div
          style={{
            padding: "10px 16px 14px",
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
          }}
        >
          <span
            style={{
              padding: "2px 8px",
              borderRadius: 20,
              fontSize: 10,
              fontWeight: 600,
              background: "rgba(59,130,246,0.1)",
              border: "1px solid rgba(59,130,246,0.2)",
              color: "#60a5fa",
            }}
          >
            {template?.language}
          </span>
          <span
            style={{
              padding: "2px 8px",
              borderRadius: 20,
              fontSize: 10,
              fontWeight: 600,
              background: "#1c1c1f",
              border: "1px solid #27272a",
              color: "#71717a",
            }}
          >
            {template?.category}
          </span>
          {vars.length > 0 && (
            <span
              style={{
                padding: "2px 8px",
                borderRadius: 20,
                fontSize: 10,
                fontWeight: 600,
                background: "rgba(167,139,250,0.1)",
                border: "1px solid rgba(167,139,250,0.2)",
                color: "#a78bfa",
              }}
            >
              {vars.length} variable{vars.length !== 1 ? "s" : ""}
            </span>
          )}
          <span
            style={{
              marginLeft: "auto",
              padding: "2px 8px",
              borderRadius: 20,
              fontSize: 10,
              fontWeight: 600,
              background: "rgba(52,211,153,0.1)",
              border: "1px solid rgba(52,211,153,0.2)",
              color: "#34d399",
            }}
          >
            ✓ APPROVED
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Core UI ──────────────────────────────────────────────────────────────────
const TemplatesUI = ({ pickerMode = false, onSelect, selectedId }) => {
  const { getToken } = useKindeAuth();
  const navigate = useNavigate();

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("ALL");

  const load = async (silent = false) => {
    try {
      silent ? setRefreshing(true) : setLoading(true);
      setError(null);
      const token = await getToken();
      const result = await api(token).get("/api/samvaadik/templates");
      if (result.success) setTemplates(result.data || []);
      else if (result.error?.includes("No active Samvaadik"))
        setError("not_connected");
      else setError(result.error || "Failed to load templates");
    } catch {
      setError("Failed to load templates");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Preview state
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const openPreview = async (t) => {
    setPreviewTemplate({ ...t, _loading: true });
    setPreviewLoading(true);
    try {
      const token = await getToken();
      const result = await api(token).get(
        `/api/samvaadik/templates/${t.wt_id}`,
      );
      if (result.success) {
        setPreviewTemplate({ ...result.data, _loading: false });
      } else {
        // fallback: show what we already have from list
        setPreviewTemplate({ ...t, _loading: false });
      }
    } catch {
      setPreviewTemplate({ ...t, _loading: false });
    } finally {
      setPreviewLoading(false);
    }
  };

  const categories = useMemo(
    () => ["ALL", ...[...new Set(templates.map((t) => t.category))]],
    [templates],
  );

  const filtered = useMemo(
    () =>
      templates.filter((t) => {
        const matchCat = catFilter === "ALL" || t.category === catFilter;
        const matchSearch =
          !search.trim() ||
          t.name.toLowerCase().includes(search.toLowerCase()) ||
          t.category.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
      }),
    [templates, catFilter, search],
  );

  if (!loading && error === "not_connected")
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          padding: "48px 24px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "#111113",
            border: "1px solid #1f1f23",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Plug size={18} style={{ color: "#3f3f46" }} />
        </div>
        <div>
          <p
            style={{
              color: "#e4e4e7",
              fontWeight: 600,
              fontSize: 14,
              margin: "0 0 4px",
            }}
          >
            Samvaadik not connected
          </p>
          <p style={{ color: "#52525b", fontSize: 13, margin: 0 }}>
            Connect your account to view WhatsApp templates.
          </p>
        </div>
        <button
          onClick={() => navigate("/settings/samvaadik")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 16px",
            borderRadius: 8,
            border: "1px solid #27272a",
            background: "#1c1c1f",
            color: "#d4d4d8",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <Plug size={13} /> Connect Samvaadik
        </button>
      </div>
    );

  if (!loading && error && error !== "not_connected")
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "16px",
          borderRadius: 10,
          background: "rgba(239,68,68,0.05)",
          border: "1px solid rgba(239,68,68,0.15)",
        }}
      >
        <AlertCircle size={14} style={{ color: "#f87171", flexShrink: 0 }} />
        <p style={{ color: "#fca5a5", fontSize: 13, margin: 0, flex: 1 }}>
          {error}
        </p>
        <button
          onClick={() => load()}
          style={{
            background: "none",
            border: "none",
            color: "#71717a",
            cursor: "pointer",
            fontSize: 12,
          }}
        >
          Retry
        </button>
      </div>
    );

  return (
    <div>
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 14,
          alignItems: "center",
        }}
      >
        <div style={{ position: "relative", flex: 1, minWidth: 160 }}>
          <Search
            size={13}
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#3f3f46",
              pointerEvents: "none",
            }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates..."
            style={{
              width: "100%",
              padding: "8px 12px 8px 30px",
              background: "#111113",
              border: "1px solid #1f1f23",
              borderRadius: 8,
              color: "#e4e4e7",
              fontSize: 13,
              outline: "none",
              boxSizing: "border-box",
              fontFamily: "inherit",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#27272a")}
            onBlur={(e) => (e.target.style.borderColor = "#1f1f23")}
          />
        </div>

        {categories.map((cat) => {
          const active = catFilter === cat;
          const col = getCatColor(cat);
          return (
            <button
              key={cat}
              onClick={() => setCatFilter(cat)}
              style={{
                padding: "5px 12px",
                borderRadius: 20,
                border:
                  active && cat !== "ALL"
                    ? `1px solid ${col}50`
                    : "1px solid #1f1f23",
                background:
                  active && cat !== "ALL"
                    ? `${col}15`
                    : active
                      ? "#1c1c1f"
                      : "transparent",
                color:
                  active && cat !== "ALL"
                    ? col
                    : active
                      ? "#d4d4d8"
                      : "#52525b",
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.12s",
                fontFamily: "inherit",
              }}
            >
              {cat}
            </button>
          );
        })}

        <button
          onClick={() => load(true)}
          disabled={refreshing}
          style={{
            display: "flex",
            padding: "7px 9px",
            borderRadius: 8,
            border: "1px solid #1f1f23",
            background: "transparent",
            color: "#3f3f46",
            cursor: "pointer",
          }}
        >
          <RefreshCw
            size={12}
            style={{
              animation: refreshing ? "spin 1s linear infinite" : "none",
            }}
          />
        </button>
      </div>

      {!loading && (
        <p style={{ color: "#3f3f46", fontSize: 11, margin: "0 0 12px" }}>
          {filtered.length} template{filtered.length !== 1 ? "s" : ""}
        </p>
      )}

      {loading && <Skeleton />}

      {!loading && filtered.length === 0 && !error && (
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <MessageSquare
            size={22}
            style={{ margin: "0 auto 8px", opacity: 0.2, color: "#71717a" }}
          />
          <p style={{ color: "#52525b", fontSize: 13, margin: 0 }}>
            No templates match
          </p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: pickerMode
              ? "1fr"
              : "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 12,
            alignItems: "start",
          }}
        >
          {filtered.map((t, i) => (
            <motion.div
              key={t.wt_id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.025 }}
            >
              <TemplateCard
                t={t}
                selected={selectedId === t.wt_id}
                onSelect={onSelect}
                pickerMode={pickerMode}
                onPreview={openPreview}
              />
            </motion.div>
          ))}
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Template preview modal */}
      <AnimatePresence>
        {previewTemplate && (
          <WhatsAppPreviewModal
            template={previewTemplate}
            onClose={() => setPreviewTemplate(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Full page ────────────────────────────────────────────────────────────────
const WhatsAppTemplates = () => (
  <div
    style={{
      minHeight: "100vh",
      background: "#0a0a0e",
      color: "#fff",
      padding: "32px 16px 48px",
    }}
  >
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 28 }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <p
              style={{
                color: "#52525b",
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                margin: "0 0 6px",
              }}
            >
              WhatsApp
            </p>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 700,
                margin: "0 0 5px",
                color: "#f4f4f5",
                letterSpacing: "-0.02em",
              }}
            >
              Message Templates
            </h1>
            <p style={{ color: "#52525b", fontSize: 13, margin: 0 }}>
              Approved templates from your Samvaadik account.
            </p>
          </div>
          <a
            href="https://samvaadik.com/templates"
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "7px 13px",
              borderRadius: 8,
              border: "1px solid #27272a",
              background: "#111113",
              color: "#71717a",
              fontSize: 12,
              fontWeight: 600,
              textDecoration: "none",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#a1a1aa")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#71717a")}
          >
            Manage in Samvaadik <ExternalLink size={11} />
          </a>
        </div>
      </motion.div>

      <TemplatesUI pickerMode={false} />
    </div>
  </div>
);

export default WhatsAppTemplates;

// ─── Picker ───────────────────────────────────────────────────────────────────
export const TemplatePicker = ({
  onSelect,
  onClose,
  initialSelected = null,
}) => {
  const [selected, setSelected] = useState(initialSelected);
  const handleSelect = (t) => {
    setSelected(t.wt_id);
    onSelect(t);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(4px)",
          zIndex: 50,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
        }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: "spring", stiffness: 340, damping: 32 }}
          style={{
            width: "100%",
            maxWidth: 520,
            maxHeight: "85vh",
            background: "#111113",
            borderRadius: "18px 18px 0 0",
            border: "1px solid #1f1f23",
            borderBottom: "none",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "12px 16px 10px",
              borderBottom: "1px solid #1f1f23",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 32,
                height: 3,
                borderRadius: 2,
                background: "#27272a",
                margin: "0 auto 12px",
              }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <p
                  style={{
                    color: "#f0f0f4",
                    fontWeight: 700,
                    fontSize: 14,
                    margin: 0,
                  }}
                >
                  Choose Template
                </p>
                <p
                  style={{ color: "#52525b", fontSize: 12, margin: "2px 0 0" }}
                >
                  Select a template to send to participants
                </p>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: "none",
                  border: "none",
                  color: "#3f3f46",
                  cursor: "pointer",
                  padding: 6,
                  borderRadius: 6,
                  display: "flex",
                }}
              >
                <X size={15} />
              </button>
            </div>
          </div>
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "12px 14px",
              background: "#0e0e10",
            }}
          >
            <TemplatesUI
              pickerMode
              selectedId={selected}
              onSelect={handleSelect}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
