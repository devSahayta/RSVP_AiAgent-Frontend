// pages/EventsPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Users, ArrowRight, MoreVertical, Plus } from "lucide-react";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import "../styles/pages.css";
import "../styles/events.css";
import {
  dismissToast,
  showError,
  showLoading,
  showSuccess,
} from "../utils/toast";

const css = `
  .ep-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    flex-wrap: wrap;
    margin-bottom: 32px;
    padding-bottom: 24px;
    border-bottom: 1px solid #1e1e1e;
  }
  .ep-header-text { min-width: 0; }
  .ep-title-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 4px;
    flex-wrap: wrap;
  }
  .ep-title {
    font-size: 1.75rem;
    font-weight: 700;
    color: #f3f4f6;
    margin: 0;
    letter-spacing: -0.02em;
    line-height: 1.2;
  }
  .ep-count-badge {
    background: #1a1a2e;
    border: 1px solid #2a2a4a;
    color: #93c5fd;
    font-size: 0.72rem;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 20px;
    letter-spacing: 0.02em;
    flex-shrink: 0;
  }
  .ep-subtitle {
    font-size: 0.9rem;
    color: #6b7280;
    margin: 0;
  }
  .ep-create-btn {
    all: unset;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #2563eb 100%);
    color: #fff;
    padding: 13px 24px;
    border-radius: 12px;
    font-size: 0.92rem;
    font-weight: 700;
    cursor: pointer;
    flex-shrink: 0;
    box-shadow: 0 4px 20px rgba(124, 58, 237, 0.35), inset 0 1px 0 rgba(255,255,255,0.15);
    transition: all 0.2s ease;
    letter-spacing: 0.01em;
    white-space: nowrap;
    box-sizing: border-box;
  }
  .ep-create-btn:hover {
    background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #3b82f6 100%);
    box-shadow: 0 6px 28px rgba(124, 58, 237, 0.5), inset 0 1px 0 rgba(255,255,255,0.2);
    transform: translateY(-2px);
  }
  .ep-create-btn:active {
    transform: translateY(0);
    box-shadow: 0 3px 12px rgba(124, 58, 237, 0.4);
  }
  .ep-create-btn svg { flex-shrink: 0; }

  .ep-empty-create-btn {
    all: unset;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #2563eb 100%);
    color: #fff;
    padding: 14px 28px;
    border-radius: 12px;
    font-size: 0.95rem;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(124, 58, 237, 0.35);
    transition: all 0.2s ease;
    margin-top: 8px;
    box-sizing: border-box;
  }
  .ep-empty-create-btn:hover {
    background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #3b82f6 100%);
    box-shadow: 0 6px 28px rgba(124, 58, 237, 0.5);
    transform: translateY(-2px);
  }

  /* ── Tablet ── */
  @media (max-width: 768px) {
    .ep-header { margin-bottom: 26px; padding-bottom: 20px; }
  }

  /* ── Mobile ── */
  @media (max-width: 640px) {
    .page-container { padding-left: 16px; padding-right: 16px; }
    .ep-header {
      flex-direction: column;
      align-items: stretch;
      gap: 14px;
      margin-bottom: 22px;
      padding-bottom: 18px;
    }
    .ep-header-text { text-align: left; }
    .ep-title-row {
      justify-content: space-between;
    }
    .ep-title { font-size: 1.35rem; }
    .ep-subtitle { font-size: 0.82rem; }
    .ep-create-btn {
      width: 100%;
      padding: 14px 20px;
      font-size: 0.9rem;
      border-radius: 10px;
    }
  }

  @media (max-width: 360px) {
    .ep-title { font-size: 1.2rem; }
    .ep-count-badge { font-size: 0.65rem; padding: 2px 8px; }
  }
`;

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState(null);
  const [isDeletingEvent, setIsDeletingEvent] = useState(false);

  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useKindeAuth();

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      fetchEvents(user.id);
    }
  }, [authLoading, isAuthenticated, user]);

  const fetchEvents = async (userId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/events?user_id=${userId}`,
      );
      if (!response.ok) throw new Error("Failed to fetch events");
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEvent = async (eventId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this event and all related data?",
    );
    if (!confirmDelete) return;

    try {
      setIsDeletingEvent(true);
      const toastId = showLoading("Deleting Event...");

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/events/${eventId}`,
        { method: "DELETE" },
      );
      const data = await response.json();

      if (!response.ok) {
        showError(data.error || "Failed to delete event");
        return;
      }

      setEvents(events.filter((event) => event.event_id !== eventId));
      dismissToast(toastId);
      showSuccess("Event deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      showError("Something went wrong while deleting the event.");
    } finally {
      setIsDeletingEvent(false);
    }
  };

  const handleEventClick = (eventId) => {
    navigate(`/dashboard/${eventId}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    };
  };

  if (authLoading || isLoading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading your events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <style>{css}</style>

      {/* ── Header ── */}
      <div className="ep-header">
        <div className="ep-header-text">
          <div className="ep-title-row">
            <h1 className="ep-title">My Events</h1>
            {events.length > 0 && (
              <span className="ep-count-badge">
                {events.length} {events.length === 1 ? "event" : "events"}
              </span>
            )}
          </div>
          <p className="ep-subtitle">Manage and view all your RSVP events</p>
        </div>

        {events.length > 0 && (
          <button
            className="ep-create-btn"
            onClick={() => navigate("/createEvent")}
          >
            <Plus size={18} strokeWidth={2.75} />
            Create Event
          </button>
        )}
      </div>

      {events.length === 0 ? (
        <div className="no-events">
          <Calendar size={48} />
          <h3>No Events Found</h3>
          <p>You haven't created any events yet.</p>
          <button
            className="ep-empty-create-btn"
            onClick={() => navigate("/createEvent")}
          >
            <Plus size={18} strokeWidth={2.75} />
            Create Your First Event
          </button>
        </div>
      ) : (
        <div className="events-grid">
          {events.map((event) => {
            const { date } = formatDate(event.event_date);
            return (
              <div
                key={event.event_id}
                className="event-card"
                onClick={() => handleEventClick(event.event_id)}
              >
                <div
                  className="event-menu"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical
                    size={22}
                    className="event-menu-icon"
                    onClick={() =>
                      setOpenMenu(
                        openMenu === event.event_id ? null : event.event_id,
                      )
                    }
                  />
                  {openMenu === event.event_id && (
                    <div className="event-menu-dropdown show-menu">
                      <div
                        className="event-menu-item delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteEvent(event.event_id);
                        }}
                      >
                        {isDeletingEvent ? "Deleting..." : "Delete"}
                      </div>
                    </div>
                  )}
                </div>

                <div className="event-card-header">
                  <h3 className="event-name">{event.event_name}</h3>
                  <ArrowRight size={20} className="event-arrow" />
                </div>

                <div className="event-details">
                  <div className="event-date">
                    <Calendar size={16} />
                    <span>{date}</span>
                  </div>
                </div>

                <p className="event-description">
                  {event.status || "No status available"}
                </p>

                <div className="event-card-footer">
                  <div className="event-stats">
                    <Users size={16} />
                    <span>View RSVPs</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EventsPage;
