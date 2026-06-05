// pages/SamvaadikConnect.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
  EyeOff,
  Link2,
  Link2Off,
  Sparkles,
  Zap,
  MessageSquare,
  Shield,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  Phone,
  Building2,
  Webhook,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  User,
  Key,
  Globe,
  LayoutTemplate,
  PlayCircle,
} from "lucide-react";

// ─── API helpers ──────────────────────────────────────────────────────────────
const api = (token) => ({
  get: (url) =>
    fetch(`${import.meta.env.VITE_BACKEND_URL}${url}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json()),
  post: (url, body) =>
    fetch(`${import.meta.env.VITE_BACKEND_URL}${url}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }).then((r) => r.json()),
  delete: (url) =>
    fetch(`${import.meta.env.VITE_BACKEND_URL}${url}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json()),
});

// ─── Copy button ──────────────────────────────────────────────────────────────
const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        color: copied ? "#34d399" : "#6b7280",
        display: "flex",
        alignItems: "center",
        gap: 4,
        fontSize: 12,
        padding: "2px 6px",
        borderRadius: 6,
        transition: "color 0.2s",
      }}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
};

// ─── Step card for setup guide ────────────────────────────────────────────────
const SetupStep = ({
  number,
  title,
  description,
  action,
  done = false,
  defaultOpen = false,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      style={{
        borderRadius: 14,
        border: `1px solid ${done ? "rgba(52,211,153,0.2)" : "#1a1a28"}`,
        background: done ? "rgba(5,150,105,0.05)" : "#0d0d16",
        overflow: "hidden",
        transition: "border-color 0.2s",
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "16px",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: done
              ? "linear-gradient(135deg,#059669,#047857)"
              : "rgba(79,70,229,0.15)",
            border: `1px solid ${done ? "#065f46" : "rgba(79,70,229,0.3)"}`,
          }}
        >
          {done ? (
            <CheckCircle2 size={14} style={{ color: "#34d399" }} />
          ) : (
            <span style={{ fontSize: 11, fontWeight: 700, color: "#818cf8" }}>
              {number}
            </span>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              color: done ? "#34d399" : "#f3f4f6",
              fontWeight: 600,
              fontSize: 14,
              margin: 0,
            }}
          >
            {title}
          </p>
          <p
            style={{
              color: "#4b5563",
              fontSize: 12,
              margin: "2px 0 0",
              lineHeight: 1.5,
            }}
          >
            {description}
          </p>
        </div>
        {open ? (
          <ChevronDown size={16} style={{ color: "#4b5563", flexShrink: 0 }} />
        ) : (
          <ChevronRight size={16} style={{ color: "#4b5563", flexShrink: 0 }} />
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "0 16px 16px 56px" }}>{action}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Info row ─────────────────────────────────────────────────────────────────
const InfoRow = ({ icon, label, value, copyable = false }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "12px 0",
      borderBottom: "1px solid #1a1a28",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ color: "#4b5563" }}>{icon}</span>
      <span style={{ color: "#6b7280", fontSize: 13 }}>{label}</span>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span
        style={{
          color: "#e5e7eb",
          fontSize: 13,
          fontWeight: 500,
          fontFamily:
            label === "WABA ID" || label === "Account ID"
              ? "monospace"
              : "inherit",
        }}
      >
        {value || "—"}
      </span>
      {copyable && value && <CopyButton text={value} />}
    </div>
  </div>
);

// ─── External link button ─────────────────────────────────────────────────────
const ExtLink = ({ href, children, color = "#818cf8" }) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "8px 14px",
      borderRadius: 8,
      border: `1px solid ${color}44`,
      background: `${color}11`,
      color,
      fontSize: 13,
      fontWeight: 600,
      textDecoration: "none",
      transition: "all 0.2s",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.background = `${color}22`)}
    onMouseLeave={(e) => (e.currentTarget.style.background = `${color}11`)}
  >
    {children} <ExternalLink size={12} />
  </a>
);

// ─── Main page ────────────────────────────────────────────────────────────────
const SamvaadikConnect = () => {
  const { getToken } = useKindeAuth();

  const [status, setStatus] = useState("loading");
  const [connection, setConnection] = useState(null);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  // which tab: "setup" | "connect"
  const [tab, setTab] = useState("setup");

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      setStatus("loading");
      const token = await getToken();
      const result = await api(token).get("/api/samvaadik/status");
      if (result.connected) {
        setConnection(result.data);
        setStatus("connected");
      } else {
        setStatus("disconnected");
      }
    } catch {
      setStatus("disconnected");
    }
  };

  const handleConnect = async () => {
    if (!apiKey.trim()) {
      setError("Please enter your Samvaadik API key");
      return;
    }
    if (!apiKey.startsWith("sk_live_")) {
      setError("API key must start with sk_live_");
      return;
    }
    try {
      setConnecting(true);
      setError(null);
      const token = await getToken();
      const result = await api(token).post("/api/samvaadik/connect", {
        api_key: apiKey.trim(),
      });
      if (result.success) {
        setConnection(result.data);
        setStatus("connected");
        setApiKey("");
      } else setError(result.error || "Connection failed. Please try again.");
    } catch {
      setError("Connection failed. Check your network and try again.");
    } finally {
      setConnecting(false);
    }
  };

  const handleVerify = async () => {
    try {
      setVerifying(true);
      setError(null);
      const token = await getToken();
      const result = await api(token).post("/api/samvaadik/verify", {});
      if (result.success) await loadStatus();
      else {
        setError(result.error || "Verification failed");
        if (result.error?.includes("no longer valid"))
          setStatus("disconnected");
      }
    } catch {
      setError("Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setDisconnecting(true);
      const token = await getToken();
      const result = await api(token).delete("/api/samvaadik/disconnect");
      if (result.success) {
        setConnection(null);
        setStatus("disconnected");
        setShowConfirm(false);
      }
    } catch {
      setError("Disconnect failed");
    } finally {
      setDisconnecting(false);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  };

  // ── Shared header ──────────────────────────────────────────────────────────
  const Header = () => (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ marginBottom: 28 }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "5px 14px",
          borderRadius: 20,
          background:
            "linear-gradient(135deg,rgba(79,70,229,0.15),rgba(20,184,166,0.1))",
          border: "1px solid rgba(79,70,229,0.25)",
          marginBottom: 14,
        }}
      >
        <Sparkles size={13} style={{ color: "#818cf8" }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: "#a5b4fc" }}>
          Integrations → Samvaadik
        </span>
      </div>
      <h1
        style={{
          fontSize: 26,
          fontWeight: 700,
          margin: "0 0 6px",
          background: "linear-gradient(135deg,#fff,#c7d2fe)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        WhatsApp via Samvaadik
      </h1>
      <p
        style={{
          color: "#6b7280",
          fontSize: 13,
          margin: 0,
          lineHeight: 1.6,
          maxWidth: 540,
        }}
      >
        Samvaadik handles your WhatsApp Business account, templates, and message
        delivery. Connect it here to power RSVP conversations for your events.
      </p>
    </motion.div>
  );

  // ── Loading ────────────────────────────────────────────────────────────────
  if (status === "loading")
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0A0A0B",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          color: "#6b7280",
        }}
      >
        <Loader2
          size={20}
          style={{ animation: "spin 1s linear infinite", color: "#818cf8" }}
        />
        <span style={{ fontSize: 14 }}>Checking connection...</span>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );

  // ── CONNECTED ──────────────────────────────────────────────────────────────
  if (status === "connected" && connection)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(160deg,#0A0A0B,#0B0B0D)",
          color: "#fff",
          padding: "32px 16px",
        }}
      >
        <div
          style={{
            position: "fixed",
            top: 80,
            left: -80,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "rgba(79,70,229,0.1)",
            filter: "blur(80px)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "fixed",
            top: 200,
            right: -60,
            width: 260,
            height: 260,
            borderRadius: "50%",
            background: "rgba(20,184,166,0.07)",
            filter: "blur(80px)",
            pointerEvents: "none",
          }}
        />
        <div style={{ maxWidth: 640, margin: "0 auto", position: "relative" }}>
          <Header />

          {/* Success banner */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: "14px 18px",
              borderRadius: 14,
              background: "rgba(5,150,105,0.12)",
              border: "1px solid rgba(52,211,153,0.2)",
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#059669,#047857)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 4px 12px rgba(5,150,105,0.25)",
              }}
            >
              <CheckCircle2 size={16} style={{ color: "#fff" }} />
            </div>
            <div style={{ flex: 1 }}>
              <p
                style={{
                  color: "#34d399",
                  fontWeight: 700,
                  fontSize: 13,
                  margin: 0,
                }}
              >
                Connected to Samvaadik
              </p>
              <p style={{ color: "#6b7280", fontSize: 12, margin: 0 }}>
                WhatsApp messaging is active for all your events
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              onClick={handleVerify}
              disabled={verifying}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "6px 12px",
                borderRadius: 8,
                border: "1px solid rgba(52,211,153,0.2)",
                background: "rgba(5,150,105,0.1)",
                color: "#34d399",
                cursor: verifying ? "not-allowed" : "pointer",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <RefreshCw
                size={11}
                style={{
                  animation: verifying ? "spin 1s linear infinite" : "none",
                }}
              />
              {verifying ? "Verifying..." : "Verify"}
            </motion.button>
          </motion.div>

          {/* Account details */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            style={{
              borderRadius: 18,
              border: "1px solid #1a1a28",
              background: "linear-gradient(160deg,#0f0f18,#111120)",
              padding: "22px",
              marginBottom: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Building2 size={16} style={{ color: "#fff" }} />
              </div>
              <div>
                <p
                  style={{
                    color: "#f3f4f6",
                    fontWeight: 600,
                    fontSize: 14,
                    margin: 0,
                  }}
                >
                  Account Details
                </p>
                <p style={{ color: "#4b5563", fontSize: 11, margin: 0 }}>
                  Connected WhatsApp Business Account
                </p>
              </div>
            </div>
            <InfoRow
              icon={<Phone size={13} />}
              label="Phone Number"
              value={connection.business_phone}
              copyable
            />
            <InfoRow
              icon={<Building2 size={13} />}
              label="WABA ID"
              value={connection.waba_id}
              copyable
            />
            <InfoRow
              icon={<Shield size={13} />}
              label="Account ID"
              value={connection.wa_id}
              copyable
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 0",
                borderBottom: "1px solid #1a1a28",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "#4b5563" }}>
                  <Webhook size={13} />
                </span>
                <span style={{ color: "#6b7280", fontSize: 13 }}>Webhook</span>
              </div>
              {connection.webhook_set ? (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    color: "#34d399",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  <CheckCircle2 size={12} /> Configured
                </span>
              ) : (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    color: "#f59e0b",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  <AlertTriangle size={12} /> Not set — click Verify
                </span>
              )}
            </div>
            <InfoRow
              icon={<Link2 size={13} />}
              label="Connected Since"
              value={formatDate(connection.connected_at)}
            />
          </motion.div>

          {/* Capabilities grid */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              borderRadius: 16,
              border: "1px solid #1a1a28",
              background: "#0d0d16",
              padding: "18px",
              marginBottom: 16,
            }}
          >
            <p
              style={{
                color: "#4b5563",
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                margin: "0 0 12px",
              }}
            >
              Active Capabilities
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
                  icon: <MessageSquare size={13} />,
                  label: "Send WhatsApp messages",
                  color: "#818cf8",
                },
                {
                  icon: <Zap size={13} />,
                  label: "Send template messages",
                  color: "#34d399",
                },
                {
                  icon: <Phone size={13} />,
                  label: "Receive guest replies",
                  color: "#60a5fa",
                },
                {
                  icon: <Shield size={13} />,
                  label: "Webhook forwarding",
                  color: "#f59e0b",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 12px",
                    borderRadius: 10,
                    background: "#111120",
                    border: "1px solid #1a1a28",
                  }}
                >
                  <span style={{ color: item.color }}>{item.icon}</span>
                  <span style={{ color: "#9ca3af", fontSize: 12 }}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick links */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            style={{
              borderRadius: 16,
              border: "1px solid #1a1a28",
              background: "#0d0d16",
              padding: "18px",
              marginBottom: 20,
            }}
          >
            <p
              style={{
                color: "#4b5563",
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                margin: "0 0 12px",
              }}
            >
              Manage in Samvaadik
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <ExtLink href="https://samvaadik.com/templates" color="#818cf8">
                Manage Templates
              </ExtLink>
              <ExtLink href="https://samvaadik.com/api-keys" color="#34d399">
                Manage API Keys
              </ExtLink>
              <ExtLink href="https://samvaadik.com/dashboard" color="#60a5fa">
                Samvaadik Dashboard
              </ExtLink>
            </div>
          </motion.div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => setShowConfirm(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "9px 16px",
                borderRadius: 10,
                border: "1px solid rgba(239,68,68,0.2)",
                background: "rgba(239,68,68,0.07)",
                color: "#f87171",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <Link2Off size={13} /> Disconnect
            </motion.button>
          </div>
        </div>

        {/* Disconnect modal */}
        <AnimatePresence>
          {showConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.7)",
                backdropFilter: "blur(4px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 50,
                padding: 16,
              }}
            >
              <motion.div
                initial={{ scale: 0.95, y: 16 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95 }}
                style={{
                  background: "linear-gradient(160deg,#0f0f18,#111120)",
                  border: "1px solid #1a1a28",
                  borderRadius: 20,
                  padding: 28,
                  maxWidth: 400,
                  width: "100%",
                  boxShadow: "0 24px 48px rgba(0,0,0,0.5)",
                }}
              >
                <div
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: "50%",
                    background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 14px",
                  }}
                >
                  <Link2Off size={20} style={{ color: "#f87171" }} />
                </div>
                <h3
                  style={{
                    color: "#f3f4f6",
                    fontWeight: 700,
                    fontSize: 17,
                    textAlign: "center",
                    margin: "0 0 8px",
                  }}
                >
                  Disconnect Samvaadik?
                </h3>
                <p
                  style={{
                    color: "#6b7280",
                    fontSize: 13,
                    textAlign: "center",
                    lineHeight: 1.6,
                    margin: "0 0 22px",
                  }}
                >
                  WhatsApp messaging will stop working for all your events. You
                  can reconnect anytime.
                </p>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => setShowConfirm(false)}
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: 10,
                      border: "1px solid #1e1e2e",
                      background: "#111120",
                      color: "#9ca3af",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: 13,
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDisconnect}
                    disabled={disconnecting}
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: 10,
                      border: "none",
                      background: disconnecting ? "#374151" : "#dc2626",
                      color: "#fff",
                      cursor: disconnecting ? "not-allowed" : "pointer",
                      fontWeight: 600,
                      fontSize: 13,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    {disconnecting ? (
                      <>
                        <Loader2
                          size={13}
                          style={{ animation: "spin 1s linear infinite" }}
                        />{" "}
                        Disconnecting...
                      </>
                    ) : (
                      "Disconnect"
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );

  // ── DISCONNECTED ───────────────────────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg,#0A0A0B,#0B0B0D)",
        color: "#fff",
        padding: "32px 16px",
      }}
    >
      <div
        style={{
          position: "fixed",
          top: 80,
          left: -80,
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "rgba(79,70,229,0.1)",
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "fixed",
          top: 200,
          right: -60,
          width: 260,
          height: 260,
          borderRadius: "50%",
          background: "rgba(20,184,166,0.07)",
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: 660, margin: "0 auto", position: "relative" }}>
        <Header />

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                padding: "13px 16px",
                borderRadius: 12,
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.22)",
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 18,
              }}
            >
              <XCircle size={15} style={{ color: "#f87171", flexShrink: 0 }} />
              <p style={{ color: "#fca5a5", fontSize: 13, margin: 0, flex: 1 }}>
                {error}
              </p>
              <button
                onClick={() => setError(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#6b7280",
                  cursor: "pointer",
                  fontSize: 18,
                  padding: 0,
                }}
              >
                ×
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab switcher */}
        <div
          style={{
            display: "flex",
            gap: 4,
            background: "#0a0a12",
            borderRadius: 12,
            padding: 4,
            marginBottom: 22,
            border: "1px solid #1a1a28",
          }}
        >
          {[
            {
              key: "setup",
              label: "Setup Guide",
              icon: <PlayCircle size={14} />,
            },
            {
              key: "connect",
              label: "I Have an Account",
              icon: <Key size={14} />,
            },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
                padding: "9px 12px",
                borderRadius: 9,
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                transition: "all 0.2s",
                background:
                  tab === t.key
                    ? "linear-gradient(135deg,#1e1830,#1a1428)"
                    : "transparent",
                color: tab === t.key ? "#a5b4fc" : "#4b5563",
                boxShadow: tab === t.key ? "0 0 0 1px #4c1d9566" : "none",
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ── SETUP GUIDE TAB ── */}
        {tab === "setup" && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* What is Samvaadik banner */}
            <div
              style={{
                borderRadius: 16,
                border: "1px solid rgba(79,70,229,0.2)",
                background:
                  "linear-gradient(135deg,rgba(79,70,229,0.1),rgba(124,58,237,0.06))",
                padding: "18px 20px",
                marginBottom: 20,
                display: "flex",
                gap: 14,
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: "0 4px 12px rgba(79,70,229,0.3)",
                }}
              >
                <Globe size={18} style={{ color: "#fff" }} />
              </div>
              <div>
                <p
                  style={{
                    color: "#c7d2fe",
                    fontWeight: 700,
                    fontSize: 14,
                    margin: "0 0 4px",
                  }}
                >
                  What is Samvaadik?
                </p>
                <p
                  style={{
                    color: "#6b7280",
                    fontSize: 13,
                    margin: "0 0 10px",
                    lineHeight: 1.6,
                  }}
                >
                  Samvaadik is our WhatsApp Business platform. It connects your
                  Meta WhatsApp account, manages message templates, and handles
                  all WhatsApp messaging. Sutrak uses Samvaadik to send RSVP
                  messages to your event guests.
                </p>
                <ExtLink href="https://samvaadik.com" color="#818cf8">
                  Visit Samvaadik
                </ExtLink>
              </div>
            </div>

            {/* Step by step */}
            <p
              style={{
                color: "#4b5563",
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                margin: "0 0 12px",
              }}
            >
              Complete These Steps
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                marginBottom: 20,
              }}
            >
              <SetupStep
                number="1"
                defaultOpen
                title="Create a Samvaadik account"
                description="Sign up at samvaadik.com — it's free to start"
                action={
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    <p
                      style={{
                        color: "#9ca3af",
                        fontSize: 13,
                        margin: 0,
                        lineHeight: 1.6,
                      }}
                    >
                      Go to Samvaadik and create your account. Use the same
                      email you use for Sutrak if possible to keep things
                      organised.
                    </p>
                    <ExtLink
                      href="https://samvaadik.com/register"
                      color="#818cf8"
                    >
                      Create Account →
                    </ExtLink>
                  </div>
                }
              />

              <SetupStep
                number="2"
                title="Connect your WhatsApp Business account"
                description="Link your Meta WhatsApp Business Account (WABA) inside Samvaadik"
                action={
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    <p
                      style={{
                        color: "#9ca3af",
                        fontSize: 13,
                        margin: 0,
                        lineHeight: 1.6,
                      }}
                    >
                      Inside Samvaadik, go to{" "}
                      <strong style={{ color: "#e5e7eb" }}>
                        Settings → WhatsApp Account
                      </strong>{" "}
                      and connect your Meta Business account. You'll need:
                    </p>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      {[
                        "A Meta Business Manager account",
                        "A WhatsApp Business phone number",
                        "Admin access to your Meta Business account",
                      ].map((item, i) => (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <div
                            style={{
                              width: 5,
                              height: 5,
                              borderRadius: "50%",
                              background: "#4f46e5",
                              flexShrink: 0,
                            }}
                          />
                          <span style={{ color: "#9ca3af", fontSize: 13 }}>
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <ExtLink
                        href="https://samvaadik.com/waccount"
                        color="#818cf8"
                      >
                        Connect WhatsApp
                      </ExtLink>
                      <ExtLink
                        href="https://business.facebook.com"
                        color="#60a5fa"
                      >
                        Meta Business Manager
                      </ExtLink>
                    </div>
                  </div>
                }
              />

              <SetupStep
                number="3"
                title="Create and get your message templates approved"
                description="Templates are required to initiate WhatsApp conversations"
                action={
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    <p
                      style={{
                        color: "#9ca3af",
                        fontSize: 13,
                        margin: 0,
                        lineHeight: 1.6,
                      }}
                    >
                      WhatsApp requires pre-approved templates to start
                      conversations. Create your RSVP templates inside
                      Samvaadik. Meta approval usually takes{" "}
                      <strong style={{ color: "#e5e7eb" }}>
                        a few minutes to 24 hours
                      </strong>
                      .
                    </p>
                    <div
                      style={{
                        padding: "12px 14px",
                        borderRadius: 10,
                        background: "#111120",
                        border: "1px solid #1a1a28",
                      }}
                    >
                      <p
                        style={{
                          color: "#f59e0b",
                          fontSize: 12,
                          fontWeight: 600,
                          margin: "0 0 6px",
                        }}
                      >
                        📝 Suggested template for RSVP
                      </p>
                      <p
                        style={{
                          color: "#9ca3af",
                          fontSize: 12,
                          margin: 0,
                          fontFamily: "monospace",
                          lineHeight: 1.7,
                        }}
                      >
                        Hello {`{{1}}`}! You're invited to {`{{2}}`}. Please
                        confirm your attendance by replying YES or NO.
                      </p>
                    </div>
                    <ExtLink
                      href="https://samvaadik.com/templates"
                      color="#818cf8"
                    >
                      Create Templates
                    </ExtLink>
                  </div>
                }
              />

              <SetupStep
                number="4"
                title="Generate an API key in Samvaadik"
                description="The API key connects Samvaadik to Sutrak"
                action={
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    <p
                      style={{
                        color: "#9ca3af",
                        fontSize: 13,
                        margin: 0,
                        lineHeight: 1.6,
                      }}
                    >
                      In Samvaadik go to{" "}
                      <strong style={{ color: "#e5e7eb" }}>
                        Developer → API Keys
                      </strong>{" "}
                      and create a new key. Select these permissions:
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {[
                        "send_template",
                        "send_message",
                        "get_templates",
                        "get_account",
                      ].map((s) => (
                        <span
                          key={s}
                          style={{
                            padding: "3px 10px",
                            borderRadius: 20,
                            background: "rgba(79,70,229,0.12)",
                            border: "1px solid rgba(79,70,229,0.25)",
                            color: "#a5b4fc",
                            fontSize: 11,
                            fontFamily: "monospace",
                          }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                    <p style={{ color: "#6b7280", fontSize: 12, margin: 0 }}>
                      ⚠️ Copy the key immediately — it's only shown once.
                    </p>
                    <ExtLink
                      href="https://samvaadik.com/api-keys"
                      color="#34d399"
                    >
                      Go to API Keys
                    </ExtLink>
                  </div>
                }
              />

              <SetupStep
                number="5"
                title="Come back and connect"
                description="Paste your API key in the 'I Have an Account' tab above"
                action={
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    <p
                      style={{
                        color: "#9ca3af",
                        fontSize: 13,
                        margin: 0,
                        lineHeight: 1.6,
                      }}
                    >
                      Once you have your API key, click the{" "}
                      <strong style={{ color: "#e5e7eb" }}>
                        I Have an Account
                      </strong>{" "}
                      tab at the top of this page and paste it in. Sutrak will
                      validate it and configure everything automatically.
                    </p>
                    <button
                      onClick={() => setTab("connect")}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "9px 16px",
                        borderRadius: 9,
                        border: "none",
                        background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
                        color: "#fff",
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: 600,
                        width: "fit-content",
                        boxShadow: "0 4px 12px rgba(79,70,229,0.3)",
                      }}
                    >
                      I have my key <ArrowRight size={13} />
                    </button>
                  </div>
                }
              />
            </div>
          </motion.div>
        )}

        {/* ── CONNECT TAB ── */}
        {tab === "connect" && (
          <motion.div
            key="connect"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div
              style={{
                borderRadius: 20,
                border: "1px solid #1a1a28",
                background: "linear-gradient(160deg,#0f0f18,#111120)",
                padding: "28px",
                marginBottom: 16,
              }}
            >
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 18,
                    background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 14px",
                    boxShadow: "0 8px 20px rgba(79,70,229,0.3)",
                  }}
                >
                  <Link2 size={24} style={{ color: "#fff" }} />
                </div>
                <h2
                  style={{
                    color: "#f3f4f6",
                    fontWeight: 700,
                    fontSize: 19,
                    margin: "0 0 6px",
                  }}
                >
                  Connect Samvaadik
                </h2>
                <p
                  style={{
                    color: "#6b7280",
                    fontSize: 13,
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  Paste your{" "}
                  <code
                    style={{
                      background: "#1e1e2e",
                      padding: "1px 6px",
                      borderRadius: 5,
                      fontSize: 12,
                      color: "#a5b4fc",
                    }}
                  >
                    sk_live_
                  </code>{" "}
                  API key from{" "}
                  <a
                    href="https://samvaadik.com/api-keys"
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "#818cf8", textDecoration: "none" }}
                  >
                    samvaadik.com/api-keys{" "}
                    <ExternalLink
                      size={10}
                      style={{ display: "inline", verticalAlign: "middle" }}
                    />
                  </a>
                </p>
              </div>

              {/* Input */}
              <div style={{ marginBottom: 18 }}>
                <label
                  style={{
                    display: "block",
                    color: "#9ca3af",
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: 8,
                  }}
                >
                  Samvaadik API Key
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => {
                      setApiKey(e.target.value);
                      setError(null);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleConnect()}
                    placeholder="sk_live_..."
                    style={{
                      width: "100%",
                      padding: "13px 48px 13px 16px",
                      background: "#0a0a12",
                      border: `1px solid ${error ? "rgba(239,68,68,0.4)" : "#1e1e2e"}`,
                      borderRadius: 12,
                      color: "#f3f4f6",
                      fontSize: 14,
                      fontFamily: "monospace",
                      outline: "none",
                      boxSizing: "border-box",
                      transition: "border-color 0.2s",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#4f46e5")}
                    onBlur={(e) =>
                      (e.target.style.borderColor = error
                        ? "rgba(239,68,68,0.4)"
                        : "#1e1e2e")
                    }
                  />
                  <button
                    onClick={() => setShowKey((v) => !v)}
                    style={{
                      position: "absolute",
                      right: 14,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      color: "#4b5563",
                      cursor: "pointer",
                      display: "flex",
                    }}
                  >
                    {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Connect button */}
              <motion.button
                whileHover={{ scale: connecting || !apiKey.trim() ? 1 : 1.02 }}
                whileTap={{ scale: connecting || !apiKey.trim() ? 1 : 0.98 }}
                onClick={handleConnect}
                disabled={connecting || !apiKey.trim()}
                style={{
                  width: "100%",
                  padding: "13px",
                  borderRadius: 12,
                  border: "none",
                  background:
                    connecting || !apiKey.trim()
                      ? "#1e1e2e"
                      : "linear-gradient(135deg,#4f46e5,#7c3aed)",
                  color: connecting || !apiKey.trim() ? "#4b5563" : "#fff",
                  cursor:
                    connecting || !apiKey.trim() ? "not-allowed" : "pointer",
                  fontWeight: 700,
                  fontSize: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  boxShadow:
                    connecting || !apiKey.trim()
                      ? "none"
                      : "0 4px 16px rgba(79,70,229,0.35)",
                  transition: "all 0.2s",
                }}
              >
                {connecting ? (
                  <>
                    <Loader2
                      size={15}
                      style={{ animation: "spin 1s linear infinite" }}
                    />{" "}
                    Connecting...
                  </>
                ) : (
                  <>
                    <Link2 size={15} /> Connect Samvaadik
                  </>
                )}
              </motion.button>
            </div>

            {/* What happens */}
            <div
              style={{
                borderRadius: 14,
                border: "1px solid #1a1a28",
                background: "#0d0d16",
                padding: "18px",
              }}
            >
              <p
                style={{
                  color: "#4b5563",
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  margin: "0 0 12px",
                }}
              >
                What Happens on Connect
              </p>
              {[
                {
                  step: "1",
                  text: "API key is validated against Samvaadik",
                  color: "#818cf8",
                },
                {
                  step: "2",
                  text: "Sutrak's webhook URL is set on your key automatically",
                  color: "#34d399",
                },
                {
                  step: "3",
                  text: "Guest WhatsApp replies are forwarded to Sutrak",
                  color: "#60a5fa",
                },
                {
                  step: "4",
                  text: "All event messages route through Samvaadik",
                  color: "#f59e0b",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: `${item.color}18`,
                      border: `1px solid ${item.color}33`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      fontSize: 10,
                      fontWeight: 700,
                      color: item.color,
                    }}
                  >
                    {item.step}
                  </div>
                  <p
                    style={{
                      color: "#9ca3af",
                      fontSize: 13,
                      margin: 0,
                      lineHeight: 1.5,
                    }}
                  >
                    {item.text}
                  </p>
                </div>
              ))}
              <div
                style={{
                  marginTop: 14,
                  paddingTop: 14,
                  borderTop: "1px solid #1a1a28",
                }}
              >
                <button
                  onClick={() => setTab("setup")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#818cf8",
                    fontSize: 13,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    padding: 0,
                  }}
                >
                  Don't have an account yet? View setup guide{" "}
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

export default SamvaadikConnect;
