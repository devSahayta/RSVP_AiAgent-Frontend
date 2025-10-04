import React, { useState, useEffect } from "react";
import { Document, Page } from "react-pdf";
import {
  Users,
  Phone,
  CheckCircle,
  XCircle,
  Upload,
  Calendar,
  Clock,
  Search,
  FileText,
} from "lucide-react";
import "../styles/table.css";
import { supabase } from "../config/supabaseClient"; // 🔥 Import supabase client
import { useParams, useNavigate } from "react-router-dom";

const RSVPTable = ({ eventId: propEventId }) => {
  const [rsvpData, setRsvpData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { eventId: paramEventId } = useParams();
  const eventId = propEventId || paramEventId;
  const navigate = useNavigate();


  useEffect(() => {
    fetchRSVPData();
  }, [eventId]);

  useEffect(() => {
    filterData();
  }, [rsvpData, searchTerm, statusFilter]);

  // 🔥 Fetch participants + conversations from Supabase
const fetchRSVPData = async () => {
  try {
    setIsLoading(true);

    // ✅ Step 1: Fetch all participants for this event
    const { data: participants, error: pError } = await supabase
      .from("participants")
      .select(`
        participant_id,
        full_name,
        phone_number,
        uploaded_at,
        event_id,
        events (
          event_name
        )
      `)
      .eq("event_id", eventId);

    if (pError) throw pError;

    if (!participants || participants.length === 0) {
      setRsvpData([]);
      return;
    }

    // ✅ Step 2: For each participant, fetch their latest conversation
    const results = await Promise.all(
      participants.map(async (p) => {
        // ✅ Fixed query syntax (order must be called before limit)
        const { data: conversation, error: convError } = await supabase
          .from("conversation_results")
          .select("rsvp_status, number_of_guests, last_updated, upload_id, notes")
          .eq("participant_id", p.participant_id)
          .order("last_updated", { ascending: false }) // ✅ Correct order syntax
          .limit(1);

        if (convError) {
          console.error(`Conversation fetch error for ${p.participant_id}:`, convError);
          return null;
        }

        const conv = conversation?.[0] || {};

        // ✅ Step 3: Fetch document upload (if any)
        const { data: uploads, error: uError } = await supabase
          .from("uploads")
          .select("document_url, document_type")
          .eq("participant_id", p.participant_id)
          .limit(1);

        if (uError) console.error(`Upload fetch error for ${p.participant_id}:`, uError);

        const doc = uploads?.[0] || null;

        return {
          id: p.participant_id,
          fullName: p.full_name || "N/A",
          phoneNumber: p.phone_number || "-",
          rsvpStatus: conv?.rsvp_status || "Maybe",
          numberOfGuests: conv?.number_of_guests || 0,
          // dietaryPreferences: conv?.dietary_preferences || "None",
          notes: conv?.notes || "-",
          proofUploaded: !!doc,
          documentUpload: doc
            ? [{ url: doc.document_url, filename: doc.document_type || "Document" }]
            : null,
          eventName: p.events?.event_name || "N/A",
          timestamp: conv?.last_updated || p.uploaded_at,
        };
      })
    );

    // ✅ Filter nulls and set data
    const filteredResults = results.filter((r) => r !== null);
    setRsvpData(filteredResults);

  } catch (error) {
    console.error("Error fetching RSVP data:", error);
  } finally {
    setIsLoading(false);
  }
};




  const filterData = () => {
    let filtered = rsvpData;

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.phoneNumber.includes(searchTerm) ||
          item.eventName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (item) =>
          item.rsvpStatus.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    setFilteredData(filtered);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Yes":
        return <CheckCircle size={16} className="status-icon confirmed" />;
      case "No":
        return <XCircle size={16} className="status-icon declined" />
      default:
        return <Clock size={16} className="status-icon pending" />;
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="table-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading RSVP data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="table-container">
      {/* Filters */}
      <div className="table-filters">
        <div className="search-container">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by name, phone, or event..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="status-filter"
        >
          <option value="all">All Status</option>
          <option value="Yes">Yes</option>
          <option value="Maybe">Maybe</option>
          <option value="No">No</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="rsvp-table">
          <thead>
  <tr>
    <th>Full Name</th>
    <th>Phone Number</th>
    <th>RSVP Status</th>
    <th>Guests</th>
    <th>Document Upload</th>
    <th>Event</th>
    <th>Date</th>
    <th>Notes</th> {/* ✅ Added */}
  </tr>
</thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={8} className="no-data">
                  No RSVP data found
                </td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="name-cell">
                      <Users size={16} />
                      {item.fullName}
                    </div>
                  </td>
                  <td>
                    <div className="phone-cell">
                      <Phone size={14} />
                      {item.phoneNumber}
                    </div>
                  </td>
                  <td>
                    <div
                      className={`status-cell ${item.rsvpStatus.toLowerCase()}`}
                    >
                      {getStatusIcon(item.rsvpStatus)}
                      {item.rsvpStatus}
                    </div>
                  </td>
                  <td className="guests-cell">{item.numberOfGuests}</td>
                  {/* <td>
                    <div className="proof-cell">
                      {item.proofUploaded ? (
                        <div className="proof-uploaded">
                          <Upload size={14} />
                          <span>Yes</span>
                        </div>
                      ) : (
                        <span className="proof-missing">No</span>
                      )}
                    </div>
                  </td> */}
                  <td>
  {item.proofUploaded ? (
    <button
      className="doc-link"
      onClick={() => navigate(`/document-viewer/${item.id}`)}
    >
      <FileText size={14} />
      View
    </button>
  ) : (
    <span className="no-doc">No file</span>
  )}
</td>

                  <td className="event-cell">{item.eventName}</td>
                  <td className="date-cell">
                    <Calendar size={14} />
                    {formatDate(item.timestamp)}
                  </td>

                   {/* ✅ Notes column display */}
        <td className="notes-cell">
          {item.notes && item.notes !== "-" ? (
            <span className="notes-text">{item.notes}</span>
          ) : (
            <span className="no-notes">—</span>
          )}
        </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Stats */}
      <div className="table-stats">
        <div className="stat-item">
          <span className="stat-label">Total RSVPs:</span>
          <span className="stat-value">{filteredData.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Yes:</span>
          <span className="stat-value confirmed">
            {filteredData.filter((item) => item.rsvpStatus === "Yes").length}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Maybe:</span>
          <span className="stat-value pending">
            {filteredData.filter((item) => item.rsvpStatus === "Maybe").length}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">No:</span>
          <span className="stat-value declined">
            {filteredData.filter((item) => item.rsvpStatus === "No").length}
          </span>
        </div>
        
      </div>

   {/* ✅ Retry Batch Call Button */}
      <div className="retry-batch-container">
        <button
          className="retry-batch-btn"
          onClick={async () => {
            try {
              const confirmRetry = window.confirm(
                "Do you want to retry the batch call for this event?"
              );
              if (!confirmRetry) return;

              const response = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/events/${eventId}/retry-batch`,
                { method: "POST" }
              );

              if (!response.ok) throw new Error("Retry batch call failed");

              alert("✅ Retry batch call started successfully!");
            } catch (error) {
              console.error("Error retrying batch call:", error);
              alert("❌ Failed to start retry batch call.");
            }
          }}
        >
           Retry Batch Call
        </button>
      </div>      
    </div>

    
  );
  
};

export default RSVPTable;
