// src/App.jsx - UPDATED VERSION
import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import NavBar from "./components/NavBar";
import Sidebar from "./components/Sidebar";
import CreateEvent from "./pages/CreateEvent";
import Dashboard from "./pages/Dashboard";
import LandingPage from "./pages/LandingPage";
import EventsPage from "./pages/EventsPage";
import CallBatchPage from "./pages/CallBatchPage";
import DocumentUpload from "./pages/DocumentUpload";
import DocumentViewer from "./components/DocumentViewer";
import ChatPage from "./pages/ChatPage";
import TemplateList from "./pages/TemplateList";
import CreateTemplate from "./pages/CreateTemplate";
import SendTemplate from "./pages/SendTemplate";
import WAccountPage from "./pages/WAccountPage";

import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { addUserToBackend } from "./api/userApi";

import "./styles/global.css";
import { fetchWhatsappAccount } from "./api/waccount";
import KnowledgeBases from "./pages/KnowledgeBases";
import CreateKnowledgeBase from "./pages/CreateKnowledgeBase";
import KnowledgeBaseDetail from "./pages/KnowledgeBaseDetail";
import { Toaster } from "react-hot-toast";
import TransportPlanning from './components/TransportPlanning';
import FlightStatus from "./pages/FlightStatus";

function PrivateRoute({ children }) {
  const { isAuthenticated, isLoading } = useKindeAuth();
  if (isLoading) return <p>Loading...</p>;
  return isAuthenticated ? children : <LandingPage />;
}

function WhatsappAccountRoute({ children }) {
  const { user, isAuthenticated, isLoading } = useKindeAuth();
  const [hasAccount, setHasAccount] = useState(null);
  const [loadingAccount, setLoadingAccount] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const loadWhatsappAccount = async () => {
      try {
        const res = await fetchWhatsappAccount(user.id);
        if (res?.data?.data?.wa_id) {
          setHasAccount(true);
        } else {
          setHasAccount(false);
        }
      } catch (err) {
        setHasAccount(false);
      } finally {
        setLoadingAccount(false);
      }
    };

    loadWhatsappAccount();
  }, [user?.id]);

  if (isLoading || loadingAccount) return <p>Loading...</p>;

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return hasAccount ? children : <Navigate to="/whatsapp-account" replace />;
}

function AppContent() {
  const { user, isAuthenticated, isLoading } = useKindeAuth();
  const location = useLocation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ✅ KEY CHANGE: Hide default NavBar on landing page AND document upload
  const hideNavBar = 
    location.pathname === "/" || 
    location.pathname.startsWith("/document-upload");

  // Sync user on first login
  useEffect(() => {
    if (isAuthenticated && user) {
      addUserToBackend(user);
    }
  }, [isAuthenticated, user]);

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  if (isLoading) return <p>Loading authentication...</p>;

  return (
    <div className="app-root">
      {/* ✅ Default NavBar - Hidden on landing page */}
      {!hideNavBar && (
        <NavBar
          onToggleSidebar={() => setIsSidebarOpen((s) => !s)}
          isSidebarOpen={isSidebarOpen}
        />
      )}

      {/* Sidebar */}
      {isAuthenticated && !hideNavBar && (
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main
        className={hideNavBar ? "content no-navbar" : "content with-navbar"}
      >
        <Routes>
          {/* ✅ Landing page has its own LandingNavbar component */}
          <Route path="/" element={<LandingPage />} />

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
          
          <Route
            path="/chatbot"
            element={
              <PrivateRoute>
                <ChatPage />
              </PrivateRoute>
            }
          />

          <Route path="/whatsapp-account" element={<WAccountPage />} />

          <Route
            path="/templates"
            element={
              <PrivateRoute>
                <WhatsappAccountRoute>
                  <TemplateList />
                </WhatsappAccountRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/template/create"
            element={
              <PrivateRoute>
                <WhatsappAccountRoute>
                  <CreateTemplate />
                </WhatsappAccountRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/templates/send/:templateId"
            element={
              <PrivateRoute>
                <WhatsappAccountRoute>
                  <SendTemplate />
                </WhatsappAccountRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/document-upload/:participantId"
            element={<DocumentUpload />}
          />
          
          <Route
            path="/document-viewer/:participantId"
            element={<DocumentViewer />}
          />

          <Route path="/knowledge-bases" element={<KnowledgeBases />} />
          
          <Route
            path="/knowledge-bases/create"
            element={<CreateKnowledgeBase />}
          />
          
          <Route
            path="/knowledge-bases/:id"
            element={<KnowledgeBaseDetail />}
          />

          <Route path="/transport-planning/:eventId" element={<TransportPlanning />} />
          
          <Route path="/flight-status/:eventId" element={<FlightStatus />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
        }}
      />
      <AppContent />
    </Router>
  );
}