import React, { useState } from "react";
import { motion } from "framer-motion";
import { Phone, MessageSquare, Send, Mic } from "lucide-react";
import toast from "react-hot-toast";
import useAuthUser from "../../../hooks/useAuthUser";
import {
  testVoiceAgent,
  testChatAgent,
  syncVoiceTest,
} from "../../../api/agentTests";
import { useParams, useNavigate } from "react-router-dom";

const TestAgent = () => {
  const { agent_id } = useParams();
  const { userId } = useAuthUser();
  const navigate = useNavigate();

  const [mode, setMode] = useState("voice");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const [chatMessages, setChatMessages] = useState([]);
  const [message, setMessage] = useState("");

  /* =============================
     VOICE TEST
  ============================== */
  const handleVoiceTest = async () => {
    if (!phone.trim()) return toast.error("Enter phone number");

    try {
      setLoading(true);

      const res = await testVoiceAgent(agent_id, {
        to_number: phone,
      });

      toast.success("Call initiated");

      // optional auto-sync after 10 sec
      setTimeout(async () => {
        await syncVoiceTest(res.data.conversation_id);
      }, 10000);

      navigate("/agents/test-history");
    } catch (err) {
      toast.error("Failed to initiate call");
    } finally {
      setLoading(false);
    }
  };

  /* =============================
     CHAT TEST
  ============================== */
  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMsg = { role: "user", text: message };
    setChatMessages((prev) => [...prev, userMsg]);
    setMessage("");

    try {
      const res = await testChatAgent(agent_id, {
        user_id: userId,
        message,
      });

      const botMsg = { role: "agent", text: res.data.response };
      setChatMessages((prev) => [...prev, botMsg]);
    } catch {
      toast.error("Chat failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A0B] via-[#0B0B0C] to-[#0A0A0B] text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Mode Toggle */}
        <div className="flex justify-end gap-3 mb-8">
          <button
            onClick={() => setMode("chat")}
            className="px-4 py-2 rounded-lg bg-[#1A1A25] hover:bg-[#222] border border-[#2A2A3A]"
          >
            <MessageSquare size={16} className="inline mr-2" />
            Switch to Chat
          </button>
          <button
            onClick={() => setMode("voice")}
            className="px-4 py-2 rounded-lg bg-[#1A1A25] hover:bg-[#222] border border-[#2A2A3A]"
          >
            <Mic size={16} className="inline mr-2" />
            Switch to Voice
          </button>
        </div>

        {mode === "voice" ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-16"
          >
            <div className="w-48 h-48 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-teal-500 blur-2xl opacity-30" />
            <h2 className="text-xl font-semibold mt-6">Call AI Agent</h2>

            <input
              type="text"
              placeholder="Enter phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-6 w-full max-w-sm bg-[#1A1A25] border border-[#2A2A3A] rounded-xl px-4 py-3"
            />

            <button
              onClick={handleVoiceTest}
              disabled={loading}
              className="mt-4 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-teal-600 hover:opacity-90"
            >
              {loading ? "Calling..." : "Call Now"}
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8"
          >
            <div className="h-[400px] overflow-y-auto border border-[#1F1F2E] rounded-xl p-4 bg-[#12121A]">
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-3 ${
                    msg.role === "user"
                      ? "text-right"
                      : "text-left text-blue-300"
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-4">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 bg-[#1A1A25] border border-[#2A2A3A] rounded-xl px-4 py-3"
                placeholder="Send message..."
              />
              <button
                onClick={handleSendMessage}
                className="px-5 rounded-xl bg-blue-600 hover:bg-blue-700"
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TestAgent;
