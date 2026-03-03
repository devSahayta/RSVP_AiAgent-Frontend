// src/pages/HomeDashboard.jsx

import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Bot, Plus, FileText } from "lucide-react";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";

const cards = [
  {
    title: "Events",
    description: "Create and manage RSVP events",
    icon: Calendar,
    route: "/events",
  },
  {
    title: "Agents",
    description: "Build and test AI agents",
    icon: Bot,
    route: "/agents",
  },
  {
    title: "Templates",
    description: "Create message templates",
    icon: FileText,
    route: "/templates",
  },
];

export default function DashboardPage() {
  const navigate = useNavigate();

  // ✅ Hook MUST be inside component
  const { user, isLoading } = useKindeAuth();

  const firstName = user?.givenName || "there";

  // Optional loading guard
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center text-gray-400">
        Loading workspace...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white px-4 sm:px-6 lg:px-10 py-10">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-12"
        >
          <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight leading-tight">
            Welcome back,
            <span className="text-indigo-400"> {firstName} </span> 
          </h1>

          <p className="text-gray-400 mt-4 max-w-2xl text-sm sm:text-base leading-relaxed">
            Your <span className="text-white font-medium">Sutrak workspace</span>
            {" "}is ready. Create events, automate conversations with AI agents,
            and manage guest experiences — all from one place.
          </p>

          <p className="text-indigo-400/80 mt-3 text-sm">
            What would you like to build today?
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4 mb-12"
        >
          <button
            onClick={() => navigate("/createEvent")}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 transition rounded-2xl px-6 py-3 font-medium shadow-lg shadow-indigo-600/20"
          >
            <Plus size={18} />
            Create Event
          </button>

          <button
            onClick={() => navigate("/agents/create")}
            className="flex items-center justify-center gap-2 bg-[#111218] border border-[#1F2230] hover:border-indigo-500 transition rounded-2xl px-6 py-3 font-medium"
          >
            <Bot size={18} />
            Create Agent
          </button>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => navigate(card.route)}
                className="cursor-pointer rounded-2xl bg-[#111218] border border-[#1F2230] p-6 hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600/10 mb-4">
                  <Icon className="text-indigo-400" size={22} />
                </div>

                <h3 className="text-lg font-semibold mb-1">
                  {card.title}
                </h3>

                <p className="text-gray-400 text-sm">
                  {card.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-16 text-center text-gray-500 text-xs sm:text-sm">
          Sutrak Workspace • AI-Powered RSVP Management
        </div>
      </div>
    </div>
  );
}