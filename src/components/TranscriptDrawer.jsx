// components/TranscriptDrawer.jsx
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Bot,
  User,
  Loader2,
  AlertCircle,
  Clock3,
  PhoneCall,
  Mic,
  BarChart2,
  MessageSquare,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  Volume2,
  Calendar,
  TrendingUp,
} from "lucide-react";

// ─── helpers ──────────────────────────────────────────────────────────────────
const fmtDuration = (s) => {
  if (!s) return null;
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}m ${String(sec).padStart(2, "0")}s`;
};
const fmtCallTime = (s) => {
  if (s === null || s === undefined) return null;
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
};
const fmtDate = (unixSecs) => {
  if (!unixSecs) return null;
  return new Date(unixSecs * 1000).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
};
const outcomeColor = (o) => {
  if (!o) return { bg: "#1a1a1a", border: "#2a2a2a", text: "#6b7280" };
  if (o === "completed" || o === "done")
    return { bg: "#064e3b", border: "#065f46", text: "#34d399" };
  if (o === "failed" || o === "no_answer")
    return { bg: "#450a0a", border: "#7f1d1d", text: "#f87171" };
  return { bg: "#1c1a08", border: "#3d3207", text: "#fbbf24" };
};

// ─── Audio Player ─────────────────────────────────────────────────────────────
const AudioPlayer = ({ src }) => {
  const audioRef = useRef(null);
  const barRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onLoad = () => {
      setDuration(a.duration);
      setLoading(false);
    };
    const onTime = () => setCurrent(a.currentTime);
    const onEnd = () => setPlaying(false);
    const onErr = () => {
      setError(true);
      setLoading(false);
    };
    a.addEventListener("loadedmetadata", onLoad);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("ended", onEnd);
    a.addEventListener("error", onErr);
    return () => {
      a.removeEventListener("loadedmetadata", onLoad);
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("ended", onEnd);
      a.removeEventListener("error", onErr);
    };
  }, []);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.play();
      setPlaying(true);
    }
  };

  const seek = (e) => {
    if (!barRef.current || !audioRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audioRef.current.currentTime = pct * duration;
  };

  const pct = duration ? (current / duration) * 100 : 0;

  const fmtTime = (s) => {
    if (!s || isNaN(s)) return "0:00";
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  };

  if (error)
    return (
      <div
        style={{
          padding: "12px 16px",
          borderRadius: 10,
          background: "#0f0f14",
          border: "1px solid #1f1f2e",
          color: "#6b7280",
          fontSize: 13,
          textAlign: "center",
        }}
      >
        Audio unavailable for this call
      </div>
    );

  return (
    <div
      style={{
        padding: "16px",
        borderRadius: 14,
        background: "linear-gradient(135deg,#0d0d18,#111120)",
        border: "1px solid #1e1e30",
      }}
    >
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Waveform bars (decorative animated) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          marginBottom: 14,
          height: 32,
          justifyContent: "center",
        }}
      >
        {Array.from({ length: 40 }, (_, i) => {
          const h = playing
            ? Math.random() * 20 + 6
            : 4 + Math.sin(i * 0.4) * 8 + 8;
          const isPast = (i / 40) * 100 < pct;
          return (
            <motion.div
              key={i}
              animate={{ height: playing ? [6, h, 6] : h }}
              transition={{
                duration: 0.4,
                repeat: playing ? Infinity : 0,
                delay: i * 0.02,
                ease: "easeInOut",
              }}
              style={{
                width: 3,
                borderRadius: 2,
                flexShrink: 0,
                background: isPast
                  ? "linear-gradient(180deg,#7c3aed,#4f46e5)"
                  : "#2a2a3e",
              }}
            />
          );
        })}
      </div>

      {/* Progress bar */}
      <div
        ref={barRef}
        onClick={seek}
        style={{
          height: 4,
          borderRadius: 4,
          background: "#1e1e30",
          cursor: "pointer",
          marginBottom: 10,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: "linear-gradient(90deg,#7c3aed,#4f46e5)",
            borderRadius: 4,
            transition: "width 0.1s linear",
          }}
        />
      </div>

      {/* Controls row */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={toggle}
          disabled={loading}
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "none",
            background: loading
              ? "#1e1e30"
              : "linear-gradient(135deg,#7c3aed,#4f46e5)",
            color: "#fff",
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: loading ? "none" : "0 4px 16px rgba(124,58,237,0.4)",
          }}
        >
          {loading ? (
            <Loader2
              size={16}
              style={{ animation: "spin 1s linear infinite" }}
            />
          ) : playing ? (
            <Pause size={16} />
          ) : (
            <Play size={16} style={{ marginLeft: 2 }} />
          )}
        </button>

        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 2,
            }}
          >
            <span style={{ fontSize: 11, color: "#6b7280" }}>
              {fmtTime(current)}
            </span>
            <span style={{ fontSize: 11, color: "#4b5563" }}>
              {fmtTime(duration)}
            </span>
          </div>
        </div>

        <Volume2 size={14} style={{ color: "#4b5563", flexShrink: 0 }} />
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

// ─── Main Drawer ──────────────────────────────────────────────────────────────
const TranscriptDrawer = ({ participant, eventId, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [audioSrc, setAudioSrc] = useState(null);
  const [audioLoading, setAudioLoading] = useState(false);

  useEffect(() => {
    if (!participant) return;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/events/${eventId}/participants/${participant.id}/transcript`,
        );
        const json = await res.json();
        if (json.success) setData(json);
        else setError(json.error || "Transcript not available");
      } catch {
        setError("Failed to load transcript");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [participant, eventId]);

  // Load audio when switching to overview tab (lazy)
  useEffect(() => {
    if (activeTab !== "overview" || audioSrc || !data?.has_audio) return;
    setAudioSrc(
      `${import.meta.env.VITE_BACKEND_URL}/api/events/${eventId}/participants/${participant.id}/audio`,
    );
  }, [activeTab, data]);

  const colors = outcomeColor(data?.call_outcome);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex justify-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Panel */}
      <motion.div
        className="relative flex flex-col w-full max-w-lg h-full"
        style={{
          background:
            "linear-gradient(160deg,#0c0c12 0%,#0f0f18 60%,#0c0c12 100%)",
          borderLeft: "1px solid #1a1a28",
        }}
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div
          style={{
            padding: "18px 20px 14px",
            borderBottom: "1px solid #1a1a28",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* Avatar */}
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: "0 4px 12px rgba(124,58,237,0.3)",
                }}
              >
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>
                  {(participant?.fullName || "?")[0].toUpperCase()}
                </span>
              </div>
              <div>
                <p
                  style={{
                    color: "#f3f4f6",
                    fontWeight: 700,
                    fontSize: 15,
                    margin: 0,
                  }}
                >
                  {participant?.fullName}
                </p>
                <p
                  style={{
                    color: "#4b5563",
                    fontSize: 12,
                    margin: 0,
                    fontFamily: "monospace",
                  }}
                >
                  {participant?.phoneNumber}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: "1px solid #2a2a3e",
                background: "#111120",
                color: "#6b7280",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={14} />
            </button>
          </div>

          {/* Meta badges */}
          {data && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {/* Outcome */}
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "3px 10px",
                  borderRadius: 20,
                  background: colors.bg,
                  border: `1px solid ${colors.border}`,
                  color: colors.text,
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "capitalize",
                }}
              >
                {data.call_outcome === "completed" ||
                data.call_outcome === "done" ? (
                  <CheckCircle size={10} />
                ) : (
                  <XCircle size={10} />
                )}
                {data.call_outcome || "pending"}
              </span>
              {/* Duration */}
              {data.call_duration && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "3px 10px",
                    borderRadius: 20,
                    background: "#082818",
                    border: "1px solid #065f46",
                    color: "#34d399",
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  <Clock3 size={10} /> {fmtDuration(data.call_duration)}
                </span>
              )}
              {/* Date */}
              {data.stats?.start_time && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "3px 10px",
                    borderRadius: 20,
                    background: "#0a1628",
                    border: "1px solid #1e3a5f",
                    color: "#60a5fa",
                    fontSize: 11,
                  }}
                >
                  <Calendar size={10} /> {fmtDate(data.stats.start_time)}
                </span>
              )}
              {/* Audio available */}
              {data.has_audio && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "3px 10px",
                    borderRadius: 20,
                    background: "#1a0a28",
                    border: "1px solid #4c1d95",
                    color: "#a78bfa",
                    fontSize: 11,
                  }}
                >
                  <Volume2 size={10} /> Audio
                </span>
              )}
            </div>
          )}

          {/* Tab switcher */}
          {!loading && !error && (
            <div
              style={{
                display: "flex",
                gap: 4,
                marginTop: 14,
                background: "#0a0a12",
                borderRadius: 10,
                padding: 4,
              }}
            >
              {[
                {
                  key: "overview",
                  label: "Overview",
                  icon: <BarChart2 size={13} />,
                },
                {
                  key: "transcript",
                  label: "Transcript",
                  icon: <MessageSquare size={13} />,
                },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "none",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 600,
                    transition: "all 0.2s",
                    background:
                      activeTab === tab.key
                        ? "linear-gradient(135deg,#1e1830,#1a1428)"
                        : "transparent",
                    color: activeTab === tab.key ? "#a78bfa" : "#4b5563",
                    boxShadow:
                      activeTab === tab.key ? "0 0 0 1px #4c1d95" : "none",
                  }}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Body ───────────────────────────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "18px 20px" }}>
          {/* Loading */}
          {loading && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "60%",
                gap: 12,
              }}
            >
              <Loader2
                size={28}
                style={{
                  color: "#7c3aed",
                  animation: "spin 1s linear infinite",
                }}
              />
              <p style={{ color: "#6b7280", fontSize: 13, margin: 0 }}>
                Loading call data...
              </p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "60%",
                gap: 10,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  background: "#0f0f14",
                  border: "1px solid #1f1f2e",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AlertCircle size={22} style={{ color: "#4b5563" }} />
              </div>
              <p
                style={{
                  color: "#f3f4f6",
                  fontWeight: 600,
                  fontSize: 15,
                  margin: 0,
                }}
              >
                No transcript available
              </p>
              <p
                style={{
                  color: "#4b5563",
                  fontSize: 13,
                  maxWidth: 260,
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {error}
              </p>
            </div>
          )}

          {/* ── OVERVIEW TAB ─────────────────────────────────────────────── */}
          {!loading && !error && activeTab === "overview" && data && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Audio player */}
              {data.has_audio ? (
                <div>
                  <p
                    style={{
                      color: "#6b7280",
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      margin: "0 0 8px",
                    }}
                  >
                    Call Recording
                  </p>
                  {audioSrc ? (
                    <AudioPlayer src={audioSrc} />
                  ) : (
                    <div
                      style={{
                        padding: "16px",
                        borderRadius: 14,
                        background: "#0d0d18",
                        border: "1px solid #1e1e30",
                        textAlign: "center",
                      }}
                    >
                      <Loader2
                        size={18}
                        style={{
                          color: "#7c3aed",
                          animation: "spin 1s linear infinite",
                          margin: "0 auto 6px",
                        }}
                      />
                      <p style={{ color: "#4b5563", fontSize: 12, margin: 0 }}>
                        Loading audio...
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  style={{
                    padding: "14px 16px",
                    borderRadius: 12,
                    background: "#0f0f14",
                    border: "1px dashed #2a2a3e",
                    textAlign: "center",
                  }}
                >
                  <Mic
                    size={18}
                    style={{ color: "#374151", margin: "0 auto 6px" }}
                  />
                  <p style={{ color: "#4b5563", fontSize: 12, margin: 0 }}>
                    No audio recording available
                  </p>
                </div>
              )}

              {/* Stats grid */}
              <div>
                <p
                  style={{
                    color: "#6b7280",
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    margin: "0 0 8px",
                  }}
                >
                  Call Stats
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 8,
                  }}
                >
                  {[
                    {
                      label: "Duration",
                      value: fmtDuration(data.call_duration) || "—",
                      icon: <Clock3 size={14} />,
                      color: "#34d399",
                    },
                    {
                      label: "Total Turns",
                      value: data.stats?.total_turns || 0,
                      icon: <MessageSquare size={14} />,
                      color: "#60a5fa",
                    },
                    {
                      label: "Agent Turns",
                      value: data.stats?.agent_turns || 0,
                      icon: <Bot size={14} />,
                      color: "#a78bfa",
                    },
                    {
                      label: "Guest Turns",
                      value: data.stats?.user_turns || 0,
                      icon: <User size={14} />,
                      color: "#fbbf24",
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      style={{
                        padding: "12px 14px",
                        borderRadius: 12,
                        background: "#0d0d18",
                        border: "1px solid #1a1a28",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          marginBottom: 6,
                          color: s.color,
                        }}
                      >
                        {s.icon}
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            color: "#4b5563",
                          }}
                        >
                          {s.label}
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: 20,
                          fontWeight: 700,
                          color: s.color,
                          margin: 0,
                        }}
                      >
                        {s.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Summary */}
              {data.analysis?.transcript_summary && (
                <div>
                  <p
                    style={{
                      color: "#6b7280",
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      margin: "0 0 8px",
                    }}
                  >
                    AI Summary
                  </p>
                  <div
                    style={{
                      padding: "14px 16px",
                      borderRadius: 12,
                      background: "linear-gradient(135deg,#0a0a18,#0d0d1e)",
                      border: "1px solid #1e1e30",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: 3,
                        height: "100%",
                        background: "linear-gradient(180deg,#7c3aed,#4f46e5)",
                        borderRadius: "3px 0 0 3px",
                      }}
                    />
                    <p
                      style={{
                        color: "#c4b5fd",
                        fontSize: 13,
                        lineHeight: 1.7,
                        margin: 0,
                        paddingLeft: 4,
                      }}
                    >
                      {data.analysis.transcript_summary}
                    </p>
                  </div>
                </div>
              )}

              {/* Outcome analysis */}
              {data.analysis?.call_successful && (
                <div
                  style={{
                    padding: "12px 14px",
                    borderRadius: 12,
                    background: "#0d0d18",
                    border: "1px solid #1a1a28",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <TrendingUp
                    size={16}
                    style={{ color: "#60a5fa", flexShrink: 0 }}
                  />
                  <div>
                    <p
                      style={{
                        fontSize: 11,
                        color: "#4b5563",
                        margin: "0 0 2px",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Call Outcome
                    </p>
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        margin: 0,
                        color:
                          data.analysis.call_successful === "success"
                            ? "#34d399"
                            : "#f87171",
                        textTransform: "capitalize",
                      }}
                    >
                      {data.analysis.call_successful}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── TRANSCRIPT TAB ────────────────────────────────────────────── */}
          {!loading && !error && activeTab === "transcript" && (
            <>
              {data?.transcript?.length > 0 ? (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 14 }}
                >
                  {data.transcript.map((turn, i) => {
                    const isAgent = turn.role === "assistant";
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.025 }}
                        style={{
                          display: "flex",
                          gap: 9,
                          flexDirection: isAgent ? "row" : "row-reverse",
                        }}
                      >
                        {/* Avatar */}
                        <div
                          style={{
                            flexShrink: 0,
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            background: isAgent
                              ? "linear-gradient(135deg,#7c3aed,#4f46e5)"
                              : "linear-gradient(135deg,#0ea5e9,#3b82f6)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {isAgent ? (
                            <Bot size={13} style={{ color: "#fff" }} />
                          ) : (
                            <User size={13} style={{ color: "#fff" }} />
                          )}
                        </div>
                        {/* Bubble */}
                        <div
                          style={{
                            maxWidth: "76%",
                            display: "flex",
                            flexDirection: "column",
                            gap: 3,
                            alignItems: isAgent ? "flex-start" : "flex-end",
                          }}
                        >
                          <p
                            style={{
                              fontSize: 10,
                              color: "#374151",
                              margin: 0,
                              fontWeight: 600,
                              letterSpacing: "0.05em",
                              textTransform: "uppercase",
                            }}
                          >
                            {isAgent ? "Agent" : "Guest"}
                            {turn.time_in_call_secs !== null &&
                              turn.time_in_call_secs !== undefined && (
                                <span
                                  style={{
                                    marginLeft: 6,
                                    fontWeight: 400,
                                    color: "#2d2d3e",
                                  }}
                                >
                                  @ {fmtCallTime(turn.time_in_call_secs)}
                                </span>
                              )}
                          </p>
                          <div
                            style={{
                              padding: "9px 13px",
                              borderRadius: isAgent
                                ? "4px 14px 14px 14px"
                                : "14px 4px 14px 14px",
                              background: isAgent ? "#131322" : "#0a1628",
                              border: `1px solid ${isAgent ? "#22223a" : "#1e3a5f"}`,
                              color: "#e5e7eb",
                              fontSize: 13,
                              lineHeight: 1.6,
                            }}
                          >
                            {turn.message}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "3rem 1rem",
                    color: "#4b5563",
                  }}
                >
                  <Mic
                    size={28}
                    style={{ margin: "0 auto 12px", opacity: 0.3 }}
                  />
                  <p
                    style={{
                      fontWeight: 600,
                      color: "#6b7280",
                      margin: "0 0 4px",
                    }}
                  >
                    No messages recorded
                  </p>
                  <p style={{ fontSize: 13 }}>
                    The call connected but no conversation was captured.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </motion.div>
    </motion.div>
  );
};

export default TranscriptDrawer;
