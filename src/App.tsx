import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Tone, HistoryItem } from './types/types';
import { 
  TONE_OPTIONS, 
  MIN_CONTENT_LENGTH, 
  MAX_CONTENT_LENGTH, 
  DEFAULT_CONTENT_LENGTH,
  COPY_SUCCESS_DURATION,
  MAX_TOPIC_LENGTH,
  MAX_KEYWORDS_LENGTH
} from './constants/constants';
import apiService from './services/apiService';
import Icon from './components/Icon';
import CustomSelect from './components/CustomSelect';
import HistorySidebar from './components/HistorySidebar';
import ExportModal from './components/ExportModal';
import { useContentHistory } from './hooks/useContentHistory';
import { exportToPDF, exportToWord } from './utils/exportUtils';

// Import ReactMarkdown and plugins directly
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const App: React.FC = () => {
    const [topic, setTopic] = useState<string>('');
    const [tone, setTone] = useState<Tone>(Tone.PROFESSIONAL);
    const [keywords, setKeywords] = useState<string>('');
    const [contentLength, setContentLength] = useState<number>(DEFAULT_CONTENT_LENGTH);
    const [generatedContent, setGeneratedContent] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState<boolean>(false);
    const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
    const [isHistorySidebarOpen, setIsHistorySidebarOpen] = useState<boolean>(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
    const [announcement, setAnnouncement] = useState<string>('');
    
    const mainContentRef = useRef<HTMLDivElement>(null);
    const { history, saveToHistory, deleteHistoryItem, clearHistory, exportHistory } = useContentHistory();

    // Check server health on mount
    useEffect(() => {
        const checkHealth = async () => {
            const isHealthy = await apiService.healthCheck();
            setServerStatus(isHealthy ? 'online' : 'offline');
        };
        checkHealth();
    }, []);

    const handleGenerate = useCallback(async () => {
        if (!topic.trim()) {
            setError('Topic cannot be empty.');
            setAnnouncement('Error: Topic cannot be empty');
            return;
        }

        if (serverStatus === 'offline') {
            setError('Server is offline. Please ensure the backend server is running.');
            setAnnouncement('Error: Server is offline');
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedContent('');
        setAnnouncement('Generating content, please wait');

        try {
            const content = await apiService.generateContent(
                topic.trim(),
                tone,
                keywords.trim(),
                contentLength
            );
            setGeneratedContent(content);
            saveToHistory(topic.trim(), tone, keywords.trim(), contentLength, content);
            setAnnouncement('Content generated successfully');
            
            // Focus on output section for accessibility
            setTimeout(() => {
                document.getElementById('generated-output')?.focus();
            }, 100);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(errorMessage);
            setAnnouncement(`Error: ${errorMessage}`);
            console.error('Generation error:', err);
        } finally {
            setIsLoading(false);
        }
    }, [topic, tone, keywords, contentLength, serverStatus, saveToHistory]);

    const handleCopyToClipboard = useCallback(() => {
        if (!generatedContent) return;
        
        navigator.clipboard.writeText(generatedContent)
            .then(() => {
                setIsCopied(true);
                setAnnouncement('Content copied to clipboard');
                setTimeout(() => setIsCopied(false), COPY_SUCCESS_DURATION);
            })
            .catch((err) => {
                console.error('Failed to copy:', err);
                setError('Failed to copy to clipboard.');
                setAnnouncement('Failed to copy to clipboard');
            });
    }, [generatedContent]);

    const handleClear = useCallback(() => {
        setTopic('');
        setTone(Tone.PROFESSIONAL);
        setKeywords('');
        setContentLength(DEFAULT_CONTENT_LENGTH);
        setGeneratedContent('');
        setError(null);
        setIsCopied(false);
        setAnnouncement('All fields cleared');
    }, []);

    const handleRestoreFromHistory = useCallback((item: HistoryItem) => {
        setTopic(item.topic);
        setTone(item.tone);
        setKeywords(item.keywords);
        setContentLength(item.contentLength);
        setGeneratedContent(item.generatedContent);
        setIsHistorySidebarOpen(false);
        setAnnouncement('Content restored from history');
        
        // Focus on main content
        setTimeout(() => {
            mainContentRef.current?.focus();
        }, 100);
    }, []);

    const handleDeleteHistory = useCallback((id: string) => {
        deleteHistoryItem(id);
        setAnnouncement('History item deleted');
    }, [deleteHistoryItem]);

    const handleClearHistory = useCallback(() => {
        if (window.confirm('Are you sure you want to clear all history?')) {
            clearHistory();
            setAnnouncement('All history cleared');
        }
    }, [clearHistory]);

    const skipToMainContent = useCallback(() => {
        mainContentRef.current?.focus();
    }, []);

    const handleExport = useCallback(async (format: 'pdf' | 'word') => {
        if (!generatedContent) {
            setError('No content to export');
            setAnnouncement('Error: No content to export');
            return;
        }

        try {
            setAnnouncement(`Exporting as ${format.toUpperCase()}...`);
            
            if (format === 'pdf') {
                await exportToPDF(generatedContent, topic || 'Untitled');
            } else {
                await exportToWord(generatedContent, topic || 'Untitled');
            }
            
            setAnnouncement(`Successfully exported as ${format.toUpperCase()}`);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Export failed';
            setError(errorMessage);
            setAnnouncement(`Error: ${errorMessage}`);
            throw err;
        }
    }, [generatedContent, topic]);

    // Keyboard shortcut for generate (Ctrl/Cmd + Enter)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !isLoading && topic.trim()) {
                e.preventDefault();
                handleGenerate();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleGenerate, isLoading, topic]);

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 font-sans p-4 sm:p-6 lg:p-8">
            {/* Skip to main content link for accessibility */}
            <a
                href="#main-content"
                onClick={(e) => {
                    e.preventDefault();
                    skipToMainContent();
                }}
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-purple-600 focus:text-white focus:rounded-lg focus:shadow-lg"
            >
                Skip to main content
            </a>

            {/* Screen reader announcements */}
            <div
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className="sr-only"
            >
                {announcement}
            </div>

            <main 
                id="main-content"
                className="max-w-7xl mx-auto"
                ref={mainContentRef}
                tabIndex={-1}
            >
                <header className="text-center mb-10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex-1" />
                        <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 pb-2">
                            Content Creator
                        </h1>
                        <div className="flex-1 flex justify-end">
                            <button
                                onClick={() => setIsHistorySidebarOpen(true)}
                                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors relative"
                                aria-label={`Open history sidebar. ${history.length} items in history`}
                                title="View History"
                            >
                                <Icon name="history" className="w-6 h-6" />
                                {history.length > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        {history.length > 9 ? '9+' : history.length}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                    <p className="text-slate-400 mt-2 text-lg">
                        Generate high-quality written content on any topic using the power of AI.
                    </p>
                    
                    {/* Server Status Indicator */}
                    <div className="mt-4 flex items-center justify-center gap-2">
                        <div 
                            className={`w-2 h-2 rounded-full ${
                                serverStatus === 'online' ? 'bg-green-500' : 
                                serverStatus === 'offline' ? 'bg-red-500' : 
                                'bg-yellow-500 animate-pulse'
                            }`}
                            role="status"
                            aria-label={`Server status: ${serverStatus}`}
                        />
                        <span className="text-sm text-slate-500">
                            Server: {serverStatus === 'checking' ? 'Checking...' : serverStatus}
                        </span>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Input Section */}
                    <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="topic" className="block text-sm font-medium text-slate-300 mb-2">
                                    Topic / Content Idea <span className="text-red-400">*</span>
                                </label>
                                <textarea
                                    id="topic"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value.slice(0, MAX_TOPIC_LENGTH))}
                                    placeholder="e.g., The benefits of a balanced diet"
                                    className="w-full h-32 bg-slate-900 border border-slate-600 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 resize-none"
                                    disabled={isLoading}
                                    aria-required="true"
                                    aria-invalid={error && !topic.trim() ? 'true' : 'false'}
                                    maxLength={MAX_TOPIC_LENGTH}
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    {topic.length}/{MAX_TOPIC_LENGTH} characters
                                </p>
                            </div>

                            <div>
                                <label htmlFor="tone" className="block text-sm font-medium text-slate-300 mb-2">
                                    Select Tone of Voice
                                </label>
                                <CustomSelect
                                    id="tone"
                                    value={tone}
                                    onChange={setTone}
                                    options={TONE_OPTIONS}
                                    disabled={isLoading}
                                />
                            </div>

                            <div>
                                <label htmlFor="keywords" className="block text-sm font-medium text-slate-300 mb-2">
                                    Keywords (Optional)
                                </label>
                                <input
                                    type="text"
                                    id="keywords"
                                    value={keywords}
                                    onChange={(e) => setKeywords(e.target.value.slice(0, MAX_KEYWORDS_LENGTH))}
                                    placeholder="e.g., health, nutrition, wellness"
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200"
                                    disabled={isLoading}
                                    maxLength={MAX_KEYWORDS_LENGTH}
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    Comma-separated keywords to include ({keywords.length}/{MAX_KEYWORDS_LENGTH})
                                </p>
                            </div>

                            <div>
                                <label htmlFor="contentLength" className="block text-sm font-medium text-slate-300 mb-2">
                                    Content Length <span className="text-slate-400 font-normal">(Approx. {contentLength} words)</span>
                                </label>
                                <input
                                    type="range"
                                    id="contentLength"
                                    min={MIN_CONTENT_LENGTH}
                                    max={MAX_CONTENT_LENGTH}
                                    step="50"
                                    value={contentLength}
                                    onChange={(e) => setContentLength(Number(e.target.value))}
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                    disabled={isLoading}
                                    aria-valuemin={MIN_CONTENT_LENGTH}
                                    aria-valuemax={MAX_CONTENT_LENGTH}
                                    aria-valuenow={contentLength}
                                    aria-label={`Content length: ${contentLength} words`}
                                />
                                <div className="flex justify-between text-xs text-slate-500 mt-1">
                                    <span aria-hidden="true">{MIN_CONTENT_LENGTH}</span>
                                    <span aria-hidden="true">{MAX_CONTENT_LENGTH}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-col sm:flex-row-reverse gap-4">
                            <button
                                onClick={handleGenerate}
                                disabled={isLoading || !topic.trim() || serverStatus === 'offline'}
                                className="flex-grow flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none"
                                aria-label="Generate content"
                            >
                                {isLoading ? <Icon name="spinner" className="w-5 h-5" /> : <Icon name="generate" className="w-5 h-5" />}
                                {isLoading ? 'Generating...' : 'Generate Content'}
                            </button>
                            <button
                                onClick={handleClear}
                                disabled={isLoading}
                                className="sm:w-auto flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-200"
                                aria-label="Clear all inputs and output"
                            >
                                <Icon name="clear" className="w-5 h-5" />
                                Clear All
                            </button>
                        </div>
                        
                        <p className="text-xs text-slate-500 mt-4 text-center">
                            Tip: Press Ctrl+Enter (Cmd+Enter on Mac) to generate
                        </p>
                    </div>

                    {/* Output Section */}
                    <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-slate-300">Generated Content</h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsExportModalOpen(true)}
                                    disabled={!generatedContent || isLoading}
                                    className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    aria-label="Export content"
                                    title="Export as PDF or Word"
                                >
                                    <Icon name="download" className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={handleCopyToClipboard}
                                    disabled={!generatedContent || isLoading}
                                    className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors relative"
                                    aria-label="Copy to clipboard"
                                >
                                    <Icon name="copy" className="w-5 h-5" />
                                    {isCopied && (
                                        <span className="absolute -top-8 right-0 bg-green-500 text-white text-xs py-1 px-2 rounded whitespace-nowrap animate-fade-in">
                                            Copied!
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div 
                            id="generated-output"
                            className="flex-grow bg-slate-900 border border-slate-700 rounded-lg p-4 overflow-y-auto h-[500px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-purple-500"
                            tabIndex={-1}
                            role="region"
                            aria-live="polite"
                            aria-label="Generated content output"
                        >
                            {error && (
                                <div className="text-red-400 p-4 bg-red-900/20 rounded-lg border border-red-800" role="alert">
                                    <strong className="font-semibold">Error: </strong>
                                    {error}
                                </div>
                            )}
                            {!isLoading && !generatedContent && !error && (
                                <div className="flex items-center justify-center h-full text-slate-500">
                                    Your generated content will appear here...
                                </div>
                            )}
                            {isLoading && (
                                <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4">
                                    <Icon name="spinner" className="w-8 h-8" />
                                    <p>Generating your content...</p>
                                </div>
                            )}
                            {!isLoading && generatedContent && (
                                <div className="animate-fade-in prose prose-invert max-w-none">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {generatedContent}
                                    </ReactMarkdown>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* History Sidebar */}
            <HistorySidebar
                isOpen={isHistorySidebarOpen}
                onClose={() => setIsHistorySidebarOpen(false)}
                history={history}
                onRestore={handleRestoreFromHistory}
                onDelete={handleDeleteHistory}
                onClear={handleClearHistory}
                onExport={exportHistory}
            />

            {/* Export Modal */}
            <ExportModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                onExport={handleExport}
                topic={topic}
            />
        </div>
    );
};

export default App;
