import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#161122] overflow-hidden" style={{fontFamily: '"Spline Sans", "Noto Sans", sans-serif'}}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-80 h-80 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/3 w-72 h-72 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-20 right-20 w-56 h-56 bg-gradient-to-br from-green-500 to-cyan-500 rounded-full blur-3xl animate-pulse delay-3000"></div>
      </div>

      <div className="layout-container flex h-full grow flex-col relative z-10">
        <header className={`flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#2f2447] px-10 py-3 backdrop-blur-xl bg-[#161122]/80 transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
          <div className="flex items-center gap-4 text-white group">
            <div className="w-10 h-10 bg-gradient-to-br from-[#7847ea] to-[#a855f7] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300 group-hover:scale-110">
              <img src="/logo.ico" alt="VidiWise" className="w-6 h-6" />
            </div>
            <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">VidiWise</h2>
          </div>
          <div className="flex flex-1 justify-end gap-8">
            <div className="flex items-center gap-9">
              <Link className="text-white text-sm font-medium leading-normal hover:text-[#7847ea] transition-colors duration-300" to="/about">About</Link>
              <Link className="text-white text-sm font-medium leading-normal hover:text-[#7847ea] transition-colors duration-300" to="/contact">Contact</Link>
              <Link className="text-white text-sm font-medium leading-normal hover:text-[#7847ea] transition-colors duration-300" to="/privacy">Privacy Policy</Link>
            </div>
            <Link
              to="/login"
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-gradient-to-r from-[#7847ea] to-[#a855f7] hover:from-[#6a40d4] hover:to-[#9333ea] text-white text-sm font-bold leading-normal tracking-[0.015em] transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-purple-500/25"
            >
              <span className="truncate">Get Started</span>
            </Link>
          </div>
        </header>
        <div className="px-4 md:px-10 lg:px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1 w-full">
            <div className="@container">
              <div className="@[480px]:p-4">
                <div
                  className={`flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat @[480px]:gap-8 @[480px]:rounded-xl items-center justify-center p-4 backdrop-blur-xl border border-[#2f2447]/50 shadow-2xl transition-all duration-1000 delay-300 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}
                  style={{backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.6) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuCv0B2bLqLpWKuutPOTiAEqIyPs4DXqDqYT9hoRtUL0vej-c1MdgEX8q-uzmIoGOUxZX4pxiyAHcJMNUfoPjEIMtK2kSJRyW6Q-RT9IvUADvDQp3qpA6ty9NbAsRO1hA7YWElWPqGV14OmATEmt_k1FxqwtczpU49BixkMd5LCCSQ5oc4HXWGZ979kr7vc1sREre2bbOs42g5FG_MViu9xVoE8Q0XLfArDYSnx6JwICcE8H4YuklaWps12z4t6rUfiGKu1_GDkWZIs")'}}
                >
                  <div className="flex flex-col gap-2 text-center animate-in slide-in-from-bottom duration-1000 delay-500">
                    <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em] @[480px]:text-5xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em] bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                      Transform Videos into Interactive Chatbots
                    </h1>
                    <h2 className="text-white text-sm font-normal leading-normal @[480px]:text-base @[480px]:font-normal @[480px]:leading-normal opacity-90">
                      Paste a video link to chat with its content, including text, tables, and graphs.
                    </h2>
                  </div>
                  <Link
                    to="/login"
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 @[480px]:h-12 @[480px]:px-5 bg-gradient-to-r from-[#7847ea] to-[#a855f7] hover:from-[#6a40d4] hover:to-[#9333ea] text-white text-sm font-bold leading-normal tracking-[0.015em] @[480px]:text-base @[480px]:font-bold @[480px]:leading-normal @[480px]:tracking-[0.015em] transition-all duration-300 hover:scale-105 shadow-2xl hover:shadow-purple-500/30 animate-in slide-in-from-bottom duration-1000 delay-700"
                  >
                    <span className="truncate">Get Started</span>
                  </Link>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-10 px-4 py-10 @container">
              <div className={`flex flex-col gap-4 text-center transition-all duration-1000 delay-500 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
                <h1 className="text-white tracking-light text-[32px] font-bold leading-tight @[480px]:text-4xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em] bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Key Features
                </h1>
                <p className="text-white text-base font-normal leading-normal opacity-80">Explore the capabilities of VidiWise to enhance your video interaction.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <div className={`flex flex-1 gap-3 rounded-lg border border-[#433465] bg-gradient-to-br from-[#211a32] to-[#2a1d3a] p-6 flex-col backdrop-blur-xl shadow-xl hover:shadow-purple-500/20 transition-all duration-500 hover:scale-105 hover:border-[#7847ea]/50 group animate-in slide-in-from-left duration-1000 delay-700 ${mounted ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'}`}>
                  <div className="text-[#7847ea] group-hover:text-white transition-colors duration-300 group-hover:scale-110 transform" data-icon="ListBullets" data-size="24px" data-weight="regular">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M80,64a8,8,0,0,1,8-8H216a8,8,0,0,1,0,16H88A8,8,0,0,1,80,64Zm136,56H88a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Zm0,64H88a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16ZM44,52A12,12,0,1,0,56,64,12,12,0,0,0,44,52Zm0,64a12,12,0,1,0,12,12A12,12,0,0,0,44,116Zm0,64a12,12,0,1,0,12,12A12,12,0,0,0,44,180Z" />
                    </svg>
                  </div>
                  <div className="flex flex-col gap-1">
                    <h2 className="text-white text-base font-bold leading-tight group-hover:text-[#7847ea] transition-colors duration-300">Interactive Chatbot</h2>
                    <p className="text-[#a393c8] text-sm font-normal leading-normal group-hover:text-gray-300 transition-colors duration-300">
                      Engage with video content through an intelligent chatbot, extracting key information and insights.
                    </p>
                  </div>
                </div>
                <div className={`flex flex-1 gap-3 rounded-lg border border-[#433465] bg-gradient-to-br from-[#211a32] to-[#2a1d3a] p-6 flex-col backdrop-blur-xl shadow-xl hover:shadow-purple-500/20 transition-all duration-500 hover:scale-105 hover:border-[#7847ea]/50 group animate-in slide-in-from-right duration-1000 delay-700 ${mounted ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'}`}>
                  <div className="text-[#7847ea] group-hover:text-white transition-colors duration-300 group-hover:scale-110 transform" data-icon="Robot" data-size="24px" data-weight="regular">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M200,48H136V16a8,8,0,0,0-16,0V48H56A32,32,0,0,0,24,80V192a32,32,0,0,0,32,32H200a32,32,0,0,0,32-32V80A32,32,0,0,0,200,48Zm16,144a16,16,0,0,1-16,16H56a16,16,0,0,1-16-16V80A16,16,0,0,1,56,64H200a16,16,0,0,1,16,16Zm-52-56H92a28,28,0,0,0,0,56h72a28,28,0,0,0,0-56Zm-28,16v24H120V152ZM80,164a12,12,0,0,1,12-12h12v24H92A12,12,0,0,1,80,164Zm84,12H152V152h12a12,12,0,0,1,0,24ZM72,108a12,12,0,1,1,12,12A12,12,0,0,1,72,108Zm88,0a12,12,0,1,1,12,12A12,12,0,0,1,160,108Z" />
                    </svg>
                  </div>
                  <div className="flex flex-col gap-1">
                    <h2 className="text-white text-base font-bold leading-tight group-hover:text-[#7847ea] transition-colors duration-300">Content Summarization</h2>
                    <p className="text-[#a393c8] text-sm font-normal leading-normal group-hover:text-gray-300 transition-colors duration-300">Receive concise summaries of video content, highlighting essential points and takeaways.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="@container">
              <div className={`flex flex-col justify-end gap-6 px-4 py-10 @[480px]:gap-8 @[480px]:px-10 @[480px]:py-20 transition-all duration-1000 delay-900 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
                <div className="flex flex-col gap-2 text-center items-center">
                  <h1 className="text-white tracking-light text-[32px] font-bold leading-tight @[480px]:text-4xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em] bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Ready to Get Started?
                  </h1>
                </div>
                <div className="flex justify-center">
                  <div className="flex flex-col sm:flex-row gap-4 max-w-md w-full">
                    <Link
                      to="/signup"
                      className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 @[480px]:h-12 @[480px]:px-5 bg-gradient-to-r from-[#7847ea] to-[#a855f7] hover:from-[#6a40d4] hover:to-[#9333ea] text-white text-sm font-bold leading-normal tracking-[0.015em] @[480px]:text-base @[480px]:font-bold @[480px]:leading-normal @[480px]:tracking-[0.015em] flex-1 transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-purple-500/30"
                    >
                      <span className="truncate">Sign Up Free</span>
                    </Link>
                    <Link
                      to="/login"
                      className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 @[480px]:h-12 @[480px]:px-5 bg-gradient-to-r from-[#2f2447] to-[#433465] hover:from-[#3a2957] hover:to-[#4f3972] text-white text-sm font-bold leading-normal tracking-[0.015em] @[480px]:text-base @[480px]:font-bold @[480px]:leading-normal @[480px]:tracking-[0.015em] flex-1 transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-gray-500/20"
                    >
                      <span className="truncate">Log In</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <footer className={`flex justify-center transition-all duration-1000 delay-1100 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="flex max-w-[960px] flex-1 flex-col">
            <footer className="flex flex-col gap-6 px-5 py-10 text-center @container backdrop-blur-xl bg-[#161122]/50 border-t border-[#2f2447]">
              <div className="flex flex-wrap items-center justify-center gap-6 @[480px]:flex-row @[480px]:justify-around">
                <Link className="text-[#a393c8] text-base font-normal leading-normal min-w-40 hover:text-white transition-colors duration-300" to="/about">About</Link>
                <Link className="text-[#a393c8] text-base font-normal leading-normal min-w-40 hover:text-white transition-colors duration-300" to="/contact">Contact</Link>
                <Link className="text-[#a393c8] text-base font-normal leading-normal min-w-40 hover:text-white transition-colors duration-300" to="/privacy">Privacy Policy</Link>
              </div>
              <p className="text-[#a393c8] text-base font-normal leading-normal">© 2024 VidiWise. All rights reserved.</p>
            </footer>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage; 