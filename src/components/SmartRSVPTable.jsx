// components/SmartRSVPTable.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { AnimatePresence } from "framer-motion";
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
  Mic,
  UserPlus,
  Truck,
  Plane,
  FileText, // NEW
} from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import TranscriptDrawer from "./TranscriptDrawer";
import TemplatePickerModal from "./TemplatePickerModal";
import SelectionToolbar from "./SelectionToolbar";
import EditParticipantModal from "./EditParticipantModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import AddParticipantModal from "./AddParticipantModal";
import { useEventActivityLock } from "../hooks/useEventActivityLock";

// Groups the raw recipient_status values into the 3 buckets shown in the
// Call Status filter — mirrors the grouping used by CallStatusBadge below.
const normalizeCallStatus = (status) => {
  if (!status || status === "pending") return "pending";
  if (status === "completed" || status === "done") return "completed";
  if (status === "failed" || status === "no_answer") return "failed";
  return status;
};

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

// ─── Main Component ───────────────────────────────────────────────────────────
const SmartRSVPTable = ({ eventId: propEventId }) => {
  const { eventId: paramEventId } = useParams();
  const eventId = propEventId || paramEventId;
  const { getToken } = useKindeAuth();
  const navigate = useNavigate();

  const [fields, setFields] = useState([]);
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [followupByParticipant, setFollowupByParticipant] = useState({});
  const [fetchError, setFetchError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [callStatusFilter, setCallStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Transcript drawer
  const [selectedParticipant, setSelectedParticipant] = useState(null);

  // Retry / batch message
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState({ success: true, text: "" });
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);

  // ── Selection state ──────────────────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [operationInProgress, setOperationInProgress] = useState(false);
  const [operationType, setOperationType] = useState(null); // 'call'|'whatsapp'|'delete'|'edit'
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingPart, setDeletingPart] = useState(false);
  const [editParticipant, setEditParticipant] = useState(null);
  const [selectedParticipantIds, setSelectedParticipantIds] = useState([]);

  const hasTravelField = fields.some((f) => f.field_type === "travel_ticket");

  // NEW — expands `document` and `travel_ticket` fields into their real
  // display columns (file-view button / 6 extracted itinerary columns)
  // instead of showing the raw upload_id / "arrival_only" placeholder text.
  const displayColumns = React.useMemo(() => {
    const cols = [];
    fields.forEach((f) => {
      if (f.field_type === "travel_ticket") {
        cols.push({
          kind: "travel",
          sub: "arrival_date",
          label: "Arrival Date",
          field: f,
        });
        cols.push({
          kind: "travel",
          sub: "arrival_time",
          label: "Arrival Time",
          field: f,
        });
        cols.push({
          kind: "travel",
          sub: "arrival_transport_no",
          label: "Arrival Transport No",
          field: f,
        });
        cols.push({
          kind: "travel",
          sub: "return_date",
          label: "Return Date",
          field: f,
        });
        cols.push({
          kind: "travel",
          sub: "return_time",
          label: "Return Time",
          field: f,
        });
        cols.push({
          kind: "travel",
          sub: "return_transport_no",
          label: "Return Transport No",
          field: f,
        });
      } else if (f.field_type === "document") {
        // Rendered inline, in the same position the organizer placed it
        // when building the agent — links to the existing Document Viewer
        // page (same one classic uses) rather than a raw file URL.
        cols.push({ kind: "document", field: f });
      } else {
        cols.push({ kind: "standard", field: f });
      }
    });
    return cols;
  }, [fields]);

  // ── Add participant ──────────────────────────────────────────────────────
  const [showAddParticipant, setShowAddParticipant] = useState(false);

  // ── Realtime activity lock — polls backend every 8s for in-flight
  //    call batches / whatsapp batches so edit/delete stay disabled
  //    even across page refresh while a batch is genuinely running.
  const { locked: activityLocked, reason: activityLockReason } =
    useEventActivityLock(eventId);

  // Track whether drawer is open to pause auto-refresh
  const drawerOpenRef = React.useRef(false);
  drawerOpenRef.current = !!selectedParticipant;

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
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
      const res2 = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/events/${eventId}/rsvp-data`,
      );
      const json2 = await res2.json();
      if (json2.field_mode === "smart_fields") {
        setFields(json2.fields || []);
        setData(json2.data || []);
      } else if (Array.isArray(json2)) setData(json2);
      else setFetchError("Unexpected response from server.");
    } catch (err) {
      setFetchError(err.message);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const mapFollowupData = (rows) => {
    const map = {};
    (rows || []).forEach((d) => {
      map[d.participant_id] = d;
    });
    return map;
  };

  const fetchFollowupStatus = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/events/${eventId}/followup-status`,
      );
      const json = await res.json();
      if (json.success) setFollowupByParticipant(mapFollowupData(json.data));
    } catch (err) {
      console.error("Failed to fetch follow-up status:", err);
    }
  };

  const syncBatch = async () => {
    try {
      setSyncing(true);
      const [, followupRes] = await Promise.all([
        fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/events/${eventId}/sync-batch-status`,
          { method: "POST" },
        ),
        fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/events/${eventId}/followup-status/sync`,
          { method: "POST" },
        ),
      ]);
      const followupJson = await followupRes.json().catch(() => null);
      if (followupJson?.success) {
        setFollowupByParticipant(mapFollowupData(followupJson.data));
      }
      await fetchData(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    if (!eventId) return;
    fetchData();
    fetchFollowupStatus();
    const iv = setInterval(() => {
      // Pause auto-refresh while drawer is open to avoid interrupting audio
      if (drawerOpenRef.current) return;
      fetchData(true); // silent — no loading spinner
    }, 60000);
    return () => clearInterval(iv);
  }, [eventId]);

  // ── Filter ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    let rows = data;

    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      rows = rows.filter(
        (row) =>
          row.fullName?.toLowerCase().includes(lower) ||
          row.phoneNumber?.toLowerCase().includes(lower) ||
          fields.some((f) =>
            String(row[f.field_key] ?? "")
              .toLowerCase()
              .includes(lower),
          ),
      );
    }

    if (callStatusFilter !== "all") {
      rows = rows.filter(
        (row) => normalizeCallStatus(row.recipient_status) === callStatusFilter,
      );
    }

    setFiltered(rows);
    setCurrentPage(1);
  }, [searchTerm, callStatusFilter, data, fields]);

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
    } catch {
      setShowConfirmModal(false);
      toast(false, "❌ Failed to start retry batch call.");
    } finally {
      setIsRetrying(false);
    }
  };

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
      toast(
        true,
        `Sending messages to ${notRespondedRows.length} participant(s)!`,
      );
      await fetchData();
    } catch {
      toast(false, "❌ Failed to send batch messages.");
    }
  };

  // NEW — exports resolved values (document URLs + itinerary sub-fields)
  // instead of raw upload_ids / "arrival_only" placeholder text.
  const exportToExcel = () => {
    if (!filtered.length) return;
    const rows = filtered.map((row, i) => {
      const base = {
        "S.No": i + 1,
        "Full Name": row.fullName || "",
        "Phone Number": row.phoneNumber || "",
      };
      displayColumns.forEach((col) => {
        if (col.kind === "travel") {
          base[`${col.field.field_label} - ${col.label}`] =
            row[`${col.field.field_key}_${col.sub}`] ?? "";
        } else if (col.kind === "document") {
          base[col.field.field_label] = `/document-viewer/${row.id}`;
        } else {
          base[col.field.field_label] = row[col.field.field_key] ?? "";
        }
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
  const notRespondedRows = data.filter(
    (row) =>
      !fields.some(
        (f) => row[f.field_key] !== null && row[f.field_key] !== undefined,
      ),
  );
  const allResponded = data.length > 0 && notRespondedRows.length === 0;

  // ── Selection helpers ──────────────────────────────────────────────────────
  const toggleSelect = (id) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleSelectAll = () =>
    setSelectedIds((prev) =>
      prev.size === paginated.length
        ? new Set()
        : new Set(paginated.map((r) => r.id || r.participant_id)),
    );

  const clearSelection = () => setSelectedIds(new Set());

  const getSelectedRows = () =>
    data.filter((r) => selectedIds.has(r.id || r.participant_id));

  // ── Start batch call for selected participants only ─────────────────────
  const handleStartBatchCall = async () => {
    if (!selectedIds.size) return;
    setOperationInProgress(true);
    setOperationType("call");
    try {
      const ids = [...selectedIds];
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/events/${eventId}/start-batch-selected`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ participant_ids: ids }),
        },
      );
      const d = await res.json();
      if (res.status === 402) {
        toast(
          false,
          `❌ Insufficient credits (need ${d.estimated_credits}, have ${d.current_balance})`,
        );
        return;
      }
      if (!res.ok) throw new Error(d.error || "Failed to start batch call");
      toast(true, `✅ Batch call started for ${ids.length} participant(s)`);
      clearSelection();
      await fetchData(true);
    } catch (e) {
      toast(false, `❌ ${e.message || "Failed to start batch call"}`);
    } finally {
      setOperationInProgress(false);
      setOperationType(null);
    }
  };

  // ── WhatsApp send for selected (opens modal scoped to selection) ────────
  const handleWhatsAppSelected = () => {
    setSelectedParticipantIds([...selectedIds]);
    setShowTemplatePicker(true);
  };

  // ── Delete selected participants ─────────────────────────────────────────
  const handleDeleteSelected = async () => {
    const ids = [...selectedIds];
    setDeletingPart(true);
    setOperationInProgress(true);
    setOperationType("delete");
    try {
      const token = await getToken();
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/events/${eventId}/participants`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ participant_ids: ids }),
        },
      );
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Delete failed");
      toast(true, `✅ Deleted ${d.deleted} participant(s)`);
      setShowDeleteConfirm(false);
      clearSelection();
      await fetchData();
    } catch (e) {
      toast(false, `❌ ${e.message}`);
    } finally {
      setDeletingPart(false);
      setOperationInProgress(false);
      setOperationType(null);
    }
  };

  // ── After edit success ───────────────────────────────────────────────────
  const handleEditSuccess = () => {
    clearSelection();
    fetchData(true);
  };

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
      <>
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
          <button
            onClick={() => setShowAddParticipant(true)}
            style={{
              marginTop: 16,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "9px 18px",
              borderRadius: 8,
              border: "1px solid #1e3a5f",
              background: "#0a1628",
              color: "#60a5fa",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <UserPlus size={14} /> Add Participant
          </button>
        </div>
        {showAddParticipant && (
          <AddParticipantModal
            eventId={eventId}
            smartFields={fields}
            onClose={() => setShowAddParticipant(false)}
            onSuccess={() => {
              setShowAddParticipant(false);
              fetchData();
            }}
          />
        )}
      </>
    );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
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
          <select
            value={callStatusFilter}
            onChange={(e) => setCallStatusFilter(e.target.value)}
            style={{
              padding: "9px 12px",
              background: "#1a1a1a",
              border: "1px solid #2a2a2a",
              borderRadius: 8,
              color: "#fff",
              fontSize: 13,
              outline: "none",
              flexShrink: 0,
            }}
          >
            <option value="all">All Call Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
          <div
            style={{ display: "flex", gap: 8, flexShrink: 0, flexWrap: "wrap" }}
          >
            {/* Add Participant button */}
            <button
              onClick={() => setShowAddParticipant(true)}
              disabled={activityLocked}
              title={
                activityLocked ? activityLockReason : "Add a new participant"
              }
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 13px",
                borderRadius: 8,
                border: "1px solid #1e3a5f",
                background: activityLocked ? "#0a1018" : "#0a1628",
                color: activityLocked ? "#374151" : "#60a5fa",
                cursor: activityLocked ? "not-allowed" : "pointer",
                fontSize: 13,
                fontWeight: 600,
                opacity: activityLocked ? 0.5 : 1,
              }}
            >
              <UserPlus size={13} /> Add Participant
            </button>
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
            <button
              onClick={() =>
                hasTravelField && navigate(`/transport-planning/${eventId}`)
              }
              disabled={!hasTravelField}
              title={
                hasTravelField
                  ? "View transport planning"
                  : "Add a Travel Ticket field to this agent to enable transport planning"
              }
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 13px",
                borderRadius: 8,
                border: "1px solid #2a2a2a",
                background: hasTravelField ? "#000" : "#0a0a0a",
                color: hasTravelField ? "#fff" : "#4b5563",
                cursor: hasTravelField ? "pointer" : "not-allowed",
                fontSize: 13,
                fontWeight: 600,
                opacity: hasTravelField ? 1 : 0.5,
              }}
            >
              <Truck size={13} /> Transport Planning
            </button>

            <button
              onClick={() =>
                hasTravelField && navigate(`/flight-status/${eventId}`)
              }
              disabled={!hasTravelField}
              title={
                hasTravelField
                  ? "View flight status"
                  : "Add a Travel Ticket field to this agent to enable flight status"
              }
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 13px",
                borderRadius: 8,
                border: "1px solid #2a2a2a",
                background: hasTravelField ? "#000" : "#0a0a0a",
                color: hasTravelField ? "#fff" : "#4b5563",
                cursor: hasTravelField ? "pointer" : "not-allowed",
                fontSize: 13,
                fontWeight: 600,
                opacity: hasTravelField ? 1 : 0.5,
              }}
            >
              <Plane size={13} /> View Flight Status
            </button>
          </div>
        </div>

        {/* Activity-locked banner */}
        {activityLocked && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#1c1608",
              border: "1px solid #3d3207",
              borderRadius: 8,
              padding: "10px 14px",
              marginBottom: 14,
              fontSize: "0.82rem",
              color: "#fbbf24",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#fbbf24",
                animation: "smartTablePulse 1.4s ease-in-out infinite",
                flexShrink: 0,
              }}
            />
            {activityLockReason}
            <style>{`@keyframes smartTablePulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
          </div>
        )}

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
              const Icon =
                f.field_type === "document"
                  ? FileText
                  : f.field_type === "travel_ticket"
                    ? Plane
                    : FIELD_ICONS[f.field_type] || Type;
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

        {filtered.length === 0 && data.length > 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "2rem",
              color: "#6b7280",
              fontSize: 14,
            }}
          >
            {searchTerm.trim()
              ? `No results match "${searchTerm}"`
              : "No participants match the selected call status filter"}
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
                minWidth: Math.max(700, 600 + displayColumns.length * 150),
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#1a1a1a",
                    borderBottom: "1px solid #2a2a2a",
                  }}
                >
                  {/* select-all checkbox column */}
                  <th style={{ padding: "10px 14px", width: 36 }}>
                    <input
                      type="checkbox"
                      checked={
                        paginated.length > 0 &&
                        paginated.every((r) =>
                          selectedIds.has(r.id || r.participant_id),
                        )
                      }
                      onChange={toggleSelectAll}
                      disabled={activityLocked}
                      style={{
                        cursor: activityLocked ? "not-allowed" : "pointer",
                        accentColor: "#1d4ed8",
                        opacity: activityLocked ? 0.4 : 1,
                      }}
                    />
                  </th>
                  <Th>#</Th>
                  <Th>Full Name</Th>
                  <Th>Phone</Th>
                  {displayColumns.map((col) => {
                    if (col.kind === "travel") {
                      return (
                        <Th key={`${col.field.field_key}_${col.sub}`}>
                          {col.label}
                        </Th>
                      );
                    }
                    if (col.kind === "document") {
                      return (
                        <Th key={col.field.field_key}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 5,
                            }}
                          >
                            <FileText
                              size={12}
                              style={{ color: "#60a5fa", flexShrink: 0 }}
                            />
                            {col.field.field_label}
                            {col.field.is_required && (
                              <span style={{ color: "#f87171" }}>*</span>
                            )}
                          </div>
                        </Th>
                      );
                    }
                    const Icon = FIELD_ICONS[col.field.field_type] || Type;
                    return (
                      <Th key={col.field.field_key}>
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
                          {col.field.field_label}
                          {col.field.is_required && (
                            <span style={{ color: "#f87171" }}>*</span>
                          )}
                        </div>
                      </Th>
                    );
                  })}
                  {/* Transcript column */}
                  <Th>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 5 }}
                    >
                      <Mic size={12} style={{ color: "#a78bfa" }} />
                      Transcript
                    </div>
                  </Th>
                  {/* Call Status column */}
                  <Th>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 5 }}
                    >
                      <Phone size={12} style={{ color: "#34d399" }} />
                      Call Status
                    </div>
                  </Th>
                  {/* Follow-up column */}
                  <Th>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 5 }}
                    >
                      <MessageSquare size={12} style={{ color: "#c9a97a" }} />
                      Follow-up
                    </div>
                  </Th>
                  <Th>Timestamp</Th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((row, i) => {
                  const rowNum = (currentPage - 1) * itemsPerPage + i + 1;
                  const hasAnyResp = fields.some(
                    (f) =>
                      row[f.field_key] !== null &&
                      row[f.field_key] !== undefined,
                  );
                  const rowId = row.id || row.participant_id;
                  return (
                    <tr
                      key={row.id}
                      style={{
                        borderBottom: "1px solid #1a1a1a",
                        transition: "background 0.15s",
                        background: selectedIds.has(rowId)
                          ? "#101a2e"
                          : "transparent",
                      }}
                      onMouseEnter={(e) =>
                        !selectedIds.has(rowId) &&
                        (e.currentTarget.style.background = "#141420")
                      }
                      onMouseLeave={(e) =>
                        !selectedIds.has(rowId) &&
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      {/* row checkbox */}
                      <Td>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(rowId)}
                          onChange={() => toggleSelect(rowId)}
                          disabled={activityLocked}
                          style={{
                            cursor: activityLocked ? "not-allowed" : "pointer",
                            accentColor: "#1d4ed8",
                            opacity: activityLocked ? 0.4 : 1,
                          }}
                        />
                      </Td>
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
                      {displayColumns.map((col) => {
                        if (col.kind === "travel") {
                          const value =
                            row[`${col.field.field_key}_${col.sub}`];
                          return (
                            <Td key={`${col.field.field_key}_${col.sub}`}>
                              {value ? (
                                <span style={{ color: "#e5e7eb" }}>
                                  {value}
                                </span>
                              ) : (
                                <span
                                  style={{
                                    color: "#4b5563",
                                    fontStyle: "italic",
                                  }}
                                >
                                  —
                                </span>
                              )}
                            </Td>
                          );
                        }
                        if (col.kind === "document") {
                          return (
                            <Td key={col.field.field_key}>
                              <button
                                onClick={() =>
                                  navigate(`/document-viewer/${row.id}`)
                                }
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 5,
                                  padding: "5px 11px",
                                  borderRadius: 8,
                                  background: "rgba(16,185,129,0.12)",
                                  border: "1px solid rgba(16,185,129,0.3)",
                                  color: "#34d399",
                                  cursor: "pointer",
                                  fontSize: 12,
                                  fontWeight: 600,
                                }}
                              >
                                <FileText size={11} /> View
                              </button>
                            </Td>
                          );
                        }
                        return (
                          <Td key={col.field.field_key}>
                            <FieldValue
                              value={row[col.field.field_key]}
                              fieldType={col.field.field_type}
                            />
                          </Td>
                        );
                      })}

                      {/* Transcript button cell */}
                      <Td>
                        {row.conversation_id ? (
                          <button
                            onClick={() => setSelectedParticipant(row)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                              padding: "5px 11px",
                              borderRadius: 8,
                              background:
                                "linear-gradient(135deg,rgba(124,58,237,0.15),rgba(99,102,241,0.15))",
                              border: "1px solid rgba(124,58,237,0.35)",
                              color: "#c4b5fd",
                              cursor: "pointer",
                              fontSize: 12,
                              fontWeight: 600,
                              transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background =
                                "linear-gradient(135deg,rgba(124,58,237,0.28),rgba(99,102,241,0.28))")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background =
                                "linear-gradient(135deg,rgba(124,58,237,0.15),rgba(99,102,241,0.15))")
                            }
                          >
                            <Mic size={11} /> View
                          </button>
                        ) : (
                          <span style={{ color: "#374151", fontSize: 12 }}>
                            —
                          </span>
                        )}
                      </Td>

                      {/* Call Status cell */}
                      <Td>
                        <CallStatusBadge status={row.recipient_status} />
                      </Td>

                      {/* Follow-up cell */}
                      <Td>
                        <FollowUpStatusBadge
                          entry={followupByParticipant[row.id]}
                        />
                      </Td>

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
          <StatPill
            label="Not Responded"
            value={notResponded}
            color="#f59e0b"
          />
          <StatPill
            label="Smart Fields"
            value={fields.length}
            color="#60a5fa"
          />
          <p style={{ fontSize: 11, color: "#4b5563", margin: 0 }}>
            Auto-refreshes every 60s • Paused while drawer is open
          </p>
        </div>

        {/* Action Buttons */}
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
          <ActionButton
            onClick={() => setShowTemplatePicker(true)}
            disabled={false}
            icon={<MessageSquare size={15} />}
            label="Send WhatsApp Message"
          />
          <HintText success={allResponded}>
            {allResponded
              ? "✅ All participants responded — messages not needed."
              : `⚠️ ${notRespondedRows.length} participant(s) haven't responded — Start available`}
          </HintText>
        </div>
      </div>

      {/* Confirm Modal */}
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
                  cursor: "pointer",
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

      {/* Toast */}
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
              display: "flex",
              alignItems: "center",
              gap: 10,
              minWidth: 300,
              maxWidth: "90vw",
              boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
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

      {/* Transcript Drawer */}
      <AnimatePresence>
        {selectedParticipant && (
          <TranscriptDrawer
            participant={selectedParticipant}
            eventId={eventId}
            onClose={() => setSelectedParticipant(null)}
          />
        )}
      </AnimatePresence>

      {/* Template Picker Modal */}
      {showTemplatePicker && (
        <TemplatePickerModal
          eventId={eventId}
          participantCount={selectedParticipantIds.length || data.length}
          participantIds={
            selectedParticipantIds.length ? selectedParticipantIds : null
          }
          onClose={() => {
            setShowTemplatePicker(false);
            setSelectedParticipantIds([]);
          }}
          onSuccess={({ sent, failed, total }) => {
            setShowTemplatePicker(false);
            setSelectedParticipantIds([]);
            clearSelection();
            toast(
              true,
              `Sent to ${sent}/${total} participants. Chatbot is now active!`,
            );
          }}
        />
      )}

      {/* Selection toolbar */}
      <SelectionToolbar
        selectedCount={selectedIds.size}
        onClearSelection={clearSelection}
        onStartBatchCall={handleStartBatchCall}
        onSendWhatsApp={handleWhatsAppSelected}
        onEdit={() => setEditParticipant(getSelectedRows()[0])}
        onDelete={() => setShowDeleteConfirm(true)}
        operationInProgress={operationInProgress || activityLocked}
        operationType={operationType}
      />

      {/* Edit modal */}
      {editParticipant && (
        <EditParticipantModal
          participant={editParticipant}
          eventId={eventId}
          smartFields={fields}
          onClose={() => setEditParticipant(null)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Delete confirm */}
      {showDeleteConfirm && (
        <DeleteConfirmModal
          count={selectedIds.size}
          names={getSelectedRows().map((r) => r.fullName)}
          onConfirm={handleDeleteSelected}
          onCancel={() => setShowDeleteConfirm(false)}
          deleting={deletingPart}
        />
      )}

      {/* Add participant modal */}
      {showAddParticipant && (
        <AddParticipantModal
          eventId={eventId}
          smartFields={fields}
          onClose={() => setShowAddParticipant(false)}
          onSuccess={() => {
            setShowAddParticipant(false);
            fetchData();
          }}
        />
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideDown { from { opacity:0; transform:translateX(-50%) translateY(-16px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
      `}</style>
    </>
  );
};

export default SmartRSVPTable;

/* ─── Call Status Badge ────────────────────────────────────────────────────── */
const CallStatusBadge = ({ status }) => {
  if (!status || status === "pending") {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          padding: "3px 9px",
          borderRadius: 20,
          background: "#1c1a08",
          border: "1px solid #3d3207",
          color: "#fbbf24",
          fontSize: 11,
          fontWeight: 600,
        }}
      >
        pending
      </span>
    );
  }
  if (status === "completed" || status === "done") {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          padding: "3px 9px",
          borderRadius: 20,
          background: "#064e3b",
          border: "1px solid #065f46",
          color: "#34d399",
          fontSize: 11,
          fontWeight: 600,
        }}
      >
        completed
      </span>
    );
  }
  if (status === "failed" || status === "no_answer") {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          padding: "3px 9px",
          borderRadius: 20,
          background: "#450a0a",
          border: "1px solid #7f1d1d",
          color: "#f87171",
          fontSize: 11,
          fontWeight: 600,
        }}
      >
        {status}
      </span>
    );
  }
  if (status === "initiated" || status === "in_progress") {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          padding: "3px 9px",
          borderRadius: 20,
          background: "#0a1628",
          border: "1px solid #1e3a5f",
          color: "#60a5fa",
          fontSize: 11,
          fontWeight: 600,
        }}
      >
        {status}
      </span>
    );
  }
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "3px 9px",
        borderRadius: 20,
        background: "#1a1a1a",
        border: "1px solid #2a2a2a",
        color: "#6b7280",
        fontSize: 11,
        fontWeight: 600,
      }}
    >
      {status}
    </span>
  );
};

const FOLLOWUP_BADGE_STYLES = {
  scheduled: { background: "#1c1a08", border: "#3d3207", color: "#fbbf24" },
  sent: { background: "#064e3b", border: "#065f46", color: "#34d399" },
  delivered: { background: "#064e3b", border: "#065f46", color: "#34d399" },
  read: { background: "#0a1628", border: "#1e3a5f", color: "#60a5fa" },
  failed: { background: "#450a0a", border: "#7f1d1d", color: "#f87171" },
  skipped: { background: "#1a1a1a", border: "#2a2a2a", color: "#6b7280" },
  pending: { background: "#1c1a08", border: "#3d3207", color: "#fbbf24" },
};

// entry = a row from event_followup_dispatches (see fetchFollowupStatus), or
// undefined if no follow-up rule fired for this participant yet.
const FollowUpStatusBadge = ({ entry }) => {
  if (!entry) {
    return <span style={{ color: "#374151", fontSize: 12 }}>—</span>;
  }
  const label = entry.provider_status || entry.status || "pending";
  const style =
    FOLLOWUP_BADGE_STYLES[label.toLowerCase()] || FOLLOWUP_BADGE_STYLES.skipped;
  return (
    <span
      title={entry.error_message || ""}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "3px 9px",
        borderRadius: 20,
        background: style.background,
        border: `1px solid ${style.border}`,
        color: style.color,
        fontSize: 11,
        fontWeight: 600,
      }}
    >
      {label}
    </span>
  );
};

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
      width: "100%",
      maxWidth: 300,
      opacity: disabled ? 0.6 : 1,
      transition: "all 0.2s",
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
