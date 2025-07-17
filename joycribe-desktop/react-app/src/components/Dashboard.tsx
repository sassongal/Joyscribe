import React from 'react';
import { HistoryEntry, Sentiment, AnalysisPersona } from '../types';
import { ChartBarIcon, TagsIcon } from './icons';

interface DashboardProps {
    history: HistoryEntry[];
}

const BarChart = ({ data, title }: { data: { label: string; value: number; color: string }[], title: string }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);
    return (
        <div className="bg-[var(--color-background-card)] p-6 rounded-xl shadow-2xl shadow-black/20 border border-[var(--color-border)]">
            <h4 className="text-xl font-bold text-[var(--color-text-primary)] mb-4">{title}</h4>
            <div className="space-y-3">
                {data.map(({ label, value, color }) => (
                    <div key={label} className="grid grid-cols-4 items-center gap-3 text-sm">
                        <span className="col-span-1 truncate text-[var(--color-text-secondary)] font-medium">{label}</span>
                        <div className="col-span-3 bg-[var(--color-background-input)] rounded-full h-8">
                            <div
                                className={`${color} h-8 rounded-full flex items-center justify-start px-3 transition-all duration-500`}
                                style={{ width: `${Math.max((value / maxValue) * 100, 0)}%` }}
                            >
                                <span className="font-bold text-white text-base">{value}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const Dashboard: React.FC<DashboardProps> = ({ history }) => {
    if (history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[50vh] text-gray-500 text-center bg-[var(--color-background-card)] rounded-xl shadow-lg border border-[var(--color-border)]">
                <ChartBarIcon className="h-16 w-16" />
                <h3 className="mt-4 text-2xl font-bold">Dashboard is Empty</h3>
                <p className="mt-2 text-md">Analyze some calls to see aggregated insights here.</p>
            </div>
        );
    }

    const sentimentCounts = history.reduce((acc, entry) => {
        if (entry.analysis) acc[entry.analysis.sentiment] = (acc[entry.analysis.sentiment] || 0) + 1;
        return acc;
    }, {} as Record<Sentiment, number>);
    
    const sentimentData = [
        { label: 'Positive', value: sentimentCounts.Positive || 0, color: 'bg-green-600' },
        { label: 'Negative', value: sentimentCounts.Negative || 0, color: 'bg-red-600' },
        { label: 'Neutral', value: sentimentCounts.Neutral || 0, color: 'bg-yellow-600' },
        { label: 'Mixed', value: sentimentCounts.Mixed || 0, color: 'bg-purple-600' },
    ];

    const personaCounts = history.reduce((acc, entry) => {
        if(entry.analysisPersona) acc[entry.analysisPersona] = (acc[entry.analysisPersona] || 0) + 1;
        return acc;
    }, {} as Record<AnalysisPersona, number>);

    const personaData = Object.entries(personaCounts).map(([label, value]) => ({
        label, value, color: 'bg-[var(--color-primary)]'
    })).sort((a,b) => b.value - a.value);

    const keywordCounts = history
        .flatMap(entry => entry.analysis?.keywords || [])
        .reduce((acc, keyword) => {
            const normalizedKeyword = keyword.trim().toLowerCase();
            if (normalizedKeyword) acc[normalizedKeyword] = (acc[normalizedKeyword] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

    const topKeywords = Object.entries(keywordCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);

    return (
        <div className="animate-fade-in space-y-8">
            <header>
                <h2 className="text-4xl font-extrabold text-[var(--color-text-primary)]">Dashboard</h2>
                <p className="text-lg text-[var(--color-text-secondary)] mt-1">Aggregated analytics from all processed calls.</p>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <div className="bg-[var(--color-background-card)] border border-[var(--color-border)] p-6 rounded-xl shadow-lg text-center">
                    <h3 className="text-base font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Total Analyses</h3>
                    <p className="text-5xl font-extrabold text-white mt-2">{history.length}</p>
                 </div>
                 <div className="bg-[var(--color-background-card)] border border-[var(--color-border)] p-6 rounded-xl shadow-lg text-center">
                    <h3 className="text-base font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Most Used Persona</h3>
                    <p className="text-2xl font-bold text-[var(--color-text-accent)] mt-2 truncate">{personaData.length > 0 ? personaData[0].label : 'N/A'}</p>
                 </div>
                 <div className="bg-green-900/30 border border-green-700/50 p-6 rounded-xl shadow-lg text-center">
                    <h3 className="text-base font-medium text-green-300 uppercase tracking-wider">Positive Calls</h3>
                    <p className="text-5xl font-extrabold text-white mt-2">{sentimentCounts.Positive || 0}</p>
                 </div>
                 <div className="bg-red-900/30 border border-red-700/50 p-6 rounded-xl shadow-lg text-center">
                    <h3 className="text-base font-medium text-red-300 uppercase tracking-wider">Negative Calls</h3>
                    <p className="text-5xl font-extrabold text-white mt-2">{sentimentCounts.Negative || 0}</p>
                 </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <BarChart data={sentimentData} title="Sentiment Distribution" />
                <BarChart data={personaData} title="Analysis Persona Usage" />

                <div className="lg:col-span-2 bg-[var(--color-background-card)] p-6 rounded-xl shadow-2xl shadow-black/20 border border-[var(--color-border)]">
                    <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-4 flex items-center gap-2"><TagsIcon className="h-6 w-6 text-blue-400" /> Top Keywords</h3>
                    {topKeywords.length > 0 ? (
                        <div dir="rtl" className="flex flex-wrap gap-3">
                            {topKeywords.map(([keyword, count]) => (
                                <div key={keyword} className="bg-blue-900/50 border border-blue-500/30 text-blue-300 py-1.5 px-4 rounded-full flex items-center gap-2 text-base">
                                    <span className="font-semibold">{keyword}</span>
                                    <span className="bg-blue-600 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full">{count}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No keywords found to display.</p>
                    )}
                </div>
            </div>
        </div>
    );
};
