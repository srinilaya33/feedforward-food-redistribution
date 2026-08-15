import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Users, 
  Package, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  MapPin,
  Award,
  Settings,
  UserCheck,
  Truck,
  ClipboardCheck,
  Lock
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDonations: 0,
    totalDeliveries: 0,
    approvedDonations: 0,
    rejectedDonations: 0,
    volunteers: 0,
    donors: 0,
    checkers: 0,
  });
  const [users, setUsers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [ngoRequests, setNgoRequests] = useState([]);
  const [areas, setAreas] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, usersRes, donationsRes, requestsRes, areasRes] = await Promise.all([
        axios.get('/api/admin/stats'),
        axios.get('/api/admin/users'),
        axios.get('/api/admin/donations'),
        axios.get('/api/admin/ngo-requests'),
        axios.get('/api/admin/areas'),
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data.users);
      setDonations(donationsRes.data.donations);
      setNgoRequests(requestsRes.data.requests);
      setAreas(areasRes.data.areas);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const assignBadge = async (donorId, badgeLevel) => {
    try {
      await axios.post('/api/admin/assign-badge', { donorId, badgeLevel });
      toast.success('Badge assigned successfully!');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to assign badge');
    }
  };

  const approveNGORequest = async (requestId) => {
    try {
      await axios.put(`/api/admin/ngo-requests/${requestId}/approve`);
      toast.success('NGO request approved!');
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve request');
    }
  };

  const approveDonation = async (donationId) => {
    try {
      await axios.put(`/api/admin/donations/${donationId}/approve`);
      toast.success('Donation approved!');
      fetchDashboardData(); // Refresh data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve donation');
    }
  };

  const rejectDonation = async (donationId) => {
    try {
      await axios.put(`/api/admin/donations/${donationId}/reject`);
      toast.success('Donation rejected');
      fetchDashboardData(); // Refresh data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject donation');
    }
  };

  return (    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-display font-bold mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">Welcome {user?.name}! Manage the Feed Forward platform</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card p-6 bg-gradient-to-br from-primary-500 to-primary-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary-100 text-sm">Total Users</p>
                  <p className="text-4xl font-bold">{stats.totalUsers}</p>
                </div>
                <Users size={48} className="opacity-80" />
              </div>
            </div>
            
            <div className="card p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Total Donations</p>
                  <p className="text-4xl font-bold">{stats.totalDonations}</p>
                </div>
                <Package size={48} className="opacity-80" />
              </div>
            </div>
            
            <div className="card p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Approved</p>
                  <p className="text-4xl font-bold">{stats.approvedDonations}</p>
                </div>
                <CheckCircle size={48} className="opacity-80" />
              </div>
            </div>
            
            <div className="card p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Active Volunteers</p>
                  <p className="text-4xl font-bold">{stats.volunteers}</p>
                </div>
                <Truck size={48} className="opacity-80" />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="card mb-8">
            <div className="flex border-b overflow-x-auto">
              {[
                { id: 'overview', label: 'Overview', icon: TrendingUp },
                { id: 'users', label: 'Users', icon: Users },
                { id: 'donations', label: 'Donations', icon: Package },
                { id: 'ngoRequests', label: 'NGO Requests', icon: Lock },
                { id: 'areas', label: 'Areas', icon: MapPin },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-b-2 border-primary-500 text-primary-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon size={20} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-700">Donors</h3>
                        <UserCheck className="text-blue-500" size={24} />
                      </div>
                      <p className="text-3xl font-bold text-blue-600">{stats.donors}</p>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-700">Volunteers</h3>
                        <Truck className="text-green-500" size={24} />
                      </div>
                      <p className="text-3xl font-bold text-green-600">{stats.volunteers}</p>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-700">Quality Checkers</h3>
                        <ClipboardCheck className="text-purple-500" size={24} />
                      </div>
                      <p className="text-3xl font-bold text-purple-600">{stats.checkers}</p>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-xl font-bold mb-4">System Health</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Approval Rate</span>
                        <span className="font-semibold text-green-600">
                          {stats.totalDonations > 0 
                            ? Math.round((stats.approvedDonations / stats.totalDonations) * 100) 
                            : 0}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Rejection Rate</span>
                        <span className="font-semibold text-red-600">
                          {stats.totalDonations > 0 
                            ? Math.round((stats.rejectedDonations / stats.totalDonations) * 100) 
                            : 0}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Deliveries</span>
                        <span className="font-semibold text-blue-600">{stats.totalDeliveries}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Users Tab */}
              {activeTab === 'users' && (
                <div>
                  <h3 className="text-xl font-bold mb-4">All Users</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Joined</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {users.map((u) => (
                          <tr key={u._id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm">{u.name}</td>
                            <td className="px-4 py-3 text-sm">{u.email}</td>
                            <td className="px-4 py-3 text-sm">
                              <span className="badge badge-info">{u.role}</span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {u.role === 'donor' && (
                                <button
                                  onClick={() => assignBadge(u._id, 'gold')}
                                  className="text-primary-600 hover:text-primary-700 flex items-center space-x-1"
                                >
                                  <Award size={16} />
                                  <span>Badge</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Donations Tab */}
              {activeTab === 'donations' && (
                <div>
                  <h3 className="text-xl font-bold mb-4">All Donations</h3>
                  <div className="space-y-3">
                    {donations.map((donation) => (
                      <div key={donation._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{donation.foodType}</h4>
                            <p className="text-sm text-gray-600">
                              {donation.quantity} {donation.unit} • {donation.donor?.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {donation.description}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className={`badge ${
                              donation.status === 'approved' ? 'badge-success' :
                              donation.status === 'rejected' ? 'badge-danger' :
                              donation.status === 'delivered' ? 'badge-success' :
                              'badge-warning'
                            }`}>
                              {donation.status}
                            </span>
                            {donation.status === 'pending' && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => approveDonation(donation._id)}
                                  className="btn btn-success btn-sm"
                                >
                                  <CheckCircle size={14} className="mr-1" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => rejectDonation(donation._id)}
                                  className="btn btn-danger btn-sm"
                                >
                                  <XCircle size={14} className="mr-1" />
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* NGO Requests Tab */}
              {activeTab === 'ngoRequests' && (
                <div>
                  <h3 className="text-xl font-bold mb-4">NGO Donation Requests</h3>
                  {ngoRequests.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Lock size={64} className="mx-auto mb-4 text-gray-300" />
                      <p>No NGO requests currently.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {ngoRequests.map((request) => (
                        <div key={request._id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold">{request.donation?.foodType}</h4>
                              <p className="text-sm text-gray-600">NGO: {request.ngo?.organizationName}</p>
                              <p className="text-sm text-gray-600">Donor: {request.donation?.donor?.name}</p>
                            </div>
                            <span className="badge badge-warning">{request.status}</span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => approveNGORequest(request._id)}
                              className="btn btn-success btn-sm"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => rejectNGORequest(request._id)}
                              className="btn btn-danger btn-sm"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Areas Tab */}
              {activeTab === 'areas' && (
                <div>
                  <h3 className="text-xl font-bold mb-4">High-Need Areas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {areas.map((area) => (
                      <div key={area._id} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold mb-2 flex items-center space-x-2">
                          <MapPin size={18} className="text-primary-500" />
                          <span>{area.areaName}</span>
                        </h4>
                        <div className="space-y-1 text-sm">
                          <p className="text-gray-600">
                            Footpath Dwellers: <span className="font-semibold">{area.beggarCount}</span>
                          </p>
                          <p className="text-gray-600">
                            Handicapped: <span className="font-semibold">{area.handicappedCount}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
