import React from "react";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const { login, register, isAuthenticated, user, logout } = useKindeAuth();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to RSVP AI 🎉</h1>
      <p className="mb-6 text-gray-600">Manage events and track RSVPs with AI.</p>

      {!isAuthenticated ? (
        // If user is NOT logged in → show login/signup
        <div className="space-x-4">
          <button onClick={() => login()} className="auth-button">
            Login
          </button>
          <button onClick={() => register()} className="auth-button">
            Sign Up
          </button>
        </div>
      ) : (
        // If user IS logged in → show create event + logout
        <div className="space-x-4">
          <button
            onClick={() => navigate("/createEvent")}
            className="auth-button"
          >
            Create Event
          </button>
          <button onClick={() => logout()} className="auth-button bg-red-500">
            Logout
          </button>
        </div>
      )}

      {isAuthenticated && (
        <p className="mt-4 text-gray-500">
          Logged in as <span className="font-medium">{user?.email}</span>
        </p>
      )}
    </div>
  );
};

export default LandingPage;
