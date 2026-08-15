import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Building2, 
  Package, 
  CheckCircle, 
  Clock,
  XCircle,
  Lock,
  Unlock,
  AlertCircle
} from 'lucide-react';

const NGODashboard = () => {
  const { user } = useAuth();
  const [availableDonations, setAvailableDonations] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('available');

  useEffect(() => {
    fetchAvailableDonations();
    fetchMyRequests();
  }, []);

  const fetchAvailableDonations = async () => {
    try {
      const response = await axios.get('/api/ngo/available-donations');
      setAvailableDonations(response.data.donations);
    } catch (error) {
      console.error('Error fetching available donations:', error);
    }
  };

  const fetchMyRequests = async () => {
    try {
      const response = await axios.get('/api/ngo/my-requests');
      setMyRequests(response.data.requests);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const requestDonation = async (donationId) => {
    if (!window.confirm('Are you sure you want to request this donation? This will lock it for your organization.')) {
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/ngo/request', { donationId });
      toast.success('Donation requested successfully! Waiting for admin approval.');
      fetchAvailableDonations();
      fetchMyRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to request donation');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      requested: <span className="badge badge-warning flex items-center space-x-1"><Clock size={14} /><span>Pending Approval</span></span>,
      approved: <span className="badge badge-info flex items-center space-x-1"><CheckCircle size={14} /><span>Approved</span></span>,
      assigned: <span className="badge badge-info flex items-center space-x-1"><Package size={14} /><span>Volunteer Assigned</span></span>,
      delivered: <span className="badge badge-success flex items-center space-x-1"><CheckCircle size={14} /><span>Delivered</span></span>,
      rejected: <span className="badge badge-danger flex items-center space-x-1"><XCircle size={14} /><span>Rejected</span></span>,
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
            <div className="flex items-center space-x-3 mb-2">
              <Building2 size={40} className="text-primary-500" />
              <h1 className="text-4xl font-display font-bold">
                NGO Dashboard
              </h1>
            </div>
            <p className="text-gray-600">
              Welcome {user?.organizationName}! ({user?.organizationType})
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Requests</p>
                  <p className="text-3xl font-bold text-primary-600">{myRequests.length}</p>
                </div>
                <Package className="text-primary-500" size={40} />
              </div>
            </div>
            
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {myRequests.filter(r => r.status === 'requested').length}
                  </p>
                </div>
                <Clock className="text-yellow-500" size={40} />
              </div>
            </div>
            
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Approved</p>
                  <p className="text-3xl font-bold text-green-600">
                    {myRequests.filter(r => r.status === 'approved' || r.status === 'assigned').length}
                  </p>
                </div>
                <CheckCircle className="text-green-500" size={40} />
              </div>
            </div>
            
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Delivered</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {myRequests.filter(r => r.status === 'delivered').length}
                  </p>
                </div>
                <Package className="text-blue-500" size={40} />
              </div>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
            <div className="flex items-start">
              <AlertCircle className="text-blue-600 mt-0.5 mr-3" size={20} />
              <div>
                <p className="text-sm text-blue-800 font-medium">
                  🔒 <strong>First-Come Locking System:</strong> When you request a donation, it gets locked exclusively for your organization. 
                  Other NGOs cannot request the same donation. Admin will approve or reject your request.
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="card mb-8">
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('available')}
                className={`flex-1 py-4 px-6 font-medium transition-colors ${
                  activeTab === 'available'
                    ? 'border-b-2 border-primary-500 text-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Unlock size={20} />
                  <span>Available Donations (≥50 packets)</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`flex-1 py-4 px-6 font-medium transition-colors ${
                  activeTab === 'requests'
                    ? 'border-b-2 border-primary-500 text-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Lock size={20} />
                  <span>My Requests</span>
                </div>
              </button>
            </div>

            <div className="p-6">
              {/* Available Donations Tab */}
              {activeTab === 'available' && (
                <div>
                  <h3 className="text-xl font-bold mb-4">Large Donations Available</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Only donations with 50 or more food packets are shown here. Request to lock for your organization.
                  </p>
                  
                  {availableDonations.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Package size={64} className="mx-auto mb-4 text-gray-300" />
                      <p>No large donations available at the moment</p>
                      <p className="text-sm mt-2">Check back later for donations with ≥50 packets</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {availableDonations.map((donation) => (
                        <div key={donation._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="text-lg font-semibold">{donation.foodType}</h4>
                              <p className="text-gray-600 text-sm">
                                By: {donation.donor?.name}
                              </p>
                            </div>
                            <span className="badge badge-success">
                              {donation.numberOfPackets} packets
                            </span>
                          </div>
                          
                          <div className="space-y-2 text-sm mb-4">
                            <div className="flex items-center space-x-2 text-gray-600">
                              <Clock size={16} />
                              <span>Expires: {new Date(donation.expiryTime).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-600">
                              <Package size={16} />
                              <span>Location: {donation.location?.address || donation.location}</span>
                            </div>
                          </div>

                          {donation.description && (
                            <p className="text-sm text-gray-600 mb-3 p-2 bg-gray-50 rounded">
                              {donation.description}
                            </p>
                          )}

                          <button
                            onClick={() => requestDonation(donation._id)}
                            disabled={loading}
                            className="btn btn-primary w-full flex items-center justify-center space-x-2"
                          >
                            <Lock size={16} />
                            <span>{loading ? 'Requesting...' : 'Request & Lock This Donation'}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* My Requests Tab */}
              {activeTab === 'requests' && (
                <div>
                  <h3 className="text-xl font-bold mb-4">My Requested Donations</h3>
                  
                  {myRequests.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Lock size={64} className="mx-auto mb-4 text-gray-300" />
                      <p>No requests yet</p>
                      <p className="text-sm mt-2">Go to "Available Donations" to request food</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myRequests.map((request) => (
                        <div key={request._id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="text-lg font-semibold">
                                {request.donation?.foodType}
                              </h4>
                              <p className="text-gray-600 text-sm">
                                Donor: {request.donation?.donor?.name}
                              </p>
                            </div>
                            {getStatusBadge(request.status)}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                            <div className="bg-gray-50 p-2 rounded">
                              <span className="text-gray-600">Packets:</span>
                              <span className="ml-2 font-semibold">{request.donation?.numberOfPackets}</span>
                            </div>
                            <div className="bg-gray-50 p-2 rounded">
                              <span className="text-gray-600">Requested:</span>
                              <span className="ml-2 font-semibold">
                                {new Date(request.requestedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          {request.status === 'requested' && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
                              <p className="text-yellow-800">
                                ⏳ <strong>Waiting for admin approval.</strong> This donation is locked for your organization.
                              </p>
                            </div>
                          )}

                          {request.status === 'approved' && (
                            <div className="bg-green-50 border border-green-200 rounded p-3 text-sm">
                              <p className="text-green-800">
                                ✅ <strong>Approved!</strong> Volunteer will be assigned soon.
                              </p>
                            </div>
                          )}

                          {request.status === 'assigned' && (
                            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
                              <p className="text-blue-800">
                                🚚 <strong>Volunteer assigned!</strong> Delivery in progress.
                              </p>
                            </div>
                          )}

                          {request.status === 'delivered' && (
                            <div className="bg-green-50 border border-green-200 rounded p-3 text-sm">
                              <p className="text-green-800">
                                🎉 <strong>Delivered successfully!</strong> Thank you for serving the community.
                              </p>
                            </div>
                          )}

                          {request.status === 'rejected' && (
                            <div className="bg-red-50 border border-red-200 rounded p-3 text-sm">
                              <p className="text-red-800">
                                ❌ <strong>Request rejected.</strong> The donation has been unlocked.
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NGODashboard;
