// components/SmartRSVPTable.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import {
  Users,
  Phone,
  Search,
  Download,
  RefreshCw,
  ToggleLeft,
  Hash,
  Type,
  List,
  Calendar,
  AlertCircle,
  PhoneCall,
  MessageSquare,
} from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const FIELD_ICONS = {
  yes_no: ToggleLeft,
  number: Hash,
  text: Type,
  choice: List,
};

// ─── Value pill ───────────────────────────────────────────────────────────────
const FieldValue = ({ value, fieldType }) => {
  if (value === null || value === undefined || value === "") {
    return <span style={{ color: "#4b5563", fontStyle: "italic" }}>—</span>;
  }
  const str = String(value);
  if (fieldType === "yes_no") {
    const lower = str.toLowerCase();
    if (lower === "yes" || lower === "true" || lower === "1") {
      return (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "2px 10px",
            borderRadius: 20,
            background: "#064e3b",
            color: "#34d399",
            border: "1px solid #065f46",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          ✓ Yes
        </span>
      );
    }
    if (lower === "no" || lower === "false" || lower === "0") {
      return (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "2px 10px",
            borderRadius: 20,
            background: "#450a0a",
            color: "#f87171",
            border: "1px solid #7f1d1d",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          ✗ No
        </span>
      );
    }
  }
  return <span style={{ color: "#e5e7eb" }}>{str}</span>;
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const SmartRSVPTable = ({ eventId: propEventId }) => {
  const { eventId: paramEventId } = useParams();
  const eventId = propEventId || paramEventId;
  const { getToken } = useKindeAuth();

  const [fields, setFields] = useState([]);
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // retry batch call state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState({ success: true, text: "" });

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchData = async () => {
    try {
      setLoading(true);
      setFetchError(null);

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/events/${eventId}/smart-rsvp-data`,
      );
      const json = await res.json();

      if (json.success) {
        setFields(json.fields || []);
        setData(json.data || []);
        return;
      }

      // fallback
      const res2 = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/events/${eventId}/rsvp-data`,
      );
      const json2 = await res2.json();

      if (json2.field_mode === "smart_fields") {
        setFields(json2.fields || []);
        setData(json2.data || []);
      } else if (Array.isArray(json2)) {
        setData(json2);
      } else {
        setFetchError("Unexpected response from server.");
      }
    } catch (err) {
      setFetchError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const syncBatch = async () => {
    try {
      setSyncing(true);
      await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/events/${eventId}/sync-batch-status`,
        { method: "POST" },
      );
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    if (!eventId) return;
    fetchData();
    const iv = setInterval(fetchData, 60000);
    return () => clearInterval(iv);
  }, [eventId]);

  // ── Filter ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFiltered(data);
      setCurrentPage(1);
      return;
    }
    const lower = searchTerm.toLowerCase();
    setFiltered(
      data.filter(
        (row) =>
          row.fullName?.toLowerCase().includes(lower) ||
          row.phoneNumber?.toLowerCase().includes(lower) ||
          fields.some((f) =>
            String(row[f.field_key] ?? "")
              .toLowerCase()
              .includes(lower),
          ),
      ),
    );
    setCurrentPage(1);
  }, [searchTerm, data, fields]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const toast = (success, text) => {
    setToastMsg({ success, text });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const formatDate = (ts) => {
    if (!ts) return "—";
    return new Date(ts + "Z").toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  };

  // ── Retry batch call ───────────────────────────────────────────────────────
  const handleRetryBatch = async () => {
    try {
      setIsRetrying(true);
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/events/${eventId}/retry-batch`,
        { method: "POST" },
      );
      if (!res.ok) throw new Error("Retry failed");
      setShowConfirmModal(false);
      toast(true, "✅ Retry batch call started successfully!");
      await fetchData();
    } catch (err) {
      setShowConfirmModal(false);
      toast(false, "❌ Failed to start retry batch call.");
    } finally {
      setIsRetrying(false);
    }
  };

  // ── Start batch message (WhatsApp) ─────────────────────────────────────────
  const handleBatchMessage = async () => {
    try {
      const token = await getToken();
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/whatsapp/send-batch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ event_id: eventId }),
      });
      const pendingCount = notRespondedRows.length;
      toast(true, `Sending messages to ${pendingCount} participant(s)!`);
      await fetchData();
    } catch (err) {
      toast(false, "❌ Failed to send batch messages.");
    }
  };

  // ── Export ─────────────────────────────────────────────────────────────────
  const exportToExcel = () => {
    if (!filtered.length) return;
    const rows = filtered.map((row, i) => {
      const base = {
        "S.No": i + 1,
        "Full Name": row.fullName || "",
        "Phone Number": row.phoneNumber || "",
      };
      fields.forEach((f) => {
        base[f.field_label] = row[f.field_key] ?? "";
      });
      base["Timestamp"] = row.timestamp
        ? new Date(row.timestamp).toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
          })
        : "";
      return base;
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Smart RSVP");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([buf], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `SmartRSVP_${eventId}_${Date.now()}.xlsx`,
    );
  };

  // ── Pagination + stats ─────────────────────────────────────────────────────
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  const responded = filtered.filter((row) =>
    fields.some(
      (f) => row[f.field_key] !== null && row[f.field_key] !== undefined,
    ),
  ).length;
  const notResponded = filtered.length - responded;
  // "not responded" participants for batch message hint
  const notRespondedRows = data.filter(
    (row) =>
      !fields.some(
        (f) => row[f.field_key] !== null && row[f.field_key] !== undefined,
      ),
  );
  const allResponded = data.length > 0 && notRespondedRows.length === 0;

  // ── Loading / error / empty ────────────────────────────────────────────────
  if (loading)
    return (
      <div
        style={{
          background: "#111",
          borderRadius: 12,
          padding: "3rem",
          textAlign: "center",
          color: "#9ca3af",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            border: "3px solid #2a2a2a",
            borderTopColor: "#3b82f6",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 1rem",
          }}
        />
        Loading RSVP data...
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );

  if (fetchError)
    return (
      <div
        style={{
          background: "#111",
          borderRadius: 12,
          padding: "2rem",
          border: "1px solid #7f1d1d",
          color: "#f87171",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <AlertCircle size={18} />
        <div>
          <p style={{ fontWeight: 600, margin: 0 }}>Failed to load RSVP data</p>
          <p style={{ fontSize: 13, color: "#9ca3af", margin: "4px 0 0" }}>
            {fetchError}
          </p>
        </div>
        <button
          onClick={fetchData}
          style={{
            marginLeft: "auto",
            padding: "7px 14px",
            borderRadius: 8,
            background: "#1a1a1a",
            border: "1px solid #2a2a2a",
            color: "#d1d5db",
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          Retry
        </button>
      </div>
    );

  if (data.length === 0)
    return (
      <div
        style={{
          background: "#111",
          borderRadius: 12,
          padding: "3rem",
          border: "1px solid #2a2a2a",
          textAlign: "center",
          color: "#6b7280",
        }}
      >
        <Users size={32} style={{ margin: "0 auto 1rem", opacity: 0.4 }} />
        <p style={{ fontWeight: 600, color: "#9ca3af" }}>
          No participants found
        </p>
        <p style={{ fontSize: 13, marginTop: 4 }}>
          Upload a CSV when creating the event to add participants.
        </p>
      </div>
    );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        background: "#111111",
        border: "1px solid #2a2a2a",
        borderRadius: 12,
        padding: "1.5rem",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          alignItems: "center",
          marginBottom: "1.25rem",
        }}
      >
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search
            size={15}
            style={{
              position: "absolute",
              left: 11,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#6b7280",
            }}
          />
          <input
            type="text"
            placeholder="Search by name, phone, or response..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "9px 12px 9px 34px",
              background: "#1a1a1a",
              border: "1px solid #2a2a2a",
              borderRadius: 8,
              color: "#fff",
              fontSize: 13,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <button
            onClick={syncBatch}
            disabled={syncing}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 13px",
              borderRadius: 8,
              border: "1px solid #2a2a2a",
              background: "#1a1a1a",
              color: "#9ca3af",
              cursor: syncing ? "not-allowed" : "pointer",
              fontSize: 13,
            }}
          >
            <RefreshCw
              size={13}
              style={{
                animation: syncing ? "spin 1s linear infinite" : "none",
              }}
            />
            {syncing ? "Syncing..." : "Sync"}
          </button>
          <button
            onClick={exportToExcel}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 13px",
              borderRadius: 8,
              border: "1px solid #2a2a2a",
              background: "#000",
              color: "#fff",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <Download size={13} /> Export Excel
          </button>
        </div>
      </div>

      {/* Field legend */}
      {fields.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            marginBottom: "1rem",
            alignItems: "center",
          }}
        >
          {fields.map((f) => {
            const Icon = FIELD_ICONS[f.field_type] || Type;
            return (
              <span
                key={f.field_key}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "3px 10px",
                  borderRadius: 20,
                  background: "#1a1a2a",
                  border: "1px solid #2a2a3e",
                  color: "#93c5fd",
                  fontSize: 12,
                }}
              >
                <Icon size={11} />
                {f.field_label}
                {f.is_required && <span style={{ color: "#f87171" }}>*</span>}
              </span>
            );
          })}
          <span
            style={{
              marginLeft: "auto",
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "3px 12px",
              borderRadius: 20,
              background: "#0a1628",
              border: "1px solid #1e3a5f",
              color: "#60a5fa",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {responded}/{data.length} responded
          </span>
        </div>
      )}

      {/* No results */}
      {filtered.length === 0 && data.length > 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "2rem",
            color: "#6b7280",
            fontSize: 14,
          }}
        >
          No results match "{searchTerm}"
        </div>
      )}

      {/* Table */}
      {filtered.length > 0 && (
        <div
          style={{
            overflowX: "auto",
            marginBottom: "1.25rem",
            WebkitOverflowScrolling: "touch",
            borderRadius: 8,
            border: "1px solid #1f1f1f",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: Math.max(600, 500 + fields.length * 150),
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#1a1a1a",
                  borderBottom: "1px solid #2a2a2a",
                }}
              >
                <Th>#</Th>
                <Th>Full Name</Th>
                <Th>Phone</Th>
                {fields.map((f) => {
                  const Icon = FIELD_ICONS[f.field_type] || Type;
                  return (
                    <Th key={f.field_key}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        <Icon
                          size={12}
                          style={{ color: "#60a5fa", flexShrink: 0 }}
                        />
                        {f.field_label}
                        {f.is_required && (
                          <span style={{ color: "#f87171" }}>*</span>
                        )}
                      </div>
                    </Th>
                  );
                })}
                <Th>Timestamp</Th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((row, i) => {
                const rowNum = (currentPage - 1) * itemsPerPage + i + 1;
                const hasAnyResp = fields.some(
                  (f) =>
                    row[f.field_key] !== null && row[f.field_key] !== undefined,
                );
                return (
                  <tr
                    key={row.id}
                    style={{
                      borderBottom: "1px solid #1a1a1a",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#141420")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <Td>
                      <span style={{ color: "#4b5563", fontSize: 12 }}>
                        {rowNum}
                      </span>
                    </Td>
                    <Td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          whiteSpace: "nowrap",
                        }}
                      >
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            background: hasAnyResp ? "#1e3a5f" : "#1a1a1a",
                            border: `1px solid ${hasAnyResp ? "#1d4ed8" : "#2a2a2a"}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            fontSize: 11,
                            fontWeight: 700,
                            color: hasAnyResp ? "#60a5fa" : "#4b5563",
                          }}
                        >
                          {(row.fullName || "?")[0].toUpperCase()}
                        </div>
                        <span
                          style={{
                            color: "#f3f4f6",
                            fontWeight: 500,
                            fontSize: 13,
                          }}
                        >
                          {row.fullName}
                        </span>
                      </div>
                    </Td>
                    <Td>
                      <span
                        style={{
                          color: "#9ca3af",
                          fontFamily: "monospace",
                          fontSize: 12,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {row.phoneNumber}
                      </span>
                    </Td>
                    {fields.map((f) => (
                      <Td key={f.field_key}>
                        <FieldValue
                          value={row[f.field_key]}
                          fieldType={f.field_type}
                        />
                      </Td>
                    ))}
                    <Td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          color: "#4b5563",
                          whiteSpace: "nowrap",
                          fontSize: 11,
                        }}
                      >
                        <Calendar size={11} />
                        {formatDate(row.timestamp)}
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 6,
            marginBottom: "1.25rem",
            flexWrap: "wrap",
          }}
        >
          <PageBtn
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </PageBtn>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              style={{
                padding: "6px 11px",
                borderRadius: 6,
                fontSize: 12,
                cursor: "pointer",
                border:
                  currentPage === i + 1
                    ? "1px solid #1d4ed8"
                    : "1px solid #2a2a2a",
                background: currentPage === i + 1 ? "#1d4ed8" : "#111",
                color: currentPage === i + 1 ? "#fff" : "#6b7280",
              }}
            >
              {i + 1}
            </button>
          ))}
          <PageBtn
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </PageBtn>
        </div>
      )}

      {/* Stats */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1.5rem",
          paddingTop: "1rem",
          borderTop: "1px solid #1f1f1f",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <StatPill label="Total" value={filtered.length} color="#f3f4f6" />
        <StatPill label="Responded" value={responded} color="#34d399" />
        <StatPill label="Not Responded" value={notResponded} color="#f59e0b" />
        <StatPill label="Smart Fields" value={fields.length} color="#60a5fa" />
        <p style={{ fontSize: 11, color: "#4b5563", margin: 0 }}>
          Auto-refreshes every 60s
        </p>
      </div>

      {/* ── Action Buttons (same as classic RSVPTable) ── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          borderTop: "1px solid #1f1f1f",
          paddingTop: "1.5rem",
        }}
      >
        {/* Retry Batch Call */}
        <ActionButton
          onClick={() => setShowConfirmModal(true)}
          disabled={allResponded}
          icon={<PhoneCall size={15} />}
          label="Retry Batch Call"
        />
        <HintText success={allResponded}>
          {allResponded
            ? "✅ All participants responded — retry not needed."
            : `⚠️ ${notRespondedRows.length} participant(s) haven't responded — Retry available`}
        </HintText>

        {/* Start Batch Message */}
        <ActionButton
          onClick={handleBatchMessage}
          disabled={allResponded}
          icon={<MessageSquare size={15} />}
          label="Start Batch Message"
        />
        <HintText success={allResponded}>
          {allResponded
            ? "✅ All participants responded — messages not needed."
            : `⚠️ ${notRespondedRows.length} participant(s) haven't responded — Start available`}
        </HintText>
      </div>

      {/* ── Confirm Modal ── */}
      {showConfirmModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div
            style={{
              background: "#111",
              borderRadius: 12,
              padding: 24,
              maxWidth: 400,
              width: "100%",
              border: "1px solid #2a2a2a",
              boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
            }}
          >
            <h3
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: "#fff",
                marginBottom: 10,
                margin: "0 0 10px",
              }}
            >
              Retry Batch Call?
            </h3>
            <p
              style={{
                fontSize: 14,
                color: "#6b7280",
                lineHeight: 1.6,
                margin: "0 0 24px",
              }}
            >
              This will retry calls for{" "}
              <strong style={{ color: "#fff" }}>
                {notRespondedRows.length}
              </strong>{" "}
              participant(s) who haven't responded yet.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={isRetrying}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#d1d5db",
                  background: "#1a1a1a",
                  border: "1px solid #2a2a2a",
                  borderRadius: 8,
                  cursor: isRetrying ? "not-allowed" : "pointer",
                  opacity: isRetrying ? 0.5 : 1,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleRetryBatch}
                disabled={isRetrying}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#fff",
                  background: isRetrying ? "#374151" : "#000",
                  border: "none",
                  borderRadius: 8,
                  cursor: isRetrying ? "not-allowed" : "pointer",
                }}
              >
                {isRetrying ? "Retrying..." : "Confirm Retry"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {showToast && (
        <div
          style={{
            position: "fixed",
            top: 24,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1001,
            animation: "slideDown 0.3s ease-out",
          }}
        >
          <div
            style={{
              background: toastMsg.success ? "#000" : "#dc2626",
              color: "#fff",
              padding: "14px 20px",
              borderRadius: 8,
              boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              minWidth: 300,
              maxWidth: "90vw",
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 600, flex: 1 }}>
              {toastMsg.text}
            </span>
            <button
              onClick={() => setShowToast(false)}
              style={{
                background: "none",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                fontSize: 18,
                opacity: 0.7,
                padding: 0,
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideDown { from { opacity: 0; transform: translateX(-50%) translateY(-16px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
      `}</style>
    </div>
  );
};

export default SmartRSVPTable;

/* ─── Helpers ──────────────────────────────────────────────────────────────── */
const Th = ({ children }) => (
  <th
    style={{
      padding: "10px 14px",
      textAlign: "left",
      fontWeight: 600,
      fontSize: 12,
      color: "#6b7280",
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </th>
);
const Td = ({ children }) => (
  <td style={{ padding: "11px 14px", fontSize: 13, verticalAlign: "middle" }}>
    {children}
  </td>
);
const PageBtn = ({ children, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      padding: "6px 12px",
      borderRadius: 8,
      border: "1px solid #2a2a2a",
      background: "#111",
      color: disabled ? "#374151" : "#d1d5db",
      fontSize: 12,
      cursor: disabled ? "not-allowed" : "pointer",
    }}
  >
    {children}
  </button>
);
const StatPill = ({ label, value, color }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 2,
    }}
  >
    <span
      style={{
        fontSize: 10,
        color: "#6b7280",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
      }}
    >
      {label}
    </span>
    <span style={{ fontSize: 20, fontWeight: 700, color }}>{value}</span>
  </div>
);
const ActionButton = ({ onClick, disabled, icon, label }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      padding: "11px 24px",
      fontSize: 14,
      fontWeight: 600,
      color: "#fff",
      background: disabled ? "#374151" : "#000",
      border: "none",
      borderRadius: 8,
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "all 0.2s",
      width: "100%",
      maxWidth: 300,
      opacity: disabled ? 0.6 : 1,
    }}
    onMouseEnter={(e) => {
      if (!disabled) e.currentTarget.style.background = "#1a1a1a";
    }}
    onMouseLeave={(e) => {
      if (!disabled) e.currentTarget.style.background = "#000";
    }}
  >
    {icon}
    {label}
  </button>
);
const HintText = ({ children, success }) => (
  <p
    style={{
      fontSize: 13,
      color: success ? "#10b981" : "#f59e0b",
      fontWeight: 500,
      textAlign: "center",
      width: "100%",
      maxWidth: 300,
      margin: "2px 0 8px",
    }}
  >
    {children}
  </p>
);
