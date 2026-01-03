import React, { useState, useEffect } from 'react';
import { Calendar, Download, Filter, Search, Users, FileText } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';

const AdminAttendanceManagement = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  
  // Filters
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: '',
    employeeId: '',
    searchQuery: ''
  });

  useEffect(() => {
    fetchAttendanceRecords();
    fetchSummary();
    fetchEmployees();
  }, [page, filters]);

  const fetchAttendanceRecords = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 20,
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.status && { status: filters.status }),
        ...(filters.employeeId && { employeeId: filters.employeeId })
      });

      const response = await axios.get(`${API_URL}/attendance/all?${params}`, { 
        withCredentials: true 
      });
      setAttendanceRecords(response.data.data.attendance);
      setPagination(response.data.data.pagination);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      toast.error('Failed to fetch attendance records');
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const params = new URLSearchParams({
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate })
      });

      const response = await axios.get(`${API_URL}/attendance/summary?${params}`, { 
        withCredentials: true 
      });
      setSummary(response.data.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${API_URL}/profile/all`, { 
        withCredentials: true 
      });
      setEmployees(response.data.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleExportAttendance = async () => {
    try {
      const params = new URLSearchParams({
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.status && { status: filters.status }),
        ...(filters.employeeId && { employeeId: filters.employeeId })
      });

      const response = await axios.get(`${API_URL}/attendance/export/excel?${params}`, {
        withCredentials: true,
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Attendance exported successfully!');
    } catch (error) {
      console.error('Error exporting attendance:', error);
      toast.error('Failed to export attendance');
    }
  };

  const handleExportEmployees = async () => {
    try {
      const response = await axios.get(`${API_URL}/attendance/export/employees`, {
        withCredentials: true,
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `employees_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Employee list exported successfully!');
    } catch (error) {
      console.error('Error exporting employees:', error);
      toast.error('Failed to export employee list');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page on filter change
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      status: '',
      employeeId: '',
      searchQuery: ''
    });
    setPage(1);
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

  const getStatusBadge = (status) => {
    const styles = {
      Present: 'bg-green-100 text-green-800',
      Absent: 'bg-red-100 text-red-800',
      'Half-day': 'bg-yellow-100 text-yellow-800',
      Leave: 'bg-blue-100 text-blue-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  // Filter displayed records by search query
  const filteredRecords = attendanceRecords.filter(record => {
    if (!filters.searchQuery) return true;
    const searchLower = filters.searchQuery.toLowerCase();
    const employeeName = `${record.employeeId?.firstName} ${record.employeeId?.lastName}`.toLowerCase();
    const employeeCode = record.employeeId?.employeeCode?.toLowerCase() || '';
    return employeeName.includes(searchLower) || employeeCode.includes(searchLower);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#097087] to-[#23CED9] rounded-lg p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Attendance Management</h1>
        <p className="text-white/90">View and manage employee attendance records</p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">Total Records</div>
            <div className="text-3xl font-bold text-gray-900">{summary.total}</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-md p-6">
            <div className="text-sm text-green-700 mb-1">Present</div>
            <div className="text-3xl font-bold text-green-800">{summary.Present}</div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow-md p-6">
            <div className="text-sm text-red-700 mb-1">Absent</div>
            <div className="text-3xl font-bold text-red-800">{summary.Absent}</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg shadow-md p-6">
            <div className="text-sm text-yellow-700 mb-1">Half-day</div>
            <div className="text-3xl font-bold text-yellow-800">{summary['Half-day']}</div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md p-6">
            <div className="text-sm text-blue-700 mb-1">Leave</div>
            <div className="text-3xl font-bold text-blue-800">{summary.Leave}</div>
          </div>
        </div>
      )}

      {/* Filters and Export */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Filter className="w-5 h-5 text-[#097087]" />
            Filters
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handleExportEmployees}
              className="flex items-center gap-2 px-4 py-2 bg-[#23CED9] text-white rounded-lg hover:bg-[#1ab8c9] transition-colors"
            >
              <FileText className="w-4 h-4" />
              Export Employees
            </button>
            <button
              onClick={handleExportAttendance}
              className="flex items-center gap-2 px-4 py-2 bg-[#097087] text-white rounded-lg hover:bg-[#075a6a] transition-colors"
            >
              <Download className="w-4 h-4" />
              Export Attendance
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Name or Code..."
                value={filters.searchQuery}
                onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097087] focus:border-transparent"
              />
            </div>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097087] focus:border-transparent"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097087] focus:border-transparent"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097087] focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Half-day">Half-day</option>
              <option value="Leave">Leave</option>
            </select>
          </div>

          {/* Employee */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
            <select
              value={filters.employeeId}
              onChange={(e) => handleFilterChange('employeeId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097087] focus:border-transparent"
            >
              <option value="">All Employees</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>
                  {emp.employeeCode} - {emp.firstName} {emp.lastName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Attendance Records Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#097087]" />
          Attendance Records
        </h2>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#097087]"></div>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No attendance records found
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Employee</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Department</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Check In</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Check Out</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Hours</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record) => (
                    <tr key={record._id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">
                          {record.employeeId?.firstName} {record.employeeId?.lastName}
                        </div>
                        <div className="text-xs text-gray-500">{record.employeeId?.employeeCode}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{record.employeeId?.department || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{formatDate(record.date)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{formatTime(record.checkIn)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{formatTime(record.checkOut)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {record.workingHours ? `${record.workingHours.toFixed(2)}h` : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(record.status)}`}>
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

export default AdminAttendanceManagement;
