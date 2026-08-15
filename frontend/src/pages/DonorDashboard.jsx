import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import GoogleMapsComponent from '../components/GoogleMapsComponent';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Plus, 
  Image as ImageIcon, 
  Clock, 
  MapPin, 
  Package,
  CheckCircle,
  XCircle,
  AlertCircle,
  Award
} from 'lucide-react';

const DonorDashboard = () => {
  const { user, updateUser } = useAuth();
  const [donations, setDonations] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditLocation, setShowEditLocation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updatingLocation, setUpdatingLocation] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [newLocation, setNewLocation] = useState(user?.donorLocation?.address || '');
  const [donorCoords, setDonorCoords] = useState({
    latitude: user?.donorLocation?.latitude || null,
    longitude: user?.donorLocation?.longitude || null
  });
  const [formData, setFormData] = useState({
    foodType: '',
    quantity: '',
    unit: 'kg',
    expiryTime: '',
    location: '',
    description: '',
    image: null,
  });

  useEffect(() => {
    fetchDonations();
  }, []);

  useEffect(() => {
    setNewLocation(user?.donorLocation?.address || '');
    setDonorCoords({
      latitude: user?.donorLocation?.latitude || null,
      longitude: user?.donorLocation?.longitude || null
    });
  }, [user]);

  const fetchDonations = async () => {
    try {
      const response = await axios.get('/api/donations/my-donations');
      setDonations(response.data.donations);
    } catch (error) {
      console.error('Error fetching donations:', error);
    }
  };

  const handleChange = (e) => {
    if (e.target.name === 'image') {
      setFormData({
        ...formData,
        image: e.target.files[0],
      });
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });

      if (e.target.name === 'location') {
        setDonorCoords({ latitude: null, longitude: null });
      }
    }
  };

  const geocodeAddress = async (address) => {
    if (!address?.trim()) {
      throw new Error('Address is required');
    }

    const response = await axios.get('/api/auth/geocode', {
      params: { address }
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Geocoding failed');
    }

    return response.data.location;
  };

  const handleLookupLocation = async () => {
    if (!formData.location.trim()) {
      toast.error('Enter a pickup location first');
      return;
    }

    setGeoLoading(true);
    try {
      const location = await geocodeAddress(formData.location);
      setFormData((prev) => ({
        ...prev,
        location: location.address
      }));
      setDonorCoords({
        latitude: location.latitude,
        longitude: location.longitude
      });
      toast.success('Location found and coordinates populated');
    } catch (error) {
      console.error('Geocoding error:', error);
      toast.error(error.message || 'Failed to find coordinates');
    } finally {
      setGeoLoading(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported by your browser');
      return;
    }

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Try to reverse geocode, but if it fails, just use coordinates
          try {
            const response = await axios.get('/api/auth/geocode', {
              params: { lat: latitude, lng: longitude }
            });
            
            if (response.data.success && response.data.location) {
              setNewLocation(response.data.location.address);
              setFormData((prev) => ({
                ...prev,
                location: response.data.location.address
              }));
            } else {
              // Fallback: use coordinates without address
              setNewLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
              setFormData((prev) => ({
                ...prev,
                location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
              }));
            }
          } catch (geocodeError) {
            console.error('Geocoding failed, using coordinates:', geocodeError);
            // Use coordinates if reverse geocoding fails
            setNewLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            setFormData((prev) => ({
              ...prev,
              location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
            }));
          }
          
          setDonorCoords({ latitude, longitude });
          toast.success('Current location set');
        } catch (error) {
          console.error('Location error:', error);
          toast.error('Unable to process location');
        } finally {
          setGeoLoading(false);
        }
      },
      (error) => {
        setGeoLoading(false);
        console.error('Geolocation error:', error);
        toast.error('Please enable location permission in your browser');
      }
    );
  };

  const updateLocation = async () => {
    if (!newLocation.trim()) {
      toast.error('Please enter a location');
      return;
    }

    setUpdatingLocation(true);
    try {
      let locationData = {
        address: newLocation
      };

      if (donorCoords.latitude && donorCoords.longitude) {
        locationData.latitude = donorCoords.latitude;
        locationData.longitude = donorCoords.longitude;
      } else {
        const geo = await geocodeAddress(newLocation);
        if (geo) {
          locationData = geo;
        }
      }

      await axios.put('/api/auth/update-location', {
        donorLocation: locationData
      });

      // Update the user context with the new location
      updateUser({ donorLocation: locationData });
      setDonorCoords({
        latitude: locationData.latitude || null,
        longitude: locationData.longitude || null
      });

      toast.success('Location updated successfully!');
      setShowEditLocation(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update location');
    } finally {
      setUpdatingLocation(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Map frontend fields to backend expected fields
      formDataToSend.append('foodType', formData.foodType);
      formDataToSend.append('numberOfPackets', formData.quantity);
      formDataToSend.append('expiryTime', formData.expiryTime);

      let locationPayload = {
        address: formData.location
      };

      if (donorCoords.latitude && donorCoords.longitude) {
        locationPayload.latitude = donorCoords.latitude;
        locationPayload.longitude = donorCoords.longitude;
      }

      formDataToSend.append('location', JSON.stringify(locationPayload));

      if (formData.description) {
        formDataToSend.append('description', formData.description);
      }
      if (formData.image) {
        formDataToSend.append('images', formData.image);
      }

      await axios.post('/api/donations/create', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Donation posted successfully!');
      setShowCreateForm(false);
      setFormData({
        foodType: '',
        quantity: '',
        unit: 'kg',
        expiryTime: '',
        location: '',
        description: '',
        image: null,
      });
      fetchDonations();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to post donation');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: <span className="badge badge-warning">Pending Inspection</span>,
      approved: <span className="badge badge-success">Approved</span>,
      rejected: <span className="badge badge-danger">Rejected</span>,
      assigned: <span className="badge badge-info">Assigned to Volunteer</span>,
      picked_up: <span className="badge badge-info">Picked Up</span>,
      delivered: <span className="badge badge-success">Delivered</span>,
    };
    return badges[status] || <span className="badge">{status}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-display font-bold mb-2">
              Welcome, {user?.name}!
            </h1>
            <p className="text-gray-600">Manage your food donations and track their impact</p>
            
            {/* Location Card */}
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MapPin className="text-blue-600" size={24} />
                <div>
                  <p className="text-sm text-gray-600">Pickup Location</p>
                  <p className="font-semibold text-gray-800">
                    {user?.donorLocation?.address || 'Not set'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setNewLocation(user?.donorLocation?.address || '');
                  setShowEditLocation(!showEditLocation);
                }}
                className="btn btn-outline text-sm py-2 px-4"
              >
                Edit Location
              </button>
            </div>

            {/* Edit Location Form */}
            {showEditLocation && (
              <div className="mt-4 bg-white border border-blue-200 rounded-lg p-4 animate-fadeIn">
                <h3 className="text-lg font-semibold mb-4">Update Your Pickup Location</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="input-field w-full"
                    placeholder="Enter your pickup location"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={updateLocation}
                      disabled={updatingLocation}
                      className="btn btn-primary flex-1 text-sm py-2"
                    >
                      {updatingLocation ? 'Updating...' : 'Save Location'}
                    </button>
                    <button
                      onClick={() => setShowEditLocation(false)}
                      className="btn btn-outline flex-1 text-sm py-2"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Location Map */}
            {(user?.donorLocation?.address || newLocation) && (
              <div className="mt-6 bg-white rounded-lg p-6 border border-gray-200">
                <GoogleMapsComponent
                  source={{
                    lat: donorCoords.latitude || user?.donorLocation?.latitude || 28.6139,
                    lng: donorCoords.longitude || user?.donorLocation?.longitude || 77.2090
                  }}
                  destination={{
                    lat: donorCoords.latitude || user?.donorLocation?.latitude || 28.6139,
                    lng: donorCoords.longitude || user?.donorLocation?.longitude || 77.2090
                  }}
                  title="Your Donation Pickup Location"
                  showDirections={false}
                  markerLabel={user?.donorLocation?.address || newLocation}
                />
              </div>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Donations</p>
                  <p className="text-3xl font-bold text-primary-600">{donations.length}</p>
                </div>
                <Package className="text-primary-500" size={40} />
              </div>
            </div>
            
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Delivered</p>
                  <p className="text-3xl font-bold text-green-600">
                    {donations.filter(d => d.status === 'delivered').length}
                  </p>
                </div>
                <CheckCircle className="text-green-500" size={40} />
              </div>
            </div>
            
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {donations.filter(d => d.status === 'pending' || d.status === 'approved').length}
                  </p>
                </div>
                <AlertCircle className="text-yellow-500" size={40} />
              </div>
            </div>
            
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Badges Earned</p>
                  <p className="text-3xl font-bold text-purple-600">3</p>
                </div>
                <Award className="text-purple-500" size={40} />
              </div>
            </div>
          </div>

          {/* Create Donation Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="btn btn-primary flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Post New Donation</span>
            </button>
          </div>

          {/* Create Donation Form */}
          {showCreateForm && (
            <div className="card p-6 mb-8 animate-fadeInUp">
              <h2 className="text-2xl font-bold mb-6">Create New Donation</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Food Type
                    </label>
                    <input
                      type="text"
                      name="foodType"
                      value={formData.foodType}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="e.g., Cooked Rice, Fresh Vegetables"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        className="input-field flex-1"
                        placeholder="10"
                        required
                      />
                      <select
                        name="unit"
                        value={formData.unit}
                        onChange={handleChange}
                        className="input-field w-24"
                      >
                        <option value="kg">kg</option>
                        <option value="servings">servings</option>
                        <option value="plates">plates</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Time
                    </label>
                    <input
                      type="datetime-local"
                      name="expiryTime"
                      value={formData.expiryTime}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pickup Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Full address"
                      required
                    />
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={handleLookupLocation}
                        disabled={geoLoading}
                        className="btn btn-secondary text-sm py-1 px-2"
                      >
                        {geoLoading ? 'Searching...' : 'Find coordinates'}
                      </button>
                      <button
                        type="button"
                        onClick={handleUseCurrentLocation}
                        disabled={geoLoading}
                        className="btn btn-secondary text-sm py-1 px-2"
                      >
                        Use My Current Location
                      </button>
                    </div>
                    {donorCoords.latitude && donorCoords.longitude && (
                      <p className="text-sm text-gray-500 mt-2">
                        Coordinates: {donorCoords.latitude.toFixed(5)}, {donorCoords.longitude.toFixed(5)}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="input-field"
                    rows="3"
                    placeholder="Additional details about the food"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Image
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
                    <ImageIcon className="mx-auto text-gray-400 mb-2" size={40} />
                    <input
                      type="file"
                      name="image"
                      onChange={handleChange}
                      accept="image/*"
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <span className="text-primary-600 hover:text-primary-700">
                        Click to upload
                      </span>
                      <span className="text-gray-600"> or drag and drop</span>
                    </label>
                    {formData.image && (
                      <p className="text-sm text-green-600 mt-2">
                        Selected: {formData.image.name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary flex-1"
                  >
                    {loading ? 'Posting...' : 'Post Donation'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="btn btn-outline flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Donations List */}
          <div className="card p-6">
            <h2 className="text-2xl font-bold mb-6">My Donations</h2>
            
            {donations.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Package size={64} className="mx-auto mb-4 text-gray-300" />
                <p>No donations yet. Post your first donation to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {donations.map((donation) => (
                  <div key={donation._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-semibold">{donation.foodType}</h3>
                        <p className="text-gray-600 text-sm">
                          {donation.numberOfPackets} packets
                        </p>
                      </div>
                      {getStatusBadge(donation.status)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Clock size={16} />
                        <span>Expires: {new Date(donation.expiryTime).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <MapPin size={16} />
                        <span>{donation.location?.address || donation.location}</span>
                      </div>
                    </div>

                    {donation.description && (
                      <p className="text-gray-600 text-sm mt-3">{donation.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorDashboard;
