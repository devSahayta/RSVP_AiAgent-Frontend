import { useGsapReveal, useGsapStagger } from "../../../hooks/useGsapAnimations";
import { MessageCircle, Plane, Sheet } from "lucide-react";

const integrations = [
  { icon: MessageCircle, title: "WhatsApp / Meta", desc: "Official Business API with template messaging and rich media support." },
  { icon: Plane, title: "Flight APIs", desc: "Real-time flight tracking, delay alerts, and arrival time synchronization." },
  { icon: Sheet, title: "Google Sheets Export", desc: "One-click export of guest data, RSVPs, and logistics plans." },
];

const IntegrationsSection = () => {
  const headRef = useGsapReveal();
  const gridRef = useGsapStagger(".int-card", 0.2);

  return (
    <section id="integrations" className="py-24 md:py-32 relative">
      <div className="max-w-5xl mx-auto px-4">
        <div ref={headRef} className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
            Connects With Your <span className="gradient-text">Stack</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Seamless integrations with the tools you already use.
          </p>
        </div>

        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {integrations.map((int) => (
            <div key={int.title} className="int-card glass rounded-xl p-8 text-center hover:bg-white/[0.06] transition-all duration-300 hover:-translate-y-1 group">
              <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-secondary/20 transition-colors">
                <int.icon className="w-7 h-7 text-secondary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{int.title}</h3>
              <p className="text-sm text-muted-foreground">{int.desc}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground/60">And more coming soon…</p>
      </div>
    </section>
  );
};

export default IntegrationsSection;
