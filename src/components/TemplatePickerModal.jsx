import { useState, useEffect, useRef } from "react";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";

const BACKEND = import.meta.env.VITE_BACKEND_URL;

const css = `
  * { box-sizing: border-box; }

  .tpm-overlay {
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(10, 8, 6, 0.8);
    display: flex; align-items: center; justify-content: center;
    padding: 16px;
    animation: tpm-fade 0.16s ease;
  }

  .tpm-modal {
    width: 100%; max-width: 560px;
    background: #1a1714;
    border: 1px solid #2e2a25;
    border-radius: 12px;
    display: flex; flex-direction: column;
    max-height: min(88vh, 680px);
    overflow: hidden;
    animation: tpm-up 0.2s ease;
    box-shadow: 0 24px 64px rgba(0,0,0,0.5);
  }

  /* ── Header ── */
  .tpm-header {
    padding: 20px 22px 16px;
    border-bottom: 1px solid #252220;
    flex-shrink: 0;
  }
  .tpm-title {
    margin: 0 0 2px;
    font-size: 0.97rem; font-weight: 600;
    color: #f0ebe4; letter-spacing: -0.01em;
  }
  .tpm-subtitle {
    margin: 0; font-size: 0.76rem;
    color: #6b6259; line-height: 1.4;
  }

  /* ── Search ── */
  .tpm-search-wrap {
    padding: 12px 22px;
    border-bottom: 1px solid #252220;
    flex-shrink: 0;
  }
  .tpm-search {
    width: 100%;
    background: #120f0d; border: 1px solid #2e2a25;
    border-radius: 7px; padding: 9px 12px;
    color: #d4cdc6; font-size: 0.84rem;
    outline: none; transition: border-color 0.15s;
    font-family: inherit;
  }
  .tpm-search:focus { border-color: #5a4f45; }
  .tpm-search::placeholder { color: #3d3730; }

  /* ── List ── */
  .tpm-list {
    flex: 1; overflow-y: auto; padding: 6px 0;
  }
  .tpm-list::-webkit-scrollbar { width: 3px; }
  .tpm-list::-webkit-scrollbar-track { background: transparent; }
  .tpm-list::-webkit-scrollbar-thumb { background: #2e2a25; border-radius: 2px; }

  .tpm-row {
    all: unset; display: block; width: 100%;
    padding: 12px 22px; cursor: pointer;
    border-left: 2px solid transparent;
    transition: background 0.1s, border-color 0.1s;
  }
  .tpm-row:hover { background: #1f1c19; }
  .tpm-row.sel {
    background: #1f1c18;
    border-left-color: #c9a97a;
  }

  .tpm-row-top {
    display: flex; align-items: center;
    justify-content: space-between; gap: 10px;
    margin-bottom: 5px;
  }
  .tpm-name {
    font-family: 'SF Mono','Fira Code','Cascadia Code',monospace;
    font-size: 0.81rem; font-weight: 500;
    color: #b8b0a6;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .tpm-row.sel .tpm-name { color: #e8ddd0; }

  .tpm-badges { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
  .tpm-badge {
    font-size: 0.65rem; font-weight: 600;
    letter-spacing: 0.05em; text-transform: uppercase;
    padding: 2px 7px; border-radius: 4px;
  }
  .tpm-badge-marketing { background: #2a1f10; color: #c9965a; border: 1px solid #3d2c18; }
  .tpm-badge-utility   { background: #101e2a; color: #5a9ec9; border: 1px solid #18303d; }
  .tpm-badge-auth      { background: #1a1028; color: #9a7ac9; border: 1px solid #2c1e40; }
  .tpm-badge-service   { background: #0e1e14; color: #5ab87a; border: 1px solid #183028; }
  .tpm-badge-default   { background: #1e1c1a; color: #7a7068; border: 1px solid #2e2a25; }
  .tpm-badge-lang      { background: transparent; color: #4a4540; border: 1px solid #2e2a25;
                         font-size: 0.63rem; }

  .tpm-body-text {
    font-size: 0.77rem; color: #4a4540; line-height: 1.45; margin: 0;
    display: -webkit-box; -webkit-line-clamp: 2;
    -webkit-box-orient: vertical; overflow: hidden;
  }
  .tpm-row.sel .tpm-body-text { color: #5a5248; }

  .tpm-sep { height: 1px; background: #1f1c19; margin: 0 22px; }

  /* ── Footer ── */
  .tpm-footer {
    padding: 14px 22px;
    border-top: 1px solid #252220;
    flex-shrink: 0; background: #1a1714;
  }
  .tpm-footer-top {
    display: flex; align-items: center;
    justify-content: space-between; gap: 12px;
  }
  .tpm-footer-info {
    font-size: 0.78rem; color: #4a4540;
    min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .tpm-footer-info strong { color: #9a8e82; }
  .tpm-actions { display: flex; gap: 8px; flex-shrink: 0; }

  .tpm-participant-bar {
    margin-top: 10px; padding: 10px 14px;
    background: #120f0d; border: 1px solid #2e2a25;
    border-radius: 7px;
    display: flex; align-items: center; justify-content: space-between;
    gap: 12px;
    animation: tpm-fade 0.2s ease;
  }
  .tpm-participant-left { font-size: 0.78rem; color: #5a5248; }
  .tpm-participant-left strong { color: #c9a97a; font-size: 1rem; }
  .tpm-participant-right {
    font-size: 0.72rem; color: #4a4540;
    text-align: right; line-height: 1.4;
  }

  .tpm-btn {
    border-radius: 7px; font-size: 0.82rem; font-weight: 600;
    cursor: pointer; padding: 8px 18px;
    transition: all 0.12s; font-family: inherit; border: none;
    white-space: nowrap;
  }
  .tpm-btn-cancel {
    background: transparent;
    border: 1px solid #2e2a25 !important; color: #5a5248;
  }
  .tpm-btn-cancel:hover { border-color: #3d3730 !important; color: #8a8078; }
  .tpm-btn-send {
    background: #c9a97a; color: #120f0d;
    border: 1px solid transparent !important;
  }
  .tpm-btn-send:hover:not(:disabled) { background: #d4b88a; }
  .tpm-btn-send:disabled { background: #2a2420; color: #4a4540; cursor: not-allowed; }

  /* ── States ── */
  .tpm-center {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 48px 24px; gap: 10px; text-align: center;
  }
  .tpm-spinner {
    width: 22px; height: 22px; border-radius: 50%;
    border: 2px solid #2e2a25; border-top-color: #c9a97a;
    animation: tpm-spin 0.75s linear infinite;
  }
  .tpm-center-label { font-size: 0.8rem; color: #4a4540; margin: 0; }
  .tpm-empty { font-size: 0.82rem; color: #3d3730; margin: 0; }

  .tpm-err {
    margin: 10px 22px;
    background: #1e0f0f; border: 1px solid #3d1818;
    border-radius: 7px; padding: 11px 14px;
  }
  .tpm-err-title { font-size: 0.81rem; color: #c97a7a; font-weight: 600; margin: 0 0 3px; }
  .tpm-err-msg { font-size: 0.76rem; color: #6b3030; margin: 0 0 8px; }
  .tpm-err-retry {
    background: none; border: 1px solid #3d1818;
    color: #c97a7a; font-size: 0.74rem;
    padding: 3px 10px; border-radius: 5px;
    cursor: pointer; font-family: inherit;
  }

  /* ── Success ── */
  .tpm-success { padding: 32px 22px; }
  .tpm-success-head {
    margin: 0 0 4px; font-size: 0.97rem;
    font-weight: 600; color: #f0ebe4;
  }
  .tpm-success-sub {
    margin: 0 0 20px; font-size: 0.77rem; color: #4a4540;
  }
  .tpm-counts {
    display: flex; gap: 10px; margin-bottom: 18px;
  }
  .tpm-count {
    flex: 1; background: #120f0d;
    border: 1px solid #2e2a25; border-radius: 8px;
    padding: 12px 10px; text-align: center;
  }
  .tpm-count-n { font-size: 1.65rem; font-weight: 700; color: #c9a97a; line-height: 1; }
  .tpm-count-n.fail { color: #c97a7a; }
  .tpm-count-n.ok   { color: #7ab87a; }
  .tpm-count-lbl {
    font-size: 0.67rem; color: #4a4540; margin-top: 4px;
    text-transform: uppercase; letter-spacing: 0.06em;
  }
  .tpm-success-note {
    font-size: 0.76rem; color: #4a4540; line-height: 1.5;
    background: #120f0d; border: 1px solid #2e2a25;
    border-radius: 7px; padding: 10px 13px; margin-bottom: 16px;
  }
  .tpm-done {
    width: 100%; background: #c9a97a; color: #120f0d;
    border: none; padding: 10px; border-radius: 7px;
    font-size: 0.875rem; font-weight: 600;
    cursor: pointer; font-family: inherit; transition: background 0.12s;
  }
  .tpm-done:hover { background: #d4b88a; }

  /* ── Dispatch (live sending) view ── */
  .tpm-dispatch { display: flex; flex-direction: column; min-height: 0; flex: 1; }

  .tpm-dispatch-head { padding: 22px 22px 16px; flex-shrink: 0; }
  .tpm-dispatch-title-row {
    display: flex; align-items: baseline; justify-content: space-between;
    margin-bottom: 4px;
  }
  .tpm-dispatch-title { font-size: 0.92rem; font-weight: 600; color: #f0ebe4; }
  .tpm-dispatch-count {
    font-family: 'SF Mono','Fira Code','Cascadia Code',monospace;
    font-size: 0.92rem; font-weight: 600; color: #c9a97a;
    font-variant-numeric: tabular-nums;
  }
  .tpm-dispatch-sub { font-size: 0.74rem; color: #4a4540; margin: 0 0 12px; }

  .tpm-rail {
    height: 4px; width: 100%; border-radius: 3px;
    background: #120f0d; border: 1px solid #201c19;
    overflow: hidden;
  }
  .tpm-rail-fill {
    height: 100%; border-radius: 3px;
    background: linear-gradient(90deg, #a8875c, #c9a97a);
    transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .tpm-rail-fill.has-fail { background: linear-gradient(90deg, #a8875c, #c9a97a); }

  .tpm-rail-legend {
    display: flex; gap: 14px; margin-top: 8px;
    font-size: 0.71rem; color: #4a4540;
  }
  .tpm-rail-legend span { display: flex; align-items: center; gap: 5px; }
  .tpm-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
  .tpm-dot.ok   { background: #7ab87a; }
  .tpm-dot.fail { background: #c97a7a; }
  .tpm-dot.pending { background: #3d3730; }

  .tpm-manifest {
    flex: 1; overflow-y: auto; padding: 4px 0 12px;
    border-top: 1px solid #201c19;
  }
  .tpm-manifest::-webkit-scrollbar { width: 3px; }
  .tpm-manifest::-webkit-scrollbar-track { background: transparent; }
  .tpm-manifest::-webkit-scrollbar-thumb { background: #2e2a25; border-radius: 2px; }

  .tpm-mrow {
    display: flex; align-items: center; gap: 12px;
    padding: 9px 22px;
    animation: tpm-row-in 0.2s ease;
  }
  .tpm-mrow-status {
    width: 16px; height: 16px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    border-radius: 50%;
    font-size: 0.62rem;
  }
  .tpm-mrow-status.pending {
    background: transparent; border: 1.5px solid #2e2a25;
  }
  .tpm-mrow-status.sending {
    background: transparent; border: 1.5px solid #c9a97a;
    position: relative;
  }
  .tpm-mrow-status.sending::after {
    content: ''; position: absolute; inset: -1.5px;
    border-radius: 50%; border: 1.5px solid transparent;
    border-top-color: #c9a97a;
    animation: tpm-spin 0.8s linear infinite;
  }
  .tpm-mrow-status.sent {
    background: #0e1e14; border: 1.5px solid #2a5a3a; color: #7ab87a;
  }
  .tpm-mrow-status.failed {
    background: #1e0f0f; border: 1.5px solid #4a2020; color: #c97a7a;
  }

  .tpm-mrow-name {
    font-size: 0.8rem; color: #b8b0a6; flex: 1;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .tpm-mrow-status.pending ~ .tpm-mrow-name,
  .tpm-mrow.is-pending .tpm-mrow-name { color: #4a4540; }
  .tpm-mrow.is-sent .tpm-mrow-name { color: #d4cdc6; }

  .tpm-mrow-phone {
    font-family: monospace; font-size: 0.71rem; color: #3d3730; flex-shrink: 0;
  }
  .tpm-mrow-label {
    font-size: 0.68rem; font-weight: 600; letter-spacing: 0.03em;
    flex-shrink: 0; width: 52px; text-align: right;
  }
  .tpm-mrow.is-sent .tpm-mrow-label { color: #5a9c6a; }
  .tpm-mrow.is-failed .tpm-mrow-label { color: #c97a7a; }
  .tpm-mrow.is-sending .tpm-mrow-label { color: #c9a97a; }
  .tpm-mrow.is-pending .tpm-mrow-label { color: #3d3730; }

  .tpm-dispatch-footer {
    padding: 14px 22px; border-top: 1px solid #252220; flex-shrink: 0;
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
  }
  .tpm-dispatch-hint { font-size: 0.73rem; color: #3d3730; }

  @keyframes tpm-row-in { from { opacity: 0; transform: translateX(-4px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes tpm-fade { from { opacity:0 } to { opacity:1 } }
  @keyframes tpm-up {
    from { opacity:0; transform:translateY(12px) }
    to   { opacity:1; transform:translateY(0) }
  }
  @keyframes tpm-spin { to { transform:rotate(360deg) } }

  @media (max-width: 580px) {
    .tpm-overlay { padding: 0; align-items: flex-end; }
    .tpm-modal {
      max-width: 100%; border-radius: 14px 14px 0 0;
      max-height: 93vh;
    }
    .tpm-header, .tpm-search-wrap, .tpm-footer, .tpm-dispatch-head, .tpm-dispatch-footer {
      padding-left: 18px; padding-right: 18px;
    }
    .tpm-row, .tpm-mrow { padding-left: 18px; padding-right: 18px; }
    .tpm-sep { margin: 0 18px; }
    .tpm-err { margin: 10px 18px; }
    .tpm-success { padding: 28px 18px; }
    .tpm-mrow-phone { display: none; }
  }

  @media (prefers-reduced-motion: reduce) {
    .tpm-mrow-status.sending::after { animation: none; border-top-color: #c9a97a; opacity: 0.6; }
    .tpm-spinner { animation: none; }
  }
`;

