// components/RetryAutomationPanel.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import {
  Clock,
  PhoneCall,
  MessageSquare,
  Plus,
  Pause,
  Play,
  Trash2,
  ChevronDown,
  ChevronUp,
  Lock,
} from "lucide-react";

const BACKEND = import.meta.env.VITE_BACKEND_URL;

// Inline styles set the desktop look; this stylesheet only overrides what
// needs to change per breakpoint. !important is required here because a
// plain class can't beat an inline style — but a class rule with
// !important can, which is exactly what we want for responsive overrides.
const RESPONSIVE_CSS = `
  .ra-panel { padding: 1.25rem 1.5rem; }

  .ra-row-top { flex-wrap: wrap; }
  .ra-row-meta { margin-left: auto; }
  .ra-row-actions { flex-shrink: 0; }

  .ra-field { flex: 1 1 180px; min-width: 180px; }
  .ra-select, .ra-input { width: 100%; box-sizing: border-box; }

  .ra-mode-tabs button { white-space: nowrap; }

  @media (max-width: 640px) {
    .ra-panel { padding: 0.9rem 1rem !important; }

    .ra-header { align-items: stretch !important; }
    .ra-new-btn { width: 100%; justify-content: center !important; }

    .ra-mode-tabs { display: flex; }
    .ra-mode-tabs button { flex: 1 1 auto; justify-content: center !important; }

    .ra-field { flex: 1 1 100% !important; min-width: 0 !important; width: 100%; }
    .ra-form-fields { flex-direction: column !important; }

    .ra-form-actions { flex-direction: column !important; }
    .ra-form-actions button { width: 100% !important; }

    .ra-row-top { gap: 8px !important; }
    .ra-row-label { flex: 1 1 auto; min-width: 0; }
    .ra-row-label span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block; }
    .ra-row-meta {
      margin-left: 0 !important;
      order: 3;
      flex-basis: 100%;
      white-space: normal !important;
    }
    .ra-row-actions { order: 4; flex-basis: 100%; justify-content: flex-end !important; }

    .ra-icon-btn { width: 30px !important; height: 30px !important; }

    .ra-history-row { flex-direction: column !important; gap: 3px !important; }
  }

  @media (max-width: 400px) {
    .ra-panel { padding: 0.75rem 0.85rem !important; }
    .ra-title { font-size: 14px !important; }
  }
`;

