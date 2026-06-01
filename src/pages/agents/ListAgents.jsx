import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Phone,
  MessageSquare,
  Activity,
  TestTube,
  Plus,
  Sparkles,
  Trash2,
  Bot,
  Layers,
  Wand2,
  Calendar,
} from "lucide-react";

import { deleteAgentById, fetchUserAgents } from "../../api/agents";
import useAuthUser from "../../hooks/useAuthUser";
import {
  showError,
  showLoading,
  showSuccess,
  dismissToast,
} from "../../utils/toast";

const ListAgents = () => {
  const { userId } = useAuthUser();
  const navigate = useNavigate();

  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteWarning, setDeleteWarning] = useState(null);
  const [filter, setFilter] = useState("all"); // all | classic | smart_fields

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

    const toastId = showLoading("Deleting agent...");
    try {
      setDeletingId(agentId);
      setDeleteWarning(null);
      const res = await deleteAgentById(agentId);
      const payload = res?.data;

      if (payload?.success) {
        setAgents((prev) => prev.filter((item) => item.agent_id !== agentId));
        dismissToast(toastId);
        showSuccess(payload?.message || "Agent deleted");
        return;
      }
      if (payload?.warning) {
        setDeleteWarning(payload);
        dismissToast(toastId);
        showError(payload?.message || "Agent is linked to event(s).");
        return;
      }
      dismissToast(toastId);
      showError(payload?.error || payload?.message || "Failed to delete agent");
    } catch (error) {
      console.error("Failed to delete agent", error);
      dismissToast(toastId);
      showError(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Failed to delete agent",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const filteredAgents = agents.filter((a) => {
    if (filter === "all") return true;
    return a.field_mode === filter;
  });

  const classicCount = agents.filter(
    (a) => a.field_mode === "classic" || !a.field_mode,
  ).length;
  const smartCount = agents.filter(
    (a) => a.field_mode === "smart_fields",
  ).length;

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
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-wrap items-start justify-between gap-4"
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

        {/* ── Filter tabs + summary ── */}
        {agents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-8 flex flex-wrap items-center gap-3"
          >
            {/* Filter pills */}
            {[
              { key: "all", label: "All", count: agents.length },
              { key: "classic", label: "Classic", count: classicCount },
              { key: "smart_fields", label: "Smart Fields", count: smartCount },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition
                  ${
                    filter === tab.key
                      ? tab.key === "smart_fields"
                        ? "bg-teal-500/20 border border-teal-500/40 text-teal-300"
                        : "bg-blue-500/20 border border-blue-500/40 text-blue-300"
                      : "bg-[#0E0E14] border border-[#1F1F2E] text-gray-400 hover:border-[#2A2A3E]"
                  }`}
              >
                {tab.key === "classic" && <Layers size={13} />}
                {tab.key === "smart_fields" && <Wand2 size={13} />}
                {tab.label}
                <span
                  className={`rounded-md px-1.5 py-0.5 text-xs font-bold
                  ${
                    filter === tab.key
                      ? tab.key === "smart_fields"
                        ? "bg-teal-500/30 text-teal-200"
                        : "bg-blue-500/30 text-blue-200"
                      : "bg-[#1A1A2A] text-gray-500"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </motion.div>
        )}

        {/* ── Delete warning ── */}
        {deleteWarning?.warning && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-100"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">
                  {deleteWarning.message || "Agent cannot be deleted."}
                </p>
                <p className="mt-1 text-xs text-amber-200/90">
                  Agent: {deleteWarning?.data?.agent_name || "Unknown"} | Linked
                  events: {deleteWarning?.data?.linked_events_count || 0}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate("/events")}
                  className="rounded-lg border border-amber-300/30 px-3 py-1.5 text-xs text-amber-100 transition hover:bg-amber-300/10"
                >
                  Open Events
                </button>
                <button
                  onClick={() => setDeleteWarning(null)}
                  className="rounded-lg border border-amber-300/30 px-3 py-1.5 text-xs text-amber-100 transition hover:bg-amber-300/10"
                >
                  Dismiss
                </button>
              </div>
            </div>
            {Array.isArray(deleteWarning?.data?.linked_events) &&
              deleteWarning.data.linked_events.length > 0 && (
                <div className="mt-3 text-sm">
                  <p>Linked Events</p>
                  <ul className="mt-1 ml-5 list-disc space-y-1 text-amber-100/95">
                    {deleteWarning.data.linked_events.map((evt) => (
                      <li key={evt.event_id}>{evt.event_name}</li>
                    ))}
                  </ul>
                </div>
              )}
            <p className="mt-4 text-xs font-semibold text-red-400/90">
              Tip: Delete linked event(s) first, then try deleting this agent
              again.
            </p>
          </motion.div>
        )}

        {/* ── Empty state ── */}
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
            <button
              onClick={() => navigate("/agents/create")}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-2.5 text-sm font-medium transition hover:opacity-90"
            >
              <Plus size={16} />
              Create Your First Agent
            </button>
          </motion.div>
        ) : filteredAgents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border border-[#1F1F2E] bg-[#0E0E14] p-10 text-center text-gray-500"
          >
            No {filter === "classic" ? "classic" : "smart fields"} agents found.
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.06 } },
            }}
            className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
          >
            <AnimatePresence>
              {filteredAgents.map((agent) => {
                const isSmartFields = agent.field_mode === "smart_fields";
                const smartFieldsCount = isSmartFields
                  ? (Array.isArray(agent.smart_fields)
                      ? agent.smart_fields
                      : JSON.parse(agent.smart_fields || "[]")
                    ).length
                  : 0;

                return (
                  <motion.div
                    key={agent.agent_id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => navigate(`/agents/${agent.agent_id}`)}
                    className={`group cursor-pointer rounded-2xl border bg-gradient-to-br from-[#12121A] via-[#14141C] to-[#12121A] p-5 shadow-xl transition
                      ${
                        isSmartFields
                          ? "border-[#1A2A2A] hover:border-teal-500/30 hover:shadow-teal-500/5"
                          : "border-[#1F1F2E] hover:border-blue-500/30 hover:shadow-blue-500/5"
                      }`}
                  >
                    {/* ── Card header ── */}
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        {/* Mode icon */}
                        <div
                          className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl
                          ${
                            isSmartFields
                              ? "bg-teal-500/15 border border-teal-500/20"
                              : "bg-blue-500/15 border border-blue-500/20"
                          }`}
                        >
                          {isSmartFields ? (
                            <Wand2 size={16} className="text-teal-400" />
                          ) : (
                            <Layers size={16} className="text-blue-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h2 className="truncate text-base font-semibold text-white">
                            {agent.agent_name}
                          </h2>
                          <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">
                            {agent.agent_description || "No description"}
                          </p>
                        </div>
                      </div>

                      {/* Status badge */}
                      <span
                        className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium
                        ${
                          agent.status === "unassigned"
                            ? "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20"
                            : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                        }`}
                      >
                        {agent.status}
                      </span>
                    </div>

                    {/* ── Mode + event info ── */}
                    <div className="mb-4 space-y-2">
                      {/* Mode pill */}
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold border
                          ${
                            isSmartFields
                              ? "bg-teal-500/10 text-teal-300 border-teal-500/20"
                              : "bg-blue-500/10 text-blue-300 border-blue-500/20"
                          }`}
                        >
                          {isSmartFields ? (
                            <Wand2 size={10} />
                          ) : (
                            <Layers size={10} />
                          )}
                          {isSmartFields
                            ? "Custom Smart Fields"
                            : "Classic Template"}
                        </span>
                        {isSmartFields && smartFieldsCount > 0 && (
                          <span className="rounded-lg bg-[#1A1A2A] border border-[#2A2A3E] px-2 py-0.5 text-xs text-gray-400">
                            {smartFieldsCount} field
                            {smartFieldsCount !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>

                      {/* Template / event title */}
                      <div className="text-xs text-gray-500 space-y-1">
                        {isSmartFields ? (
                          agent.event_title && (
                            <div className="flex items-center gap-1.5">
                              <Calendar size={11} className="text-gray-600" />
                              <span className="truncate">
                                {agent.event_title}
                              </span>
                            </div>
                          )
                        ) : (
                          <p>
                            Template:{" "}
                            <span className="text-gray-300">
                              {agent.agent_templates?.name || "Not linked"}
                            </span>
                          </p>
                        )}
                        <p>
                          KB:{" "}
                          <span className="text-gray-300">
                            {agent.knowledge_bases?.name || "Not linked"}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* ── Stats row ── */}
                    <div className="mb-4 flex items-center justify-between rounded-xl bg-[#0A0A0F] border border-[#1A1A2A] px-4 py-2.5 text-xs text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <Phone size={12} className="text-blue-400" />
                        <span>{agent.total_calls ?? 0}</span>
                        <span className="text-gray-600">calls</span>
                      </div>
                      <div className="h-3 w-px bg-[#2A2A3E]" />
                      <div className="flex items-center gap-1.5">
                        <MessageSquare size={12} className="text-teal-400" />
                        <span>{agent.total_chats ?? 0}</span>
                        <span className="text-gray-600">chats</span>
                      </div>
                      <div className="h-3 w-px bg-[#2A2A3E]" />
                      <div className="flex items-center gap-1.5">
                        <Activity size={12} className="text-purple-400" />
                        <span>{agent.total_tests ?? 0}</span>
                        <span className="text-gray-600">tests</span>
                      </div>
                    </div>

                    {/* ── Channel badges ── */}
                    <div className="mb-4 flex flex-wrap gap-1.5">
                      {agent.voice_enabled && (
                        <span className="flex items-center gap-1 rounded-lg bg-blue-500/10 border border-blue-500/15 px-2 py-0.5 text-xs text-blue-300">
                          <Phone size={10} /> Voice
                        </span>
                      )}
                      {agent.chat_enabled && (
                        <span className="flex items-center gap-1 rounded-lg bg-teal-500/10 border border-teal-500/15 px-2 py-0.5 text-xs text-teal-300">
                          <MessageSquare size={10} /> Chat
                        </span>
                      )}
                    </div>

                    {/* ── Actions ── */}
                    <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#1A1A2A]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/agents/${agent.agent_id}`);
                        }}
                        className="text-xs text-blue-400 transition hover:text-blue-300"
                      >
                        View Details →
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(agent.agent_id, agent.agent_name);
                          }}
                          disabled={deletingId === agent.agent_id}
                          className="flex items-center gap-1 rounded-lg border border-red-500/20 bg-red-500/8 px-2.5 py-1.5 text-xs text-red-400 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 size={12} />
                          {deletingId === agent.agent_id ? "..." : "Delete"}
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/agents/${agent.agent_id}/test`);
                          }}
                          className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-2.5 py-1.5 text-xs font-medium transition hover:opacity-90"
                        >
                          <TestTube size={12} />
                          Test
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ListAgents;