function badgeClass(cat = "") {
  const map = {
    MARKETING: "tpm-badge-marketing",
    UTILITY: "tpm-badge-utility",
    AUTHENTICATION: "tpm-badge-auth",
    SERVICE: "tpm-badge-service",
  };
  return map[cat.toUpperCase()] || "tpm-badge-default";
}

function extractBody(t) {
  return t.components?.find((c) => c.type === "BODY")?.text || t.body || "";
}

function composeTemplateMessage(t) {
  if (!t) return null;
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

// Maps a raw participant status from the backend to the small set the
// manifest row knows how to render.
function statusMeta(status) {
  switch (status) {
    case "sent":
      return { icon: "✓", label: "Sent", cls: "sent" };
    case "failed":
      return { icon: "✕", label: "Failed", cls: "failed" };
    case "sending":
      return { icon: "", label: "Sending", cls: "sending" };
    default:
      return { icon: "", label: "Queued", cls: "pending" };
  }
}

export default function TemplatePickerModal({
  eventId,
  participantCount = null,
  participantIds = null,
  onClose,
  onSuccess,
}) {
  const { getToken } = useKindeAuth();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchErr, setFetchErr] = useState(null);
  const [count, setCount] = useState(participantCount);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [sending, setSending] = useState(false);
  const [sendErr, setSendErr] = useState(null);
  const [result, setResult] = useState(null);

  // Live dispatch state — populated once a batch is kicked off.
  const [dispatch, setDispatch] = useState(null); // { sent, failed, total, participants: [...] }
  const pollTimer = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    init();
    const esc = (e) => {
      if (e.key === "Escape" && !sending) onClose();
    };
    window.addEventListener("keydown", esc);
    return () => {
      window.removeEventListener("keydown", esc);
      if (pollTimer.current) clearTimeout(pollTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loading && !dispatch && searchRef.current) searchRef.current.focus();
  }, [loading, dispatch]);

  async function init() {
    setLoading(true);
    setFetchErr(null);
    try {
      const token = await getToken();
      const [tRes, pRes] = await Promise.all([
        fetch(`${BACKEND}/api/samvaadik/templates`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        count === null
          ? fetch(`${BACKEND}/api/events/${eventId}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
          : Promise.resolve(null),
      ]);

      if (!tRes.ok) {
        const d = await tRes.json().catch(() => ({}));
        throw new Error(
          d.error || `${tRes.status} — check Samvaadik connection`,
        );
      }
      const tData = await tRes.json();
      setTemplates(
        (tData.data || []).filter(
          (t) => !t.status || ["APPROVED", "approved"].includes(t.status),
        ),
      );

      if (pRes) {
        const pData = await pRes.json().catch(() => ({}));
        const participants =
          pData.participants || pData.data?.participants || [];
        if (participants.length) setCount(participants.length);
      }
    } catch (e) {
      setFetchErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSend() {
    if (!selected || sending) return;
    setSending(true);
    setSendErr(null);

    try {
      const token = await getToken();
      let templateBody = null;
      try {
        const detailRes = await fetch(
          `${BACKEND}/api/samvaadik/templates/${selected.wt_id}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const detail = await detailRes.json();
        templateBody = composeTemplateMessage(detail);
      } catch {
        templateBody = null;
      }

      const res = await fetch(`${BACKEND}/whatsapp/samvaadik-batch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          event_id: eventId,
          template_name: selected.name,
          language_code: selected.language || selected.language_code || "en",
          template_body: templateBody || extractBody(selected) || null,
          ...(participantIds?.length
            ? { participant_ids: participantIds }
            : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Send failed");

      setDispatch({ sent: 0, failed: 0, total: count ?? 0, participants: [] });
      pollBatch(data.batch_id, token);
    } catch (e) {
      setSendErr(e.message);
      setSending(false);
    }
  }

  function pollBatch(batchId, token) {
    const tick = async () => {
      try {
        const r = await fetch(
          `${BACKEND}/whatsapp/samvaadik-batch/${batchId}/status`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const job = await r.json();

        setDispatch({
          sent: job.sent || 0,
          failed: job.failed || 0,
          total: job.total || count || 0,
          participants: job.participants || [],
        });

        if (job.status === "processing") {
          pollTimer.current = setTimeout(tick, 1200);
        } else if (job.status === "done") {
          setResult({ sent: job.sent, failed: job.failed, total: job.total });
          onSuccess?.({ sent: job.sent, failed: job.failed, total: job.total });
          setSending(false);
        } else {
          setSendErr(job.error || "Batch send failed");
          setSending(false);
        }
      } catch (e) {
        setSendErr(e.message);
        setSending(false);
      }
    };
    tick();
  }

  const filtered = templates.filter(
    (t) =>
      !search ||
      t.name?.toLowerCase().includes(search.toLowerCase()) ||
      extractBody(t).toLowerCase().includes(search.toLowerCase()),
  );

  const dTotal = dispatch?.total || 0;
  const dDone = (dispatch?.sent || 0) + (dispatch?.failed || 0);
  const pct =
    dTotal > 0 ? Math.min(100, Math.round((dDone / dTotal) * 100)) : 0;

  return (
    <>
      <style>{css}</style>
      <div
        className="tpm-overlay"
        onClick={(e) => e.target === e.currentTarget && !sending && onClose()}
      >
        <div className="tpm-modal">
          {dispatch ? (
            /* ── Live dispatch / manifest view ── */
            <div className="tpm-dispatch">
              <div className="tpm-dispatch-head">
                <div className="tpm-dispatch-title-row">
                  <span className="tpm-dispatch-title">
                    {result ? "Dispatch complete" : "Sending messages…"}
                  </span>
                  <span className="tpm-dispatch-count">
                    {dDone}/{dTotal || "—"}
                  </span>
                </div>
                <p className="tpm-dispatch-sub">
                  Template{" "}
                  <strong style={{ color: "#7a7068" }}>{selected?.name}</strong>
                </p>
                <div className="tpm-rail">
                  <div className="tpm-rail-fill" style={{ width: `${pct}%` }} />
                </div>
                <div className="tpm-rail-legend">
                  <span>
                    <span className="tpm-dot ok" /> {dispatch.sent} sent
                  </span>
                  {dispatch.failed > 0 && (
                    <span>
                      <span className="tpm-dot fail" /> {dispatch.failed} failed
                    </span>
                  )}
                  <span>
                    <span className="tpm-dot pending" />{" "}
                    {Math.max(0, dTotal - dDone)} queued
                  </span>
                </div>
              </div>

              <div className="tpm-manifest">
                {dispatch.participants.map((p) => {
                  const meta = statusMeta(p.status);
                  return (
                    <div className={`tpm-mrow is-${meta.cls}`} key={p.id}>
                      <span className={`tpm-mrow-status ${meta.cls}`}>
                        {meta.icon}
                      </span>
                      <span className="tpm-mrow-name">{p.name || "Guest"}</span>
                      {p.phone && (
                        <span className="tpm-mrow-phone">{p.phone}</span>
                      )}
                      <span className="tpm-mrow-label">{meta.label}</span>
                    </div>
                  );
                })}
              </div>

              <div className="tpm-dispatch-footer">
                <span className="tpm-dispatch-hint">
                  {result
                    ? "The chatbot is now active for replies."
                    : "You can keep this open or close it — sending continues in the background."}
                </span>
                <button
                  className="tpm-btn tpm-btn-send"
                  onClick={onClose}
                  disabled={!result}
                  title={!result ? "Sending in progress" : "Close"}
                >
                  {result ? "Done" : "Sending…"}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="tpm-header">
                <h2 className="tpm-title">Send WhatsApp Template</h2>
                <p className="tpm-subtitle">
                  Select a template · messages sent to all participants ·
                  chatbot activates on reply
                </p>
              </div>

              {/* Search */}
              <div className="tpm-search-wrap">
                <input
                  ref={searchRef}
                  className="tpm-search"
                  placeholder="Search templates…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* List */}
              <div className="tpm-list">
                {loading && (
                  <div className="tpm-center">
                    <div className="tpm-spinner" />
                    <p className="tpm-center-label">Loading templates…</p>
                  </div>
                )}

                {fetchErr && !loading && (
                  <div className="tpm-err">
                    <p className="tpm-err-title">Could not load templates</p>
                    <p className="tpm-err-msg">{fetchErr}</p>
                    <button className="tpm-err-retry" onClick={init}>
                      Retry
                    </button>
                  </div>
                )}

                {!loading && !fetchErr && filtered.length === 0 && (
                  <div className="tpm-center">
                    <p className="tpm-empty">
                      {search
                        ? `No results for "${search}"`
                        : "No approved templates found"}
                    </p>
                  </div>
                )}

                {!loading &&
                  !fetchErr &&
                  filtered.map((t, i) => {
                    const body = extractBody(t);
                    const sel = selected?.name === t.name;
                    return (
                      <div key={t.id || t.name}>
                        {i > 0 && <div className="tpm-sep" />}
                        <button
                          className={`tpm-row${sel ? " sel" : ""}`}
                          onClick={() => setSelected(sel ? null : t)}
                        >
                          <div className="tpm-row-top">
                            <span className="tpm-name">{t.name}</span>
                            <span className="tpm-badges">
                              {t.category && (
                                <span
                                  className={`tpm-badge ${badgeClass(t.category)}`}
                                >
                                  {t.category}
                                </span>
                              )}
                              {(t.language || t.language_code) && (
                                <span className="tpm-badge tpm-badge-lang">
                                  {t.language || t.language_code}
                                </span>
                              )}
                            </span>
                          </div>
                          {body && <p className="tpm-body-text">{body}</p>}
                        </button>
                      </div>
                    );
                  })}
              </div>

              {sendErr && (
                <div className="tpm-err" style={{ flexShrink: 0 }}>
                  <p className="tpm-err-title" style={{ marginBottom: 0 }}>
                    {sendErr}
                  </p>
                </div>
              )}

              {/* Footer */}
              <div className="tpm-footer">
                <div className="tpm-footer-top">
                  <p className="tpm-footer-info">
                    {selected ? (
                      <>
                        Template: <strong>{selected.name}</strong>
                      </>
                    ) : (
                      "No template selected"
                    )}
                  </p>
                  <div className="tpm-actions">
                    <button
                      className="tpm-btn tpm-btn-cancel"
                      onClick={onClose}
                    >
                      Cancel
                    </button>
                    <button
                      className="tpm-btn tpm-btn-send"
                      onClick={handleSend}
                      disabled={!selected || sending}
                    >
                      {sending ? "Starting…" : "Send to all"}
                    </button>
                  </div>
                </div>

                {selected && !sending && (
                  <div className="tpm-participant-bar">
                    <div className="tpm-participant-left">
                      <strong>{count !== null ? count : "—"}</strong>
                      <span style={{ marginLeft: 6 }}>
                        {count === 1 ? "participant" : "participants"} will
                        receive this message
                      </span>
                    </div>
                    <div className="tpm-participant-right">
                      Chatbot activates
                      <br />
                      on their reply
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
