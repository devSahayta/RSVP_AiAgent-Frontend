// import React, { useEffect, useState } from "react";

// export default function ChatWindow({ chatId, userInfo }) {
//   const [messages, setMessages] = useState([]);
//   const [text, setText] = useState("");

//   useEffect(() => {
//     if (!chatId) return;

//     // Backend developer: replace mockMessages with API data
//     const mockMessages = [
//       {
//         message_id: 1,
//         sender_type: "user",
//         message: "Hi there!",
//         time: "10:30 AM",
//       },
//       {
//         message_id: 2,
//         sender_type: "bot",
//         message: "Hello! How can I help?",
//         time: "10:31 AM",
//       },
//     ];

//     setMessages(mockMessages);
//   }, [chatId]);

//   const sendMessage = () => {
//     if (!text.trim()) return;

//     setMessages((prev) => [
//       ...prev,
//       {
//         message_id: Date.now(),
//         sender_type: "user",
//         message: text,
//         time: new Date().toLocaleTimeString([], {
//           hour: "2-digit",
//           minute: "2-digit",
//         }),
//       },
//     ]);

//     setText("");
//   };

//   if (!chatId) {
//     return (
//       <div className="wa-chat-empty">
//         <p>Select a chat to start messaging</p>
//       </div>
//     );
//   }

//   return (
//     <div className="wa-chatwindow">
//       {/* HEADER */}
//       <div className="wa-chat-header">
//         <div className="wa-avatar-small">{userInfo.person_name.charAt(0)}</div>
//         <div>
//           <div className="wa-chat-title">{userInfo.person_name}</div>
//           <div className="wa-last-seen">last seen {userInfo.last_seen}</div>
//         </div>
//       </div>

//       {/* MESSAGES */}
//       <div className="wa-messages">
//         {messages.map((m) => (
//           <div key={m.message_id} className={`wa-msg ${m.sender_type}`}>
//             <div className="wa-msg-text">{m.message}</div>
//             <div className="wa-msg-time">{m.time}</div>
//           </div>
//         ))}
//       </div>

//       {/* INPUT BOX */}
//       <div className="wa-input-area">
//         <input
//           value={text}
//           onChange={(e) => setText(e.target.value)}
//           placeholder="Type a message"
//         />
//         <button onClick={sendMessage}>Send</button>
//       </div>
//     </div>
//   );
// }

// -----------------------------connection-------------------------

// import React, { useState, useEffect } from "react";

// export default function ChatWindow({ chatId, userInfo }) {
//   const [messages, setMessages] = useState([]);
//   const [inputText, setInputText] = useState("");

//   // Load messages
//   useEffect(() => {
//     if (!chatId) return;

//     const loadMessages = async () => {
//       try {
//         const res = await fetch(
//           `${
//             import.meta.env.VITE_BACKEND_URL
//           }/api/chats/${chatId}/messages?limit=50`
//         );

//         const data = await res.json();

//         if (data.ok) {
//           setMessages(data.messages);
//         }
//       } catch (err) {
//         console.error("Error fetching messages:", err);
//       }
//     };

//     loadMessages();
//   }, [chatId]);

//   // Send message
//   const sendMessage = async () => {
//     if (!inputText.trim()) return;

//     try {
//       const res = await fetch(
//         `${import.meta.env.VITE_BACKEND_URL}/api/chats/${chatId}/messages`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             sender_type: "admin",
//             message: inputText,
//             message_type: "text",
//           }),
//         }
//       );

//       const data = await res.json();

//       if (data.ok) {
//         setMessages((prev) => [...prev, data.message]);
//         setInputText("");
//       }
//     } catch (err) {
//       console.error("Error sending message:", err);
//     }
//   };

//   return (
//     <div className="wa-chat-window">
//       <div className="wa-chat-header">
//         <h3>{userInfo?.person_name || "User"}</h3>
//       </div>

//       <div className="wa-messages">
//         {messages.map((msg) => (
//           <div
//             key={msg.message_id}
//             className={`wa-message ${
//               msg.sender_type === "admin" ? "sent" : "received"
//             }`}
//           >
//             {msg.message}
//           </div>
//         ))}
//       </div>

