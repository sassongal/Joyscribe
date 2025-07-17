import React from 'react';
import { Analysis, Sentiment, SalesCoachingInsights, SupportInsights } from '../types';
import { 
    PositiveIcon, NegativeIcon, NeutralIcon, MixedIcon, LightbulbIcon, 
    ClipboardTextIcon, TagsIcon, BookmarkIcon, FingerprintIcon, ShieldOffIcon,
    TargetIcon, ArrowRightCircleIcon, BriefcaseIcon, AlertTriangleIcon, ListChecksIcon,
    CodeIcon, ArrowUpCircleIcon, TagIcon, ThumbsUpIcon, TrendingUpIcon, UsersIcon
} from './icons';

interface AnalysisResultsProps {
    analysis: Analysis | null;
}

const SentimentDisplay: React.FC<{ sentiment: Sentiment }> = ({ sentiment }) => {
    const sentimentConfig = {
        [Sentiment.Positive]: { icon: <PositiveIcon />, text: 'Positive', color: 'text-green-300', bgColor: 'bg-green-900/50 border-green-500/30' },
        [Sentiment.Negative]: { icon: <NegativeIcon />, text: 'Negative', color: 'text-red-300', bgColor: 'bg-red-900/50 border-red-500/30' },
        [Sentiment.Neutral]: { icon: <NeutralIcon />, text: 'Neutral', color: 'text-yellow-300', bgColor: 'bg-yellow-900/50 border-yellow-500/30' },
        [Sentiment.Mixed]: { icon: <MixedIcon />, text: 'Mixed', color: 'text-purple-300', bgColor: 'bg-purple-900/50 border-purple-500/30' },
    };

    const config = sentimentConfig[sentiment];
    if (!config) return null;

    return (
        <div className={`flex items-center gap-3 p-3 rounded-lg border ${config.bgColor}`}>
            <div className={`flex-shrink-0 ${config.color}`}>{config.icon}</div>
            <span className={`font-semibold ${config.color}`}>{config.text}</span>
        </div>
    );
};

const InsightCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; dir?: 'rtl' | 'ltr' }> = ({ title, icon, children, dir = 'rtl' }) => (
    <div dir={dir}>
        <h3 className="text-base font-semibold text-[var(--color-text-secondary)] flex items-center gap-2 mb-2 uppercase tracking-wider">{icon} {title}</h3>
        <div className="bg-[var(--color-background-input)] p-4 rounded-lg text-[var(--color-text-secondary)]">{children}</div>
    </div>
);

