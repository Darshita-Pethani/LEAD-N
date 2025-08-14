import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import LeadsTable from './components/LeadsTable';
import User from './components/User';
import Roles from './components/Roles';
import ProtectedRoutes from './ProtectedRoutes';
import PublicRoute from './PublicRoute';
import Permissions from './components/Permissions';
import SalesLeadReport from './components/ReportPage';
import Customers from './components/Customer';
import { GlobalToastContainer } from './components/toastContainer';

export default function App() {

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        {/* Protected Routes */}
        <Route element={<ProtectedRoutes />}>
          <Route element={<ProtectedRoutes />}>
            <Route path="/" element={<AdminPanel />}>
              <Route index element={<Navigate to="/leads" replace />} />
              <Route path="leads" element={<LeadsTable />} />
              <Route path="users" element={<User />} />
              <Route path="roles" element={<Roles />} />
              <Route path="permissions" element={<Permissions />} />
              <Route path="report" element={<SalesLeadReport />} />
              <Route path="customer" element={<Customers />} />
            </Route>
          </Route>
        </Route>
      </Routes>
      <GlobalToastContainer />

    </BrowserRouter>
  );
}
