import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Phone, MessageSquare, Activity, TestTube, Plus } from "lucide-react";

import { fetchUserAgents } from "../../api/agents";
import useAuthUser from "../../hooks/useAuthUser";

const ListAgents = () => {
  const { userId } = useAuthUser();
  const navigate = useNavigate();

  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const loadAgents = async () => {
      try {
        const res = await fetchUserAgents(userId);
        setAgents(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch agents", err);
      } finally {
        setLoading(false);
      }
    };

    loadAgents();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] text-white flex items-center justify-center">
        Loading Agents...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white px-8 py-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold">Your Agents</h1>
          <p className="text-gray-400 text-sm mt-1">
            Manage and test your AI Agents
          </p>
        </div>

        <button
          onClick={() => navigate("/agents/create")}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2 rounded-lg font-medium hover:opacity-90 transition"
        >
          <Plus size={18} />
          Create Agent
        </button>
      </div>

      {/* Agents Grid */}
      {agents.length === 0 ? (
        <div className="text-gray-400">No agents found.</div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {agents.map((agent, index) => (
            <motion.div
              key={agent.agent_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#1e293b] rounded-xl p-6 border border-gray-700 hover:border-indigo-500 transition-all shadow-lg hover:shadow-indigo-500/10"
            >
              {/* Top Section */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold">{agent.agent_name}</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    {agent.agent_description}
                  </p>
                </div>

                <span
                  className={`text-xs px-3 py-1 rounded-full ${
                    agent.status === "unassigned"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-green-500/20 text-green-400"
                  }`}
                >
                  {agent.status}
                </span>
              </div>

              {/* Template & KB */}
              <div className="text-sm text-gray-400 mb-4 space-y-1">
                <p>
                  Template:{" "}
                  <span className="text-white">
                    {agent.agent_templates?.name}
                  </span>
                </p>
                <p>
                  Knowledge Base:{" "}
                  <span className="text-white">
                    {agent.knowledge_bases?.name}
                  </span>
                </p>
              </div>

              {/* Stats */}
              <div className="flex justify-between text-sm text-gray-300 mb-6">
                <div className="flex items-center gap-2">
                  <Phone size={16} />
                  {agent.total_calls}
                </div>

                <div className="flex items-center gap-2">
                  <MessageSquare size={16} />
                  {agent.total_chats}
                </div>

                <div className="flex items-center gap-2">
                  <Activity size={16} />
                  {agent.total_tests}
                </div>
              </div>

              {/* Features */}
              <div className="flex gap-2 mb-6">
                {agent.voice_enabled && (
                  <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                    Voice Enabled
                  </span>
                )}
                {agent.chat_enabled && (
                  <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                    Chat Enabled
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-between">
                <button
                  onClick={() => navigate(`/agents/${agent.agent_id}`)}
                  className="text-sm text-indigo-400 hover:text-indigo-300 transition"
                >
                  View Details
                </button>

                <button
                  onClick={() => navigate(`/agents/${agent.agent_id}/test`)}
                  className="flex items-center gap-1 text-sm bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition"
                >
                  <TestTube size={14} />
                  Test Agent
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListAgents;
