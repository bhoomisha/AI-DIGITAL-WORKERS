import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './routes/ProtectedRoute';
import AIChatbot from './components/ai/AIChatbot';
import DemoRoleSwitcher from './components/ai/DemoRoleSwitcher';

// Existing pages
import LandingPage        from './pages/LandingPage';
import LoginPage          from './pages/LoginPage';
import RoleSelectPage     from './pages/RoleSelectPage';
import WorkerProfileSetup from './pages/WorkerProfileSetup';
import WorkerDashboard    from './pages/WorkerDashboard';
import JobListingPage     from './pages/JobListingPage';
import ApplicationsPage   from './pages/ApplicationsPage';
import AttendancePage     from './pages/AttendancePage';
import WorkSubmitPage     from './pages/WorkSubmitPage';
import ClientDashboard    from './pages/ClientDashboard';
import PostJobPage        from './pages/PostJobPage';
import ApplicantsPage     from './pages/ApplicantsPage';
import PaymentPage        from './pages/PaymentPage';
import ReviewPage         from './pages/ReviewPage';
import NotificationsPage  from './pages/NotificationsPage';
import DemoDashboard      from './pages/DemoDashboard';
import NotFoundPage       from './pages/NotFoundPage';

// NEW AI feature pages
import VideoBioPage          from './pages/ai/VideoBioPage';
import VoiceResumePage       from './pages/ai/VoiceResumePage';
import ContractMakerPage     from './pages/ai/ContractMakerPage';
import InterviewScorerPage   from './pages/ai/InterviewScorerPage';
import FakeProfileDetectorPage from './pages/ai/FakeProfileDetectorPage';
import DemandHeatmapPage     from './pages/ai/DemandHeatmapPage';

function AppRoutes() {
  const { user, role } = useApp();
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={user ? <Navigate to={role==='worker'?'/worker/dashboard':'/client/dashboard'} /> : <LandingPage />} />
        <Route path="/login"  element={<LoginPage />} />
        <Route path="/demo"   element={<DemoDashboard />} />
        <Route path="/heatmap" element={<DemandHeatmapPage />} />

        <Route path="/role-select" element={<ProtectedRoute><RoleSelectPage /></ProtectedRoute>} />

        {/* Worker */}
        <Route path="/worker/profile-setup"  element={<ProtectedRoute requiredRole="worker"><WorkerProfileSetup /></ProtectedRoute>} />
        <Route path="/worker/dashboard"      element={<ProtectedRoute requiredRole="worker"><WorkerDashboard /></ProtectedRoute>} />
        <Route path="/worker/jobs"           element={<ProtectedRoute requiredRole="worker"><JobListingPage /></ProtectedRoute>} />
        <Route path="/worker/applications"   element={<ProtectedRoute requiredRole="worker"><ApplicationsPage /></ProtectedRoute>} />
        <Route path="/worker/attendance"     element={<ProtectedRoute requiredRole="worker"><AttendancePage /></ProtectedRoute>} />
        <Route path="/worker/submit-work"    element={<ProtectedRoute requiredRole="worker"><WorkSubmitPage /></ProtectedRoute>} />
        {/* NEW AI worker features */}
        <Route path="/worker/video-bio"      element={<ProtectedRoute requiredRole="worker"><VideoBioPage /></ProtectedRoute>} />
        <Route path="/worker/voice-resume"   element={<ProtectedRoute requiredRole="worker"><VoiceResumePage /></ProtectedRoute>} />
        <Route path="/worker/interview"      element={<ProtectedRoute requiredRole="worker"><InterviewScorerPage /></ProtectedRoute>} />
        <Route path="/worker/trust-score"    element={<ProtectedRoute requiredRole="worker"><FakeProfileDetectorPage /></ProtectedRoute>} />

        {/* Client */}
        <Route path="/client/dashboard"   element={<ProtectedRoute requiredRole="client"><ClientDashboard /></ProtectedRoute>} />
        <Route path="/client/post-job"    element={<ProtectedRoute requiredRole="client"><PostJobPage /></ProtectedRoute>} />
        <Route path="/client/applicants"  element={<ProtectedRoute requiredRole="client"><ApplicantsPage /></ProtectedRoute>} />
        <Route path="/client/payment"     element={<ProtectedRoute requiredRole="client"><PaymentPage /></ProtectedRoute>} />
        {/* NEW client features */}
        <Route path="/client/contract"    element={<ProtectedRoute requiredRole="client"><ContractMakerPage /></ProtectedRoute>} />

        {/* Shared */}
        <Route path="/review"         element={<ProtectedRoute><ReviewPage /></ProtectedRoute>} />
        <Route path="/notifications"  element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {/* Floating AI Chatbot — visible on all authenticated pages */}
      {user && <AIChatbot />}
      {/* Demo Role Switcher — visible when ?demo=true */}
      <DemoRoleSwitcher />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
