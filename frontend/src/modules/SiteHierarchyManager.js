import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/themeUtils';

const SiteHierarchyManager = ({ onClose, onSiteSelect }) => {
  const { isDark } = useTheme();
  const theme = getThemeClasses(isDark);
  const [sites, setSites] = useState([]);
  const [showAddSite, setShowAddSite] = useState(false);
  const [newSite, setNewSite] = useState({
    name: '',
    type: 'site',
    parentId: null,
    location: '',
    region: ''
  });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = () => {
    const stored = localStorage.getItem('site_hierarchy');
    if (stored) {
      setSites(JSON.parse(stored));
    }
  };

  const saveSites = (updatedSites) => {
    localStorage.setItem('site_hierarchy', JSON.stringify(updatedSites));
    setSites(updatedSites);
  };

  const addSite = () => {
    if (!newSite.name.trim()) {
      showToast('Site name is required', 'error');
      return;
    }

    const site = {
      id: Date.now().toString(),
      ...newSite,
      createdAt: new Date().toISOString()
    };

    saveSites([...sites, site]);
    setNewSite({ name: '', type: 'site', parentId: null, location: '', region: '' });
    setShowAddSite(false);
    showToast('Site added successfully', 'success');
  };

  const deleteSite = (id) => {
    if (window.confirm('Delete this site? All child sites will also be removed.')) {
      const filtered = sites.filter(s => s.id !== id && s.parentId !== id);
      saveSites(filtered);
      showToast('Site deleted', 'success');
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getSiteTree = () => {
    const tree = [];
    const rootSites = sites.filter(s => !s.parentId);
    
    rootSites.forEach(root => {
      tree.push({
        ...root,
        children: sites.filter(s => s.parentId === root.id)
      });
    });
    
    return tree;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`max-w-4xl w-full max-h-[90vh] overflow-y-auto ${theme.bg.card} rounded-xl shadow-2xl`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className={`text-2xl font-bold ${theme.text.primary}`}>🏢 Site Hierarchy Management</h2>
              <p className={`text-sm ${theme.text.secondary} mt-1`}>Manage sites and business units</p>
            </div>
            <button onClick={onClose} className={`text-2xl ${theme.text.secondary} hover:text-red-600`}>✕</button>
          </div>

          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setShowAddSite(!showAddSite)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              ➕ Add Site/Unit
            </button>
          </div>

          {showAddSite && (
            <div className={`p-4 rounded-lg ${theme.bg.subtle} mb-6`}>
              <h3 className={`font-semibold ${theme.text.primary} mb-4`}>Add New Site/Business Unit</h3>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Site/Unit Name"
                  value={newSite.name}
                  onChange={(e) => setNewSite({ ...newSite, name: e.target.value })}
                  className={`px-3 py-2 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
                />
                <select
                  value={newSite.type}
                  onChange={(e) => setNewSite({ ...newSite, type: e.target.value })}
                  className={`px-3 py-2 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
                >
                  <option value="headquarters">Headquarters</option>
                  <option value="region">Region</option>
                  <option value="site">Site</option>
                  <option value="facility">Facility</option>
                  <option value="business_unit">Business Unit</option>
                </select>
                <select
                  value={newSite.parentId || ''}
                  onChange={(e) => setNewSite({ ...newSite, parentId: e.target.value || null })}
                  className={`px-3 py-2 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
                >
                  <option value="">No Parent (Root Level)</option>
                  {sites.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Location"
                  value={newSite.location}
                  onChange={(e) => setNewSite({ ...newSite, location: e.target.value })}
                  className={`px-3 py-2 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
                />
                <select
                  value={newSite.region}
                  onChange={(e) => setNewSite({ ...newSite, region: e.target.value })}
                  className={`px-3 py-2 border rounded-lg ${theme.bg.input} ${theme.border.input}`}
                >
                  <option value="">Select Region</option>
                  <option value="zimbabwe">Zimbabwe</option>
                  <option value="india">India</option>
                </select>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={addSite} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  ✓ Add
                </button>
                <button onClick={() => setShowAddSite(false)} className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400">
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {getSiteTree().map(root => (
              <div key={root.id} className={`p-4 rounded-lg border-2 ${theme.border.primary}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {root.type === 'headquarters' ? '🏛️' : root.type === 'region' ? '🌍' : '🏢'}
                    </span>
                    <div>
                      <h3 className={`font-bold ${theme.text.primary}`}>{root.name}</h3>
                      <p className={`text-xs ${theme.text.secondary}`}>
                        {root.type.toUpperCase()} • {root.location} • {root.region}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onSiteSelect && onSiteSelect(root)}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      Select
                    </button>
                    <button
                      onClick={() => deleteSite(root.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {root.children && root.children.length > 0 && (
                  <div className="ml-8 mt-3 space-y-2">
                    {root.children.map(child => (
                      <div key={child.id} className={`p-3 rounded-lg ${theme.bg.subtle} flex items-center justify-between`}>
                        <div className="flex items-center gap-2">
                          <span>📍</span>
                          <div>
                            <span className={`font-medium ${theme.text.primary}`}>{child.name}</span>
                            <span className={`text-xs ${theme.text.secondary} ml-2`}>
                              {child.type} • {child.location}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => onSiteSelect && onSiteSelect(child)}
                            className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                          >
                            Select
                          </button>
                          <button
                            onClick={() => deleteSite(child.id)}
                            className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {sites.length === 0 && (
              <div className={`p-8 text-center ${theme.bg.subtle} rounded-lg`}>
                <p className={`text-lg mb-2 ${theme.text.secondary}`}>🏢</p>
                <p className={theme.text.secondary}>No sites configured. Add your first site to get started.</p>
              </div>
            )}
          </div>
        </div>

        {toast && (
          <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            {toast.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default SiteHierarchyManager;
