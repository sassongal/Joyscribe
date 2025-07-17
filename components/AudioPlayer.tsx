
import React, { useEffect, useState } from 'react';

interface AudioPlayerProps {
    file: File;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ file }) => {
    const [audioSrc, setAudioSrc] = useState<string>('');

    useEffect(() => {
        if (file) {
            const url = URL.createObjectURL(file);
            setAudioSrc(url);

            return () => {
                URL.revokeObjectURL(url);
            };
        }
    }, [file]);

    if (!file) return null;

    return (
        <div className="mt-4">
             <audio controls src={audioSrc} className="w-full">
                Your browser does not support the audio element.
            </audio>
        </div>
    );
};