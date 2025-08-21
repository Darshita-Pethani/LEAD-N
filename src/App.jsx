import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/authentication/Login';
import AdminPanel from './components/Layout';
import LeadsTable from './pages/leads/LeadsTable';
import User from './pages/User';
import Roles from './pages/Roles';
import ProtectedRoutes from './ProtectedRoutes';
import PublicRoute from './PublicRoute';
import Permissions from './pages/Permissions';
import SalesLeadReport from './pages/ReportPage';
import Customers from './pages/Customer';
import { GlobalToastContainer } from './components/toastContainer';
import ChangePassword from './pages/authentication/ChangePassword';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoutes />}>

          {/* Admin Panel routes */}
          <Route path="/" element={<AdminPanel />}>
            <Route index element={<Navigate to="/leads" replace />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="leads" element={<LeadsTable />} />
            <Route path="users" element={<User />} />
            <Route path="roles" element={<Roles />} />
            <Route path="permissions" element={<Permissions />} />
            <Route path="report" element={<SalesLeadReport />} />
            <Route path="customer" element={<Customers />} />
          </Route>
        </Route>
      </Routes>

      <GlobalToastContainer />
    </BrowserRouter>
  );
}
