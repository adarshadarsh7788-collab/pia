import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/themeUtils';
import { USER_ROLES, ROLE_DISPLAY_NAMES, hasPermission, getUserRole, PERMISSIONS } from '../utils/rbac';
import ProfessionalHeader from './ProfessionalHeader';
import { useNavigate } from 'react-router-dom';

const UserManagement = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const theme = getThemeClasses(isDark);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    fullName: '',
    role: USER_ROLES.DATA_ENTRY
  });
  const userRole = getUserRole();

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filterRole]);

  const loadUsers = () => {
    const systemUsers = JSON.parse(localStorage.getItem('systemUsers') || '[]');
    setUsers(systemUsers);
  };

  const filterUsers = () => {
    let filtered = [...users];

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.role === filterRole);
    }

    setFilteredUsers(filtered);
  };

  const handleAddUser = () => {
    if (!newUser.email || !newUser.password || !newUser.fullName) {
      alert('Please fill all fields');
      return;
    }

    const systemUsers = JSON.parse(localStorage.getItem('systemUsers') || '[]');
    
    if (systemUsers.some(u => u.email === newUser.email)) {
      alert('User with this email already exists');
      return;
    }

    systemUsers.push(newUser);
    localStorage.setItem('systemUsers', JSON.stringify(systemUsers));
    
    setUsers(systemUsers);
    setShowAddUser(false);
    setNewUser({
      email: '',
      password: '',
      fullName: '',
      role: USER_ROLES.DATA_ENTRY
    });
  };

  const handleDeleteUser = (email) => {
    if (window.confirm(`Are you sure you want to delete user: ${email}?`)) {
      const systemUsers = JSON.parse(localStorage.getItem('systemUsers') || '[]');
      const updatedUsers = systemUsers.filter(u => u.email !== email);
      localStorage.setItem('systemUsers', JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
    }
  };

  const handleUpdateRole = (email, newRole) => {
    const systemUsers = JSON.parse(localStorage.getItem('systemUsers') || '[]');
    const updatedUsers = systemUsers.map(u =>
      u.email === email ? { ...u, role: newRole } : u
    );
    localStorage.setItem('systemUsers', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case USER_ROLES.SUPER_ADMIN:
        return 'bg-red-100 text-red-800 border-red-300';
      case USER_ROLES.SUPERVISOR:
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case USER_ROLES.DATA_ENTRY:
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getRoleStats = () => {
    const stats = {
      [USER_ROLES.SUPER_ADMIN]: 0,
      [USER_ROLES.SUPERVISOR]: 0,
      [USER_ROLES.DATA_ENTRY]: 0,
      total: users.length
    };

    users.forEach(user => {
      if (stats[user.role] !== undefined) {
        stats[user.role]++;
      }
    });

    return stats;
  };

  const stats = getRoleStats();

  if (!hasPermission(userRole, PERMISSIONS.MANAGE_USERS)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to manage users.</p>
        </div>
      </div>
    );
  }

  const currentUser = localStorage.getItem('currentUser');

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50/40 to-purple-50/30'
    }`} style={{
      backgroundImage: isDark ? '' : 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.12) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.1) 0%, transparent 50%)'
    }}>
      <ProfessionalHeader 
        onLogout={handleLogout}
        currentUser={currentUser}
      />
      
      <main className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className={`text-3xl font-bold mb-2 ${theme.text.primary}`}>
            👥 User Management
          </h1>
          <p className={`${theme.text.secondary}`}>
            Manage system users and their roles
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className={`p-4 rounded-xl border backdrop-blur-xl ${theme.bg.card} ${theme.border.primary} shadow-lg`}>
            <div className="text-2xl mb-2">👤</div>
            <div className={`text-2xl font-bold ${theme.text.primary}`}>
              {stats.total}
            </div>
            <div className={`text-sm ${theme.text.secondary}`}>
              Total Users
            </div>
          </div>

          <div className={`p-4 rounded-xl border backdrop-blur-xl ${theme.bg.card} ${theme.border.primary} shadow-lg`}>
            <div className="text-2xl mb-2">🔴</div>
            <div className={`text-2xl font-bold ${theme.text.primary}`}>
              {stats[USER_ROLES.SUPER_ADMIN]}
            </div>
            <div className={`text-sm ${theme.text.secondary}`}>
              Super Admins
            </div>
          </div>

          <div className={`p-4 rounded-xl border backdrop-blur-xl ${theme.bg.card} ${theme.border.primary} shadow-lg`}>
            <div className="text-2xl mb-2">🔵</div>
            <div className={`text-2xl font-bold ${theme.text.primary}`}>
              {stats[USER_ROLES.SUPERVISOR]}
            </div>
            <div className={`text-sm ${theme.text.secondary}`}>
              Supervisors
            </div>
          </div>

          <div className={`p-4 rounded-xl border backdrop-blur-xl ${theme.bg.card} ${theme.border.primary} shadow-lg`}>
            <div className="text-2xl mb-2">🟢</div>
            <div className={`text-2xl font-bold ${theme.text.primary}`}>
              {stats[USER_ROLES.DATA_ENTRY]}
            </div>
            <div className={`text-sm ${theme.text.secondary}`}>
              Data Entry Users
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className={`p-4 rounded-xl border backdrop-blur-xl mb-6 ${theme.bg.card} ${theme.border.primary} shadow-lg`}>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="🔍 Search by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`flex-1 px-4 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />

            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Roles</option>
              <option value={USER_ROLES.SUPER_ADMIN}>Super Admin</option>
              <option value={USER_ROLES.SUPERVISOR}>Supervisor</option>
              <option value={USER_ROLES.DATA_ENTRY}>Data Entry</option>
            </select>

            <button
              onClick={() => setShowAddUser(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ➕ Add User
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className={`rounded-xl border backdrop-blur-xl shadow-lg overflow-hidden ${theme.bg.card} ${theme.border.primary}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme.text.secondary}`}>
                    User
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme.text.secondary}`}>
                    Email
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme.text.secondary}`}>
                    Role
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme.text.secondary}`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {filteredUsers.map((user, index) => (
                  <tr key={index} className={isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                    <td className={`px-6 py-4 whitespace-nowrap ${theme.text.primary}`}>
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white font-bold">
                          {user.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <div className="font-medium">{user.fullName}</div>
                        </div>
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap ${theme.text.secondary}`}>
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRoleColor(user.role)}`}>
                        {ROLE_DISPLAY_NAMES[user.role]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.email === localStorage.getItem('currentUser')
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {user.email === localStorage.getItem('currentUser') ? '🟢 Active' : '⚫ Inactive'}
                        </span>
                        <button
                          onClick={() => handleDeleteUser(user.email)}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add User Modal */}
        {showAddUser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className={`p-6 rounded-2xl border shadow-2xl max-w-md w-full ${theme.bg.card} ${theme.border.primary} backdrop-blur-xl`}>
              <h3 className={`text-xl font-bold mb-4 ${theme.text.primary}`}>
                ➕ Add New User
              </h3>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme.text.secondary}`}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={newUser.fullName}
                    onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                    className={`w-full px-3 py-2 rounded border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme.text.secondary}`}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className={`w-full px-3 py-2 rounded border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme.text.secondary}`}>
                    Password
                  </label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className={`w-full px-3 py-2 rounded border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme.text.secondary}`}>
                    Role
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className={`w-full px-3 py-2 rounded border ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value={USER_ROLES.DATA_ENTRY}>{ROLE_DISPLAY_NAMES[USER_ROLES.DATA_ENTRY]}</option>
                    <option value={USER_ROLES.SUPERVISOR}>{ROLE_DISPLAY_NAMES[USER_ROLES.SUPERVISOR]}</option>
                    <option value={USER_ROLES.SUPER_ADMIN}>{ROLE_DISPLAY_NAMES[USER_ROLES.SUPER_ADMIN]}</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAddUser}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add User
                </button>
                <button
                  onClick={() => setShowAddUser(false)}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserManagement;