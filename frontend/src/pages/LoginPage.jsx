import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import { LogIn, Mail, Lock } from 'lucide-react';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const { login, googleAuth } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const success = await login(formData.email, formData.password);
    
    if (success) {
      navigate('/dashboard');
    }
    
    setLoading(false);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotLoading(true);

    try {
      await axios.post('/api/auth/forgot-password', { email: forgotEmail });
      toast.success('If an account exists, a reset link has been sent to your email.');
      setShowForgotPassword(false);
      setForgotEmail('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to send reset email');
    }

    setForgotLoading(false);
  };

  const handleGoogleSuccess = async (response) => {
    setLoading(true);
    const result = await googleAuth(response.credential);
    if (result.success) {
      navigate('/dashboard');
    }
    setLoading(false);
  };

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleSuccess,
        });

        const buttonContainer = document.getElementById('google-login-button');
        if (buttonContainer) {
          window.google.accounts.id.renderButton(buttonContainer, {
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            width: '100%'
          });
        }
      }
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="card p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogIn className="text-primary-600" size={32} />
              </div>
              <h1 className="text-3xl font-display font-bold mb-2">Welcome Back</h1>
              <p className="text-gray-600">Login to your Feed Forward account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="spinner"></div>
                ) : (
                  <>
                    <LogIn size={20} />
                    <span>Login</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-4 text-right">
              <button
                type="button"
                onClick={() => setShowForgotPassword((prev) => !prev)}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Forgot password?
              </button>
            </div>

            {showForgotPassword && (
              <form onSubmit={handleForgotPassword} className="mt-4 rounded-lg border border-gray-200 p-4 bg-gray-50">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registered email address
                </label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="input-field mb-3"
                  placeholder="your@email.com"
                  required
                />
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full btn btn-outline"
                >
                  {forgotLoading ? 'Sending...' : 'Send reset link'}
                </button>
              </form>
            )}

            <div className="mt-6">
              {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
                <div id="google-login-button" className="w-full" />
              ) : (
                <button
                  type="button"
                  onClick={() => toast.error('Add your Google Client ID to enable Google sign-in.')}
                  className="w-full flex items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M21.6 12.23c0-.82-.07-1.6-.2-2.35H12v4.45h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.75 2.98-4.33 2.98-7.62Z" />
                    <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.43l-3.24-2.5c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.75-5.59-4.1H3.07v2.58A10 10 0 0 0 12 22Z" />
                    <path fill="#FBBC05" d="M6.41 13.93A6.02 6.02 0 0 1 6.41 10.07V7.49H3.07a10 10 0 0 0 0 12.88l3.34-2.44Z" />
                    <path fill="#EA4335" d="M12 6.04c1.47 0 2.79.5 3.83 1.48l2.87-2.87A9.96 9.96 0 0 0 12 2a10 10 0 0 0-8.93 5.49l3.34 2.44C7.2 7.79 9.4 6.04 12 6.04Z" />
                  </svg>
                  Continue with Google
                </button>
              )}
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link to="/signup" className="text-primary-600 hover:text-primary-700 font-medium">
                  Sign up here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
