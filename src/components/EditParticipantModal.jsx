// components/EditParticipantModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Edit a participant's basic info (name, phone, email)
// AND their custom smart field responses.
//
// Props:
//   participant   — row object from table (has fullName, phoneNumber, email
//                   AND field values like participant.attendance, etc.)
//   eventId
//   smartFields   — array of { field_key, field_label, field_type, options,
//                   is_required, display_order } from the event
//                   pass [] for classic events (only base fields shown)
//   onClose       — () => void
//   onSuccess     — () => void
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";

const BACKEND = import.meta.env.VITE_BACKEND_URL;

const css = `
  .epm-overlay {
    position: fixed; inset: 0; z-index: 1200;
    background: rgba(0,0,0,0.72); backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center;
    padding: 16px; animation: epm-fade 0.15s ease;
  }
  .epm-modal {
    width: 100%; max-width: 460px;
    background: #111; border: 1px solid #222;
    border-radius: 12px;
    box-shadow: 0 24px 64px rgba(0,0,0,0.5);
    animation: epm-up 0.18s ease;
    display: flex; flex-direction: column;
    max-height: min(88vh, 720px);
  }
  .epm-header {
    padding: 20px 24px 14px; border-bottom: 1px solid #1e1e1e; flex-shrink: 0;
  }
  .epm-title { font-size: 1rem; font-weight: 600; color: #f3f4f6; margin: 0 0 3px; }
  .epm-sub   { font-size: 0.77rem; color: #4b5563; margin: 0; }
  .epm-body  { flex: 1; overflow-y: auto; padding: 18px 24px; }
  .epm-body::-webkit-scrollbar { width: 3px; }
  .epm-body::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 2px; }

  .epm-section {
    font-size: 0.7rem; font-weight: 700; color: #4b5563;
    text-transform: uppercase; letter-spacing: 0.07em;
    margin: 18px 0 10px;
  }
  .epm-section:first-child { margin-top: 0; }
  .epm-field { margin-bottom: 14px; }
  .epm-label {
    display: flex; align-items: center; gap: 4px;
    font-size: 0.75rem; font-weight: 600; color: #6b7280;
    margin-bottom: 5px; letter-spacing: 0.02em;
  }
  .epm-required { color: #f87171; }
  .epm-input, .epm-select {
    width: 100%; box-sizing: border-box;
    background: #1a1a1a; border: 1px solid #2a2a2a;
    border-radius: 8px; padding: 9px 12px;
    color: #f3f4f6; font-size: 0.875rem; outline: none;
    transition: border-color 0.15s; font-family: inherit;
  }
  .epm-input:focus, .epm-select:focus { border-color: #4b5563; }
  .epm-input::placeholder { color: #374151; }
  .epm-input:disabled, .epm-select:disabled { opacity: 0.5; cursor: not-allowed; }

  .epm-toggle-row { display: flex; gap: 8px; }
  .epm-toggle-btn {
    flex: 1; all: unset; cursor: pointer; text-align: center;
    padding: 8px; border-radius: 7px; font-size: 0.8rem; font-weight: 600;
    border: 1px solid #2a2a2a; color: #6b7280; transition: all 0.15s;
  }
  .epm-toggle-btn.active { background: #1a2540; border-color: #1d4ed8; color: #93c5fd; }
  .epm-toggle-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .epm-err {
    background: #1a0808; border: 1px solid #3a1010;
    border-radius: 8px; padding: 10px 12px;
    font-size: 0.78rem; color: #f87171; margin-bottom: 14px;
  }
  .epm-footer {
    padding: 14px 24px; border-top: 1px solid #1e1e1e;
    display: flex; gap: 10px; flex-shrink: 0;
  }
  .epm-btn {
    all: unset; cursor: pointer; flex: 1; text-align: center;
    padding: 10px 16px; border-radius: 8px;
    font-size: 0.85rem; font-weight: 600; transition: all 0.15s;
    font-family: inherit;
  }
  .epm-btn-cancel { background: transparent; border: 1px solid #2a2a2a; color: #6b7280; }
  .epm-btn-cancel:hover { border-color: #3a3a3a; color: #9ca3af; }
  .epm-btn-save   { background: #f3f4f6; color: #111; border: 1px solid transparent; }
  .epm-btn-save:hover:not(:disabled) { background: #fff; }
  .epm-btn-save:disabled { background: #1f1f1f; color: #374151; cursor: not-allowed; }
  .epm-spinner {
    display: inline-block; width: 14px; height: 14px; border-radius: 50%;
    border: 2px solid #374151; border-top-color: #9ca3af;
    animation: epm-spin 0.7s linear infinite; vertical-align: middle; margin-right: 6px;
  }
  @keyframes epm-fade { from{opacity:0} to{opacity:1} }
  @keyframes epm-up { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes epm-spin { to{transform:rotate(360deg)} }
  @media(max-width:480px){
    .epm-header,.epm-body,.epm-footer { padding-left:18px; padding-right:18px; }
    .epm-footer { flex-direction:column; }
  }
`;

