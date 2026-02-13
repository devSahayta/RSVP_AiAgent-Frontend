import { useGsapScale } from "../../../hooks/useGsapAnimations";
import { Button } from "../../../components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const EarlyAccessSection = () => {
  const ref = useGsapScale();

  return (
    <section className="py-24 md:py-32 relative">
      <div className="max-w-4xl mx-auto px-4">
        <div ref={ref} className="glass-strong rounded-2xl p-10 md:p-16 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-secondary/20 rounded-full blur-[100px]" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs mb-6">
              <Sparkles className="w-3 h-3" /> Limited Early Access
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Be First to <span className="gradient-text">Orchestrate</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Join the first wave of event organizers using AI to eliminate guest coordination chaos.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="bg-gradient-to-r from-secondary to-accent text-primary-foreground hover:opacity-90 transition-opacity px-8">
                Request Early Access <ArrowRight className="ml-1 w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" className="border-border/50 text-foreground hover:bg-muted/50 px-8">
                Book Demo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EarlyAccessSection;
