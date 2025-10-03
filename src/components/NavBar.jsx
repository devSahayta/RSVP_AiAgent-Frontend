import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Calendar, LogOut,BarChart3, User, Plus } from 'lucide-react'; // ✅ Added Plus icon
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import '../styles/navbar.css';

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { login, register, logout, isAuthenticated, user } = useKindeAuth();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const isActive = (path) => location.pathname === path;

  // ✅ Extract username from email
  const username = user?.email ? user.email.split('@')[0] : '';

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo">
          <Calendar className="nav-logo-icon" />
          <span>RSVP AI</span>
        </div>

        {/* Desktop Navigation */}
        <div className="nav-links-desktop">
          {isAuthenticated && (
            <>
              <Link
                to="/events"
                className={`nav-link ${isActive('/events') ? 'active' : ''}`}
              >
                <Calendar size={18} />
                Events
              </Link>
              <Link
                to="/createEvent"
                className={`nav-link ${isActive('/createEvent') ? 'active' : ''}`}
              >
                <Plus size={16} className="mr-1" /> {/* ✅ Added Plus icon */}
                Create Event
              </Link>

              {/* ✅ Show username with icon */}
              <span className="nav-username">
                <User size={18} className="user-icon" /> {username}
              </span>
            </>
          )}

          {!isAuthenticated ? (
            <>
              <button className="auth-button" onClick={() => login()}>
                Login
              </button>
              <button className="auth-button" onClick={() => register()}>
                Sign Up
              </button>
            </>
          ) : (
            <button className="auth-button" onClick={() => logout()}>
              Logout
            </button>
          )}
        </div>

        {/* Mobile Menu */}
        <button className="mobile-menu-toggle" onClick={toggleMenu}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`nav-links-mobile ${isMenuOpen ? 'open' : ''}`}>
          {isAuthenticated && (
            <>
              <Link
                to="/events"
                className={`nav-link ${isActive('/events') ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Calendar size={18} />
                Events
              </Link>
              <Link
                to="/createEvent"
                className={`nav-link ${isActive('/createEvent') ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Plus size={16} className="mr-1" /> {/* ✅ Plus icon in mobile */}
                Create Event
              </Link>

              {/* ✅ Username in mobile */}
              <span className="nav-username">
                <User size={18} className="user-icon" /> {username}
              </span>
            </>
          )}

          {!isAuthenticated ? (
            <>
              <button
                className="auth-button"
                onClick={() => {
                  login();
                  setIsMenuOpen(false);
                }}
              >
                Login
              </button>
              <button
                className="auth-button"
                onClick={() => {
                  register();
                  setIsMenuOpen(false);
                }}
              >
                Sign Up
              </button>
            </>
          ) : (
            <button
              className="auth-button"
              onClick={() => {
                logout();
                setIsMenuOpen(false);
              }}
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
