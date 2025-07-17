import { contextBridge, ipcRenderer } from 'electron';
import { Analysis, AnalysisPersona, HistoryEntry } from '../react-app/src/types';

contextBridge.exposeInMainWorld('api', {
  // --- Settings ---
  getApiKey: (): Promise<string | null> => ipcRenderer.invoke('get-api-key'),
  setApiKey: (key: string): Promise<void> => ipcRenderer.invoke('set-api-key', key),
  getHardwareAccelSetting: (): Promise<boolean> => ipcRenderer.invoke('get-hardware-accel-setting'),
  setHardwareAccelSetting: (isEnabled: boolean): Promise<void> => ipcRenderer.invoke('set-hardware-accel-setting', isEnabled),

  // --- Core Functions ---
  transcribeFile: (filePath: string): Promise<string> => ipcRenderer.invoke('transcribe-file', filePath),
  analyzeTranscript: (args: {
    transcript: string;
    persona: AnalysisPersona;
    customEntitiesList: string;
    apiKey: string;
  }): Promise<Analysis> => ipcRenderer.invoke('analyze-transcript', args),

  // --- History Management ---
  getHistory: (): Promise<HistoryEntry[]> => ipcRenderer.invoke('get-history'),
  saveHistoryEntry: (entry: HistoryEntry): Promise<HistoryEntry[]> => ipcRenderer.invoke('save-history-entry', entry),
  updateHistoryEntry: (entry: Partial<HistoryEntry> & { id: number }): Promise<HistoryEntry[]> => ipcRenderer.invoke('update-history-entry', entry),
  deleteHistoryEntry: (id: number): Promise<HistoryEntry[]> => ipcRenderer.invoke('delete-history-entry', id),
});
