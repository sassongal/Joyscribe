import React from 'react';
import { HistoryEntry, Sentiment, AnalysisPersona } from '../types';
import { HistoryIcon, TrashIcon, SearchIcon, RefreshCwIcon } from './icons';

interface HistoryPanelProps {
    history: HistoryEntry[];
    onSelect: (entry: HistoryEntry) => void;
    onRerun: (entry: HistoryEntry) => void;
    onMoveToRecycleBin: (id: number) => void;
    searchTerm: string;
    onSearchChange: (term: string) => void;
    sentimentFilter: string;
    onSentimentFilterChange: (sentiment: string) => void;
    personaFilter: string;
    onPersonaFilterChange: (persona: string) => void;
    selectedId: number | null;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ 
    history, onSelect, onRerun, onMoveToRecycleBin, searchTerm, onSearchChange, 
    sentimentFilter, onSentimentFilterChange, personaFilter, onPersonaFilterChange, selectedId 
}) => {
    return (
        <div className="bg-[var(--color-background-card)] rounded-xl shadow-2xl shadow-black/20 p-6 flex flex-col h-full max-h-[95vh] border border-[var(--color-border)]">
            <div className="border-b border-[var(--color-border)] pb-4 mb-4">
                <div className="flex justify-between items-center ">
                    <h2 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                        <HistoryIcon />
                        History
                    </h2>
                </div>
                 <div className="mt-4">
                     <div className="relative">
                        <input
                            type="text"
                            placeholder="Search history..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full bg-[var(--color-background-input)] border border-[var(--color-border)] rounded-lg py-2 pl-10 pr-4 text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-ring)] transition duration-200"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="h-5 w-5 text-[var(--color-text-secondary)]" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        <select value={sentimentFilter} onChange={e => onSentimentFilterChange(e.target.value)} className="w-full bg-[var(--color-background-input)] border border-[var(--color-border)] rounded-lg p-2 text-sm text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-ring)] transition duration-200">
                            <option value="">All Sentiments</option>
                            {Object.values(Sentiment).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <select value={personaFilter} onChange={e => onPersonaFilterChange(e.target.value)} className="w-full bg-[var(--color-background-input)] border border-[var(--color-border)] rounded-lg p-2 text-sm text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-ring)] transition duration-200">
                            <option value="">All Personas</option>
                            {Object.values(AnalysisPersona).map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                 </div>
            </div>
            <div className="flex-grow overflow-y-auto pr-2 -mr-4">
                {history.length === 0 ? (
                    <div className="text-center text-gray-500 pt-10">
                        <p>No results found.</p>
                        <p className="text-sm">Try analyzing a file or adjusting filters.</p>
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {history.map(entry => (
                            <li key={entry.id} className={`relative p-3 rounded-lg bg-transparent hover:bg-[var(--color-background-hover)] transition-all duration-200 group ${selectedId === entry.id ? 'ring-2 ring-[var(--color-primary)]' : 'ring-1 ring-transparent hover:ring-[var(--color-border)]'}`}>
                                <button
                                    onClick={() => onSelect(entry)}
                                    className="w-full text-left"
                                >
                                    <p className="font-semibold text-[var(--color-text-accent)] truncate">{entry.fileName}</p>
                                    <p className="text-xs text-[var(--color-text-secondary)]">{entry.analysisPersona}</p>
                                    <p className="text-xs text-gray-500 mt-1">{entry.date}</p>
                                    {entry.tags && entry.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {entry.tags.slice(0, 3).map(tag => (
                                                <span key={tag} className="text-xs bg-purple-900/50 border border-purple-500/30 text-purple-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                    {tag}
                                                </span>
                                            ))}
                                            {entry.tags.length > 3 && <span className="text-xs text-purple-400">+{entry.tags.length - 3}</span>}
                                        </div>
                                    )}
                                </button>
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={(e) => { e.stopPropagation(); onRerun(entry); }} title="Re-run analysis" className="p-1.5 rounded-full bg-[var(--color-background-input)] text-[var(--color-text-secondary)] hover:bg-[var(--color-primary)] hover:text-white transition-all">
                                        <RefreshCwIcon className="h-4 w-4" />
                                    </button>
                                     <button onClick={(e) => { e.stopPropagation(); onMoveToRecycleBin(entry.id); }} title="Move to Recycle Bin" className="p-1.5 rounded-full bg-[var(--color-background-input)] text-[var(--color-text-secondary)] hover:bg-red-600 hover:text-white transition-all">
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};
