import React, { useState, useCallback, Suspense, lazy } from 'react';
import { Tone } from './types';
import { TONE_OPTIONS } from './constants';
import { generateContent } from './services/geminiService';
import Icon from './components/Icon';

// Lazy load ReactMarkdown for code splitting
const ReactMarkdown = lazy(() => import('react-markdown'));

const App: React.FC = () => {
    const [topic, setTopic] = useState<string>('');
    const [tone, setTone] = useState<Tone>(Tone.PROFESSIONAL);
    const [keywords, setKeywords] = useState<string>('');
    const [contentLength, setContentLength] = useState<number>(200);
    const [generatedContent, setGeneratedContent] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState<boolean>(false);

    const handleGenerate = useCallback(async () => {
        if (!topic.trim()) {
            setError('Topic cannot be empty.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedContent('');

        try {
            const content = await generateContent(topic, tone, keywords, contentLength);
            setGeneratedContent(content);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [topic, tone, keywords, contentLength]);

    const handleCopyToClipboard = useCallback(() => {
        if (!generatedContent) return;
        navigator.clipboard.writeText(generatedContent).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    }, [generatedContent]);

    const handleClear = useCallback(() => {
        setTopic('');
        setTone(Tone.PROFESSIONAL);
        setKeywords('');
        setContentLength(200);
        setGeneratedContent('');
        setError(null);
        setIsCopied(false);
    }, []);

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 font-sans p-4 sm:p-6 lg:p-8">
            <main className="max-w-7xl mx-auto">
                <header className="text-center mb-10">
                    <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 pb-2">
                        AI Content Creator
                    </h1>
                    <p className="text-slate-400 mt-2 text-lg">
                        Generate high-quality written content on any topic using the power of Gemini AI.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Input Section */}
                    <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="topic" className="block text-sm font-medium text-slate-300 mb-2">
                                    Topic / Content Idea
                                </label>
                                <textarea
                                    id="topic"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="e.g., The benefits of a balanced diet"
                                    className="w-full h-32 bg-slate-900 border border-slate-600 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 resize-none"
                                    disabled={isLoading}
                                />
                            </div>

                            <div>
                                <label htmlFor="tone" className="block text-sm font-medium text-slate-300 mb-2">
                                    Select Tone of Voice
                                </label>
                                <select
                                    id="tone"
                                    value={tone}
                                    onChange={(e) => setTone(e.target.value as Tone)}
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200"
                                    disabled={isLoading}
                                >
                                    {TONE_OPTIONS.map((option) => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="keywords" className="block text-sm font-medium text-slate-300 mb-2">
                                    Keywords (Optional)
                                </label>
                                <input
                                    type="text"
                                    id="keywords"
                                    value={keywords}
                                    onChange={(e) => setKeywords(e.target.value)}
                                    placeholder="e.g., health, nutrition, wellness"
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200"
                                    disabled={isLoading}
                                />
                                <p className="text-xs text-slate-500 mt-1">Comma-separated keywords to include.</p>
                            </div>

                            <div>
                                <label htmlFor="contentLength" className="block text-sm font-medium text-slate-300 mb-2">
                                    Content Length <span className="text-slate-400 font-normal">(Approx. {contentLength} words)</span>
                                </label>
                                <input
                                    type="range"
                                    id="contentLength"
                                    min="50"
                                    max="1000"
                                    step="50"
                                    value={contentLength}
                                    onChange={(e) => setContentLength(Number(e.target.value))}
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="mt-8 flex flex-col sm:flex-row-reverse gap-4">
                            <button
                                onClick={handleGenerate}
                                disabled={isLoading || !topic.trim()}
                                className="flex-grow flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
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
                    </div>

                    {/* Output Section */}
                    <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-slate-300">Generated Content</h2>
                             <button
                                onClick={handleCopyToClipboard}
                                disabled={!generatedContent || isLoading}
                                className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                aria-label="Copy to clipboard"
                            >
                               <Icon name="copy" className="w-5 h-5" />
                            </button>
                        </div>
                        {isCopied && <div className="absolute top-5 right-5 bg-green-500 text-white text-sm py-1 px-3 rounded-md animate-fade-in">Copied to clipboard!</div>}

                        <div className="flex-grow bg-slate-900 border border-slate-700 rounded-lg p-4 overflow-y-auto min-h-[300px] leading-relaxed">
                            {error && <div className="text-red-400 text-center p-4">{error}</div>}
                            {!isLoading && !generatedContent && !error && (
                                <div className="flex items-center justify-center h-full text-slate-500">
                                    Your generated content will appear here...
                                </div>
                            )}
                             {isLoading && (
                                <div className="flex items-center justify-center h-full text-slate-500">
                                    <Icon name="spinner" className="w-8 h-8" />
                                </div>
                            )}
                            {!isLoading && generatedContent && (
                                <div className="animate-fade-in prose prose-invert max-w-none">
                                    <Suspense fallback={<div className="flex items-center justify-center h-full text-slate-500"><Icon name="spinner" className="w-6 h-6" /></div>}>
                                        <ReactMarkdown>{generatedContent}</ReactMarkdown>
                                    </Suspense>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;
