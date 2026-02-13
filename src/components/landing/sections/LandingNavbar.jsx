// src/components/landing/LandingNavbar.jsx
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { useNavigate } from "react-router-dom";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Use Cases", href: "#use-cases" },
  { label: "Integrations", href: "#integrations" },
];

const LandingNavbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { login, register, isAuthenticated, user } = useKindeAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/events");
    } else {
      register();
    }
  };

  const handleLogin = () => {
    if (isAuthenticated) {
      navigate("/events");
    } else {
      login();
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#" className="text-xl font-bold gradient-text">
            Sutrak
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {user?.given_name || user?.email}
                </span>
                <button
                  onClick={() => navigate("/events")}
                  className="px-4 py-2 text-sm bg-gradient-to-r from-secondary to-accent text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
                >
                  Go to Dashboard
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleLogin}
                  className="px-4 py-2 text-sm text-foreground hover:text-accent transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={handleGetStarted}
                  className="px-4 py-2 text-sm bg-gradient-to-r from-secondary to-accent text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden glass-strong border-t border-border/50 px-4 py-6 space-y-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}

          {/* Mobile Auth Buttons */}
          {isAuthenticated ? (
            <div className="space-y-3 pt-4 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                Signed in as {user?.given_name || user?.email}
              </p>
              <button
                onClick={() => {
                  navigate("/events");
                  setMobileOpen(false);
                }}
                className="w-full px-4 py-2 text-sm bg-gradient-to-r from-secondary to-accent text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
              >
                Go to Dashboard
              </button>
            </div>
          ) : (
            <div className="space-y-3 pt-4 border-t border-border/50">
              <button
                onClick={() => {
                  handleLogin();
                  setMobileOpen(false);
                }}
                className="w-full px-4 py-2 text-sm border border-border/50 text-foreground rounded-md hover:bg-muted/10 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  handleGetStarted();
                  setMobileOpen(false);
                }}
                className="w-full px-4 py-2 text-sm bg-gradient-to-r from-secondary to-accent text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default LandingNavbar;