// src/components/NavBar.jsx - WITH AUTO-REFRESH & NOTIFICATIONS
import React, { useEffect, useRef, useState } from "react";
import { User, LogOut, Coins, Calendar, Menu as MenuIcon, TrendingDown } from "lucide-react";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { useUserCredits } from "../hooks/useUserCredits";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "../styles/navbar.css";

const NavBar = ({ onToggleSidebar, isSidebarOpen }) => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [previousCredits, setPreviousCredits] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const { login, register, logout, isAuthenticated, user } = useKindeAuth();
  const username = user?.email ? user.email.split("@")[0] : "";

  const { credits, loading, refetchCredits } = useUserCredits(
    user?.id,
    isAuthenticated,
  );

  // ✅ AUTO-REFRESH CREDITS EVERY 10 SECONDS
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    const interval = setInterval(() => {
      // console.log("🔄 Auto-refreshing credits...");
      refetchCredits();
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, user?.id, refetchCredits]);

  // ✅ DETECT CREDIT CHANGES & SHOW NOTIFICATION
  useEffect(() => {
    if (credits === null || credits === undefined || loading) return;

    // First time loading
    if (previousCredits === null) {
      setPreviousCredits(credits);
      return;
    }

    // Credits changed!
    if (credits !== previousCredits) {
      const difference = credits - previousCredits;
      
      console.log(`💰 Credits changed: ${previousCredits} → ${credits} (${difference > 0 ? '+' : ''}${difference.toFixed(2)})`);
      
      // Trigger animation
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);

      // Show notification
      if (difference < 0) {
        // Credits deducted
        toast.custom((t) => (
          <div
            className={`credit-toast deducted ${t.visible ? 'show' : 'hide'}`}
            style={{
              background: '#1F1F23',
              color: '#fff',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #EF4444',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}
          >
            <TrendingDown size={20} color="#EF4444" />
            <div>
              <div style={{ fontWeight: '600', fontSize: '14px' }}>
                Credits Deducted
              </div>
              <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>
                {Math.abs(difference).toFixed(2)} credits used • Balance: {credits.toFixed(2)}
              </div>
            </div>
          </div>
        ), {
          duration: 4000,
          position: 'top-right',
        });
      } else if (difference > 0) {
        // Credits added
        toast.success(
          `+${difference.toFixed(2)} credits added! New balance: ${credits.toFixed(2)}`,
          {
            duration: 4000,
            position: 'top-right',
            icon: '💰',
          }
        );
      }

      setPreviousCredits(credits);
    }
  }, [credits, previousCredits, loading]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Close dropdown on route change
  useEffect(() => {
    setIsDropdownOpen(false);
  }, [navigate]);

  const getCreditBadgeClass = () => {
    if (loading) return "credit-badge gray";
    if (credits <= 5) return "credit-badge red";
    if (credits <= 20) return "credit-badge yellow";
    return "credit-badge green";
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
  };

  const handleWhatsappAccount = () => {
    setIsDropdownOpen(false);
    navigate("/whatsapp-account");
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        {isAuthenticated && (
          <button
            className="hamburger-btn"
            onClick={onToggleSidebar}
            aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
            aria-expanded={isSidebarOpen}
          >
            <MenuIcon size={20} />
          </button>
        )}

        <div className="nav-logo" aria-hidden>
          <Calendar className="nav-logo-icon" />
          <span>Sutrak</span>
        </div>
      </div>

      <div className="nav-right">
        {/* Credits visible in navbar with animation */}
        {isAuthenticated && (
          <div 
            className={`credits-inline ${isAnimating ? 'credit-change-animation' : ''}`}
            title="Your credits (auto-updates every 10s)"
          >
            <Coins size={16} />
            <span className={getCreditBadgeClass()}>
              {loading ? "..." : (credits ?? 0).toFixed(2)}
            </span>
            <button
              className="refresh-small"
              onClick={refetchCredits}
              title="Refresh credits now"
            >
              🔄
            </button>
          </div>
        )}

        {isAuthenticated ? (
          <div className="profile-wrapper" ref={dropdownRef}>
            <button
              className="nav-username"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              aria-expanded={isDropdownOpen}
              aria-haspopup="true"
            >
              <User size={18} className="user-icon" /> {username}
            </button>

            {isDropdownOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-header">
                  <p className="name">{username}</p>
                  <p className="email">{user?.email}</p>
                </div>

                <div className="dropdown-item">
                  <div className="left">
                    <Coins size={16} className="coin" />
                    <span>Credits</span>
                  </div>
                  <div className="right">
                    <span className={getCreditBadgeClass()}>
                      {loading ? "..." : (credits ?? 0).toFixed(2)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        refetchCredits();
                      }}
                      className="refresh-btn"
                      title="Refresh credits"
                    >
                      🔄
                    </button>
                  </div>
                </div>

                <div style={{ 
                  padding: '8px 16px', 
                  fontSize: '11px', 
                  color: '#6B7280',
                  borderTop: '1px solid #1F1F23',
                  marginTop: '8px',
                  paddingTop: '12px'
                }}>
                  ℹ️ Credits auto-refresh every 10 seconds
                </div>

                <button
                  onClick={handleWhatsappAccount}
                  className="dropdown-link"
                >
                  WhatsApp Account
                </button>

                <button onClick={handleLogout} className="dropdown-logout">
                  <LogOut size={14} className="inline mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="auth-actions">
            <button className="auth-button" onClick={login}>
              Login
            </button>
            <button className="auth-button" onClick={register}>
              Sign Up
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;