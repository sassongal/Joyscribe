import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Theme, THEMES } from '../types';
import { SettingsIcon } from './icons';

interface SettingsProps {
    currentTheme: Theme;
    onThemeChange: (theme: Theme) => void;
}

export const Settings: React.FC<SettingsProps> = ({ currentTheme, onThemeChange }) => {
    const { state, dispatch } = useContext(AppContext);
    const { apiKey, hardwareAccel } = state;
    
    const [apiKeyInput, setApiKeyInput] = useState('');
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [isHardwareAccelEnabled, setIsHardwareAccelEnabled] = useState(hardwareAccel);
    
    useEffect(() => {
        setApiKeyInput(apiKey || '');
        setIsHardwareAccelEnabled(hardwareAccel);
    }, [apiKey, hardwareAccel]);
    
    const handleApiKeySaveClick = () => {
        window.api.setApiKey(apiKeyInput);
        dispatch({ type: 'SET_API_KEY', payload: apiKeyInput });
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
    }

    const handleHardwareAccelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isEnabled = e.target.checked;
        setIsHardwareAccelEnabled(isEnabled);
        window.api.setHardwareAccelSetting(isEnabled);
        dispatch({ type: 'SET_HARDWARE_ACCEL', payload: isEnabled });
    }

    return (
        <div className="animate-fade-in space-y-8 max-w-4xl mx-auto">
            <header>
                <h2 className="text-4xl font-extrabold text-[var(--color-text-primary)] flex items-center gap-3">
                    <SettingsIcon className="h-10 w-10" />
                    Settings
                </h2>
                <p className="text-lg text-[var(--color-text-secondary)] mt-1">Manage your application preferences.</p>
            </header>

            <div className="bg-[var(--color-background-card)] p-6 rounded-xl shadow-2xl shadow-black/20 border border-[var(--color-border)]">
                <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-4">API & Performance</h3>
                 <div className="space-y-4">
                    <div>
                        <label htmlFor="api-key-input" className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-2 uppercase tracking-wider">
                            Google Gemini API Key
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                id="api-key-input"
                                type="password"
                                value={apiKeyInput}
                                onChange={(e) => setApiKeyInput(e.target.value)}
                                className="flex-grow w-full bg-[var(--color-background-input)] border border-[var(--color-border)] rounded-lg p-3 focus:ring-2 focus:ring-[var(--color-ring)]"
                                placeholder="Enter your Gemini API key"
                            />
                            <button 
                                onClick={handleApiKeySaveClick}
                                className="px-6 py-3 rounded-md text-white bg-[var(--color-primary)] hover:opacity-90 disabled:bg-gray-600 transition-colors"
                                disabled={apiKeyInput === apiKey || !apiKeyInput}
                            >
                                {saveSuccess ? 'Saved!' : 'Save'}
                            </button>
                        </div>
                    </div>
                     <div>
                        <label className="flex items-center justify-between cursor-pointer">
                            <span className="flex flex-col">
                                <span className="text-base font-semibold text-[var(--color-text-primary)]">Enable Hardware Acceleration</span>
                                <span className="text-sm text-[var(--color-text-secondary)]">Use GPU for faster transcription (Requires restart & compatible hardware: NVIDIA/Apple Silicon).</span>
                            </span>
                             <div className="relative inline-flex items-center">
                                <input type="checkbox" className="sr-only peer" checked={isHardwareAccelEnabled} onChange={handleHardwareAccelChange} />
                                <div className="w-11 h-6 bg-[var(--color-background-input)] rounded-full peer peer-focus:ring-2 peer-focus:ring-[var(--color-ring)] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
                            </div>
                        </label>
                    </div>
                </div>
            </div>

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
        </div>
    );
};