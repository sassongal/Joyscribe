
import React, { useEffect, useState } from 'react';

interface VideoPlayerProps {
    file: File;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ file }) => {
    const [videoSrc, setVideoSrc] = useState<string>('');

    useEffect(() => {
        if (file) {
            const url = URL.createObjectURL(file);
            setVideoSrc(url);

            return () => {
                URL.revokeObjectURL(url);
            };
        }
    }, [file]);

    if (!file) return null;

    return (
        <div className="mt-4">
             <video controls src={videoSrc} className="w-full rounded-lg bg-black">
                Your browser does not support the video tag.
            </video>
        </div>
    );
};