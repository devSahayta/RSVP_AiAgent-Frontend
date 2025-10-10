import React, { useState, useEffect } from "react";
import {
  Users,
  Phone,
  CheckCircle,
  XCircle,
  Calendar,
  Clock,
  Search,
  FileText,
} from "lucide-react";
import "../styles/table.css";
import { supabase } from "../config/supabaseClient";
import { useParams, useNavigate } from "react-router-dom";

const RSVPTable = ({ eventId: propEventId }) => {
  const [rsvpData, setRsvpData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { eventId: paramEventId } = useParams();
  const eventId = propEventId || paramEventId;
  const navigate = useNavigate();

  // Fetch RSVP Data
  useEffect(() => {
    if (!eventId) return;
    fetchRSVPData();
    const interval = setInterval(fetchRSVPData, 60000); // auto refresh every 1 min
    return () => clearInterval(interval);
  }, [eventId]);

  // Filter data whenever filters change
  useEffect(() => {
    filterData();
    setCurrentPage(1); // reset to first page on search/filter
  }, [rsvpData, searchTerm, statusFilter]);

  const fetchRSVPData = async () => {
    try {
      setIsLoading(true);
      const { data: participants, error: pError } = await supabase
        .from("participants")
        .select(
          `participant_id, full_name, phone_number, uploaded_at, event_id, events (event_name)`
        )
        .eq("event_id", eventId);

      if (pError) throw pError;
      if (!participants?.length) {
        setRsvpData([]);
        return;
      }

      const results = await Promise.all(
        participants.map(async (p) => {
          const { data: conversation } = await supabase
            .from("conversation_results")
            .select(
              "rsvp_status, number_of_guests, last_updated, upload_id, notes, call_status"
            )
            .eq("participant_id", p.participant_id)
            .order("last_updated", { ascending: false })
            .limit(1);

          const conv = conversation?.[0] || {};

          const { data: uploads } = await supabase
            .from("uploads")
            .select("document_url, document_type")
            .eq("participant_id", p.participant_id)
            .limit(1);

          const doc = uploads?.[0] || null;

          return {
            id: p.participant_id,
            fullName: p.full_name || "N/A",
            phoneNumber: p.phone_number || "-",
            rsvpStatus: conv?.rsvp_status || "Maybe",
            numberOfGuests: conv?.number_of_guests || 0,
            notes: conv?.notes || "-",
            callStatus: conv?.call_status || "pending",
            proofUploaded: !!doc,
            documentUpload: doc
              ? [{ url: doc.document_url, filename: doc.document_type || "Document" }]
              : null,
            eventName: p.events?.event_name || "N/A",
            timestamp: conv?.last_updated || p.uploaded_at,
          };
        })
      );

      setRsvpData(results.filter(Boolean));
    } catch (err) {
      console.error("Error fetching RSVP data:", err);
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
        (item) => item.rsvpStatus.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    setFilteredData(filtered);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Yes":
        return <CheckCircle size={16} className="status-icon confirmed" />;
      case "No":
        return <XCircle size={16} className="status-icon declined" />;
      default:
        return <Clock size={16} className="status-icon pending" />;
    }
  };

  const formatDate = (timestamp) =>
    new Date(timestamp).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Kolkata",
    });

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
              <th>Phone</th>
              <th>RSVP</th>
              <th>Guests</th>
              <th>Document</th>
              <th>Event</th>
              <th>Date</th>
              <th>Notes</th>
              <th>Call Status</th>
            </tr>
          </thead>
          <tbody>
            {currentData.length === 0 ? (
              <tr>
                <td colSpan={9} className="no-data">
                  No RSVP data found
                </td>
              </tr>
            ) : (
              currentData.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="name-cell">
                      <Users size={16} /> {item.fullName}
                    </div>
                  </td>
                  <td>
                    <div className="phone-cell">
                      <Phone size={14} /> {item.phoneNumber}
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
                  <td>{item.numberOfGuests}</td>
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
                  <td>{item.eventName}</td>
                  <td>
                    <Calendar size={14} />
                    {formatDate(item.timestamp)}
                  </td>
                  <td>{item.notes || "—"}</td>
                  <td className={`call-status-cell ${item.callStatus?.toLowerCase()}`}>
                    {item.callStatus || "pending"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          className="pagination"
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            gap: "8px",
            marginTop: "20px",
          }}
        >
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            ◀ Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`pagination-btn ${
                currentPage === page ? "active" : ""
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next ▶
          </button>
        </div>
      )}

      {/* Pagination Styling */}
      <style>{`
        .pagination-btn {
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          padding: 6px 12px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .pagination-btn:hover {
          background: #f3f4f6;
        }
        .pagination-btn.active {
          background: #000;
          color: white;
          border-color: #000;
        }
        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 600px) {
          .pagination-btn {
            font-size: 12px;
            padding: 5px 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default RSVPTable;
