import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';

const VerifyEmailPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [codeRequested, setCodeRequested] = useState(false);
  const [code, setCode] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const requestVerificationCode = async () => {
      if (!token) {
        setError('Invalid verification link');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`/api/auth/verify-email/${token}`);
        if (response.data.success) {
          setCodeRequested(true);
          setError('');
        }
      } catch (err) {
        console.error('Verification code request error:', err);
        setError(err.response?.data?.message || 'Failed to send verification code. Link may be invalid or expired.');
      } finally {
        setLoading(false);
      }
    };

    requestVerificationCode();
  }, [token]);

  const handleSubmitCode = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Please enter the verification code');
      return;
    }

    setSending(true);
    try {
      const response = await axios.post(`/api/auth/verify-email/${token}`, { code });
      if (response.data.success) {
        setSuccess(true);
        setError('');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      console.error('Code verification error:', err);
      setError(err.response?.data?.message || 'Code verification failed. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Mail className="text-primary-600" size={32} />
          </div>
          <h1 className="text-2xl font-bold mb-4">Preparing Verification...</h1>
          <p className="text-gray-600 mb-6">A code is being generated and sent to your email.</p>
          <div className="mt-8">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-primary-600 rounded-full animate-pulse"></div>
            </div>
          </div>
        </>
      );
    }

    if (success) {
      return (
        <>
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-green-600" size={32} />
          </div>
          <h1 className="text-2xl font-bold mb-4 text-green-600">Email Verified!</h1>
          <p className="text-gray-600 mb-6">Your email has been successfully verified. You can now log in.</p>
          <p className="text-sm text-gray-500 mb-6">Redirecting to login in 3 seconds...</p>
          <Link to="/login" className="inline-block btn btn-primary">Go to Login</Link>
        </>
      );
    }

    return (
      <>
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="text-primary-600" size={32} />
        </div>
        <h1 className="text-2xl font-bold mb-4">Verify Your Email</h1>
        {codeRequested ? (
          <>
            <p className="text-gray-600 mb-4">
              A 6-digit verification code has been sent to your email. Please enter it below.
            </p>
            <form onSubmit={handleSubmitCode} className="space-y-4">
              <input
                type="text"
                maxLength="6"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="input-field w-full"
                placeholder="Enter verification code"
                required
              />
              <button
                type="submit"
                disabled={sending}
                className="w-full btn btn-primary"
              >
                {sending ? 'Verifying...' : 'Verify Code'}
              </button>
            </form>
          </>
        ) : (
          <p className="text-gray-600 mb-4">Please use the link sent to your email to request a verification code.</p>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="mt-6 text-sm text-gray-500">
          <p>If the code doesn’t arrive in a few moments, check your spam folder.</p>
          <p>Then click the link in your email again to generate a new code.</p>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-32 pb-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="card p-8">
            <div className="text-center">{renderContent()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
