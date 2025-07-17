import React from 'react';
import { LayoutGridIcon, ChartBarIcon, SettingsIcon, UserIcon, TrashIcon } from './icons';

const logoBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAH0A+gDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1VWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX2+9/j5+v/aAAwDAQACEQMRAD8A8qorcooAioqWigCKipcUYoAioqXFGKAIqKl20bajUDcorcooAhoqaiigCKipcUYoAioqXFGKAIqKlooAioqXFGKAIqKl20YoAioqaiigCKipcUu2gCKipdtG2gCKipdtG2gCKipdtG2gCKipdtG2gCKipdtG2gCKipdtG2gCKipdtGKAIqKlxS7aAIqKl20baAIqKl20baAIqKlxS7aAIqKl20baAIqKl20baAIqKl20baAIqKl20baAIqKl20baAIqKl20baAIqKl20baAIqKl20YoAip9v/r1PqKfToP9ctAEVFFFAH//Q8rorcooAioqWiigCKipcUYoAjxSYqXFGKAIqKl20baAIqKlxRtoAioqXbRtoAioqXbRtoAioqXbS4oAioqXFGKAIqKlxSYoAjop+KMUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAFPh/1y1HSxf6xfrQBHiiiigD//R8sorcooAioqWiigCKipcUYoAjxSgU7FGKAI8UuKkxRigBKKlooAioqXbS4oAjxSYqXbRtoAiop+KMUAFFP20baAGUU/bS7aAGUU/bRtoAZRT9tG2gBKKfijbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMxSxf6xfrTttOiXEg+tAEVFFFAH//S8rorcooAioqWiigCKipcUYoAjxSgU7FGKAI8UuKkxRigBKKlooAioqXbS4oAjxSYqXbRtoAiop+KMUAFFP20baAGUU/bS7aAGUU/bRtoAZRT9tG2gBKKfijbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMxSxf6xfrTttOiXEg+tAEVFFFAH//T8rorcooAioqWiigCKipcUYoAjxSgU7FGKAI8UuKkxRigBKKlooAioqXbS4oAjxSYqXbRtoAiop+KMUAFFP20baAGUU/bS7aAGUU/bRtoAZRT9tG2gBKKfijbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMxSxf6xfrTttOiXEg+tAEVFFFAH//U8rorcooAioqWiigCKipcUYoAjxSgU7FGKAI8UuKkxRigBKKlooAioqXbS4oAjxSYqXbRtoAiop+KMUAFFP20baAGUU/bS7aAGUU/bRtoAZRT9tG2gBKKfijbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMxSxf6xfrTttOiXEg+tAEVFFFAH//V8rorcooAioqWiigCKipcUYoAjxSgU7FGKAI8UuKkxRigBKKlooAioqXbS4oAjxSYqXbRtoAiop+KMUAFFP20baAGUU/bS7aAGUU/bRtoAZRT9tG2gBKKfijbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMxSxf6xfrTttOiXEg+tAEVFFFAH//W8rorcooAioqWiigCKipcUYoAjxSgU7FGKAI8UuKkxRigBKKlooAioqXbS4oAjxSYqXbRtoAiop+KMUAFFP20baAGUU/bS7aAGUU/bRtoAZRT9tG2gBKKfijbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMxSxf6xfrTttOiXEg+tAEVFFFAH//X8rorcooAioqWiigCKipcUYoAjxSgU7FGKAI8UuKkxRigBKKlooAioqXbS4oAjxSYqXbRtoAiop+KMUAFFP20baAGUU/bS7aAGUU/bRtoAZRT9tG2gBKKfijbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMxSxf6xfrTttOiXEg+tAEVFFFAH//Q8rorcooAioqWiigCKipcUYoAjxSgU7FGKAI8UuKkxRigBKKlooAioqXbS4oAjxSYqXbRtoAiop+KMUAFFP20baAGUU/bS7aAGUU/bRtoAZRT9tG2gBKKfijbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMxSxf6xfrTttOiXEg+tAEVFFFAH//R8sorcooAioqWiigCKipcUYoAjxSgU7FGKAI8UuKkxRigBKKlooAioqXbS4oAjxSYqXbRtoAiop+KMUAFFP20baAGUU/bS7aAGUU/bRtoAZRT9tG2gBKKfijbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMxSxf6xfrTttOiXEg+tAEVFFFAH//S8rorcooAioqWiigCKipcUYoAjxSgU7FGKAI8UuKkxRigBKKlooAioqXbS4oAjxSYqXbRtoAiop+KMUAFFP20baAGUU/bS7aAGUU/bRtoAZRT9tG2gBKKfijbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMxSxf6xfrTttOiXEg+tAEVFFFAH//T8sorcooAioqWiigCKipcUYoAjxSgU7FGKAI8UuKkxRigBKKlooAioqXbS4oAjxSYqXbRtoAiop+KMUAFFP20baAGUU/bS7aAGUU/bRtoAZRT9tG2gBKKfijbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMxSxf6xfrTttOiXEg+tAEVFFFAH//U8rorcooAioqWiigCKipcUYoAjxSgU7FGKAI8UuKkxRigBKKlooAioqXbS4oAjxSYqXbRtoAiop+KMUAFFP20baAGUU/bS7aAGUU/bRtoAZRT9tG2gBKKfijbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMxSxf6xfrTttOiXEg+tAEVFFFAH//V8rorcooAioqWiigCKipcUYoAjxSgU7FGKAI8UuKkxRigBKKlooAioqXbS4oAjxSYqXbRtoAiop+KMUAFFP20baAGUU/bS7aAGUU/bRtoAZRT9tG2gBKKfijbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMxSxf6xfrTttOiXEg+tAEVFFFAH//W8rorcooAioqWiigCKipcUYoAjxSgU7FGKAI8UuKkxRigBKKlooAioqXbS4oAjxSYqXbRtoAiop+KMUAFFP20baAGUU/bS7aAGUU/bRtoAZRT9tG2gBKKfijbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMxSxf6xfrTttOiXEg+tAEVFFFAH//X8rorcooAioqWiigCKipcUYoAjxSgU7FGKAI8UuKkxRigBKKlooAioqXbS4oAjxSYqXbRtoAiop+KMUAFFP20baAGUU/bS7aAGUU/bRtoAZRT9tG2gBKKfijbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMop+2jbQAyin7aNtADKKfto20AMxSxf6xfrTttOiXEg+tAEVFFFAH//Z';