//       <div className="wa-input-area">
//         <input
//           type="text"
//           placeholder="Type message..."
//           value={inputText}
//           onChange={(e) => setInputText(e.target.value)}
//         />

//         <button onClick={sendMessage}>Send</button>
//       </div>
//     </div>
//   );
// }

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// import React, { useState, useEffect } from "react";

// export default function ChatWindow({ chatId, userInfo }) {
//   const [messages, setMessages] = useState([]);
//   const [inputText, setInputText] = useState("");

//   // Load messages
//   useEffect(() => {
//     if (!chatId) return;

//     const loadMessages = async () => {
//       try {
//         const res = await fetch(
//           `${
//             import.meta.env.VITE_BACKEND_URL
//           }/api/chats/${chatId}/messages?limit=50`
//         );

//         const data = await res.json();

//         if (data.ok) {
//           setMessages(data.messages);
//         }
//       } catch (err) {
//         console.error("Error fetching messages:", err);
//       }
//     };

//     loadMessages();
//   }, [chatId]);

//   // Send message
//   const sendMessage = async () => {
//     if (!inputText.trim()) return;

//     try {
//       const res = await fetch(
//         `${import.meta.env.VITE_BACKEND_URL}/api/chats/${chatId}/messages`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             sender_type: "admin",
//             message: inputText,
//             message_type: "text",
//           }),
//         }
//       );

//       const data = await res.json();

//       if (data.ok) {
//         setMessages((prev) => [...prev, data.message]);
//         setInputText("");
//       }
//     } catch (err) {
//       console.error("Error sending message:", err);
//     }
//   };

//   return (
//     <div className="wa-chat-window">
//       <div className="wa-chat-header">
//         <h3>{userInfo?.person_name || "User"}</h3>
//       </div>

//       <div className="wa-messages">
//         {messages.map((msg) => (
//           <div
//             key={msg.message_id}
//             className={`wa-message ${
//               msg.sender_type === "admin" ? "sent" : "received"
//             }`}
//           >
//             {msg.message}
//           </div>
//         ))}
//       </div>

//       <div className="wa-input-area">
//         <input
//           type="text"
//           placeholder="Type message..."
//           value={inputText}
//           onChange={(e) => setInputText(e.target.value)}
//         />

//         <button onClick={sendMessage}>Send</button>
//       </div>
//     </div>
//   );
// }

// +++++++++++++++++++++++++++++++++++++++++++

// import React, { useState, useEffect, useRef } from "react";

// /**
//  * ChatWindow
//  * - sorts messages by created_at ascending (old → new)
//  * - admin & bot messages render on the RIGHT (sent)
//  * - user messages render on the LEFT (received)
//  * - auto-scrolls to newest message
//  * - sends message and appends it to UI
//  *
//  * NOTE: backend message objects must include `message_id`, `sender_type`, `message`, `created_at`.
//  * If created_at is missing, we set a fallback timestamp client-side.
//  */
// export default function ChatWindow({ chatId, userInfo }) {
//   const [messages, setMessages] = useState([]);
//   const [inputText, setInputText] = useState("");
//   const messagesEndRef = useRef(null);

//   // helper: parse date-safe
//   const parseTs = (ts) => {
//     try {
//       return ts ? new Date(ts) : new Date();
//     } catch {
//       return new Date();
//     }
//   };

//   // format bubble time like "9:32 AM"
//   const formatBubbleTime = (timestamp) => {
//     if (!timestamp) return "";
//     const d = parseTs(timestamp);
//     return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
//   };

//   // Ensure messages are sorted oldest -> newest
//   const normalizeAndSort = (arr) => {
//     const normalized = (arr || []).map((m) => ({
//       ...m,
//       created_at: m.created_at || m.timestamp || new Date().toISOString(),
//     }));

//     normalized.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
//     return normalized;
//   };

//   // scroll to bottom (smooth)
//   const scrollToBottom = (behavior = "smooth") => {
//     // small delay helps when elements render
//     setTimeout(() => {
//       messagesEndRef.current?.scrollIntoView({ behavior });
//     }, 60);
//   };

//   // Load messages from backend (and sort)
//   useEffect(() => {
//     if (!chatId) {
//       setMessages([]);
//       return;
//     }

//     let cancelled = false;

