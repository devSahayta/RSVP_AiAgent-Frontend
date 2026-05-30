// pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import RSVPTable from "../components/RSVPTable";
import SmartRSVPTable from "../components/SmartRSVPTable";
import "../styles/pages.css";

const Dashboard = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!eventId) return;

    const fetchEvent = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/events/${eventId}`,
        );
        if (!res.ok) throw new Error("Failed to fetch event");
        const json = await res.json();
        // backend returns { event: {...}, participants: [...] }
        setEvent(json.event || json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  if (loading) {
    return (
      <div className="page-container">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 300,
            flexDirection: "column",
            gap: 12,
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
            }}
          />
          <span>Loading dashboard...</span>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div style={{ textAlign: "center", color: "#f87171", padding: "3rem" }}>
          <p>Error: {error}</p>
          <button
            onClick={() => navigate("/events")}
            style={{
              marginTop: 12,
              padding: "8px 16px",
              borderRadius: 8,
              background: "#111",
              border: "1px solid #2a2a2a",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  const isSmartFields = event?.field_mode === "smart_fields";

  return (
    <div className="page-container">
      <div className="page-header">
        {/* Back button */}
        <button
          onClick={() => navigate("/events")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            marginBottom: "1.5rem",
            padding: "8px 14px",
            background: "#111",
            border: "1px solid #2a2a2a",
            borderRadius: 8,
            color: "#d1d5db",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          ← Back to Events
        </button>

        {/* Event name + mode badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            justifyContent: "center",
            marginBottom: "0.5rem",
          }}
        >
          <h1 className="page-title" style={{ margin: 0 }}>
            {event?.event_name || "RSVP Dashboard"}
          </h1>
          <span
            style={{
              padding: "3px 12px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              background: isSmartFields
                ? "rgba(20,184,166,0.15)"
                : "rgba(59,130,246,0.15)",
              border: `1px solid ${isSmartFields ? "rgba(20,184,166,0.3)" : "rgba(59,130,246,0.3)"}`,
              color: isSmartFields ? "#2dd4bf" : "#60a5fa",
            }}
          >
            {isSmartFields ? "Smart Fields" : "Classic"}
          </span>
        </div>

        <p className="page-subtitle">
          {isSmartFields
            ? "Responses collected via custom smart fields"
            : "Monitor your event responses and guest data"}
        </p>
      </div>

      {/* ── Render the right table based on mode ── */}
      {isSmartFields ? (
        <SmartRSVPTable eventId={eventId} />
      ) : (
        <RSVPTable eventId={eventId} />
      )}
    </div>
  );
};

export default Dashboard;
