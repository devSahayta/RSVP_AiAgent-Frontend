// src/components/NavBar.jsx
import React from "react";
import { Menu as MenuIcon, Sparkles } from "lucide-react";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import "../styles/navbar.css";

const NavBar = ({ onToggleSidebar, isSidebarOpen }) => {
  const { login, register, isAuthenticated } = useKindeAuth();

  return (
    <nav className="navbar">
      {/* ── Left ── */}
      <div className="nav-left">
        {isAuthenticated && (
          <button
            className="hamburger-btn"
            onClick={onToggleSidebar}
            aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
            aria-expanded={isSidebarOpen}
          >
            <MenuIcon size={18} />
          </button>
        )}
        <span className="nav-wordmark">Sutrak</span>
      </div>

      {/* ── Right ── */}
      <div className="nav-right">
        {isAuthenticated ? (
          <button className="nav-upgrade-btn">
            <Sparkles size={13} />
            Upgrade
          </button>
        ) : (
          <div className="auth-actions">
            <button className="auth-button" onClick={login}>
              Login
            </button>
            <button
              className="auth-button auth-button--primary"
              onClick={register}
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
