# 🔧 RBAC Integration Examples

## Example 1: DataEntry Component Integration

### Before (No RBAC):
```javascript
const DataEntry = () => {
  return (
    <div>
      <button onClick={handleAdd}>Add</button>
      <button onClick={handleUpdate}>Update</button>
      <button onClick={handleDelete}>Delete</button>
      <button onClick={handleAuthorize}>Authorize</button>
    </div>
  );
};
```

### After (With RBAC):
```javascript
import PermissionGuard from './components/PermissionGuard';
import { PERMISSIONS } from './utils/rbac';

const DataEntry = () => {
  return (
    <div>
      {/* Only Super Admins can see Add button */}
      <PermissionGuard permission={PERMISSIONS.ADD_DATA}>
        <button onClick={handleAdd}>Add</button>
      </PermissionGuard>
      
      {/* All users can see Update button */}
      <PermissionGuard permission={PERMISSIONS.UPDATE_DATA}>
        <button onClick={handleUpdate}>Update</button>
      </PermissionGuard>
      
      {/* Supervisors and Super Admins can see Delete button */}
      <PermissionGuard permission={PERMISSIONS.DELETE_DATA}>
        <button onClick={handleDelete}>Delete</button>
      </PermissionGuard>
      
      {/* Only Super Admins can see Authorize button */}
      <PermissionGuard permission={PERMISSIONS.AUTHORIZE_DATA}>
        <button onClick={handleAuthorize}>Authorize</button>
      </PermissionGuard>
    </div>
  );
};
```

---

## Example 2: Reports Component Integration

### Before:
```javascript
const Reports = () => {
  return (
    <div>
      <h1>Reports</h1>
      <button onClick={generateReport}>Generate Report</button>
      <button onClick={downloadReport}>Download</button>
    </div>
  );
};
```

### After:
```javascript
import PermissionGuard from './components/PermissionGuard';
import { PERMISSIONS, hasPermission, getUserRole } from './utils/rbac';

const Reports = () => {
  const userRole = getUserRole();
  
  const handleGenerateReport = () => {
    if (!hasPermission(userRole, PERMISSIONS.GENERATE_REPORTS)) {
      alert('You do not have permission to generate reports');
      return;
    }
    generateReport();
  };
  
  return (
    <div>
      <h1>Reports</h1>
      
      {/* Only Supervisors and Super Admins can generate reports */}
      <PermissionGuard permission={PERMISSIONS.GENERATE_REPORTS}>
        <button onClick={handleGenerateReport}>Generate Report</button>
      </PermissionGuard>
      
      {/* All users can view reports */}
      <PermissionGuard permission={PERMISSIONS.VIEW_REPORTS}>
        <button onClick={downloadReport}>Download</button>
      </PermissionGuard>
    </div>
  );
};
```

---

## Example 3: Analytics Component Integration

### Before:
```javascript
const Analytics = () => {
  return (
    <div>
      <h1>Analytics Dashboard</h1>
      <div className="charts">
        <Chart1 />
        <Chart2 />
        <AdvancedAnalytics />
      </div>
    </div>
  );
};
```

### After:
```javascript
import PermissionGuard from './components/PermissionGuard';
import { PERMISSIONS } from './utils/rbac';

const Analytics = () => {
  return (
    <div>
      <h1>Analytics Dashboard</h1>
      
      {/* All users with VIEW_ANALYTICS permission can see basic charts */}
      <PermissionGuard permission={PERMISSIONS.VIEW_ANALYTICS}>
        <div className="charts">
          <Chart1 />
          <Chart2 />
        </div>
      </PermissionGuard>
      
      {/* Only Super Admins can see advanced analytics */}
      <PermissionGuard permission={PERMISSIONS.FULL_ACCESS}>
        <div className="advanced-section">
          <h2>Advanced Analytics</h2>
          <AdvancedAnalytics />
        </div>
      </PermissionGuard>
    </div>
  );
};
```

---

## Example 4: Compliance Component Integration

### Before:
```javascript
const Compliance = () => {
  return (
    <div>
      <h1>Compliance</h1>
      <ComplianceList />
      <button onClick={updateCompliance}>Update</button>
      <button onClick={approveCompliance}>Approve</button>
    </div>
  );
};
```

### After:
```javascript
import PermissionGuard from './components/PermissionGuard';
import { PERMISSIONS } from './utils/rbac';

const Compliance = () => {
  return (
    <div>
      <h1>Compliance</h1>
      
      {/* All users can view compliance */}
      <PermissionGuard permission={PERMISSIONS.VIEW_COMPLIANCE}>
        <ComplianceList />
      </PermissionGuard>
      
      {/* Supervisors and Super Admins can update */}
      <PermissionGuard permission={PERMISSIONS.MANAGE_COMPLIANCE}>
        <button onClick={updateCompliance}>Update</button>
      </PermissionGuard>
      
      {/* Only Super Admins can approve */}
      <PermissionGuard permission={PERMISSIONS.AUTHORIZE_DATA}>
        <button onClick={approveCompliance}>Approve</button>
      </PermissionGuard>
    </div>
  );
};
```

