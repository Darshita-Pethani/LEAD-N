// import { Navigate, Outlet } from 'react-router-dom';

// export default function ProtectedRoutes() {
//     const token = localStorage.getItem('token');
//     return token ? <Outlet /> : <Navigate to="/login" />;
// }

import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

export default function ProtectedRoutes() {
    const token = localStorage.getItem("token");
    const forceChange = localStorage.getItem("forceChangePwd") === "true";
    const location = useLocation();

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (forceChange && location.pathname !== "/change-password") {
        toast.warning("Please change your password before accessing other pages!");
        window.alert("You must change your password before continuing.");
        return <Navigate to="/change-password" replace />;
    }

    return <Outlet />;
}
