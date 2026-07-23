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
  .stb-wrap {
    position: fixed; left: 0; right: 0; bottom: 20px;
    z-index: 1100;
    display: flex; justify-content: center;
    padding: 0 16px;
    pointer-events: none;
  }

  .stb-bar {
    pointer-events: auto;
    display: flex; align-items: center; gap: 4px;
    background: #1a1714;
    border: 1px solid #2e2a25;
    border-radius: 14px;
    padding: 8px;
    box-shadow: 0 20px 56px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.02) inset;
    animation: stb-in 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
    max-width: calc(100vw - 32px);
    flex-wrap: wrap;
    row-gap: 6px;
  }

  /* ── Count + clear ── */
  .stb-count {
    display: flex; align-items: center; gap: 8px;
    padding: 6px 6px 6px 10px;
    flex-shrink: 0;
  }
  .stb-badge {
    display: flex; align-items: center; justify-content: center;
    min-width: 22px; height: 22px; padding: 0 6px;
    background: #c9a97a; color: #120f0d;
    font-size: 0.74rem; font-weight: 700;
    border-radius: 20px;
    font-variant-numeric: tabular-nums;
  }
  .stb-label {
    font-size: 0.79rem; color: #9a8e82; white-space: nowrap;
  }
  .stb-clear {
    all: unset; cursor: pointer; display: flex; align-items: center; justify-content: center;
    width: 22px; height: 22px; border-radius: 6px;
    color: #5a5248; transition: background 0.12s, color 0.12s;
  }
  .stb-clear:hover { background: #252220; color: #d4cdc6; }

  .stb-divider {
    width: 1px; align-self: stretch; margin: 4px 2px;
    background: #2a2620; flex-shrink: 0;
  }

  .stb-group { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }

  /* ── Buttons ── */
  .stb-btn {
    all: unset; cursor: pointer; box-sizing: border-box;
    display: inline-flex; align-items: center; gap: 7px;
    padding: 8px 14px; border-radius: 9px;
    font-size: 0.8rem; font-weight: 600; white-space: nowrap;
    font-family: inherit; color: #b8b0a6;
    transition: background 0.12s, color 0.12s, opacity 0.12s;
  }
  .stb-btn svg { flex-shrink: 0; }
  .stb-btn:hover:not(:disabled) { background: #221e19; color: #e8ddd0; }
  .stb-btn:disabled { opacity: 0.32; cursor: not-allowed; }

  .stb-btn-primary { color: #c9a97a; }
  .stb-btn-primary:hover:not(:disabled) { background: #2a2113; color: #e0bd8a; }

  .stb-btn-delete:hover:not(:disabled) { background: #251311; color: #d99090; }

  .stb-spinner {
    width: 13px; height: 13px; border-radius: 50%;
    border: 2px solid currentColor; border-top-color: transparent;
    animation: stb-spin 0.7s linear infinite; flex-shrink: 0;
  }

  .stb-op-label {
    font-size: 0.76rem; color: #8a7d6e; white-space: nowrap;
    display: flex; align-items: center; gap: 6px;
    padding: 8px 10px;
  }

  @keyframes stb-in {
    from { opacity: 0; transform: translateY(14px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes stb-spin { to { transform: rotate(360deg); } }

  /* ── Responsive ── */
  @media (max-width: 640px) {
    .stb-wrap { bottom: 12px; padding: 0 10px; }
    .stb-bar {
      width: 100%; max-width: 480px;
      border-radius: 16px; padding: 10px;
      flex-direction: column; align-items: stretch;
      gap: 8px;
    }
    .stb-count {
      justify-content: space-between; padding: 2px 4px 6px;
      border-bottom: 1px solid #221e19;
    }
    .stb-divider { display: none; }
    .stb-group {
      display: grid; grid-template-columns: 1fr 1fr; gap: 6px;
      width: 100%;
    }
    .stb-btn {
      justify-content: center; width: 100%; padding: 10px 8px;
    }
    .stb-op-label { justify-content: center; padding: 4px 0 0; }
  }

  @media (prefers-reduced-motion: reduce) {
    .stb-bar { animation: none; }
    .stb-spinner { animation: none; }
  }
`;

const Icon = {
  call: (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  whatsapp: (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  ),
  edit: (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  ),
  delete: (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </svg>
  ),
  close: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="M6 6l12 12" />
    </svg>
  ),
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
      call: "Starting call…",
      whatsapp: "Sending…",
      delete: "Deleting…",
      edit: "Saving…",
    }[operationType] || null;

  return (
    <>
      <style>{css}</style>
      <div className="stb-wrap">
        <div className="stb-bar" role="toolbar" aria-label="Selection actions">
          {/* Count + clear */}
          <div className="stb-count">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="stb-badge">{selectedCount}</span>
              <span className="stb-label">
                {selectedCount === 1
                  ? "participant selected"
                  : "participants selected"}
              </span>
            </div>
            <button
              className="stb-clear"
              onClick={onClearSelection}
              title="Clear selection"
              aria-label="Clear selection"
            >
              {Icon.close}
            </button>
          </div>

          <div className="stb-divider" />

          {locked && opLabel && (
            <span className="stb-op-label">
              <span className="stb-spinner" />
              {opLabel}
            </span>
          )}

          {/* Communication actions */}
          <div className="stb-group">
            <button
              className="stb-btn stb-btn-primary"
              onClick={onStartBatchCall}
              disabled={locked}
              title="Start batch call for selected"
            >
              {operationType === "call" ? (
                <span className="stb-spinner" />
              ) : (
                Icon.call
              )}
              Start Batch Call
            </button>
            <button
              className="stb-btn stb-btn-primary"
              onClick={onSendWhatsApp}
              disabled={locked}
              title="Send WhatsApp template to selected"
            >
              {operationType === "whatsapp" ? (
                <span className="stb-spinner" />
              ) : (
                Icon.whatsapp
              )}
              Send WhatsApp
            </button>
          </div>

          <div className="stb-divider" />

          {/* Data actions */}
          <div className="stb-group">
            <button
              className="stb-btn"
              onClick={onEdit}
              disabled={locked || !canEdit}
              title={
                !canEdit
                  ? "Select exactly one participant to edit"
                  : "Edit participant"
              }
            >
              {Icon.edit} Edit
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
                Icon.delete
              )}
              Delete
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
