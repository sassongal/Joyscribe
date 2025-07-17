export enum Sentiment {
    Positive = 'Positive',
    Negative = 'Negative',
    Neutral = 'Neutral',
    Mixed = 'Mixed'
}

export enum AnalysisPersona {
    General = 'General Analyst',
    Sales = 'Sales Coach',
    Support = 'Technical Support Supervisor',
    CustomerService = 'Customer Service',
    Personal = 'Personal Chat',
}

export interface SalesCoachingInsights {
    overallRating: number;
    ratingJustification: string;
    strengths: string[];
    improvementAreas: string[];
    talkToListenRatio: string;
    objectionHandling: {
        objection: string;
        suggestedResponse: string;
    }[];
}


export interface SupportInsights {
    problemDescription: string;
    solutionSteps: string[];
    technicalTerms: string[];
    escalationNeeded: string;
    nextSteps: string[];
}


export interface Analysis {
    summary: string;
    sentiment: Sentiment;
    keywords: string[];
    topics: string[];
    customEntities: { entity: string; occurrences: string[] }[];
    salesCoachingInsights?: SalesCoachingInsights;
    supportInsights?: SupportInsights;
    suggestedTags?: string[];
    diarizedTranscript: string;
}

export interface HistoryEntry {
    id: number; // Using timestamp for simplicity
    fileName: string;
    transcript: string;
    analysis: Analysis;
    analysisPersona: AnalysisPersona;
    date: string;
    mediaType: 'audio' | 'video';
    notes?: string;
    tags?: string[];
    customEntitiesInput?: string;
    status: 'active' | 'trashed';
}

// --- Theme Types ---
export interface Theme {
    id: string;
    name: string;
    colors: {
        '--color-primary': string;
        '--color-primary-accent': string;
        '--color-background-base': string;
        '--color-background-card': string;
        '--color-background-input': string;
        '--color-background-hover': string;
        '--color-text-primary': string;
        '--color-text-secondary': string;
        '--color-text-accent': string;
        '--color-border': string;
        '--color-ring': string;
    }
}

export const THEMES: Theme[] = [
    {
        id: 'default-cyan',
        name: 'Default Cyan',
        colors: {
            '--color-primary': '#06b6d4', // cyan-500
            '--color-primary-accent': '#22d3ee', // cyan-400
            '--color-background-base': '#030712', // gray-950
            '--color-background-card': '#111827', // gray-900
            '--color-background-input': '#1f2937', // gray-800
            '--color-background-hover': '#374151', // gray-700
            '--color-text-primary': '#f3f4f6', // gray-100
            '--color-text-secondary': '#9ca3af', // gray-400
            '--color-text-accent': '#67e8f9', // cyan-300
            '--color-border': '#4b5563', // gray-600
            '--color-ring': '#0891b2', // cyan-600
        }
    },
    {
        id: 'crimson-night',
        name: 'Crimson Night',
        colors: {
            '--color-primary': '#dc2626', // red-600
            '--color-primary-accent': '#f87171', // red-400
            '--color-background-base': '#120303',
            '--color-background-card': '#1f1111',
            '--color-background-input': '#2e1919',
            '--color-background-hover': '#4a2a2a',
            '--color-text-primary': '#fee2e2',
            '--color-text-secondary': '#fca5a5',
            '--color-text-accent': '#fca5a5',
            '--color-border': '#5e2d2d',
            '--color-ring': '#b91c1c', // red-700
        }
    },
    {
        id: 'forest-green',
        name: 'Forest Green',
        colors: {
            '--color-primary': '#16a34a', // green-600
            '--color-primary-accent': '#4ade80', // green-400
            '--color-background-base': '#051203',
            '--color-background-card': '#111f11',
            '--color-background-input': '#192e19',
            '--color-background-hover': '#2a4a2a',
            '--color-text-primary': '#e2fee2',
            '--color-text-secondary': '#a5fca5',
            '--color-text-accent': '#bbf7d0', // green-200
            '--color-border': '#2d5e2d',
            '--color-ring': '#15803d', // green-700
        }
    },
     {
        id: 'royal-purple',
        name: 'Royal Purple',
        colors: {
            '--color-primary': '#9333ea', // purple-600
            '--color-primary-accent': '#c084fc', // purple-400
            '--color-background-base': '#0a0312',
            '--color-background-card': '#1a111f',
            '--color-background-input': '#2a192e',
            '--color-background-hover': '#432a4a',
            '--color-text-primary': '#f3e2fe',
            '--color-text-secondary': '#e9d5ff', // purple-200
            '--color-text-accent': '#d8b4fe', // purple-300
            '--color-border': '#582d5e',
            '--color-ring': '#7e22ce', // purple-700
        }
    },
];