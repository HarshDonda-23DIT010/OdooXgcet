import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Users,
  Clock,
  FileText,
  TrendingUp,
  UserCheck,
  UserX,
  Calendar,
  Search,
  Filter,
  Download,
  Eye,
  Edit
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [selectedView, setSelectedView] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Real data from APIs
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    pendingLeaves: 0,
    approvedLeaves: 0,
    attendanceRate: 0
  });

  const [recentEmployees, setRecentEmployees] = useState([]);
  const [pendingLeaveRequests, setPendingLeaveRequests] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendancePage, setAttendancePage] = useState(1);
  const [attendancePagination, setAttendancePagination] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (selectedView === 'attendance') {
      fetchAttendanceRecords();
    }
  }, [selectedView, attendancePage]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all employees
      const employeesResponse = await axios.get(`${API_URL}/profile/all`, {
        withCredentials: true
      });
      const employees = employeesResponse.data.data || [];

      // Fetch today's attendance using startDate and endDate
      const today = new Date();
      const todayStart = new Date(today.setHours(0, 0, 0, 0)).toISOString().split('T')[0];
      const todayEnd = new Date(today.setHours(23, 59, 59, 999)).toISOString().split('T')[0];
      
      const attendanceResponse = await axios.get(`${API_URL}/attendance/all`, {
        params: { 
          startDate: todayStart,
          endDate: todayEnd,
          limit: 1000
        },
        withCredentials: true
      });
      
      const todayAttendance = attendanceResponse.data.data?.attendance || [];

      // Calculate stats
      const totalEmployees = employees.length;
      const presentToday = todayAttendance.filter(a => 
        a.status === 'Present' || a.status === 'Half-day'
      ).length;
      const absentToday = totalEmployees - presentToday;
      const attendanceRate = totalEmployees > 0 
        ? Math.round((presentToday / totalEmployees) * 100) 
        : 0;

      setStats({
        totalEmployees,
        presentToday,
        absentToday,
        pendingLeaves: 0,
        approvedLeaves: 0,
        attendanceRate
      });

      // Set recent employees with today's attendance status
      const employeesWithStatus = employees.slice(0, 10).map(emp => {
        const attendance = todayAttendance.find(a => {
          const empId = a.employeeId?._id || a.employeeId;
          return empId?.toString() === emp._id?.toString();
        });
        
        let status = 'Absent';
        if (attendance) {
          if (attendance.status === 'Present') status = 'Present';
          else if (attendance.status === 'Half-day') status = 'Present';
          else if (attendance.status === 'Leave') status = 'On Leave';
        }
        
        return {
          id: emp._id,
          name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'N/A',
          employeeId: emp.employeeCode || 'N/A',
          department: emp.department || 'N/A',
          status: status,
          email: emp.userId?.email || emp.email || 'N/A',
          profileImage: emp.profileImage || null
        };
      });
      
      setRecentEmployees(employeesWithStatus);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error(error.response?.data?.message || 'Failed to load dashboard data');
      setLoading(false);
    }
  };

  const fetchAttendanceRecords = async () => {
    try {
      const today = new Date();
      const todayStart = new Date(today.setHours(0, 0, 0, 0)).toISOString().split('T')[0];
      
      const response = await axios.get(`${API_URL}/attendance/all`, {
        params: {
          startDate: todayStart,
          page: attendancePage,
          limit: 10
        },
        withCredentials: true
      });
      
      setAttendanceRecords(response.data.data?.attendance || []);
      setAttendancePagination(response.data.data?.pagination || null);
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      toast.error('Failed to load attendance records');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present':
        return 'bg-[#A1CCA6] text-white';
      case 'Absent':
        return 'bg-[#FCA47C] text-white';
      case 'On Leave':
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
            <h1 className="text-3xl font-bold mb-2">
              {user?.role === 'ADMIN' ? 'Admin' : 'HR'} Dashboard
            </h1>
            <p className="text-white/90">
              Manage employees, attendance, and leave requests
            </p>
          </div>
          <div className="hidden md:flex space-x-4">
            <button className="px-6 py-3 bg-white text-[#097087] rounded-lg font-medium hover:shadow-lg transition-all">
              <Download className="w-5 h-5 inline mr-2" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-gray-300 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="w-14 h-14 bg-gray-200 rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-[#097087]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Employees</p>
                <p className="text-3xl font-bold text-[#097087]">{stats.totalEmployees}</p>
                <p className="text-xs text-gray-500 mt-1">Active employees</p>
              </div>
              <div className="w-14 h-14 bg-[#097087]/10 rounded-xl flex items-center justify-center">
                <Users className="w-7 h-7 text-[#097087]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-[#A1CCA6]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Present Today</p>
                <p className="text-3xl font-bold text-[#A1CCA6]">{stats.presentToday}</p>
                <p className="text-xs text-gray-500 mt-1">Out of {stats.totalEmployees}</p>
              </div>
              <div className="w-14 h-14 bg-[#A1CCA6]/10 rounded-xl flex items-center justify-center">
                <UserCheck className="w-7 h-7 text-[#A1CCA6]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-[#FCA47C]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Absent Today</p>
                <p className="text-3xl font-bold text-[#FCA47C]">{stats.absentToday}</p>
                <p className="text-xs text-gray-500 mt-1">Including leaves</p>
              </div>
              <div className="w-14 h-14 bg-[#FCA47C]/10 rounded-xl flex items-center justify-center">
                <UserX className="w-7 h-7 text-[#FCA47C]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-[#F9D779]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Leaves</p>
                <p className="text-3xl font-bold text-[#F9D779]">{stats.pendingLeaves}</p>
                <p className="text-xs text-gray-500 mt-1">Needs approval</p>
              </div>
              <div className="w-14 h-14 bg-[#F9D779]/10 rounded-xl flex items-center justify-center">
                <FileText className="w-7 h-7 text-[#F9D779]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-[#23CED9]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Attendance Rate</p>
                <p className="text-3xl font-bold text-[#23CED9]">{stats.attendanceRate}%</p>
                <p className="text-xs text-gray-500 mt-1">Today</p>
              </div>
              <div className="w-14 h-14 bg-[#23CED9]/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-[#23CED9]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-[#A1CCA6]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Approved Leaves</p>
                <p className="text-3xl font-bold text-[#A1CCA6]">{stats.approvedLeaves}</p>
                <p className="text-xs text-gray-500 mt-1">Coming soon</p>
              </div>
              <div className="w-14 h-14 bg-[#A1CCA6]/10 rounded-xl flex items-center justify-center">
                <Calendar className="w-7 h-7 text-[#A1CCA6]" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg p-2">
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedView('overview')}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
              selectedView === 'overview'
                ? 'bg-[#097087] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Employee List
          </button>
          <button
            onClick={() => setSelectedView('attendance')}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
              selectedView === 'attendance'
                ? 'bg-[#097087] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Attendance Records
          </button>
          <button
            onClick={() => setSelectedView('leaves')}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
              selectedView === 'leaves'
                ? 'bg-[#097087] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Leave Approvals
          </button>
        </div>
      </div>

      {/* Employee List View */}
      {selectedView === 'overview' && (
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <h2 className="text-2xl font-bold text-gray-800">Employee List</h2>
              <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097087] focus:border-transparent"
                  />
                </div>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center">
                  <Filter className="w-5 h-5 mr-2" />
                  Filter
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  [...Array(5)].map((_, index) => (
                    <tr key={index} className="animate-pulse">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                          <div className="ml-4 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-32"></div>
                            <div className="h-3 bg-gray-200 rounded w-24"></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <div className="h-5 w-5 bg-gray-200 rounded"></div>
                          <div className="h-5 w-5 bg-gray-200 rounded"></div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : recentEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      No employees found
                    </td>
                  </tr>
                ) : (
                  recentEmployees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden">
                            {employee.profileImage ? (
                              <img 
                                src={employee.profileImage} 
                                alt={employee.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-[#097087] to-[#23CED9] flex items-center justify-center">
                                <span className="text-white font-bold text-sm">
                                  {employee.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                            <div className="text-sm text-gray-500">{employee.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{employee.employeeId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{employee.department}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(employee.status)}`}>
                          {employee.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Leave Approvals View */}
      {selectedView === 'leaves' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Pending Leave Approvals</h2>
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Leave management feature coming soon</p>
            <p className="text-gray-400 text-sm mt-2">This feature will be available once leave request APIs are implemented</p>
          </div>
        </div>
      )}

      {/* Attendance Records View */}
      {selectedView === 'attendance' && (
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">Today's Attendance Records</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check In
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check Out
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Working Hours
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceRecords.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No attendance records found for today
                    </td>
                  </tr>
                ) : (
                  attendanceRecords.map((record) => (
                    <tr key={record._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-[#097087]/10 rounded-full flex items-center justify-center">
                            <span className="text-[#097087] font-bold">
                              {record.employeeId?.firstName?.[0]}{record.employeeId?.lastName?.[0]}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {record.employeeId?.firstName} {record.employeeId?.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {record.employeeId?.employeeCode}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {record.employeeId?.department || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {record.checkIn 
                            ? new Date(record.checkIn).toLocaleTimeString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })
                            : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {record.checkOut 
                            ? new Date(record.checkOut).toLocaleTimeString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })
                            : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {record.workingHours ? `${record.workingHours.toFixed(2)}h` : '0h'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {attendancePagination && attendancePagination.totalPages > 1 && (
            <div className="p-6 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {attendancePagination.currentPage} of {attendancePagination.totalPages} 
                ({attendancePagination.totalRecords} records)
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setAttendancePage(prev => Math.max(1, prev - 1))}
                  disabled={attendancePage === 1}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setAttendancePage(prev => prev + 1)}
                  disabled={!attendancePagination.hasMore}
                  className="px-4 py-2 bg-[#097087] text-white rounded-lg hover:bg-[#075a6a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
