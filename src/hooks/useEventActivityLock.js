// hooks/useEventActivityLock.js
// ─────────────────────────────────────────────────────────────────────────────
// Polls the backend for ANY in-flight batch activity on this event:
//   - batch_status (call batches: 'in_progress' / 'pending')
//   - active whatsapp_ai_sessions with triggered_by='batch_template' sent < 2 min ago
//
// Returns { locked, reason } so the UI disables edit/delete while:
//   - a call batch is running
//   - a WhatsApp template batch was just sent (still possibly dispatching)
//
// This survives page refresh — lock state comes from the DB, not local state,
// so if the organiser reloads mid-batch, edit/delete stay disabled correctly.
//
// Usage:
//   const { locked, reason } = useEventActivityLock(eventId);
//   <SelectionToolbar operationInProgress={operationInProgress || locked} ... />
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";

const BACKEND = import.meta.env.VITE_BACKEND_URL;
const POLL_INTERVAL_MS = 8000; // check every 8s — frequent enough to feel realtime

export function useEventActivityLock(eventId) {
  const [locked, setLocked] = useState(false);
  const [reason, setLocked2] = useState(null); // 'call' | 'whatsapp' | null
  const [reasonText, setReasonText] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!eventId) return;

    let timer;

    const check = async () => {
      try {
        const res = await fetch(
          `${BACKEND}/api/events/${eventId}/activity-status`,
        );
        if (!res.ok) return;
        const data = await res.json();

        if (!mountedRef.current) return;

        if (data.call_batch_active) {
          setLocked(true);
          setReasonText(
            "Call batch in progress — actions disabled until complete",
          );
        } else if (data.whatsapp_batch_active) {
          setLocked(true);
          setReasonText(
            "WhatsApp messages are being sent — actions disabled until complete",
          );
        } else {
          setLocked(false);
          setReasonText(null);
        }
      } catch {
        // network hiccup — don't change lock state, try again next poll
      }
    };

    check(); // immediate check on mount
    timer = setInterval(check, POLL_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [eventId]);

  return { locked, reason: reasonText };
}
