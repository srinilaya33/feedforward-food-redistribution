import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Package,
  MapPin,
  Award,
  PieChart,
  Activity
} from 'lucide-react';

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState({
    totalDonations: 0,
    totalVolunteers: 0,
    totalDonors: 0,
    approvedDonations: 0,
    rejectedDonations: 0,
    deliveredDonations: 0,
    totalFoodSaved: 0,
    areasServed: 0,
    peopleReached: 0,
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('/api/analytics');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const approvalRate = analytics.totalDonations > 0 
    ? ((analytics.approvedDonations / analytics.totalDonations) * 100).toFixed(1)
    : 0;

  const deliveryRate = analytics.approvedDonations > 0
    ? ((analytics.deliveredDonations / analytics.approvedDonations) * 100).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-display font-bold mb-2 flex items-center space-x-3">
              <BarChart3 size={40} className="text-primary-500" />
              <span>Platform Analytics</span>
            </h1>
            <p className="text-gray-600">Comprehensive insights on Feed Forward's impact</p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
              <div className="flex items-center justify-between mb-4">
                <Package size={32} className="opacity-80" />
              </div>
              <p className="text-green-100 text-sm mb-1">Total Donations</p>
              <p className="text-4xl font-bold">{analytics.totalDonations}</p>
            </div>

            <div className="card p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <div className="flex items-center justify-between mb-4">
                <Users size={32} className="opacity-80" />
              </div>
              <p className="text-blue-100 text-sm mb-1">Active Volunteers</p>
              <p className="text-4xl font-bold">{analytics.totalVolunteers}</p>
            </div>

            <div className="card p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp size={32} className="opacity-80" />
              </div>
              <p className="text-purple-100 text-sm mb-1">Food Saved (kg)</p>
              <p className="text-4xl font-bold">{analytics.totalFoodSaved}</p>
            </div>

            <div className="card p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <div className="flex items-center justify-between mb-4">
                <Award size={32} className="opacity-80" />
              </div>
              <p className="text-orange-100 text-sm mb-1">People Reached</p>
              <p className="text-4xl font-bold">{analytics.peopleReached}+</p>
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Donation Flow */}
            <div className="card p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
                <Activity size={24} />
                <span>Donation Flow</span>
              </h2>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Total Submitted</span>
                    <span className="font-bold text-lg">{analytics.totalDonations}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-primary-500 h-3 rounded-full"
                      style={{ width: '100%' }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Approved</span>
                    <span className="font-bold text-lg text-green-600">
                      {analytics.approvedDonations} ({approvalRate}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-green-500 h-3 rounded-full"
                      style={{ width: `${approvalRate}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Delivered</span>
                    <span className="font-bold text-lg text-blue-600">
                      {analytics.deliveredDonations} ({deliveryRate}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-500 h-3 rounded-full"
                      style={{ width: `${deliveryRate}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Rejected</span>
                    <span className="font-bold text-lg text-red-600">
                      {analytics.rejectedDonations}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-red-500 h-3 rounded-full"
                      style={{ 
                        width: `${analytics.totalDonations > 0 ? (analytics.rejectedDonations / analytics.totalDonations) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Community Impact */}
            <div className="card p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
                <MapPin size={24} />
                <span>Community Impact</span>
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Areas Served</p>
                    <p className="text-2xl font-bold text-primary-600">{analytics.areasServed}</p>
                  </div>
                  <MapPin className="text-primary-500" size={32} />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Registered Donors</p>
                    <p className="text-2xl font-bold text-green-600">{analytics.totalDonors}</p>
                  </div>
                  <Users className="text-green-500" size={32} />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Active Volunteers</p>
                    <p className="text-2xl font-bold text-blue-600">{analytics.totalVolunteers}</p>
                  </div>
                  <Activity className="text-blue-500" size={32} />
                </div>
              </div>
            </div>
          </div>

          {/* Efficiency Metrics */}
          <div className="card p-6">
            <h2 className="text-2xl font-bold mb-6">Platform Efficiency</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Quality Approval Rate</p>
                <p className="text-4xl font-bold text-green-600">{approvalRate}%</p>
                <p className="text-xs text-gray-500 mt-2">Food meeting quality standards</p>
              </div>

              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Delivery Success Rate</p>
                <p className="text-4xl font-bold text-blue-600">{deliveryRate}%</p>
                <p className="text-xs text-gray-500 mt-2">Approved donations delivered</p>
              </div>

              <div className="text-center p-6 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Average Impact</p>
                <p className="text-4xl font-bold text-purple-600">
                  {analytics.totalDonations > 0 
                    ? (analytics.peopleReached / analytics.deliveredDonations).toFixed(0)
                    : 0}
                </p>
                <p className="text-xs text-gray-500 mt-2">People fed per donation</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
