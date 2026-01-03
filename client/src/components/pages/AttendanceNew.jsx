import React, { useState, useEffect } from 'react';
import { Clock, Calendar, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';

const AttendanceNew = () => {
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchTodayAttendance();
    fetchAttendanceHistory();
  }, [page]);

  const fetchTodayAttendance = async () => {
    try {
      const response = await axios.get(`${API_URL}/attendance/today`, { withCredentials: true });
      setTodayAttendance(response.data.data);
    } catch (error) {
      console.error('Error fetching today attendance:', error);
    }
  };

  const fetchAttendanceHistory = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/attendance/my-attendance?page=${page}&limit=10`, { 
        withCredentials: true 
      });
      setAttendanceHistory(response.data.data.attendance);
      setPagination(response.data.data.pagination);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching attendance history:', error);
      toast.error('Failed to fetch attendance history');
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      const response = await axios.post(
        `${API_URL}/attendance/check-in`,
        { notes },
        { withCredentials: true }
      );
      setTodayAttendance(response.data.data);
      setNotes('');
      toast.success('Checked in successfully!');
      fetchAttendanceHistory();
    } catch (error) {
      console.error('Error checking in:', error);
      toast.error(error.response?.data?.message || 'Failed to check in');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      const response = await axios.post(
        `${API_URL}/attendance/check-out`,
        { notes },
        { withCredentials: true }
      );
      setTodayAttendance(response.data.data);
      setNotes('');
      toast.success('Checked out successfully!');
      fetchAttendanceHistory();
    } catch (error) {
      console.error('Error checking out:', error);
      toast.error(error.response?.data?.message || 'Failed to check out');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Present':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Absent':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'Half-day':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'Leave':
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      Present: 'bg-green-100 text-green-800',
      Absent: 'bg-red-100 text-red-800',
      'Half-day': 'bg-yellow-100 text-yellow-800',
      Leave: 'bg-blue-100 text-blue-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const canCheckIn = !todayAttendance || !todayAttendance.checkIn;
  const canCheckOut = todayAttendance && todayAttendance.checkIn && !todayAttendance.checkOut;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#097087] to-[#23CED9] rounded-lg p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Attendance Management</h1>
        <p className="text-white/90">Track your daily attendance and view history</p>
      </div>

      {/* Today's Attendance Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-[#097087]" />
            Today's Attendance
          </h2>
          <span className="text-sm text-gray-600">{formatDate(new Date())}</span>
        </div>

        {/* Current Status */}
        {todayAttendance && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Check In</div>
              <div className="text-2xl font-bold text-green-700">
                {formatTime(todayAttendance.checkIn)}
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Check Out</div>
              <div className="text-2xl font-bold text-red-700">
                {formatTime(todayAttendance.checkOut)}
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Working Hours</div>
              <div className="text-2xl font-bold text-blue-700">
                {todayAttendance.workingHours ? `${todayAttendance.workingHours.toFixed(2)}h` : '0h'}
              </div>
            </div>
          </div>
        )}

        {/* Notes Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about your attendance..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097087] focus:border-transparent"
            rows="2"
          />
        </div>

        {/* Check In/Out Buttons */}
        <div className="flex gap-4">
          {canCheckIn && (
            <button
              onClick={handleCheckIn}
              disabled={actionLoading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle className="w-5 h-5" />
              {actionLoading ? 'Processing...' : 'Check In'}
            </button>
          )}
          {canCheckOut && (
            <button
              onClick={handleCheckOut}
              disabled={actionLoading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Clock className="w-5 h-5" />
              {actionLoading ? 'Processing...' : 'Check Out'}
            </button>
          )}
          {!canCheckIn && !canCheckOut && (
            <div className="flex-1 p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-gray-600">You have completed today's attendance</p>
            </div>
          )}
        </div>

        {todayAttendance?.notes && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-700 mb-1">Today's Notes:</div>
            <div className="text-gray-600">{todayAttendance.notes}</div>
          </div>
        )}
      </div>

      {/* Attendance History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Clock className="w-6 h-6 text-[#097087]" />
          Attendance History
        </h2>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#097087]"></div>
          </div>
        ) : attendanceHistory.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No attendance records found
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Check In</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Check Out</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Working Hours</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceHistory.map((record) => (
                    <tr key={record._id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-900">{formatDate(record.date)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{formatTime(record.checkIn)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{formatTime(record.checkOut)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {record.workingHours ? `${record.workingHours.toFixed(2)}h` : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(record.status)}`}>
                          {getStatusIcon(record.status)}
                          {record.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{record.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-gray-600">
                  Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalRecords} records)
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={!pagination.hasMore}
                    className="px-4 py-2 bg-[#097087] text-white rounded-lg hover:bg-[#075a6a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AttendanceNew;
