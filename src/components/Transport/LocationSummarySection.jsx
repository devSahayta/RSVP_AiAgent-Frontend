import React, { useState, useEffect } from "react";
import "./LocationSummarySection.css";

// ── Icons ────────────────────────────────────────────────────────────────────

const PlaneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21 4 19.5 2.5S18 2 16.5 3.5L13 7 4.8 5.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
  </svg>
);

const TrainIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="3" width="16" height="16" rx="2"/>
    <path d="M4 11h16"/><path d="M12 3v8"/>
    <path d="M8 19l-2 3"/><path d="M18 22l-2-3"/>
    <circle cx="8.5" cy="15.5" r="1.5"/><circle cx="15.5" cy="15.5" r="1.5"/>
  </svg>
);

const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

const ChevronIcon = ({ open }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{
      transform: open ? "rotate(180deg)" : "rotate(0deg)",
      transition: "transform 0.25s ease",
    }}
  >
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

// ── Helpers ──────────────────────────────────────────────────────────────────

function getLocationMeta(locationName) {
  const name = locationName.toLowerCase();
  if (name.includes("airport") || name.includes("terminal")) {
    return { icon: <PlaneIcon />, type: "airport" };
  }
  if (name.includes("railway") || name.includes("station") || name.includes("train")) {
    return { icon: <TrainIcon />, type: "railway" };
  }
  return { icon: <UsersIcon />, type: "default" };
}

function getInitials(name) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

// Convert UTC ISO string → IST display time  e.g. "3:10 PM"
function toIST(isoString) {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }).format(new Date(isoString));
}

// ── Single Location Card ─────────────────────────────────────────────────────
// Each card holds its OWN `expanded` state — no shared state, fully isolated.

function LocationCard({ location, index }) {
  const [expanded, setExpanded] = useState(false);

  const meta = getLocationMeta(location.location);
  const hasMore = location.passengers.length > 5;
  const visiblePassengers = expanded
    ? location.passengers
    : location.passengers.slice(0, 5);

  return (
    <div className="lss-card" style={{ animationDelay: `${index * 0.08}s` }}>

      {/* Header */}
      <div className="lss-card__header">
        <div className="lss-card__icon-wrap">
          {meta.icon}
        </div>
        <div className="lss-card__title-block">
          <h3 className="lss-card__title">{location.location}</h3>
          <span className="lss-card__time-range">
            <ClockIcon />
            {location.earliest_arrival_formatted} – {location.latest_arrival_formatted}
          </span>
        </div>
        <div className="lss-card__badge">
          <span className="lss-badge__count">{location.passenger_count}</span>
          <span className="lss-badge__label">members</span>
        </div>
      </div>

      <div className="lss-divider" />

      {/* Passenger list */}
      <ul className="lss-passenger-list">
        {visiblePassengers.map((p) => (
          <li key={p.phone} className="lss-passenger-item">
            <div className="lss-avatar">
              {getInitials(p.name)}
            </div>
            <div className="lss-passenger-info">
              <span className="lss-passenger-name">{p.name}</span>
              <span className="lss-passenger-arrival">
                Arrives {toIST(p.arrival_datetime)}
              </span>
            </div>
          </li>
        ))}
      </ul>

      {/* Expand / collapse — only rendered when there are > 5 passengers */}
      {hasMore && (
        <button
          className="lss-expand-btn"
          onClick={() => setExpanded((prev) => !prev)}
        >
          <ChevronIcon open={expanded} />
          {expanded ? "Show less" : `Show ${location.passengers.length - 5} more`}
        </button>
      )}
    </div>
  );
}

// ── Main export ──────────────────────────────────────────────────────────────

export default function LocationSummarySection({ eventId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!eventId) return;
    setLoading(true);
    fetch(`http://localhost:5000/api/transport/location-summary/${eventId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        if (json.success) setData(json.data);
        else throw new Error("API returned success: false");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [eventId]);

  if (loading) {
    return (
      <div className="lss-root">
        <div className="lss-header">
          <h2 className="lss-heading">Pickup Locations</h2>
        </div>
        <div className="lss-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="lss-skeleton-card">
              <div className="lss-skeleton lss-skeleton--title" />
              <div className="lss-skeleton lss-skeleton--line" />
              <div className="lss-skeleton lss-skeleton--line lss-skeleton--short" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lss-root">
        <div className="lss-error">⚠️ Failed to load location summary: {error}</div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="lss-root">
      <div className="lss-header">
        <div className="lss-header__left">
          <h2 className="lss-heading">Pickup Locations</h2>
          <p className="lss-subheading">
            {data.total_passengers} participants · {data.total_locations} locations
          </p>
        </div>
        <div className="lss-header__stats">
          <div className="lss-stat">
            <span className="lss-stat__num">{data.total_passengers}</span>
            <span className="lss-stat__label">Total Guests</span>
          </div>
          <div className="lss-stat-divider" />
          <div className="lss-stat">
            <span className="lss-stat__num">{data.total_locations}</span>
            <span className="lss-stat__label">Locations</span>
          </div>
        </div>
      </div>

      <div className="lss-grid">
        {data.locations.map((loc, i) => (
          <LocationCard
            key={`${loc.location}-${i}`}
            location={loc}
            index={i}
          />
        ))}
      </div>
    </div>
  );
}