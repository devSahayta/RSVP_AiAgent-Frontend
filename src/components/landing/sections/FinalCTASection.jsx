import { useGsapReveal } from "../../../hooks/useGsapAnimations";
import { Button } from "../../../components/ui/button";
import { ArrowRight } from "lucide-react";

const FinalCTASection = () => {
  const ref = useGsapReveal();

  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/5 to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-secondary/10 rounded-full blur-[150px]" />

      <div ref={ref} className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
          Stop coordinating.{" "}
          <span className="gradient-text">Start orchestrating.</span>
        </h2>
        <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
          Let AI handle the guest communication. You focus on making the event unforgettable.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="bg-gradient-to-r from-secondary to-accent text-primary-foreground hover:opacity-90 transition-opacity px-8 text-base">
            Book Demo <ArrowRight className="ml-1 w-4 h-4" />
          </Button>
          <Button size="lg" variant="outline" className="border-border/50 text-foreground hover:bg-muted/50 px-8 text-base">
            Join Early Access
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FinalCTASection;
