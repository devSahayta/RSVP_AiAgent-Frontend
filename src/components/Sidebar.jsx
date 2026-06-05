// src/components/Sidebar.jsx
import React, { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { useUserCredits } from "../hooks/useUserCredits";
import {
  Calendar,
  Plus,
  MessageSquare,
  FileText,
  LayersIcon,
  Bot,
  Plug,
  LogOut,
  ChevronRight,
  Coins,
  RefreshCw,
  TrendingDown,
  Settings,
} from "lucide-react";
import toast from "react-hot-toast";
import "../styles/sidebar.css";

const NAV_LINKS = [
  { name: "Events", path: "/events", icon: Calendar },
  { name: "Create Event", path: "/createEvent", icon: Plus },
  { name: "Agents", path: "/agents", icon: Bot },
  { name: "Chatbot", path: "/chatbot", icon: MessageSquare },
  { name: "Templates", path: "/templates", icon: LayersIcon },
  { name: "Create Template", path: "/template/create", icon: FileText },
  { name: "WA Templates", path: "/templates/whatsapp", icon: MessageSquare },
  ,
];

const SETTINGS_LINKS = [
  { name: "Samvaadik", path: "/settings/samvaadik", icon: Plug },
];

const Sidebar = ({ isOpen, onClose }) => {
  const drawerRef = useRef(null);
  const { user, logout, isAuthenticated } = useKindeAuth();
  const navigate = useNavigate();

  const {
    credits,
    loading: creditsLoading,
    refetchCredits,
  } = useUserCredits(user?.id, isAuthenticated);

  const [prevCredits, setPrevCredits] = useState(null);
  const [creditAnim, setCreditAnim] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Auto-refresh credits every 30s while sidebar is open
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    const iv = setInterval(refetchCredits, 30000);
    return () => clearInterval(iv);
  }, [isAuthenticated, user?.id, refetchCredits]);

  // Detect credit changes
  useEffect(() => {
    if (credits === null || credits === undefined || creditsLoading) return;
    if (prevCredits === null) {
      setPrevCredits(credits);
      return;
    }
    if (credits !== prevCredits) {
      const diff = credits - prevCredits;
      setCreditAnim(true);
      setTimeout(() => setCreditAnim(false), 700);
      if (diff < 0) {
        toast.custom(
          (t) => (
            <div
              style={{
                background: "#1F1F23",
                color: "#fff",
                padding: "14px 16px",
                borderRadius: 12,
                border: "1px solid #EF4444",
                display: "flex",
                alignItems: "center",
                gap: 10,
                boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
              }}
            >
              <TrendingDown size={18} color="#EF4444" />
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>
                  Credits Deducted
                </div>
                <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 3 }}>
                  {Math.abs(diff).toFixed(2)} used · Balance:{" "}
                  {credits.toFixed(2)}
                </div>
              </div>
            </div>
          ),
          { duration: 4000, position: "top-right" },
        );
      } else {
        toast.success(
          `+${diff.toFixed(2)} credits added! Balance: ${credits.toFixed(2)}`,
          { duration: 4000, position: "top-right", icon: "💰" },
        );
      }
      setPrevCredits(credits);
    }
  }, [credits, prevCredits, creditsLoading]);

  // Escape key
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close profile popup on outside click
  useEffect(() => {
    if (!profileOpen) return;
    const handler = (e) => {
      if (!drawerRef.current?.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [profileOpen]);

  // Initials
  const given = user?.given_name || "";
  const family = user?.family_name || "";
  const displayName =
    [given, family].filter(Boolean).join(" ") ||
    user?.email?.split("@")?.[0] ||
    "User";
  const displayEmail = user?.email ?? "";
  const initials =
    given && family
      ? `${given[0]}${family[0]}`.toUpperCase()
      : given
        ? given.slice(0, 2).toUpperCase()
        : (user?.email?.split("@")?.[0] ?? "U").slice(0, 2).toUpperCase();

  const creditColor = creditsLoading
    ? "#71717a"
    : credits <= 5
      ? "#ef4444"
      : credits <= 20
        ? "#f59e0b"
        : "#34d399";

  return (
    <>
      {/* Backdrop */}
      <div
        className={`sb-backdrop ${isOpen ? "sb-backdrop--open" : ""}`}
        onClick={onClose}
        aria-hidden
      />

      {/* Drawer */}
      <aside
        ref={drawerRef}
        className={`sb-drawer ${isOpen ? "sb-drawer--open" : ""}`}
        role="dialog"
        aria-modal={isOpen}
        aria-hidden={!isOpen}
      >
        {/* ── Brand ── */}
        <div className="sb-brand">
          <div className="sb-brand__logo">S</div>
          <span className="sb-brand__name">Sutrak</span>
          <button className="sb-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* ── Main nav ── */}
        <nav className="sb-nav sb-nav--main">
          <p className="sb-nav__label">Main</p>
          {NAV_LINKS.map(({ name, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={({ isActive }) =>
                `sb-link ${isActive ? "sb-link--active" : ""}`
              }
            >
              <span className="sb-link__icon">
                <Icon size={16} />
              </span>
              <span className="sb-link__label">{name}</span>
              <ChevronRight size={12} className="sb-link__arrow" />
            </NavLink>
          ))}
        </nav>

        <div className="sb-spacer" />

        {/* ── Settings ── */}
        <nav className="sb-nav sb-nav--settings">
          <p className="sb-nav__label">Settings</p>
          {SETTINGS_LINKS.map(({ name, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={({ isActive }) =>
                `sb-link ${isActive ? "sb-link--active" : ""}`
              }
            >
              <span className="sb-link__icon">
                <Icon size={16} />
              </span>
              <span className="sb-link__label">{name}</span>
              <ChevronRight size={12} className="sb-link__arrow" />
            </NavLink>
          ))}
        </nav>

        {/* ── Credits bar ── */}
        <div className="sb-credits">
          <div className="sb-credits__inner">
            <div className="sb-credits__left">
              <Coins size={14} style={{ color: creditColor, flexShrink: 0 }} />
              <span className="sb-credits__label">Credits</span>
            </div>
            <div className="sb-credits__right">
              <span
                className={`sb-credits__value ${creditAnim ? "sb-credits--flash" : ""}`}
                style={{ color: creditColor }}
              >
                {creditsLoading ? "…" : (credits ?? 0).toFixed(2)}
              </span>
              <button
                className="sb-credits__refresh"
                onClick={refetchCredits}
                title="Refresh credits"
                aria-label="Refresh credits"
              >
                <RefreshCw size={12} />
              </button>
            </div>
          </div>
          {!creditsLoading && credits <= 20 && (
            <p
              className="sb-credits__warn"
              style={{ color: credits <= 5 ? "#ef4444" : "#f59e0b" }}
            >
              {credits <= 5 ? "⚠ Low credits" : "Credits running low"}
            </p>
          )}
        </div>

        {/* ── User footer ── */}
        <div className="sb-footer">
          <div className="sb-user" onClick={() => setProfileOpen((v) => !v)}>
            <div className="sb-user__avatar">{initials}</div>
            <div className="sb-user__info">
              <p className="sb-user__name">{displayName}</p>
              <p className="sb-user__email">{displayEmail}</p>
            </div>
            <button
              className="sb-user__logout"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
                logout();
              }}
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut size={14} />
            </button>
          </div>

          {/* Profile popup */}
          {profileOpen && (
            <div className="sb-profile-popup">
              <div className="sb-profile-popup__header">
                <div className="sb-profile-popup__avatar">{initials}</div>
                <div>
                  <p className="sb-profile-popup__name">{displayName}</p>
                  <p className="sb-profile-popup__email">{displayEmail}</p>
                </div>
              </div>
              <div className="sb-profile-popup__divider" />
              <button
                className="sb-profile-popup__item"
                onClick={() => {
                  setProfileOpen(false);
                  onClose();
                  navigate("/whatsapp-account");
                }}
              >
                WhatsApp Account
              </button>
              <button
                className="sb-profile-popup__item"
                onClick={() => {
                  setProfileOpen(false);
                  onClose();
                  navigate("/settings/samvaadik");
                }}
              >
                Samvaadik Settings
              </button>
              <div className="sb-profile-popup__divider" />
              <button
                className="sb-profile-popup__item sb-profile-popup__item--danger"
                onClick={() => {
                  setProfileOpen(false);
                  onClose();
                  logout();
                }}
              >
                <LogOut size={13} /> Sign out
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