export default function RetryAutomationPanel({ eventId }) {
  const { getToken } = useKindeAuth();
  const [eligible, setEligible] = useState(null); // null = unknown/loading
  const [automations, setAutomations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const authHeaders = useCallback(async () => {
    const token = await getToken();
    return { Authorization: `Bearer ${token}` };
  }, [getToken]);

  const load = useCallback(async () => {
    if (!eventId) return;
    try {
      const headers = await authHeaders();
      const [eligRes, listRes] = await Promise.all([
        fetch(
          `${BACKEND}/api/events/${eventId}/retry-automations/eligibility`,
          { headers },
        ),
        fetch(`${BACKEND}/api/events/${eventId}/retry-automations`, {
          headers,
        }),
      ]);

      if (!eligRes.ok) {
        console.error(
          "eligibility check failed:",
          eligRes.status,
          await eligRes.text(),
        );
        setEligible(false);
        return;
      }
      const elig = await eligRes.json();
      setEligible(!!elig.canSchedule);

      if (listRes.ok) {
        const list = await listRes.json();
        if (list.success) setAutomations(list.data || []);
      }
    } catch (err) {
      console.error("Failed to load retry automations:", err);
      setEligible(false);
    } finally {
      setLoading(false);
    }
  }, [eventId, authHeaders]);

  useEffect(() => {
    load();
    const iv = setInterval(load, 45000);
    return () => clearInterval(iv);
  }, [load]);

  const setStatus = async (id, status) => {
    try {
      const headers = {
        ...(await authHeaders()),
        "Content-Type": "application/json",
      };
      await fetch(`${BACKEND}/api/events/${eventId}/retry-automations/${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status }),
      });
      await load();
    } catch (err) {
      console.error("Failed to update automation:", err);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this automation? This can't be undone."))
      return;
    try {
      const headers = await authHeaders();
      await fetch(`${BACKEND}/api/events/${eventId}/retry-automations/${id}`, {
        method: "DELETE",
        headers,
      });
      await load();
    } catch (err) {
      console.error("Failed to delete automation:", err);
    }
  };

  if (loading) return null;

  return (
    <>
      <style>{RESPONSIVE_CSS}</style>
      <div
        className="ra-panel"
        style={{
          background: "#111111",
          border: "1px solid #2a2a2a",
          borderRadius: 12,
          marginBottom: "1.5rem",
        }}
      >
        <div
          className="ra-header"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
            justifyContent: "space-between",
            marginBottom: eligible ? 14 : 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              minWidth: 0,
            }}
          >
            <Clock size={16} style={{ color: "#60a5fa", flexShrink: 0 }} />
            <h3
              className="ra-title"
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "#f3f4f6",
                margin: 0,
              }}
            >
              Retry Automation
            </h3>
          </div>

          {eligible && (
            <button
              className="ra-new-btn"
              onClick={() => setShowForm((s) => !s)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 13px",
                borderRadius: 8,
                border: "1px solid #1e3a5f",
                background: "#0a1628",
                color: "#60a5fa",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <Plus size={13} /> New Automation
            </button>
          )}
        </div>

        {!eligible && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              color: "#6b7280",
            }}
          >
            <Lock size={13} style={{ flexShrink: 0 }} />
            Available once the initial call batch has finished running.
          </div>
        )}

        {eligible && showForm && (
          <AutomationForm
            eventId={eventId}
            authHeaders={authHeaders}
            onCreated={() => {
              setShowForm(false);
              load();
            }}
            onCancel={() => setShowForm(false)}
          />
        )}

        {eligible && automations.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              marginTop: 14,
            }}
          >
            {automations.map((a) => (
              <AutomationRow
                key={a.id}
                automation={a}
                eventId={eventId}
                authHeaders={authHeaders}
                expanded={expandedId === a.id}
                onToggleExpand={() =>
                  setExpandedId(expandedId === a.id ? null : a.id)
                }
                onPause={() => setStatus(a.id, "paused")}
                onResume={() => setStatus(a.id, "active")}
                onCancel={() => setStatus(a.id, "cancelled")}
                onDelete={() => remove(a.id)}
              />
            ))}
          </div>
        )}

        {eligible && automations.length === 0 && !showForm && (
          <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
            No automations scheduled yet.
          </p>
        )}
      </div>
    </>
  );
}

function composeTemplateMessage(t) {
  if (!t) return null;
  // The list endpoint (/api/samvaadik/templates) never has this — only the
  // detail endpoint (/api/samvaadik/templates/:wt_id) does, sometimes
  // nested under .preview. Matches WhatsAppPreviewModal's own extraction.
  const comps = t.preview?.components || t.components || [];
  const header = comps.find((c) => c.type === "HEADER");
  const body = comps.find((c) => c.type === "BODY");
  const footer = comps.find((c) => c.type === "FOOTER");

  const parts = [];
  if (header) {
    if (header.format === "TEXT" && header.text) parts.push(header.text);
    else if (header.format === "IMAGE") parts.push("[Image attached]");
    else if (header.format === "VIDEO") parts.push("[Video attached]");
    else if (header.format === "DOCUMENT") parts.push("[Document attached]");
  }
  if (body?.text) parts.push(body.text);
  else if (t.body) parts.push(t.body);
  if (footer?.text) parts.push(footer.text);

  return parts.length ? parts.join("\n\n") : null;
}

// ── New automation form ───────────────────────────────────────────────────
function AutomationForm({ eventId, authHeaders, onCreated, onCancel }) {
  const [mode, setMode] = useState("call");
  const [scheduleType, setScheduleType] = useState("once");
  const [runAt, setRunAt] = useState("");
  const [intervalMinutes, setIntervalMinutes] = useState(120);
  const [maxAttempts, setMaxAttempts] = useState(2);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (mode !== "whatsapp") return;
    (async () => {
      try {
        const headers = await authHeaders();
        const res = await fetch(`${BACKEND}/api/samvaadik/templates`, {
          headers,
        });
        const d = await res.json();
        const approved = (d.data || []).filter(
          (t) => !t.status || ["APPROVED", "approved"].includes(t.status),
        );
        setTemplates(approved);
      } catch {
        setTemplates([]);
      }
    })();
  }, [mode, authHeaders]);

  const submit = async () => {
    setError(null);
    if (scheduleType === "once" && !runAt) {
      setError("Pick a date and time.");
      return;
    }
    if (mode === "whatsapp" && !selectedTemplate) {
      setError("Pick a WhatsApp template.");
      return;
    }
    setSubmitting(true);
    try {
      const headers = {
        ...(await authHeaders()),
        "Content-Type": "application/json",
      };

      // The list item in `selectedTemplate` has no body/header/footer
      // content — only the detail endpoint does. Fetch it now so the
      // chat log can show what was actually sent, same as the preview
      // modal already has to do.
      let templateBody = null;
      if (mode === "whatsapp" && selectedTemplate?.wt_id) {
        try {
          const detailRes = await fetch(
            `${BACKEND}/api/samvaadik/templates/${selectedTemplate.wt_id}`,
            { headers: await authHeaders() },
          );
          const detail = await detailRes.json();
          templateBody = composeTemplateMessage(detail.data || detail);
        } catch (e) {
          templateBody = null; // non-fatal — falls back to placeholder server-side
        }
      }

      const res = await fetch(
        `${BACKEND}/api/events/${eventId}/retry-automations`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            mode,
            schedule_type: scheduleType,
            run_at:
              scheduleType === "once"
                ? new Date(runAt).toISOString()
                : undefined,
            interval_minutes:
              scheduleType === "recurring"
                ? Number(intervalMinutes)
                : undefined,
            max_attempts_per_participant: Number(maxAttempts),
            template_id:
              mode === "whatsapp" ? selectedTemplate.name : undefined,
            template_language:
              mode === "whatsapp"
                ? selectedTemplate.language ||
                  selectedTemplate.language_code ||
                  "en"
                : undefined,
            template_body: mode === "whatsapp" ? templateBody : undefined,
          }),
        },
      );
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to create automation");
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        background: "#0d0d0d",
        border: "1px solid #2a2a2a",
        borderRadius: 10,
        padding: "1rem",
        marginBottom: 14,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {/* Mode tabs */}
      <div
        className="ra-mode-tabs"
        style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
      >
        <ModeTab
          active={mode === "call"}
          icon={<PhoneCall size={13} />}
          label="Retry Call"
          onClick={() => setMode("call")}
        />
        <ModeTab
          active={mode === "whatsapp"}
          icon={<MessageSquare size={13} />}
          label="WhatsApp Message"
          onClick={() => setMode("whatsapp")}
        />
      </div>

      {mode === "whatsapp" && (
        <div
          className="ra-form-fields"
          style={{ display: "flex", gap: 12, flexWrap: "wrap" }}
        >
          <Field label="Template">
            <select
              className="ra-select"
              value={selectedTemplate?.wt_id || ""}
              onChange={(e) => {
                const t = templates.find(
                  (tpl) => String(tpl.wt_id) === e.target.value,
                );
                setSelectedTemplate(t || null);
              }}
              style={selectStyle}
            >
              <option value="">Select a template…</option>
              {templates.map((t) => (
                <option key={t.wt_id} value={t.wt_id}>
                  {t.name} ({t.language})
                </option>
              ))}
            </select>
          </Field>
        </div>
      )}

      <div
        className="ra-mode-tabs"
        style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
      >
        <ModeTab
          active={scheduleType === "once"}
          label="Run once"
          onClick={() => setScheduleType("once")}
          compact
        />
        <ModeTab
          active={scheduleType === "recurring"}
          label="Recurring"
          onClick={() => setScheduleType("recurring")}
          compact
        />
      </div>

      <div
        className="ra-form-fields"
        style={{ display: "flex", gap: 12, flexWrap: "wrap" }}
      >
        {scheduleType === "once" ? (
          <Field label="Run at">
            <input
              className="ra-input"
              type="datetime-local"
              value={runAt}
              onChange={(e) => setRunAt(e.target.value)}
              style={inputStyle}
            />
          </Field>
        ) : (
          <Field label="Repeat every (minutes)">
            <input
              className="ra-input"
              type="number"
              min={15}
              value={intervalMinutes}
              onChange={(e) => setIntervalMinutes(e.target.value)}
              style={inputStyle}
            />
          </Field>
        )}

        <Field label="Max attempts per participant">
          <input
            className="ra-input"
            type="number"
            min={1}
            max={10}
            value={maxAttempts}
            onChange={(e) => setMaxAttempts(e.target.value)}
            style={{ ...inputStyle, width: 90 }}
          />
        </Field>
      </div>

      {error && (
        <p style={{ color: "#f87171", fontSize: 13, margin: 0 }}>{error}</p>
      )}

      <div
        className="ra-form-actions"
        style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
      >
        <button
          onClick={submit}
          disabled={submitting}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: "none",
            background: submitting ? "#374151" : "#000",
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            cursor: submitting ? "not-allowed" : "pointer",
          }}
        >
          {submitting ? "Scheduling…" : "Schedule Automation"}
        </button>
        <button
          onClick={onCancel}
          disabled={submitting}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: "1px solid #2a2a2a",
            background: "#1a1a1a",
            color: "#d1d5db",
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function AutomationRow({
  automation,
  authHeaders,
  expanded,
  onToggleExpand,
  onPause,
  onResume,
  onCancel,
  onDelete,
}) {
  const [runs, setRuns] = useState(null);

  useEffect(() => {
    if (!expanded || runs) return;
    (async () => {
      try {
        const headers = await authHeaders();
        const res = await fetch(
          `${BACKEND}/api/events/${automation.event_id}/retry-automations/${automation.id}/runs`,
          { headers },
        );
        const d = await res.json();
        setRuns(d.data || []);
      } catch {
        setRuns([]);
      }
    })();
  }, [expanded, automation.event_id, automation.id, runs, authHeaders]);

  const isPaused = automation.status === "paused";
  const isDone = ["completed", "cancelled", "failed"].includes(
    automation.status,
  );

  return (
    <div
      style={{
        border: "1px solid #1f1f1f",
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      <div
        className="ra-row-top"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
          padding: "10px 12px",
          background: "#141414",
        }}
      >
        <div
          className="ra-row-label"
          style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}
        >
          {automation.mode === "call" ? (
            <PhoneCall size={13} style={{ color: "#34d399", flexShrink: 0 }} />
          ) : (
            <MessageSquare
              size={13}
              style={{ color: "#c9a97a", flexShrink: 0 }}
            />
          )}

          <span style={{ fontSize: 13, color: "#e5e7eb", fontWeight: 500 }}>
            {automation.mode === "call" ? "Call retry" : "WhatsApp retry"}
            {" · "}
            {automation.schedule_type === "once"
              ? "one-time"
              : `every ${automation.interval_minutes}m`}
          </span>
        </div>

        <StatusBadge status={automation.status} />

        <span
          className="ra-row-meta"
          style={{ fontSize: 12, color: "#6b7280" }}
        >
          Next run:{" "}
          {automation.status === "completed" ||
          automation.status === "cancelled"
            ? "—"
            : new Date(automation.next_run_at).toLocaleString()}
        </span>

        <div className="ra-row-actions" style={{ display: "flex", gap: 6 }}>
          {!isDone &&
            (isPaused ? (
              <IconBtn onClick={onResume} title="Resume">
                <Play size={13} />
              </IconBtn>
            ) : (
              <IconBtn onClick={onPause} title="Pause">
                <Pause size={13} />
              </IconBtn>
            ))}
          {!isDone && (
            <IconBtn onClick={onCancel} title="Cancel">
              <Trash2 size={13} />
            </IconBtn>
          )}
          {isDone && (
            <IconBtn onClick={onDelete} title="Delete">
              <Trash2 size={13} />
            </IconBtn>
          )}
          <IconBtn onClick={onToggleExpand} title="History">
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </IconBtn>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: "10px 12px", background: "#0d0d0d" }}>
          {runs === null ? (
            <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>
              Loading history…
            </p>
          ) : runs.length === 0 ? (
            <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>
              No runs yet.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {runs.map((r) => (
                <div
                  key={r.id}
                  className="ra-history-row"
                  style={{
                    display: "flex",
                    gap: 10,
                    fontSize: 12,
                    color: "#9ca3af",
                    flexWrap: "wrap",
                  }}
                >
                  <span>{new Date(r.ran_at).toLocaleString()}</span>
                  <span>Targeted: {r.participants_targeted}</span>
                  <span style={{ color: "#34d399" }}>
                    Sent: {r.participants_succeeded}
                  </span>
                  {r.participants_failed > 0 && (
                    <span style={{ color: "#f87171" }}>
                      Failed: {r.participants_failed}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Small shared bits ───────────────────────────────────────────────────────
const inputStyle = {
  padding: "7px 10px",
  background: "#1a1a1a",
  border: "1px solid #2a2a2a",
  borderRadius: 6,
  color: "#fff",
  fontSize: 13,
};
const selectStyle = { ...inputStyle, minWidth: 200 };

function Field({ label, children }) {
  return (
    <div
      className="ra-field"
      style={{ display: "flex", flexDirection: "column", gap: 4 }}
    >
      <span
        style={{
          fontSize: 11,
          color: "#6b7280",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}

function ModeTab({ active, icon, label, onClick, compact }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        padding: compact ? "5px 11px" : "7px 13px",
        borderRadius: 8,
        border: active ? "1px solid #1d4ed8" : "1px solid #2a2a2a",
        background: active ? "#0a1628" : "#1a1a1a",
        color: active ? "#60a5fa" : "#9ca3af",
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      {icon}
      {label}
    </button>
  );
}

function IconBtn({ children, onClick, title }) {
  return (
    <button
      className="ra-icon-btn"
      onClick={onClick}
      title={title}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 26,
        height: 26,
        borderRadius: 6,
        border: "1px solid #2a2a2a",
        background: "#1a1a1a",
        color: "#9ca3af",
        cursor: "pointer",
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}

const STATUS_STYLES = {
  scheduled: { background: "#0a1628", border: "#1e3a5f", color: "#60a5fa" },
  active: { background: "#064e3b", border: "#065f46", color: "#34d399" },
  paused: { background: "#1c1a08", border: "#3d3207", color: "#fbbf24" },
  completed: { background: "#1a1a1a", border: "#2a2a2a", color: "#9ca3af" },
  cancelled: { background: "#1a1a1a", border: "#2a2a2a", color: "#6b7280" },
  failed: { background: "#450a0a", border: "#7f1d1d", color: "#f87171" },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.scheduled;
  return (
    <span
      style={{
        padding: "2px 9px",
        borderRadius: 20,
        background: s.background,
        border: `1px solid ${s.border}`,
        color: s.color,
        fontSize: 11,
        fontWeight: 600,
        flexShrink: 0,
      }}
    >
      {status}
    </span>
  );
}
