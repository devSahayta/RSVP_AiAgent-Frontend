import { useGsapReveal, useGsapStagger } from "../../../hooks/useGsapAnimations";
import { LayoutDashboard, Mic, MessageCircle, Bus, Plane, Send, BookOpen } from "lucide-react";

const features = [
  { icon: LayoutDashboard, title: "Real-Time RSVP Dashboard", desc: "Track every guest's response status with live updates and filters.", highlight: false },
  { icon: Mic, title: "AI Voice Agent", desc: "Natural-sounding AI calls that collect travel details and confirmations.", highlight: false },
  { icon: MessageCircle, title: "AI WhatsApp Chatbot", desc: "Smart conversational bot on WhatsApp with multi-language support.", highlight: false },
  { icon: Bus, title: "Smart Transport Planning", desc: "Auto-generate optimized pickup routes, vehicle allocation, and schedules.", highlight: true },
  { icon: Plane, title: "Live Flight Tracking", desc: "Automatic flight monitoring with delay alerts and arrival updates.", highlight: false },
  { icon: Send, title: "WhatsApp Business Messaging", desc: "Official API integration with approved message templates.", highlight: false },
  { icon: BookOpen, title: "Event Knowledge Base", desc: "AI trained on your event details for accurate guest responses.", highlight: false },
];

const FeaturesSection = () => {
  const headRef = useGsapReveal();
  const gridRef = useGsapStagger(".feat-card", 0.1);

  return (
    <section id="features" className="py-24 md:py-32 relative">
      <div className="max-w-6xl mx-auto px-4">
        <div ref={headRef} className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
            Everything You Need,{" "}
            <span className="gradient-text">Nothing You Don't</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Purpose-built features for event guest automation and logistics.
          </p>
        </div>

        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className={`feat-card rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 group ${
                f.highlight
                  ? "gradient-border glass-strong glow-cyan"
                  : "glass hover:bg-white/[0.06]"
              } ${f.title === "Smart Transport Planning" ? "sm:col-span-2 lg:col-span-1" : ""}`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-colors ${
                f.highlight ? "bg-secondary/20 text-secondary" : "bg-muted text-muted-foreground group-hover:text-foreground"
              }`}>
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
