import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import GoogleMapsComponent from '../components/GoogleMapsComponent';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  MapPin, 
  Navigation, 
  CheckCircle, 
  Clock,
  Package,
  TrendingUp,
  Award,
  Route
} from 'lucide-react';

const VolunteerDashboard = () => {
  const { user } = useAuth();
  const [availableDonations, setAvailableDonations] = useState([]);
  const [myDeliveries, setMyDeliveries] = useState([]);
  const [highNeedAreas, setHighNeedAreas] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
  const fetchAll = () => {
    fetchAvailableDonations();
    fetchMyDeliveries();
    fetchHighNeedAreas();
  };

  fetchAll();

  if (!autoRefresh) return;

  const interval = setInterval(fetchAll, 30000);

  return () => clearInterval(interval);
}, [autoRefresh]);

  const fetchAvailableDonations = async () => {
    try {
      const response = await axios.get('/api/donations/available');
      setAvailableDonations(response.data.donations);
    } catch (error) {
      console.error('Error fetching donations:', error);
    }
  };

  const fetchMyDeliveries = async () => {
    try {
      const response = await axios.get('/api/deliveries/my-deliveries');
      setMyDeliveries(response.data.deliveries);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
    }
  };

  const fetchHighNeedAreas = async () => {
    try {
      const response = await axios.get('/api/ngo/high-need-areas');
      if (response.data.success) {
        setHighNeedAreas(response.data.areas);
      }
    } catch (error) {
      console.error('Error fetching high need areas:', error);
      setHighNeedAreas([]);
    }
  };

  const acceptDonation = async (donationId) => {
    setLoading(true);
    try {
      await axios.post('/api/deliveries/accept', { donationId });
      toast.success('Donation accepted! Check routing below.');
      fetchAvailableDonations();
      fetchMyDeliveries();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept donation');
    } finally {
      setLoading(false);
    }
  };

  const viewRoute = (donation, status = 'assigned') => {
    const fromLat = user?.location?.latitude || user?.donorLocation?.latitude || donation?.location?.latitude || 28.6139;
    const fromLng = user?.location?.longitude || user?.donorLocation?.longitude || donation?.location?.longitude || 77.2090;

    let destination = {
      lat: donation?.location?.latitude || 28.6139,
      lng: donation?.location?.longitude || 77.2090,
      label: donation?.location?.address || donation?.location || 'Pickup'
    };

    if (status === 'picked_up' && highNeedAreas.length > 0) {
      const deliveredCount = myDeliveries.filter(d => d.status === 'delivered').length;
      const area = highNeedAreas[deliveredCount % highNeedAreas.length];
      destination = {
        lat: area.latitude,
        lng: area.longitude,
        label: area.name
      };
    }

    setRouteInfo({
      source: { lat: fromLat, lng: fromLng, label: 'Your Location' },
      destination,
      status,
      donation
    });

    setShowMap(true);
  };

  const markAsPickedUp = async (deliveryId) => {
    try {
      await axios.put(`/api/deliveries/${deliveryId}/status`, { status: 'picked_up' });
      toast.success('Marked as picked up!');
      fetchMyDeliveries();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const markAsDelivered = async (deliveryId) => {
    try {
      await axios.put(`/api/deliveries/${deliveryId}/status`, { status: 'delivered' });
      toast.success('Delivery completed! Great job!');
      fetchMyDeliveries();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-display font-bold mb-2">
              Volunteer Dashboard
            </h1>
            <p className="text-gray-600">
              Hello {user?.name}! Your PIN: <span className="font-mono font-bold text-primary-600">{user?.volunteerPin}</span>
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Deliveries</p>
                  <p className="text-3xl font-bold text-primary-600">
                    {myDeliveries.filter(d => d.status === 'delivered').length}
                  </p>
                </div>
                <CheckCircle className="text-primary-500" size={40} />
              </div>
            </div>
            
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Active</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {myDeliveries.filter(d => d.status === 'assigned' || d.status === 'picked_up').length}
                  </p>
                </div>
                <Package className="text-blue-500" size={40} />
              </div>
            </div>
            
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">People Fed</p>
                  <p className="text-3xl font-bold text-green-600">200+</p>
                </div>
                <TrendingUp className="text-green-500" size={40} />
              </div>
            </div>
            
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Rating</p>
                  <p className="text-3xl font-bold text-yellow-600">4.9 ⭐</p>
                </div>
                <Award className="text-yellow-500" size={40} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Available Donations */}
            <div className="card p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
                <Package size={24} />
                <span>Available Donations</span>
              </h2>
              
              {availableDonations.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Package size={64} className="mx-auto mb-4 text-gray-300" />
                  <p>No donations available at the moment</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {availableDonations.map((donation) => (
                    <div key={donation._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-semibold">{donation.foodType}</h3>
                          <p className="text-gray-600 text-sm">
                            {donation.quantity} {donation.unit}
                          </p>
                        </div>
                        <span className="badge badge-success">Approved</span>
                      </div>
                      
                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Clock size={16} />
                          <span>Expires: {new Date(donation.expiryTime).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <MapPin size={16} />
                          <span>{typeof donation.location === 'object' ? (donation.location?.address || 'Location') : donation.location}</span>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => acceptDonation(donation._id)}
                          disabled={loading}
                          className="btn btn-primary flex-1 text-sm py-2"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => viewRoute(donation, 'assigned')}
                          className="btn btn-outline flex items-center space-x-1 text-sm py-2"
                        >
                          <Navigation size={16} />
                          <span>Route</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* My Deliveries */}
            <div className="card p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
                <Route size={24} />
                <span>My Deliveries</span>
              </h2>
              
              {myDeliveries.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Route size={64} className="mx-auto mb-4 text-gray-300" />
                  <p>No active deliveries</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {myDeliveries.map((delivery) => (
                    <div key={delivery._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-semibold">{delivery.donation?.foodType}</h3>
                          <p className="text-gray-600 text-sm">
                            {delivery.donation?.quantity} {delivery.donation?.unit}
                          </p>
                        </div>
                        <span className={`badge ${
                          delivery.status === 'delivered' ? 'badge-success' : 
                          delivery.status === 'picked_up' ? 'badge-info' : 
                          'badge-warning'
                        }`}>
                          {delivery.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <MapPin size={16} />
                          <span>{typeof delivery.donation?.location === 'object' ? (delivery.donation?.location?.address || 'Location') : delivery.donation?.location}</span>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        {delivery.status === 'assigned' && (
                          <>
                            <button
                              onClick={() => markAsPickedUp(delivery._id)}
                              className="btn btn-primary flex-1 text-sm py-2"
                            >
                              Mark Picked Up
                            </button>
                            <button
                              onClick={() => viewRoute(delivery.donation, delivery.status)}
                              className="btn btn-outline flex items-center space-x-1 text-sm py-2"
                            >
                              <Navigation size={16} />
                              <span>Navigate</span>
                            </button>
                          </>
                        )}
                        
                        {delivery.status === 'picked_up' && (
                          <button
                            onClick={() => markAsDelivered(delivery._id)}
                            className="btn btn-primary flex-1 text-sm py-2"
                          >
                            Mark Delivered
                          </button>
                        )}
                        
                        {delivery.status === 'delivered' && (
                          <div className="flex items-center space-x-2 text-green-600 flex-1 justify-center">
                            <CheckCircle size={20} />
                            <span className="font-medium">Completed</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Route Map Modal */}
        {showMap && routeInfo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Route Details</h2>
                  <p className="text-gray-600">{routeInfo.donation?.foodType || routeInfo.destination.label}</p>
                </div>
                <button
                  onClick={() => setShowMap(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="p-6">
                <GoogleMapsComponent
                  source={routeInfo.source}
                  destination={routeInfo.destination}
                  title={`Route: ${routeInfo.source.label} → ${routeInfo.destination.label}`}
                  showDirections={true}
                />

                <div className="mt-6 space-y-4 bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-lg">Route Summary</h3>
                  <p className="text-sm text-gray-700">Status: {routeInfo.status.replace('_', ' ').toUpperCase()}</p>
                  <p className="text-sm text-gray-700">Pickup location: {routeInfo.donation?.location?.address || routeInfo.donation?.location || 'Unknown'}</p>
                  {routeInfo.status === 'picked_up' && (
                    <p className="text-sm text-gray-700">
                      Destination high-need area: {routeInfo.destination.label}
                    </p>
                  )}
                </div>

                <div className="mt-6 flex space-x-3">
                  {routeInfo.status === 'assigned' && (
                    <button
                      onClick={() => acceptDonation(routeInfo.donation._id)}
                      disabled={loading}
                      className="btn btn-primary flex-1"
                    >
                      {loading ? 'Accepting...' : 'Accept This Donation'}
                    </button>
                  )}
                  <button
                    onClick={() => setShowMap(false)}
                    className="btn btn-outline flex-1"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VolunteerDashboard;
