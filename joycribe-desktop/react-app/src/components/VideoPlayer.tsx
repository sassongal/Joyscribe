import React from 'react';

interface VideoPlayerProps {
    src: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ src }) => {
    if (!src) return null;

    return (
        <div className="mt-4">
             <video controls src={src} className="w-full rounded-lg bg-black">
                Your browser does not support the video tag.
            </video>
        </div>
    );
};
