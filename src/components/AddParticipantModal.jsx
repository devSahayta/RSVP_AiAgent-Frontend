// components/AddParticipantModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Add a new participant. Supports dynamic smart fields for smart_fields events.
//
// Props:
//   eventId
//   smartFields   — array of { field_key, field_label, field_type, options, is_required }
//                   pass [] or omit for classic events (only base fields shown)
//   onClose       — () => void
//   onSuccess     — (newParticipant) => void
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";

const BACKEND = import.meta.env.VITE_BACKEND_URL;

const css = `
  .apm-overlay {
    position: fixed; inset: 0; z-index: 1200;
    background: rgba(0,0,0,0.72); backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center;
    padding: 16px; animation: apm-fade 0.15s ease;
  }
  .apm-modal {
    width: 100%; max-width: 460px;
    background: #111; border: 1px solid #222;
    border-radius: 12px;
    box-shadow: 0 24px 64px rgba(0,0,0,0.5);
    animation: apm-up 0.18s ease;
    display: flex; flex-direction: column;
    max-height: min(86vh, 700px);
  }
  .apm-header { padding: 22px 24px 14px; border-bottom: 1px solid #1e1e1e; flex-shrink: 0; }
  .apm-title { font-size: 1rem; font-weight: 600; color: #f3f4f6; margin: 0 0 4px; }
  .apm-sub   { font-size: 0.77rem; color: #4b5563; margin: 0; }
  .apm-body  { flex: 1; overflow-y: auto; padding: 18px 24px; }
  .apm-body::-webkit-scrollbar { width: 4px; }
  .apm-body::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 2px; }

  .apm-section-label {
    font-size: 0.7rem; font-weight: 700; color: #4b5563;
    text-transform: uppercase; letter-spacing: 0.07em;
    margin: 18px 0 10px;
  }
  .apm-section-label:first-child { margin-top: 0; }

  .apm-field { margin-bottom: 14px; }
  .apm-label {
    display: flex; align-items: center; gap: 4px;
    font-size: 0.75rem; font-weight: 600; color: #6b7280;
    margin-bottom: 5px; letter-spacing: 0.02em;
  }
  .apm-required { color: #f87171; }
  .apm-input, .apm-select {
    width: 100%; box-sizing: border-box;
    background: #1a1a1a; border: 1px solid #2a2a2a;
    border-radius: 8px; padding: 9px 12px;
    color: #f3f4f6; font-size: 0.875rem; outline: none;
    transition: border-color 0.15s; font-family: inherit;
  }
  .apm-input:focus, .apm-select:focus { border-color: #4b5563; }
  .apm-input::placeholder { color: #374151; }
  .apm-hint { font-size: 0.7rem; color: #374151; margin-top: 4px; }

  .apm-toggle-row { display: flex; gap: 8px; }
  .apm-toggle-btn {
    flex: 1; all: unset; cursor: pointer; text-align: center;
    padding: 8px; border-radius: 7px; font-size: 0.8rem; font-weight: 600;
    border: 1px solid #2a2a2a; color: #6b7280; transition: all 0.15s;
  }
  .apm-toggle-btn.active { background: #1a2540; border-color: #1d4ed8; color: #93c5fd; }

  .apm-err {
    background: #1a0808; border: 1px solid #3a1010;
    border-radius: 8px; padding: 10px 12px;
    font-size: 0.78rem; color: #f87171; margin-bottom: 16px;
  }
  .apm-footer {
    padding: 16px 24px; border-top: 1px solid #1e1e1e;
    display: flex; gap: 10px; flex-shrink: 0;
  }
  .apm-btn {
    all: unset; cursor: pointer; flex: 1; text-align: center;
    padding: 10px 16px; border-radius: 8px;
    font-size: 0.85rem; font-weight: 600; transition: all 0.15s;
    font-family: inherit;
  }
  .apm-btn-cancel { background: transparent; border: 1px solid #2a2a2a; color: #6b7280; }
  .apm-btn-cancel:hover { border-color: #3a3a3a; color: #9ca3af; }
  .apm-btn-save { background: #f3f4f6; color: #111; border: 1px solid transparent; }
  .apm-btn-save:hover:not(:disabled) { background: #fff; }
  .apm-btn-save:disabled { background: #1f1f1f; color: #374151; cursor: not-allowed; }
  .apm-spinner {
    display: inline-block; width: 14px; height: 14px; border-radius: 50%;
    border: 2px solid #374151; border-top-color: #9ca3af;
    animation: apm-spin 0.7s linear infinite; vertical-align: middle; margin-right: 6px;
  }
  @keyframes apm-fade { from{opacity:0} to{opacity:1} }
  @keyframes apm-up { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes apm-spin { to{transform:rotate(360deg)} }
  @media(max-width:480px){
    .apm-header,.apm-body,.apm-footer { padding-left:18px; padding-right:18px; }
    .apm-footer { flex-direction: column; }
  }
`;

