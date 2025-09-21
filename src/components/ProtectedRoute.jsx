// ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, role }) => {
  const loggedInUser = JSON.parse(localStorage.getItem("user"));

  // If no user is logged in, redirect to login
  if (!loggedInUser) {
    return <Navigate to="/" />;
  }

  // If user role doesn't match, redirect to login
  if (role && loggedInUser.role !== role) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
