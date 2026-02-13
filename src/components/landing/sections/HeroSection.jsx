import { useEffect, useRef } from "react";
import { Button } from "../../../components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { gsap } from "gsap";

const HeroSection = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(
      el.querySelector(".hero-badge"),
      { opacity: 0, y: 30, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8 }
    )
      .fromTo(
        el.querySelector(".hero-headline"),
        { opacity: 0, y: 60, clipPath: "inset(0 0 100% 0)" },
        { opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)", duration: 1.2 },
        "-=0.4"
      )
      .fromTo(
        el.querySelector(".hero-sub"),
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8 },
        "-=0.6"
      )
      .fromTo(
        el.querySelector(".hero-support"),
        { opacity: 0 },
        { opacity: 1, duration: 0.6 },
        "-=0.4"
      )
      .fromTo(
        el.querySelectorAll(".hero-btn"),
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, stagger: 0.15, duration: 0.6 },
        "-=0.3"
      )
      .fromTo(
        el.querySelector(".hero-trust"),
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6 },
        "-=0.2"
      );

    // Floating orbs continuous animation
    gsap.to(el.querySelectorAll(".orb"), {
      y: -30,
      duration: 4,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      stagger: { each: 1.5 },
    });

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <div className="absolute inset-0 grid-bg opacity-40" />

      <div className="orb absolute top-1/4 left-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[120px]" />
      <div className="orb absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/15 rounded-full blur-[100px]" />
      <div className="orb absolute top-1/2 right-1/3 w-64 h-64 bg-secondary/10 rounded-full blur-[80px]" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        <div className="hero-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-8 text-xs text-muted-foreground opacity-0">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
          Now in Early Access
        </div>

 <h1 className="hero-headline text-foreground text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6 opacity-0">

          From RSVP to Airport Pickup —{" "}
          <span className="gradient-text">Fully Automated</span>
        </h1>

        <p className="hero-sub text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-4 opacity-0">
          Sutrak replaces manual guest calls and follow-ups with AI voice agents and WhatsApp bots that collect RSVPs, travel details, and confirmations — and turn them into optimized transport plans.
        </p>

        <p className="hero-support text-sm text-muted-foreground/70 mb-10 opacity-0">
          No human calling. No guest chasing.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Button size="lg" className="hero-btn opacity-0 bg-gradient-to-r from-secondary to-accent text-primary-foreground hover:opacity-90 transition-opacity px-8 text-base">
            Book a Demo <ArrowRight className="ml-1 w-4 h-4" />
          </Button>
          <Button size="lg" variant="outline" className="hero-btn opacity-0 border-border/50 text-foreground hover:bg-muted/50 px-8 text-base">
            <Play className="mr-1 w-4 h-4" /> See How It Works
          </Button>
        </div>

        <div className="hero-trust flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground/60 opacity-0">
          {["WhatsApp Business API", "Secure", "Scalable", "Enterprise Ready"].map((t, i) => (
            <span key={t} className="flex items-center gap-2">
              {i > 0 && <span className="hidden sm:inline text-border">•</span>}
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
