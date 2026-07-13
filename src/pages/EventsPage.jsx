// pages/EventsPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Users,
  ArrowRight,
  ArrowUpDown,
  MoreVertical,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
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
    margin-bottom: 28px;
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
    gap: 6px;
    background: linear-gradient(135deg, #7c3aed 0%, #4338ca 100%);
    color: #fff;
    padding: 9px 16px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 10px;
    font-size: 0.84rem;
    font-weight: 600;
    cursor: pointer;
    flex-shrink: 0;
    box-shadow: 0 2px 10px rgba(76, 29, 149, 0.32), inset 0 1px 0 rgba(255,255,255,0.14);
    transition: transform 0.16s ease, box-shadow 0.16s ease, background 0.16s ease, border-color 0.16s ease;
    letter-spacing: 0.01em;
    white-space: nowrap;
    box-sizing: border-box;
  }
  .ep-create-btn:hover {
    background: linear-gradient(135deg, #8654f0 0%, #4c3fd6 100%);
    border-color: rgba(255, 255, 255, 0.22);
    box-shadow: 0 6px 18px rgba(76, 29, 149, 0.42), inset 0 1px 0 rgba(255,255,255,0.18);
    transform: translateY(-1px);
  }
  .ep-create-btn:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(76, 29, 149, 0.32);
  }
  .ep-create-btn:focus-visible {
    outline: 2px solid #a78bfa;
    outline-offset: 2px;
  }
  .ep-create-btn svg { flex-shrink: 0; }

  .ep-empty-create-btn {
    all: unset;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    background: linear-gradient(135deg, #7c3aed 0%, #4338ca 100%);
    color: #fff;
    padding: 11px 20px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 10px;
    font-size: 0.88rem;
    font-weight: 650;
    cursor: pointer;
    box-shadow: 0 4px 16px rgba(76, 29, 149, 0.38), inset 0 1px 0 rgba(255,255,255,0.14);
    transition: transform 0.16s ease, box-shadow 0.16s ease, background 0.16s ease, border-color 0.16s ease;
    box-sizing: border-box;
  }
  .ep-empty-create-btn:hover {
    background: linear-gradient(135deg, #8654f0 0%, #4c3fd6 100%);
    border-color: rgba(255, 255, 255, 0.22);
    box-shadow: 0 8px 22px rgba(76, 29, 149, 0.48), inset 0 1px 0 rgba(255,255,255,0.18);
    transform: translateY(-2px);
  }
  .ep-empty-create-btn:focus-visible {
    outline: 2px solid #a78bfa;
    outline-offset: 2px;
  }

  /* ── Tablet ── */
  @media (max-width: 768px) {
    .ep-header { margin-bottom: 22px; padding-bottom: 20px; }
  }

  /* ── Mobile ── */
  @media (max-width: 640px) {
    .page-container { padding-left: 16px; padding-right: 16px; }
    .ep-header {
      flex-direction: column;
      align-items: stretch;
      gap: 14px;
      margin-bottom: 20px;
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
      padding: 12px 18px;
      font-size: 0.86rem;
      border-radius: 10px;
    }
  }

  @media (max-width: 360px) {
    .ep-title { font-size: 1.2rem; }
    .ep-count-badge { font-size: 0.65rem; padding: 2px 8px; }
  }
`;

// Maps a free-text status string onto one of a small set of visual variants.
const getStatusVariant = (status) => {
  if (!status) return "neutral";
  const s = status.toLowerCase();
  if (/(complete|done|finished|closed|sent)/.test(s)) return "success";
  if (/(progress|active|ongoing|processing|sending)/.test(s)) return "info";
  if (/(pending|waiting|scheduled|queued|draft|not started)/.test(s))
    return "warning";
  if (/(fail|error|cancel|declined)/.test(s)) return "danger";
  return "neutral";
};

// Breaks a date down into the pieces the calendar-style date block needs.
const getDateParts = (dateString) => {
  if (!dateString) {
    return { month: "—", day: "–", subtext: "No date set", isPast: false };
  }
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return { month: "—", day: "–", subtext: "No date set", isPast: false };
  }

  const month = date
    .toLocaleDateString("en-US", { month: "short" })
    .toUpperCase();
  const day = date.toLocaleDateString("en-US", { day: "numeric" });
  const subtext = date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);

  return { month, day, subtext, isPast: compareDate < today };
};

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState(null);
  const [deletingEventId, setDeletingEventId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortUpcomingFirst, setSortUpcomingFirst] = useState(false);

  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useKindeAuth();

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      fetchEvents(user.id);
    }
  }, [authLoading, isAuthenticated, user]);

  // Close any open card menu on an outside click. Clicks inside a menu
  // stop propagation before they reach here (see the menu wrapper below).
  useEffect(() => {
    const closeMenu = () => setOpenMenu(null);
    document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, []);

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
      setDeletingEventId(eventId);
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
      setDeletingEventId(null);
    }
  };

  const handleEventClick = (eventId) => {
    navigate(`/dashboard/${eventId}`);
  };

  const handleCardKeyDown = (e, eventId) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleEventClick(eventId);
    }
  };

  const visibleEvents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const filtered = query
      ? events.filter((event) =>
          (event.event_name || "").toLowerCase().includes(query),
        )
      : events;

    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.event_date).getTime() || 0;
      const dateB = new Date(b.event_date).getTime() || 0;
      return sortUpcomingFirst ? dateA - dateB : dateB - dateA;
    });
  }, [events, searchQuery, sortUpcomingFirst]);

  if (authLoading || isLoading) {
    return (
      <div className="page-container">
        <style>{css}</style>
        <div className="ep-header">
          <div className="ep-header-text">
            <div className="ep-title-row">
              <h1 className="ep-title">My Events</h1>
            </div>
            <p className="ep-subtitle">Manage and view all your RSVP events</p>
          </div>
        </div>
        <div className="events-grid" aria-hidden="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <div className="event-skeleton-card" key={i}>
              <div className="ev-skel-row">
                <div className="ev-skel-line ev-skel-date" />
                <div style={{ flex: 1 }}>
                  <div
                    className="ev-skel-line"
                    style={{ width: "80%", height: 16, marginBottom: 8 }}
                  />
                  <div
                    className="ev-skel-line"
                    style={{ width: "50%", height: 12 }}
                  />
                </div>
              </div>
              <div style={{ flex: 1 }} />
              <div
                className="ev-skel-line"
                style={{ width: "100%", height: 1 }}
              />
              <div
                className="ev-skel-line"
                style={{ width: "40%", height: 12, marginTop: 10 }}
              />
            </div>
          ))}
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
            <Plus size={16} strokeWidth={2.5} />
            Create Event
          </button>
        )}
      </div>

      {events.length === 0 ? (
        <div className="no-events">
          <div className="no-events-icon-wrap">
            <Calendar size={30} />
          </div>
          <h3>No events yet</h3>
          <p>Create your first event to start collecting RSVPs.</p>
          <button
            className="ep-empty-create-btn"
            onClick={() => navigate("/createEvent")}
          >
            <Plus size={17} strokeWidth={2.6} />
            Create Your First Event
          </button>
        </div>
      ) : (
        <>
          {/* ── Toolbar ── */}
          <div className="events-toolbar">
            <div className="search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search events by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search events"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <button
              type="button"
              className="ev-sort-btn"
              onClick={() => setSortUpcomingFirst((prev) => !prev)}
            >
              <ArrowUpDown size={14} />
              {sortUpcomingFirst ? "Upcoming first" : "Latest first"}
            </button>
          </div>

          {visibleEvents.length === 0 ? (
            <div className="events-empty-search">
              No events match &ldquo;{searchQuery}&rdquo;.
            </div>
          ) : (
            <div className="events-grid">
              {visibleEvents.map((event) => {
                const { month, day, subtext, isPast } = getDateParts(
                  event.event_date,
                );
                const statusVariant = getStatusVariant(event.status);
                const isMenuOpen = openMenu === event.event_id;
                const isDeletingThisEvent = deletingEventId === event.event_id;

                return (
                  <div
                    key={event.event_id}
                    className={`event-card${isPast ? " is-past" : ""}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleEventClick(event.event_id)}
                    onKeyDown={(e) => handleCardKeyDown(e, event.event_id)}
                  >
                    <div className="event-card-top">
                      <div className="event-date-block">
                        <span className="edb-month">{month}</span>
                        <span className="edb-day">{day}</span>
                      </div>

                      <div className="event-card-info">
                        <h3 className="event-name" title={event.event_name}>
                          {event.event_name}
                        </h3>
                        <p className="event-subtext">{subtext}</p>
                      </div>

                      <div
                        className="event-menu"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          className="event-menu-icon-btn"
                          aria-haspopup="true"
                          aria-expanded={isMenuOpen}
                          aria-label="Event actions"
                          onClick={() =>
                            setOpenMenu(isMenuOpen ? null : event.event_id)
                          }
                        >
                          <MoreVertical size={18} />
                        </button>
                        {isMenuOpen && (
                          <div className="event-menu-dropdown show-menu">
                            <button
                              type="button"
                              className="event-menu-item delete"
                              disabled={isDeletingThisEvent}
                              onClick={() => deleteEvent(event.event_id)}
                            >
                              <Trash2 size={14} />
                              {isDeletingThisEvent ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {(event.status || isPast) && (
                      <div className="event-details">
                        {event.status && (
                          <span
                            className={`event-status-badge ${statusVariant}`}
                          >
                            <span className="dot" />
                            {event.status}
                          </span>
                        )}
                        {isPast && (
                          <span className="event-status-badge neutral">
                            <span className="dot" />
                            Past
                          </span>
                        )}
                      </div>
                    )}

                    <div className="event-card-footer">
                      <div className="event-stats">
                        <Users size={16} />
                        <span>View RSVPs</span>
                      </div>
                      <ArrowRight size={18} className="event-arrow" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EventsPage;
