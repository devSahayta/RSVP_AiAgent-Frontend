import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import CreateEvent from './pages/CreateEvent';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import './styles/global.css';

function PrivateRoute({ children }) {
  const { isAuthenticated, isLoading } = useKindeAuth();

  if (isLoading) return <p>Loading...</p>;
  return isAuthenticated ? children : <LandingPage />;
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <NavBar />
        <main className="pt-16">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/createEvent"
              element={
                <PrivateRoute>
                  <CreateEvent />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
