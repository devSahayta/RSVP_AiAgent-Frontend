import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Phone, Users, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '../config/supabaseClient';
import RSVPTable from '../components/RSVPTable';
import { motion, AnimatePresence } from "framer-motion";


const CallBatchPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [callInProgress, setCallInProgress] = useState(false);
  const [callResult, setCallResult] = useState(null);
  const [hasConversations, setHasConversations] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    fetchEventData();
  }, [eventId]);

useEffect(() => {
  if (hasConversations) {
    navigate(`/dashboard/${eventId}`);
  }
}, [hasConversations, navigate, eventId]);



  const fetchEventData = async () => {
  try {
    const res = await fetch(`https://rsvp-aiagent-backend.onrender.com/api/events/${eventId}`);
    if (!res.ok) throw new Error("Failed to fetch event");
    const data = await res.json();
    console.log('event API:', data);

    const participants = data.participants || [];
    console.log("participants raw:", participants);

    setEvent({
      id: data.event_id,
      name: data.event_name,
      participants
    });

    const participantIds = participants.map(p => p.participant_id);
    console.log('participantIds:', participantIds);

    if (participantIds.length > 0) {
      const { data: conversations, error } = await supabase
        .from("conversation_results")
        .select("result_id")
        .in("participant_id", participantIds)
        .limit(1);

      if (error) throw error;
      setHasConversations(conversations?.length > 0);
    } else {
      setHasConversations(false);
    }

  } catch (error) {
    console.error("Error fetching event data:", error);
  } finally {
    setLoading(false);
  }
};



  if (loading) {
    return (
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem 1rem',
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          color: '#6b7280'
        }}>
          <div className="loading-spinner"></div>
          <p>Loading event data...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem 1rem',
        minHeight: 'calc(100vh - 64px)'
      }}>
        <button 
          onClick={() => navigate('/events')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'none',
            border: 'none',
            color: '#6b7280',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
            padding: '0.5rem 0',
            marginBottom: '1rem',
            transition: 'color 0.2s ease'
          }}
          onMouseEnter={(e) => e.target.style.color = '#000000'}
          onMouseLeave={(e) => e.target.style.color = '#6b7280'}
        >
          <ArrowLeft size={20} />
          Back to Events
        </button>
        
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: '#6b7280'
        }}>
          <h2 style={{ color: '#dc2626', marginBottom: '1rem' }}>Event Not Found</h2>
          <p style={{ marginBottom: '2rem' }}>The requested event could not be found.</p>
        </div>
      </div>
    );
  }
if (hasConversations) {
  navigate(`/dashboard/${eventId}`, { replace: true });
  return null;
}

const handleStartCallBatch = async () => {
  if (!event || !event.participants?.length) return;

  setCallInProgress(true);
  setCallResult(null);

  try {
    const res = await fetch(`https://rsvp-aiagent-backend.onrender.com/api/events/${event.id}/call-batch`, {
      method: 'POST',
    });

    const data = await res.json();

    if (!res.ok) {
      setCallResult({
        success: false,
        message: data.error || 'Failed to start batch call',
        participantCount: 0
      });
      setCallInProgress(false);
      return;
    }

    setCallResult({
      success: true,
      message: `Batch call started successfully. Status: ${data.batch?.status}`,
      participantCount: event.participants.length
    });

    // 🆕 Show popup
    setShowPopup(true);

    // 🕒 Wait 3 seconds before navigating
    setTimeout(() => {
      setShowPopup(false);
      navigate(`/dashboard/${event.id}`);
    }, 3000);

    // 🔁 Still start polling in background
    pollBatchStatus();

  } catch (error) {
    console.error('Error starting batch call:', error);
    setCallResult({
      success: false,
      message: 'Failed to start batch call. Please try again.',
      participantCount: 0
    });
  } finally {
    setCallInProgress(false);
  }
};

