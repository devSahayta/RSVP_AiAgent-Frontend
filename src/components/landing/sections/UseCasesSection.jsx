import { useGsapReveal, useGsapStagger } from "../../../hooks/useGsapAnimations";
import { Heart, Users, Building2, Crown } from "lucide-react";

const cases = [
  { icon: Heart, title: "Destination Weddings", desc: "Coordinate flights, hotels, and ground transport for hundreds of guests across cities." },
  { icon: Users, title: "Large Events", desc: "Scale guest communication and logistics for conferences, galas, and celebrations." },
  { icon: Building2, title: "Corporate Offsites", desc: "Manage employee travel, RSVPs, and transport for company retreats and summits." },
  { icon: Crown, title: "VIP Guest Logistics", desc: "White-glove coordination for high-profile guests with personalized itineraries." },
];

const UseCasesSection = () => {
  const headRef = useGsapReveal();
  const gridRef = useGsapStagger(".case-card", 0.15);

  return (
    <section id="use-cases" className="py-24 md:py-32 relative">
      <div className="max-w-6xl mx-auto px-4">
        <div ref={headRef} className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
            Built for <span className="gradient-text">Every Event</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From intimate gatherings to enterprise-scale events.
          </p>
        </div>

        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cases.map((c) => (
            <div key={c.title} className="case-card glass rounded-xl p-8 hover:bg-white/[0.06] transition-all duration-300 hover:-translate-y-1 group gradient-border">
              <c.icon className="w-8 h-8 text-secondary mb-5" />
              <h3 className="text-xl font-semibold text-foreground mb-3">{c.title}</h3>
              <p className="text-muted-foreground">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCasesSection;
