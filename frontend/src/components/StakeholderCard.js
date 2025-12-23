import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/themeUtils';

const StakeholderCard = ({ 
  stakeholder, 
  onContact, 
  onUpdate, 
  onDelete,
  isExpanded = false,
  onToggleExpand,
  showActions = true 
}) => {
  const { isDark } = useTheme();
  const theme = getThemeClasses(isDark);

  const getEngagementColor = (engagement) => {
    switch(engagement) {
      case 'High': return 'from-green-500 to-emerald-600';
      case 'Medium': return 'from-yellow-500 to-orange-500';
      case 'Low': return 'from-red-500 to-pink-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleContactClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Contact button clicked for:', stakeholder.name);
    if (onContact) {
      onContact(stakeholder);
    }
  };

  const handleUpdateClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Update button clicked for:', stakeholder.name);
    if (onUpdate) {
      onUpdate(stakeholder);
    }
  };

  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Delete button clicked for:', stakeholder.name);
    if (onDelete && window.confirm(`Are you sure you want to delete ${stakeholder.name}?`)) {
      onDelete(stakeholder);
    }
  };

  const handleCardClick = () => {
    if (onToggleExpand) {
      onToggleExpand(stakeholder.id);
    }
  };

  return (
    <div 
      className={`group cursor-pointer transform transition-all duration-500 hover:scale-105`}
      onClick={handleCardClick}
    >
      <div className={`p-6 rounded-2xl border backdrop-blur-xl transition-all duration-300 ${
        isDark 
          ? 'bg-gray-800/80 border-gray-700/50 hover:bg-gray-800/90 hover:border-gray-600' 
          : 'bg-white/80 border-white/50 hover:bg-white/90 hover:border-white/70'
      } shadow-lg hover:shadow-2xl group-hover:shadow-indigo-500/10`}>
        
        {/* Card Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${getEngagementColor(stakeholder.engagement)} shadow-lg`}>
              <span className="text-2xl">{stakeholder.icon}</span>
            </div>
            <div>
              <h3 className={`font-bold text-lg ${theme.text.primary} group-hover:text-indigo-600 transition-colors`}>
                {stakeholder.name}
              </h3>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${
                getPriorityColor(stakeholder.priority)
              }`}>
                {stakeholder.priority} Priority
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onDelete && (
              <button
                onClick={handleDeleteClick}
                className={`p-2 rounded-lg transition-all hover:scale-110 ${
                  isDark 
                    ? 'bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300'
                    : 'bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700'
                }`}
                title="Delete Stakeholder"
              >
                🗑️
              </button>
            )}
            {onToggleExpand && (
              <div className={`text-2xl transition-transform duration-300 ${
                isExpanded ? 'rotate-180' : ''
              }`}>
                ⌄
              </div>
            )}
          </div>
        </div>

        {/* Engagement Level */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${theme.text.secondary}`}>Engagement Level</span>
            <span className={`text-sm font-bold ${
              stakeholder.engagement === 'High' ? 'text-green-600' :
              stakeholder.engagement === 'Medium' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {stakeholder.engagement}
            </span>
          </div>
          <div className={`w-full bg-gray-200 rounded-full h-2 ${
            isDark ? 'bg-gray-700' : 'bg-gray-200'
          }`}>
            <div 
              className={`h-2 rounded-full bg-gradient-to-r ${getEngagementColor(stakeholder.engagement)} transition-all duration-500`}
              style={{ 
                width: stakeholder.engagement === 'High' ? '90%' : 
                       stakeholder.engagement === 'Medium' ? '60%' : '30%' 
              }}
            ></div>
          </div>
        </div>

        {/* Satisfaction Score */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${theme.text.secondary}`}>Satisfaction</span>
            <span className={`text-sm font-bold ${theme.text.primary}`}>{stakeholder.satisfaction}%</span>
          </div>
          <div className={`w-full bg-gray-200 rounded-full h-2 ${
            isDark ? 'bg-gray-700' : 'bg-gray-200'
          }`}>
            <div 
              className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
              style={{ width: `${stakeholder.satisfaction}%` }}
            ></div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span className={`text-sm ${theme.text.secondary}`}>Type:</span>
            <span className={`text-sm font-medium ${theme.text.primary}`}>{stakeholder.type}</span>
          </div>
          <div className="flex justify-between">
            <span className={`text-sm ${theme.text.secondary}`}>Last Contact:</span>
            <span className={`text-sm font-medium ${theme.text.primary}`}>{stakeholder.lastContact}</span>
          </div>
        </div>

        {/* Expandable Details */}
        {isExpanded && (
          <div className={`mt-4 pt-4 border-t space-y-4 animate-fade-in ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div>
              <h4 className={`font-semibold mb-2 ${theme.text.primary}`}>Description</h4>
              <p className={`text-sm ${theme.text.secondary}`}>{stakeholder.description}</p>
            </div>
            
            <div>
              <h4 className={`font-semibold mb-2 ${theme.text.primary}`}>Key Concerns</h4>
              <div className="flex flex-wrap gap-2">
                {stakeholder.concerns?.map((concern, idx) => (
                  <span key={idx} className={`px-2 py-1 rounded-lg text-xs ${
                    isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {concern}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className={`font-semibold mb-2 ${theme.text.primary}`}>Next Action</h4>
              <p className={`text-sm ${theme.text.secondary}`}>{stakeholder.nextAction}</p>
            </div>

            {showActions && (
              <div className="flex gap-2 pt-2">
                <button 
                  type="button"
                  onClick={handleContactClick}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    isDark 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-500/25' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-500/25'
                  } transform hover:scale-105 active:scale-95`}
                >
                  📞 Contact
                </button>
                <button 
                  type="button"
                  onClick={handleUpdateClick}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    isDark 
                      ? 'bg-gray-700 hover:bg-gray-600 text-white shadow-lg hover:shadow-gray-500/25' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-800 shadow-lg hover:shadow-gray-500/25'
                  } transform hover:scale-105 active:scale-95`}
                >
                  📝 Update
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StakeholderCard;