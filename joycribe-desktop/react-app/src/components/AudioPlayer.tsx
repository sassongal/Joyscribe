import React from 'react';

interface AudioPlayerProps {
    src: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ src }) => {
    if (!src) return null;

    return (
        <div className="mt-4">
             <audio controls src={src} className="w-full">
                Your browser does not support the audio element.
            </audio>
        </div>
    );
};
