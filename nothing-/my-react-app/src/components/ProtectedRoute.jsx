import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, hasPermission, getUserRole } from '../utils/rbac';

// Protected Route Component with Permission Check
const ProtectedRoute = ({ children, requiredPermission = null }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPermission) {
    const userRole = getUserRole();
    if (!hasPermission(userRole, requiredPermission)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
            <button
              onClick={() => window.history.back()}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }
  }

  return children;
};

export default ProtectedRoute;
