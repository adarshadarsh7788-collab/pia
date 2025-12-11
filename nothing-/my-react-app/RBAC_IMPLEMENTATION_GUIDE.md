# Role-Based Access Control (RBAC) Implementation Guide

## 📋 Overview

This ESG platform now includes a comprehensive Role-Based Access Control (RBAC) system with **48 pre-configured users** across 3 user levels:

- **30 Data Entry Users** - Can only view and update data
- **15 Supervisors** - Can edit and delete data but cannot authorize
- **3 Super Admins** - Full access to all features including authorization

---

## 🔐 Pre-Configured User Accounts

### Super Admins (3 users)
Full system access - Can add, edit, delete, and authorize data

| Email | Password | Role |
|-------|----------|------|
| superadmin1@esgenius.com | Admin@2025 | Super Admin |
| superadmin2@esgenius.com | Admin@2025 | Super Admin |
| superadmin3@esgenius.com | Admin@2025 | Super Admin |

### Supervisors (15 users)
Can edit and delete data but cannot authorize

| Email | Password | Role |
|-------|----------|------|
| supervisor1@esgenius.com | Super@2025 | Supervisor |
| supervisor2@esgenius.com | Super@2025 | Supervisor |
| supervisor3@esgenius.com | Super@2025 | Supervisor |
| supervisor4@esgenius.com | Super@2025 | Supervisor |
| supervisor5@esgenius.com | Super@2025 | Supervisor |
| supervisor6@esgenius.com | Super@2025 | Supervisor |
| supervisor7@esgenius.com | Super@2025 | Supervisor |
| supervisor8@esgenius.com | Super@2025 | Supervisor |
| supervisor9@esgenius.com | Super@2025 | Supervisor |
| supervisor10@esgenius.com | Super@2025 | Supervisor |
| supervisor11@esgenius.com | Super@2025 | Supervisor |
| supervisor12@esgenius.com | Super@2025 | Supervisor |
| supervisor13@esgenius.com | Super@2025 | Supervisor |
| supervisor14@esgenius.com | Super@2025 | Supervisor |
| supervisor15@esgenius.com | Super@2025 | Supervisor |

### Data Entry Users (30 users)
Can only view and update existing data

| Email | Password | Role |
|-------|----------|------|
| dataentry1@esgenius.com | Data@2025 | Data Entry User |
| dataentry2@esgenius.com | Data@2025 | Data Entry User |
| dataentry3@esgenius.com | Data@2025 | Data Entry User |
| ... (continues to dataentry30) | Data@2025 | Data Entry User |

---

## 🎯 Permission Matrix

### Data Entry Users
✅ **CAN DO:**
- View Dashboard
- View existing data
- Update existing data entries

❌ **CANNOT DO:**
- Add new data
- Delete data
- Edit data structure
- Authorize data
- Access reports
- Access analytics
- Manage users

### Supervisors
✅ **CAN DO:**
- Everything Data Entry users can do
- Edit data
- Delete data
- View reports
- Generate reports
- View analytics
- View compliance data

❌ **CANNOT DO:**
- Add new data entries
- Authorize data
- Manage users
- Change system settings

### Super Admins
✅ **CAN DO:**
- Everything (Full Access)
- Add new data
- Edit data
- Delete data
- Authorize data
- Manage users (add, edit, delete)
- Approve new user registrations
- Change system settings
- Access all reports and analytics
- Manage compliance

---

## 🚀 How to Use

### 1. Login
1. Open the application
2. Use one of the pre-configured credentials above
3. The system will automatically assign permissions based on your role

### 2. For Data Entry Users
```
Login → View Dashboard → Navigate to Data Entry → Update existing records
```
- You'll see "Update" buttons but no "Add" or "Delete" buttons
- Authorization buttons will be hidden

### 3. For Supervisors
```
Login → Access Dashboard, Reports, Analytics → Edit/Delete data
```
- You'll see "Edit" and "Delete" buttons
- You can generate reports and view analytics
- Authorization buttons remain hidden

### 4. For Super Admins
```
Login → Full Access → Manage Users → Authorize Data
```
- Access to User Management page
- Can see and use all buttons (Add, Edit, Delete, Authorize)
- Can approve pending user registrations

---

## 🛠️ Implementation Details

### Files Created/Modified

#### New Files:
1. **`src/utils/rbac.js`** - Core RBAC logic and user management
2. **`src/components/ProtectedRoute.jsx`** - Route protection with permission checks
3. **`src/components/PermissionGuard.jsx`** - Component-level permission control
4. **`src/components/UserManagement.jsx`** - User management interface for Super Admins

#### Modified Files:
1. **`src/Login.jsx`** - Integrated RBAC authentication
2. **`src/App.js`** - Will need to add protected routes (see below)

### Key Functions

```javascript
// Check if user has permission
hasPermission(userRole, PERMISSIONS.ADD_DATA)

// Get current user role
getUserRole()

// Get current user info
getCurrentUser()

// Check authentication
isAuthenticated()
```

---

## 📝 Integration Steps for Existing Components

### Step 1: Protect Routes in App.js

Add this import:
```javascript
import ProtectedRoute from './components/ProtectedRoute';
import { PERMISSIONS } from './utils/rbac';
```

