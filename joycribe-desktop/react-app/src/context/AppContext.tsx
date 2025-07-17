import React, { createContext, useReducer, Dispatch } from 'react';
import { HistoryEntry, Theme, THEMES } from '../types';

// --- State and Actions ---
interface AppState {
  history: HistoryEntry[];
  theme: Theme;
  apiKey: string | null;
  isProcessing: boolean;
  progressMessage: string;
  error: string | null;
  isApiKeyModalOpen: boolean;
  isFirstRun: boolean;
  hardwareAccel: boolean;
}

type Action =
  | { type: 'INITIAL_LOAD'; payload: { history: HistoryEntry[]; apiKey: string | null; hardwareAccel: boolean; theme: Theme } }
  | { type: 'SET_HISTORY'; payload: HistoryEntry[] }
  | { type: 'SET_API_KEY'; payload: string | null }
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'SET_HARDWARE_ACCEL'; payload: boolean }
  | { type: 'START_PROCESSING'; payload: string }
  | { type: 'PROCESSING_SUCCESS' }
  | { type: 'PROCESSING_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_API_KEY_MODAL_OPEN'; payload: boolean }
  | { type: 'SET_IS_FIRST_RUN'; payload: boolean };


const initialState: AppState = {
  history: [],
  theme: THEMES[0],
  apiKey: null,
  isProcessing: false,
  progressMessage: '',
  error: null,
  isApiKeyModalOpen: false,
  isFirstRun: false,
  hardwareAccel: false,
};

// --- Reducer ---
const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'INITIAL_LOAD':
      return {
        ...state,
        history: action.payload.history,
        apiKey: action.payload.apiKey,
        hardwareAccel: action.payload.hardwareAccel,
        isApiKeyModalOpen: !action.payload.apiKey,
        isFirstRun: action.payload.history.length === 0,
        theme: action.payload.theme,
      };
    case 'SET_HISTORY':
      return { ...state, history: action.payload };
    case 'SET_API_KEY':
      return { ...state, apiKey: action.payload, isApiKeyModalOpen: !action.payload };
    case 'SET_THEME':
        localStorage.setItem('joycribeTheme_v1_desktop', action.payload.id);
        const root = document.documentElement;
        for (const [key, value] of Object.entries(action.payload.colors)) {
            root.style.setProperty(key, value);
        }
        return { ...state, theme: action.payload };
    case 'SET_HARDWARE_ACCEL':
        return { ...state, hardwareAccel: action.payload };
    case 'START_PROCESSING':
      return { ...state, isProcessing: true, progressMessage: action.payload, error: null };
    case 'PROCESSING_SUCCESS':
      return { ...state, isProcessing: false, progressMessage: '' };
    case 'PROCESSING_ERROR':
      return { ...state, isProcessing: false, progressMessage: '', error: action.payload };
    case 'CLEAR_ERROR':
        return { ...state, error: null };
    case 'SET_API_KEY_MODAL_OPEN':
      return { ...state, isApiKeyModalOpen: action.payload };
    case 'SET_IS_FIRST_RUN':
        return { ...state, isFirstRun: action.payload };
    default:
      return state;
  }
};

// --- Context ---
interface AppContextProps {
  state: AppState;
  dispatch: Dispatch<Action>;
}

export const AppContext = createContext<AppContextProps>({
  state: initialState,
  dispatch: () => null,
});

// --- Provider ---
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};
