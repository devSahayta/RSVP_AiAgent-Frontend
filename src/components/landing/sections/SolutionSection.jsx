import { useGsapReveal, useGsapStagger } from "../../../hooks/useGsapAnimations";
import { Mic, MessageCircle, BarChart3, LayoutDashboard } from "lucide-react";

const pillars = [
  { icon: Mic, title: "AI Voice Agents", desc: "Automated outbound calls that sound natural, collect data, and follow up intelligently.", color: "primary" },
  { icon: MessageCircle, title: "WhatsApp AI Chatbot", desc: "Conversational AI on WhatsApp that gathers RSVPs, travel details, and preferences.", color: "secondary" },
  { icon: BarChart3, title: "Logistics Intelligence", desc: "Responses automatically transformed into actionable transport and logistics plans.", color: "accent" },
  { icon: LayoutDashboard, title: "Real-Time Dashboard", desc: "Live visibility into every guest's status, response, and travel information.", color: "primary" },
];

const colorMap = {
  primary: "bg-foreground/10 text-foreground group-hover:bg-foreground/20",
  secondary: "bg-secondary/10 text-secondary group-hover:bg-secondary/20",
  accent: "bg-accent/10 text-accent group-hover:bg-accent/20",
};

const SolutionSection = () => {
  const headRef = useGsapReveal();
  const gridRef = useGsapStagger(".sol-card", 0.2);

  return (
    <section className="py-24 md:py-32 relative">
      <div className="max-w-6xl mx-auto px-4">
        <div ref={headRef} className="text-center mb-16">
         <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
            Turn Guest Communication Into a{" "}
            <span className="gradient-text">System</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From chaos to clarity — automate every touchpoint of guest coordination.
          </p>
        </div>

        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((p) => (
            <div key={p.title} className="sol-card glass rounded-xl p-8 hover:bg-white/[0.06] transition-all duration-300 hover:-translate-y-1 group">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-colors ${colorMap[p.color]}`}>
                <p.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">{p.title}</h3>
              <p className="text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
