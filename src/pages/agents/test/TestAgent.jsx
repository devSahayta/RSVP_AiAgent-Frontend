// pages/agents/test/TestAgent.jsx
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  Phone,
  MessageSquare,
  Send,
  ArrowLeft,
  Loader2,
  Check,
  Sparkles,
  Bot,
  User,
  Circle,
  History
} from "lucide-react";
import useAuthUser from "../../../hooks/useAuthUser";

const TestAgent = () => {
  const { agent_id } = useParams();
  const { userId } = useAuthUser();
  const navigate = useNavigate();

  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("chat"); // "chat" or "voice"

  // Voice state
  const [phoneNumber, setPhoneNumber] = useState("");
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [callStatus, setCallStatus] = useState(null); // null, 'calling', 'success', 'error'

  // Chat state
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [conversationState, setConversationState] = useState(null); // ✅ Track state
  const messagesEndRef = useRef(null);

  // Fetch agent details
  useEffect(() => {
    fetchAgent();
  }, [agent_id]);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initial greeting
  useEffect(() => {
    if (mode === "chat" && messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content: "Hi! 👋 I'm your wedding assistant. How can I help you today?",
          timestamp: new Date(),
        },
      ]);
    }
  }, [mode]);

  const fetchAgent = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/agent-system/${agent_id}`
      );
      const data = await res.json();

      if (data.success) {
        setAgent(data.data);
      } else {
        toast.error("Failed to load agent");
        navigate("/agents");
      }
    } catch (error) {
      console.error("Error fetching agent:", error);
      toast.error("Failed to load agent");
      navigate("/agents");
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceTest = async () => {
    if (!phoneNumber.trim()) {
      toast.error("Please enter a phone number");
      return;
    }

    // Basic validation
    const phoneRegex = /^\+?[1-9]\d{9,14}$/;
    if (!phoneRegex.test(phoneNumber.replace(/[\s-]/g, ""))) {
      toast.error("Please enter a valid phone number");
      return;
    }

    try {
      setVoiceLoading(true);
      setCallStatus("calling");

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/agent-system/${agent_id}/test-voice`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            to_number: phoneNumber,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        setCallStatus("success");
        toast.success("Call initiated! You'll receive a call shortly.");
      } else {
        setCallStatus("error");
        toast.error(data.error || "Failed to initiate call");
      }
    } catch (error) {
      console.error("Voice test error:", error);
      setCallStatus("error");
      toast.error("Failed to initiate call");
    } finally {
      setVoiceLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || chatLoading) return;

    const userMessage = {
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setChatLoading(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/agent-system/${agent_id}/test-chat`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            message: userMessage.content,
            conversation_state: conversationState, // ✅ Send current state
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        const botMessage = {
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
        
        // ✅ Save updated state for next message
        setConversationState(data.conversation_state);
        
        console.log("📍 Current state:", data.metadata?.current_state);
        console.log("✅ RSVP:", data.metadata?.rsvp_status, "Guests:", data.metadata?.guest_count);
      } else {
        toast.error("Failed to get response");
        setMessages((prev) => prev.slice(0, -1));
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to send message");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setChatLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-white">
      {/* Header */}
      <div className="border-b border-[#1F1F23] bg-[#0B0B0C]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-[#18181B] rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold">Test Agent</h1>
                <p className="text-sm text-gray-400">{agent?.agent_name}</p>
              </div>
            </div>

            {/* Mode Toggle */}
          <div className="flex items-center gap-4">

  {/* Test History Button */}
<motion.button
  whileHover={{ scale: 1.03 }}
  whileTap={{ scale: 0.97 }}
  onClick={() => navigate("/agents/test-history")}
  className="
    relative group
    flex items-center justify-center gap-2
    px-3 sm:px-4 py-2
    rounded-xl
    bg-[#111113]
    border border-[#1F1F23]
    hover:bg-[#18181B]
    transition-all
    text-sm font-medium
  "
>
  <History className="w-4 h-4 text-purple-400" />

  {/* Hide text on mobile */}
  <span className="hidden sm:inline">Test History</span>

  {/* Tooltip (mobile + hover fallback) */}
  <span
    className="
      absolute -bottom-9 left-1/2 -translate-x-1/2
      whitespace-nowrap
      bg-[#1A1A1E] text-xs text-gray-300
      px-2 py-1 rounded-md
      opacity-0 group-hover:opacity-100
      transition-opacity
      pointer-events-none
      sm:hidden
    "
  >
    Test History
  </span>
</motion.button>

  {/* Mode Toggle */}
  <div className="flex items-center gap-2 bg-[#111113] p-1 rounded-xl border border-[#1F1F23]">
    <button
      onClick={() => setMode("chat")}
      className={`
        px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2
        ${
          mode === "chat"
            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25"
            : "text-gray-400 hover:text-white"
        }
      `}
    >
      <MessageSquare className="w-4 h-4" />
      Chat Test
    </button>
    <button
      onClick={() => setMode("voice")}
      className={`
        px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2
        ${
          mode === "voice"
            ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25"
            : "text-gray-400 hover:text-white"
        }
      `}
    >
      <Phone className="w-4 h-4" />
      Voice Test
    </button>
  </div>
</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {mode === "chat" ? (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl mx-auto"
            >
              {/* Chat Container */}
              <div className="bg-[#111113] rounded-2xl border border-[#1F1F23] overflow-hidden shadow-2xl">
                {/* Chat Header */}
                <div className="px-6 py-4 border-b border-[#1F1F23] bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{agent?.agent_name}</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                        <span>Online • Test Mode</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Test Mode Disclaimer */}
                  <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-xs text-blue-300 leading-relaxed">
                      🧪 <span className="font-semibold">Test Mode Active:</span> Document uploads (ID proof & travel docs) are disabled. You can test the RSVP flow and ask questions about the event!
                    </p>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="h-[500px] overflow-y-auto p-6 space-y-4 bg-[#0B0B0C]">
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex gap-3 ${
                        message.role === "user" ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {message.role === "assistant" ? (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Message Bubble */}
                      <div
                        className={`flex flex-col ${
                          message.role === "user" ? "items-end" : "items-start"
                        } max-w-[70%]`}
                      >
                        <div
                          className={`
                            px-4 py-3 rounded-2xl
                            ${
                              message.role === "user"
                                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                                : "bg-[#18181B] border border-[#1F1F23] text-white"
                            }
                          `}
                        >
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">
                            {message.content}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500 mt-1 px-2">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </motion.div>
                  ))}

                  {/* Typing Indicator */}
                  {chatLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-[#18181B] border border-[#1F1F23] px-4 py-3 rounded-2xl">
                        <div className="flex gap-1">
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 0.6 }}
                            className="w-2 h-2 bg-gray-400 rounded-full"
                          />
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{
                              repeat: Infinity,
                              duration: 0.6,
                              delay: 0.2,
                            }}
                            className="w-2 h-2 bg-gray-400 rounded-full"
                          />
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{
                              repeat: Infinity,
                              duration: 0.6,
                              delay: 0.4,
                            }}
                            className="w-2 h-2 bg-gray-400 rounded-full"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="px-6 py-4 border-t border-[#1F1F23] bg-[#111113]">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      disabled={chatLoading}
                      className="flex-1 px-4 py-3 bg-[#0B0B0C] border border-[#1F1F23] rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 outline-none transition-all placeholder:text-gray-600 disabled:opacity-50"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!input.trim() || chatLoading}
                      className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl font-medium transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {chatLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Press Enter to send • Shift+Enter for new line
                  </p>
                </div>
              </div>

              {/* Tips */}
              <div className="mt-6 p-4 bg-[#111113] border border-[#1F1F23] rounded-xl">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Try asking:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Where is the wedding?",
                    "What's the dress code?",
                    "When is the wedding?",
                    "Show me the schedule",
                  ].map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(suggestion)}
                      className="px-3 py-1.5 bg-[#18181B] hover:bg-[#1F1F23] border border-[#1F1F23] rounded-lg text-xs transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="voice"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-2xl mx-auto"
            >
              {/* Voice Test Container */}
              <div className="text-center">
                {/* Animated Circle */}
                <div className="relative w-64 h-64 mx-auto mb-8">
                  {/* Outer glow */}
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur-3xl"
                  />

                  {/* Middle ring */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                    className="absolute inset-8 border-2 border-blue-500/30 rounded-full"
                  />

                  {/* Inner circle */}
                  <div className="absolute inset-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/50">
                    <Phone className="w-16 h-16 text-white" />
                  </div>
                </div>

                <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  Voice Agent Test
                </h2>
                <p className="text-gray-400 mb-8">
                  Enter your phone number to receive a test call from the AI agent
                </p>

                {/* Phone Input */}
                <div className="max-w-md mx-auto mb-6">
                  <label className="block text-sm font-medium mb-2 text-left">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="91 98765 43210"
                    className="w-full px-4 py-3 bg-[#111113] border border-[#1F1F23] rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all placeholder:text-gray-600"
                  />
                  <p className="text-xs text-gray-500 mt-2 text-left">
                    Include country code (e.g., 91 for India)
                  </p>
                </div>

                {/* Call Status */}
                <AnimatePresence>
                  {callStatus && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`
                        max-w-md mx-auto mb-6 p-4 rounded-xl border flex items-start gap-3
                        ${
                          callStatus === "success"
                            ? "bg-emerald-500/5 border-emerald-500/30"
                            : callStatus === "error"
                            ? "bg-red-500/5 border-red-500/30"
                            : "bg-blue-500/5 border-blue-500/30"
                        }
                      `}
                    >
                      {callStatus === "success" ? (
                        <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      ) : callStatus === "calling" ? (
                        <Loader2 className="w-5 h-5 text-blue-500 animate-spin flex-shrink-0 mt-0.5" />
                      ) : (
                        <div className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5">⚠️</div>
                      )}
                      <div className="text-left">
                        <p
                          className={`font-medium text-sm ${
                            callStatus === "success"
                              ? "text-emerald-400"
                              : callStatus === "error"
                              ? "text-red-400"
                              : "text-blue-400"
                          }`}
                        >
                          {callStatus === "success"
                            ? "Call Initiated!"
                            : callStatus === "calling"
                            ? "Initiating Call..."
                            : "Call Failed"}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {callStatus === "success"
                            ? "You should receive a call shortly. Please answer to test the voice agent."
                            : callStatus === "calling"
                            ? "Please wait while we connect you..."
                            : "Failed to initiate the test call. Please try again."}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Call Button */}
                <button
                  onClick={handleVoiceTest}
                  disabled={voiceLoading}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto"
                >
                  {voiceLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Initiating Call...
                    </>
                  ) : (
                    <>
                      <Phone className="w-5 h-5" />
                      Start Voice Test
                    </>
                  )}
                </button>

                {/* What to Expect */}
                <div className="mt-12 max-w-md mx-auto bg-[#111113] border border-[#1F1F23] rounded-xl p-6 text-left">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    What to expect:
                  </h4>
                  <ul className="space-y-3 text-sm text-gray-400">
                    <li className="flex items-start gap-3">
                      <span className="text-blue-400 mt-1">1.</span>
                      <span>You'll receive a call within 30 seconds</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-400 mt-1">2.</span>
                      <span>
                        The voice agent will greet you and start the conversation
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-400 mt-1">3.</span>
                      <span>
                        You can ask questions about the event or test RSVP flow
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-400 mt-1">4.</span>
                      <span>
                        The call will be recorded for your review
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TestAgent;