import React from "react";
import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {
    const isLoggedIn = localStorage.getItem("token");

    if (isLoggedIn) {
        return <Navigate to="/leads" replace />;
    }

    return children;
};

export default PublicRoute;
