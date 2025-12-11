# 🏗️ RBAC System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    ESG PLATFORM RBAC SYSTEM                  │
│                         48 Total Users                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │         User Authentication              │
        │         (Login Component)                │
        │    src/Login.jsx + src/utils/rbac.js    │
        └─────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │      Role Assignment & Storage           │
        │         localStorage:                    │
        │    - currentUser (email)                 │
        │    - userRole (role)                     │
        │    - userFullName (name)                 │
        │    - isLoggedIn (boolean)                │
        └─────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │         Permission Validation            │
        │      hasPermission() function            │
        │    Checks role against permission        │
        └─────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                ▼             ▼             ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        │   Data   │  │Supervisor│  │  Super   │
        │  Entry   │  │          │  │  Admin   │
        │ (30 users)│  │(15 users)│  │(3 users) │
        └──────────┘  └──────────┘  └──────────┘
```

---

## User Role Hierarchy

```
                    ┌─────────────────┐
                    │   SUPER ADMIN   │
                    │   (3 users)     │
                    │   🔴 Full Access │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   SUPERVISOR    │
                    │   (15 users)    │
                    │   🔵 Edit/Delete │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   DATA ENTRY    │
                    │   (30 users)    │
                    │   🟢 View/Update │
                    └─────────────────┘
```

---

## Permission Flow

```
┌──────────────┐
│ User Action  │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│ PermissionGuard or   │
│ hasPermission()      │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Get User Role from   │
│ localStorage         │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Check Role against   │
│ ROLE_PERMISSIONS     │
└──────┬───────────────┘
       │
   ┌───┴───┐
   │       │
   ▼       ▼
┌─────┐ ┌─────┐
│Allow│ │Deny │
└─────┘ └─────┘
```

---

## Component Structure

```
src/
├── utils/
│   └── rbac.js ─────────────────┐ Core RBAC Logic
│       ├── USER_ROLES           │ - Role definitions
│       ├── PERMISSIONS          │ - Permission definitions
│       ├── ROLE_PERMISSIONS     │ - Role-permission mapping
│       ├── PRECONFIGURED_USERS  │ - 48 users
│       ├── hasPermission()      │ - Permission checker
│       ├── getUserRole()        │ - Get current role
│       └── authenticateUser()   │ - Login validation
│
├── components/
│   ├── ProtectedRoute.jsx ──────┐ Route Protection
│   │   ├── Check authentication │
│   │   ├── Check permissions    │
│   │   └── Show access denied   │
│   │
│   ├── PermissionGuard.jsx ─────┐ Component Protection
│   │   ├── Conditional render   │
│   │   └── Fallback support     │
│   │
│   ├── UserManagement.jsx ──────┐ User Management UI
│   │   ├── View all users       │
│   │   ├── Add/Edit/Delete      │
│   │   ├── Search & Filter      │
│   │   └── Role statistics      │
│   │
│   └── ProfessionalHeader.js ───┐ Navigation
│       └── Show/hide menu items │
│
├── Login.jsx ───────────────────┐ Authentication
│   ├── User login               │
│   ├── Role assignment          │
│   └── Initialize users         │
│
└── App.js ──────────────────────┐ Routing
    └── Protected routes         │
```

---

## Data Flow Diagram

```
┌─────────────┐
│   Browser   │
│ localStorage│
└──────┬──────┘
       │
       │ Store/Retrieve
       │
       ▼
┌─────────────────────────────────┐
│      systemUsers (Array)        │
│  [                              │
│    {email, password, fullName,  │
│     role: 'super_admin'},       │
│    {email, password, fullName,  │
│     role: 'supervisor'},        │
│    {email, password, fullName,  │
│     role: 'data_entry'}         │
│  ]                              │
└─────────────────────────────────┘
       │
       │ Read on Login
       │
       ▼
┌─────────────────────────────────┐
│   authenticateUser(email, pwd)  │
│   Returns: user object or null  │
└─────────────────────────────────┘
       │
       │ On Success
       │
       ▼
┌─────────────────────────────────┐
│   Store in localStorage:        │
│   - currentUser                 │
│   - userRole                    │
│   - userFullName                │
│   - isLoggedIn                  │
└─────────────────────────────────┘
       │
       │ Used by
       │
       ▼
┌─────────────────────────────────┐
│   All Components & Routes       │
│   Check permissions via         │
│   hasPermission(role, perm)     │
└─────────────────────────────────┘
```

---

## Permission Matrix Visualization

```
┌──────────────────┬─────────┬───────────┬────────────┐
│   Permission     │  Data   │Supervisor │Super Admin │
│                  │  Entry  │           │            │
├──────────────────┼─────────┼───────────┼────────────┤
│ VIEW_DASHBOARD   │    ✅   │     ✅    │     ✅     │
│ VIEW_DATA        │    ✅   │     ✅    │     ✅     │
│ UPDATE_DATA      │    ✅   │     ✅    │     ✅     │
│ EDIT_DATA        │    ❌   │     ✅    │     ✅     │
│ DELETE_DATA      │    ❌   │     ✅    │     ✅     │
│ ADD_DATA         │    ❌   │     ❌    │     ✅     │
│ AUTHORIZE_DATA   │    ❌   │     ❌    │     ✅     │
│ VIEW_REPORTS     │    ❌   │     ✅    │     ✅     │
│ GENERATE_REPORTS │    ❌   │     ✅    │     ✅     │
│ VIEW_ANALYTICS   │    ❌   │     ✅    │     ✅     │
│ MANAGE_USERS     │    ❌   │     ❌    │     ✅     │
│ SYSTEM_SETTINGS  │    ❌   │     ❌    │     ✅     │
└──────────────────┴─────────┴───────────┴────────────┘
```

---

## User Journey Flows

### Data Entry User Journey
```
Login
  ↓
