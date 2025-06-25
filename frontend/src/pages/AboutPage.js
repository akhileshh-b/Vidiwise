import React from 'react';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-[#161122]" style={{fontFamily: '"Spline Sans", "Noto Sans", sans-serif'}}>
      {/* Header */}
      <header className="px-6 py-4">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-purple-900 font-bold text-sm">V</span>
            </div>
            <span className="text-white text-xl font-semibold">VidiWise</span>
          </Link>
          <Link
            to="/"
            className="text-gray-300 hover:text-white transition-colors"
          >
            ← Back to Home
          </Link>
        </nav>
      </header>

      {/* Content */}
      <div className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-white text-center mb-8">
            About VidiWise
          </h1>
          
          <div className="bg-[#211a32] rounded-xl p-8 border border-[#433465] mb-8">
            <h2 className="text-3xl font-semibold text-white mb-6">What is VidiWise?</h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              VidiWise transforms the way you interact with video content. Instead of passively watching 
              videos, you can now have intelligent conversations with them. Our AI-powered platform 
              analyzes video content, extracts key information, and enables you to ask questions, 
              get summaries, and explore insights through natural conversation.
            </p>
            <p className="text-gray-300 text-lg leading-relaxed">
              Whether you're a student trying to understand educational content, a researcher analyzing 
              video data, or a content creator looking for insights, VidiWise makes video content more 
              accessible and interactive than ever before.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-[#211a32] rounded-xl p-6 border border-[#433465]">
              <h3 className="text-2xl font-semibold text-white mb-4">How It Works</h3>
              <ul className="text-gray-300 space-y-3">
                <li className="flex items-start">
                  <span className="text-purple-400 mr-3">1.</span>
                  Paste any YouTube video URL
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-3">2.</span>
                  Our AI processes the video content
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-3">3.</span>
                  Start chatting with the video content
                </li>
              </ul>
            </div>

            <div className="bg-[#211a32] rounded-xl p-6 border border-[#433465]">
              <h3 className="text-2xl font-semibold text-white mb-4">Key Features</h3>
              <ul className="text-gray-300 space-y-3">
                <li className="flex items-start">
                  <span className="text-purple-400 mr-3">•</span>
                  Intelligent video analysis
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-3">•</span>
                  Real-time chat interface
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-3">•</span>
                  Content summarization
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-3">•</span>
                  Video history tracking
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Ready to Get Started?</h2>
            <Link
              to="/signup"
              className="inline-block bg-[#7847ea] hover:bg-[#6a40d4] text-white text-lg px-8 py-4 rounded-lg font-semibold transition-colors"
            >
              Try VidiWise Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage; 