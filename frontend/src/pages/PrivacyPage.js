import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const PrivacyPage = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#161122] relative overflow-hidden" style={{fontFamily: '"Spline Sans", "Noto Sans", sans-serif'}}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-32 left-32 w-40 h-40 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-64 right-40 w-56 h-56 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-40 left-1/4 w-48 h-48 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-20 right-1/3 w-32 h-32 bg-gradient-to-br from-green-500 to-cyan-500 rounded-full blur-3xl animate-pulse delay-3000"></div>
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
            <Link to="/" className="text-gray-300 hover:text-white transition-colors duration-300 font-medium">
              Home
            </Link>
            <Link to="/about" className="text-gray-300 hover:text-white transition-colors duration-300 font-medium">
              About
            </Link>
            <Link 
              to="/login"
              className="px-4 py-2 bg-gradient-to-r from-[#7847ea] to-[#a855f7] hover:from-[#6a40d4] hover:to-[#9333ea] text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-purple-500/25"
            >
              Sign In
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] px-6">
        <div className={`max-w-2xl w-full text-center transition-all duration-1000 delay-300 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
          {/* Privacy Policy Icon */}
          <div className="w-24 h-24 bg-gradient-to-br from-[#7847ea] to-[#a855f7] rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-5xl font-bold text-white mb-6 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
            Privacy Policy
          </h1>

          {/* Coming Soon Message */}
          <div className="bg-gradient-to-br from-[#211a32] to-[#2a1d3a] rounded-3xl p-12 border border-[#433465] shadow-2xl backdrop-blur-xl">
            <div className="space-y-6">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-4 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Coming Soon
              </h2>
              
              <p className="text-gray-300 text-lg leading-relaxed mb-8">
                We're working hard to bring you a comprehensive privacy policy that clearly outlines how we protect and handle your data. 
                Your privacy and security are our top priorities.
              </p>

              <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-xl p-6">
                <p className="text-blue-300 text-sm leading-relaxed">
                  <strong>In the meantime:</strong> We follow industry-standard security practices and never share your personal information with third parties without your explicit consent.
                </p>
              </div>
            </div>
          </div>

          {/* Back to Home */}
          <div className="mt-8">
            <Link 
              to="/" 
              className="inline-flex items-center space-x-2 text-[#7847ea] hover:text-white font-semibold transition-colors duration-300 group"
            >
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage; 