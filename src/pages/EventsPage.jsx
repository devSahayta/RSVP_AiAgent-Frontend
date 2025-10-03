// pages/EventsPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, Users, ArrowRight } from "lucide-react";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react"; // ✅ import auth
import "../styles/pages.css";
import "../styles/events.css";

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useKindeAuth();

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      fetchEvents(user.id); // ✅ pass Kinde user.id
    }
  }, [authLoading, isAuthenticated, user]);

  const fetchEvents = async (userId) => {
    try {
      const response = await fetch(
        `https://rsvp-aiagent-backend.onrender.com/api/events?user_id=${userId}`
      );

      if (!response.ok) throw new Error("Failed to fetch events");

      const data = await response.json();
      console.log("✅ Events fetched:", data);
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔑 Navigate to Call Batch page instead of dashboard
  const handleEventClick = (eventId) => {
    navigate(`/call-batch/${eventId}`);
  };


  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
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
      <div className="page-header">
        <h1 className="page-title">My Events</h1>
        <p className="page-subtitle">Manage and view all your RSVP events</p>
      </div>

      {events.length === 0 ? (
        <div className="no-events">
          <Calendar size={48} />
          <h3>No Events Found</h3>
          <p>You haven’t created any events yet. Start by creating your first event!</p>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/createEvent")}
          >
            Create Your First Event
          </button>
        </div>
      ) : (
        <div className="events-grid">
          {events.map((event) => {
            const { date, time } = formatDate(event.event_date);
            return (
              <div
                key={event.event_id}
                className="event-card"
                onClick={() => handleEventClick(event.event_id)} // ✅ pass backend event_id
              >
                <div className="event-card-header">
                  <h3 className="event-name">{event.event_name}</h3>
                  <ArrowRight size={20} className="event-arrow" />
                </div>

                <div className="event-details">
                  <div className="event-date">
                    <Calendar size={16} />
                    <span>{date}</span>
                  </div>
                  {/* <div className="event-time">
                    <Clock size={16} />
                    <span>{time}</span>
                  </div> */}
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
