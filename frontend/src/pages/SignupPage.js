import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { signup } = useAuth();
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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const result = await signup(formData.name, formData.email, formData.password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Signup failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#161122] flex items-center justify-center px-6 py-8 relative overflow-hidden" style={{fontFamily: '"Spline Sans", "Noto Sans", sans-serif'}}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-48 h-48 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-64 h-64 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/3 w-56 h-56 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-20 right-1/4 w-40 h-40 bg-gradient-to-br from-green-500 to-cyan-500 rounded-full blur-3xl animate-pulse delay-3000"></div>
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

        {/* Signup Form */}
        <div className={`bg-gradient-to-br from-[#211a32] to-[#2a1d3a] rounded-3xl p-8 border border-[#433465] shadow-2xl backdrop-blur-xl hover:shadow-purple-500/20 transition-all duration-1000 delay-400 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Create Account</h2>
            <p className="text-gray-400 text-sm">Join thousands of users transforming their video experience</p>
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
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className={`transition-all duration-700 delay-600 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative group">
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#1a1625] border border-[#433465] rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#7847ea] focus:ring-2 focus:ring-[#7847ea]/20 transition-all duration-300 group-hover:border-[#5a3f7a]"
                  placeholder="Enter your full name"
                  required
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#7847ea]/10 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>

            <div className={`transition-all duration-700 delay-700 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
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

            <div className={`transition-all duration-700 delay-800 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
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
                  placeholder="Create a password"
                  required
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#7847ea]/10 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>

            <div className={`transition-all duration-700 delay-900 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative group">
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#1a1625] border border-[#433465] rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#7847ea] focus:ring-2 focus:ring-[#7847ea]/20 transition-all duration-300 group-hover:border-[#5a3f7a]"
                  placeholder="Confirm your password"
                  required
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#7847ea]/10 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>

            <div className={`flex items-center transition-all duration-700 delay-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <input
                id="terms"
                type="checkbox"
                className="h-4 w-4 text-[#7847ea] focus:ring-[#7847ea] border-[#433465] rounded bg-[#1a1625] transition-colors duration-300"
                required
              />
              <label htmlFor="terms" className="ml-3 block text-sm text-gray-300">
                I agree to the{' '}
                <Link to="/privacy" className="text-[#7847ea] hover:text-white font-medium transition-colors duration-300">
                  Terms & Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r from-[#7847ea] to-[#a855f7] hover:from-[#6a40d4] hover:to-[#9333ea] disabled:from-[#5a35c2] disabled:to-[#7c3aed] text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-purple-500/25 animate-in slide-in-from-bottom duration-700 delay-1100 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                  <span>Creating Account...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <span>Create Account</span>
                </div>
              )}
            </button>
          </form>

          <div className={`mt-6 text-center transition-all duration-700 delay-1200 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-[#7847ea] hover:text-white font-semibold transition-colors duration-300">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage; 