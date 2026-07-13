// components/SelectionToolbar.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Floating action bar that appears when participants are selected.
// Reusable in both RSVPTable and SmartRSVPTable.
//
// Props:
//   selectedCount       — number of selected rows
//   onClearSelection    — () => void
//   onStartBatchCall    — () => void
//   onSendWhatsApp      — () => void  (opens TemplatePickerModal)
//   onEdit              — () => void  (only when exactly 1 selected)
//   onDelete            — () => void
//   operationInProgress — bool: disables all except clear during operations
//   operationType       — 'call' | 'whatsapp' | 'delete' | 'edit' | null
// ─────────────────────────────────────────────────────────────────────────────

const css = `
  .stb-bar {
    position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
    z-index: 1100;
    background: #111; border: 1px solid #2a2a2a;
    border-radius: 12px; padding: 10px 16px;
    display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
    box-shadow: 0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px #ffffff08 inset;
    animation: stb-in 0.2s ease;
    max-width: calc(100vw - 32px);
  }
  .stb-count {
    display: flex; align-items: center; gap: 8px;
    padding-right: 10px; border-right: 1px solid #2a2a2a;
    flex-shrink: 0;
  }
  .stb-badge {
    background: #1d4ed8; color: #fff;
    font-size: 0.72rem; font-weight: 700;
    padding: 3px 9px; border-radius: 20px;
    letter-spacing: 0.02em;
  }
  .stb-label { font-size: 0.8rem; color: #9ca3af; white-space: nowrap; }
  .stb-clear {
    all: unset; cursor: pointer; color: #6b7280; font-size: 1rem;
    line-height: 1; padding: 2px 4px; border-radius: 4px;
    transition: color 0.15s;
  }
  .stb-clear:hover { color: #e5e7eb; }
  .stb-divider { width: 1px; height: 24px; background: #2a2a2a; flex-shrink: 0; }
  .stb-group { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
  .stb-btn {
    all: unset; cursor: pointer; display: inline-flex; align-items: center;
    gap: 6px; padding: 7px 14px; border-radius: 8px;
    font-size: 0.8rem; font-weight: 600; white-space: nowrap;
    transition: all 0.15s; border: 1px solid transparent;
    font-family: inherit;
  }
  .stb-btn:disabled { opacity: 0.35; cursor: not-allowed; }
  .stb-btn-call   { background: #0a1628; border-color: #1e3a5f; color: #60a5fa; }
  .stb-btn-call:not(:disabled):hover   { background: #0f2040; }
  .stb-btn-wa     { background: #0a1f12; border-color: #1a4a2a; color: #4ade80; }
  .stb-btn-wa:not(:disabled):hover     { background: #0d2a18; }
  .stb-btn-edit   { background: #1a1408; border-color: #3a2e10; color: #fbbf24; }
  .stb-btn-edit:not(:disabled):hover   { background: #221a0a; }
  .stb-btn-delete { background: #1a0808; border-color: #3a1010; color: #f87171; }
  .stb-btn-delete:not(:disabled):hover { background: #220a0a; }
  .stb-spinner {
    width: 12px; height: 12px; border-radius: 50%;
    border: 2px solid currentColor; border-top-color: transparent;
    animation: stb-spin 0.7s linear infinite; flex-shrink: 0;
  }
  .stb-op-label {
    font-size: 0.75rem; color: #6b7280; white-space: nowrap;
    display: flex; align-items: center; gap: 5px;
  }
  @keyframes stb-in {
    from { opacity:0; transform:translateX(-50%) translateY(12px); }
    to   { opacity:1; transform:translateX(-50%) translateY(0); }
  }
  @keyframes stb-spin { to { transform: rotate(360deg); } }
  @media (max-width: 600px) {
    .stb-bar { bottom: 12px; padding: 10px 12px; gap: 6px; border-radius: 10px; }
    .stb-btn { padding: 6px 10px; font-size: 0.75rem; }
    .stb-label { display: none; }
  }
`;

const icons = {
  call: "↩",
  wa: "✉",
  edit: "✏",
  delete: "✕",
};

export default function SelectionToolbar({
  selectedCount = 0,
  onClearSelection,
  onStartBatchCall,
  onSendWhatsApp,
  onEdit,
  onDelete,
  operationInProgress = false,
  operationType = null,
}) {
  if (selectedCount === 0) return null;

  const canEdit = selectedCount === 1;
  const locked = operationInProgress;

  const opLabel =
    {
      call: "Starting...",
      whatsapp: "Sending...",
      delete: "Deleting...",
      edit: "Saving...",
    }[operationType] || null;

  return (
    <>
      <style>{css}</style>
      <div className="stb-bar" role="toolbar" aria-label="Selection actions">
        {/* Count + clear */}
        <div className="stb-count">
          <span className="stb-badge">{selectedCount}</span>
          <span className="stb-label">
            {selectedCount === 1 ? "participant" : "participants"} selected
          </span>
          <button
            className="stb-clear"
            onClick={onClearSelection}
            title="Clear selection"
          >
            ×
          </button>
        </div>

        <div className="stb-divider" />

        {/* Operation in-progress label */}
        {locked && opLabel && (
          <span className="stb-op-label">
            <span className="stb-spinner" />
            {opLabel}
          </span>
        )}

        {/* Communication actions */}
        <div className="stb-group">
          <button
            className="stb-btn stb-btn-call"
            onClick={onStartBatchCall}
            disabled={locked}
            title="Start batch call for selected"
          >
            {operationType === "call" ? (
              <span className="stb-spinner" />
            ) : (
              icons.call
            )}
            Start Batch Call
          </button>
          <button
            className="stb-btn stb-btn-wa"
            onClick={onSendWhatsApp}
            disabled={locked}
            title="Send WhatsApp template to selected"
          >
            {operationType === "whatsapp" ? (
              <span className="stb-spinner" />
            ) : (
              icons.wa
            )}
            Send WhatsApp
          </button>
        </div>

        <div className="stb-divider" />

        {/* Data actions */}
        <div className="stb-group">
          <button
            className="stb-btn stb-btn-edit"
            onClick={onEdit}
            disabled={locked || !canEdit}
            title={
              !canEdit
                ? "Select exactly one participant to edit"
                : "Edit participant"
            }
          >
            {icons.edit} Edit
          </button>
          <button
            className="stb-btn stb-btn-delete"
            onClick={onDelete}
            disabled={locked}
            title={
              locked
                ? "Cannot delete while an operation is in progress"
                : "Delete selected"
            }
          >
            {operationType === "delete" ? (
              <span className="stb-spinner" />
            ) : (
              icons.delete
            )}
            Delete
          </button>
        </div>
      </div>
    </>
  );
}
