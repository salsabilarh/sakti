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
import TambahJasa from './pages/TambahJasa.jsx';
import EditJasa from './pages/EditJasa.jsx';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
}

function RoleProtectedRoute({ allowedRoles, children }) {
  const { user } = useAuth();

  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
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
            <TambahJasa />
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
            <EditJasa />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      {/* <Route path="/kelola-portofolio" element={
        <ProtectedRoute>
          <DashboardLayout>
            <KelolaPortfolio />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/kelola-sektor" element={
        <ProtectedRoute>
          <DashboardLayout>
            <KelolaSektor />
          </DashboardLayout>
        </ProtectedRoute>
      } /> */}
      <Route path="/marketing-kit" element={
        <ProtectedRoute>
          <RoleProtectedRoute allowedRoles={['admin', 'management', 'pdo']}>
            <DashboardLayout>
              <MarketingKit />
            </DashboardLayout>
          </RoleProtectedRoute>
        </ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute>
          <RoleProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout>
              <AdminPanel />
            </DashboardLayout>
          </RoleProtectedRoute>
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