---

## Example 5: Dashboard Component with Role-Based Widgets

### Before:
```javascript
const Dashboard = () => {
  return (
    <div className="dashboard">
      <Widget1 />
      <Widget2 />
      <AdminWidget />
      <SupervisorWidget />
    </div>
  );
};
```

### After:
```javascript
import PermissionGuard from './components/PermissionGuard';
import { PERMISSIONS, getUserRole, USER_ROLES } from './utils/rbac';

const Dashboard = () => {
  const userRole = getUserRole();
  
  return (
    <div className="dashboard">
      {/* All users see basic widgets */}
      <Widget1 />
      <Widget2 />
      
      {/* Only Super Admins see admin widget */}
      <PermissionGuard permission={PERMISSIONS.FULL_ACCESS}>
        <AdminWidget />
      </PermissionGuard>
      
      {/* Supervisors and Super Admins see supervisor widget */}
      <PermissionGuard permission={PERMISSIONS.EDIT_DATA}>
        <SupervisorWidget />
      </PermissionGuard>
      
      {/* Show role-specific welcome message */}
      <div className="welcome">
        {userRole === USER_ROLES.SUPER_ADMIN && <h2>Welcome, Super Admin!</h2>}
        {userRole === USER_ROLES.SUPERVISOR && <h2>Welcome, Supervisor!</h2>}
        {userRole === USER_ROLES.DATA_ENTRY && <h2>Welcome, Data Entry User!</h2>}
      </div>
    </div>
  );
};
```

---

## Example 6: Form with Conditional Fields

### Before:
```javascript
const DataForm = () => {
  return (
    <form>
      <input name="data" />
      <input name="notes" />
      <select name="status">
        <option>Pending</option>
        <option>Approved</option>
      </select>
      <button type="submit">Submit</button>
    </form>
  );
};
```

### After:
```javascript
import PermissionGuard from './components/PermissionGuard';
import { PERMISSIONS, hasPermission, getUserRole } from './utils/rbac';

const DataForm = () => {
  const userRole = getUserRole();
  const canAuthorize = hasPermission(userRole, PERMISSIONS.AUTHORIZE_DATA);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // Check if user is trying to set status to Approved
    if (formData.get('status') === 'Approved' && !canAuthorize) {
      alert('You do not have permission to approve data');
      return;
    }
    
    submitForm(formData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input name="data" />
      <input name="notes" />
      
      {/* Only Super Admins can change status */}
      <PermissionGuard 
        permission={PERMISSIONS.AUTHORIZE_DATA}
        fallback={
          <input type="hidden" name="status" value="Pending" />
        }
      >
        <select name="status">
          <option>Pending</option>
          <option>Approved</option>
        </select>
      </PermissionGuard>
      
      <button type="submit">Submit</button>
    </form>
  );
};
```

---

## Example 7: Table with Conditional Action Buttons

### Before:
```javascript
const DataTable = ({ data }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map(row => (
          <tr key={row.id}>
            <td>{row.id}</td>
            <td>{row.name}</td>
            <td>
              <button onClick={() => handleEdit(row.id)}>Edit</button>
              <button onClick={() => handleDelete(row.id)}>Delete</button>
              <button onClick={() => handleApprove(row.id)}>Approve</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
```

### After:
```javascript
import PermissionGuard from './components/PermissionGuard';
import { PERMISSIONS } from './utils/rbac';

const DataTable = ({ data }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map(row => (
          <tr key={row.id}>
            <td>{row.id}</td>
            <td>{row.name}</td>
            <td>
              {/* Supervisors and Super Admins can edit */}
              <PermissionGuard permission={PERMISSIONS.EDIT_DATA}>
                <button onClick={() => handleEdit(row.id)}>Edit</button>
              </PermissionGuard>
              
              {/* Supervisors and Super Admins can delete */}
              <PermissionGuard permission={PERMISSIONS.DELETE_DATA}>
                <button onClick={() => handleDelete(row.id)}>Delete</button>
              </PermissionGuard>
              
              {/* Only Super Admins can approve */}
              <PermissionGuard permission={PERMISSIONS.AUTHORIZE_DATA}>
                <button onClick={() => handleApprove(row.id)}>Approve</button>
              </PermissionGuard>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
```

---

## Example 8: Navigation Menu with Role-Based Links

### Before:
```javascript
const Navigation = () => {
  return (
    <nav>
      <Link to="/">Dashboard</Link>
      <Link to="/data-entry">Data Entry</Link>
      <Link to="/reports">Reports</Link>
      <Link to="/analytics">Analytics</Link>
      <Link to="/admin">Admin</Link>
    </nav>
  );
};
```

