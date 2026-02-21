import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Phone,
  MessageSquare,
  Activity,
  TestTube,
  Plus,
  Sparkles,
  Trash2,
  Bot,
} from "lucide-react";

import { deleteAgentById, fetchUserAgents } from "../../api/agents";
import useAuthUser from "../../hooks/useAuthUser";

const ListAgents = () => {
  const { userId } = useAuthUser();
  const navigate = useNavigate();

  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

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

  const handleDelete = async (agentId, agentName) => {
    const shouldDelete = window.confirm(
      `Delete "${agentName}"? This action cannot be undone.`,
    );

    if (!shouldDelete) return;

    try {
      setDeletingId(agentId);
      await deleteAgentById(agentId);
      setAgents((prev) => prev.filter((item) => item.agent_id !== agentId));
      toast.success("Agent deleted");
    } catch (error) {
      console.error("Failed to delete agent", error);
      toast.error("Failed to delete agent");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0A0A0B] via-[#0B0B0C] to-[#0A0A0B] text-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-blue-300">
          <Sparkles className="h-5 w-5 animate-pulse" />
          <span>Loading Agents...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#0A0A0B] via-[#0B0B0C] to-[#0A0A0B] text-white px-4 py-8 md:px-8 md:py-10">
      <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-40 h-80 w-80 rounded-full bg-teal-500/10 blur-3xl" />

      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex flex-wrap items-start justify-between gap-4"
        >
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-gradient-to-r from-blue-500/10 to-teal-500/10 px-4 py-2 text-sm text-blue-200">
              <Sparkles className="h-4 w-4 text-blue-400" />
              Agent Workspace
            </div>
            <h1 className="text-3xl font-bold md:text-4xl">Your Agents</h1>
            <p className="mt-1 text-sm text-gray-400">
              Manage and test your AI Agents
            </p>
          </div>

          <button
            onClick={() => navigate("/agents/create")}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 via-blue-600 to-teal-600 px-5 py-2.5 font-medium shadow-lg shadow-blue-500/20 transition hover:scale-[1.02] hover:opacity-90"
          >
            <Plus size={18} />
            Create Agent
          </button>
        </motion.div>

        {agents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-[#1F1F2E] bg-gradient-to-br from-[#12121A] via-[#14141C] to-[#12121A] p-10 text-center"
          >
            <Bot className="mx-auto mb-4 h-10 w-10 text-blue-400" />
            <p className="text-lg text-gray-300">No agents found.</p>
            <p className="mt-1 text-sm text-gray-500">
              Create your first agent to get started.
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.08 } },
            }}
            className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
          >
            <AnimatePresence>
              {agents.map((agent) => (
                <motion.div
                  key={agent.agent_id}
                  layout
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group rounded-2xl border border-[#1F1F2E] bg-gradient-to-br from-[#12121A] via-[#14141C] to-[#12121A] p-6 shadow-xl transition hover:border-blue-500/40 hover:shadow-blue-500/10"
                >
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold">{agent.agent_name}</h2>
                      <p className="mt-1 line-clamp-2 text-sm text-gray-400">
                        {agent.agent_description || "No description"}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs ${
                        agent.status === "unassigned"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-emerald-500/20 text-emerald-400"
                      }`}
                    >
                      {agent.status}
                    </span>
                  </div>

                  <div className="mb-5 space-y-2 text-sm text-gray-400">
                    <p>
                      Template:{" "}
                      <span className="font-medium text-gray-200">
                        {agent.agent_templates?.name || "Not linked"}
                      </span>
                    </p>
                    <p>
                      Knowledge Base:{" "}
                      <span className="font-medium text-gray-200">
                        {agent.knowledge_bases?.name || "Not linked"}
                      </span>
                    </p>
                  </div>

                  <div className="mb-5 flex justify-between text-sm text-gray-300">
                    <div className="flex items-center gap-2">
                      <Phone size={15} />
                      {agent.total_calls}
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare size={15} />
                      {agent.total_chats}
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity size={15} />
                      {agent.total_tests}
                    </div>
                  </div>

                  <div className="mb-6 flex flex-wrap gap-2">
                    {agent.voice_enabled && (
                      <span className="rounded-lg bg-blue-500/20 px-2 py-1 text-xs text-blue-300">
                        Voice Enabled
                      </span>
                    )}
                    {agent.chat_enabled && (
                      <span className="rounded-lg bg-teal-500/20 px-2 py-1 text-xs text-teal-300">
                        Chat Enabled
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => navigate(`/agents/${agent.agent_id}`)}
                      className="text-sm text-blue-300 transition hover:text-blue-200"
                    >
                      View Details
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDelete(agent.agent_id, agent.agent_name)}
                        disabled={deletingId === agent.agent_id}
                        className="flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-sm text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Trash2 size={14} />
                        {deletingId === agent.agent_id ? "Deleting..." : "Delete"}
                      </button>

                      <button
                        onClick={() => navigate(`/agents/${agent.agent_id}/test`)}
                        className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-1.5 text-sm transition hover:opacity-90"
                      >
                        <TestTube size={14} />
                        Test Agent
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ListAgents;
