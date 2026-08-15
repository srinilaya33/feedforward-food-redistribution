import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import { UserPlus, Mail, Lock, User, Car, MapPin } from 'lucide-react';

const SignupPage = () => {
  const [activeTab, setActiveTab] = useState('signup');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    vehicleInfo: '',
    location: '',
    donorLocation: '',
    ngoLocation: '',
    ngoNumberOfPeople: '',
    organizationName: '',
    registrationNumber: '',
    organizationType: '',
  });
  const [loading, setLoading] = useState(false);
  const [volunteerPin, setVolunteerPin] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);
  const [googleVerified, setGoogleVerified] = useState(false);
  const [googleVerifiedMessage, setGoogleVerifiedMessage] = useState('');
  const { signup, googleVerify } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const getLiveLocation = () => {
    setGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // For now, store as string; in production use reverse geocoding
          const locationStr = `Lat: ${latitude.toFixed(4)}, Long: ${longitude.toFixed(4)}`;
          setFormData(prev => ({
            ...prev,
            [formData.role === 'donor' ? 'donorLocation' : 'ngoLocation']: locationStr
          }));
          setGettingLocation(false);
          alert('Location captured! You can refine it manually if needed.');
        },
        (error) => {
          setGettingLocation(false);
          alert('Unable to get location. Please enable location services.');
          console.error(error);
        }
      );
    }
  };

  const handleGoogleSuccess = async (response) => {
    setLoading(true);
    const result = await googleVerify(response.credential);
    if (result.success) {
      setFormData(prev => ({
        ...prev,
        email: result.email,
        name: result.name || prev.name
      }));
      setGoogleVerified(true);
      setGoogleVerifiedMessage(result.message);
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  const handleGoogleClick = () => {
    if (!window.google?.accounts?.id) {
      toast.error('Google SDK is not ready yet. Please try again in a moment.');
      return;
    }
    window.google.accounts.id.prompt();
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
          auto_select: false,
        });
      }
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    if (!formData.role) {
      alert('Please select a role');
      return;
    }

    if (formData.role === 'volunteer' && !formData.vehicleInfo) {
      alert('Vehicle information is required for volunteers');
      return;
    }

    if (formData.role === 'foodChecker' && !formData.location) {
      alert('Inspection location is required for Food Quality Checkers');
      return;
    }

    if (formData.role === 'donor' && !formData.donorLocation) {
      alert('Location is required for donors');
      return;
    }

    if (formData.role === 'ngo' && !formData.ngoLocation) {
      alert('Location is required for NGOs');
      return;
    }

    if (formData.role === 'ngo' && !formData.ngoNumberOfPeople) {
      alert('Number of people is required for NGOs');
      return;
    }

    setLoading(true);
    
    const result = await signup({
      ...formData,
      isGoogleSignup: googleVerified
    });

    if (result.success) {
      if (result.volunteerPin) {
        setVolunteerPin(result.volunteerPin);

        if (result.requiresVerification) {
          // Keep user on success screen until they verify
          return setLoading(false);
        }

        setTimeout(() => {
          navigate('/dashboard');
        }, 5000);
        return setLoading(false);
      }

      if (result.requiresVerification) {
        navigate('/login');
      } else {
        navigate('/dashboard');
      }
    }

    setLoading(false);
  };

  if (volunteerPin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card p-8 max-w-md mx-4">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="text-green-600" size={40} />
            </div>
            <h2 className="text-2xl font-bold mb-4">Registration Successful!</h2>
            <div className="bg-primary-50 border-2 border-primary-500 rounded-lg p-6 mb-4">
              <p className="text-sm text-gray-600 mb-2">Your Volunteer PIN:</p>
              <p className="text-4xl font-bold text-primary-600">{volunteerPin}</p>
            </div>
            <p className="text-gray-600 mb-4">
              Please save this PIN for identification purposes. You will be redirected to your dashboard shortly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="card p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="text-primary-600" size={32} />
              </div>
              <h1 className="text-3xl font-display font-bold mb-2">Create Account</h1>
              <p className="text-gray-600">Join Feed Forward and make a difference</p>
              {googleVerified && (
                <p className="mt-3 text-sm text-green-600">
                  Email verified by Google: you can now complete signup with your role and password.
                </p>
              )}
              <div className="mt-6 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className={`py-3 rounded-lg font-medium transition-colors ${
                    activeTab === 'signup'
                      ? 'border-b-2 border-primary-500 text-primary-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('signup')}
                >
                  Sign Up
                </button>
                <button
                  type="button"
                  className={`py-3 rounded-lg font-medium transition-colors ${
                    activeTab === 'login'
                      ? 'border-b-2 border-primary-500 text-primary-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => navigate('/login')}
                >
                  Login
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

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
                    readOnly={googleVerified}
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
                    placeholder="Create a strong password"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="Re-enter password"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="">Select role</option>
                  <option value="donor">Donor</option>
                  <option value="volunteer">Volunteer</option>
                  <option value="foodChecker">Food Quality Checker</option>
                  <option value="ngo">NGO (Orphanage/Old-Age Home)</option>
                </select>
              </div>

              {formData.role === 'volunteer' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800 mb-3 font-medium">
                    ⚠️ Volunteer Requirements: You must have your own vehicle for food pickup and delivery.
                  </p>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Information
                  </label>
                  <div className="relative">
                    <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      name="vehicleInfo"
                      value={formData.vehicleInfo}
                      onChange={handleChange}
                      className="input-field pl-10"
                      placeholder="e.g., Car - Toyota Camry 2020"
                      required={formData.role === 'volunteer'}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    A unique volunteer PIN will be generated upon registration.
                  </p>
                </div>
              )}

              {formData.role === 'foodChecker' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800 mb-3 font-medium">
                    ℹ️ As a Food Quality Checker, you will inspect all food donations at a dedicated location before they are distributed.
                  </p>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Inspection Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="input-field pl-10"
                      placeholder="e.g., 123 Main St, Downtown Center"
                      required={formData.role === 'foodChecker'}
                    />
                  </div>
                </div>
              )}

              {formData.role === 'donor' && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="text-sm text-orange-800 mb-3 font-medium">
                    📍 Donor Location: Specify where your food donation is located for volunteer pickup.
                  </p>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pickup Location
                  </label>
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={getLiveLocation}
                      disabled={gettingLocation}
                      className="w-full btn btn-outline text-sm py-2 bg-blue-50 hover:bg-blue-100"
                    >
                      {gettingLocation ? '📍 Getting location...' : '📍 Use Live Location'}
                    </button>
                    <input
                      type="text"
                      name="donorLocation"
                      value={formData.donorLocation}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Enter or refine location (e.g., 123 Main St, Apt 5)"
                      required={formData.role === 'donor'}
                    />
                  </div>
                </div>
              )}

              {formData.role === 'ngo' && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-4">
                  <p className="text-sm text-purple-800 mb-3 font-medium">
                    🏢 NGO Information: Please provide your organization details. You'll be able to request large donations (≥50 packets).
                  </p>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organization Name
                    </label>
                    <input
                      type="text"
                      name="organizationName"
                      value={formData.organizationName || ''}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="e.g., Hope Orphanage"
                      required={formData.role === 'ngo'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Registration Number
                    </label>
                    <input
                      type="text"
                      name="registrationNumber"
                      value={formData.registrationNumber || ''}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="e.g., ORG-2024-001"
                      required={formData.role === 'ngo'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organization Type
                    </label>
                    <select
                      name="organizationType"
                      value={formData.organizationType || ''}
                      onChange={handleChange}
                      className="input-field"
                      required={formData.role === 'ngo'}
                    >
                      <option value="">Select type</option>
                      <option value="orphanage">Orphanage</option>
                      <option value="oldAgeHome">Old Age Home</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of People You Serve
                    </label>
                    <input
                      type="number"
                      name="ngoNumberOfPeople"
                      value={formData.ngoNumberOfPeople || ''}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="e.g., 50"
                      min="1"
                      required={formData.role === 'ngo'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🏠 Organization Location
                    </label>
                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={getLiveLocation}
                        disabled={gettingLocation}
                        className="w-full btn btn-outline text-sm py-2 bg-blue-50 hover:bg-blue-100"
                      >
                        {gettingLocation ? '📍 Getting location...' : '📍 Use Live Location'}
                      </button>
                      <input
                        type="text"
                        name="ngoLocation"
                        value={formData.ngoLocation || ''}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Enter or refine location (e.g., 456 Oak St, Building A)"
                        required={formData.role === 'ngo'}
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="spinner"></div>
                ) : (
                  <>
                    <UserPlus size={20} />
                    <span>Create Account</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6">
              {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
                <button
                  type="button"
                  onClick={handleGoogleClick}
                  className="w-full flex items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M21.6 12.23c0-.82-.07-1.6-.2-2.35H12v4.45h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.75 2.98-4.33 2.98-7.62Z" />
                    <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.43l-3.24-2.5c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.75-5.59-4.1H3.07v2.58A10 10 0 0 0 12 22Z" />
                    <path fill="#FBBC05" d="M6.41 13.93A6.02 6.02 0 0 1 6.41 10.07V7.49H3.07a10 10 0 0 0 0 12.88l3.34-2.44Z" />
                    <path fill="#EA4335" d="M12 6.04c1.47 0 2.79.5 3.83 1.48l2.87-2.87A9.96 9.96 0 0 0 12 2a10 10 0 0 0-8.93 5.49l3.34 2.44C7.2 7.79 9.4 6.04 12 6.04Z" />
                  </svg>
                  Verify email with Google
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => toast.error('Add your Google Client ID to enable Google sign-up.')}
                  className="w-full flex items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M21.6 12.23c0-.82-.07-1.6-.2-2.35H12v4.45h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.75 2.98-4.33 2.98-7.62Z" />
                    <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.43l-3.24-2.5c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.75-5.59-4.1H3.07v2.58A10 10 0 0 0 12 22Z" />
                    <path fill="#FBBC05" d="M6.41 13.93A6.02 6.02 0 0 1 6.41 10.07V7.49H3.07a10 10 0 0 0 0 12.88l3.34-2.44Z" />
                    <path fill="#EA4335" d="M12 6.04c1.47 0 2.79.5 3.83 1.48l2.87-2.87A9.96 9.96 0 0 0 12 2a10 10 0 0 0-8.93 5.49l3.34 2.44C7.2 7.79 9.4 6.04 12 6.04Z" />
                  </svg>
                  Sign up with Google
                </button>
              )}
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                  Login here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
