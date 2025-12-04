// import React, { useEffect, useState } from "react";

// export default function ChatList({ onSelectChat }) {
//   const [chats, setChats] = useState([]);

//   useEffect(() => {
//     // BACKEND NOTE:
//     // Replace mockData with Supabase / Express API

//     const mockData = [
//       {
//         chat_id: 1,
//         person_name: "Rahul Sharma",
//         last_message: "Bro send that file...",
//         time: "10:45 AM",
//         last_seen: "today at 9:00 AM",
//       },
//       {
//         chat_id: 2,
//         person_name: "Sneha",
//         last_message: "Okay I will check it",
//         time: "Yesterday",
//         last_seen: "yesterday at 7:12 PM",
//       },
//     ];

//     setChats(mockData);
//   }, []);

//   return (
//     <div className="wa-chatlist">
//       <div className="wa-chatlist-header">Chats</div>

//       {chats.map((c) => (
//         <div
//           key={c.chat_id}
//           className="wa-chatlist-item"
//           onClick={() => onSelectChat(c.chat_id, c)}
//         >
//           <div className="wa-avatar">{c.person_name.charAt(0)}</div>

//           <div className="wa-chat-info">
//             <div className="wa-chat-top">
//               <span className="wa-chat-name">{c.person_name}</span>
//               <span className="wa-chat-time">{c.time}</span>
//             </div>

//             <div className="wa-chat-message">{c.last_message}</div>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

// ------------------------------Connect backend to frontend----------------

// import React, { useEffect, useState } from "react";

// export default function ChatList({ eventId, onSelectChat }) {
//   const [chats, setChats] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!eventId) return;

//     const fetchChats = async () => {
//       try {
//         const res = await fetch(
//           `${
//             import.meta.env.VITE_BACKEND_URL
//           }/api/events/${eventId}/chats?limit=100&offset=0`
//         );

//         const data = await res.json();

//         if (data.ok) {
//           setChats(data.chats);
//         } else {
//           console.error("Failed to load chats");
//         }
//       } catch (err) {
//         console.error("Error fetching chats:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchChats();
//   }, [eventId]);

//   if (loading) {
//     return <p style={{ padding: 20 }}>Loading chats...</p>;
//   }

//   return (
//     <div className="wa-chatlist">
//       <div className="wa-chatlist-header">Chats</div>

//       {chats.map((c) => (
//         <div
//           key={c.chat_id}
//           className="wa-chatlist-item"
//           onClick={() => onSelectChat(c.chat_id, c)}
//         >
//           <div className="wa-avatar">{c.person_name?.charAt(0) || "U"}</div>

//           <div className="wa-chat-info">
//             <div className="wa-chat-top">
//               <span className="wa-chat-name">{c.person_name}</span>
//               <span className="wa-chat-time">{c.last_message_time || ""}</span>
//             </div>

//             <div className="wa-chat-message">
//               {c.last_message || "No messages yet"}
//             </div>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

import React, { useEffect, useState } from "react";

// WhatsApp style time formatter
const formatTime = (timestamp) => {
  if (!timestamp) return "";

  const date = new Date(timestamp);
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);

  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (isYesterday) return "Yesterday";

  return date.toLocaleDateString([], { day: "2-digit", month: "short" });
};

export default function ChatList({ eventId, onSelectChat }) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;

    const fetchChats = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/events/${eventId}/chats`
        );
        const data = await res.json();

        if (data.ok) {
          const sorted = data.chats.sort(
            (a, b) => new Date(b.last_message_at) - new Date(a.last_message_at)
          );
          setChats(sorted);
        }
      } catch (err) {
        console.error("Error fetching chats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [eventId]);

  if (loading) return <p className="loading">Loading chats...</p>;

  return (
    <div className="wa-chatlist">
      <div className="wa-chatlist-header">Chats</div>

      {chats.map((c) => (
        <div
          key={c.chat_id}
          className="wa-chatlist-item"
          onClick={() => onSelectChat(c.chat_id, c)}
        >
          {/* Avatar */}
          <div className="wa-avatar">
            {c.person_name?.charAt(0).toUpperCase()}
          </div>

          {/* Chat Info */}
          <div className="wa-chat-info">
            <div className="wa-chat-top">
              <span className="wa-chat-name">{c.person_name}</span>
              <span className="wa-chat-time">
                {formatTime(c.last_message_at)}
              </span>
            </div>

            <div className="wa-chat-message">
              {c.last_message || "No messages yet"}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