### After:
```javascript
import { Link } from 'react-router-dom';
import PermissionGuard from './components/PermissionGuard';
import { PERMISSIONS } from './utils/rbac';

const Navigation = () => {
  return (
    <nav>
      {/* All users can access dashboard */}
      <Link to="/">Dashboard</Link>
      
      {/* All users can access data entry */}
      <Link to="/data-entry">Data Entry</Link>
      
      {/* Only Supervisors and Super Admins can access reports */}
      <PermissionGuard permission={PERMISSIONS.VIEW_REPORTS}>
        <Link to="/reports">Reports</Link>
      </PermissionGuard>
      
      {/* Only Supervisors and Super Admins can access analytics */}
      <PermissionGuard permission={PERMISSIONS.VIEW_ANALYTICS}>
        <Link to="/analytics">Analytics</Link>
      </PermissionGuard>
      
      {/* Only Super Admins can access admin panel */}
      <PermissionGuard permission={PERMISSIONS.MANAGE_USERS}>
        <Link to="/admin">Admin</Link>
      </PermissionGuard>
    </nav>
  );
};
```

---

## Example 9: API Call with Permission Check

### Before:
```javascript
const saveData = async (data) => {
  const response = await fetch('/api/data', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return response.json();
};
```

### After:
```javascript
import { hasPermission, getUserRole, PERMISSIONS } from './utils/rbac';

const saveData = async (data, isNew = false) => {
  const userRole = getUserRole();
  
  // Check if user has permission to add new data
  if (isNew && !hasPermission(userRole, PERMISSIONS.ADD_DATA)) {
    throw new Error('You do not have permission to add new data');
  }
  
  // Check if user has permission to update data
  if (!isNew && !hasPermission(userRole, PERMISSIONS.UPDATE_DATA)) {
    throw new Error('You do not have permission to update data');
  }
  
  const response = await fetch('/api/data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Role': userRole
    },
    body: JSON.stringify(data)
  });
  
  return response.json();
};
```

---

## Example 10: Conditional Rendering with Multiple Permissions

### Before:
```javascript
const AdvancedFeatures = () => {
  return (
    <div>
      <ExportButton />
      <ImportButton />
      <BulkEditButton />
      <ApprovalWorkflow />
    </div>
  );
};
```

### After:
```javascript
import PermissionGuard from './components/PermissionGuard';
import { PERMISSIONS, hasAllPermissions, getUserRole } from './utils/rbac';

const AdvancedFeatures = () => {
  const userRole = getUserRole();
  
  // Check if user has multiple permissions
  const canBulkEdit = hasAllPermissions(userRole, [
    PERMISSIONS.EDIT_DATA,
    PERMISSIONS.DELETE_DATA
  ]);
  
  return (
    <div>
      {/* Supervisors and Super Admins can export */}
      <PermissionGuard permission={PERMISSIONS.VIEW_REPORTS}>
        <ExportButton />
      </PermissionGuard>
      
      {/* Only Super Admins can import */}
      <PermissionGuard permission={PERMISSIONS.ADD_DATA}>
        <ImportButton />
      </PermissionGuard>
      
      {/* Users with both edit and delete permissions can bulk edit */}
      {canBulkEdit && <BulkEditButton />}
      
      {/* Only Super Admins can access approval workflow */}
      <PermissionGuard permission={PERMISSIONS.AUTHORIZE_DATA}>
        <ApprovalWorkflow />
      </PermissionGuard>
    </div>
  );
};
```

---

## 🎯 Quick Reference

### Import Statements:
```javascript
import PermissionGuard from './components/PermissionGuard';
import { 
  PERMISSIONS, 
  hasPermission, 
  getUserRole, 
  USER_ROLES,
  hasAllPermissions,
  hasAnyPermission 
} from './utils/rbac';
```

### Common Patterns:

**Hide button:**
```javascript
<PermissionGuard permission={PERMISSIONS.DELETE_DATA}>
  <button>Delete</button>
</PermissionGuard>
```

**Show fallback:**
```javascript
<PermissionGuard 
  permission={PERMISSIONS.EDIT_DATA}
  fallback={<p>View only mode</p>}
>
  <EditForm />
</PermissionGuard>
```

**Check in code:**
```javascript
const userRole = getUserRole();
if (hasPermission(userRole, PERMISSIONS.ADD_DATA)) {
  // Do something
}
```

**Check multiple permissions:**
```javascript
if (hasAllPermissions(userRole, [PERMISSIONS.EDIT_DATA, PERMISSIONS.DELETE_DATA])) {
  // User has both permissions
}
```

---

**Use these examples to integrate RBAC into your existing components!**