//     const loadMessages = async () => {
//       try {
//         const res = await fetch(
//           `${
//             import.meta.env.VITE_BACKEND_URL
//           }/api/chats/${chatId}/messages?limit=100`
//         );
//         const data = await res.json();

//         if (!cancelled) {
//           if (data?.ok && Array.isArray(data.messages)) {
//             const sorted = normalizeAndSort(data.messages);
//             setMessages(sorted);
//             scrollToBottom("auto");
//           } else {
//             setMessages([]);
//           }
//         }
//       } catch (err) {
//         console.error("Error fetching messages:", err);
//         if (!cancelled) setMessages([]);
//       }
//     };

//     loadMessages();

//     return () => {
//       cancelled = true;
//     };
//   }, [chatId]);

//   // Auto-scroll when messages change (most of the time)
//   useEffect(() => {
//     scrollToBottom();
//   }, [messages.length]);

//   // Helper: determine if message should be rendered on RIGHT
//   const isSentByAdminOrAI = (sender_type) => {
//     if (!sender_type) return false;
//     const s = sender_type.toLowerCase();
//     return s === "admin" || s === "bot" || s === "ai" || s === "system";
//   };

//   // Send message to backend and append to UI
//   const sendMessage = async () => {
//     const trimmed = inputText.trim();
//     if (!trimmed || !chatId) return;

//     // Optimistic UI: create a temporary message object
//     const tempMessage = {
//       message_id: `temp-${Date.now()}`,
//       sender_type: "admin",
//       message: trimmed,
//       created_at: new Date().toISOString(),
//       // message_type: "text" // optional
//     };

//     // append optimistically
//     setMessages((prev) => [...prev, tempMessage]);
//     setInputText("");
//     scrollToBottom();

//     try {
//       const res = await fetch(
//         `${import.meta.env.VITE_BACKEND_URL}/api/chats/${chatId}/messages`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             sender_type: "admin",
//             message: trimmed,
//             message_type: "text",
//           }),
//         }
//       );

//       const data = await res.json();

//       if (data?.ok && data.message) {
//         // replace the temp message with the server message (match by temp id)
//         setMessages((prev) => {
//           // remove temp (by id starting with "temp-") and append server message
//           const withoutTemp = prev.filter(
//             (m) => !String(m.message_id).startsWith("temp-")
//           );
//           const merged = [...withoutTemp, data.message];
//           return normalizeAndSort(merged);
//         });
//         scrollToBottom();
//       } else {
//         // server failed — keep optimistic but console log
//         console.warn("Message post did not return saved message", data);
//       }
//     } catch (err) {
//       console.error("Error sending message:", err);
//       // keep optimistic message but a real app should mark as failed and allow retry
//     }
//   };

//   return (
//     <div className="wa-chat-window">
//       {/* HEADER */}
//       <div className="wa-chat-header">
//         <div className="wa-header-left">
//           <div className="wa-header-avatar">
//             {userInfo?.person_name
//               ? userInfo.person_name.charAt(0).toUpperCase()
//               : "U"}
//           </div>
//           <div className="wa-header-meta">
//             <h3 className="wa-header-name">
//               {userInfo?.person_name || "User"}
//             </h3>
//             <div className="wa-last-seen">online</div>
//           </div>
//         </div>
//       </div>

//       {/* MESSAGES */}
//       <div className="wa-messages">
//         {messages.map((msg) => {
//           const sent = isSentByAdminOrAI(msg.sender_type);
//           return (
//             <div
//               key={msg.message_id}
//               className={`wa-message-bubble ${sent ? "sent" : "received"}`}
//             >
//               <div className="wa-message-text">{msg.message}</div>
//               <div className="wa-message-time">
//                 {formatBubbleTime(msg.created_at)}
//               </div>
//             </div>
//           );
//         })}

//         <div ref={messagesEndRef} />
//       </div>

//       {/* INPUT */}
//       <div className="wa-input-area">
//         <input
//           placeholder="Type a message…"
//           value={inputText}
//           onChange={(e) => setInputText(e.target.value)}
//           onKeyDown={(e) => {
//             if (e.key === "Enter") sendMessage();
//           }}
//         />
//         <button onClick={sendMessage}>Send</button>
//       </div>
//     </div>
//   );
// }

