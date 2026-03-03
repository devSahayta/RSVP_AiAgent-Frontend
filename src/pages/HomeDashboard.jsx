import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Bot, Plus, FileText, ArrowRight, Sparkles } from "lucide-react";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";

const cards = [
  {
    title: "Events",
    description: "Create and manage RSVP events",
    icon: Calendar,
    route: "/events",
    accent: "from-indigo-500/10 to-violet-500/10",
    iconBg: "bg-indigo-500/10",
    iconColor: "text-indigo-400",
    border: "hover:border-indigo-500/50",
  },
  {
    title: "Agents",
    description: "Build and test AI agents",
    icon: Bot,
    route: "/agents",
    accent: "from-cyan-500/10 to-blue-500/10",
    iconBg: "bg-cyan-500/10",
    iconColor: "text-cyan-400",
    border: "hover:border-cyan-500/50",
  },
  {
    title: "Templates",
    description: "Create message templates",
    icon: FileText,
    route: "/templates",
    accent: "from-purple-500/10 to-pink-500/10",
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-400",
    border: "hover:border-purple-500/50",
  },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, isLoading } = useKindeAuth();

  const firstName = user?.givenName || "there";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-500">Loading workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white">
      {/* Subtle gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-950/20 via-transparent to-violet-950/10 pointer-events-none" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12 sm:py-16 lg:py-20">
        
        {/* ── Header Section ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 sm:mb-16"
        >
          {/* Greeting */}
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-indigo-400" strokeWidth={2} />
            <span className="text-xs uppercase tracking-widest text-gray-500 font-medium">
              Dashboard
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-5">
            Welcome back,
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
              {firstName}
            </span>
          </h1>

          <p className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-2xl">
            Your Sutrak workspace is ready. Create events, automate conversations
            with AI agents, and manage guest experiences — all from one place.
          </p>
        </motion.div>

        {/* ── Quick Actions ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-3 mb-12 sm:mb-16"
        >
          <button
            onClick={() => navigate("/createEvent")}
            className="group relative flex items-center justify-center gap-2.5 bg-indigo-600 hover:bg-indigo-500 transition-all duration-300 rounded-xl px-6 py-3.5 font-semibold text-[15px] shadow-lg shadow-indigo-600/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={19} strokeWidth={2.5} />
            <span>Create Event</span>
            <ArrowRight 
              size={16} 
              className="opacity-0 group-hover:opacity-100 -ml-1 group-hover:ml-0 transition-all duration-300" 
            />
          </button>

          <button
            onClick={() => navigate("/agents/create")}
            className="group flex items-center justify-center gap-2.5 bg-[#13141A] border border-[#1F2230] hover:border-indigo-500/60 hover:bg-[#1A1B24] transition-all duration-300 rounded-xl px-6 py-3.5 font-semibold text-[15px]"
          >
            <Bot size={19} strokeWidth={2.5} />
            <span>Create Agent</span>
            <ArrowRight 
              size={16} 
              className="opacity-0 group-hover:opacity-100 -ml-1 group-hover:ml-0 transition-all duration-300" 
            />
          </button>
        </motion.div>

        {/* ── Cards Grid ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: 0.2 + index * 0.1,
                  duration: 0.5,
                  ease: [0.22, 1, 0.36, 1]
                }}
                onClick={() => navigate(card.route)}
                className={`
                  group relative cursor-pointer rounded-2xl bg-[#13141A] border border-[#1F2230]
                  ${card.border}
                  hover:bg-[#1A1B24] 
                  transition-all duration-300
                  overflow-hidden
                  hover:shadow-2xl hover:shadow-black/40
                  hover:-translate-y-1
                  active:translate-y-0
                `}
              >
                {/* Gradient accent overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${card.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                {/* Card content */}
                <div className="relative z-10 p-6 sm:p-7">
                  {/* Icon */}
                  <div className={`
                    inline-flex items-center justify-center w-12 h-12 rounded-xl 
                    ${card.iconBg} 
                    mb-6
                    group-hover:scale-110 group-hover:rotate-3
                    transition-transform duration-300
                  `}>
                    <Icon className={card.iconColor} size={22} strokeWidth={2} />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold mb-2 text-white group-hover:text-white transition-colors">
                    {card.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">
                    {card.description}
                  </p>

                  {/* Arrow indicator */}
                  <div className="flex items-center gap-1.5 text-gray-500 group-hover:text-indigo-400 transition-colors text-sm font-medium">
                    <span>Explore</span>
                    <ArrowRight 
                      size={14} 
                      className="group-hover:translate-x-1 transition-transform duration-300"
                    />
                  </div>
                </div>

                {/* Border glow effect on hover */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: 'radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(99, 102, 241, 0.1), transparent 40%)'
                  }}
                />
              </motion.div>
            );
          })}
        </div>

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-20 sm:mt-24 text-center"
        >
          <div className="inline-flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/50" />
            <span>Sutrak Workspace</span>
            <div className="w-px h-3 bg-gray-700" />
            <span>AI-Powered RSVP Management</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}