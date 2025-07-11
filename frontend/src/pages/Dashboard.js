import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/apiService';

const Dashboard = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [error, setError] = useState('');
  const [videoHistory, setVideoHistory] = useState([]);
  const [backendHealth, setBackendHealth] = useState(null);
  const [mounted, setMounted] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check backend health and load video history
    checkBackendHealth();
    loadVideoHistory();
    
    // Trigger mount animation
    setTimeout(() => setMounted(true), 100);
  }, []);

  const checkBackendHealth = async () => {
    const isHealthy = await apiService.healthCheck();
    setBackendHealth(isHealthy);
    if (!isHealthy) {
      setError('Backend is not running. Please start the backend server.');
    }
  };

  const loadVideoHistory = async () => {
    try {
      const result = await apiService.getProcessedVideos();
      const formattedVideos = result.videos.map(video => ({
        id: video.video_id,
        title: video.title || `Video ${video.video_id}`,
        processedAt: new Date().toISOString().split('T')[0], // Current date for now
        thumbnail: `https://img.youtube.com/vi/${video.video_id}/default.jpg`,
        status: video.status,
        transcriptAvailable: video.transcript_available,
        summary: video.summary
      }));
      setVideoHistory(formattedVideos);
    } catch (err) {
      console.error('Failed to load video history:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoUrl.trim()) return;

    setIsProcessing(true);
    setError('');
    setProcessingStatus('Starting video processing...');

    try {
      // Process the video
      const result = await apiService.processVideo(videoUrl);
      const videoId = result.video_id;
      
      setProcessingStatus('Video processing in progress...');
      
      // Poll for completion
      const pollInterval = setInterval(async () => {
        try {
          const status = await apiService.getVideoStatus(videoId);
          
          if (status.status === 'completed') {
            clearInterval(pollInterval);
            setProcessingStatus('Processing complete! Redirecting...');
            setTimeout(() => {
              navigate(`/video/${videoId}`);
            }, 1000);
          } else if (status.status === 'failed') {
            clearInterval(pollInterval);
            setError('Video processing failed. Please try again.');
            setIsProcessing(false);
            setProcessingStatus('');
          } else {
            setProcessingStatus('Processing video content...');
          }
        } catch (err) {
          clearInterval(pollInterval);
          setError('Error checking processing status.');
          setIsProcessing(false);
          setProcessingStatus('');
        }
      }, 2000);

      // Timeout after 5 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
        if (isProcessing) {
          setError('Processing timeout. Please try again.');
          setIsProcessing(false);
          setProcessingStatus('');
        }
      }, 300000);

    } catch (err) {
      setError(err.message || 'Failed to process video');
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  return (
    <div className="min-h-screen bg-[#161122] relative overflow-hidden" style={{fontFamily: '"Spline Sans", "Noto Sans", sans-serif'}}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-48 h-48 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/3 w-40 h-40 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <header className={`relative z-10 px-6 py-4 border-b border-[#2f2447] backdrop-blur-xl bg-[#161122]/80 transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-[#7847ea] to-[#a855f7] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300 group-hover:scale-105">
              <img src="/logo.ico" alt="VidiWise" className="w-6 h-6" />
            </div>
            <span className="text-white text-xl font-bold tracking-tight">VidiWise</span>
          </Link>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">{(user?.name || 'U')[0]}</span>
              </div>
              <span className="text-gray-300 font-medium">Welcome back, {user?.name || 'User'}!</span>
            </div>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 text-gray-300 hover:text-white hover:bg-[#2f2447] rounded-lg transition-all duration-300 font-medium"
            >
              Sign Out
            </button>
          </div>
        </nav>
      </header>

      <div className="relative z-10 px-6 py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Backend Health Status */}
          {backendHealth === false && (
            <div className={`bg-red-900/20 border border-red-500/50 rounded-2xl p-6 backdrop-blur-xl shadow-2xl transition-all duration-500 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></div>
                <p className="text-red-300 font-semibold text-lg">Backend Offline</p>
              </div>
              <p className="text-red-200/80 text-sm mt-3 leading-relaxed">
                Please start the backend server: <code className="bg-red-800/50 px-3 py-1 rounded-lg font-mono text-xs">cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload</code>
              </p>
            </div>
          )}
          
          {backendHealth === true && (
            <div className={`bg-emerald-900/20 border border-emerald-500/50 rounded-2xl p-6 backdrop-blur-xl shadow-2xl transition-all duration-500 delay-200 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50"></div>
                <p className="text-emerald-300 font-semibold text-lg">Backend Connected</p>
              </div>
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* URL Input Section */}
            <div className={`lg:col-span-2 bg-gradient-to-br from-[#211a32] to-[#2a1d3a] rounded-3xl p-8 border border-[#433465] shadow-2xl backdrop-blur-xl transition-all duration-700 delay-300 hover:shadow-purple-500/20 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-white mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Analyze a YouTube Video
                </h1>
                <p className="text-gray-400 text-lg leading-relaxed max-w-2xl mx-auto">
                  Transform any YouTube video into an interactive conversation. Paste a URL below to unlock AI-powered insights.
                </p>
              </div>

              {error && (
                <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-4 mb-6 animate-in slide-in-from-top duration-300">
                  <p className="text-red-300 text-sm font-medium">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative group">
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-6 py-4 bg-[#1a1625] border border-[#433465] rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-[#7847ea] focus:ring-2 focus:ring-[#7847ea]/20 transition-all duration-300 text-lg group-hover:border-[#5a3f7a]"
                    required
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#7847ea]/10 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
                
                <button
                  type="submit"
                  disabled={isProcessing || backendHealth === false}
                  className="w-full px-8 py-4 bg-gradient-to-r from-[#7847ea] to-[#a855f7] hover:from-[#6a40d4] hover:to-[#9333ea] disabled:from-[#5a35c2] disabled:to-[#7c3aed] text-white font-semibold rounded-2xl transition-all duration-300 text-lg shadow-2xl hover:shadow-purple-500/25 hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100"
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center space-x-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Processing Magic...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>Analyze Video</span>
                    </div>
                  )}
                </button>
              </form>

              {isProcessing && processingStatus && (
                <div className="mt-8 text-center animate-in fade-in duration-500">
                  <div className="inline-flex items-center space-x-3 bg-[#1a1625] px-6 py-3 rounded-full border border-[#433465]">
                    <div className="w-6 h-6 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin"></div>
                    <span className="text-gray-300 font-medium">{processingStatus}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Stats Card */}
            <div className={`bg-gradient-to-br from-[#211a32] to-[#2a1d3a] rounded-3xl p-6 border border-[#433465] shadow-2xl backdrop-blur-xl transition-all duration-700 delay-500 hover:shadow-purple-500/20 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <h3 className="text-xl font-bold text-white mb-6">Your Analytics</h3>
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#7847ea] mb-1">{videoHistory.length}</div>
                  <div className="text-gray-400 text-sm font-medium">Videos Analyzed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-400 mb-1">
                    {videoHistory.filter(v => v.status === 'completed').length}
                  </div>
                  <div className="text-gray-400 text-sm font-medium">Successfully Processed</div>
                </div>
                <div className="bg-gradient-to-r from-[#7847ea]/20 to-emerald-500/20 rounded-xl p-4 text-center">
                  <div className="text-lg font-semibold text-white mb-1">Ready to explore?</div>
                  <div className="text-gray-400 text-sm">Discover insights in your video content</div>
                </div>
              </div>
            </div>
          </div>

          {/* Video History */}
          <div className={`bg-gradient-to-br from-[#211a32] to-[#2a1d3a] rounded-3xl p-8 border border-[#433465] shadow-2xl backdrop-blur-xl transition-all duration-700 delay-700 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-white">Recent Videos</h2>
              <div className="flex items-center space-x-2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">Latest activity</span>
              </div>
            </div>
            
            {videoHistory.length > 0 ? (
              <div className="grid gap-4">
                {videoHistory.map((video, index) => (
                  <div
                    key={video.id}
                    className={`group flex items-center space-x-6 p-6 bg-gradient-to-r from-[#1a1625] to-[#252030] rounded-2xl border border-[#433465] hover:border-[#7847ea]/50 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-[#7847ea]/10 hover:scale-[1.02] animate-in slide-in-from-bottom duration-500`}
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => navigate(`/video/${video.id}`)}
                  >
                    <div className="relative overflow-hidden rounded-xl shadow-lg">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-20 h-14 object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold text-lg mb-1 truncate group-hover:text-[#7847ea] transition-colors duration-300 text-left">{video.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span className="flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>Processed on {video.processedAt}</span>
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${video.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {video.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-[#7847ea] group-hover:text-white transition-colors duration-300 group-hover:translate-x-1 transform">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-[#7847ea]/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-[#7847ea]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No videos analyzed yet</h3>
                <p className="text-gray-400 max-w-md mx-auto leading-relaxed">
                  Start your journey by analyzing your first video above. Transform any YouTube content into an interactive conversation!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 