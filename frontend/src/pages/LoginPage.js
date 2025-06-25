import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');

    try {
      const result = await loginWithGoogle();
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Google login failed');
      }
    } catch (err) {
      setError('Google login failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#161122] flex items-center justify-center px-6 relative overflow-hidden" style={{fontFamily: '"Spline Sans", "Noto Sans", sans-serif'}}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-32 left-32 w-40 h-40 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-64 right-40 w-56 h-56 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-40 left-1/4 w-48 h-48 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-20 right-1/3 w-32 h-32 bg-gradient-to-br from-green-500 to-cyan-500 rounded-full blur-3xl animate-pulse delay-3000"></div>
      </div>

      <div className={`max-w-md w-full relative z-10 transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        {/* Logo */}
        <div className={`text-center mb-8 transition-all duration-1000 delay-200 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <Link to="/" className="inline-flex items-center space-x-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-[#7847ea] to-[#a855f7] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300 group-hover:scale-110">
              <img src="/logo.ico" alt="VidiWise" className="w-8 h-8" />
            </div>
            <span className="text-white text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent group-hover:from-[#7847ea] group-hover:to-[#a855f7] transition-all duration-300">VidiWise</span>
          </Link>
        </div>

        {/* Login Form */}
        <div className={`bg-gradient-to-br from-[#211a32] to-[#2a1d3a] rounded-3xl p-8 border border-[#433465] shadow-2xl backdrop-blur-xl hover:shadow-purple-500/20 transition-all duration-1000 delay-400 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
          <h2 className="text-3xl font-bold text-white text-center mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Welcome Back</h2>
          
          {/* Demo Credentials */}
          <div className={`bg-gradient-to-r from-purple-900/30 to-purple-800/30 border border-purple-600/50 rounded-xl p-4 mb-6 backdrop-blur-sm animate-in slide-in-from-top duration-700 delay-600 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h3 className="text-purple-300 font-semibold mb-2 flex items-center text-left">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Demo Credentials:
            </h3>
            <p className="text-purple-200 text-sm text-left">Email: demo@vidiwise.com</p>
            <p className="text-purple-200 text-sm text-left">Password: demo123</p>
          </div>

          {error && (
            <div className="bg-gradient-to-r from-red-900/30 to-red-800/30 border border-red-600/50 rounded-xl p-4 mb-6 backdrop-blur-sm animate-in slide-in-from-top duration-300">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-300 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            className={`w-full bg-white hover:bg-gray-50 disabled:bg-gray-200 text-gray-900 py-3 px-4 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl mb-6 flex items-center justify-center space-x-3 border border-gray-200 transition-all duration-700 delay-700 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
          >
            {googleLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-gray-900"></div>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          <div className={`flex items-center mb-6 transition-all duration-700 delay-800 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="flex-1 border-t border-[#433465]"></div>
            <span className="px-4 text-gray-400 text-sm">Or continue with email</span>
            <div className="flex-1 border-t border-[#433465]"></div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className={`transition-all duration-700 delay-900 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative group">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#1a1625] border border-[#433465] rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#7847ea] focus:ring-2 focus:ring-[#7847ea]/20 transition-all duration-300 group-hover:border-[#5a3f7a]"
                  placeholder="Enter your email"
                  required
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#7847ea]/10 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>

            <div className={`transition-all duration-700 delay-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative group">
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#1a1625] border border-[#433465] rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#7847ea] focus:ring-2 focus:ring-[#7847ea]/20 transition-all duration-300 group-hover:border-[#5a3f7a]"
                  placeholder="Enter your password"
                  required
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#7847ea]/10 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>

            <div className={`flex items-center justify-between transition-all duration-700 delay-1100 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  className="h-4 w-4 text-[#7847ea] focus:ring-[#7847ea] border-[#433465] rounded bg-[#1a1625] transition-colors duration-300"
                />
                <label htmlFor="remember" className="ml-2 block text-sm text-gray-300">
                  Remember me
                </label>
              </div>
              <Link to="/forgot-password" className="text-sm text-[#7847ea] hover:text-white transition-colors duration-300 font-medium">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className={`w-full bg-gradient-to-r from-[#7847ea] to-[#a855f7] hover:from-[#6a40d4] hover:to-[#9333ea] disabled:from-[#5a35c2] disabled:to-[#7c3aed] text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-purple-500/25 animate-in slide-in-from-bottom duration-700 delay-1200 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                  <span>Signing In...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span>Sign In</span>
                </div>
              )}
            </button>
          </form>

          <div className={`mt-6 text-center transition-all duration-700 delay-1300 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <p className="text-gray-400">
              Don't have an account?{' '}
              <Link to="/signup" className="text-[#7847ea] hover:text-white font-semibold transition-colors duration-300">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 