// src/pages/LandingPage.jsx
import LandingNavbar from "../components/landing/sections/LandingNavbar";
import HeroSection from "../components/landing/sections/HeroSection";
import ProblemSection from "../components/landing/sections/ProblemSection";
import SolutionSection from "../components/landing/sections/SolutionSection";
import FeaturesSection from "../components/landing/sections/FeaturesSection";
import HowItWorksSection from "../components/landing/sections/HowItWorksSection";
import WhySutrakSection from "../components/landing/sections/WhySutrakSection";
import UseCasesSection from "../components/landing/sections/UseCasesSection";
import AIAgentsSection from "../components/landing/sections/AIAgentsSection";
import IntegrationsSection from "../components/landing/sections/IntegrationsSection";
import EarlyAccessSection from "../components/landing/sections/EarlyAccessSection";
import FinalCTASection from "../components/landing/sections/FinalCTASection";
import FooterSection from "../components/landing/sections/FooterSection";

export default function LandingPage() {
  return (
    <div className="bg-black text-white">
      {/* Landing Page Navbar */}
      <LandingNavbar />
      
      {/* All Sections */}
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <FeaturesSection />
      <HowItWorksSection />
      <WhySutrakSection />
      <UseCasesSection />
      <AIAgentsSection />
      <IntegrationsSection />
      <EarlyAccessSection />
      <FinalCTASection />
      <FooterSection />
    </div>
  );
}