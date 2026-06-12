// pages/ChatPage.jsx
import { useState } from "react";
import ChatList from "../components/ChatList";
import ChatWindow from "../components/ChatWindow";
import "../styles/chat.css";
import useAuthUser from "../hooks/useAuthUser";

export default function ChatPage() {
  const { userId } = useAuthUser();

  const [activeChat, setActiveChat] = useState(null);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [chatMode, setChatMode] = useState("AI");
  const [mobileView, setMobileView] = useState("list"); // "list" | "chat"

  const handleSelectChat = (chatId, userData) => {
    setActiveChat(chatId);
    setActiveChatUser(userData);
    setChatMode((userData?.mode || "AI").toUpperCase().trim());
    setMobileView("chat");
  };

  return (
    <div className={`wa-container${mobileView === "chat" ? " chat-open" : ""}`}>
      {/* Left */}
      <div className="wa-chatlist">
        <ChatList
          userId={userId}
          onSelectChat={handleSelectChat}
          activeChatId={activeChat}
        />
      </div>

      {/* Right */}
      <div className="wa-chat-container">
        {activeChat ? (
          <ChatWindow
            chatId={activeChat}
            userInfo={activeChatUser}
            chatMode={chatMode}
            setChatMode={setChatMode}
            onBack={() => setMobileView("list")}
          />
        ) : (
          <div className="wa-empty-state">
            <div className="wa-empty-ico">💬</div>
            <h3>Select a conversation</h3>
            <p>Choose a chat from the list to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
