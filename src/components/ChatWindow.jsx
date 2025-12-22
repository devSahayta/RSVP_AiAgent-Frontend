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
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import useAuthUser from "../hooks/useAuthUser";
import MediaPreview from "./MediaPreview";

export default function ChatWindow({ chatId, userInfo,chatMode,setChatMode}) {
 {
  const { userId } = useAuthUser();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);
  const { getToken } = useKindeAuth();


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
  console.log("🔄 Chat mode changed:", chatMode);
}, [chatMode]);

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

        console.log({ data });

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

  const resumeAI = async () => {
  if (!chatId) return;

  try {
    const token = await getToken();

const res = await fetch(
  `${import.meta.env.VITE_BACKEND_URL}/admin/chat/resume-ai`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      chat_id: chatId,
    }),
  }
);


    const data = await res.json();

    if (res.ok && data.success) {
      setChatMode("AI");
    }
  } catch (err) {
    console.error("Failed to resume AI", err);
  }
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
  setChatMode("MANUAL");

  try {
    const token = await getToken();

const res = await fetch(
  `${import.meta.env.VITE_BACKEND_URL}/admin/chat/send`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      chat_id: chatId,
      message: trimmed,
    }),
  }
);

    const data = await res.json();
    if (res.ok && data.success) {
      // Optionally reload messages from backend
      // Or just mark temp message as "sent"
      setMessages((prev) =>
        prev.map((m) =>
          m.message_id === temp.message_id ? { ...m, status: "sent" } : m
        )
      );
      scrollToBottom();
    } else {
      console.error("Send failed:", data);
    }
  } catch (err) {
    console.error("Send message failed:", err);
  }
};

  const normalizeButtons = (buttons) => {
    if (!buttons) return [];

    // Case 1: Already correct JSON array
    if (Array.isArray(buttons)) return buttons;

    // Case 2: JSON stored as string
    if (typeof buttons === "string") {
      try {
        let str = buttons.trim();

        // Remove wrapping quotes: "[{...}]"
        if (
          (str.startsWith('"') && str.endsWith('"')) ||
          (str.startsWith("'") && str.endsWith("'"))
        ) {
          str = str.slice(1, -1);
        }

        // Unescape quotes & newlines
        str = str
          .replace(/\\"/g, '"')
          .replace(/\\n/g, "")
          .replace(/\\r/g, "")
          .replace(/\\t/g, "");

        const parsed = JSON.parse(str);

        return Array.isArray(parsed) ? parsed : [];
      } catch (err) {
        console.error("❌ Failed to parse buttons:", buttons, err);
        return [];
      }
    }

    return [];
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

      <div className="wa-last-seen">
        {chatMode === "AI" ? "🤖 AI active" : "👤 Admin mode"}
      </div>

      {/* DEBUG – remove later */}
      <div style={{ fontSize: "11px", color: "#999" }}>
        Mode: {chatMode}
      </div>
    </div>
  </div>

  {/* RESUME AI BANNER */}
{chatMode === "MANUAL" && (
  <div
    className="resume-ai-banner"
    onClick={resumeAI}
    title="Click to resume AI"
  >
    <span className="resume-ai-icon">▶</span>
    <span className="resume-ai-text">
      AI is paused. Click to resume automated replies
    </span>
  </div>
)}

</div>


    {/* {chatMode !== "AI" && (
  <div className="ai-paused-banner">
    🛑 AI is paused. You are chatting as admin.
  </div>
)} */}

{/* {chatMode !== "AI" && (
  <button className="resume-ai-btn" onClick={resumeAI}>
    ▶ Resume AI
  </button>
)} */}




      {/* MESSAGES */}
      <div className="wa-messages">
        {messages.map((msg) => {
          const sent = isSentByAdminOrAI(msg.sender_type);

          return (
            <div
              key={msg.message_id}
              className={`wa-message-bubble ${sent ? "sent" : "received"}`}
            >
              {/* Render Media for template */}
              <div className=" mb-4 ">
                {msg.media_path && msg.message_type === "template" && (
                  <div className="mt-3 border rounded-lg p-2 bg-gray-50">
                    <MediaPreview mediaId={msg.media_path} userId={userId} />
                  </div>
                )}
              </div>

              <div className="wa-message-text">
                {msg.message && <div>{msg.message}</div>}

                {/* BUTTONS */}
                {normalizeButtons(msg.buttons).length > 0 && (
                  <div className="border-t mt-4">
                    {normalizeButtons(msg.buttons)?.map((btn, i) => (
                      <button
                        key={i}
                        className="w-full text-blue-600 bg-gray-50 py-2 flex items-center justify-center mb-1 rounded-lg hover:bg-blue-50 transition"
                      >
                        ➜ {btn.text}
                      </button>
                    ))}
                  </div>
                )}

                {/* IMAGE */}
{msg.message_type === "image" &&
  typeof msg.media_path === "string" && (
    <img
      src={msg.media_path}
      alt="media"
      className="wa-chat-image"
    />
)}

{/* DOCUMENT */}
{msg.message_type === "document" &&
  typeof msg.media_path === "string" && (
    <a
      href={msg.media_path}
      target="_blank"
      rel="noopener noreferrer"
      className="wa-chat-doc"
    >
      📄 {msg.media_path.split("/").pop().split("?")[0]}
    </a>
)}


                {/* DOCUMENT */}
                {msg.media_path && msg.message_type !== "template" && (
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
}