function DynamicField({ field, value, onChange }) {
  const { field_key, field_label, field_type, options, is_required } = field;

  if (field_type === "yes_no") {
    return (
      <div className="apm-field">
        <label className="apm-label">
          {field_label} {is_required && <span className="apm-required">*</span>}
        </label>
        <div className="apm-toggle-row">
          {["yes", "no"].map((opt) => (
            <button
              key={opt}
              type="button"
              className={`apm-toggle-btn${value === opt ? " active" : ""}`}
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
      <div className="apm-field">
        <label className="apm-label">
          {field_label} {is_required && <span className="apm-required">*</span>}
        </label>
        <select
          className="apm-select"
          value={value || ""}
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
      <div className="apm-field">
        <label className="apm-label">
          {field_label} {is_required && <span className="apm-required">*</span>}
        </label>
        <input
          className="apm-input"
          type="number"
          value={value || ""}
          onChange={(e) => onChange(field_key, e.target.value)}
          placeholder="0"
        />
      </div>
    );
  }

  // default: text
  return (
    <div className="apm-field">
      <label className="apm-label">
        {field_label} {is_required && <span className="apm-required">*</span>}
      </label>
      <input
        className="apm-input"
        value={value || ""}
        onChange={(e) => onChange(field_key, e.target.value)}
        placeholder={`Enter ${field_label.toLowerCase()}`}
      />
    </div>
  );
}

export default function AddParticipantModal({
  eventId,
  smartFields = [],
  onClose,
  onSuccess,
}) {
  const { getToken } = useKindeAuth();

  const [base, setBase] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
  });
  const [dynamicValues, setDynamicValues] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const setBaseField = (key, val) => setBase((p) => ({ ...p, [key]: val }));
  const setDynField = (key, val) =>
    setDynamicValues((p) => ({ ...p, [key]: val }));

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
    for (const f of smartFields) {
      if (f.is_required && !dynamicValues[f.field_key]) {
        setError(`"${f.field_label}" is required.`);
        return;
      }
    }

    setSaving(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch(`${BACKEND}/api/events/${eventId}/participants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: base.fullName.trim(),
          phone_number: base.phoneNumber.trim(),
          email: base.email.trim() || null,
          smart_field_values: smartFields.length ? dynamicValues : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add participant");
      onSuccess?.(data.data);
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
        className="apm-overlay"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="apm-modal">
          <div className="apm-header">
            <h3 className="apm-title">Add Participant</h3>
            <p className="apm-sub">
              {smartFields.length
                ? "Fill in their details and smart field responses."
                : "Add a new participant to this event."}
            </p>
          </div>

          <div className="apm-body">
            {error && <div className="apm-err">{error}</div>}

            <p className="apm-section-label">Basic Info</p>
            <div className="apm-field">
              <label className="apm-label">
                Full Name <span className="apm-required">*</span>
              </label>
              <input
                className="apm-input"
                value={base.fullName}
                onChange={(e) => setBaseField("fullName", e.target.value)}
                placeholder="e.g. RAHUL KUMAR"
                disabled={saving}
              />
            </div>
            <div className="apm-field">
              <label className="apm-label">
                Phone Number <span className="apm-required">*</span>
              </label>
              <input
                className="apm-input"
                value={base.phoneNumber}
                onChange={(e) => setBaseField("phoneNumber", e.target.value)}
                placeholder="e.g. 9161XXXXXXXX"
                disabled={saving}
              />
              <p className="apm-hint">Include country code, no + or spaces</p>
            </div>
            <div className="apm-field">
              <label className="apm-label">Email</label>
              <input
                className="apm-input"
                type="email"
                value={base.email}
                onChange={(e) => setBaseField("email", e.target.value)}
                placeholder="e.g. name@email.com"
                disabled={saving}
              />
            </div>

            {smartFields.length > 0 && (
              <>
                <p className="apm-section-label">Event Fields</p>
                {smartFields
                  .sort(
                    (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0),
                  )
                  .map((f) => (
                    <DynamicField
                      key={f.field_key}
                      field={f}
                      value={dynamicValues[f.field_key]}
                      onChange={setDynField}
                    />
                  ))}
              </>
            )}
          </div>

          <div className="apm-footer">
            <button
              className="apm-btn apm-btn-cancel"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              className="apm-btn apm-btn-save"
              onClick={handleSave}
              disabled={saving}
            >
              {saving && <span className="apm-spinner" />}
              {saving ? "Adding…" : "Add Participant"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
