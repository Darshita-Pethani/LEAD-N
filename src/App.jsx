import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/authentication/Login';
import AdminPanel from './components/otherComponents/Layout';
import LeadsTable from './components/leads/LeadsTable';
import User from './components/User';
import Roles from './components/Roles';
import ProtectedRoutes from './ProtectedRoutes';
import PublicRoute from './PublicRoute';
import Permissions from './components/Permissions';
import SalesLeadReport from './components/ReportPage';
import Customers from './components/Customer';
import { GlobalToastContainer } from './components/otherComponents/toastContainer';
import ChangePassword from './components/authentication/ChangePassword';

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
