import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Phone,
  MessageSquare,
  Activity,
  TestTube,
  CheckCircle,
  Settings,
  Database,
  Mic,
  Bot,
  Sparkles,
  ChevronDown,
  ArrowLeft,
} from "lucide-react";

import { fetchAgentById } from "../../api/agents";
import { fetchKnowledgeBaseById } from "../../api/knowledgeBases";

const SingleAgent = () => {
  const { agentId } = useParams();
  const navigate = useNavigate();

  const [agent, setAgent] = useState(null);
  const [knowledge, setKnowledge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("chat");

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetchAgentById(agentId);
        const agentData = res.data.data;
        setAgent(agentData);

        if (agentData?.knowledge_base_id) {
          const kbRes = await fetchKnowledgeBaseById(
            agentData.knowledge_base_id,
          );
          setKnowledge(kbRes.data?.data || kbRes.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [agentId]);

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0A0A0B] via-[#0B0B0C] to-[#0A0A0B] text-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-blue-300">
          <Sparkles className="h-5 w-5 animate-pulse" />
          <span>Loading Agent...</span>
        </div>
      </div>
    );

  const template = agent.agent_templates;
  const config = template?.config;

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#0A0A0B] via-[#0B0B0C] to-[#0A0A0B] px-4 py-8 text-white md:px-8 md:py-10">
      <div className="pointer-events-none absolute -left-20 top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-36 h-80 w-80 rounded-full bg-teal-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex flex-wrap items-start justify-between gap-4"
        >
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-gradient-to-r from-blue-500/10 to-teal-500/10 px-4 py-2 text-sm text-blue-200">
              <Sparkles className="h-4 w-4 text-blue-400" />
              Agent Details
            </div>
            <h1 className="text-3xl font-bold md:text-4xl">{agent.agent_name}</h1>
            <p className="mt-1 text-gray-400">
              {agent.agent_description || "No description provided."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/agents")}
              className="flex items-center gap-2 rounded-xl border border-[#2A2A3E] bg-[#0E0E14] px-4 py-2.5 text-gray-200 transition hover:bg-[#161620]"
            >
              <ArrowLeft size={16} />
              Back to Agents
            </button>

            <button
              onClick={() => navigate(`/agents/${agent.agent_id}/test`)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 via-blue-600 to-teal-600 px-5 py-2.5 transition hover:scale-[1.02] hover:opacity-90"
            >
              <TestTube size={18} />
              Test Agent
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-8 grid gap-5 md:grid-cols-3"
        >
          <StatCard icon={<Phone />} label="Calls" value={agent.total_calls} />
          <StatCard icon={<MessageSquare />} label="Chats" value={agent.total_chats} />
          <StatCard icon={<Activity />} label="Tests" value={agent.total_tests} />
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <Card title="Template Overview" icon={<Bot size={18} />}>
              <p className="text-lg font-medium">{template?.name || "Unknown Template"}</p>
              <p className="mt-2 text-sm text-gray-400">{template?.description}</p>
            </Card>

            <Card title="Agent Capabilities" icon={<Settings size={18} />}>
              <div className="grid gap-3 md:grid-cols-2">
                {Object.entries(config?.features || {}).map(([key, val]) => (
                  <div
                    key={key}
                    className="flex items-center gap-3 rounded-xl border border-[#2A2A3E] bg-[#0E0E14] p-4"
                  >
                    <CheckCircle
                      size={18}
                      className={val ? "text-emerald-400" : "text-gray-600"}
                    />
                    <span className="text-sm capitalize text-gray-200">
                      {key.replaceAll("_", " ")}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="RSVP Flow Timeline">
              <div className="relative ml-4 space-y-5 border-l border-[#2A2A3E]">
                {config?.questions?.map((q, i) => (
                  <motion.div
                    key={q.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="relative ml-6"
                  >
                    <div className="absolute -left-9 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs">
                      {i + 1}
                    </div>
                    <div className="rounded-lg border border-[#2A2A3E] bg-[#0E0E14] p-4">
                      <p className="font-medium">{q.text}</p>
                      <p className="mt-1 text-xs text-gray-400">
                        Type: {q.type} | {q.required ? "Required" : "Optional"}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>

            <Card title="How It Works">
              <div className="mb-6 flex gap-3">
                <Tab
                  active={activeTab === "chat"}
                  onClick={() => setActiveTab("chat")}
                  icon={<MessageSquare size={16} />}
                  label="Chat"
                />
                <Tab
                  active={activeTab === "voice"}
                  onClick={() => setActiveTab("voice")}
                  icon={<Mic size={16} />}
                  label="Voice"
                />
              </div>

              <ul className="space-y-3 text-sm text-gray-300">
                {config?.how_it_works?.[activeTab]?.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="font-medium text-blue-400">{i + 1}.</span>
                    {step}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <div className="space-y-8">
            <Card title="Agent Status">
              <div className="space-y-3 text-sm">
                <p>
                  Status: <span className="text-blue-300">{agent.status}</span>
                </p>
                <p>
                  Active:{" "}
                  <span className={agent.is_active ? "text-emerald-400" : "text-red-400"}>
                    {agent.is_active ? "Yes" : "No"}
                  </span>
                </p>
              </div>
            </Card>

            <Card title="Communication Modes">
              <div className="space-y-3 text-sm text-gray-300">
                <p>Voice Enabled: {agent.voice_enabled ? "Yes" : "No"}</p>
                <p>Chat Enabled: {agent.chat_enabled ? "Yes" : "No"}</p>
                <p>
                  Document Collection: {agent.document_collection_enabled ? "Yes" : "No"}
                </p>
              </div>
            </Card>

            {knowledge && (
              <Card title="Knowledge Base" icon={<Database size={18} />}>
                <p className="mb-3 text-sm text-gray-400">{knowledge.name}</p>
                <div className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg border border-[#2A2A3E] bg-[#0E0E14] p-4 text-xs text-gray-300">
                  {knowledge.knowledge_entries?.[0]?.content || "No entries yet."}
                </div>
              </Card>
            )}

            <Card title="System Prompts">
              <div className="space-y-3 text-xs text-gray-400">
                <PromptBlock label="Chat System Prompt" content={config?.prompts?.chat_system} />
                <PromptBlock label="Voice System Prompt" content={config?.prompts?.voice_system} />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleAgent;

/* ---------------- UI Components ---------------- */

const Card = ({ title, icon, children }) => (
  <motion.div
    whileHover={{ y: -3 }}
    className="rounded-2xl border border-[#1F1F2E] bg-gradient-to-br from-[#12121A] via-[#14141C] to-[#12121A] p-6 shadow-xl"
  >
    <div className="flex items-center gap-2 mb-4 text-lg font-semibold">
      {icon}
      {title}
    </div>
    {children}
  </motion.div>
);

const StatCard = ({ icon, label, value }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="flex items-center gap-4 rounded-2xl border border-[#1F1F2E] bg-gradient-to-br from-[#12121A] via-[#14141C] to-[#12121A] p-6"
  >
    <div className="text-blue-400">{icon}</div>
    <div>
      <p className="text-gray-400 text-sm">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </motion.div>
);

const Tab = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm transition ${
      active
        ? "bg-gradient-to-r from-blue-500 to-teal-600 text-white"
        : "bg-[#0E0E14] text-gray-400 hover:bg-[#161620]"
    }`}
  >
    {icon}
    {label}
  </button>
);

const PromptBlock = ({ label, content }) => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-sm text-blue-300"
      >
        {label}
        <ChevronDown
          size={14}
          className={`transition ${open ? "rotate-180" : "rotate-0"}`}
        />
      </button>
      {open && (
        <div className="mt-2 whitespace-pre-wrap rounded border border-[#2A2A3E] bg-[#0E0E14] p-3 text-gray-300">
          {content}
        </div>
      )}
    </div>
  );
};
