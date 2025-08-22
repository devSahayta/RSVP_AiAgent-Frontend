import React, { useState, useEffect } from "react";
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

const RSVPTable = () => {
  const [rsvpData, setRsvpData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchRSVPData();
  }, []);

  useEffect(() => {
    filterData();
  }, [rsvpData, searchTerm, statusFilter]);

  const fetchRSVPData = async () => {
    try {
      const response = await fetch(
        "https://api.airtable.com/v0/appS3GsydWKYaYxS0/tblgWhr4jmvNkXYxP",
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_AIRTABLE_API_KEY}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch data");

      const data = await response.json();
      const formattedData = data.records.map((record) => {
        // Normalize RSVP Status
        let status = record.fields["RSVP Status"] || "Pending";
        if (status.toLowerCase() === "yes") status = "Confirmed";
        else if (status.toLowerCase() === "no") status = "Declined";
        else if (status.toLowerCase() === "maybe") status = "Pending";

        return {
          id: record.id,
          fullName: record.fields["Full Name"] || "N/A",
          phoneNumber: record.fields["Phone Number"] || "N/A",
          rsvpStatus: status,
          numberOfGuests: record.fields["Number of Guests"] || 0,
          proofUploaded: record.fields["Proof Uploaded"] || false,
          documentUpload: record.fields["Document Upload"] || null,
          eventName: record.fields["Event Name"] || "N/A",
          timestamp: record.fields["Timestamp"] || new Date().toISOString(),
        };
      });

      setRsvpData(formattedData);
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
      case "Confirmed":
        return <CheckCircle size={16} className="status-icon confirmed" />;
      case "Declined":
        return <XCircle size={16} className="status-icon declined" />;
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
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="declined">Declined</option>
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
              <th>Proof</th>
              <th>Document Upload</th>
              <th>Event</th>
              <th>Date</th>
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
                  <td>
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
                  </td>
                  <td>
                    {item.documentUpload ? (
                      <a
                        href={item.documentUpload[0]?.url || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="doc-link"
                      >
                        <FileText size={14} />{" "}
                        {item.documentUpload[0]?.filename || "View"}
                      </a>
                    ) : (
                      <span className="no-doc">No file</span>
                    )}
                  </td>
                  <td className="event-cell">{item.eventName}</td>
                  <td className="date-cell">
                    <Calendar size={14} />
                    {formatDate(item.timestamp)}
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
          <span className="stat-label">Confirmed:</span>
          <span className="stat-value confirmed">
            {
              filteredData.filter((item) => item.rsvpStatus === "Confirmed")
                .length
            }
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Pending:</span>
          <span className="stat-value pending">
            {
              filteredData.filter((item) => item.rsvpStatus === "Pending")
                .length
            }
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Declined:</span>
          <span className="stat-value declined">
            {
              filteredData.filter((item) => item.rsvpStatus === "Declined")
                .length
            }
          </span>
        </div>
      </div>
    </div>
  );
};

export default RSVPTable;
