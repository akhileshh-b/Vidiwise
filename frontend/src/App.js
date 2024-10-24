import React, { useState } from 'react';
import ShootingStars from './components/ShootingStars';
import VideoInput from './components/VideoInput';
import ChatInterface from './components/ChatInterface';
import EmbeddedVideo from './components/EmbeddedVideo';

function App() {
  const [videoId, setVideoId] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [processing, setProcessing] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d1d31] to-[#0c0d13] overflow-hidden">
      <ShootingStars />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {!showChat ? (
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-7xl font-bold text-white mb-6">
              VIDIWISE
            </h1>
            <p className="text-2xl text-gray-300 mb-12 max-w-2xl mx-auto">
              Analyze any video content, debug issues, and get intelligent insights.
            </p>
            
            <VideoInput 
              onVideoProcess={setVideoId} 
              onStartChat={setShowChat}
            />
            
            {processing && (
              <div className="mt-8">
                <div className="animate-pulse">
                  <p className="text-gray-400">Processing video...</p>
                </div>
                <button
                  onClick={() => setShowChat(true)}
                  className="mt-4 px-8 py-3 bg-indigo-500 text-white rounded-lg 
                           hover:bg-indigo-600 transition-colors duration-200"
                >
                  Start Chat
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            <ChatInterface videoId={videoId} />
            {videoId && <EmbeddedVideo videoId={videoId} />}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;