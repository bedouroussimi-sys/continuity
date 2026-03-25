/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './lib/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import PatientDashboard from './pages/PatientDashboard';
import ClinicianDashboard from './pages/ClinicianDashboard';
import FoodMoodLog from './pages/FoodMoodLog';
import CBTTools from './pages/CBTTools';
import Rewards from './pages/Rewards';
import Settings from './pages/Settings';
import AICoach from './pages/AICoach';
import MDTTeam from './pages/MDTTeam';
import CravingsLog from './pages/CravingsLog';
import GoalDashboard from './pages/GoalDashboard';
import PricingPage from './pages/PricingPage';
import OnboardingPage from './pages/OnboardingPage';
import Layout from './components/Layout';

function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: 'patient' | 'clinician' }) {
  const { user, profile, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  if (!profile?.onboardingComplete) return <Navigate to="/onboarding" />;
  
  if (role && profile?.role !== role) return <Navigate to="/" />;

  return <>{children}</>;
}

function AppRoutes() {
  const { user, profile, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route 
        path="/onboarding" 
        element={
          user ? <OnboardingPage /> : <Navigate to="/login" />
        } 
      />
      
      <Route element={<Layout />}>
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              {profile?.role === 'clinician' ? <ClinicianDashboard /> : <PatientDashboard />}
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/food-log" 
          element={
            <ProtectedRoute role="patient">
              <FoodMoodLog />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/cbt-tools" 
          element={
            <ProtectedRoute role="patient">
              <CBTTools />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/rewards" 
          element={
            <ProtectedRoute role="patient">
              <Rewards />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/ai-coach" 
          element={
            <ProtectedRoute role="patient">
              <AICoach />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/mdt-team" 
          element={
            <ProtectedRoute role="patient">
              <MDTTeam />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/cravings-log" 
          element={
            <ProtectedRoute role="patient">
              <CravingsLog />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/goals" 
          element={
            <ProtectedRoute role="patient">
              <GoalDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/pricing" 
          element={
            <PricingPage />
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } 
        />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <Toaster position="top-right" />
      </Router>
    </AuthProvider>
  );
}

