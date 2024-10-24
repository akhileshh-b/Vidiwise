import React, { useState } from 'react';

export default function VideoInput({ onStartChat, onVideoProcess }) {
    const [url, setUrl] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsProcessing(true);
        setError('');

        try {
            const response = await fetch('http://localhost:8080/process-video', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url }),
            });

            if (!response.ok) {
                throw new Error('Video processing failed');
            }

            const data = await response.json();
            onVideoProcess(data.video_id);

            // Start polling for status
            checkStatus(data.video_id);
        } catch (err) {
            setError(err.message);
            setIsProcessing(false);
        }
    };

    const checkStatus = async (videoId) => {
        try {
            const response = await fetch(`http://localhost:8080/video-status/${videoId}`);
            const data = await response.json();

            if (data.status === 'completed') {
                setIsProcessing(false);
                onStartChat(true);
            } else if (data.status === 'failed') {
                setError('Processing failed');
                setIsProcessing(false);
            } else {
                // Check again in 5 seconds
                setTimeout(() => checkStatus(videoId), 5000);
            }
        } catch (err) {
            setError('Status check failed');
            setIsProcessing(false);
        }
    };

return (
    <div className="glass-effect p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Enter YouTube URL"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition-all duration-200"
                    disabled={isProcessing}
                />
                {isProcessing && (
                    <div className="absolute right-3 top-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-primary"></div>
                    </div>
                )}
            </div>

            <button
                type="submit"
                disabled={isProcessing}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isProcessing ? 'Processing...' : 'Process Video'}
            </button>
        </form>
    </div>
);}
