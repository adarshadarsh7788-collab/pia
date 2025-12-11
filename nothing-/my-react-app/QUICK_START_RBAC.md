# 🚀 Quick Start Guide - RBAC System

## 📝 Summary

Your ESG platform now has **48 pre-configured users** with role-based access control:

- **3 Super Admins** - Full access (add, edit, delete, authorize)
- **15 Supervisors** - Edit & delete (no add or authorize)
- **30 Data Entry Users** - View & update only

---

## 🔑 Login Credentials

### Super Admin (Full Access)
```
Email: superadmin1@esgenius.com
Password: Admin@2025
```

### Supervisor (Edit but no authorize)
```
Email: supervisor1@esgenius.com
Password: Super@2025
```

### Data Entry (Update only)
```
Email: dataentry1@esgenius.com
Password: Data@2025
```

---

## 📍 Where Files Were Updated

### ✅ New Files Created:
1. **`src/utils/rbac.js`** - Core RBAC system with 48 users
2. **`src/components/ProtectedRoute.jsx`** - Route protection
3. **`src/components/PermissionGuard.jsx`** - Component-level permissions
4. **`src/components/UserManagement.jsx`** - User management UI

### ✅ Files Modified:
1. **`src/Login.jsx`** - Integrated RBAC authentication
2. **`src/App.js`** - Added User Management route
3. **`src/components/ProfessionalHeader.js`** - Added Users menu for admins

---

## 🎯 How to Use in Your Components

### Example 1: Hide "Add" Button for Non-Admins

```javascript
import PermissionGuard from './components/PermissionGuard';
import { PERMISSIONS } from './utils/rbac';

// In your DataEntry component
<PermissionGuard permission={PERMISSIONS.ADD_DATA}>
  <button onClick={handleAdd}>➕ Add New Entry</button>
</PermissionGuard>
```

### Example 2: Hide "Delete" Button for Data Entry Users

```javascript
<PermissionGuard permission={PERMISSIONS.DELETE_DATA}>
  <button onClick={handleDelete}>🗑️ Delete</button>
</PermissionGuard>
```

### Example 3: Hide "Authorize" Button for Non-Super Admins

```javascript
<PermissionGuard permission={PERMISSIONS.AUTHORIZE_DATA}>
  <button onClick={handleAuthorize}>✅ Authorize</button>
</PermissionGuard>
```

### Example 4: Check Permission in Code

```javascript
import { hasPermission, getUserRole, PERMISSIONS } from './utils/rbac';

const userRole = getUserRole();

if (hasPermission(userRole, PERMISSIONS.ADD_DATA)) {
  // User can add data
  handleAddData();
} else {
  alert('You do not have permission to add data');
}
```

---

## 🔧 Integration Steps

### Step 1: Update Your DataEntry Component

```javascript
import PermissionGuard from './components/PermissionGuard';
import { PERMISSIONS } from './utils/rbac';

// Wrap buttons with PermissionGuard
<div className="button-group">
  <PermissionGuard permission={PERMISSIONS.ADD_DATA}>
    <button>Add</button>
  </PermissionGuard>
  
  <PermissionGuard permission={PERMISSIONS.UPDATE_DATA}>
    <button>Update</button>
  </PermissionGuard>
  
  <PermissionGuard permission={PERMISSIONS.DELETE_DATA}>
    <button>Delete</button>
  </PermissionGuard>
  
  <PermissionGuard permission={PERMISSIONS.AUTHORIZE_DATA}>
    <button>Authorize</button>
  </PermissionGuard>
</div>
```

### Step 2: Update Your Reports Component

```javascript
import { hasPermission, getUserRole, PERMISSIONS } from './utils/rbac';

const Reports = () => {
  const userRole = getUserRole();
  const canGenerateReports = hasPermission(userRole, PERMISSIONS.GENERATE_REPORTS);
  
  return (
    <div>
      {canGenerateReports ? (
        <button onClick={generateReport}>Generate Report</button>
      ) : (
        <p>You don't have permission to generate reports</p>
      )}
    </div>
  );
};
```

---

## 📊 Permission Reference

### Data Entry Users Can:
- ✅ View Dashboard
- ✅ View Data
- ✅ Update Data

