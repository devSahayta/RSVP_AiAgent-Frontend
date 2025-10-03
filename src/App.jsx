  // src/App.jsx
  import React, { useEffect } from "react";
  import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
  import NavBar from "./components/NavBar";
  import CreateEvent from "./pages/CreateEvent";
  import Dashboard from "./pages/Dashboard";
  import LandingPage from "./pages/LandingPage";
  import EventsPage from "./pages/EventsPage";
  import EventDashboard from "./components/EventDashboard";
  import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
  import { addUserToBackend } from "./api/userApi";
  import "./styles/global.css";
  import CallBatchPage from "./pages/CallBatchPage";
import RSVPTable from "./components/RSVPTable";
import DocumentUpload from "./pages/DocumentUpload";
import DocumentViewerPage from './pages/DocumentViewerPage';
import DocumentViewer from "./components/DocumentViewer";

  // PrivateRoute for protected pages
  function PrivateRoute({ children }) {
    const { isAuthenticated, isLoading } = useKindeAuth();

    if (isLoading) return <p>Loading...</p>;
    return isAuthenticated ? children : <LandingPage />;
  }

  function App() {
    const { user, isAuthenticated, isLoading } = useKindeAuth();

    // Sync new users to backend (only once)
  useEffect(() => {
    if (isAuthenticated && user) {
      addUserToBackend(user).then((storedUser) => {
        if (storedUser) console.log("User synced with backend:", storedUser);
      });
    }
  }, [isAuthenticated, user]);


    if (isLoading) return <p>Loading authentication...</p>;

    return (
      <Router>
        <div className="min-h-screen bg-white">
          <NavBar />
          <main className="pt-16">
            <Routes>
              {/* Public Route */}
              <Route path="/" element={<LandingPage />} />

              {/* Protected Routes */}
              <Route
                path="/events"
                element={
                  <PrivateRoute>
                    <EventsPage />
                  </PrivateRoute>
                }
              />       
              <Route
                path="/createEvent"
                element={
                  <PrivateRoute>
                    <CreateEvent />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard/:eventId"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />

               <Route
              path="/call-batch/:eventId"
              element={
                <PrivateRoute>
                  <CallBatchPage />
                </PrivateRoute>
              }
            />

                <Route path="/document-upload/:participantId" element={<DocumentUpload />} />
              <Route path="/document-viewer/:participantId" element={<DocumentViewer />} />

              {/* Redirect unknown routes */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    );
  }

  export default App;
