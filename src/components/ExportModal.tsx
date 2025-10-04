import React, { useState } from 'react';
import Icon from './Icon';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: 'pdf' | 'word') => Promise<void>;
  topic: string;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, onExport, topic }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'word' | null>(null);

  if (!isOpen) return null;

  const handleExport = async (format: 'pdf' | 'word') => {
    setIsExporting(true);
    setExportFormat(format);
    try {
      await onExport(format);
      setTimeout(() => {
        onClose();
        setIsExporting(false);
        setExportFormat(null);
      }, 1000);
    } catch (error) {
      console.error('Export failed:', error);
      setIsExporting(false);
      setExportFormat(null);
      alert('Export failed. Please try again.');
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-modal-title"
      >
        {/* Modal */}
        <div
          className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 max-w-md w-full p-6 transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 id="export-modal-title" className="text-xl font-semibold text-slate-200">
              Export Content
            </h2>
            <button
              onClick={onClose}
              disabled={isExporting}
              className="p-2 rounded-md hover:bg-slate-700 transition-colors disabled:opacity-50"
              aria-label="Close export modal"
            >
              <Icon name="close" className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="mb-6">
            <p className="text-slate-400 text-sm mb-4">
              Choose a format to export your generated content:
            </p>
            <div className="text-slate-300 text-sm bg-slate-900 p-3 rounded-lg border border-slate-700">
              <strong>Topic:</strong> {topic || 'Untitled'}
            </div>
          </div>

          {/* Export Options */}
          <div className="space-y-3">
            <button
              onClick={() => handleExport('pdf')}
              disabled={isExporting}
              className="w-full flex items-center justify-between p-4 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-700 disabled:opacity-50 rounded-lg transition-all group"
              aria-label="Export as PDF"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
                  <svg className="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6m4 18H6V4h7v5h5v11m-4.5-7.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5H11v2h2v1H9.5v-4.5h3m-3-2.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3Z"/>
                  </svg>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-slate-200">Export as PDF</div>
                  <div className="text-xs text-slate-400">Portable Document Format</div>
                </div>
              </div>
              {isExporting && exportFormat === 'pdf' ? (
                <Icon name="spinner" className="w-5 h-5" />
              ) : (
                <Icon name="download" className="w-5 h-5 text-slate-400 group-hover:text-slate-300" />
              )}
            </button>

            <button
              onClick={() => handleExport('word')}
              disabled={isExporting}
              className="w-full flex items-center justify-between p-4 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-700 disabled:opacity-50 rounded-lg transition-all group"
              aria-label="Export as Word document"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                  <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6m4 18H6V4h7v5h5v11m-5.1-7.7L11.5 18h-1l-1.4-5.7L7.7 18h-1l-1.4-5.7h1l.9 4.7 1.4-4.7h1l1.4 4.7.9-4.7h1Z"/>
                  </svg>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-slate-200">Export as Word</div>
                  <div className="text-xs text-slate-400">Microsoft Word Document (.docx)</div>
                </div>
              </div>
              {isExporting && exportFormat === 'word' ? (
                <Icon name="spinner" className="w-5 h-5" />
              ) : (
                <Icon name="download" className="w-5 h-5 text-slate-400 group-hover:text-slate-300" />
              )}
            </button>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-slate-700">
            <button
              onClick={onClose}
              disabled={isExporting}
              className="w-full py-2 px-4 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-lg transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExportModal;
