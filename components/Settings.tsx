
import React from 'react';
import { Theme, THEMES } from '../types';
import { SettingsIcon } from './icons';

interface SettingsProps {
    currentTheme: Theme;
    onThemeChange: (theme: Theme) => void;
}

export const Settings: React.FC<SettingsProps> = ({ currentTheme, onThemeChange }) => {
    return (
        <div className="animate-fade-in space-y-8">
            <header>
                <h2 className="text-4xl font-extrabold text-[var(--color-text-primary)] flex items-center gap-3">
                    <SettingsIcon className="h-10 w-10" />
                    Settings
                </h2>
                <p className="text-lg text-[var(--color-text-secondary)] mt-1">Manage your application preferences.</p>
            </header>

            <div className="bg-[var(--color-background-card)] p-6 rounded-xl shadow-2xl shadow-black/20 border border-[var(--color-border)]">
                <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-4">Appearance</h3>
                <p className="text-[var(--color-text-secondary)] mb-4">Choose a color theme for the application interface.</p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {THEMES.map(theme => (
                        <button 
                            key={theme.id} 
                            onClick={() => onThemeChange(theme)}
                            className={`p-4 rounded-lg border-2 transition-all duration-200 ${currentTheme.id === theme.id ? 'border-[var(--color-primary)]' : 'border-transparent hover:border-[var(--color-border)]'}`}
                        >
                            <div className="flex items-center justify-center gap-2 mb-3">
                                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: theme.colors['--color-primary'] }}></div>
                                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: theme.colors['--color-background-card'] }}></div>
                                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: theme.colors['--color-background-base'] }}></div>
                            </div>
                            <p className="font-semibold text-center text-[var(--color-text-primary)]">{theme.name}</p>
                        </button>
                    ))}
                </div>
            </div>

             <div className="bg-[var(--color-background-card)] p-6 rounded-xl shadow-2xl shadow-black/20 border border-[var(--color-border)] opacity-50">
                <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-4">Account Settings (Placeholder)</h3>
                <p className="text-[var(--color-text-secondary)] mb-4">Future settings for managing your account information.</p>
                <div className="flex gap-4">
                    <button disabled className="px-4 py-2 rounded-md bg-[var(--color-background-hover)] text-[var(--color-text-secondary)] cursor-not-allowed">Change Password</button>
                    <button disabled className="px-4 py-2 rounded-md bg-[var(--color-background-hover)] text-[var(--color-text-secondary)] cursor-not-allowed">Update Profile</button>
                </div>
            </div>
        </div>
    );
};
