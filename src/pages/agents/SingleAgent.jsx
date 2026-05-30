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
  Wand2,
  Layers,
  Hash,
  ToggleLeft,
  Type,
  List,
  Calendar,
  Zap,
  Info,
  Check,
} from "lucide-react";

import { fetchAgentById } from "../../api/agents";
import { fetchKnowledgeBaseById } from "../../api/knowledgeBases";

// ─── Field type display helpers ───────────────────────────────────────────────
const FIELD_TYPE_META = {
  yes_no: { label: "Yes / No", icon: ToggleLeft, color: "blue" },
  number: { label: "Number", icon: Hash, color: "teal" },
  text: { label: "Text", icon: Type, color: "purple" },
  choice: { label: "Multiple Choice", icon: List, color: "amber" },
};

const fieldColor = {
  blue: {
    bg: "bg-blue-500/15",
    text: "text-blue-300",
    border: "border-blue-500/25",
  },
  teal: {
    bg: "bg-teal-500/15",
    text: "text-teal-300",
    border: "border-teal-500/25",
  },
  purple: {
    bg: "bg-purple-500/15",
    text: "text-purple-300",
    border: "border-purple-500/25",
  },
  amber: {
    bg: "bg-amber-500/15",
    text: "text-amber-300",
    border: "border-amber-500/25",
  },
};

// ─── SmartFieldCard ───────────────────────────────────────────────────────────
const SmartFieldCard = ({ field, index }) => {
  const meta = FIELD_TYPE_META[field.field_type] || FIELD_TYPE_META.text;
  const colors = fieldColor[meta.color];
  const Icon = meta.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-xl border border-[#1F1F2E] bg-[#0E0E14] p-4"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1A1A2A] text-sm font-bold text-gray-400">
            {index + 1}
          </div>
          <div>
            <p className="font-semibold text-white text-sm">
              {field.field_label}
            </p>
            <p className="text-xs text-gray-500 font-mono">{field.field_key}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className={`flex items-center gap-1 rounded-lg border px-2 py-0.5 text-xs font-medium ${colors.bg} ${colors.text} ${colors.border}`}
          >
            <Icon size={11} />
            {meta.label}
          </span>
          <span
            className={`rounded-lg px-2 py-0.5 text-xs font-medium ${
              field.is_required
                ? "bg-red-500/15 text-red-400 border border-red-500/25"
                : "bg-gray-500/15 text-gray-400 border border-gray-500/25"
            }`}
          >
            {field.is_required ? "Required" : "Optional"}
          </span>
        </div>
      </div>

      <div className="rounded-lg bg-[#0A0A0F] border border-[#1A1A2A] px-3 py-2.5">
        <p className="text-xs text-gray-500 mb-1">Agent asks:</p>
        <p className="text-sm text-gray-200 italic">"{field.ai_question}"</p>
      </div>

      {field.field_type === "choice" &&
        Array.isArray(field.options) &&
        field.options.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {field.options.map((opt, i) => (
              <span
                key={i}
                className="rounded-md bg-[#1A1A2A] border border-[#2A2A3E] px-2.5 py-0.5 text-xs text-gray-300"
              >
                {opt}
              </span>
            ))}
          </div>
        )}
    </motion.div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
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

  const isSmartFields = agent.field_mode === "smart_fields";
  const template = agent.agent_templates;
  const config = template?.config;

  // Parse smart_fields safely
  let smartFields = [];
  try {
    smartFields = Array.isArray(agent.smart_fields)
      ? agent.smart_fields
      : JSON.parse(agent.smart_fields || "[]");
  } catch {
    smartFields = [];
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#0A0A0B] via-[#0B0B0C] to-[#0A0A0B] px-4 py-8 text-white md:px-8 md:py-10">
      <div className="pointer-events-none absolute -left-20 top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-36 h-80 w-80 rounded-full bg-teal-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex flex-wrap items-start justify-between gap-4"
        >
          <div>
            <div
              className={`mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm ${
                isSmartFields
                  ? "border-teal-500/20 bg-gradient-to-r from-teal-500/10 to-blue-500/10 text-teal-200"
                  : "border-blue-500/20 bg-gradient-to-r from-blue-500/10 to-teal-500/10 text-blue-200"
              }`}
            >
              {isSmartFields ? (
                <Wand2 className="h-4 w-4 text-teal-400" />
              ) : (
                <Layers className="h-4 w-4 text-blue-400" />
              )}
              {isSmartFields
                ? "Custom Smart Fields Agent"
                : "Classic Template Agent"}
            </div>
            <h1 className="text-3xl font-bold md:text-4xl">
              {agent.agent_name}
            </h1>
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
              Back
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

        {/* ── Stats ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-8 grid gap-5 md:grid-cols-3"
        >
          <StatCard
            icon={<Phone />}
            label="Total Calls"
            value={agent.total_calls}
          />
          <StatCard
            icon={<MessageSquare />}
            label="Total Chats"
            value={agent.total_chats}
          />
          <StatCard
            icon={<Activity />}
            label="Total Tests"
            value={agent.total_tests}
          />
        </motion.div>

        {/* ── Body ── */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* ── LEFT: main content ── */}
          <div className="space-y-8 lg:col-span-2">
            {/* ════ SMART FIELDS MODE ════ */}
            {isSmartFields && (
              <>
                {/* Event overview */}
                <Card title="Event Overview" icon={<Calendar size={18} />}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl bg-[#0A0A0F] border border-[#1A1A2A] p-4">
                      <p className="text-xs text-gray-500 mb-1">Event Title</p>
                      <p className="font-semibold text-white">
                        {agent.event_title || "—"}
                      </p>
                    </div>
                    <div className="rounded-xl bg-[#0A0A0F] border border-[#1A1A2A] p-4">
                      <p className="text-xs text-gray-500 mb-1">Agent Mode</p>
                      <div className="flex items-center gap-2">
                        <Wand2 size={14} className="text-teal-400" />
                        <span className="font-semibold text-teal-300">
                          Custom Smart Fields
                        </span>
                      </div>
                    </div>
                    {agent.first_message && (
                      <div className="rounded-xl bg-[#0A0A0F] border border-[#1A1A2A] p-4 md:col-span-2">
                        <p className="text-xs text-gray-500 mb-1">
                          Opening Message
                        </p>
                        <p className="text-white italic">
                          "{agent.first_message}"
                        </p>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Smart Fields list */}
                <Card
                  title={`Smart Fields (${smartFields.length})`}
                  icon={<Wand2 size={18} className="text-teal-400" />}
                >
                  {smartFields.length === 0 ? (
                    <div className="flex items-center gap-3 rounded-xl border border-dashed border-[#2A2A3E] p-6 text-gray-500">
                      <Info size={16} />
                      <p className="text-sm">
                        No smart fields defined for this agent.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {smartFields
                        .slice()
                        .sort(
                          (a, b) =>
                            (a.display_order ?? 0) - (b.display_order ?? 0),
                        )
                        .map((field, i) => (
                          <SmartFieldCard
                            key={field.field_key || i}
                            field={field}
                            index={i}
                          />
                        ))}
                    </div>
                  )}

                  <div className="mt-4 rounded-xl border border-teal-500/15 bg-teal-500/5 p-3.5 flex gap-3">
                    <Sparkles className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-400 leading-relaxed">
                      The voice agent asks these questions conversationally in
                      order. Required fields are always collected; optional ones
                      may be skipped.
                    </p>
                  </div>
                </Card>

                {/* ElevenLabs agent info */}
                <Card
                  title="Voice Agent Config"
                  icon={<Zap size={18} className="text-blue-400" />}
                >
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between rounded-xl bg-[#0A0A0F] border border-[#1A1A2A] px-4 py-3">
                      <span className="text-gray-400">ElevenLabs Agent ID</span>
                      <code className="rounded bg-[#1A1A2A] px-2 py-0.5 text-xs text-blue-300 font-mono">
                        {agent.elevenlabs_agent_id || "—"}
                      </code>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-[#0A0A0F] border border-[#1A1A2A] px-4 py-3">
                      <span className="text-gray-400">
                        Shared Dynamic Agent
                      </span>
                      <span className="text-xs text-teal-300 bg-teal-500/15 px-2 py-0.5 rounded-full">
                        Yes — smart fields mode
                      </span>
                    </div>
                  </div>
                </Card>
              </>
            )}

            {/* ════ CLASSIC MODE ════ */}
            {!isSmartFields && (
              <>
                <Card title="Template Overview" icon={<Bot size={18} />}>
                  <p className="text-lg font-medium">
                    {template?.name || "Unknown Template"}
                  </p>
                  <p className="mt-2 text-sm text-gray-400">
                    {template?.description}
                  </p>
                </Card>

                <Card title="Agent Capabilities" icon={<Settings size={18} />}>
                  <div className="grid gap-3 md:grid-cols-2">
                    {Object.entries(config?.features || {}).map(
                      ([key, val]) => (
                        <div
                          key={key}
                          className="flex items-center gap-3 rounded-xl border border-[#2A2A3E] bg-[#0E0E14] p-4"
                        >
                          <CheckCircle
                            size={18}
                            className={
                              val ? "text-emerald-400" : "text-gray-600"
                            }
                          />
                          <span className="text-sm capitalize text-gray-200">
                            {key.replaceAll("_", " ")}
                          </span>
                        </div>
                      ),
                    )}
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
                            Type: {q.type} |{" "}
                            {q.required ? "Required" : "Optional"}
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
                        <span className="font-medium text-blue-400">
                          {i + 1}.
                        </span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </Card>

                {template?.preview_image_url && (
                  <Card title="Template Preview" icon={<Sparkles size={18} />}>
                    <div className="relative overflow-hidden rounded-2xl border border-[#1F1F2E] bg-[#0A0A0F] group">
                      <img
                        src={template.preview_image_url}
                        alt={`${template?.name} preview`}
                        className="w-full h-auto object-cover transition-all duration-500 group-hover:scale-[1.02]"
                        loading="lazy"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-70" />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Template: {template?.name}
                    </p>
                  </Card>
                )}
              </>
            )}
          </div>

          {/* ── RIGHT: sidebar ── */}
          <div className="space-y-8">
            {/* Status */}
            <Card title="Agent Status">
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Status</span>
                  <span
                    className={`rounded-full px-3 py-0.5 text-xs font-semibold ${
                      agent.status === "unassigned"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-emerald-500/20 text-emerald-400"
                    }`}
                  >
                    {agent.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Active</span>
                  <span
                    className={
                      agent.is_active ? "text-emerald-400" : "text-red-400"
                    }
                  >
                    {agent.is_active ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Mode</span>
                  <span
                    className={`flex items-center gap-1.5 text-xs font-medium ${isSmartFields ? "text-teal-300" : "text-blue-300"}`}
                  >
                    {isSmartFields ? <Wand2 size={12} /> : <Layers size={12} />}
                    {isSmartFields ? "Smart Fields" : "Classic"}
                  </span>
                </div>
                {agent.event_title && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Event</span>
                    <span className="text-white text-right max-w-[160px] truncate">
                      {agent.event_title}
                    </span>
                  </div>
                )}
              </div>
            </Card>

            {/* Communication Modes */}
            <Card title="Channels">
              <div className="space-y-2">
                <ChannelRow
                  icon={<Phone size={15} />}
                  label="Voice Calls"
                  enabled={agent.voice_enabled}
                  color="blue"
                />
                <ChannelRow
                  icon={<MessageSquare size={15} />}
                  label="WhatsApp Chat"
                  enabled={agent.chat_enabled}
                  color="teal"
                />
                <ChannelRow
                  icon={<Database size={15} />}
                  label="Document Collection"
                  enabled={agent.document_collection_enabled}
                  color="purple"
                />
              </div>
            </Card>

            {/* Knowledge Base */}
            {knowledge && (
              <Card title="Knowledge Base" icon={<Database size={18} />}>
                <p className="mb-3 text-sm font-medium text-white">
                  {knowledge.name}
                </p>
                <div className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg border border-[#2A2A3E] bg-[#0E0E14] p-4 text-xs text-gray-300 leading-relaxed">
                  {knowledge.knowledge_entries?.[0]?.content ||
                    "No entries yet."}
                </div>
              </Card>
            )}

            {/* Classic-only: System Prompts */}
            {!isSmartFields && (
              <Card title="System Prompts">
                <div className="space-y-3 text-xs text-gray-400">
                  <PromptBlock
                    label="Chat System Prompt"
                    content={config?.prompts?.chat_system}
                  />
                  <PromptBlock
                    label="Voice System Prompt"
                    content={config?.prompts?.voice_system}
                  />
                </div>
              </Card>
            )}

            {/* Smart-only: Smart Fields quick summary */}
            {isSmartFields && smartFields.length > 0 && (
              <Card
                title="Fields Summary"
                icon={<Wand2 size={18} className="text-teal-400" />}
              >
                <div className="space-y-2">
                  {smartFields
                    .slice()
                    .sort(
                      (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0),
                    )
                    .map((f, i) => {
                      const meta =
                        FIELD_TYPE_META[f.field_type] || FIELD_TYPE_META.text;
                      const colors = fieldColor[meta.color];
                      const Icon = meta.icon;
                      return (
                        <div
                          key={f.field_key || i}
                          className="flex items-center gap-3 text-sm"
                        >
                          <span className="w-5 text-center text-xs text-gray-600">
                            {i + 1}
                          </span>
                          <span
                            className={`flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs border ${colors.bg} ${colors.text} ${colors.border}`}
                          >
                            <Icon size={10} />
                            {meta.label}
                          </span>
                          <span className="text-gray-300 truncate">
                            {f.field_label}
                          </span>
                          {f.is_required && (
                            <span className="ml-auto flex-shrink-0 text-xs text-red-400">
                              *
                            </span>
                          )}
                        </div>
                      );
                    })}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleAgent;

/* ─── Reusable UI pieces ───────────────────────────────────────────────────── */

const Card = ({ title, icon, children }) => (
  <motion.div
    whileHover={{ y: -2 }}
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
      <p className="text-2xl font-bold">{value ?? 0}</p>
    </div>
  </motion.div>
);

const ChannelRow = ({ icon, label, enabled, color }) => {
  const colors = {
    blue: "text-blue-400 bg-blue-500/10",
    teal: "text-teal-400 bg-teal-500/10",
    purple: "text-purple-400 bg-purple-500/10",
  };
  return (
    <div className="flex items-center justify-between rounded-xl border border-[#1A1A2A] bg-[#0E0E14] px-3 py-2.5">
      <div
        className={`flex items-center gap-2 text-sm ${enabled ? colors[color] : "text-gray-600"}`}
      >
        <span
          className={`rounded-lg p-1.5 ${enabled ? colors[color] : "bg-[#1A1A2A]"}`}
        >
          {icon}
        </span>
        <span className={enabled ? "text-gray-200" : "text-gray-500"}>
          {label}
        </span>
      </div>
      <span
        className={`text-xs font-medium ${enabled ? "text-emerald-400" : "text-gray-600"}`}
      >
        {enabled ? "On" : "Off"}
      </span>
    </div>
  );
};

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
          {content || "No prompt configured."}
        </div>
      )}
    </div>
  );
};
