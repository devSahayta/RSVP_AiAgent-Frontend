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
  History,
  Info,
  RotateCcw,
} from "lucide-react";
import useAuthUser from "../../../hooks/useAuthUser";

const TestAgent = () => {
  const { agent_id } = useParams();
  const { userId } = useAuthUser();
  const navigate = useNavigate();

  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("chat"); // "chat" | "voice"

  // Voice state
  const [phoneNumber, setPhoneNumber] = useState("");
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [callStatus, setCallStatus] = useState(null);

  // Chat state
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [conversationState, setConversationState] = useState(null);
  const [collectedAnswers, setCollectedAnswers] = useState({});
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchAgent();
  }, [agent_id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Set initial greeting message when switching to chat
  useEffect(() => {
    if (mode === "chat" && messages.length === 0 && agent) {
      const fieldMode = agent.field_mode || "classic";
      const greeting =
        fieldMode === "smart_fields"
          ? `Hi! 👋 I'm the AI assistant for **${agent.event_title || agent.agent_name}**. Say anything to get started — I'll guide you through ${agent.smart_fields?.length || 0} question(s).`
          : `Hi! 👋 I'm your assistant for **${agent.event_title || agent.agent_name}**. How can I help you today?`;

      setMessages([
        {
          role: "assistant",
          content: greeting,
          timestamp: new Date(),
        },
      ]);
    }
  }, [mode, agent]);

  const fetchAgent = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/agent-system/${agent_id}`,
      );
      const data = await res.json();
      if (data.success) {
        setAgent(data.data);
      } else {
        toast.error("Failed to load agent");
        navigate("/agents");
      }
    } catch {
      toast.error("Failed to load agent");
      navigate("/agents");
    } finally {
      setLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([]);
    setConversationState(null);
    setCollectedAnswers({});
    setInput("");
    // Trigger re-greeting
    if (agent) {
      const fieldMode = agent.field_mode || "classic";
      const greeting =
        fieldMode === "smart_fields"
          ? `Hi! 👋 I'm the AI assistant for **${agent.event_title || agent.agent_name}**. Say anything to get started — I'll guide you through ${agent.smart_fields?.length || 0} question(s).`
          : `Hi! 👋 I'm your assistant for **${agent.event_title || agent.agent_name}**. How can I help you today?`;
      setMessages([
        { role: "assistant", content: greeting, timestamp: new Date() },
      ]);
    }
  };

  const handleVoiceTest = async () => {
    if (!phoneNumber.trim()) {
      toast.error("Please enter a phone number");
      return;
    }

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
          body: JSON.stringify({ user_id: userId, to_number: phoneNumber }),
        },
      );
      const data = await res.json();

      if (data.success) {
        setCallStatus("success");
        toast.success("Call initiated! You'll receive a call shortly.");
      } else {
        setCallStatus("error");
        toast.error(data.message || data.error || "Failed to initiate call");
      }
    } catch {
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
            conversation_state: conversationState,
          }),
        },
      );
      const data = await res.json();

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.response,
            timestamp: new Date(),
          },
        ]);
        setConversationState(data.conversation_state);
        // Update collected answers display
        if (data.metadata?.collected_answers) {
          setCollectedAnswers(data.metadata.collected_answers);
        }
      } else {
        const errMsg =
          data.error === "Insufficient credits for test chat"
            ? "You don't have enough credits. Please top up to continue testing."
            : data.error || "Failed to get response";
        toast.error(errMsg);
        setMessages((prev) => prev.slice(0, -1));
      }
    } catch {
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

  const isCompleted = conversationState?.callStatus === "completed";
  const fieldMode = agent?.field_mode || "classic";
  const smartFields = agent?.smart_fields || [];
  const hasCollectedAnswers = Object.keys(collectedAnswers).length > 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-white">
      {/* ── Header ──────────────────────────────────────────────────── */}
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
                <p className="text-sm text-gray-400">
                  {agent?.agent_name}
                  {fieldMode === "smart_fields" && (
                    <span className="ml-2 px-1.5 py-0.5 bg-teal-500/20 text-teal-400 text-xs rounded">
                      Smart Fields
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* History */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/agents/test-history")}
                className="relative group flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-[#111113] border border-[#1F1F23] hover:bg-[#18181B] transition-all text-sm font-medium"
              >
                <History className="w-4 h-4 text-purple-400" />
                <span className="hidden sm:inline">Test History</span>
              </motion.button>

              {/* Mode Toggle */}
              <div className="flex items-center gap-2 bg-[#111113] p-1 rounded-xl border border-[#1F1F23]">
                <button
                  onClick={() => setMode("chat")}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                    mode === "chat"
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <MessageSquare className="w-4 h-4" /> Chat Test
                </button>
                <button
                  onClick={() => setMode("voice")}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                    mode === "voice"
                      ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Phone className="w-4 h-4" /> Voice Test
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {/* ── CHAT ── */}
          {mode === "chat" ? (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-[#111113] rounded-2xl border border-[#1F1F23] overflow-hidden shadow-2xl">
                {/* Chat Header */}
                <div className="px-6 py-4 border-b border-[#1F1F23] bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{agent?.agent_name}</h3>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                          <span>Online • Test Mode</span>
                        </div>
                      </div>
                    </div>
                    {/* Reset button */}
                    <button
                      onClick={resetChat}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-[#18181B] hover:bg-[#222225] border border-[#1F1F23] rounded-lg transition-all"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset Chat
                    </button>
                  </div>

                  {/* Mode badge */}
                  <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    {fieldMode === "smart_fields" ? (
                      <p className="text-xs text-blue-300 leading-relaxed">
                        🧪{" "}
                        <span className="font-semibold">
                          Smart Fields Test Mode:
                        </span>{" "}
                        The agent will collect {smartFields.length} custom
                        field(s) from you. Document uploads are disabled in test
                        mode.
                      </p>
                    ) : (
                      <p className="text-xs text-blue-300 leading-relaxed">
                        🧪{" "}
                        <span className="font-semibold">
                          Classic Test Mode Active:
                        </span>{" "}
                        Document uploads (ID proof & travel docs) are disabled.
                        You can test the RSVP flow and ask event questions!
                      </p>
                    )}
                  </div>
                </div>

                {/* Two-column layout: messages + collected answers panel */}
                <div className="flex">
                  {/* Messages */}
                  <div className="flex-1 h-[500px] overflow-y-auto p-6 space-y-4 bg-[#0B0B0C]">
                    {messages.map((message, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                      >
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
                        <div
                          className={`flex flex-col ${message.role === "user" ? "items-end" : "items-start"} max-w-[75%]`}
                        >
                          <div
                            className={`px-4 py-3 rounded-2xl ${
                              message.role === "user"
                                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                                : "bg-[#18181B] border border-[#1F1F23] text-white"
                            }`}
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
                            {[0, 0.2, 0.4].map((delay, i) => (
                              <motion.div
                                key={i}
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{
                                  repeat: Infinity,
                                  duration: 0.6,
                                  delay,
                                }}
                                className="w-2 h-2 bg-gray-400 rounded-full"
                              />
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Completion banner */}
                    {isCompleted && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center"
                      >
                        <Check className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                        <p className="text-sm text-emerald-400 font-medium">
                          Test conversation completed!
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Hit "Reset Chat" to start a new test
                        </p>
                      </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Collected Answers Panel — smart fields only */}
                  {fieldMode === "smart_fields" && (
                    <div className="w-64 border-l border-[#1F1F23] bg-[#0D0D0F] p-4 flex flex-col gap-3 h-[500px] overflow-y-auto">
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Collected Answers
                      </h4>
                      {!hasCollectedAnswers ? (
                        <p className="text-xs text-gray-600">
                          Nothing collected yet...
                        </p>
                      ) : (
                        Object.entries(collectedAnswers).map(([key, value]) => (
                          <div
                            key={key}
                            className="p-2.5 bg-[#111113] border border-[#1F1F23] rounded-lg"
                          >
                            <p className="text-xs text-gray-400 mb-0.5 capitalize">
                              {key.replace(/_/g, " ")}
                            </p>
                            <p className="text-sm text-white font-medium">
                              {String(value)}
                            </p>
                          </div>
                        ))
                      )}

                      {/* Fields progress */}
                      <div className="mt-auto pt-3 border-t border-[#1F1F23]">
                        <p className="text-xs text-gray-500">
                          {Object.keys(collectedAnswers).length} /{" "}
                          {smartFields.length} fields
                        </p>
                        <div className="w-full bg-[#1F1F23] rounded-full h-1.5 mt-1.5">
                          <div
                            className="bg-gradient-to-r from-teal-500 to-emerald-500 h-1.5 rounded-full transition-all"
                            style={{
                              width: `${smartFields.length ? (Object.keys(collectedAnswers).length / smartFields.length) * 100 : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="px-6 py-4 border-t border-[#1F1F23] bg-[#111113]">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={
                        isCompleted
                          ? "Reset chat to start over..."
                          : "Type your message..."
                      }
                      disabled={chatLoading || isCompleted}
                      className="flex-1 px-4 py-3 bg-[#0B0B0C] border border-[#1F1F23] rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 outline-none transition-all placeholder:text-gray-600 disabled:opacity-50"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!input.trim() || chatLoading || isCompleted}
                      className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl font-medium transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                  {fieldMode === "smart_fields"
                    ? "About Smart Fields Testing:"
                    : "Try asking:"}
                </h4>
                {fieldMode === "smart_fields" ? (
                  <div className="space-y-1.5">
                    {smartFields.slice(0, 5).map((field, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-xs text-gray-400"
                      >
                        <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-xs shrink-0">
                          {i + 1}
                        </span>
                        <span>
                          <span className="text-gray-300">
                            {field.field_label}
                          </span>
                          {field.ai_question && (
                            <span className="text-gray-500">
                              {" "}
                              — "{field.ai_question}"
                            </span>
                          )}
                        </span>
                      </div>
                    ))}
                    {smartFields.length > 5 && (
                      <p className="text-xs text-gray-600">
                        +{smartFields.length - 5} more fields...
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Where is the event?",
                      "What's the dress code?",
                      "When does it start?",
                      "I'll be attending",
                      "I'm bringing 2 guests",
                    ].map((s, i) => (
                      <button
                        key={i}
                        onClick={() => setInput(s)}
                        className="px-3 py-1.5 bg-[#18181B] hover:bg-[#1F1F23] border border-[#1F1F23] rounded-lg text-xs transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            /* ── VOICE ── */
            <motion.div
              key="voice"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-2xl mx-auto"
            >
              <div className="text-center">
                {/* Animated Circle */}
                <div className="relative w-64 h-64 mx-auto mb-8">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur-3xl"
                  />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 3,
                      ease: "linear",
                    }}
                    className="absolute inset-8 border-2 border-blue-500/30 rounded-full"
                  />
                  <div className="absolute inset-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/50">
                    <Phone className="w-16 h-16 text-white" />
                  </div>
                </div>

                <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  Voice Agent Test
                </h2>
                <p className="text-gray-400 mb-8">
                  Enter your phone number to receive a test call from the AI
                  agent
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
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3 bg-[#111113] border border-[#1F1F23] rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all placeholder:text-gray-600"
                  />
                  <p className="text-xs text-gray-500 mt-2 text-left">
                    Include country code (e.g., +91 for India)
                  </p>
                </div>

                {/* Call Status */}
                <AnimatePresence>
                  {callStatus && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`max-w-md mx-auto mb-4 p-4 rounded-xl border flex items-start gap-3 ${
                        callStatus === "success"
                          ? "bg-emerald-500/5 border-emerald-500/30"
                          : callStatus === "error"
                            ? "bg-red-500/5 border-red-500/30"
                            : "bg-blue-500/5 border-blue-500/30"
                      }`}
                    >
                      {callStatus === "success" ? (
                        <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      ) : callStatus === "calling" ? (
                        <Loader2 className="w-5 h-5 text-blue-500 animate-spin flex-shrink-0 mt-0.5" />
                      ) : (
                        <span className="flex-shrink-0 mt-0.5">⚠️</span>
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

                {/* Auto-deduction info note */}
                <AnimatePresence>
                  {callStatus === "success" && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="max-w-md mx-auto mb-6 p-3 rounded-xl bg-[#111113] border border-[#1F1F23] flex items-start gap-2 text-left"
                    >
                      <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-400 leading-relaxed">
                        Credits are deducted automatically once your call ends —
                        even if you close this tab. Check your updated balance
                        in{" "}
                        <button
                          onClick={() => navigate("/agents/test-history")}
                          className="text-blue-400 hover:underline"
                        >
                          Test History
                        </button>
                        .
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Call Button */}
                <button
                  onClick={handleVoiceTest}
                  disabled={voiceLoading}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto"
                >
                  {voiceLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Initiating
                      Call...
                    </>
                  ) : (
                    <>
                      <Phone className="w-5 h-5" />{" "}
                      {callStatus === "success"
                        ? "Start Another Test"
                        : "Start Voice Test"}
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
                    {[
                      "You'll receive a call within 30 seconds",
                      "The voice agent will greet you and start the conversation",
                      "You can ask questions about the event or test the RSVP flow",
                      "Credits are deducted automatically after the call ends — no need to keep this tab open",
                    ].map((text, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-blue-400 mt-1">{i + 1}.</span>
                        <span>{text}</span>
                      </li>
                    ))}
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
