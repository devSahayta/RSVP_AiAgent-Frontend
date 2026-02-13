import { useEffect, useRef } from "react";
import { useGsapReveal } from "../../../hooks/useGsapAnimations";
import { CalendarPlus, PhoneCall, RefreshCw, Route } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  { icon: CalendarPlus, title: "Create Event", desc: "Set up your event, upload guest list, and configure preferences." },
  { icon: PhoneCall, title: "AI Calls + WhatsApp Invites", desc: "AI voice agents call guests while WhatsApp bots send invitations." },
  { icon: RefreshCw, title: "AI Follows Up", desc: "Automated follow-ups until every data point is collected." },
  { icon: Route, title: "Transport Plan Generated", desc: "System generates optimized pickup routes and vehicle schedules." },
];

const HowItWorksSection = () => {
  const headRef = useGsapReveal();
  const stepsRef = useRef(null);

  useEffect(() => {
    const el = stepsRef.current;
    if (!el) return;

    const cards = el.querySelectorAll(".step-card");
    cards.forEach((card, i) => {
      gsap.fromTo(
        card,
        { opacity: 0, x: i % 2 === 0 ? -60 : 60, rotateY: i % 2 === 0 ? -10 : 10 },
        {
          opacity: 1,
          x: 0,
          rotateY: 0,
          duration: 0.9,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    });

    // Animate the connector line
    const line = el.querySelector(".connector-line");
    if (line) {
      gsap.fromTo(
        line,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top 70%",
            end: "bottom 30%",
            scrub: 1,
          },
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === el || cards[0]?.contains(t.trigger)) t.kill();
      });
    };
  }, []);

  return (
    <section id="how-it-works" className="py-24 md:py-32 relative">
      <div className="max-w-5xl mx-auto px-4">
        <div ref={headRef} className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Four steps from event creation to fully optimized logistics.
          </p>
        </div>

        <div ref={stepsRef} className="relative">
          <div className="connector-line hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-secondary via-accent to-secondary opacity-30 origin-top" />

          <div className="space-y-12 md:space-y-0 md:grid md:grid-cols-4 md:gap-8">
            {steps.map((s, i) => (
              <div key={s.title} className="step-card relative text-center">
                <div className="relative z-10 w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-secondary/20 to-accent/20 border border-secondary/30 flex items-center justify-center mb-6">
                  <s.icon className="w-7 h-7 text-secondary" />
                </div>
                <div className="text-xs font-mono text-secondary mb-2">Step {i + 1}</div>
                <h3 className="font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
