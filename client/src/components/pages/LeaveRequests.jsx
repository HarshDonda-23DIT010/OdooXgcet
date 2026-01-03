import { useState } from 'react';
import { FileText, Plus, Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import toast from 'react-hot-toast';

const LeaveRequests = () => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: '',
    fromDate: '',
    toDate: '',
    reason: ''
  });

  const leaveTypes = ['Casual Leave', 'Annual Leave', 'Emergency Leave'];
  
  const leaveRequests = [
    {
      id: 1,
      type: 'Sick Leave',
      from: '2026-01-10',
      to: '2026-01-12',
      days: 3,
      status: 'Approved',
      appliedOn: '2026-01-03',
      reason: 'Medical checkup'
    },
    {
      id: 2,
      type: 'Casual Leave',
      from: '2025-12-20',
      to: '2025-12-22',
      days: 3,
      status: 'Pending',
      appliedOn: '2025-12-15',
      reason: 'Personal work'
    },
    {
      id: 3,
      type: 'Annual Leave',
      from: '2025-12-01',
      to: '2025-12-05',
      days: 5,
      status: 'Rejected',
      appliedOn: '2025-11-25',
      reason: 'Family vacation'
    }
  ];

  const leaveBalance = {
    casual: 8,
    annual: 15,
    emergency: 3
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement API call
    toast.success('Leave request submitted successfully!');
    setShowForm(false);
    setFormData({ leaveType: '', fromDate: '', toDate: '', reason: '' });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle className="w-5 h-5 text-[#A1CCA6]" />;
      case 'Rejected':
        return <XCircle className="w-5 h-5 text-[#FCA47C]" />;
      case 'Pending':
        return <AlertCircle className="w-5 h-5 text-[#F9D779]" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-[#A1CCA6] text-white';
      case 'Rejected':
        return 'bg-[#FCA47C] text-white';
      case 'Pending':
        return 'bg-[#F9D779] text-[#097087]';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#097087] to-[#23CED9] rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Leave Requests</h1>
            <p className="text-white/90 mt-2">Apply for leave and track your requests</p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-white text-[#097087] hover:bg-white/90 px-6 py-3"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Request
          </Button>
        </div>
      </div>

      {/* Leave Balance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-[#23CED9]">
          <p className="text-sm text-gray-600 mb-1">Casual Leave</p>
          <p className="text-3xl font-bold text-[#23CED9]">{leaveBalance.casual}</p>
          <p className="text-xs text-gray-500 mt-1">days available</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-[#A1CCA6]">
          <p className="text-sm text-gray-600 mb-1">Annual Leave</p>
          <p className="text-3xl font-bold text-[#A1CCA6]">{leaveBalance.annual}</p>
          <p className="text-xs text-gray-500 mt-1">days available</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-[#FCA47C]">
          <p className="text-sm text-gray-600 mb-1">Emergency Leave</p>
          <p className="text-3xl font-bold text-[#FCA47C]">{leaveBalance.emergency}</p>
          <p className="text-xs text-gray-500 mt-1">days available</p>
        </div>
      </div>

      {/* Leave Request Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">New Leave Request</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Leave Type *
                </label>
                <select
                  name="leaveType"
                  value={formData.leaveType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097087] focus:border-transparent"
                >
                  <option value="">Select leave type</option>
                  {leaveTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Date *
                </label>
                <input
                  type="date"
                  name="fromDate"
                  value={formData.fromDate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097087] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Date *
                </label>
                <input
                  type="date"
                  name="toDate"
                  value={formData.toDate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097087] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Days
                </label>
                <input
                  type="text"
                  value={
                    formData.fromDate && formData.toDate
                      ? Math.ceil((new Date(formData.toDate) - new Date(formData.fromDate)) / (1000 * 60 * 60 * 24)) + 1
                      : 0
                  }
                  disabled
                  className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason *
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                required
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097087] focus:border-transparent"
                placeholder="Please provide a reason for your leave..."
              />
            </div>

            <div className="flex space-x-4">
              <Button
                type="submit"
                className="px-6 py-2 bg-[#097087] hover:bg-[#23CED9] text-white"
              >
                Submit Request
              </Button>
              <Button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Leave Requests History */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">My Leave Requests</h2>
        </div>
        <div className="p-6 space-y-4">
          {leaveRequests.map((request) => (
            <div
              key={request.id}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <FileText className="w-5 h-5 text-[#097087]" />
                    <h3 className="text-lg font-bold text-gray-800">{request.type}</h3>
                    {getStatusIcon(request.status)}
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        From
                      </p>
                      <p className="font-medium text-gray-800">{request.from}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        To
                      </p>
                      <p className="font-medium text-gray-800">{request.to}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        Days
                      </p>
                      <p className="font-medium text-gray-800">{request.days} days</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Applied On</p>
                      <p className="font-medium text-gray-800">{request.appliedOn}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <p className="text-sm text-gray-500">Reason:</p>
                    <p className="text-sm text-gray-800">{request.reason}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeaveRequests;