// ── Dynamic field renderer (same types as AddParticipantModal) ─────────────
function DynamicField({ field, value, onChange, disabled }) {
  const { field_key, field_label, field_type, options, is_required } = field;

  if (field_type === "yes_no") {
    return (
      <div className="epm-field">
        <label className="epm-label">
          {field_label}
          {is_required && <span className="epm-required">*</span>}
        </label>
        <div className="epm-toggle-row">
          {["yes", "no"].map((opt) => (
            <button
              key={opt}
              type="button"
              disabled={disabled}
              className={`epm-toggle-btn${value?.toLowerCase() === opt ? " active" : ""}`}
              onClick={() => onChange(field_key, opt)}
            >
              {opt === "yes" ? "Yes" : "No"}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (field_type === "choice" && options?.length) {
    return (
      <div className="epm-field">
        <label className="epm-label">
          {field_label}
          {is_required && <span className="epm-required">*</span>}
        </label>
        <select
          className="epm-select"
          value={value || ""}
          disabled={disabled}
          onChange={(e) => onChange(field_key, e.target.value)}
        >
          <option value="">Select…</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (field_type === "number") {
    return (
      <div className="epm-field">
        <label className="epm-label">
          {field_label}
          {is_required && <span className="epm-required">*</span>}
        </label>
        <input
          className="epm-input"
          type="number"
          value={value || ""}
          disabled={disabled}
          onChange={(e) => onChange(field_key, e.target.value)}
          placeholder="0"
        />
      </div>
    );
  }

  return (
    <div className="epm-field">
      <label className="epm-label">
        {field_label}
        {is_required && <span className="epm-required">*</span>}
      </label>
      <input
        className="epm-input"
        value={value || ""}
        disabled={disabled}
        onChange={(e) => onChange(field_key, e.target.value)}
        placeholder={`Enter ${field_label.toLowerCase()}`}
      />
    </div>
  );
}

// ── Main modal ─────────────────────────────────────────────────────────────
export default function EditParticipantModal({
  participant,
  eventId,
  smartFields = [],
  onClose,
  onSuccess,
}) {
  const { getToken } = useKindeAuth();

  const participantId =
    participant.participantId || participant.participant_id || participant.id;

  // ── Base info ─────────────────────────────────────────────────────────────
  const [base, setBase] = useState({
    fullName: participant.fullName || participant.full_name || "",
    phoneNumber: participant.phoneNumber || participant.phone_number || "",
    email: participant.email || "",
  });

  // ── Smart field values — seed from the participant row object ─────────────
  // The participant row from SmartRSVPTable already has field values as direct
  // properties: row.attendance, row.guest_count, row.food_preference, etc.
  const initialFieldValues = {};
  (smartFields || []).forEach((f) => {
    const val = participant[f.field_key];
    if (val !== null && val !== undefined) {
      initialFieldValues[f.field_key] = String(val);
    }
  });
  const [fieldValues, setFieldValues] = useState(initialFieldValues);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const setBaseField = (key, val) => setBase((p) => ({ ...p, [key]: val }));
  const setFieldValue = (key, val) =>
    setFieldValues((p) => ({ ...p, [key]: val }));

  const hasSmartFields = smartFields && smartFields.length > 0;

  const handleSave = async () => {
    if (!base.fullName.trim()) {
      setError("Full name is required.");
      return;
    }
    if (!base.phoneNumber.trim()) {
      setError("Phone number is required.");
      return;
    }

    // Validate required smart fields
    for (const f of smartFields || []) {
      if (f.is_required && !fieldValues[f.field_key]) {
        setError(`"${f.field_label}" is required.`);
        return;
      }
    }

    setSaving(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch(
        `${BACKEND}/api/events/${eventId}/participants/${participantId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            full_name: base.fullName.trim(),
            phone_number: base.phoneNumber.trim(),
            email: base.email.trim() || null,
            // Send smart field values so backend upserts event_rsvp_responses
            smart_field_values: hasSmartFields ? fieldValues : undefined,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      onSuccess?.();
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <style>{css}</style>
      <div
        className="epm-overlay"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="epm-modal">
          <div className="epm-header">
            <h3 className="epm-title">Edit Participant</h3>
            <p className="epm-sub">
              {hasSmartFields
                ? "Update basic info and event field responses."
                : "Update name, phone number, or email."}
            </p>
          </div>

          <div className="epm-body">
            {error && <div className="epm-err">{error}</div>}

            {/* ── Basic info ── */}
            <p className="epm-section">Basic Info</p>

            <div className="epm-field">
              <label className="epm-label">
                Full Name <span className="epm-required">*</span>
              </label>
              <input
                className="epm-input"
                value={base.fullName}
                disabled={saving}
                onChange={(e) => setBaseField("fullName", e.target.value)}
                placeholder="e.g. Thivagar R"
              />
            </div>

            <div className="epm-field">
              <label className="epm-label">
                Phone Number <span className="epm-required">*</span>
              </label>
              <input
                className="epm-input"
                value={base.phoneNumber}
                disabled={saving}
                onChange={(e) => setBaseField("phoneNumber", e.target.value)}
                placeholder="e.g. 916382592767"
              />
            </div>

            <div className="epm-field">
              <label className="epm-label">Email</label>
              <input
                className="epm-input"
                type="email"
                value={base.email}
                disabled={saving}
                onChange={(e) => setBaseField("email", e.target.value)}
                placeholder="e.g. name@email.com"
              />
            </div>

            {/* ── Smart field responses ── */}
            {hasSmartFields && (
              <>
                <p className="epm-section">Event Field Responses</p>
                {[...smartFields]
                  .sort(
                    (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0),
                  )
                  .map((f) => (
                    <DynamicField
                      key={f.field_key}
                      field={f}
                      value={fieldValues[f.field_key]}
                      onChange={setFieldValue}
                      disabled={saving}
                    />
                  ))}
              </>
            )}
          </div>

          <div className="epm-footer">
            <button
              className="epm-btn epm-btn-cancel"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              className="epm-btn epm-btn-save"
              onClick={handleSave}
              disabled={saving}
            >
              {saving && <span className="epm-spinner" />}
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
