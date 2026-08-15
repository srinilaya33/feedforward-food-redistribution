import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  ClipboardCheck, 
  CheckCircle, 
  XCircle,
  Clock,
  AlertTriangle,
  Package,
  Eye,
  FileText
} from 'lucide-react';

const FoodCheckerDashboard = () => {
  const { user } = useAuth();
  const [pendingInspections, setPendingInspections] = useState([]);
  const [inspectionHistory, setInspectionHistory] = useState([]);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [showInspectModal, setShowInspectModal] = useState(false);
  const [inspectionData, setInspectionData] = useState({
    result: '',
    remarks: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPendingInspections();
    fetchInspectionHistory();
  }, []);

  const fetchPendingInspections = async () => {
    try {
      const response = await axios.get('/api/inspections/pending');
      setPendingInspections(response.data.donations);
    } catch (error) {
      console.error('Error fetching pending inspections:', error);
    }
  };

  const fetchInspectionHistory = async () => {
    try {
      const response = await axios.get('/api/inspections/my-history');
      setInspectionHistory(response.data.inspections);
    } catch (error) {
      console.error('Error fetching inspection history:', error);
    }
  };

  const openInspectModal = (donation) => {
    setSelectedDonation(donation);
    setShowInspectModal(true);
    setInspectionData({ result: '', remarks: '' });
  };

  const closeInspectModal = () => {
    setShowInspectModal(false);
    setSelectedDonation(null);
    setInspectionData({ result: '', remarks: '' });
  };

  const handleInspection = async (e) => {
    e.preventDefault();
    
    if (!inspectionData.result) {
      toast.error('Please select inspection result');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/inspections/submit', {
        donationId: selectedDonation._id,
        result: inspectionData.result,
        remarks: inspectionData.remarks,
      });

      toast.success(`Donation ${inspectionData.result}!`);
      closeInspectModal();
      fetchPendingInspections();
      fetchInspectionHistory();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit inspection');
    } finally {
      setLoading(false);
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
              Food Quality Checker Dashboard
            </h1>
            <p className="text-gray-600">
              Hello {user?.name}! Inspection Location: <span className="font-semibold text-primary-600">{typeof user?.location === 'object' ? (user?.location?.address || 'Not set') : user?.location}</span>
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {pendingInspections.length}
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
                    {inspectionHistory.filter(i => i.result === 'approved').length}
                  </p>
                </div>
                <CheckCircle className="text-green-500" size={40} />
              </div>
            </div>
            
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Rejected</p>
                  <p className="text-3xl font-bold text-red-600">
                    {inspectionHistory.filter(i => i.result === 'rejected').length}
                  </p>
                </div>
                <XCircle className="text-red-500" size={40} />
              </div>
            </div>
            
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Inspected</p>
                  <p className="text-3xl font-bold text-primary-600">
                    {inspectionHistory.length}
                  </p>
                </div>
                <ClipboardCheck className="text-primary-500" size={40} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pending Inspections */}
            <div className="card p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
                <AlertTriangle size={24} className="text-yellow-500" />
                <span>Pending Inspections</span>
              </h2>
              
              {pendingInspections.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Package size={64} className="mx-auto mb-4 text-gray-300" />
                  <p>No pending inspections</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {pendingInspections.map((donation) => (
                    <div key={donation._id} className="border border-yellow-200 bg-yellow-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-semibold">{donation.foodType}</h3>
                          <p className="text-gray-600 text-sm">
                            {donation.quantity} {donation.unit}
                          </p>
                          <p className="text-gray-600 text-sm">
                            Donor: {donation.donor?.name}
                          </p>
                        </div>
                        <span className="badge badge-warning">Pending</span>
                      </div>
                      
                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Clock size={16} />
                          <span>Expires: {new Date(donation.expiryTime).toLocaleString()}</span>
                        </div>
                      </div>

                      {donation.description && (
                        <p className="text-sm text-gray-600 mb-3 p-2 bg-white rounded">
                          {donation.description}
                        </p>
                      )}

                      <button
                        onClick={() => openInspectModal(donation)}
                        className="btn btn-primary w-full text-sm py-2 flex items-center justify-center space-x-2"
                      >
                        <Eye size={16} />
                        <span>Inspect Now</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Inspection History */}
            <div className="card p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
                <FileText size={24} />
                <span>Inspection History</span>
              </h2>
              
              {inspectionHistory.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText size={64} className="mx-auto mb-4 text-gray-300" />
                  <p>No inspection history yet</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {inspectionHistory.map((inspection) => (
                    <div key={inspection._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {inspection.donation?.foodType}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {new Date(inspection.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <span className={`badge ${
                          inspection.result === 'approved' ? 'badge-success' : 'badge-danger'
                        }`}>
                          {inspection.result.toUpperCase()}
                        </span>
                      </div>
                      
                      {inspection.remarks && (
                        <div className="bg-gray-50 p-3 rounded text-sm">
                          <p className="font-medium text-gray-700 mb-1">Remarks:</p>
                          <p className="text-gray-600">{inspection.remarks}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Inspection Modal */}
      {showInspectModal && selectedDonation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">Inspect Food Donation</h2>
              
              {/* Donation Details */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-lg mb-2">{selectedDonation.foodType}</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Quantity:</span>
                    <span className="ml-2 font-medium">
                      {selectedDonation.quantity} {selectedDonation.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Donor:</span>
                    <span className="ml-2 font-medium">{selectedDonation.donor?.name}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Expiry:</span>
                    <span className="ml-2 font-medium">
                      {new Date(selectedDonation.expiryTime).toLocaleString()}
                    </span>
                  </div>
                  {selectedDonation.description && (
                    <div className="col-span-2">
                      <span className="text-gray-600">Description:</span>
                      <p className="mt-1 text-gray-800">{selectedDonation.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Inspection Form */}
              <form onSubmit={handleInspection}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Inspection Result *
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="result"
                          value="approved"
                          checked={inspectionData.result === 'approved'}
                          onChange={(e) => setInspectionData({ ...inspectionData, result: e.target.value })}
                          className="w-4 h-4 text-green-600"
                          required
                        />
                        <span className="flex items-center space-x-1 text-green-600">
                          <CheckCircle size={20} />
                          <span>Approve</span>
                        </span>
                      </label>
                      
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="result"
                          value="rejected"
                          checked={inspectionData.result === 'rejected'}
                          onChange={(e) => setInspectionData({ ...inspectionData, result: e.target.value })}
                          className="w-4 h-4 text-red-600"
                          required
                        />
                        <span className="flex items-center space-x-1 text-red-600">
                          <XCircle size={20} />
                          <span>Reject</span>
                        </span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Inspection Remarks
                    </label>
                    <textarea
                      value={inspectionData.remarks}
                      onChange={(e) => setInspectionData({ ...inspectionData, remarks: e.target.value })}
                      className="input-field"
                      rows="4"
                      placeholder="Add any observations, quality notes, or reasons for rejection..."
                    ></textarea>
                  </div>
                </div>

                <div className="flex space-x-4 mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary flex-1"
                  >
                    {loading ? 'Submitting...' : 'Submit Inspection'}
                  </button>
                  <button
                    type="button"
                    onClick={closeInspectModal}
                    className="btn btn-outline flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodCheckerDashboard;
