import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Phone,
  MessageCircle,
  Users,
  ArrowLeft,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUserCredits } from "../hooks/useUserCredits";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import TemplatePickerModal from "../components/TemplatePickerModal";

const CallBatchPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [callInProgress, setCallInProgress] = useState(false);
  const [callResult, setCallResult] = useState(null);
  const [hasConversations, setHasConversations] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showWhatsAppPopup, setShowWhatsAppPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const { user, isAuthenticated } = useKindeAuth();
  const { refetchCredits } = useUserCredits(user?.id, isAuthenticated);
  const [batchId, setBatchId] = useState(null);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);

  useEffect(() => {
    fetchEventData();
  }, [eventId]);
  useEffect(() => {
    if (hasConversations) navigate(`/dashboard/${eventId}`);
  }, [hasConversations, navigate, eventId]);

  const fetchEventData = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/events/${eventId}`,
      );
      if (!res.ok) throw new Error("Failed to fetch event");
      const data = await res.json();
      setEvent({
        id: data.event_id,
        name: data.event_name,
        participants: data.participants || [],
      });
      const res2 = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/events/${eventId}/dashboard`,
      );
      const dashboard = await res2.json();
      setHasConversations((dashboard.conversations || []).length > 0);
    } catch (err) {
      console.error("Error fetching event data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "2rem 1rem",
          minHeight: "calc(100vh - 64px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem",
            color: "#6b7280",
          }}
        >
          <div className="loading-spinner" />
          <p>Loading event data...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "2rem 1rem",
          minHeight: "calc(100vh - 64px)",
        }}
      >
        <button
          onClick={() => navigate("/events")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "none",
            border: "none",
            color: "#6b7280",
            fontSize: "0.875rem",
            fontWeight: "500",
            cursor: "pointer",
            padding: "0.5rem 0",
            marginBottom: "1rem",
          }}
          onMouseEnter={(e) => (e.target.style.color = "#ffffff")}
          onMouseLeave={(e) => (e.target.style.color = "#6b7280")}
        >
          <ArrowLeft size={20} /> Back to Events
        </button>
        <div style={{ textAlign: "center", padding: "3rem", color: "#6b7280" }}>
          <h2 style={{ color: "#dc2626", marginBottom: "1rem" }}>
            Event Not Found
          </h2>
          <p>The requested event could not be found.</p>
        </div>
      </div>
    );
  }

  if (hasConversations) {
    navigate(`/dashboard/${eventId}`, { replace: true });
    return null;
  }

  const pollBatchStatusWithElevenLabs = async (
    userId,
    batchId,
    attemptCount = 0,
  ) => {
    const MAX_ATTEMPTS = 15;
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/credits/reduce-batch-elevenlabs`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ user_id: userId, batch_id: batchId }),
        },
      );
      if (response.ok) {
        const result = await response.json();
        if (refetchCredits) await refetchCredits();
        alert(
          `✅ Batch Complete!\n\nTotal Calls: ${result.total_calls}\nCredits Used: ${result.total_deducted}\nNew Balance: ${result.new_balance}`,
        );
      } else if (response.status === 400) {
        const error = await response.json();
        if (error.error === "Batch not completed yet") {
          if (attemptCount < MAX_ATTEMPTS)
            setTimeout(
              () =>
                pollBatchStatusWithElevenLabs(
                  userId,
                  batchId,
                  attemptCount + 1,
                ),
              30000,
            );
          else
            alert(
              "Call processing is taking longer than expected. Please check the dashboard in a few minutes.",
            );
        } else alert(`Error: ${error.error}`);
      } else {
        const err = await response.json();
        alert(`Error: ${err.error}`);
      }
    } catch (err) {
      if (attemptCount < MAX_ATTEMPTS)
        setTimeout(
          () =>
            pollBatchStatusWithElevenLabs(userId, batchId, attemptCount + 1),
          30000,
        );
    }
  };

  const handleStartCallBatch = async () => {
    if (!event?.participants?.length) return;
    if (!user?.id) {
      alert("Please log in to start calls");
      return;
    }
    setCallInProgress(true);
    setCallResult(null);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/events/${event.id}/call-batch`,
        { method: "POST" },
      );
      const data = await res.json();
      if (res.status === 402) {
        alert(
          `Insufficient Credits!\n\nRequired: ${data.estimated_credits} credits\nCurrent: ${data.current_balance} credits\nShortfall: ${data.shortfall} credits`,
        );
        setCallInProgress(false);
        return;
      }
      if (!res.ok) {
        setCallResult({
          success: false,
          message: data.error || "Failed to start batch call",
        });
        setCallInProgress(false);
        return;
      }
      const returnedBatchId = data.batch_id || data.batch?.id || event.batch_id;
      if (returnedBatchId) setBatchId(returnedBatchId);
      setCallResult({
        success: true,
        message: "Batch call started successfully. Calls are in progress...",
      });
      setShowPopup(true);
      setTimeout(() => {
        setShowPopup(false);
        navigate(`/dashboard/${event.id}`, {
          state: {
            message:
              "Calls in progress. Credits will be deducted automatically when calls complete.",
          },
        });
      }, 3000);
    } catch {
      setCallResult({
        success: false,
        message: "Failed to start batch call. Please try again.",
      });
    } finally {
      setCallInProgress(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "2rem 1rem",
        minHeight: "calc(100vh - 64px)",
      }}
    >
      {/* ── Back ── */}
      <button
        onClick={() => navigate("/events")}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          background: "none",
          border: "none",
          color: "#525252",
          fontSize: "0.82rem",
          fontWeight: "500",
          cursor: "pointer",
          padding: "0.5rem 0",
          marginBottom: "2rem",
          transition: "color 0.15s",
          letterSpacing: "0.01em",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#a3a3a3")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#525252")}
      >
        <ArrowLeft size={15} />
        Back to Events
      </button>

      {/* ── Center card ── */}
      <div style={{ maxWidth: "520px", margin: "0 auto", textAlign: "center" }}>
        <div
          style={{
            background: "#111111",
            border: "1px solid #222222",
            borderRadius: "14px",
            padding: "2.75rem 2.25rem 2.5rem",
            boxShadow: "0 0 0 1px #ffffff04 inset, 0 20px 60px rgba(0,0,0,0.5)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Subtle top glow */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: "60%",
              height: "1px",
              background:
                "linear-gradient(90deg, transparent, #3a3a3a, transparent)",
              pointerEvents: "none",
            }}
          />

          {/* Event name */}
          <h1
            style={{
              fontSize: "2.25rem",
              fontWeight: "700",
              color: "#f5f5f5",
              marginBottom: "0.6rem",
              letterSpacing: "-0.025em",
              lineHeight: 1.15,
            }}
          >
            {event.name}
          </h1>

          {/* Sub heading */}
          <h2
            style={{
              fontSize: "1rem",
              fontWeight: "400",
              color: "#555555",
              marginBottom: "1.5rem",
              letterSpacing: "0.005em",
            }}
          >
            Trigger AI calls to participants
          </h2>

          {/* Description */}
          <p
            style={{
              fontSize: "0.875rem",
              color: "#3d3d3d",
              lineHeight: "1.65",
              maxWidth: "360px",
              margin: "0 auto 2rem",
              letterSpacing: "0.01em",
            }}
          >
            Click below to start an AI-powered call batch to notify your
            participants.
          </p>

          {/* Participant count */}
          {!!event.participants?.length && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                marginBottom: "2rem",
                background: "#161616",
                border: "1px solid #222222",
                borderRadius: "99px",
                padding: "5px 14px",
              }}
            >
              <Users size={13} strokeWidth={1.5} color="#525252" />
              <span
                style={{
                  fontSize: "0.8rem",
                  color: "#525252",
                  letterSpacing: "0.01em",
                  fontWeight: "500",
                }}
              >
                <span style={{ color: "#a3a3a3", fontWeight: "600" }}>
                  {event.participants.length}
                </span>{" "}
                participants will be called
              </span>
            </div>
          )}

          {/* Call result */}
          {callResult && (
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
                padding: "11px 14px",
                borderRadius: "8px",
                marginBottom: "1.5rem",
                textAlign: "left",
                fontSize: "0.82rem",
                lineHeight: 1.45,
                background: callResult.success ? "#0c1a0c" : "#1a0c0c",
                border: `1px solid ${callResult.success ? "#1c3d1c" : "#3d1c1c"}`,
                color: callResult.success ? "#6abf69" : "#cf6679",
              }}
            >
              {callResult.success && (
                <CheckCircle
                  size={15}
                  style={{ flexShrink: 0, marginTop: 1 }}
                />
              )}
              <span>{callResult.message}</span>
            </div>
          )}

          {/* ── Button 1: Start Call Batch (primary, first) ── */}
          <button
            onClick={handleStartCallBatch}
            disabled={callInProgress || !event.participants?.length}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              width: "100%",
              background: callInProgress ? "#1a1a1a" : "#efefef",
              color: callInProgress ? "#444" : "#0a0a0a",
              border: `1px solid ${callInProgress ? "#2a2a2a" : "#efefef"}`,
              padding: "13px 2rem",
              borderRadius: "9px",
              fontSize: "0.9rem",
              fontWeight: "600",
              cursor:
                callInProgress || !event.participants?.length
                  ? "not-allowed"
                  : "pointer",
              transition: "all 0.15s",
              marginBottom: "10px",
              letterSpacing: "0.01em",
            }}
            onMouseEnter={(e) => {
              if (!callInProgress && event.participants?.length) {
                e.currentTarget.style.background = "#ffffff";
                e.currentTarget.style.borderColor = "#ffffff";
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 4px 20px rgba(255,255,255,0.08)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = callInProgress
                ? "#1a1a1a"
                : "#efefef";
              e.currentTarget.style.borderColor = callInProgress
                ? "#2a2a2a"
                : "#efefef";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {callInProgress ? (
              <>
                <Loader2
                  size={17}
                  style={{ animation: "spin 1s linear infinite" }}
                />{" "}
                Starting Call Batch...
              </>
            ) : (
              <>
                <Phone size={17} /> Start Call Batch
              </>
            )}
          </button>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              margin: "6px 0",
            }}
          >
            <div style={{ flex: 1, height: "1px", background: "#1e1e1e" }} />
            <span
              style={{
                fontSize: "0.67rem",
                color: "#2e2e2e",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              or
            </span>
            <div style={{ flex: 1, height: "1px", background: "#1e1e1e" }} />
          </div>

          {/* ── Button 2: WhatsApp RSVP (secondary, second) ── */}
          <button
            onClick={() => setShowTemplatePicker(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              width: "100%",
              background: "transparent",
              color: "#737373",
              border: "1px solid #272727",
              padding: "13px 2rem",
              borderRadius: "9px",
              fontSize: "0.9rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.15s",
              marginTop: "10px",
              letterSpacing: "0.01em",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#161616";
              e.currentTarget.style.borderColor = "#333333";
              e.currentTarget.style.color = "#a3a3a3";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "#272727";
              e.currentTarget.style.color = "#737373";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <MessageCircle size={17} />
            Send WhatsApp RSVP Message
          </button>

          {!event.participants?.length && (
            <p
              style={{
                fontSize: "0.8rem",
                color: "#3a3a3a",
                marginTop: "1.25rem",
                fontStyle: "italic",
              }}
            >
              No participants found for this event
            </p>
          )}
        </div>
      </div>

      {/* ── AI calls popup (logic unchanged) ── */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              backdropFilter: "blur(8px)",
            }}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{
                background: "#111111",
                border: "1px solid #222222",
                borderRadius: "14px",
                padding: "2.5rem 3rem",
                textAlign: "center",
                boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
                maxWidth: "380px",
                width: "90%",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  border: "2px solid #222222",
                  borderTopColor: "#a3a3a3",
                  animation: "spin 0.9s linear infinite",
                  margin: "0 auto 1.25rem",
                }}
              />
              <h3
                style={{
                  fontSize: "1.05rem",
                  fontWeight: "600",
                  color: "#f5f5f5",
                  marginBottom: "0.5rem",
                }}
              >
                Starting AI Calls...
              </h3>
              <p
                style={{
                  color: "#525252",
                  fontSize: "0.85rem",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                Please wait while your event participants are being connected.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── WhatsApp toast (logic unchanged) ── */}
      {showWhatsAppPopup && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            background: "#111111",
            border: "1px solid #222222",
            color: "#a3a3a3",
            padding: "11px 16px",
            borderRadius: "8px",
            fontSize: "0.82rem",
            zIndex: 9999,
            boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
            maxWidth: "calc(100vw - 40px)",
          }}
        >
          {popupMessage}
        </div>
      )}

      {/* ── Template picker ── */}
      {showTemplatePicker && (
        <TemplatePickerModal
          eventId={eventId}
          participantCount={event.participants?.length}
          onClose={() => setShowTemplatePicker(false)}
          onSuccess={({ sent, failed, total }) => {
            console.log(`Sent ${sent}/${total}`);
            setShowTemplatePicker(false);
          }}
        />
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CallBatchPage;
