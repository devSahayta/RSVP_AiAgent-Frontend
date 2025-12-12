// src/components/Sidebar.jsx
import React, { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { Calendar, Plus, MessageSquare, Mic, FileText } from "lucide-react";
import "../styles/sidebar.css";

const Sidebar = ({ isOpen, onClose }) => {
  const overlayRef = useRef(null);
  const drawerRef = useRef(null);

  // close on Escape key
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Prevent scroll when sidebar open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const links = [
    { name: "Events", path: "/events", icon: <Calendar size={18} /> },
    { name: "Create Event", path: "/createEvent", icon: <Plus size={18} /> },
    {
      name: "Chatbot Conversations",
      path: "/chatbot",
      icon: <MessageSquare size={18} />,
    },
    { name: "Templates", path: "/templates", icon: <Mic size={18} /> },

    {
      name: "Whatsaap Accounts",
      path: "/whatsapp-account",
      icon: <Plus size={18} />,
    },

    { name: "AI Voice Agents", path: "/voice-agents", icon: <Mic size={18} /> },
    {
      name: "Create Template",
      path: "/template/create",
      icon: <FileText size={18} />,
    },
  ];

  return (
    <>
      {/* Overlay (below navbar). Click anywhere on overlay closes sidebar */}
      <div
        ref={overlayRef}
        className={`sidebar-overlay ${isOpen ? "open" : ""}`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      {/* Drawer (slides from left) */}
      <aside
        ref={drawerRef}
        className={`sidebar-drawer ${isOpen ? "open" : ""}`}
        role="dialog"
        aria-hidden={!isOpen}
        aria-modal={isOpen}
      >
        <div className="sidebar-header">
          <h3>Menu</h3>
          <button
            onClick={onClose}
            className="sidebar-close"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <nav className="sidebar-links">
          {links.map((l) => (
            <NavLink
              key={l.path}
              to={l.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
              onClick={onClose} // close drawer after navigation
            >
              <span className="icon">{l.icon}</span>
              <span className="label">{l.name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
