import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import ApiService from "./ApiService";


export const ProtectedRoute = ({element: Component}) => {
    const location = useLocation();
    return ApiService.isAuthenticated() ? (
        Component
    ):(
        <Navigate to="/login" replace state={{from: location}}/>
    );
};

export const AdminRoute = ({element:Component}) => {
    const location = useLocation();
    const role = ApiService.getRole();
    // Allow both ADMIN and MANAGER roles
    const isAdminOrManager = role === "ADMIN" || role === "MANAGER";
    return isAdminOrManager ? (
        Component
    ):(
        <Navigate to="/login" replace state={{from: location}}/>
    );
};

