import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/themeUtils';
import AuditSystem from '../utils/auditSystem';

const EvidenceUploader = ({ dataId, onClose }) => {
  const { isDark } = useTheme();
  const theme = getThemeClasses(isDark);
  const [evidence, setEvidence] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [description, setDescription] = useState('');
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    loadEvidence();
  }, [dataId]);

  const loadEvidence = () => {
    setEvidence(AuditSystem.getEvidence(dataId));
  };

  const handleFileUpload = async (files) => {
    setUploading(true);
    try {
      for (const file of files) {
        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          alert(`File ${file.name} is too large (max 10MB)`);
          continue;
        }

        await AuditSystem.uploadEvidence(dataId, file, description);
      }
      setDescription('');
      loadEvidence();
      alert('Evidence uploaded successfully!');
    } catch (error) {
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFileUpload(files);
  };

  const handleDelete = (evidenceId) => {
    if (window.confirm('Delete this evidence file?')) {
      AuditSystem.deleteEvidence(evidenceId);
      loadEvidence();
    }
  };

  const downloadEvidence = (ev) => {
    const link = document.createElement('a');
    link.href = ev.fileData;
    link.download = ev.fileName;
    link.click();
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
    if (fileType.includes('zip') || fileType.includes('compressed')) return '📦';
    return '📎';
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`max-w-4xl w-full max-h-[90vh] overflow-hidden ${theme.bg.card} rounded-xl shadow-2xl`}>
        {/* Header */}
        <div className="p-6 bg-white shadow-lg border-b-2 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold flex items-center gap-3 text-gray-800">
                <span className="text-4xl">📁</span>
                Evidence Management
              </h2>
              <p className="text-gray-600 mt-1">Upload supporting documents and certificates</p>
            </div>
            <button onClick={onClose} className="text-3xl text-gray-600 hover:text-red-500 hover:rotate-90 transition-all duration-300 hover:bg-gray-100 w-10 h-10 rounded-full flex items-center justify-center">✕</button>
          </div>
        </div>

        {/* Upload Area */}
        <div className="p-6">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver ? 'border-blue-500 bg-blue-50' : `${theme.border.primary} ${theme.bg.subtle}`
            }`}
          >
            <div className="text-4xl mb-3">📤</div>
            <p className={`text-lg font-medium ${theme.text.primary} mb-2`}>
              Drag & drop files here
            </p>
            <p className={`text-sm ${theme.text.secondary} mb-4`}>
              or click to browse (Max 10MB per file)
            </p>
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.zip"
            />
            <label
              htmlFor="file-upload"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700"
            >
              Browse Files
            </label>
          </div>

          <div className="mt-4">
            <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description for the uploaded files..."
              className={`w-full px-3 py-2 rounded border ${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
            />
          </div>

          {uploading && (
            <div className="mt-4 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className={`mt-2 ${theme.text.secondary}`}>Uploading...</p>
            </div>
          )}
        </div>

        {/* Evidence List */}
        <div className={`border-t ${theme.border.primary}`}>
          <div className="p-4">
            <h3 className={`font-semibold ${theme.text.primary} mb-3`}>
              Uploaded Evidence ({evidence.length})
            </h3>
            {evidence.length === 0 ? (
              <p className={`text-center py-8 ${theme.text.secondary}`}>No evidence files uploaded yet</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {evidence.map((ev) => (
                  <div key={ev.id} className={`p-3 rounded-lg border ${theme.border.primary} ${theme.bg.subtle}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="relative group">
                          <span className="text-2xl cursor-pointer">{getFileIcon(ev.fileType)}</span>
                          <div className={`absolute left-full ml-3 top-1/2 -translate-y-1/2 px-4 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 shadow-xl border-2 ${
                            isDark ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-blue-400' : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white border-blue-300'
                          }`}>
                            <div className="font-semibold">{ev.fileName}</div>
                            <div className="text-xs opacity-90 mt-1">{formatFileSize(ev.fileSize)}</div>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium ${theme.text.primary} truncate`}>{ev.fileName}</p>
                          <p className={`text-xs ${theme.text.secondary}`}>
                            {formatFileSize(ev.fileSize)} • Uploaded by {ev.uploadedBy}
                          </p>
                          <p className={`text-xs ${theme.text.muted}`}>
                            {new Date(ev.uploadedAt).toLocaleString()}
                          </p>
                          {ev.description && (
                            <p className={`text-sm ${theme.text.secondary} mt-1 italic`}>"{ev.description}"</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="relative group">
                          <button
                            onClick={() => downloadEvidence(ev)}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                          >
                            📥
                          </button>
                          <div className={`absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg ${
                            isDark ? 'bg-blue-700 text-white' : 'bg-blue-600 text-white'
                          }`}>
                            Download
                          </div>
                        </div>
                        <div className="relative group">
                          <button
                            onClick={() => handleDelete(ev.id)}
                            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                          >
                            🗑️
                          </button>
                          <div className={`absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg ${
                            isDark ? 'bg-red-700 text-white' : 'bg-red-600 text-white'
                          }`}>
                            Delete
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`p-4 border-t ${theme.border.primary} flex justify-between items-center`}>
          <span className={`text-sm ${theme.text.secondary}`}>
            Accepted: PDF, Word, Excel, Images, ZIP
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EvidenceUploader;
