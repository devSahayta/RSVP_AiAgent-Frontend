import { useState, useEffect, useRef } from "react";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";

const BACKEND = import.meta.env.VITE_BACKEND_URL;

const css = `
  * { box-sizing: border-box; }

  .frp-overlay {
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(10, 8, 6, 0.8);
    display: flex; align-items: center; justify-content: center;
    padding: 16px;
    animation: frp-fade 0.16s ease;
  }

  .frp-modal {
    width: 100%; max-width: 560px;
    background: #1a1714;
    border: 1px solid #2e2a25;
    border-radius: 12px;
    display: flex; flex-direction: column;
    max-height: min(90vh, 720px);
    overflow: hidden;
    animation: frp-up 0.2s ease;
    box-shadow: 0 24px 64px rgba(0,0,0,0.5);
  }

  .frp-header {
    padding: 20px 22px 16px;
    border-bottom: 1px solid #252220;
    flex-shrink: 0;
  }
  .frp-title {
    margin: 0 0 2px;
    font-size: 0.97rem; font-weight: 600;
    color: #f0ebe4; letter-spacing: -0.01em;
  }
  .frp-subtitle {
    margin: 0; font-size: 0.76rem;
    color: #6b6259; line-height: 1.4;
  }

  .frp-body {
    flex: 1; overflow-y: auto;
  }
  .frp-body::-webkit-scrollbar { width: 3px; }
  .frp-body::-webkit-scrollbar-track { background: transparent; }
  .frp-body::-webkit-scrollbar-thumb { background: #2e2a25; border-radius: 2px; }

  .frp-search-wrap {
    padding: 12px 22px;
    border-bottom: 1px solid #252220;
  }
  .frp-search {
    width: 100%;
    background: #120f0d; border: 1px solid #2e2a25;
    border-radius: 7px; padding: 9px 12px;
    color: #d4cdc6; font-size: 0.84rem;
    outline: none; transition: border-color 0.15s;
    font-family: inherit;
  }
  .frp-search:focus { border-color: #5a4f45; }
  .frp-search::placeholder { color: #3d3730; }

  .frp-list { padding: 6px 0; }

  .frp-row {
    all: unset; display: block; width: 100%;
    padding: 12px 22px; cursor: pointer;
    border-left: 2px solid transparent;
    transition: background 0.1s, border-color 0.1s;
  }
  .frp-row:hover { background: #1f1c19; }
  .frp-row.sel {
    background: #1f1c18;
    border-left-color: #c9a97a;
  }
  .frp-row.disabled { cursor: not-allowed; opacity: 0.5; }
  .frp-row.disabled:hover { background: transparent; }

  .frp-row-top {
    display: flex; align-items: center;
    justify-content: space-between; gap: 10px;
    margin-bottom: 5px;
  }
  .frp-name {
    font-family: 'SF Mono','Fira Code','Cascadia Code',monospace;
    font-size: 0.81rem; font-weight: 500;
    color: #b8b0a6;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .frp-row.sel .frp-name { color: #e8ddd0; }

  .frp-badges { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
  .frp-badge {
    font-size: 0.63rem; font-weight: 600;
    letter-spacing: 0.05em; text-transform: uppercase;
    padding: 2px 7px; border-radius: 4px;
    background: #1e1c1a; color: #7a7068; border: 1px solid #2e2a25;
    flex-shrink: 0;
  }
  .frp-badge-media { background: #1a1408; color: #c9a05a; border-color: #3d2c10; }

  .frp-body-text {
    font-size: 0.77rem; color: #4a4540; line-height: 1.45; margin: 0;
  }
  .frp-row.sel .frp-body-text { color: #5a5248; }

  .frp-hint {
    font-size: 0.72rem; color: #4a4540; margin: 6px 0 12px;
    line-height: 1.4;
  }
  .frp-hint strong { color: #6b6259; }

  .frp-sep { height: 1px; background: #1f1c19; margin: 0 22px; }

  .frp-center {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 40px 24px; gap: 10px; text-align: center;
  }
  .frp-spinner {
    width: 22px; height: 22px; border-radius: 50%;
    border: 2px solid #2e2a25; border-top-color: #c9a97a;
    animation: frp-spin 0.75s linear infinite;
  }
  .frp-center-label { font-size: 0.8rem; color: #4a4540; margin: 0; }
  .frp-empty { font-size: 0.82rem; color: #3d3730; margin: 0; }

  .frp-err {
    margin: 10px 22px;
    background: #1e0f0f; border: 1px solid #3d1818;
    border-radius: 7px; padding: 11px 14px;
  }
  .frp-err-title { font-size: 0.81rem; color: #c97a7a; font-weight: 600; margin: 0 0 3px; }
  .frp-err-msg { font-size: 0.76rem; color: #6b3030; margin: 0 0 8px; }
  .frp-err-retry {
    background: none; border: 1px solid #3d1818;
    color: #c97a7a; font-size: 0.74rem;
    padding: 3px 10px; border-radius: 5px;
    cursor: pointer; font-family: inherit;
  }

  /* ── Config panel (shown once a template is selected) ── */
  .frp-config {
    padding: 16px 22px 4px;
    border-top: 1px solid #252220;
  }
  .frp-config-label {
    font-size: 0.74rem; font-weight: 600; letter-spacing: 0.04em;
    text-transform: uppercase; color: #6b6259; margin: 0 0 8px;
  }
  .frp-field-row {
    display: flex; align-items: center; gap: 8px; margin-bottom: 10px;
  }
  .frp-field-tag {
    font-family: monospace; font-size: 0.76rem; color: #c9a97a;
    background: #120f0d; border: 1px solid #2e2a25; border-radius: 5px;
    padding: 5px 8px; flex-shrink: 0; min-width: 34px; text-align: center;
  }
  .frp-select, .frp-input {
    flex: 1; background: #120f0d; border: 1px solid #2e2a25;
    border-radius: 6px; padding: 7px 10px;
    color: #d4cdc6; font-size: 0.8rem; outline: none;
    font-family: inherit;
  }
  .frp-select:focus, .frp-input:focus { border-color: #5a4f45; }

  .frp-row2 { display: flex; gap: 12px; margin-bottom: 14px; }
  .frp-col { flex: 1; display: flex; flex-direction: column; gap: 6px; }
  .frp-col-label { font-size: 0.74rem; color: #6b6259; }

  .frp-footer {
    padding: 14px 22px;
    border-top: 1px solid #252220;
    flex-shrink: 0; background: #1a1714;
    display: flex; align-items: center; justify-content: flex-end; gap: 8px;
  }
  .frp-btn {
    border-radius: 7px; font-size: 0.82rem; font-weight: 600;
    cursor: pointer; padding: 8px 18px;
    transition: all 0.12s; font-family: inherit; border: none;
    white-space: nowrap;
  }
  .frp-btn-cancel {
    background: transparent;
    border: 1px solid #2e2a25 !important; color: #5a5248;
  }
  .frp-btn-cancel:hover { border-color: #3d3730 !important; color: #8a8078; }
  .frp-btn-save {
    background: #c9a97a; color: #120f0d;
    border: 1px solid transparent !important;
  }
  .frp-btn-save:hover:not(:disabled) { background: #d4b88a; }
  .frp-btn-save:disabled { background: #2a2420; color: #4a4540; cursor: not-allowed; }

  @keyframes frp-fade { from { opacity:0 } to { opacity:1 } }
  @keyframes frp-up {
    from { opacity:0; transform:translateY(12px) }
    to   { opacity:1; transform:translateY(0) }
  }
  @keyframes frp-spin { to { transform:rotate(360deg) } }
`;

