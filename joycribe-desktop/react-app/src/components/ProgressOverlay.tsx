import React from 'react';
import { BrainCircuitIcon } from './icons';

interface ProgressOverlayProps {
    message: string;
}

export const ProgressOverlay: React.FC<ProgressOverlayProps> = ({ message }) => (
    <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-center p-4 rounded-xl">
        <div className="relative">
            <div className="absolute -inset-2 border-2 border-[var(--color-primary)]/30 rounded-full animate-spin [animation-duration:3s]"></div>
            <div className="relative w-24 h-24 bg-[var(--color-background-card)]/50 rounded-full flex items-center justify-center">
                <BrainCircuitIcon className="h-12 w-12 text-[var(--color-primary-accent)] animate-pulse" />
            </div>
        </div>
        <p className="mt-6 text-xl font-semibold text-white animate-pulse">{message}</p>
    </div>
);
