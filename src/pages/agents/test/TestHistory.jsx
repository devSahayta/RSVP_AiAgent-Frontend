import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  MessageSquare,
  Phone,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
} from "lucide-react";

import useAuthUser from "../../../hooks/useAuthUser";
import { fetchUserTestSessions, syncVoiceTest } from "../../../api/agentTests";
import { fetchUserAgents } from "../../../api/agents";

const ITEMS_PER_PAGE = 5;
const DASHBOARD_PREVIEW_IMAGE =
  "https://ktuozsngfmpgjwzleswa.supabase.co/storage/v1/object/public/template-previews/template-preview%20img.png";

/* ===========================
   Analytics Card Component
=========================== */
const AnalyticsCard = ({ title, value }) => (
  <motion.div
    whileHover={{ y: -2 }}
    className="bg-gradient-to-br from-[#12121A] via-[#14141C] to-[#12121A] border border-[#1F1F2E] rounded-2xl p-6 shadow-lg shadow-black/20"
  >
    <p className="text-gray-400 text-sm mb-2">{title}</p>
    <h3 className="text-2xl font-bold">{value}</h3>
  </motion.div>
);

const TestHistory = () => {
  const { userId } = useAuthUser();

  const [sessions, setSessions] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [page, setPage] = useState(1);

  const [selectedSession, setSelectedSession] = useState(null);
  const [isSyncingVoice, setIsSyncingVoice] = useState(false);

  /* ===========================
     Fetch Data
  ============================ */
  useEffect(() => {
    const loadData = async () => {
      try {
        const [testsRes, agentsRes] = await Promise.all([
          fetchUserTestSessions(userId, 1, 100),
          fetchUserAgents(userId),
        ]);

        setSessions(testsRes?.data?.data || []);
        setAgents(agentsRes?.data?.data || []);
      } catch (err) {
        console.error("Error loading test history:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) loadData();
  }, [userId]);

  /* ===========================
     Agent Map
  ============================ */
  const agentMap = useMemo(() => {
    const map = {};
    agents.forEach((a) => {
      map[a.agent_id] = a.agent_name;
    });
    return map;
  }, [agents]);

  /* ===========================
     Filters (FIXED SEARCH)
  ============================ */
  const filteredSessions = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return sessions.filter((s) => {
      const agentName = (agentMap[s.agent_id] || "").toLowerCase();

      const matchSearch = !searchValue || agentName.includes(searchValue);

      const matchType = filterType === "all" || s.test_type === filterType;

      return matchSearch && matchType;
    });
  }, [sessions, search, filterType, agentMap]);

  /* Reset page when search changes */
  useEffect(() => {
    setPage(1);
  }, [search, filterType]);

  /* ===========================
     Analytics
  ============================ */
  const total = filteredSessions.length;
  const completed = filteredSessions.filter(
    (s) => s.test_status === "completed",
  ).length;

  const completionRate =
    total === 0 ? 0 : Math.round((completed / total) * 100);

  const chatCount = filteredSessions.filter(
    (s) => s.test_type === "chat",
  ).length;
  const voiceCount = filteredSessions.filter(
    (s) => s.test_type === "voice",
  ).length;

  /* ===========================
     Pagination
  ============================ */
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const paginatedSessions = filteredSessions.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const formatDate = (date) => (date ? new Date(date).toLocaleString() : "-");

  const getTranscriptMessages = (rawTranscript) => {
    if (!rawTranscript) return [];

    let parsed = rawTranscript;
    if (typeof rawTranscript === "string") {
      try {
        parsed = JSON.parse(rawTranscript);
      } catch {
        return [];
      }
    }

    if (Array.isArray(parsed)) {
      return parsed
        .filter(
          (item) =>
            item &&
            typeof item === "object" &&
            typeof item.message === "string" &&
            item.message.trim() &&
            (item.role === "user" ||
              item.role === "assistant" ||
              item.role === "agent"),
        )
        .map((item) => ({
          ...item,
          role: item.role === "agent" ? "assistant" : item.role,
        }));
    }

    if (
      parsed &&
      typeof parsed === "object" &&
      Array.isArray(parsed.messages)
    ) {
      return parsed.messages
        .filter(
          (item) =>
            item &&
            typeof item === "object" &&
            typeof item.message === "string" &&
            item.message.trim() &&
            (item.role === "user" ||
              item.role === "assistant" ||
              item.role === "agent"),
        )
        .map((item) => ({
          ...item,
          role: item.role === "agent" ? "assistant" : item.role,
        }));
    }

    if (typeof parsed === "string") {
      try {
        const nested = JSON.parse(parsed);
        if (Array.isArray(nested)) {
          return nested
            .filter(
              (item) =>
                item &&
                typeof item === "object" &&
                typeof item.message === "string" &&
                item.message.trim() &&
                (item.role === "user" ||
                  item.role === "assistant" ||
                  item.role === "agent"),
            )
            .map((item) => ({
              ...item,
              role: item.role === "agent" ? "assistant" : item.role,
            }));
        }
      } catch {
        return [];
      }
      return [];
    }

    if (Array.isArray(parsed?.transcript)) {
      return parsed.transcript
        .filter(
          (item) =>
            item &&
            typeof item === "object" &&
            typeof item.message === "string" &&
            item.message.trim() &&
            (item.role === "user" ||
              item.role === "assistant" ||
              item.role === "agent"),
        )
        .map((item) => ({
          ...item,
          role: item.role === "agent" ? "assistant" : item.role,
        }));
    }

    if (Array.isArray(parsed?.conversation)) {
      return parsed.conversation
        .filter(
          (item) =>
            item &&
            typeof item === "object" &&
            typeof item.message === "string" &&
            item.message.trim() &&
            (item.role === "user" ||
              item.role === "assistant" ||
              item.role === "agent"),
        )
        .map((item) => ({
          ...item,
          role: item.role === "agent" ? "assistant" : item.role,
        }));
    }

    if (Array.isArray(parsed?.data)) {
      return parsed.data
        .filter(
          (item) =>
            item &&
            typeof item === "object" &&
            typeof item.message === "string" &&
            item.message.trim() &&
            (item.role === "user" ||
              item.role === "assistant" ||
              item.role === "agent"),
        )
        .map((item) => ({
          ...item,
          role: item.role === "agent" ? "assistant" : item.role,
        }));
    }

    if (Array.isArray(parsed?.turns)) {
      return parsed.turns
        .filter(
          (item) =>
            item &&
            typeof item === "object" &&
            typeof item.message === "string" &&
            item.message.trim() &&
            (item.role === "user" ||
              item.role === "assistant" ||
              item.role === "agent"),
        )
        .map((item) => ({
          ...item,
          role: item.role === "agent" ? "assistant" : item.role,
        }));
    }

    if (Array.isArray(parsed?.conversation_transcript)) {
      return parsed.conversation_transcript.filter(
        (item) =>
          item &&
          typeof item === "object" &&
          typeof item.message === "string" &&
          item.message.trim() &&
          (item.role === "user" || item.role === "assistant"),
      );
    }

    if (
      parsed &&
      typeof parsed === "object" &&
      (parsed.user_message || parsed.agent_response)
    ) {
      return [
        parsed.user_message
          ? { role: "user", message: parsed.user_message, timestamp: null }
          : null,
        parsed.agent_response
          ? {
              role: "assistant",
              message: parsed.agent_response,
              timestamp: null,
            }
          : null,
      ].filter(Boolean);
    }

    return [];
  };

  const handleSessionOpen = async (session) => {
    setSelectedSession(session);

    const shouldSyncVoice =
      session?.test_type === "voice" &&
      session?.test_status !== "completed" &&
      session?.batch_id;

    if (!shouldSyncVoice) return;

    try {
      setIsSyncingVoice(true);
      await syncVoiceTest(session.batch_id);

      const refreshed = await fetchUserTestSessions(userId, 1, 100);
      const updatedSessions = refreshed?.data?.data || [];
      setSessions(updatedSessions);

      const updatedSelected =
        updatedSessions.find(
          (item) => item.test_session_id === session.test_session_id,
        ) ||
        updatedSessions.find(
          (item) => item.batch_id && item.batch_id === session.batch_id,
        );

      if (updatedSelected) {
        setSelectedSession(updatedSelected);
      }
    } catch (err) {
      console.error("Error syncing voice test:", err);
    } finally {
      setIsSyncingVoice(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0A0A0B] via-[#0B0B0C] to-[#0A0A0B] flex items-center justify-center text-blue-300">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 animate-pulse" />
          <span>Loading Test History...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#0A0A0B] via-[#0B0B0C] to-[#0A0A0B] text-white px-4 py-8 md:px-8 md:py-10">
      <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-40 h-80 w-80 rounded-full bg-teal-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-8 left-1/3 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex flex-col "
        >
          <div className=" mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-gradient-to-r from-blue-500/10 to-teal-500/10 px-4 py-2 text-sm text-blue-200">
            <Sparkles className="h-4 w-4 text-blue-400" />
            Session Analytics
          </div>
          <h1 className="text-4xl font-bold mb-2 mx-auto ">Test History</h1>
          <p className="text-gray-400 mx-auto ">
            Monitor and analyze your AI agent test sessions
          </p>
        </motion.div>

        {/* ANALYTICS CARDS */}
        {/* <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.08 } },
          }}
          className="grid md:grid-cols-4 gap-6 mb-10"
        >
          <AnalyticsCard title="Total Tests" value={total} />
          <AnalyticsCard title="Completed %" value={`${completionRate}%`} />
          <AnalyticsCard title="Chat Tests" value={chatCount} />
          <AnalyticsCard title="Voice Tests" value={voiceCount} />
        </motion.div> */}

        {/* SEARCH + FILTER */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col md:flex-row gap-4 mb-8"
        >
          <div className="flex items-center gap-3 bg-[#14141C]/90 border border-[#1F1F2E] rounded-xl px-4 py-3 flex-1 backdrop-blur-sm">
            <Search size={18} className="text-gray-500" />
            <input
              type="text"
              placeholder="Search by Agent..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none w-full text-white placeholder-gray-500"
            />
          </div>

          <div className="flex gap-2">
            {["all", "chat", "voice"].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  filterType === type
                    ? "bg-gradient-to-r from-blue-500 to-teal-600 text-white shadow-lg shadow-blue-500/20"
                    : "bg-[#14141C] border border-[#1F1F2E] text-gray-400 hover:border-blue-500/30"
                }`}
              >
                {type.toUpperCase()}
              </button>
            ))}
          </div>
        </motion.div>

        {/* SESSION CARDS */}
        {paginatedSessions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-[#1F1F2E] bg-gradient-to-br from-[#12121A] via-[#14141C] to-[#12121A] p-10 text-center"
          >
            <p className="text-lg text-gray-300">No test sessions found.</p>
            <p className="mt-1 text-sm text-gray-500">
              Try a different search keyword or filter.
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.06 } },
            }}
            className="space-y-6"
          >
            {paginatedSessions.map((session) => {
              const agentName = agentMap[session.agent_id] || "Unknown Agent";

              return (
                <motion.div
                  key={session.test_session_id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -2 }}
                  onClick={() => handleSessionOpen(session)}
                  className="group cursor-pointer bg-gradient-to-br from-[#12121A] via-[#14141C] to-[#12121A] border border-[#1F1F2E] rounded-xl p-6 hover:border-blue-500/40 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      {session.test_type === "chat" ? (
                        <MessageSquare className="text-blue-400" />
                      ) : (
                        <Phone className="text-teal-400" />
                      )}

                      <div>
                        <h2 className="text-lg font-semibold">{agentName}</h2>
                        <p className="text-sm text-gray-400">
                          {session.test_type.toUpperCase()} Test
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-md ${
                        session.test_status === "completed"
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30"
                      }`}
                    >
                      {session.test_status}
                    </span>
                  </div>

                  <div className="mt-4 text-sm text-gray-400">
                    Started: {formatDate(session.started_at)}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-10">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-2 bg-[#14141C] border border-[#1F1F2E] rounded-md disabled:opacity-40 hover:border-blue-500/30 transition-colors"
            >
              <ChevronLeft />
            </button>

            <span className="text-gray-400 text-sm">
              Page {page} of {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-2 bg-[#14141C] border border-[#1F1F2E] rounded-md disabled:opacity-40 hover:border-blue-500/30 transition-colors"
            >
              <ChevronRight />
            </button>
          </div>
        )}
      </div>

      {/* ===========================
          RIGHT SIDEBAR
      ============================ */}
      <AnimatePresence>
        {selectedSession && (
          <motion.div
            className="fixed inset-0 z-50 flex justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
              onClick={() => setSelectedSession(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              className="relative w-full max-w-lg h-full bg-gradient-to-b from-[#0F0F14] via-[#11111A] to-[#0F0F14] border-l border-[#1F1F2E] p-6 overflow-y-auto shadow-2xl"
              initial={{ x: 80, opacity: 0.85 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 80, opacity: 0.85 }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
            >
              <div className="flex justify-between items-center mb-3 mt-14">
                <h2 className="text-xl font-semibold">Conversation</h2>
                <button
                  onClick={() => setSelectedSession(null)}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#2A2A3A] bg-[#171722] px-3 py-1.5 text-sm text-gray-300 transition hover:border-blue-500/40 hover:text-white"
                >
                  <X size={15} />
                  Close
                </button>
              </div>

              <div className=" border-b-2 border-b-gray-50/10 mb-6 "></div>
              {isSyncingVoice && selectedSession?.test_type === "voice" ? (
                <p className="text-xs text-blue-300 mb-4">
                  Syncing latest voice transcript...
                </p>
              ) : null}

              {(() => {
                const messages = getTranscriptMessages(
                  selectedSession.test_transcript,
                );

                if (messages.length === 0) {
                  return (
                    <p className="text-gray-400">No conversation available.</p>
                  );
                }

                return (
                  <div className="space-y-4">
                    {messages.map((item, index) => {
                      const isUser = item.role === "user";
                      return (
                        <div key={`${item.timestamp || "msg"}-${index}`}>
                          <p className="text-xs text-gray-500 mb-1">
                            {isUser ? "USER" : "AGENT"}
                          </p>
                          <div
                            className={`p-4 rounded-lg border ${
                              isUser
                                ? "bg-[#1A1A22] border-[#252536]"
                                : "bg-blue-600/10 border-blue-500/30"
                            }`}
                          >
                            {item.message}
                          </div>
                          {item.timestamp ? (
                            <p className="mt-1 text-[11px] text-gray-500">
                              {formatDate(item.timestamp)}
                            </p>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              <div className="mt-20 border-t-2 border-[#1F1F2E] pt-6">
                <h6 className="text-sm text-yellow-400 font-semibold mb-2">
                  ⚠️ You're Viewing a Test Session
                </h6>

                <p className="text-sm text-gray-300 mb-3 leading-relaxed">
                  This session was conducted in{" "}
                  <span className="text-blue-400 font-medium">Test Mode</span>.
                  Event-level data and advanced features are not recorded here.
                </p>

                <ul className="text-sm text-gray-400 space-y-2 list-disc pl-5 mb-4">
                  <li>RSVP status will not be saved</li>
                  <li>Number of guests attending will not be calculated</li>
                  <li>Guest notes will not be stored</li>
                  <li>ID Proof collection is disabled</li>
                  <li>Travel details collection is disabled</li>
                </ul>

                <p className="text-sm text-gray-300 mb-3">
                  After creating a real event, all RSVP analytics and guest data
                  will be available inside your dashboard.
                </p>

                <div className="overflow-hidden rounded-xl border border-[#252536] bg-[#14141C]">
                  <img
                    src={DASHBOARD_PREVIEW_IMAGE}
                    alt="Dashboard preview screenshot"
                    className="w-full h-auto object-cover"
                    loading="lazy"
                  />
                </div>

                <p className="text-xs text-gray-500 mt-3">
                  Create an event to activate full RSVP tracking and guest data
                  collection.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TestHistory;
