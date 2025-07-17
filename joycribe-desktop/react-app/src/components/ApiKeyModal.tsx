import React, { useState } from 'react';
import { XCircleIcon } from './icons';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave }) => {
  const [key, setKey] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(key);
  };

  return (
    <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--color-background-card)] rounded-xl shadow-2xl shadow-black/20 p-8 border border-[var(--color-border)] max-w-lg w-full relative animate-fade-in">
        <button onClick={onClose} className="absolute top-4 right-4 text-[var(--color-text-secondary)] hover:text-white">
          <XCircleIcon className="h-6 w-6"/>
        </button>
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">Google Gemini API Key Required</h2>
        <p className="text-[var(--color-text-secondary)] mb-6">
          To use the analysis features of Joyscribe, please provide your Google Gemini API key. Your key is stored securely on your local machine and is never shared.
        </p>
        <div>
          <label htmlFor="api-key-input" className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-2 uppercase tracking-wider">
            Your API Key
          </label>
          <input
            id="api-key-input"
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="w-full bg-[var(--color-background-input)] border border-[var(--color-border)] rounded-lg p-3 text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-ring)] transition"
            placeholder="Enter your Gemini API key"
          />
        </div>
        <div className="mt-6">
          <button
            onClick={handleSave}
            disabled={!key.trim()}
            className="w-full px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[var(--color-primary)] hover:opacity-90 disabled:bg-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-950 focus:ring-[var(--color-ring)]"
          >
            Save and Continue
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-4 text-center">
            You can get a free key from Google AI Studio.
        </p>
      </div>
    </div>
  );
};