const InsightList: React.FC<{ items: string[] }> = ({ items }) => {
    if (!items || items.length === 0) return <p className="text-gray-500">None identified.</p>;
    return (
        <ul className="list-disc list-inside space-y-1">
            {items.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
    );
};

const RatingDial: React.FC<{ rating: number }> = ({ rating }) => {
    const percentage = (rating / 10) * 100;
    const hue = (percentage / 100) * 120; // 0=red, 120=green
    const color = `hsl(${hue}, 80%, 45%)`;
    
    return (
        <div className="flex flex-col items-center">
            <div className="relative w-32 h-32">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="var(--color-background-input)"
                        strokeWidth="3.8"
                    />
                    <path
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke={color}
                        strokeWidth="3.8"
                        strokeDasharray={`${percentage}, 100`}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-bold" style={{ color }}>{rating.toFixed(1)}</span>
                </div>
            </div>
             <div className="text-sm font-semibold uppercase tracking-wider mt-2" style={{color}}>Overall Score</div>
        </div>
    );
};

const SalesCoachingDisplay: React.FC<{ insights: SalesCoachingInsights }> = ({ insights }) => (
    <div className="space-y-4 bg-[var(--color-background-card)] border border-[var(--color-primary)]/20 p-4 rounded-xl">
        <h3 className="text-lg font-bold text-[var(--color-primary-accent)] text-center mb-4">Sales Coaching Analysis</h3>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 p-4 bg-[var(--color-background-input)] rounded-lg">
            <RatingDial rating={insights.overallRating} />
            <div className="flex-1 text-center md:text-left">
                <p className="text-lg font-semibold text-[var(--color-text-primary)]">Rating Justification</p>
                <p className="text-[var(--color-text-secondary)]">{insights.ratingJustification}</p>
            </div>
             <div className="text-center">
                <p className="text-lg font-semibold text-[var(--color-text-primary)]">Talk/Listen Ratio</p>
                <p className="text-2xl font-bold text-[var(--color-text-accent)]">{insights.talkToListenRatio}</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InsightCard title="Strengths" icon={<ThumbsUpIcon />}><InsightList items={insights.strengths} /></InsightCard>
            <InsightCard title="Areas for Improvement" icon={<TrendingUpIcon />}><InsightList items={insights.improvementAreas} /></InsightCard>
        </div>

        {insights.objectionHandling && insights.objectionHandling.length > 0 && (
             <InsightCard title="Objection Handling" icon={<ShieldOffIcon />}>
                 <div className="space-y-3">
                    {insights.objectionHandling.map(({ objection, suggestedResponse }, i) => (
                        <div key={i} className="bg-gray-800/50 p-3 rounded-lg">
                            <p className="font-semibold text-red-300">Objection: <span className="font-normal text-[var(--color-text-secondary)]">{objection}</span></p>
                            <p className="font-semibold text-green-300 mt-1">Suggested Response: <span className="font-normal text-[var(--color-text-secondary)]">{suggestedResponse}</span></p>
                        </div>
                    ))}
                </div>
            </InsightCard>
        )}
    </div>
);


const SupportInsightsDisplay: React.FC<{ insights: SupportInsights }> = ({ insights }) => (
    <div className="space-y-4 bg-[var(--color-background-card)] border border-green-500/20 p-4 rounded-xl">
        <h3 className="text-lg font-bold text-green-300 text-center mb-4">Support Supervisor Insights</h3>
        <InsightCard title="Problem Description" icon={<AlertTriangleIcon />}>
            <p className="whitespace-pre-wrap leading-relaxed">{insights.problemDescription || 'Not specified.'}</p>
        </InsightCard>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InsightCard title="Solution Steps" icon={<ListChecksIcon />}><InsightList items={insights.solutionSteps} /></InsightCard>
            <InsightCard title="Technical Terms" icon={<CodeIcon />}><InsightList items={insights.technicalTerms} /></InsightCard>
            <InsightCard title="Escalation Needed" icon={<ArrowUpCircleIcon />}>
                <p>{insights.escalationNeeded}</p>
            </InsightCard>
            <InsightCard title="Next Steps" icon={<ArrowRightCircleIcon />}><InsightList items={insights.nextSteps} /></InsightCard>
        </div>
    </div>
);


export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ analysis }) => {
    if (!analysis) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-gray-500 text-center">
                <LightbulbIcon />
                <p className="mt-4 text-lg">Your analysis results will appear here.</p>
                <p className="text-sm">Complete the steps above to get started.</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-6 animate-fade-in">
            <InsightCard title="Summary" icon={<ClipboardTextIcon />} dir="ltr">
                <p dir="rtl" className="whitespace-pre-wrap leading-relaxed">{analysis.summary}</p>
            </InsightCard>

             <InsightCard title="Conversation" icon={<UsersIcon className="h-6 w-6" />} dir="ltr">
                <pre dir="rtl" className="whitespace-pre-wrap leading-relaxed font-sans text-[var(--color-text-primary)] max-h-96 overflow-y-auto">{analysis.diarizedTranscript}</pre>
            </InsightCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <h3 className="text-base font-semibold text-[var(--color-text-secondary)] mb-2 uppercase tracking-wider">Sentiment</h3>
                    <SentimentDisplay sentiment={analysis.sentiment} />
                </div>
                {analysis.suggestedTags && analysis.suggestedTags.length > 0 && (
                    <div dir="rtl">
                        <h3 className="text-base font-semibold text-[var(--color-text-secondary)] flex items-center gap-2 mb-2 uppercase tracking-wider"><TagIcon /> Suggested Tags</h3>
                        <div className="flex flex-wrap gap-2">
                            {analysis.suggestedTags.map((tag, index) => (
                                <span key={index} className="bg-teal-900/50 border border-teal-500/30 text-teal-300 text-sm font-medium px-3 py-1 rounded-full">{tag}</span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {analysis.salesCoachingInsights && <SalesCoachingDisplay insights={analysis.salesCoachingInsights} />}
            {analysis.supportInsights && <SupportInsightsDisplay insights={analysis.supportInsights} />}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <InsightCard title="Topics" icon={<BookmarkIcon className="h-5 w-5" />}>
                     <div className="flex flex-wrap gap-2">
                        {analysis.topics.map((topic, index) => (
                            <span key={index} className="bg-purple-900/50 border border-purple-500/30 text-purple-300 text-sm font-medium px-3 py-1 rounded-full">{topic}</span>
                        ))}
                    </div>
                 </InsightCard>
                 <InsightCard title="Keywords" icon={<TagsIcon className="h-5 w-5" />}>
                     <div className="flex flex-wrap gap-2">
                        {analysis.keywords.map((keyword, index) => (
                            <span key={index} className="bg-blue-900/50 border border-blue-500/30 text-blue-300 text-sm font-medium px-3 py-1 rounded-full">{keyword}</span>
                        ))}
                    </div>
                 </InsightCard>
            </div>

            {analysis.customEntities && analysis.customEntities.filter(e => e.occurrences.length > 0).length > 0 && (
                <InsightCard title="Custom Entities Found" icon={<FingerprintIcon className="h-5 w-5" />}>
                     <div className="space-y-3">
                        {analysis.customEntities.map(({ entity, occurrences }) => (
                           occurrences.length > 0 && (
                             <div key={entity} dir="rtl" className="bg-gray-800/50 p-3 rounded-lg">
                                <p className="font-semibold text-teal-300">{entity}</p>
                                <ul className="list-disc list-inside mt-1 pl-2 text-gray-400">
                                    {occurrences.map((item, i) => (
                                        <li key={i}><span className="text-gray-300">{item}</span></li>
                                    ))}
                                </ul>
                            </div>
                           )
                        ))}
                    </div>
                </InsightCard>
            )}
        </div>
    );
};