// _________________________________________________________________new One______________________________________________________
import { useEffect, useRef, useState } from "react";

export default function ChatWindow({ chatId, userInfo }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);

  const parseTs = (ts) => {
    try {
      return ts ? new Date(ts) : new Date();
    } catch {
      return new Date();
    }
  };

  const formatBubbleTime = (timestamp) => {
    if (!timestamp) return "";
    const d = parseTs(timestamp);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const normalizeAndSort = (arr) => {
    const normalized = (arr || []).map((m) => ({
      ...m,
      created_at: m.created_at || new Date().toISOString(),
    }));
    normalized.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    return normalized;
  };

  const scrollToBottom = (behavior = "smooth") => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior });
    }, 60);
  };

  const isImage = (path) => {
    if (!path) return false;
    const ext = path.split("?")[0].toLowerCase().split(".").pop();
    return ["png", "jpg", "jpeg", "gif", "webp"].includes(ext);
  };

  // const isDocument = (path) => {
  //   if (!path) return false;
  //   const ext = path.split("?")[0].toLowerCase().split(".").pop();
  //   return [
  //     "pdf",
  //     "doc",
  //     "docx",
  //     "xls",
  //     "xlsx",
  //     "ppt",
  //     "pptx",
  //     "jpg",
  //     "png",
  //     "jpeg",
  //   ].includes(ext);
  // };

  // 👉 Load messages (using your backend API)
  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      return;
    }

    let cancelled = false;

    const loadMessages = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/chats/${chatId}/messages`
        );

        const data = await res.json();
        if (!data?.ok || !Array.isArray(data.messages)) return;

        if (!cancelled) {
          const sorted = normalizeAndSort(data.messages);
          setMessages(sorted);
          scrollToBottom("auto");
        }
      } catch (err) {
        console.error("Error loading messages:", err);
      }
    };

    loadMessages();
    return () => (cancelled = true);
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  const isSentByAdminOrAI = (sender_type) => {
    if (!sender_type) return false;
    const s = sender_type.toLowerCase();
    return ["admin", "ai", "bot", "system"].includes(s);
  };

  const sendMessage = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || !chatId) return;

    const temp = {
      message_id: `temp-${Date.now()}`,
      sender_type: "admin",
      message: trimmed,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, temp]);
    setInputText("");
    scrollToBottom();

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/chats/${chatId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sender_type: "admin",
            message: trimmed,
            message_type: "text",
          }),
        }
      );

      const data = await res.json();
      if (data?.ok && data.message) {
        setMessages((prev) => {
          const cleaned = prev.filter(
            (m) => !String(m.message_id).startsWith("temp-")
          );
          return normalizeAndSort([...cleaned, data.message]);
        });
        scrollToBottom();
      }
    } catch (err) {
      console.error("Send message failed:", err);
    }
  };

  return (
    <div className="wa-chat-window">
      {/* HEADER */}
      <div className="wa-chat-header">
        <div className="wa-header-left">
          <div className="wa-header-avatar">
            {userInfo?.person_name
              ? userInfo.person_name.charAt(0).toUpperCase()
              : "U"}
          </div>
          <div className="wa-header-meta">
            <h3 className="wa-header-name">
              {userInfo?.person_name || "User"}
            </h3>
            <div className="wa-last-seen">online</div>
          </div>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="wa-messages">
        {messages.map((msg) => {
          const sent = isSentByAdminOrAI(msg.sender_type);

          return (
            <div
              key={msg.message_id}
              className={`wa-message-bubble ${sent ? "sent" : "received"}`}
            >
              <div className="wa-message-text">
                {msg.message && <div>{msg.message}</div>}

                {/* IMAGE */}
                {msg.media_path && isImage(msg.media_path) && (
                  <img
                    src={msg.media_path}
                    alt="media"
                    className="wa-chat-image"
                  />
                )}

                {/* DOCUMENT */}
                {msg.media_path && (
                  <a
                    href={msg.media_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="wa-chat-doc"
                  >
                    📄 {msg.media_path.split("/").pop().split("?")[0]}
                  </a>
                )}
              </div>

              <div className="wa-message-time">
                {formatBubbleTime(msg.created_at)}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div className="wa-input-area">
        <input
          placeholder="Type a message…"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
