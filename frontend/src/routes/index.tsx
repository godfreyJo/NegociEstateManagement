import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import PropertyDetail from '../pages/properties/PropertyDetail';

// Layouts
import AuthLayout from '../components/layout/AuthLayout';
import DashboardLayout from '../components/layout/DashboardLayout';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';


// Dashboard Pages
import Dashboard from '../pages/dashboard/Dashboard';
import PropertyList from '../pages/properties/PropertyList';
import TenantList from '../pages/tenants/TenantList';
import InvoiceList from '../pages/payments/InvoiceList';
import TicketList from '../pages/maintenance/TicketList';

// Protected Route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  <Route path="/properties/:id" element={<PropertyDetail />} />
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Protected Routes */}
      <Route element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route path="/" element={<Dashboard />} />
        <Route path="/properties" element={<PropertyList />} />
        <Route path="/tenants" element={<TenantList />} />
        <Route path="/payments" element={<InvoiceList />} />
        <Route path="/maintenance" element={<TicketList />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;