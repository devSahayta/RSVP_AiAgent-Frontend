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

import { useParams, useNavigate } from "react-router-dom";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";


const RSVPTable = ({ eventId: propEventId }) => {
  const [rsvpData, setRsvpData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { eventId: paramEventId } = useParams();
  const eventId = propEventId || paramEventId;
  const navigate = useNavigate();
  const [batchStatus, setBatchStatus] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [showStatusPopup, setShowStatusPopup] = useState(false);
  const [retryStatus, setRetryStatus] = useState({ success: false, message: '' });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
const { getToken } = useKindeAuth();
  useEffect(() => {
    if (!eventId) return;

    const autoSync = async () => {
      try {
        await fetchRSVPData();

        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/events/${eventId}/sync-batch-status`, {
          method: "POST",
        });

        if (res.ok) {
          const data = await res.json();
          console.log(`✅ Auto-synced ${data.updated}/${data.total} participants`);
          await fetchRSVPData();
        } else {
          console.warn("⚠️ Sync batch status failed");
        }
      } catch (err) {
        console.error("Auto-sync error:", err);
      }
    };

    autoSync();

    const interval = setInterval(() => {
      autoSync();
    }, 60000);

    return () => clearInterval(interval);
  }, [eventId]);

  useEffect(() => {
    filterData();
  }, [rsvpData, searchTerm, statusFilter]);

  const fetchRSVPData = async () => {
  try {
    setIsLoading(true);

    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/events/${eventId}/rsvp-data`);
    const data = await res.json();

    setRsvpData(data);
  } catch (err) {
    console.error("Error fetching backend RSVP data:", err);
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
    setCurrentPage(1);
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
    if (!timestamp) return "—";
    const utcDate = new Date(timestamp + "Z");
    return utcDate.toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
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
              <th>Notes</th>
              <th>Call Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={9} className="no-data">
                  No RSVP data found
                </td>
              </tr>
            ) : (
              paginatedData.map((item) => (
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
                    <div className={`status-cell ${item.rsvpStatus.toLowerCase()}`}>
                      {getStatusIcon(item.rsvpStatus)}
                      {item.rsvpStatus}
                    </div>
                  </td>
                  <td className="guests-cell">{item.numberOfGuests}</td>
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
                  <td className="event-cell" title={item.event_name}>
  {item.event_name}
</td>

                  <td className="date-cell">
                    <Calendar size={14} />
                    {formatDate(item.timestamp)}
                  </td>
                  <td className="notes-cell">
                    {item.notes && item.notes !== "-" ? (
                      <div className="notes-text" title={item.notes}>
                        {item.notes}
                      </div>
                    ) : (
                      <span className="no-notes">—</span>
                    )}
                  </td>
                  <td>
                    <span className={`call-status-cell ${item.callStatus?.toLowerCase()}`}>
                      {item.callStatus ? item.callStatus : "pending"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination-container">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Previous
          </button>
          <div className="pagination-numbers">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={`page-number ${currentPage === i + 1 ? "active" : ""}`}
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}

      <style>{`
        .pagination-container {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 20px;
        }
        .pagination-btn {
          padding: 8px 14px;
          border-radius: 8px;
          border: 1px solid #ddd;
          background: #fff;
          font-size: 14px;
          cursor: pointer;
          transition: 0.2s;
        }
        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .pagination-btn:hover:not(:disabled) {
          background: #f5f5f5;
        }
        .pagination-numbers {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .page-number {
          padding: 8px 12px;
          border-radius: 6px;
          border: 1px solid #ddd;
          background: #fff;
          font-size: 14px;
          cursor: pointer;
        }
        .page-number.active {
          background: #000;
          color: #fff;
          border-color: #000;
        }
        @media (max-width: 600px) {
          .pagination-container {
            gap: 6px;
          }
          .pagination-btn, .page-number {
            padding: 6px 10px;
            font-size: 12px;
          }
        }
      `}</style>

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

      {/* Retry Batch Call Button */}
      <div className="retry-batch-container" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        marginTop: '24px',
        padding: '0 16px',
      }}>
        <button
          className="retry-batch-btn"
          disabled={filteredData.length > 0 && filteredData.every(item => item.callStatus === "completed")}
          style={{
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#fff',
            backgroundColor: filteredData.length > 0 && filteredData.every(item => item.callStatus === "completed") 
              ? '#9ca3af' 
              : '#000000',
            border: 'none',
            borderRadius: '8px',
            cursor: filteredData.length > 0 && filteredData.every(item => item.callStatus === "completed") 
              ? 'not-allowed' 
              : 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: filteredData.length > 0 && filteredData.every(item => item.callStatus === "completed")
              ? 'none'
              : '0 2px 8px rgba(0, 0, 0, 0.2)',
            width: '100%',
            maxWidth: '300px',
            opacity: filteredData.length > 0 && filteredData.every(item => item.callStatus === "completed") ? 0.6 : 1,
          }}
          onMouseEnter={(e) => {
            if (!(filteredData.length > 0 && filteredData.every(item => item.callStatus === "completed"))) {
              e.target.style.backgroundColor = '#1a1a1a';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
            }
          }}
          onMouseLeave={(e) => {
            if (!(filteredData.length > 0 && filteredData.every(item => item.callStatus === "completed"))) {
              e.target.style.backgroundColor = '#000000';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
            }
          }}
          onClick={() => setShowConfirmModal(true)}
        >
          Retry Batch Call
        </button>

        <p className="retry-hint" style={{
          marginTop: '8px',
          fontSize: '13px',
          color: filteredData.length > 0 && filteredData.every(item => item.callStatus === "completed")
            ? '#10b981'
            : '#f59e0b',
          fontWeight: '500',
          textAlign: 'center',
          width: '100%',
          maxWidth: '300px',
        }}>
          {filteredData.length > 0 && filteredData.every(item => item.callStatus === "completed")
            ? "✅ All participants completed — retry not needed."
            : filteredData.length > 0 
              ? `⚠️ ${filteredData.filter(item => item.callStatus !== "completed").length} call(s) pending - Retry available`
              : ""}
        </p>
{/* Start Batch Message Button */}
<button
  className="retry-batch-btn"
  disabled={
    filteredData.length === 0 ||
    filteredData.filter(item => !item.rsvpStatus || item.rsvpStatus === null).length === 0
  }
  style={{
    padding: "12px 24px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#fff",
    backgroundColor:
      filteredData.length === 0 ||
      filteredData.filter(item => !item.rsvpStatus || item.rsvpStatus === null).length === 0
        ? "#9ca3af"
        : "#000000",
    border: "none",
    borderRadius: "8px",
    cursor:
      filteredData.length === 0 ||
      filteredData.filter(item => !item.rsvpStatus || item.rsvpStatus === null).length === 0
        ? "not-allowed"
        : "pointer",
    transition: "all 0.3s ease",
    boxShadow:
      filteredData.length === 0 ||
      filteredData.filter(item => !item.rsvpStatus || item.rsvpStatus === null).length === 0
        ? "none"
        : "0 2px 8px rgba(0, 0, 0, 0.2)",
    width: "100%",
    maxWidth: "300px",
    opacity:
      filteredData.length === 0 ||
      filteredData.filter(item => !item.rsvpStatus || item.rsvpStatus === null).length === 0
        ? 0.6
        : 1,
  }}
  onMouseEnter={(e) => {
    if (
      !(
        filteredData.length === 0 ||
        filteredData.filter(item => !item.rsvpStatus || item.rsvpStatus === null).length === 0
      )
    ) {
      e.target.style.backgroundColor = "#1a1a1a";
      e.target.style.transform = "translateY(-2px)";
      e.target.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.3)";
    }
  }}
  onMouseLeave={(e) => {
    if (
      !(
        filteredData.length === 0 ||
        filteredData.filter(item => !item.rsvpStatus || item.rsvpStatus === null).length === 0
      )
    ) {
      e.target.style.backgroundColor = "#000000";
      e.target.style.transform = "translateY(0)";
      e.target.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.2)";
    }
  }}
  onClick={async () => {
    try {
      console.log("🎯 Starting batch message process...");
      console.log("📊 Filtered data sample:", filteredData[0]);
      console.log("📊 Total filtered data:", filteredData.length);

      // Get only participants with NULL rsvpStatus
      const pendingParticipants = filteredData.filter(
        item => !item.rsvpStatus || item.rsvpStatus === null
      );
      
      console.log(`📊 Found ${pendingParticipants.length} participants with NULL RSVP status`);
      console.log("📊 Pending participants:", pendingParticipants);

      const token = await getToken();
      console.log("🔑 Got Kinde token:", token ? "✅ Yes" : "❌ No");

      if (!token) throw new Error("No Kinde token found");

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/whatsapp/send-batch`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ event_id: eventId }),
        }
      );

      if (!response.ok) throw new Error("Batch messaging failed");

      console.log("✅ Batch message request sent successfully!");

      setRetryStatus({
        success: true,
        message: `✅ Sending messages to ${pendingParticipants.length} participant(s)!`,
      });
      setShowStatusPopup(true);
      await fetchRSVPData();

      setTimeout(() => setShowStatusPopup(false), 3000);
    } catch (err) {
      console.error("❌ Message batch error:", err);
      setRetryStatus({
        success: false,
        message: "❌ Failed to send batch messages.",
      });
      setShowStatusPopup(true);
      setTimeout(() => setShowStatusPopup(false), 4000);
    }
  }}
>
  Start Batch Message
</button>

{/* Optional hint below */}
<p
  className="retry-hint"
  style={{
    marginTop: "8px",
    fontSize: "13px",
    color:
      filteredData.length === 0 ||
      filteredData.filter(item => !item.rsvpStatus || item.rsvpStatus === null).length === 0
        ? "#10b981"
        : "#f59e0b",
    fontWeight: "500",
    textAlign: "center",
    width: "100%",
    maxWidth: "300px",
  }}
>
  {filteredData.length === 0
    ? ""
    : filteredData.filter(item => !item.rsvpStatus || item.rsvpStatus === null).length === 0
    ? "✅ All participants have responded — messages not needed."
    : `⚠️ ${filteredData.filter(item => !item.rsvpStatus || item.rsvpStatus === null).length} participant(s) haven't responded - Start available`}
</p>


        
      </div>

 


      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px',
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '400px',
            width: '100%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#000',
              marginBottom: '12px',
            }}>
              Retry Batch Call?
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              lineHeight: '1.5',
              marginBottom: '24px',
            }}>
              This will retry calls for {filteredData.filter(item => item.callStatus !== "completed").length} participant(s) who haven't completed their calls yet.
            </p>
            <div style={{
              display: 'flex',
              gap: '12px',
              flexDirection: window.innerWidth < 400 ? 'column' : 'row',
            }}>
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={isRetrying}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  cursor: isRetrying ? 'not-allowed' : 'pointer',
                  opacity: isRetrying ? 0.5 : 1,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isRetrying) {
                    e.target.style.backgroundColor = '#f9fafb';
                    e.target.style.borderColor = '#d1d5db';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isRetrying) {
                    e.target.style.backgroundColor = 'white';
                    e.target.style.borderColor = '#e5e7eb';
                  }
                }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    setIsRetrying(true);
                    const response = await fetch(
                      `${import.meta.env.VITE_BACKEND_URL}/api/events/${eventId}/retry-batch`,
                      { method: "POST" }
                    );

                    if (!response.ok) throw new Error("Retry batch call failed");

                    setShowConfirmModal(false);
                    setRetryStatus({ 
                      success: true, 
                      message: '✅ Retry batch call started successfully!' 
                    });
                    setShowStatusPopup(true);
                    await fetchRSVPData();
                    
                    setTimeout(() => setShowStatusPopup(false), 3000);
                  } catch (error) {
                    console.error("Error retrying batch call:", error);
                    setShowConfirmModal(false);
                    setRetryStatus({ 
                      success: false, 
                      message: '❌ Failed to start retry batch call.' 
                    });
                    setShowStatusPopup(true);
                    
                    setTimeout(() => setShowStatusPopup(false), 4000);
                  } finally {
                    setIsRetrying(false);
                  }
                }}
                disabled={isRetrying}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'white',
                  backgroundColor: isRetrying ? '#9ca3af' : '#000',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isRetrying ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isRetrying) {
                    e.target.style.backgroundColor = '#1a1a1a';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isRetrying) {
                    e.target.style.backgroundColor = '#000';
                  }
                }}
              >
                {isRetrying ? 'Retrying...' : 'Confirm Retry'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Popup (Toast) */}
      {showStatusPopup && (
        <div style={{
          position: 'fixed',
          top: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1001,
          animation: 'slideDown 0.3s ease-out',
        }}>
          <div style={{
            backgroundColor: retryStatus.success ? '#000' : '#dc2626',
            color: 'white',
            padding: '16px 24px',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            minWidth: '320px',
            maxWidth: '90vw',
          }}>
            <span style={{
              fontSize: '14px',
              fontWeight: '600',
              flex: 1,
            }}>
              {retryStatus.message}
            </span>
            <button
              onClick={() => setShowStatusPopup(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '18px',
                padding: '0',
                lineHeight: '1',
                opacity: 0.8,
              }}
              onMouseEnter={(e) => e.target.style.opacity = '1'}
              onMouseLeave={(e) => e.target.style.opacity = '0.8'}
            >
              ×
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default RSVPTable;