
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { FileUploader } from './components/FileUploader';
import { AudioPlayer } from './components/AudioPlayer';
import { VideoPlayer } from './components/VideoPlayer';
import { AnalysisResults } from './components/AnalysisResults';
import { HistoryPanel } from './components/HistoryPanel';
import { Dashboard } from './components/Dashboard';
import { Sidebar } from './components/Sidebar';
import { Settings } from './components/Settings';
import { RecycleBin } from './components/RecycleBin';
import { ProgressOverlay } from './components/ProgressOverlay';
import { analyzeCallTranscript, transcribeAudio } from './services/geminiService';
import { Analysis, HistoryEntry, AnalysisPersona, Theme, THEMES } from './types';
import { 
    BrainCircuitIcon, XCircleIcon,
    TagIcon, FileTextIcon, DownloadIcon
} from './components/icons';

const HISTORY_STORAGE_KEY = 'joycribeHistory_v4';
const THEME_STORAGE_KEY = 'joycribeTheme_v1';

const exportData = (filename: string, content: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

export default function App(): React.ReactNode {
    const [file, setFile] = useState<File | null>(null);
    const [mediaType, setMediaType] = useState<'audio' | 'video' | null>(null);
    const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);
    const [transcript, setTranscript] = useState<string>('');
    const [analysisPersona, setAnalysisPersona] = useState<AnalysisPersona>(AnalysisPersona.General);
    const [customEntitiesInput, setCustomEntitiesInput] = useState('');
    const [notes, setNotes] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [progressMessage, setProgressMessage] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const [history, setHistory] = useState<HistoryEntry[]>([]);
    
    const [activeView, setActiveView] = useState<'analyzer' | 'dashboard' | 'recycleBin' | 'settings'>('analyzer');
    const [searchTerm, setSearchTerm] = useState('');
    const [sentimentFilter, setSentimentFilter] = useState('');
    const [personaFilter, setPersonaFilter] = useState('');

    const [theme, setTheme] = useState<Theme>(THEMES[0]);

    // --- Effects ---
    useEffect(() => {
        try {
            const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
            if (savedHistory) setHistory(JSON.parse(savedHistory));

            const savedThemeId = localStorage.getItem(THEME_STORAGE_KEY);
            const foundTheme = THEMES.find(t => t.id === savedThemeId);
            if(foundTheme) setTheme(foundTheme);
        } catch (e) {
            console.error("Failed to load data from storage", e);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
        } catch (e) {
            console.error("Failed to save history", e);
        }
    }, [history]);
    
    useEffect(() => {
        localStorage.setItem(THEME_STORAGE_KEY, theme.id);
        const root = document.documentElement;
        for (const [key, value] of Object.entries(theme.colors)) {
            root.style.setProperty(key, value);
        }
    }, [theme]);
    
    const handleClearWorkspace = useCallback(() => {
      setFile(null);
      setMediaType(null);
      setSelectedEntry(null);
      setTranscript('');
      setNotes('');
      setTags([]);
      setCustomEntitiesInput('');
      setError(null);
      setIsProcessing(false);
      setProgressMessage('');
      setAnalysisPersona(AnalysisPersona.General);
    }, []);
    
    const handleFileSelect = useCallback(async (selectedFile: File) => {
        handleClearWorkspace();
        const type = selectedFile.type.startsWith('video/') ? 'video' : 'audio';
        setMediaType(type);
        setFile(selectedFile);
        setIsProcessing(true);
        setProgressMessage('Transcribing audio...');
        setError(null);

        try {
            const transcriptText = await transcribeAudio(selectedFile);
            setTranscript(transcriptText);
        } catch (e) {
            console.error(e);
            setError('Failed to transcribe audio. Please check console or provide transcript manually.');
        } finally {
            setIsProcessing(false);
            setProgressMessage('');
        }
    }, [handleClearWorkspace]);
    
    const handleRerunAnalysis = useCallback((entry: HistoryEntry) => {
        handleClearWorkspace();
        setTranscript(entry.transcript);
        setAnalysisPersona(entry.analysisPersona);
        setCustomEntitiesInput(entry.customEntitiesInput || '');
        setNotes(entry.notes || '');
        setTags(entry.tags || []);
        setActiveView('analyzer');
    }, [handleClearWorkspace]);

    const handleUpdateHistoryEntry = useCallback((updatedEntry: Partial<HistoryEntry> & { id: number }) => {
        setHistory(prev =>
            prev.map(entry =>
                entry.id === updatedEntry.id ? { ...entry, ...updatedEntry } : entry
            )
        );
        if (selectedEntry && selectedEntry.id === updatedEntry.id) {
            setSelectedEntry(prev => prev ? { ...prev, ...updatedEntry } : null);
        }
    }, [selectedEntry]);

    const handleProcessClick = useCallback(async () => {
        if (!transcript.trim()) {
            setError('Please provide a transcript to analyze.');
            return;
        }

        setIsProcessing(true);
        setProgressMessage('Analyzing transcript...');
        setError(null);

        try {
            const result = await analyzeCallTranscript(transcript, analysisPersona, customEntitiesInput);
            
            const newHistoryEntry: HistoryEntry = {
                id: Date.now(),
                fileName: file?.name || selectedEntry?.fileName || 'Manual Transcript',
                transcript,
                analysis: result,
                analysisPersona,
                date: new Date().toLocaleString(),
                mediaType: file ? (file.type.startsWith('video/') ? 'video' : 'audio') : (selectedEntry?.mediaType || 'audio'),
                notes,
                tags: result.suggestedTags || [],
                customEntitiesInput,
                status: 'active',
            };

            setHistory(prev => [newHistoryEntry, ...prev]);
            setSelectedEntry(newHistoryEntry);
            setFile(null); 
            setTags(result.suggestedTags || []);
            setNotes('');

        } catch (e: any) {
            console.error(e);
            setError(e.message || 'Failed to analyze transcript. Please check console for details.');
        } finally {
            setIsProcessing(false);
            setProgressMessage('');
        }
    }, [transcript, analysisPersona, customEntitiesInput, file, selectedEntry, notes]);

    const handleSelectHistory = useCallback((entry: HistoryEntry) => {
        handleClearWorkspace();
        setSelectedEntry(entry);
        setTranscript(entry.transcript);
        setAnalysisPersona(entry.analysisPersona);
        setNotes(entry.notes || '');
        setTags(entry.tags || []);
        setCustomEntitiesInput(entry.customEntitiesInput || '');
        setMediaType(entry.mediaType); 
        setActiveView('analyzer');
    }, [handleClearWorkspace]);

    // --- Recycle Bin Logic ---
    const handleMoveToRecycleBin = useCallback((id: number) => {
        setHistory(prev => prev.map(entry => entry.id === id ? { ...entry, status: 'trashed' } : entry));
        if (selectedEntry?.id === id) {
            handleClearWorkspace();
        }
    }, [selectedEntry, handleClearWorkspace]);

    const handleRestoreFromRecycleBin = useCallback((id: number) => {
        setHistory(prev => prev.map(entry => entry.id === id ? { ...entry, status: 'active' } : entry));
    }, []);

    const handleDeletePermanently = useCallback((id: number) => {
        if (window.confirm("Are you sure you want to permanently delete this item? This cannot be undone.")) {
            setHistory(prev => prev.filter(entry => entry.id !== id));
        }
    }, []);

    const handleEmptyRecycleBin = useCallback(() => {
        if (window.confirm("Are you sure you want to permanently delete all items in the Recycle Bin? This cannot be undone.")) {
            setHistory(prev => prev.filter(entry => entry.status !== 'trashed'));
        }
    }, []);


    // --- Memoized Filters ---
    const activeHistory = useMemo(() => history.filter(h => h.status === 'active'), [history]);
    const trashedHistory = useMemo(() => history.filter(h => h.status === 'trashed'), [history]);

    const filteredHistory = useMemo(() => {
        return activeHistory.filter(entry => {
            if (!entry.analysis) return false;
            const searchTermLower = searchTerm.toLowerCase();
            const matchesSearch = searchTermLower === '' ||
                entry.fileName.toLowerCase().includes(searchTermLower) ||
                entry.transcript.toLowerCase().includes(searchTermLower) ||
                entry.analysis.summary.toLowerCase().includes(searchTermLower) ||
                (entry.tags || []).some(tag => tag.toLowerCase().includes(searchTermLower));
            
            const matchesSentiment = sentimentFilter === '' || entry.analysis.sentiment === sentimentFilter;
            const matchesPersona = personaFilter === '' || entry.analysisPersona === personaFilter;

            return matchesSearch && matchesSentiment && matchesPersona;
        });
    }, [activeHistory, searchTerm, sentimentFilter, personaFilter]);
    
    const handleExport = (format: 'txt' | 'csv') => {
        if (!selectedEntry || !selectedEntry.analysis) return;

        const { fileName, date, analysisPersona, analysis, transcript, notes, tags } = selectedEntry;
        const safeFileName = fileName.replace(/[^a-z0-9]/gi, '_').toLowerCase();

        if (format === 'txt') {
            const content = `Analysis for: ${fileName}\nDate: ${date}\nPersona: ${analysisPersona}\nSentiment: ${analysis.sentiment}\n\n--- Summary ---\n${analysis.summary}\n\n--- Keywords ---\n${analysis.keywords.join(', ')}\n\n--- Topics ---\n${analysis.topics.join(', ')}\n\n--- Tags ---\n${(tags || []).join(', ')}\n\n--- Notes ---\n${notes || 'N/A'}\n\n--- Full Transcript ---\n${transcript}`;
            exportData(`${safeFileName}_analysis.txt`, content, 'text/plain;charset=utf-8;');
        }

        if (format === 'csv') {
            const headers = ['FileName', 'Date', 'Persona', 'Sentiment', 'Summary', 'Keywords', 'Topics', 'Tags', 'Notes', 'Transcript'];
            const row = [`"${fileName}"`, `"${date}"`, `"${analysisPersona}"`, `"${analysis.sentiment}"`, `"${analysis.summary.replace(/"/g, '""')}"`, `"${analysis.keywords.join(', ')}"`, `"${analysis.topics.join(', ')}"`, `"${(tags || []).join(', ')}"`, `"${(notes || '').replace(/"/g, '""')}"`, `"${transcript.replace(/"/g, '""')}"`];
            const content = headers.join(',') + '\r\n' + row.join(',');
            exportData(`${safeFileName}_analysis.csv`, content, 'text/csv;charset=utf-8;');
        }
    };

    const currentAnalysis = selectedEntry?.analysis || null;
    
    const renderContent = () => {
        switch (activeView) {
            case 'dashboard':
                return <Dashboard history={activeHistory} />;
            case 'recycleBin':
                return <RecycleBin history={trashedHistory} onRestore={handleRestoreFromRecycleBin} onDelete={handleDeletePermanently} onEmpty={handleEmptyRecycleBin} />;
            case 'settings':
                return <Settings currentTheme={theme} onThemeChange={setTheme} />;
            case 'analyzer':
            default:
                return (
                     <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
                        <div className="lg:col-span-3 flex flex-col gap-8 relative">
                            {isProcessing && <ProgressOverlay message={progressMessage} />}
                            
                            {/* Card 1: Workspace */}
                            <div className="bg-[var(--color-background-card)] rounded-xl shadow-2xl shadow-black/20 p-6 border border-[var(--color-border)]">
                                <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-4 mb-6">
                                    <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Workspace</h2>
                                    { (file || selectedEntry) && 
                                        <button onClick={handleClearWorkspace} disabled={isProcessing} className="text-sm text-[var(--color-text-secondary)] hover:text-white flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                            <XCircleIcon className="h-5 w-5" /> Clear
                                        </button> 
                                    }
                                </div>
                                <FileUploader onFileSelect={handleFileSelect} activeFileName={file?.name || selectedEntry?.fileName} onClear={handleClearWorkspace} />
                                {file && mediaType === 'audio' && <AudioPlayer file={file} />}
                                {file && mediaType === 'video' && <VideoPlayer file={file} />}
                                {!file && selectedEntry && <p className="text-center text-[var(--color-text-secondary)] mt-4 text-sm">Media for this analysis is not loaded. Edit transcript and re-run.</p>}
                            </div>

                             {/* Card 2: Transcript & Settings */}
                            <div className="bg-[var(--color-background-card)] rounded-xl shadow-2xl shadow-black/20 p-6 border border-[var(--color-border)]">
                                <h2 className="text-2xl font-bold text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-4 mb-6">Transcript & Settings</h2>
                                
                                <div className="flex-grow flex flex-col">
                                    <label htmlFor="transcript" className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-2 uppercase tracking-wider">Call Transcript (Hebrew)</label>
                                    <div className="mt-1 relative flex-grow flex flex-col">
                                        <textarea id="transcript" dir="rtl" className="w-full h-full flex-grow bg-[var(--color-background-input)] border border-[var(--color-border)] rounded-lg p-3 text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-ring)] transition placeholder-gray-500 min-h-[250px] text-right"
                                            placeholder={"Upload a file or paste a transcript here."}
                                            value={transcript} onChange={(e) => setTranscript(e.target.value)} disabled={isProcessing}
                                        />
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <label htmlFor="analysis-persona" className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-2 uppercase tracking-wider">Analysis Persona</label>
                                    <select id="analysis-persona" value={analysisPersona} onChange={e => setAnalysisPersona(e.target.value as AnalysisPersona)} disabled={isProcessing}
                                        className="w-full bg-[var(--color-background-input)] border border-[var(--color-border)] rounded-lg p-3 text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-ring)] transition">
                                      {Object.values(AnalysisPersona).map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                                <div className="mt-4">
                                    <label htmlFor="custom-entities" className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-2 uppercase tracking-wider">Custom Entity Detection (Optional)</label>
                                    <input type="text" id="custom-entities" placeholder="e.g. product names, order IDs (comma-separated)" value={customEntitiesInput}
                                        onChange={e => setCustomEntitiesInput(e.target.value)}
                                        disabled={isProcessing}
                                        className="w-full bg-[var(--color-background-input)] border border-[var(--color-border)] rounded-lg p-3 focus:ring-2 focus:ring-[var(--color-ring)]"/>
                                </div>
                                 {error && <div className="bg-red-900/50 text-red-300 border border-red-700 rounded-lg p-3 text-center my-4 text-sm">{error}</div>}
                                
                                <div className="mt-6">
                                    <button onClick={handleProcessClick} disabled={isProcessing || !transcript.trim()}
                                        className="w-full flex items-center justify-center gap-3 px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[var(--color-primary)] hover:opacity-90 disabled:bg-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-950 focus:ring-[var(--color-ring)] transition-all transform hover:scale-105">
                                        <BrainCircuitIcon />Analyze Transcript
                                    </button>
                                </div>
                            </div>
                            
                            {/* Card 3: Analysis Results & Actions */}
                            {currentAnalysis && (
                                <div className="bg-[var(--color-background-card)] rounded-xl shadow-2xl shadow-black/20 p-6 border border-[var(--color-border)]">
                                    <h2 className="text-2xl font-bold text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-4 mb-6">Analysis Results</h2>
                                    
                                     <AnalysisResults analysis={currentAnalysis} />
                                     <div className="space-y-6 pt-6 mt-6 border-t border-[var(--color-border)]">
                                            <div>
                                                <label htmlFor="tags" className="flex items-center gap-2 text-lg font-semibold text-[var(--color-text-primary)] mb-2"><TagIcon /> Tags</label>
                                                <input type="text" id="tags" placeholder="Add tags, comma-separated" value={tags.join(', ')}
                                                    onChange={e => setTags(e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                                                    onBlur={() => selectedEntry && handleUpdateHistoryEntry({ id: selectedEntry.id, tags })} className="w-full bg-[var(--color-background-input)] border border-[var(--color-border)] rounded-lg p-3 focus:ring-2 focus:ring-[var(--color-ring)]"/>
                                            </div>
                                            <div>
                                                <label htmlFor="notes" className="flex items-center gap-2 text-lg font-semibold text-[var(--color-text-primary)] mb-2"><FileTextIcon /> Notes</label>
                                                <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={() => selectedEntry && handleUpdateHistoryEntry({ id: selectedEntry.id, notes })}
                                                    placeholder="Add your personal notes here..." className="w-full bg-[var(--color-background-input)] border border-[var(--color-border)] rounded-lg p-3 min-h-[100px] focus:ring-2 focus:ring-[var(--color-ring)]"/>
                                            </div>
                                            <div>
                                                <h3 className="flex items-center gap-2 text-lg font-semibold text-[var(--color-text-primary)] mb-2"><DownloadIcon /> Export</h3>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleExport('txt')} className="px-4 py-2 text-sm rounded-md bg-[var(--color-background-hover)] hover:opacity-80">Export as .TXT</button>
                                                    <button onClick={() => handleExport('csv')} className="px-4 py-2 text-sm rounded-md bg-[var(--color-background-hover)] hover:opacity-80">Export as .CSV</button>
                                                </div>
                                            </div>
                                        </div>
                                </div>
                            )}
                        </div>
                        <div className="lg:col-span-2 lg:sticky lg:top-8">
                             <HistoryPanel history={filteredHistory} onSelect={handleSelectHistory} onRerun={handleRerunAnalysis}
                                searchTerm={searchTerm} onSearchChange={setSearchTerm} sentimentFilter={sentimentFilter}
                                onSentimentFilterChange={setSentimentFilter} personaFilter={personaFilter} onPersonaFilterChange={setPersonaFilter}
                                selectedId={selectedEntry?.id || null}
                                onMoveToRecycleBin={handleMoveToRecycleBin}
                            />
                        </div>
                     </div>
                );
        }
    }
    
    return (
        <div className="flex min-h-screen bg-[var(--color-background-base)] text-[var(--color-text-primary)] font-sans">
            <Sidebar activeView={activeView} setActiveView={setActiveView} />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                {renderContent()}
            </main>
        </div>
    );
}