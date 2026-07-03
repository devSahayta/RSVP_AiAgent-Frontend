// components/FollowupRuleSummary.jsx
// Event-level "what follow-up message will fire after a call" card, shown on
// the Dashboard for smart_fields events. Reuses the same FollowupRulePicker
// modal and the existing GET/POST /api/events/:eventId/followup-rule routes
// that EventForm.jsx uses at event-creation time.
import { useEffect, useState } from "react";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { MessageSquarePlus, Pencil } from "lucide-react";
import FollowupRulePicker from "./FollowupRulePicker";

const BACKEND = import.meta.env.VITE_BACKEND_URL;

const TRIGGER_LABELS = {
  always: "Always",
  answered: "Only if answered",
  unanswered: "Only if unanswered",
};

export default function FollowupRuleSummary({ eventId }) {
  const { getToken } = useKindeAuth();
  const [rule, setRule] = useState(undefined); // undefined = loading, null = none configured
  const [templateName, setTemplateName] = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  const fetchRule = async () => {
    try {
      const res = await fetch(
        `${BACKEND}/api/events/${eventId}/followup-rule`,
      );
      const json = await res.json();
      setRule(json.success ? json.data : null);
    } catch (err) {
      console.error("Failed to fetch follow-up rule:", err);
      setRule(null);
    }
  };

  useEffect(() => {
    if (!eventId) return;
    fetchRule();
  }, [eventId]);

  // Resolve the template name for display — the rule only stores wt_id.
  useEffect(() => {
    if (!rule?.wt_id) {
      setTemplateName(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${BACKEND}/api/samvaadik/templates`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        const match = (json.data || []).find(
          (t) => (t.wt_id || t.id) === rule.wt_id,
        );
        if (!cancelled) setTemplateName(match?.name || null);
      } catch {
        if (!cancelled) setTemplateName(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [rule?.wt_id]);

  const handleSave = async (config) => {
    try {
      await fetch(`${BACKEND}/api/events/${eventId}/followup-rule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          is_active: true,
          trigger_on: config.trigger_on,
          wt_id: config.wt_id,
          variable_mapping: config.variable_mapping,
          delay_minutes: config.delay_minutes,
          media_id: config.media_id || null,
        }),
      });
      await fetchRule();
    } catch (err) {
      console.error("Failed to save follow-up rule:", err);
    }
  };

  if (rule === undefined) return null;

  return (
    <div style={{ maxWidth: 700, margin: "0 auto 1.5rem" }}>
      {rule ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "12px 16px",
            border: "1px solid #2a2a2a",
            borderRadius: 8,
            background: "#1a1a1a",
          }}
        >
          <div style={{ fontSize: "0.85rem", color: "#ffffff", minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                color: "#9ca3af",
                fontSize: "0.72rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                marginBottom: 4,
              }}
            >
              <MessageSquarePlus size={13} />
              Follow-up WhatsApp Message
            </div>
            <strong>{templateName || rule.wt_id}</strong>
            <span style={{ color: "#9ca3af" }}>
              {" "}
              · {TRIGGER_LABELS[rule.trigger_on] || rule.trigger_on} · delay{" "}
              {rule.delay_minutes} min ·{" "}
              {rule.is_active ? "Active" : "Inactive"}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowPicker(true)}
            title="Edit"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              flexShrink: 0,
              background: "#111111",
              border: "1px solid #3a3a3a",
              borderRadius: 6,
              padding: "6px 12px",
              color: "#ffffff",
              cursor: "pointer",
              fontSize: "0.8rem",
            }}
          >
            <Pencil size={13} />
            Edit
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "12px 16px",
            border: "1px dashed #2a2a2a",
            borderRadius: 8,
            background: "transparent",
          }}
        >
          <span style={{ color: "#9ca3af", fontSize: "0.85rem" }}>
            No follow-up WhatsApp message configured for this event.
          </span>
          <button
            type="button"
            onClick={() => setShowPicker(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              flexShrink: 0,
              background: "#1a1a1a",
              border: "1px solid #2a2a2a",
              borderRadius: 6,
              padding: "6px 12px",
              color: "#ffffff",
              cursor: "pointer",
              fontSize: "0.8rem",
            }}
          >
            <MessageSquarePlus size={13} />
            Add Follow-up
          </button>
        </div>
      )}

      {showPicker && (
        <FollowupRulePicker
          initialConfig={rule}
          onClose={() => setShowPicker(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