interface SidebarProps {
    activeView: 'analyzer' | 'dashboard' | 'recycleBin' | 'settings';
    setActiveView: (view: 'analyzer' | 'dashboard' | 'recycleBin' | 'settings') => void;
}

const NavLink: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-base font-semibold transition-colors duration-200 ${
            isActive ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary-accent)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-background-hover)] hover:text-[var(--color-text-primary)]'
        }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

const UserProfile: React.FC = () => (
    <div className="mt-auto p-3 bg-[var(--color-background-input)]/50 rounded-lg border border-[var(--color-border)]">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
                <UserIcon className="h-6 w-6 text-white" />
            </div>
            <div className="flex-grow">
                <p className="font-semibold text-[var(--color-text-primary)] text-sm">Local User</p>
                <p className="text-xs text-[var(--color-text-secondary)]">Joyscribe Desktop</p>
            </div>
        </div>
    </div>
);

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
    return (
        <aside className="w-64 bg-[var(--color-background-card)] p-4 flex-shrink-0 flex flex-col border-r border-[var(--color-border)]">
            <div className="flex flex-col items-center text-center gap-2 py-4">
                <img src={logoBase64} alt="Joyscribe Logo" className="h-16 w-16" />
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Joyscribe</h1>
                    <p className="text-xs text-[var(--color-text-secondary)]" dir="rtl">מערכת לניהול תוצאות שיחות</p>
                </div>
            </div>

            <nav className="flex-grow mt-6 space-y-2">
                <NavLink 
                    icon={<LayoutGridIcon className="h-5 w-5" />} 
                    label="Analyzer" 
                    isActive={activeView === 'analyzer'} 
                    onClick={() => setActiveView('analyzer')} 
                />
                <NavLink 
                    icon={<ChartBarIcon className="h-5 w-5" />} 
                    label="Dashboard" 
                    isActive={activeView === 'dashboard'} 
                    onClick={() => setActiveView('dashboard')} 
                />
                 <NavLink 
                    icon={<TrashIcon className="h-5 w-5" />} 
                    label="Recycle Bin" 
                    isActive={activeView === 'recycleBin'} 
                    onClick={() => setActiveView('recycleBin')} 
                />
                 <NavLink 
                    icon={<SettingsIcon className="h-5 w-5" />} 
                    label="Settings" 
                    isActive={activeView === 'settings'} 
                    onClick={() => setActiveView('settings')} 
                />
            </nav>

            <UserProfile />
        </aside>
    );
};
