import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import apiService from '../services/apiService';

const VideoChat = () => {
  const { videoId } = useParams();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [videoStatus, setVideoStatus] = useState(null);
  const [error, setError] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoSummary, setVideoSummary] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check video status and initialize chat
    initializeChat();
    
    // Trigger mount animation
    setTimeout(() => setMounted(true), 100);
  }, [videoId]);

  const initializeChat = async () => {
    try {
      const status = await apiService.getVideoStatus(videoId);
      setVideoStatus(status);
      
      // Set title and summary from API
      if (status.title) {
        setVideoTitle(status.title);
        setTempTitle(status.title);
      }
      if (status.summary) {
        setVideoSummary(status.summary);
      }

      if (status.status === 'completed') {
        setMessages([
          {
            type: 'ai',
            content: 'Hello! I\'ve analyzed this video and I\'m ready to answer your questions about its content. You can ask me about:\n\n- **Key topics** and main themes\n- **Specific details** or timestamps\n- **Summaries** of particular sections\n- **Analysis** and insights\n\nWhat would you like to know?'
          }
        ]);
        setIsInitialized(true);
      } else if (status.status === 'processing') {
        setMessages([
          {
            type: 'ai',
            content: 'This video is still being processed. Please wait a moment...'
          }
        ]);
        // Poll for completion
        pollForCompletion();
      } else if (status.status === 'failed') {
        setError('Video processing failed. Please try processing the video again.');
      } else {
        setError('Video not found. Please process the video first.');
      }
    } catch (err) {
      setError('Failed to load video status. Please try again.');
    }
  };

  const pollForCompletion = () => {
    const interval = setInterval(async () => {
      try {
        const status = await apiService.getVideoStatus(videoId);
        if (status.status === 'completed') {
          clearInterval(interval);
          setMessages([
            {
              type: 'ai',
              content: 'Processing complete! I\'ve analyzed this video and I\'m ready to answer your questions about its content. You can ask me about:\n\n- **Key topics** and main themes\n- **Specific details** or timestamps\n- **Summaries** of particular sections\n- **Analysis** and insights\n\nWhat would you like to know?'
            }
          ]);
          setIsInitialized(true);
          setVideoStatus(status);
          
          // Update title and summary when processing completes
          if (status.title) {
            setVideoTitle(status.title);
            setTempTitle(status.title);
          }
          if (status.summary) {
            setVideoSummary(status.summary);
          }
        } else if (status.status === 'failed') {
          clearInterval(interval);
          setError('Video processing failed. Please try processing the video again.');
        }
      } catch (err) {
        clearInterval(interval);
        setError('Failed to check video status.');
      }
    }, 3000);

    // Stop polling after 5 minutes
    setTimeout(() => clearInterval(interval), 300000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !isInitialized) return;

    const userMessage = { type: 'user', content: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await apiService.sendChatMessage(videoId, currentMessage);
      const aiResponse = {
        type: 'ai',
        content: response.message
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (err) {
      const errorResponse = {
        type: 'ai',
        content: `Sorry, I encountered an error: ${err.message}. Please try again.`
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTitleEdit = () => {
    setIsEditingTitle(true);
  };

  const handleTitleSave = async () => {
    try {
      await apiService.updateVideoTitle(videoId, tempTitle);
      setVideoTitle(tempTitle);
      setIsEditingTitle(false);
    } catch (err) {
      console.error('Failed to update title:', err);
      // Reset to original title on error
      setTempTitle(videoTitle);
      setIsEditingTitle(false);
    }
  };

  const handleTitleCancel = () => {
    setTempTitle(videoTitle);
    setIsEditingTitle(false);
  };

  return (
    <div className="min-h-screen bg-[#161122] relative overflow-hidden" style={{fontFamily: '"Spline Sans", "Noto Sans", sans-serif'}}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-32 left-32 w-40 h-40 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-64 right-40 w-56 h-56 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-40 left-1/4 w-48 h-48 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <header className={`relative z-10 px-6 py-4 border-b border-[#2f2447] backdrop-blur-xl bg-[#161122]/80 transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-[#7847ea] to-[#a855f7] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300 group-hover:scale-105">
              <img src="/logo.ico" alt="VidiWise" className="w-6 h-6" />
            </div>
            <span className="text-white text-xl font-bold tracking-tight">VidiWise</span>
          </Link>
          <Link to="/dashboard" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-all duration-300 group">
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Back to Dashboard</span>
          </Link>
        </nav>
      </header>



      <div className={`relative z-10 flex h-[calc(100vh-140px)] gap-6 p-6 transition-all duration-1000 delay-400 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        {/* Chat Section - Left */}
        <div className="w-1/2 flex flex-col bg-gradient-to-br from-[#211a32] to-[#2a1d3a] rounded-3xl border border-[#433465] overflow-hidden shadow-2xl backdrop-blur-xl hover:shadow-purple-500/20 transition-all duration-300">
          {/* Video Title Section - Small and positioned above chat */}
          <div className="px-6 pt-4 pb-2 border-b border-[#433465]/50">
            {isEditingTitle ? (
              <div className="flex items-center space-x-3 animate-in fade-in duration-300">
                <input
                  type="text"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  className="flex-1 px-4 py-2 bg-[#161122] border border-[#433465] rounded-xl text-white text-lg font-semibold focus:outline-none focus:border-[#7847ea] focus:ring-2 focus:ring-[#7847ea]/20 transition-all duration-300"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleTitleSave();
                    if (e.key === 'Escape') handleTitleCancel();
                  }}
                  autoFocus
                />
                <button
                  onClick={handleTitleSave}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg text-sm"
                >
                  Save
                </button>
                <button
                  onClick={handleTitleCancel}
                  className="px-4 py-2 bg-gradient-to-r from-[#2f2447] to-[#433465] hover:from-[#3a2957] hover:to-[#4f3972] text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105 text-sm"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3 group">
                <h1 className="text-lg font-semibold text-white flex-1 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  {videoTitle || `Video ${videoId}`}
                </h1>
                <button
                  onClick={handleTitleEdit}
                  className="p-2 text-[#7847ea] hover:text-white hover:bg-[#7847ea]/10 rounded-lg transition-all duration-300 opacity-0 group-hover:opacity-100"
                  title="Edit Title"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          
          {/* Error Display */}
          {error && (
            <div className="p-6">
              <div className="bg-red-900/20 border border-red-500/50 rounded-2xl p-6 backdrop-blur-xl">
                <p className="text-red-300 text-sm font-medium mb-3">{error}</p>
                <Link to="/dashboard" className="inline-flex items-center space-x-2 text-[#7847ea] hover:text-white text-sm font-medium transition-colors duration-300">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Back to Dashboard</span>
                </Link>
              </div>
            </div>
          )}

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom duration-500`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div
                  className={`max-w-[85%] px-6 py-4 rounded-2xl leading-relaxed shadow-lg transition-all duration-300 hover:scale-[1.02] ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-[#7847ea] to-[#a855f7] text-white shadow-purple-500/25'
                      : 'bg-gradient-to-r from-[#1a1625] to-[#252030] text-gray-100 border border-[#433465] hover:border-[#7847ea]/30'
                  }`}
                >
                  <div className={`break-words text-sm ${
                    message.type === 'ai' ? 'text-left' : 'text-left'
                  }`}>
                    {message.type === 'ai' ? (
                      <ReactMarkdown 
                        className="markdown-content"
                        components={{
                          p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                          strong: ({children}) => <strong className="font-bold text-white">{children}</strong>,
                          em: ({children}) => <em className="italic">{children}</em>,
                          ul: ({children}) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                          ol: ({children}) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                          li: ({children}) => <li className="ml-2">{children}</li>,
                          h1: ({children}) => <h1 className="text-lg font-bold mb-2 text-white">{children}</h1>,
                          h2: ({children}) => <h2 className="text-base font-bold mb-2 text-white">{children}</h2>,
                          h3: ({children}) => <h3 className="text-sm font-bold mb-1 text-white">{children}</h3>,
                          code: ({children}) => <code className="bg-gray-600 px-1 py-0.5 rounded text-xs">{children}</code>,
                          blockquote: ({children}) => <blockquote className="border-l-2 border-purple-400 pl-3 italic">{children}</blockquote>
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    ) : (
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-in fade-in duration-500">
                <div className="bg-gradient-to-r from-[#1a1625] to-[#252030] border border-[#433465] text-gray-100 px-6 py-4 rounded-2xl shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin"></div>
                    <span className="text-sm font-medium">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
                      <div className="p-4 border-t border-[#433465] bg-[#2f2447]">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask me anything about this video..."
                className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm"
              />
              <button
                type="submit"
                disabled={isLoading || !isInitialized}
                                  className="px-6 py-3 bg-[#7847ea] hover:bg-[#6a40d4] disabled:bg-[#5a35c2] text-white font-semibold rounded-lg transition-colors text-sm"
              >
                Send
              </button>
            </form>
          </div>
        </div>

        {/* Video & Summary Section - Right */}
        <div className="w-1/2 flex flex-col gap-4">
          {/* YouTube Video - Top Right (Smaller) */}
                      <div className="h-64 bg-[#211a32] rounded-xl border border-[#433465] p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold text-lg">Video Player</h3>
              <span className="text-gray-400 text-sm">ID: {videoId}</span>
            </div>
            <div className="relative w-full h-40">
              <iframe
                className="absolute top-0 left-0 w-full h-full rounded-lg"
                src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
          </div>

          {/* Video Summary - Bottom Right (Larger) */}
                      <div className="flex-1 bg-[#211a32] rounded-xl border border-[#433465] p-4 overflow-hidden">
            <h3 className="text-white font-semibold text-lg mb-4">Video Summary</h3>
            <div className="overflow-y-auto h-full">
              {videoSummary ? (
                <div className="text-gray-300 text-sm leading-relaxed text-left">
                  <ReactMarkdown 
                    className="markdown-content text-left"
                    components={{
                      p: ({children}) => <p className="mb-3 last:mb-0 text-left">{children}</p>,
                      strong: ({children}) => <strong className="font-bold text-white">{children}</strong>,
                      em: ({children}) => <em className="italic">{children}</em>,
                      ul: ({children}) => <ul className="list-disc list-inside mb-3 space-y-1 text-left">{children}</ul>,
                      ol: ({children}) => <ol className="list-decimal list-inside mb-3 space-y-1 text-left">{children}</ol>,
                      li: ({children}) => <li className="ml-2 text-left">{children}</li>,
                      h1: ({children}) => <h1 className="text-xl font-bold mb-3 text-white text-left">{children}</h1>,
                      h2: ({children}) => <h2 className="text-lg font-bold mb-3 text-white text-left">{children}</h2>,
                      h3: ({children}) => <h3 className="text-base font-bold mb-2 text-white text-left">{children}</h3>,
                      code: ({children}) => <code className="bg-gray-600 px-1 py-0.5 rounded text-xs">{children}</code>,
                      blockquote: ({children}) => <blockquote className="border-l-2 border-purple-400 pl-3 italic mb-3 text-left">{children}</blockquote>
                    }}
                  >
                    {videoSummary}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    {videoStatus?.status === 'processing' ? (
                      <div className="space-y-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400 mx-auto"></div>
                        <p className="text-gray-400 text-sm">Generating summary...</p>
                      </div>
                    ) : videoStatus?.status === 'completed' ? (
                      <p className="text-gray-400 text-sm">Summary will appear here after processing</p>
                    ) : (
                      <p className="text-gray-400 text-sm">Process a video to see its summary</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoChat; 