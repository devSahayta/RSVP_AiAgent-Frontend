import React from 'react';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';

const LandingPage = () => {
  const { login, register } = useKindeAuth();

  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to RSVP AI 🎉</h1>
      <p className="mb-6 text-gray-600">Manage events and track RSVPs with AI.</p>
      <div className="space-x-4">
        <button onClick={() => login()} className="auth-button">
          Login
        </button>
        <button onClick={() => register()} className="auth-button">
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
