// components/DeleteConfirmModal.jsx
// Props: count, names (array of names), onConfirm, onCancel, deleting

const css = `
  .dcm-overlay {
    position: fixed; inset: 0; z-index: 1200;
    background: rgba(0,0,0,0.75); backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center; padding: 16px;
  }
  .dcm-box {
    width: 100%; max-width: 400px;
    background: #111; border: 1px solid #2a2a2a;
    border-radius: 12px; padding: 24px;
    box-shadow: 0 24px 64px rgba(0,0,0,0.5);
  }
  .dcm-title { font-size: 1rem; font-weight: 600; color: #f3f4f6; margin: 0 0 8px; }
  .dcm-body  { font-size: 0.83rem; color: #6b7280; line-height: 1.5; margin: 0 0 16px; }
  .dcm-names {
    background: #1a1a1a; border: 1px solid #2a2a2a;
    border-radius: 8px; padding: 10px 12px; margin-bottom: 20px;
    max-height: 120px; overflow-y: auto;
  }
  .dcm-name { font-size: 0.8rem; color: #e5e7eb; padding: 2px 0; }
  .dcm-warn {
    background: #1a0808; border: 1px solid #3a1010;
    border-radius: 8px; padding: 10px 12px; margin-bottom: 20px;
    font-size: 0.78rem; color: #f87171;
  }
  .dcm-actions { display: flex; gap: 10px; }
  .dcm-btn {
    all: unset; cursor: pointer; flex: 1; text-align: center;
    padding: 10px 16px; border-radius: 8px;
    font-size: 0.85rem; font-weight: 600;
    transition: all 0.15s; font-family: inherit;
  }
  .dcm-cancel { background: transparent; border: 1px solid #2a2a2a; color: #6b7280; }
  .dcm-cancel:hover { border-color: #3a3a3a; color: #9ca3af; }
  .dcm-confirm { background: #7f1d1d; color: #fff; border: 1px solid #991b1b; }
  .dcm-confirm:hover:not(:disabled) { background: #991b1b; }
  .dcm-confirm:disabled { opacity: 0.5; cursor: not-allowed; }
  .dcm-spinner {
    display: inline-block; width: 13px; height: 13px; border-radius: 50%;
    border: 2px solid #fff6; border-top-color: #fff;
    animation: dcm-spin 0.7s linear infinite; vertical-align: middle; margin-right: 6px;
  }
  @keyframes dcm-spin { to { transform: rotate(360deg); } }
  @media(max-width:480px){ .dcm-actions{flex-direction:column;} }
`;

export default function DeleteConfirmModal({
  count,
  names = [],
  onConfirm,
  onCancel,
  deleting,
}) {
  return (
    <>
      <style>{css}</style>
      <div className="dcm-overlay">
        <div className="dcm-box">
          <h3 className="dcm-title">
            Delete {count} participant{count !== 1 ? "s" : ""}?
          </h3>
          <p className="dcm-body">
            This action cannot be undone. All RSVP data for these participants
            will also be removed.
          </p>

          {names.length > 0 && (
            <div className="dcm-names">
              {names.map((n, i) => (
                <div key={i} className="dcm-name">
                  · {n}
                </div>
              ))}
            </div>
          )}

          <div className="dcm-warn">
            ⚠ This cannot be performed while a call batch or WhatsApp send is in
            progress.
          </div>

          <div className="dcm-actions">
            <button
              className="dcm-btn dcm-cancel"
              onClick={onCancel}
              disabled={deleting}
            >
              Cancel
            </button>
            <button
              className="dcm-btn dcm-confirm"
              onClick={onConfirm}
              disabled={deleting}
            >
              {deleting && <span className="dcm-spinner" />}
              {deleting ? "Deleting..." : `Delete ${count}`}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
