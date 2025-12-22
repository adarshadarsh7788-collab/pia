import React from 'react';
import { hasPermission, getUserRole } from '../utils/rbac';

// Component to conditionally render based on permissions
const PermissionGuard = ({ permission, children, fallback = null }) => {
  const userRole = getUserRole();
  
  if (!hasPermission(userRole, permission)) {
    return fallback;
  }
  
  return <>{children}</>;
};

export default PermissionGuard;