Dashboard (View Only)
  ↓
Data Entry Page
  ↓
Select Record
  ↓
Update Data ✅
  ↓
Save Changes
  ↓
[Add Button Hidden ❌]
[Delete Button Hidden ❌]
[Authorize Button Hidden ❌]
```

### Supervisor Journey
```
Login
  ↓
Dashboard (Full View)
  ↓
Data Entry Page
  ↓
Select Record
  ↓
Update Data ✅
Edit Data ✅
Delete Data ✅
  ↓
View Reports ✅
Generate Reports ✅
  ↓
View Analytics ✅
  ↓
[Add Button Hidden ❌]
[Authorize Button Hidden ❌]
[User Management Hidden ❌]
```

### Super Admin Journey
```
Login
  ↓
Dashboard (Full Access)
  ↓
Data Entry Page
  ↓
Add New Data ✅
Update Data ✅
Edit Data ✅
Delete Data ✅
Authorize Data ✅
  ↓
View Reports ✅
Generate Reports ✅
  ↓
View Analytics ✅
  ↓
User Management ✅
  ↓
Add/Edit/Delete Users ✅
Change Roles ✅
System Settings ✅
```

---

## Integration Pattern

### Before RBAC:
```javascript
<button onClick={handleAdd}>Add</button>
<button onClick={handleEdit}>Edit</button>
<button onClick={handleDelete}>Delete</button>
<button onClick={handleAuthorize}>Authorize</button>
```

### After RBAC:
```javascript
<PermissionGuard permission={PERMISSIONS.ADD_DATA}>
  <button onClick={handleAdd}>Add</button>
</PermissionGuard>

<PermissionGuard permission={PERMISSIONS.EDIT_DATA}>
  <button onClick={handleEdit}>Edit</button>
</PermissionGuard>

<PermissionGuard permission={PERMISSIONS.DELETE_DATA}>
  <button onClick={handleDelete}>Delete</button>
</PermissionGuard>

<PermissionGuard permission={PERMISSIONS.AUTHORIZE_DATA}>
  <button onClick={handleAuthorize}>Authorize</button>
</PermissionGuard>
```

---

## Security Layers

```
┌─────────────────────────────────────────┐
│         Layer 1: Authentication         │
│    User must be logged in to access    │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│         Layer 2: Route Protection       │
│   ProtectedRoute checks permissions     │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│      Layer 3: Component Protection      │
│   PermissionGuard hides UI elements     │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│       Layer 4: Function Protection      │
│  hasPermission() checks in code logic   │
└─────────────────────────────────────────┘
```

---

## File Dependencies

```
Login.jsx
  │
  ├─→ utils/rbac.js
  │     ├─→ authenticateUser()
  │     ├─→ initializePreconfiguredUsers()
  │     └─→ PRECONFIGURED_USERS
  │
  └─→ localStorage
        ├─→ systemUsers
        ├─→ currentUser
        ├─→ userRole
        └─→ userFullName

App.js
  │
  ├─→ components/ProtectedRoute.jsx
  │     └─→ utils/rbac.js
  │           ├─→ isAuthenticated()
  │           ├─→ hasPermission()
  │           └─→ getUserRole()
  │
  └─→ components/UserManagement.jsx
        └─→ utils/rbac.js
              ├─→ USER_ROLES
              ├─→ ROLE_DISPLAY_NAMES
              ├─→ hasPermission()
              └─→ PERMISSIONS

Any Component
  │
  └─→ components/PermissionGuard.jsx
        └─→ utils/rbac.js
              ├─→ hasPermission()
              └─→ getUserRole()
```

---

## State Management

```
┌─────────────────────────────────────────┐
│          localStorage State             │
├─────────────────────────────────────────┤
│ systemUsers: Array<User>                │
│   - All 48 pre-configured users         │
│                                         │
│ currentUser: string                     │
│   - Email of logged-in user             │
│                                         │
│ userRole: string                        │
│   - 'super_admin' | 'supervisor' |      │
│     'data_entry'                        │
│                                         │
│ userFullName: string                    │
│   - Display name of user                │
│                                         │
│ isLoggedIn: string                      │
│   - 'true' | 'false'                    │
└─────────────────────────────────────────┘
```

---

## Quick Reference

### Check Permission:
```javascript
import { hasPermission, getUserRole, PERMISSIONS } from './utils/rbac';

const userRole = getUserRole();
if (hasPermission(userRole, PERMISSIONS.ADD_DATA)) {
  // User can add data
}
```

### Guard Component:
```javascript
import PermissionGuard from './components/PermissionGuard';
import { PERMISSIONS } from './utils/rbac';

<PermissionGuard permission={PERMISSIONS.DELETE_DATA}>
  <button>Delete</button>
</PermissionGuard>
```

### Protect Route:
```javascript
import ProtectedRoute from './components/ProtectedRoute';
import { PERMISSIONS } from './utils/rbac';

<Route path="/admin" element={
  <ProtectedRoute requiredPermission={PERMISSIONS.MANAGE_USERS}>
    <AdminPanel />
  </ProtectedRoute>
} />
```

---

**This architecture provides a scalable, maintainable RBAC system for your ESG platform.**
