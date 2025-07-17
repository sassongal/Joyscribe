import React from 'react';
import { HistoryEntry } from '../types';
import { TrashIcon, Undo2 } from './icons';

interface RecycleBinProps {
    history: HistoryEntry[];
    onRestore: (id: number) => void;
    onDelete: (id: number) => void;
    onEmpty: () => void;
}

export const RecycleBin: React.FC<RecycleBinProps> = ({ history, onRestore, onDelete, onEmpty }) => {
    return (
        <div className="bg-[var(--color-background-card)] rounded-xl shadow-2xl shadow-black/20 p-6 flex flex-col h-full max-h-[95vh] border border-[var(--color-border)] animate-fade-in">
            <div className="border-b border-[var(--color-border)] pb-4 mb-4">
                <div className="flex justify-between items-center ">
                    <h2 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                        <TrashIcon className="h-6 w-6"/>
                        Recycle Bin
                    </h2>
                    {history.length > 0 && (
                        <button
                            onClick={onEmpty}
                            className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 transition-colors"
                            aria-label="Empty Recycle Bin"
                        >
                            <TrashIcon />
                            Empty Recycle Bin
                        </button>
                    )}
                </div>
                 <p className="text-sm text-[var(--color-text-secondary)] mt-2">Items here are marked for deletion.</p>
            </div>
            <div className="flex-grow overflow-y-auto pr-2 -mr-4">
                {history.length === 0 ? (
                    <div className="text-center text-gray-500 pt-16">
                        <TrashIcon className="h-12 w-12 mx-auto" />
                        <p className="mt-4 text-lg font-semibold">The Recycle Bin is empty.</p>
                        <p className="text-sm">Deleted items will appear here.</p>
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {history.map(entry => (
                            <li key={entry.id} className="relative p-3 rounded-lg bg-[var(--color-background-input)]/50 ring-1 ring-transparent hover:ring-[var(--color-border)] transition-all duration-200 group flex justify-between items-center">
                                <div className="text-left">
                                    <p className="font-semibold text-[var(--color-text-primary)] truncate">{entry.fileName}</p>
                                    <p className="text-xs text-[var(--color-text-secondary)] mt-1">{entry.date}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => onRestore(entry.id)} title="Restore" className="p-2 rounded-full bg-[var(--color-background-hover)] text-green-400 hover:bg-green-600 hover:text-white transition-all">
                                        <Undo2 className="h-4 w-4" />
                                    </button>
                                     <button onClick={() => onDelete(entry.id)} title="Delete Permanently" className="p-2 rounded-full bg-[var(--color-background-hover)] text-red-400 hover:bg-red-600 hover:text-white transition-all">
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
