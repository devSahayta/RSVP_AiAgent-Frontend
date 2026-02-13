import { useGsapReveal, useGsapStagger } from "../../../hooks/useGsapAnimations";
import { MessageSquare, Database, Truck, Zap } from "lucide-react";

const flow = [
  { icon: MessageSquare, label: "Communication", color: "text-secondary" },
  { icon: Database, label: "Data", color: "text-accent" },
  { icon: Truck, label: "Logistics", color: "text-secondary" },
  { icon: Zap, label: "Execution", color: "text-accent" },
];

const WhySutrakSection = () => {
  const headRef = useGsapReveal();
  const flowRef = useGsapStagger(".flow-item", 0.2);

  return (
    <section className="py-24 md:py-32 relative">
      <div className="max-w-5xl mx-auto px-4 text-center">
        <div ref={headRef}>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
            Why <span className="gradient-text">Sutrak</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-4 max-w-3xl mx-auto">
            Most tools help manage responses.
          </p>
          <p className="text-xl font-semibold text-foreground mb-16 max-w-3xl mx-auto">
            Sutrak eliminates manual coordination entirely.
          </p>
        </div>

        <div ref={flowRef} className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0">
          {flow.map((f, i) => (
            <div key={f.label} className="flow-item flex items-center gap-4">
              <div className="glass rounded-xl p-6 text-center min-w-[140px]">
                <f.icon className={`w-8 h-8 mx-auto mb-3 ${f.color}`} />
                <span className="text-sm font-medium text-foreground">{f.label}</span>
              </div>
              {i < flow.length - 1 && (
                <div className="hidden md:block text-muted-foreground/40 text-2xl">→</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhySutrakSection;
