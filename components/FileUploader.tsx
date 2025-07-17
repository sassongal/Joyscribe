
import React, { useState, useCallback, useEffect } from 'react';
import { UploadCloudIcon, XCircleIcon } from './icons';

interface FileUploaderProps {
    onFileSelect: (file: File) => void;
    activeFileName?: string | null;
    onClear?: () => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect, activeFileName, onClear }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [localFileName, setLocalFileName] = useState<string | null>(null);
    const [localFileSize, setLocalFileSize] = useState<string | null>(null);

    const displayFileName = activeFileName || localFileName;

    const handleFile = useCallback((file: File | null) => {
        if (file) {
            onFileSelect(file);
            setLocalFileName(file.name);
            setLocalFileSize((file.size / 1024 / 1024).toFixed(2) + ' MB');
        }
    }, [onFileSelect]);

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleClear = () => {
      setLocalFileName(null);
      setLocalFileSize(null);
      if(onClear) {
        onClear();
      }
    }
    
    useEffect(() => {
        if (activeFileName) {
            setLocalFileName(null);
            setLocalFileSize(null);
        }
    }, [activeFileName]);

    return (
        <div>
            { !displayFileName ? (
                <label
                    htmlFor="file-upload"
                    className={`relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-[var(--color-background-input)] hover:bg-[var(--color-background-hover)] transition-colors duration-300 ${isDragging ? 'border-[var(--color-primary)]' : 'border-[var(--color-border)]'}`}
                >
                    <div 
                        className="absolute inset-0"
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    />
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloudIcon />
                        <p className="mb-2 text-sm text-[var(--color-text-secondary)]">
                            <span className="font-semibold text-[var(--color-primary-accent)]">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">Audio or Video (MP4, MOV, etc.)</p>
                    </div>
                    <input id="file-upload" type="file" className="hidden" accept="audio/*,video/*,.mp3,.wav,.m4a,.aac,.mp4,.mov,.webm,.avi" onChange={handleFileChange} />
                </label>
            ) : (
                 <div className="mt-4 text-sm bg-[var(--color-background-input)] rounded-lg p-3 flex justify-between items-center">
                    <div>
                        <p className="font-semibold text-[var(--color-text-secondary)] truncate">File: <span className="font-normal text-[var(--color-text-accent)]">{displayFileName}</span></p>
                        {localFileSize && (
                            <p className="font-semibold text-gray-300">Size: <span className="font-normal text-[var(--color-text-accent)]">{localFileSize}</span></p>
                        )}
                    </div>
                    <button onClick={handleClear} className="text-[var(--color-text-secondary)] hover:text-white" aria-label="Clear file">
                        <XCircleIcon className="h-6 w-6" />
                    </button>
                 </div>
            )}
        </div>
    );
};