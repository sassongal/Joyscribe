import React, { useState, useCallback, useEffect, useMemo, useContext } from 'react';
import { AppContext } from './context/AppContext';
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
import { ApiKeyModal } from './components/ApiKeyModal';
import { HistoryEntry, AnalysisPersona, Theme, THEMES } from './types';
import { BrainCircuitIcon, XCircleIcon, TagIcon, FileTextIcon, DownloadIcon } from './components/icons';

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
    const { state, dispatch } = useContext(AppContext);
    const { history, theme, apiKey, isProcessing, progressMessage, error, isApiKeyModalOpen, isFirstRun } = state;

    // Local UI state that doesn't need to be global
    const [file, setFile] = useState<File | null>(null);
    const [fileUrl, setFileUrl] = useState<string>('');
    const [mediaType, setMediaType] = useState<'audio' | 'video' | null>(null);
    const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);
    const [transcript, setTranscript] = useState<string>('');
    const [analysisPersona, setAnalysisPersona] = useState<AnalysisPersona>(AnalysisPersona.General);
    const [customEntitiesInput, setCustomEntitiesInput] = useState('');
    const [notes, setNotes] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    
    const [activeView, setActiveView] = useState<'analyzer' | 'dashboard' | 'recycleBin' | 'settings'>('analyzer');
    const [searchTerm, setSearchTerm] = useState('');
    const [sentimentFilter, setSentimentFilter] = useState('');
    const [personaFilter, setPersonaFilter] = useState('');

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [storedHistory, storedApiKey, hardwareAccel] = await Promise.all([
                    window.api.getHistory(),
                    window.api.getApiKey(),
                    window.api.getHardwareAccelSetting()
                ]);

                const savedThemeId = localStorage.getItem('joycribeTheme_v1_desktop');
                const foundTheme = THEMES.find(t => t.id === savedThemeId) || THEMES[0];
                
                dispatch({ type: 'INITIAL_LOAD', payload: { 
                    history: storedHistory || [], 
                    apiKey: storedApiKey || "AIzaSyAzq9nhITu2Hu161UBMh_gSf9n2MxX6uHs", 
                    hardwareAccel,
                    theme: foundTheme 
                }});
            } catch (e) {
                console.error("Failed to load data from main process", e);
                dispatch({ type: 'PROCESSING_ERROR', payload: 'Could not load application data. Please restart.' });
            }
        };

        loadInitialData();
    }, [dispatch]);

    const handleClearWorkspace = useCallback(() => {
      setFile(null);
      if (fileUrl) URL.revokeObjectURL(fileUrl);
      setFileUrl('');
      setMediaType(null);
      setSelectedEntry(null);
      setTranscript('');
      setNotes('');
      setTags([]);
      setCustomEntitiesInput('');
      dispatch({ type: 'CLEAR_ERROR' });
      setAnalysisPersona(AnalysisPersona.General);
    }, [fileUrl, dispatch]);
    
    const handleFileSelect = useCallback(async (selectedFile: File & {path: string}) => {
        handleClearWorkspace();
        const type = selectedFile.type.startsWith('video/') ? 'video' : 'audio';
        setMediaType(type);
        setFile(selectedFile);
        setFileUrl(URL.createObjectURL(selectedFile));

        const message = isFirstRun 
            ? 'Preparing engine for first use. This may take a few minutes...'
            : 'Transcribing file...';
        dispatch({ type: 'START_PROCESSING', payload: message });

        try {
            const transcriptText = await window.api.transcribeFile(selectedFile.path);
            setTranscript(transcriptText);
            if(isFirstRun) dispatch({ type: 'SET_IS_FIRST_RUN', payload: false });
            dispatch({ type: 'PROCESSING_SUCCESS' });
        } catch (e: any) {
            dispatch({ type: 'PROCESSING_ERROR', payload: e.message || 'Failed to transcribe audio.' });
        }
    }, [handleClearWorkspace, isFirstRun, dispatch]);
    
    const handleProcessClick = useCallback(async () => {
        if (!transcript.trim()) {
            dispatch({ type: 'PROCESSING_ERROR', payload: 'Please provide a transcript to analyze.' });
            return;
        }
        if (!apiKey) {
            dispatch({ type: 'PROCESSING_ERROR', payload: 'Gemini API key is not set. Please add it in Settings.' });
            dispatch({ type: 'SET_API_KEY_MODAL_OPEN', payload: true });
            return;
        }

        dispatch({ type: 'START_PROCESSING', payload: 'Analyzing transcript...' });

        try {
            const result = await window.api.analyzeTranscript({
                transcript, persona: analysisPersona, customEntitiesList: customEntitiesInput, apiKey
            });
            
            const newHistoryEntry: HistoryEntry = {
                id: Date.now(),
                fileName: file?.name || selectedEntry?.fileName || 'Manual Transcript',
                transcript, analysis: result, analysisPersona,
                date: new Date().toLocaleString(),
                mediaType: file?.type.startsWith('video/') ? 'video' : 'audio' || selectedEntry?.mediaType,
                notes: '', tags: result.suggestedTags || [], customEntitiesInput, status: 'active',
            };
            
            const newHistory = await window.api.saveHistoryEntry(newHistoryEntry);
            dispatch({ type: 'SET_HISTORY', payload: newHistory });
            setSelectedEntry(newHistoryEntry);
            setFile(null); 
            if (fileUrl) { URL.revokeObjectURL(fileUrl); setFileUrl(''); }
            setTags(result.suggestedTags || []);
            setNotes('');
            dispatch({ type: 'PROCESSING_SUCCESS' });
        } catch (e: any) {
            dispatch({ type: 'PROCESSING_ERROR', payload: e.message || 'Failed to analyze transcript.' });
        }
    }, [transcript, analysisPersona, customEntitiesInput, file, fileUrl, selectedEntry, apiKey, dispatch]);

    const handleApiKeySave = async (key: string) => {
        await window.api.setApiKey(key);
        dispatch({ type: 'SET_API_KEY', payload: key });
        dispatch({ type: 'CLEAR_ERROR' });
    };

    const handleThemeChange = (newTheme: Theme) => {
        dispatch({ type: 'SET_THEME', payload: newTheme });
    }
    
    const handleUpdateHistoryEntry = useCallback(async (updatedEntry: Partial<HistoryEntry> & { id: number }) => {
        const newHistory = await window.api.updateHistoryEntry(updatedEntry);
        dispatch({ type: 'SET_HISTORY', payload: newHistory });
        if (selectedEntry?.id === updatedEntry.id) {
            setSelectedEntry(prev => prev ? { ...prev, ...updatedEntry } : null);
        }
    }, [selectedEntry, dispatch]);

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

    const handleRerunAnalysis = useCallback((entry: HistoryEntry) => {
        handleClearWorkspace();
        setTranscript(entry.transcript);
        setAnalysisPersona(entry.analysisPersona);
        setCustomEntitiesInput(entry.customEntitiesInput || '');
        setNotes(entry.notes || '');
        setTags(entry.tags || []);
        setActiveView('analyzer');
    }, [handleClearWorkspace]);

    const handleMoveToRecycleBin = useCallback(async (id: number) => {
        const newHistory = await window.api.updateHistoryEntry({ id, status: 'trashed' });
        dispatch({ type: 'SET_HISTORY', payload: newHistory });
        if (selectedEntry?.id === id) handleClearWorkspace();
    }, [selectedEntry, handleClearWorkspace, dispatch]);

    const handleRestoreFromRecycleBin = useCallback(async (id: number) => {
        const newHistory = await window.api.updateHistoryEntry({ id, status: 'active' });
        dispatch({ type: 'SET_HISTORY', payload: newHistory });
    }, [dispatch]);

    const handleDeletePermanently = useCallback(async (id: number) => {
        if (window.confirm("Are you sure? This cannot be undone.")) {
            const newHistory = await window.api.deleteHistoryEntry(id);
            dispatch({ type: 'SET_HISTORY', payload: newHistory });
        }
    }, [dispatch]);

    const handleEmptyRecycleBin = useCallback(async () => {
        if (window.confirm("Are you sure? This will permanently delete all items in the Recycle Bin.")) {
            const trashedIds = history.filter(e => e.status === 'trashed').map(e => e.id);
            let currentHistory = [...history];
            for (const id of trashedIds) {
                currentHistory = await window.api.deleteHistoryEntry(id);
            }
            dispatch({ type: 'SET_HISTORY', payload: currentHistory });
        }
    }, [history, dispatch]);

    const activeHistory = useMemo(() => history.filter(h => h.status === 'active').sort((a,b) => b.id - a.id), [history]);
    const trashedHistory = useMemo(() => history.filter(h => h.status === 'trashed').sort((a,b) => b.id - a.id), [history]);

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
    
    const renderContent = () => {
        switch (activeView) {
            case 'dashboard': return <Dashboard history={activeHistory} />;
            case 'recycleBin': return <RecycleBin history={trashedHistory} onRestore={handleRestoreFromRecycleBin} onDelete={handleDeletePermanently} onEmpty={handleEmptyRecycleBin} />;
            case 'settings': return <Settings currentTheme={theme} onThemeChange={handleThemeChange} />;
            default:
                return (
                     <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
                        <div className="lg:col-span-3 flex flex-col gap-8 relative">
                            {isProcessing && <ProgressOverlay message={progressMessage} />}
                            
                            <div className="bg-[var(--color-background-card)] rounded-xl shadow-2xl shadow-black/20 p-6 border border-[var(--color-border)]">
                                <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-4 mb-6">
                                    <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Workspace</h2>
                                    { (file || selectedEntry) && 
                                        <button onClick={handleClearWorkspace} disabled={isProcessing} className="text-sm text-[var(--color-text-secondary)] hover:text-white flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                            <XCircleIcon className="h-5 w-5" /> Clear
                                        </button> 
                                    }
                                </div>
                                <FileUploader onFileSelect={handleFileSelect as any} activeFileName={file?.name || selectedEntry?.fileName} onClear={handleClearWorkspace} />
                                {fileUrl && mediaType === 'audio' && <AudioPlayer src={fileUrl} />}
                                {fileUrl && mediaType === 'video' && <VideoPlayer src={fileUrl} />}
                                {!file && selectedEntry && <p className="text-center text-[var(--color-text-secondary)] mt-4 text-sm">Media for this analysis is not loaded.</p>}
                            </div>

                            <div className="bg-[var(--color-background-card)] rounded-xl shadow-2xl shadow-black/20 p-6 border border-[var(--color-border)]">
                                <h2 className="text-2xl font-bold text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-4 mb-6">Transcript & Settings</h2>
                                <textarea id="transcript" dir="rtl" className="w-full bg-[var(--color-background-input)] border border-[var(--color-border)] rounded-lg p-3 min-h-[250px] text-right"
                                    placeholder="Upload a file to transcribe, or paste a transcript here."
                                    value={transcript} onChange={(e) => setTranscript(e.target.value)} disabled={isProcessing} />
                                <div className="mt-6">
                                    <label htmlFor="analysis-persona" className="block text-sm font-semibold uppercase tracking-wider mb-2">Analysis Persona</label>
                                    <select id="analysis-persona" value={analysisPersona} onChange={e => setAnalysisPersona(e.target.value as AnalysisPersona)} disabled={isProcessing}
                                        className="w-full bg-[var(--color-background-input)] border border-[var(--color-border)] rounded-lg p-3">
                                      {Object.values(AnalysisPersona).map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                                <div className="mt-4">
                                    <label htmlFor="custom-entities" className="block text-sm font-semibold uppercase tracking-wider mb-2">Custom Entities (Optional)</label>
                                    <input type="text" id="custom-entities" placeholder="e.g. product names, order IDs (comma-separated)" value={customEntitiesInput}
                                        onChange={e => setCustomEntitiesInput(e.target.value)} disabled={isProcessing}
                                        className="w-full bg-[var(--color-background-input)] border border-[var(--color-border)] rounded-lg p-3"/>
                                </div>
                                {error && <div className="bg-red-900/50 text-red-300 border border-red-700 rounded-lg p-3 text-center my-4">{error}</div>}
                                <div className="mt-6">
                                    <button onClick={handleProcessClick} disabled={isProcessing || !transcript.trim() || !apiKey}
                                        className="w-full flex items-center justify-center gap-3 px-6 py-3 text-base font-medium rounded-md text-white bg-[var(--color-primary)] hover:opacity-90 disabled:bg-gray-600 disabled:cursor-not-allowed">
                                        <BrainCircuitIcon />Analyze Transcript
                                    </button>
                                </div>
                            </div>
                            
                            {selectedEntry?.analysis && (
                                <div className="bg-[var(--color-background-card)] rounded-xl shadow-2xl shadow-black/20 p-6 border border-[var(--color-border)]">
                                    <h2 className="text-2xl font-bold border-b border-[var(--color-border)] pb-4 mb-6">Analysis Results</h2>
                                     <AnalysisResults analysis={selectedEntry.analysis} />
                                     <div className="space-y-6 pt-6 mt-6 border-t border-[var(--color-border)]">
                                        <div>
                                            <label htmlFor="tags" className="flex items-center gap-2 text-lg font-semibold mb-2"><TagIcon /> Tags</label>
                                            <input type="text" id="tags" placeholder="Add tags, comma-separated" value={tags.join(', ')}
                                                onChange={e => setTags(e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                                                onBlur={() => handleUpdateHistoryEntry({ id: selectedEntry.id, tags })} className="w-full bg-[var(--color-background-input)] border border-[var(--color-border)] rounded-lg p-3"/>
                                        </div>
                                        <div>
                                            <label htmlFor="notes" className="flex items-center gap-2 text-lg font-semibold mb-2"><FileTextIcon /> Notes</label>
                                            <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={() => handleUpdateHistoryEntry({ id: selectedEntry.id, notes })}
                                                placeholder="Add personal notes here..." className="w-full bg-[var(--color-background-input)] border border-[var(--color-border)] rounded-lg p-3 min-h-[100px]"/>
                                        </div>
                                        <div>
                                            <h3 className="flex items-center gap-2 text-lg font-semibold mb-2"><DownloadIcon /> Export</h3>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleExport('txt')} className="px-4 py-2 text-sm rounded-md bg-[var(--color-background-hover)] hover:opacity-80">Export .TXT</button>
                                                <button onClick={() => handleExport('csv')} className="px-4 py-2 text-sm rounded-md bg-[var(--color-background-hover)] hover:opacity-80">Export .CSV</button>
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
    };
    
    return (
        <div className="flex min-h-screen bg-[var(--color-background-base)] text-[var(--color-text-primary)] font-sans">
            <ApiKeyModal isOpen={isApiKeyModalOpen} onClose={() => { if(apiKey) dispatch({type: 'SET_API_KEY_MODAL_OPEN', payload: false}) }} onSave={handleApiKeySave} />
            <Sidebar activeView={activeView} setActiveView={setActiveView} />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                {renderContent()}
            </main>
        </div>
    );
}
