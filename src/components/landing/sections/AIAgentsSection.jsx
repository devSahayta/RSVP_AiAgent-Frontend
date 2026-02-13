import { useGsapReveal, useGsapStagger } from "../../../hooks/useGsapAnimations";
import { Bot, PhoneCall, BookOpen } from "lucide-react";

const agents = [
  {
    icon: Bot,
    title: "Chatbot Personalization",
    desc: "Each guest gets a personalized WhatsApp experience. The AI remembers context, adapts language, and handles edge cases — like dietary restrictions or plus-one confirmations.",
    color: "secondary",
  },
  {
    icon: PhoneCall,
    title: "Voice Call Automation",
    desc: "Natural-sounding AI voice agents make outbound calls, collect responses, answer questions about the event, and escalate only when needed.",
    color: "accent",
  },
  {
    icon: BookOpen,
    title: "Event Knowledge Base",
    desc: "Upload venue details, schedules, FAQs, and dress codes. The AI uses this to answer guest questions accurately — no human intervention required.",
    color: "secondary",
  },
];

const colorMap = {
  secondary: "from-secondary/20 to-secondary/5 border-secondary/20",
  accent: "from-accent/20 to-accent/5 border-accent/20",
};

const iconColor = {
  secondary: "text-secondary",
  accent: "text-accent",
};

const AIAgentsSection = () => {
  const headRef = useGsapReveal();
  const gridRef = useGsapStagger(".agent-card", 0.2);

  return (
    <section className="py-24 md:py-32 relative">
      <div className="max-w-6xl mx-auto px-4">
        <div ref={headRef} className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
            AI Agents That <span className="gradient-text">Actually Work</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Purpose-built AI that understands event logistics.
          </p>
        </div>

        <div ref={gridRef} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {agents.map((a) => (
            <div key={a.title} className={`agent-card rounded-xl p-8 bg-gradient-to-b ${colorMap[a.color]} border transition-all duration-300 hover:-translate-y-1`}>
              <a.icon className={`w-10 h-10 mb-6 ${iconColor[a.color]}`} />
              <h3 className="text-xl font-semibold text-foreground mb-4">{a.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{a.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AIAgentsSection;
