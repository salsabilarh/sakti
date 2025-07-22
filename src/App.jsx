import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider, useAuth } from '@/contexts/AuthContext.jsx';
import LoginPage from '@/pages/LoginPage.jsx';
import RegistrationPage from '@/pages/RegistrationPage.jsx';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage.jsx';
import DashboardLayout from '@/components/layout/DashboardLayout.jsx';
import Dashboard from '@/pages/Dashboard.jsx';
import DaftarJasa from '@/pages/DaftarJasa.jsx';
import DetailService from '@/pages/DetailService.jsx';
import MarketingKit from '@/pages/MarketingKit.jsx';
import AdminPanel from '@/pages/AdminPanel.jsx';
import EditProfilePage from '@/pages/EditProfilePage.jsx';
import EditService from '@/pages/EditService.jsx';
import AddService from './pages/AddService.jsx';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegistrationPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      
      <Route 
        path="/" 
        element={
          isAuthenticated ? (
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />

      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/daftar-jasa" element={
        <ProtectedRoute>
          <DashboardLayout>
            <DaftarJasa />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/tambah-jasa" element={
        <ProtectedRoute>
          <DashboardLayout>
            <AddService />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/service/:id" element={
        <ProtectedRoute>
          <DashboardLayout>
            <DetailService />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/edit-service/:id" element={
        <ProtectedRoute>
          <DashboardLayout>
            <EditService />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/marketing-kit" element={
        <ProtectedRoute>
          <DashboardLayout>
            <MarketingKit />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute>
          <DashboardLayout>
            <AdminPanel />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/edit-profile" element={
        <ProtectedRoute>
          <DashboardLayout>
            <EditProfilePage />
          </DashboardLayout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}


function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen w-full bg-gray-50">
          <AppRoutes />
          <Toaster />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;