import React from 'react';
import { HistoryItem } from '../types/types';
import Icon from './Icon';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onRestore: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
  onExport: () => void;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({
  isOpen,
  onClose,
  history,
  onRestore,
  onDelete,
  onClear,
  onExport,
}) => {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 h-full w-80 bg-slate-800 border-l border-slate-700 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="complementary"
        aria-label="Content history sidebar"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-slate-200">History</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-slate-700 transition-colors"
              aria-label="Close history sidebar"
            >
              <Icon name="close" className="w-5 h-5" />
            </button>
          </div>

          {/* Actions */}
          {history.length > 0 && (
            <div className="flex gap-2 p-4 border-b border-slate-700">
              <button
                onClick={onExport}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-md text-sm transition-colors"
                aria-label="Export history"
              >
                <Icon name="download" className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={onClear}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-md text-sm transition-colors"
                aria-label="Clear all history"
              >
                <Icon name="trash" className="w-4 h-4" />
                Clear All
              </button>
            </div>
          )}

          {/* History List */}
          <div className="flex-1 overflow-y-auto p-4">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center">
                <Icon name="history" className="w-12 h-12 mb-2 opacity-50" />
                <p>No history yet</p>
                <p className="text-sm mt-1">Generated content will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <article
                    key={item.id}
                    className="bg-slate-900 border border-slate-700 rounded-lg p-3 hover:border-purple-500/50 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-sm font-medium text-slate-200 line-clamp-2 flex-1">
                        {item.topic}
                      </h3>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onRestore(item)}
                          className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-purple-400"
                          aria-label={`Restore content: ${item.topic}`}
                          title="Restore"
                        >
                          <Icon name="restore" className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(item.id)}
                          className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-red-400"
                          aria-label={`Delete content: ${item.topic}`}
                          title="Delete"
                        >
                          <Icon name="trash" className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                      <span className="bg-slate-800 px-2 py-1 rounded">{item.tone}</span>
                      <span className="bg-slate-800 px-2 py-1 rounded">{item.contentLength} words</span>
                    </div>
                    <time className="text-xs text-slate-600 mt-2 block" dateTime={new Date(item.timestamp).toISOString()}>
                      {formatDate(item.timestamp)}
                    </time>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default HistorySidebar;