// ✅ Polling function (checks every 5 seconds)
  const pollBatchStatus = async () => {
    try {
      const res = await fetch(`https://rsvp-aiagent-backend.onrender.com/api/events/${eventId}/batch-status`);
      const data = await res.json();

      // Suppose your backend /batch-status route returns batchData from ElevenLabs
      const firstRecipient = data?.recipients?.[0];

      if (firstRecipient && firstRecipient.status !== "pending") {
        console.log("Batch started on ElevenLabs:", firstRecipient.status);
        setHasConversations(true);
      } else {
        console.log("Batch still pending... checking again in 5s");
        setTimeout(pollBatchStatus, 30000); // keep checking
      }
    } catch (err) {
      console.error("Error polling batch status:", err);
      setTimeout(pollBatchStatus, 30000); // retry
    }
  };

  // // ✅ Redirect to dashboard when conversations exist
  // useEffect(() => {
  //   if (hasConversations) {
  //     navigate(`/dashboard/${eventId}`);
  //   }
  // }, [hasConversations, navigate, eventId]);

  if (loading) {
    return (
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem 1rem',
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          color: '#6b7280'
        }}>
          <div className="loading-spinner"></div>
          <p>Loading event data...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem 1rem',
        minHeight: 'calc(100vh - 64px)'
      }}>
        <button 
          onClick={() => navigate('/events')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'none',
            border: 'none',
            color: '#6b7280',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
            padding: '0.5rem 0',
            marginBottom: '1rem',
            transition: 'color 0.2s ease'
          }}
          onMouseEnter={(e) => e.target.style.color = '#000000'}
          onMouseLeave={(e) => e.target.style.color = '#6b7280'}
        >
          <ArrowLeft size={20} />
          Back to Events
        </button>
        
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: '#6b7280'
        }}>
          <h2 style={{ color: '#dc2626', marginBottom: '1rem' }}>Event Not Found</h2>
          <p style={{ marginBottom: '2rem' }}>The requested event could not be found.</p>
        </div>
      </div>
    );
  }
  

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem 1rem',
      minHeight: 'calc(100vh - 64px)'
    }}>
      <button 
        onClick={() => navigate('/events')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'none',
          border: 'none',
          color: '#6b7280',
          fontSize: '0.875rem',
          fontWeight: '500',
          cursor: 'pointer',
          padding: '0.5rem 0',
          marginBottom: '2rem',
          transition: 'color 0.2s ease'
        }}
        onMouseEnter={(e) => e.target.style.color = '#000000'}
        onMouseLeave={(e) => e.target.style.color = '#6b7280'}
      >
        <ArrowLeft size={20} />
        Back to Events
      </button>

      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <div style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '3rem 2rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: '#000000',
            marginBottom: '1rem'
          }}>
            {event.name}
          </h1>

          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '1.5rem'
          }}>
            Trigger AI Calls to Participants
          </h2>

          <p style={{
            fontSize: '1rem',
            color: '#6b7280',
            lineHeight: '1.6',
            marginBottom: '2.5rem',
            maxWidth: '400px',
            margin: '0 auto 2.5rem auto'
          }}>
            Click below to start an AI-powered call batch to notify your participants.
          </p>

          {event.participants && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              marginBottom: '2rem',
              color: '#6b7280',
              fontSize: '0.875rem'
            }}>
              <Users size={16} />
              <span>{event.participants.length} participants will be called</span>
            </div>
          )}

          {callResult && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              backgroundColor: callResult.success ? '#dcfce7' : '#fef2f2',
              color: callResult.success ? '#166534' : '#dc2626',
              border: `1px solid ${callResult.success ? '#bbf7d0' : '#fecaca'}`,
              fontWeight: '500'
            }}>
              {callResult.success && <CheckCircle size={20} />}
              <span>{callResult.message}</span>
            </div>
          )}
          

          <button
            onClick={handleStartCallBatch}
            disabled={callInProgress || !event.participants?.length}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: callInProgress ? '#9ca3af' : 'linear-gradient(135deg, #000000 0%, #333333 100%)',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: callInProgress ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              transform: callInProgress ? 'none' : 'translateY(0)',
              boxShadow: callInProgress ? 'none' : '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => {
              if (!callInProgress) {
                e.target.style.background = 'linear-gradient(135deg, #333333 0%, #000000 100%)';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
              }
            }}
            onMouseLeave={(e) => {
              if (!callInProgress) {
                e.target.style.background = 'linear-gradient(135deg, #000000 0%, #333333 100%)';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
              }
            }}
          >
            {callInProgress ? (
              <>
                <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                Starting Call Batch...
              </>
            ) : (
              <>
                <Phone size={20} />
                Start Call Batch
              </>
            )}
          </button>

          {!event.participants?.length && (
            <p style={{
              fontSize: '0.875rem',
              color: '#9ca3af',
              marginTop: '1rem',
              fontStyle: 'italic'
            }}>
              No participants found for this event
            </p>
          )}
        </div>
      </div>

      <AnimatePresence>
  {showPopup && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        backdropFilter: 'blur(6px)'
      }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          background: 'white',
          borderRadius: '16px',
          padding: '2.5rem 3rem',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          maxWidth: '400px',
        }}
      >
        <Loader2
          size={40}
          style={{
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem auto',
            color: '#000'
          }}
        />
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: '#111827',
          marginBottom: '0.5rem'
        }}>
          Starting AI Calls...
        </h3>
        <p style={{
          color: '#6b7280',
          fontSize: '0.95rem',
          lineHeight: 1.5
        }}>
          Please wait while your event participants are being connected.
        </p>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

      
{/* 
      <div style={{ marginTop: "3rem" }}>
        <h2 style={{
          fontSize: "1.5rem",
          fontWeight: "600",
          marginBottom: "1rem",
          color: "#374151"
        }}>
          RSVP Dashboard
        </h2>
        <RSVPTable eventId={eventId} />
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style> */}
    </div>
  );
};

export default CallBatchPage;