Wrap routes with permission checks:
```javascript
<Route 
  path="/user-management" 
  element={
    <ProtectedRoute requiredPermission={PERMISSIONS.MANAGE_USERS}>
      <UserManagement />
    </ProtectedRoute>
  } 
/>
```

### Step 2: Add Permission Guards to Components

In your DataEntry component:
```javascript
import PermissionGuard from './components/PermissionGuard';
import { PERMISSIONS } from './utils/rbac';

// Hide Add button for non-authorized users
<PermissionGuard permission={PERMISSIONS.ADD_DATA}>
  <button onClick={handleAdd}>Add New Entry</button>
</PermissionGuard>

// Hide Delete button for Data Entry users
<PermissionGuard permission={PERMISSIONS.DELETE_DATA}>
  <button onClick={handleDelete}>Delete</button>
</PermissionGuard>

// Hide Authorize button for non-Super Admins
<PermissionGuard permission={PERMISSIONS.AUTHORIZE_DATA}>
  <button onClick={handleAuthorize}>Authorize</button>
</PermissionGuard>
```

### Step 3: Update Navigation

Add User Management link for Super Admins in your header:
```javascript
import PermissionGuard from './components/PermissionGuard';
import { PERMISSIONS } from './utils/rbac';

<PermissionGuard permission={PERMISSIONS.MANAGE_USERS}>
  <Link to="/user-management">
    <span>👥 User Management</span>
  </Link>
</PermissionGuard>
```

---

## 🔄 Adding New Users

### For Super Admins:
1. Login as Super Admin
2. Navigate to "User Management" page
3. Click "Add User" button
4. Fill in user details:
   - Full Name
   - Email
   - Password
   - Role (Data Entry / Supervisor / Super Admin)
5. Click "Add User"

### Programmatically:
```javascript
const newUser = {
  email: 'newuser@esgenius.com',
  password: 'SecurePass@2025',
  fullName: 'New User Name',
  role: USER_ROLES.DATA_ENTRY
};

const systemUsers = JSON.parse(localStorage.getItem('systemUsers') || '[]');
systemUsers.push(newUser);
localStorage.setItem('systemUsers', JSON.stringify(systemUsers));
```

---

## 🎨 UI/UX Considerations

### Visual Indicators
- **Super Admin**: Red badge (🔴)
- **Supervisor**: Blue badge (🔵)
- **Data Entry**: Green badge (🟢)

### Button Visibility
- Buttons automatically hide based on permissions
- No need for manual role checks in most cases
- Use `PermissionGuard` component for conditional rendering

### Access Denied Page
- Automatically shown when user tries to access unauthorized page
- Provides "Go Back" button
- Clear error message

---

## 🔒 Security Best Practices

1. **Never expose passwords** - Change default passwords in production
2. **Use HTTPS** - Always use secure connections
3. **Session Management** - Implement proper session timeout
4. **Audit Logging** - Log all user actions (to be implemented)
5. **Password Policy** - Enforce strong passwords (to be implemented)

---

## 📊 Testing the System

### Test Scenario 1: Data Entry User
```
1. Login as dataentry1@esgenius.com
2. Try to access User Management → Should see "Access Denied"
3. Go to Data Entry → Should only see "Update" buttons
4. Try to add new entry → Button should not be visible
```

### Test Scenario 2: Supervisor
```
1. Login as supervisor1@esgenius.com
2. Access Reports → Should work
3. Try to authorize data → Button should not be visible
4. Edit existing data → Should work
```

### Test Scenario 3: Super Admin
```
1. Login as superadmin1@esgenius.com
2. Access User Management → Should work
3. Add new user → Should work
4. Authorize data → Should work
5. All features accessible
```

---

## 🐛 Troubleshooting

### Issue: User can't login
**Solution**: Check if user exists in localStorage under 'systemUsers'

### Issue: Permissions not working
**Solution**: Clear localStorage and reload page to reinitialize users

### Issue: User Management not showing
**Solution**: Ensure you're logged in as Super Admin

### Reset System
```javascript
// Clear all users and reinitialize
localStorage.removeItem('systemUsers');
// Reload page - system will auto-initialize with default users
```

---

## 📈 Future Enhancements

1. **Backend Integration** - Move user management to backend database
2. **JWT Tokens** - Implement proper token-based authentication
3. **Password Reset** - Add forgot password functionality
4. **2FA** - Two-factor authentication
5. **Audit Logs** - Track all user actions
6. **Session Timeout** - Auto-logout after inactivity
7. **Password Expiry** - Force password changes periodically
8. **IP Whitelisting** - Restrict access by IP address

---

## 📞 Support

For issues or questions:
1. Check this documentation first
2. Review the code comments in `src/utils/rbac.js`
3. Test with different user roles
4. Check browser console for errors

---

## ✅ Quick Start Checklist

- [ ] Login with Super Admin credentials
- [ ] Access User Management page
- [ ] Verify all 48 users are loaded
- [ ] Test Data Entry user permissions
- [ ] Test Supervisor permissions
- [ ] Test Super Admin permissions
- [ ] Integrate PermissionGuard in your components
- [ ] Update navigation with role-based links
- [ ] Test all permission scenarios
- [ ] Change default passwords for production

---

**Last Updated**: January 2025
**Version**: 1.0.0