function hasMediaHeader(t) {
  const format = t.header_format;
  return !!format && format.toUpperCase() !== "TEXT";
}

// Number of body placeholders comes from the length of the `variables` array
// Samvaadik returns (each entry is an example value for {{position}}), not
// from parsing any body text — the template list response has no body field.
function placeholderPositions(t) {
  const count = Array.isArray(t?.variables) ? t.variables.length : 0;
  return Array.from({ length: count }, (_, i) => i + 1);
}

function extractMediaId(detail) {
  const d = detail?.data || detail || {};
  return d.media_id || d.header_media_id || d.header_handle || null;
}

const MAPPING_OPTIONS = [
  { value: "participant.full_name", label: "Participant Name" },
  { value: "event.event_name", label: "Event Name" },
  { value: "custom", label: "Custom text" },
];

export default function FollowupRulePicker({ onClose, onSave, initialConfig }) {
  const { getToken } = useKindeAuth();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchErr, setFetchErr] = useState(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [mapping, setMapping] = useState({}); // { [position]: { type, value } }
  const [triggerOn, setTriggerOn] = useState(initialConfig?.trigger_on || "always");
  const [delayMinutes, setDelayMinutes] = useState(initialConfig?.delay_minutes ?? 0);
  const [mediaId, setMediaId] = useState(null);
  const [checkingMedia, setCheckingMedia] = useState(false);
  const [mediaError, setMediaError] = useState(null);
  const searchRef = useRef(null);
  const configRef = useRef(null);

  useEffect(() => {
    init();
    const esc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, []);

  useEffect(() => {
    if (!loading && searchRef.current) searchRef.current.focus();
  }, [loading]);

  // Scroll the variable-mapping / trigger config into view once a template
  // is picked — it renders below the (possibly long) template list, so
  // without this the user can miss it entirely.
  useEffect(() => {
    if (selected && configRef.current) {
      configRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selected]);

  async function init() {
    setLoading(true);
    setFetchErr(null);
    try {
      const token = await getToken();
      const res = await fetch(`${BACKEND}/api/samvaadik/templates`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || `${res.status} — check Samvaadik connection`);
      }
      const data = await res.json();
      const list = (data.data || []).filter(
        (t) => !t.status || ["APPROVED", "approved"].includes(t.status),
      );
      setTemplates(list);

      if (initialConfig?.wt_id) {
        const match = list.find(
          (t) => (t.wt_id || t.id) === initialConfig.wt_id,
        );
        if (match) selectTemplate(match, initialConfig.variable_mapping);
      }
    } catch (e) {
      setFetchErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function selectTemplate(t, existingMapping = null) {
    setSelected(t);
    setMediaId(null);
    setMediaError(null);

    const positions = placeholderPositions(t);
    const next = {};
    positions.forEach((p) => {
      const key = String(p);
      const existing = existingMapping?.[key];
      if (existing?.startsWith("static:")) {
        next[key] = { type: "custom", value: existing.slice(7) };
      } else if (existing === "participant.full_name" || existing === "event.event_name") {
        next[key] = { type: existing, value: "" };
      } else {
        next[key] = { type: "participant.full_name", value: "" };
      }
    });
    setMapping(next);

    if (!hasMediaHeader(t)) return;

    // Media-header templates need a media_id that Samvaadik associates with
    // the template itself — fetch the per-template detail to get it.
    setCheckingMedia(true);
    try {
      const token = await getToken();
      const res = await fetch(
        `${BACKEND}/api/samvaadik/templates/${t.wt_id || t.id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const detail = await res.json().catch(() => ({}));
      console.log("Template detail:", detail);
      const resolvedMediaId = res.ok ? extractMediaId(detail) : null;

      if (resolvedMediaId) {
        setMediaId(resolvedMediaId);
      } else {
        setMediaError(
          "Media is not uploaded for this template. Go to Samvaadik and upload media for this template.",
        );
      }
    } catch {
      setMediaError(
        "Could not check media for this template. Try selecting it again.",
      );
    } finally {
      setCheckingMedia(false);
    }
  }

  function updateMappingType(position, type) {
    setMapping((prev) => ({
      ...prev,
      [position]: { ...prev[position], type, value: prev[position]?.value || "" },
    }));
  }

  function updateMappingValue(position, value) {
    setMapping((prev) => ({
      ...prev,
      [position]: { ...prev[position], value },
    }));
  }

  const placeholders = selected ? placeholderPositions(selected) : [];
  const needsMedia = selected ? hasMediaHeader(selected) : false;
  const allMapped = placeholders.every((p) => {
    const slot = mapping[String(p)];
    if (!slot) return false;
    return slot.type !== "custom" || slot.value.trim().length > 0;
  });
  const canSave =
    !!selected && allMapped && !checkingMedia && (!needsMedia || !!mediaId);

  function handleSave() {
    if (!canSave) return;

    const variable_mapping = {};
    placeholders.forEach((p) => {
      const slot = mapping[String(p)];
      variable_mapping[String(p)] =
        slot.type === "custom" ? `static:${slot.value.trim()}` : slot.type;
    });

    onSave({
      wt_id: selected.wt_id || selected.id,
      template_name: selected.name,
      trigger_on: triggerOn,
      delay_minutes: Number(delayMinutes) || 0,
      variable_mapping,
      media_id: mediaId || null,
    });
    onClose();
  }

  const filtered = templates.filter(
    (t) => !search || t.name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <style>{css}</style>
      <div
        className="frp-overlay"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="frp-modal">
          <div className="frp-header">
            <h2 className="frp-title">Follow-up WhatsApp Template</h2>
            <p className="frp-subtitle">
              Select a template to send automatically after each participant's
              call · image/video/document templates need media uploaded on
              Samvaadik first
            </p>
          </div>

          <div className="frp-body">
            <div className="frp-search-wrap">
              <input
                ref={searchRef}
                className="frp-search"
                placeholder="Search templates…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="frp-list">
              {loading && (
                <div className="frp-center">
                  <div className="frp-spinner" />
                  <p className="frp-center-label">Loading templates…</p>
                </div>
              )}

              {fetchErr && !loading && (
                <div className="frp-err">
                  <p className="frp-err-title">Could not load templates</p>
                  <p className="frp-err-msg">{fetchErr}</p>
                  <button className="frp-err-retry" onClick={init}>
                    Retry
                  </button>
                </div>
              )}

              {!loading && !fetchErr && filtered.length === 0 && (
                <div className="frp-center">
                  <p className="frp-empty">
                    {search ? `No results for "${search}"` : "No approved templates found"}
                  </p>
                </div>
              )}

              {!loading &&
                !fetchErr &&
                filtered.map((t, i) => {
                  const sel = selected && (selected.wt_id || selected.id) === (t.wt_id || t.id);
                  const varCount = Array.isArray(t.variables) ? t.variables.length : 0;
                  return (
                    <div key={t.wt_id || t.id || t.name}>
                      {i > 0 && <div className="frp-sep" />}
                      <button
                        className={`frp-row${sel ? " sel" : ""}`}
                        onClick={() => {
                          if (sel) {
                            setSelected(null);
                            setMapping({});
                            setMediaId(null);
                            setMediaError(null);
                          } else {
                            selectTemplate(t);
                          }
                        }}
                      >
                        <div className="frp-row-top">
                          <span className="frp-name">{t.name}</span>
                          <span className="frp-badges">
                            {hasMediaHeader(t) && (
                              <span className="frp-badge frp-badge-media">{t.header_format}</span>
                            )}
                            {t.category && <span className="frp-badge">{t.category}</span>}
                          </span>
                        </div>
                        <p className="frp-body-text">
                          {varCount > 0 ? `${varCount} variable${varCount === 1 ? "" : "s"}` : "No variables"}
                        </p>
                      </button>
                    </div>
                  );
                })}
            </div>

            {selected && (
              <div className="frp-config" ref={configRef}>
                {needsMedia && (
                  <>
                    {checkingMedia && (
                      <p className="frp-hint">Checking media for this template…</p>
                    )}
                    {!checkingMedia && mediaId && (
                      <p className="frp-hint">
                        <strong>Media attached ✓</strong> — this template's header
                        image/video will be sent automatically.
                      </p>
                    )}
                    {!checkingMedia && mediaError && (
                      <div className="frp-err" style={{ margin: "0 0 14px" }}>
                        <p className="frp-err-msg" style={{ marginBottom: 0 }}>
                          {mediaError}
                        </p>
                      </div>
                    )}
                  </>
                )}

                {placeholders.length > 0 && (
                  <>
                    <p className="frp-config-label">Map template variables</p>
                    {placeholders.map((p) => {
                      const slot = mapping[String(p)] || { type: "participant.full_name", value: "" };
                      const example = selected.variables?.[p - 1];
                      return (
                        <div className="frp-field-row" key={p}>
                          <span className="frp-field-tag">{`{{${p}}}`}</span>
                          <select
                            className="frp-select"
                            value={slot.type}
                            onChange={(e) => updateMappingType(String(p), e.target.value)}
                          >
                            {MAPPING_OPTIONS.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                          {slot.type === "custom" && (
                            <input
                              className="frp-input"
                              placeholder={example ? `e.g. ${example}` : "Enter text"}
                              value={slot.value}
                              onChange={(e) => updateMappingValue(String(p), e.target.value)}
                            />
                          )}
                        </div>
                      );
                    })}
                  </>
                )}

                <div className="frp-row2">
                  <div className="frp-col">
                    <span className="frp-col-label">Send when</span>
                    <select
                      className="frp-select"
                      value={triggerOn}
                      onChange={(e) => setTriggerOn(e.target.value)}
                    >
                      <option value="always">Always</option>
                      <option value="answered">Only if answered</option>
                      <option value="unanswered">Only if unanswered</option>
                    </select>
                  </div>
                  <div className="frp-col">
                    <span className="frp-col-label">Delay (minutes)</span>
                    <input
                      className="frp-input"
                      type="number"
                      min={0}
                      value={delayMinutes}
                      onChange={(e) => setDelayMinutes(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="frp-footer">
            <button className="frp-btn frp-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button
              className="frp-btn frp-btn-save"
              onClick={handleSave}
              disabled={!canSave}
            >
              Save Follow-up
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