### Supervisors Can:
- ✅ Everything Data Entry can do
- ✅ Edit Data
- ✅ Delete Data
- ✅ View Reports
- ✅ Generate Reports
- ✅ View Analytics

### Super Admins Can:
- ✅ Everything Supervisors can do
- ✅ Add Data
- ✅ Authorize Data
- ✅ Manage Users
- ✅ System Settings

---

## 🧪 Testing

### Test 1: Data Entry User
1. Login as `dataentry1@esgenius.com`
2. Go to Data Entry page
3. Verify: Only "Update" button visible
4. Try accessing `/user-management` → Should see "Access Denied"

### Test 2: Supervisor
1. Login as `supervisor1@esgenius.com`
2. Go to Data Entry page
3. Verify: "Update", "Edit", "Delete" buttons visible
4. Verify: No "Add" or "Authorize" buttons
5. Try accessing `/user-management` → Should see "Access Denied"

### Test 3: Super Admin
1. Login as `superadmin1@esgenius.com`
2. Go to Data Entry page
3. Verify: All buttons visible (Add, Update, Edit, Delete, Authorize)
4. Click "Users" in navigation
5. Verify: User Management page loads
6. Add/Edit/Delete users

---

## 🎨 Available Permissions

```javascript
PERMISSIONS.VIEW_DASHBOARD
PERMISSIONS.VIEW_DATA
PERMISSIONS.UPDATE_DATA
PERMISSIONS.EDIT_DATA
PERMISSIONS.DELETE_DATA
PERMISSIONS.ADD_DATA
PERMISSIONS.AUTHORIZE_DATA
PERMISSIONS.VIEW_REPORTS
PERMISSIONS.GENERATE_REPORTS
PERMISSIONS.VIEW_ANALYTICS
PERMISSIONS.MANAGE_USERS
PERMISSIONS.APPROVE_USERS
PERMISSIONS.SYSTEM_SETTINGS
PERMISSIONS.VIEW_COMPLIANCE
PERMISSIONS.MANAGE_COMPLIANCE
PERMISSIONS.FULL_ACCESS
```

---

## 🔄 Managing Users

### As Super Admin:
1. Login with Super Admin credentials
2. Click "Users" in navigation (👤 icon)
3. View all 48 users
4. Search by email or name
5. Filter by role
6. Add new users
7. Change user roles
8. Delete users

---

## 💡 Common Use Cases

### Hide entire section for non-admins:
```javascript
<PermissionGuard permission={PERMISSIONS.MANAGE_USERS}>
  <div className="admin-section">
    <h2>Admin Controls</h2>
    {/* Admin-only content */}
  </div>
</PermissionGuard>
```

### Show different content based on role:
```javascript
import { getUserRole, USER_ROLES } from './utils/rbac';

const userRole = getUserRole();

{userRole === USER_ROLES.SUPER_ADMIN && <AdminPanel />}
{userRole === USER_ROLES.SUPERVISOR && <SupervisorPanel />}
{userRole === USER_ROLES.DATA_ENTRY && <DataEntryPanel />}
```

### Disable button instead of hiding:
```javascript
import { hasPermission, getUserRole, PERMISSIONS } from './utils/rbac';

const userRole = getUserRole();
const canDelete = hasPermission(userRole, PERMISSIONS.DELETE_DATA);

<button 
  onClick={handleDelete} 
  disabled={!canDelete}
  className={!canDelete ? 'opacity-50 cursor-not-allowed' : ''}
>
  Delete
</button>
```

---

## 🚨 Important Notes

1. **All 48 users are pre-configured** - No need to create them manually
2. **Users menu only visible to Super Admins** - Check navigation bar
3. **Passwords are default** - Change them in production
4. **LocalStorage based** - For production, move to backend database
5. **Auto-initialized** - System creates users on first load

---

## 📞 Need Help?

Check these files for examples:
- `src/utils/rbac.js` - All permission logic
- `src/components/UserManagement.jsx` - User management UI
- `src/components/PermissionGuard.jsx` - How to use guards
- `RBAC_IMPLEMENTATION_GUIDE.md` - Full documentation

---

**Ready to use! Login and test with different user roles.**
