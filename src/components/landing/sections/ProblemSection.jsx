import { useGsapReveal, useGsapStagger } from "../../../hooks/useGsapAnimations";
import { Phone, Clock, MessageSquare, AlertTriangle, Map, Database } from "lucide-react";

const pains = [
  { icon: Phone, title: "Calling every guest", desc: "Hours spent on manual phone calls that could be automated" },
  { icon: Clock, title: "Chasing RSVPs", desc: "Endless follow-ups eating into your event planning time" },
  { icon: MessageSquare, title: "Repeating questions", desc: "Same logistics questions asked to hundreds of guests" },
  { icon: AlertTriangle, title: "Last-minute travel surprises", desc: "Guests change plans with no way to track updates" },
  { icon: Map, title: "Transport guesswork", desc: "No data to plan pickups, routes, or vehicle allocation" },
  { icon: Database, title: "No single source of truth", desc: "Scattered data across chats, sheets, and notebooks" },
];

const ProblemSection = () => {
  const headRef = useGsapReveal();
  const gridRef = useGsapStagger(".pain-card", 0.12);

  return (
    <section className="py-24 md:py-32 relative">
      <div className="max-w-6xl mx-auto px-4">
        <div ref={headRef} className="text-center mb-16">
         <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
            Event coordination isn't hard —{" "}
            <span className="text-secondary">it's exhausting.</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            The manual work of guest communication drains time, energy, and sanity.
          </p>
        </div>

        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pains.map((p) => (
            <div
              key={p.title}
              className="pain-card glass rounded-xl p-6 hover:bg-white/[0.06] transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center mb-4 group-hover:bg-destructive/20 transition-colors">
                <p.icon className="w-5 h-5 text-destructive" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{p.title}</h3>
              <p className="text-sm text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
