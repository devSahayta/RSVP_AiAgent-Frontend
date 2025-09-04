import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, CheckCircle, XCircle, Clock, Search, Filter } from 'lucide-react';

const EventDashboard = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [rsvpData, setRsvpData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // // Mock data for demonstration - replace with actual API calls
  // const mockEvents = {
  //   '1': {
  //     id: '1',
  //     name: 'AWS Event',
  //     date: '2024-02-15',
  //     time: '10:00 AM',
  //     description: 'Annual AWS conference and networking event'
  //   },
  //   '2': {
  //     id: '2',
  //     name: 'Tech Conference 2024',
  //     date: '2024-03-20',
  //     time: '9:00 AM',
  //     description: 'Latest trends in technology and innovation'
  //   },
  //   '3': {
  //     id: '3',
  //     name: 'Startup Pitch Night',
  //     date: '2024-04-10',
  //     time: '6:00 PM',
  //     description: 'Local entrepreneurs presenting their ideas'
  //   }
  // };

  // const mockRsvpData = [
  //   {
  //     id: '1',
  //     fullName: 'John Doe',
  //     phoneNumber: '+1234567890',
  //     rsvpStatus: 'Confirmed',
  //     numberOfGuests: 2,
  //     proofUploaded: 'Yes',
  //     documentUpload: 'ticket.pdf',
  //     eventName: 'AWS Event',
  //     timeStamp: '2024-01-15 10:30:00'
  //   },
  //   {
  //     id: '2',
  //     fullName: 'Jane Smith',
  //     phoneNumber: '+1987654321',
  //     rsvpStatus: 'Pending',
  //     numberOfGuests: 1,
  //     proofUploaded: 'No',
  //     documentUpload: '',
  //     eventName: 'AWS Event',
  //     timeStamp: '2024-01-16 14:20:00'
  //   },
  //   {
  //     id: '3',
  //     fullName: 'Mike Johnson',
  //     phoneNumber: '+1122334455',
  //     rsvpStatus: 'Declined',
  //     numberOfGuests: 0,
  //     proofUploaded: 'No',
  //     documentUpload: '',
  //     eventName: 'AWS Event',
  //     timeStamp: '2024-01-17 09:15:00'
  //   }
  // ];

  useEffect(() => {
  const fetchEventData = async () => {
    try {
      setLoading(true);

      const response = await fetch(`http://localhost:5000/api/events/${eventId}`);
      if (!response.ok) throw new Error("Failed to fetch event");
      const data = await response.json();

      setEvent(data.event);       // main event details
      setRsvpData(data.participants || []); // supabase participants
      setFilteredData(data.participants || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (eventId) fetchEventData();
}, [eventId]);


  useEffect(() => {
    let filtered = rsvpData;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(rsvp =>
        rsvp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rsvp.phoneNumber.includes(searchTerm)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(rsvp =>
        rsvp.rsvpStatus.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    setFilteredData(filtered);
  }, [searchTerm, statusFilter, rsvpData]);

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return <CheckCircle className="status-icon confirmed" />;
      case 'declined':
        return <XCircle className="status-icon declined" />;
      default:
        return <Clock className="status-icon pending" />;
    }
  };

  const getStats = () => {
    const confirmed = rsvpData.filter(r => r.rsvpStatus.toLowerCase() === 'confirmed').length;
    const pending = rsvpData.filter(r => r.rsvpStatus.toLowerCase() === 'pending').length;
    const declined = rsvpData.filter(r => r.rsvpStatus.toLowerCase() === 'declined').length;
    const totalGuests = rsvpData.reduce((sum, r) => sum + r.numberOfGuests, 0);

    return { confirmed, pending, declined, totalGuests, total: rsvpData.length };
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading event data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-state">
          <h2>Error Loading Event</h2>
          <p>{error}</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/events')}
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="page-container">
        <div className="error-state">
          <h2>Event Not Found</h2>
          <p>The requested event could not be found.</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/events')}
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="page-container">
      <button 
        className="back-button"
        onClick={() => navigate('/events')}
      >
        <ArrowLeft size={20} />
        Back to Events
      </button>
      
      <div className="event-header">
        <h1 className="event-title">{event.name}</h1>
        <div className="event-meta">
          <span className="event-date">{event.date} at {event.time}</span>
          <span className="event-description">{event.description}</span>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total RSVPs</div>
          </div>
        </div>
        
        <div className="stat-card confirmed">
          <div className="stat-icon">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.confirmed}</div>
            <div className="stat-label">Confirmed</div>
          </div>
        </div>
        
        <div className="stat-card pending">
          <div className="stat-icon">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
        
        <div className="stat-card declined">
          <div className="stat-icon">
            <XCircle size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.declined}</div>
            <div className="stat-label">Declined</div>
          </div>
        </div>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h2>RSVP Responses</h2>

          <div className="table-controls">
            <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filter-box">
              <Filter size={20} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="declined">Declined</option>
              </select>
            </div>
          </div>
        </div>

        {filteredData.length === 0 ? (
          <div className="empty-state">
            <p>No RSVP data found for the current filters.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="rsvp-table">
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Phone Number</th>
                  <th>Status</th>
                  <th>Guests</th>
                  <th>Proof</th>
                  <th>Document</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((rsvp) => (
                  <tr key={rsvp.id}>
                    <td data-label="Full Name">{rsvp.fullName}</td>
                    <td data-label="Phone Number">{rsvp.phoneNumber}</td>
                    <td data-label="Status">
                      <div className="status-cell">
                        {getStatusIcon(rsvp.rsvpStatus)}
                        <span className={`status-text ${rsvp.rsvpStatus.toLowerCase()}`}>
                          {rsvp.rsvpStatus}
                        </span>
                      </div>
                    </td>
                    <td data-label="Guests">{rsvp.numberOfGuests}</td>
                    <td data-label="Proof">
                      <span className={`proof-status ${rsvp.proofUploaded.toLowerCase()}`}>
                        {rsvp.proofUploaded}
                      </span>
                    </td>
                    <td data-label="Document">
                      {rsvp.documentUpload ? (
                        <a href="#" className="document-link">
                          {rsvp.documentUpload}
                        </a>
                      ) : (
                        <span className="no-document">-</span>
                      )}
                    </td>
                    <td data-label="Timestamp">
                      {new Date(rsvp.timeStamp).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDashboard;