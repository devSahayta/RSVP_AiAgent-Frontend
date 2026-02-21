// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";
// import {
//   Phone,
//   MessageSquare,
//   Activity,
//   Calendar,
//   TestTube,
//   CheckCircle,
// } from "lucide-react";

// import { fetchAgentById } from "../../api/agents";
// import { fetchKnowledgeBaseById } from "../../api/knowledgeBases";

// const SingleAgent = () => {
//   const { agentId } = useParams();
//   const navigate = useNavigate();

//   const [agent, setAgent] = useState(null);
//   const [knowledge, setKnowledge] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const loadAgent = async () => {
//       try {
//         const res = await fetchAgentById(agentId);
//         const agentData = res.data.data;
//         setAgent(agentData);

//         if (agentData?.knowledge_base_id) {
//           const kbRes = await fetchKnowledgeBaseById(
//             agentData.knowledge_base_id,
//           );
//           setKnowledge(kbRes.data);
//         }
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadAgent();
//   }, [agentId]);

//   if (loading)
//     return (
//       <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center">
//         Loading Agent Details...
//       </div>
//     );

//   if (!agent)
//     return (
//       <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center">
//         Agent not found
//       </div>
//     );

//   const template = agent.agent_templates;
//   const config = template?.config;

//   return (
//     <div className="min-h-screen bg-[#0f172a] text-white px-8 py-10">
//       {/* HEADER */}
//       <div className="flex justify-between items-center mb-10">
//         <div>
//           <h1 className="text-3xl font-bold">{agent.agent_name}</h1>
//           <p className="text-gray-400 mt-1">{agent.agent_description}</p>
//         </div>

//         <button
//           onClick={() => navigate(`/agents/${agent.agent_id}/test`)}
//           className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-5 py-2 rounded-lg transition"
//         >
//           <TestTube size={18} />
//           Test Agent
//         </button>
//       </div>

//       {/* STATS */}
//       <div className="grid md:grid-cols-3 gap-6 mb-10">
//         <StatCard
//           icon={<Phone />}
//           label="Total Calls"
//           value={agent.total_calls}
//         />
//         <StatCard
//           icon={<MessageSquare />}
//           label="Total Chats"
//           value={agent.total_chats}
//         />
//         <StatCard
//           icon={<Activity />}
//           label="Total Tests"
//           value={agent.total_tests}
//         />
//       </div>

//       {/* TEMPLATE INFO */}
//       <Section title="Template Information">
//         <p className="text-lg font-medium">{template?.name}</p>
//         <p className="text-gray-400 mt-2">{template?.description}</p>
//       </Section>

//       {/* FEATURES */}
//       <Section title="Agent Capabilities">
//         <div className="flex flex-wrap gap-3">
//           {config?.capabilities?.map((cap, i) => (
//             <Badge key={i} text={cap} />
//           ))}
//         </div>
//       </Section>

//       {/* FEATURES FLAGS */}
//       <Section title="Enabled Features">
//         <div className="grid md:grid-cols-2 gap-4">
//           {Object.entries(config?.features || {}).map(([key, val]) => (
//             <div key={key} className="flex items-center gap-2">
//               <CheckCircle
//                 size={16}
//                 className={val ? "text-green-400" : "text-gray-600"}
//               />
//               <span className="capitalize">{key.replaceAll("_", " ")}</span>
//             </div>
//           ))}
//         </div>
//       </Section>

//       {/* QUESTIONS FLOW */}
//       <Section title="RSVP / Data Collection Flow">
//         <div className="space-y-4">
//           {config?.questions?.map((q, index) => (
//             <motion.div
//               key={q.id}
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ delay: index * 0.05 }}
//               className="bg-[#1e293b] p-4 rounded-lg border border-gray-700"
//             >
//               <p className="font-medium">
//                 {index + 1}. {q.text}
//               </p>
//               <p className="text-sm text-gray-400 mt-1">
//                 Type: {q.type} | Required: {q.required ? "Yes" : "No"}
//               </p>
//             </motion.div>
//           ))}
//         </div>
//       </Section>

//       {/* HOW IT WORKS */}
//       <Section title="How It Works - Chat">
//         <ul className="list-disc ml-6 text-gray-300 space-y-1">
//           {config?.how_it_works?.chat?.map((step, i) => (
//             <li key={i}>{step}</li>
//           ))}
//         </ul>
//       </Section>

//       <Section title="How It Works - Voice">
//         <ul className="list-disc ml-6 text-gray-300 space-y-1">
//           {config?.how_it_works?.voice?.map((step, i) => (
//             <li key={i}>{step}</li>
//           ))}
//         </ul>
//       </Section>

//       {/* KNOWLEDGE BASE */}
//       {knowledge && (
//         <Section title="Knowledge Base Content">
//           <div className="bg-[#1e293b] p-6 rounded-lg border border-gray-700 whitespace-pre-wrap text-gray-300 text-sm">
//             {knowledge.knowledge_entries?.[0]?.content}
//           </div>
//         </Section>
//       )}
//     </div>
//   );
// };

// export default SingleAgent;

// /* ---------- COMPONENTS ---------- */

// const Section = ({ title, children }) => (
//   <div className="mb-10">
//     <h2 className="text-xl font-semibold mb-4">{title}</h2>
//     {children}
//   </div>
// );

// const StatCard = ({ icon, label, value }) => (
//   <motion.div
//     whileHover={{ scale: 1.05 }}
//     className="bg-[#1e293b] p-6 rounded-xl border border-gray-700 flex items-center gap-4"
//   >
//     <div className="text-indigo-400">{icon}</div>
//     <div>
//       <p className="text-gray-400 text-sm">{label}</p>
//       <p className="text-xl font-bold">{value}</p>
//     </div>
//   </motion.div>
// );

// const Badge = ({ text }) => (
//   <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 text-xs rounded-full capitalize">
//     {text}
//   </span>
// );

//-------------------------------Updated UI 2nd Version-------------------------------------------------

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
          setKnowledge(kbRes.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [agentId]);

  console.log({ knowledge });

  if (loading)
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center">
        Loading Agent...
      </div>
    );

  const template = agent.agent_templates;
  const config = template?.config;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white px-8 py-10">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold">{agent.agent_name}</h1>
          <p className="text-gray-400 mt-1">{agent.agent_description}</p>
        </div>

        <button
          onClick={() => navigate(`/agents/${agent.agent_id}/test`)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-5 py-2 rounded-xl transition"
        >
          <TestTube size={18} />
          Test Agent
        </button>
      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <StatCard icon={<Phone />} label="Calls" value={agent.total_calls} />
        <StatCard
          icon={<MessageSquare />}
          label="Chats"
          value={agent.total_chats}
        />
        <StatCard icon={<Activity />} label="Tests" value={agent.total_tests} />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* LEFT MAIN */}
        <div className="lg:col-span-2 space-y-10">
          {/* TEMPLATE CARD */}
          <Card title="Template Overview" icon={<Bot size={18} />}>
            <p className="text-lg font-medium">{template?.name}</p>
            <p className="text-gray-400 mt-2 text-sm">
              {template?.description}
            </p>
          </Card>

          {/* CAPABILITIES GRID */}
          <Card title="Agent Capabilities" icon={<Settings size={18} />}>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(config?.features || {}).map(([key, val]) => (
                <div
                  key={key}
                  className="bg-[#1e293b] p-4 rounded-xl border border-gray-700 flex items-center gap-3"
                >
                  <CheckCircle
                    size={18}
                    className={val ? "text-green-400" : "text-gray-600"}
                  />
                  <span className="capitalize text-sm">
                    {key.replaceAll("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* RSVP FLOW TIMELINE */}
          <Card title="RSVP Flow Timeline">
            <div className="relative border-l border-gray-700 ml-4 space-y-6">
              {config?.questions?.map((q, i) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="ml-6"
                >
                  <div className="absolute -left-3 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-xs">
                    {i + 1}
                  </div>
                  <div className="bg-[#1e293b] p-4 rounded-lg border border-gray-700">
                    <p className="font-medium">{q.text}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Type: {q.type} | {q.required ? "Required" : "Optional"}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>

          {/* HOW IT WORKS - TABS */}
          <Card title="How It Works">
            <div className="flex gap-4 mb-6">
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

            <ul className="space-y-3 text-gray-300 text-sm">
              {config?.how_it_works?.[activeTab]?.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-indigo-400">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-8">
          {/* STATUS */}
          <Card title="Agent Status">
            <div className="space-y-3 text-sm">
              <p>
                Status: <span className="text-indigo-400">{agent.status}</span>
              </p>
              <p>
                Active:{" "}
                <span
                  className={
                    agent.is_active ? "text-green-400" : "text-red-400"
                  }
                >
                  {agent.is_active ? "Yes" : "No"}
                </span>
              </p>
            </div>
          </Card>

          {/* COMMUNICATION */}
          <Card title="Communication Modes">
            <div className="space-y-3 text-sm">
              <p>Voice Enabled: {agent.voice_enabled ? "Yes" : "No"}</p>
              <p>Chat Enabled: {agent.chat_enabled ? "Yes" : "No"}</p>
              <p>
                Document Collection:{" "}
                {agent.document_collection_enabled ? "Yes" : "No"}
              </p>
            </div>
          </Card>

          {/* KNOWLEDGE BASE */}
          {knowledge && (
            <Card title="Knowledge Base" icon={<Database size={18} />}>
              <p className="text-sm text-gray-400 mb-3">{knowledge.name}</p>
              <div className="bg-[#1e293b] p-4 rounded-lg border border-gray-700 max-h-64 overflow-y-auto text-xs whitespace-pre-wrap">
                {knowledge.knowledge_entries?.[0]?.content}
              </div>
            </Card>
          )}

          {/* SYSTEM PROMPTS */}
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
        </div>
      </div>
    </div>
  );
};

export default SingleAgent;

/* ---------------- UI Components ---------------- */

const Card = ({ title, icon, children }) => (
  <motion.div
    whileHover={{ y: -2 }}
    className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-lg"
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
    whileHover={{ scale: 1.04 }}
    className="bg-[#111827] p-6 rounded-2xl border border-gray-800 flex items-center gap-4"
  >
    <div className="text-indigo-400">{icon}</div>
    <div>
      <p className="text-gray-400 text-sm">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </motion.div>
);

const Tab = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition ${
      active
        ? "bg-indigo-600 text-white"
        : "bg-[#1e293b] text-gray-400 hover:bg-[#2d3748]"
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
        className="text-indigo-400 text-sm"
      >
        {label}
      </button>
      {open && (
        <div className="bg-[#1e293b] p-3 rounded mt-2 border border-gray-700 whitespace-pre-wrap">
          {content}
        </div>
      )}
    </div>
  );
};
