import { useState } from 'react';
import { useSelector } from 'react-redux';
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

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [selectedView, setSelectedView] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - replace with actual API calls
  const stats = {
    totalEmployees: 156,
    presentToday: 142,
    absentToday: 14,
    pendingLeaves: 8,
    approvedLeaves: 23,
    attendanceRate: 91
  };

  const recentEmployees = [
    {
      id: 1,
      name: 'John Doe',
      employeeId: 'EMP001',
      department: 'Engineering',
      status: 'Present',
      email: 'john@example.com'
    },
    {
      id: 2,
      name: 'Jane Smith',
      employeeId: 'EMP002',
      department: 'HR',
      status: 'Present',
      email: 'jane@example.com'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      employeeId: 'EMP003',
      department: 'Sales',
      status: 'On Leave',
      email: 'mike@example.com'
    },
    {
      id: 4,
      name: 'Sarah Williams',
      employeeId: 'EMP004',
      department: 'Marketing',
      status: 'Absent',
      email: 'sarah@example.com'
    },
    {
      id: 5,
      name: 'David Brown',
      employeeId: 'EMP005',
      department: 'Engineering',
      status: 'Present',
      email: 'david@example.com'
    }
  ];

  const pendingLeaveRequests = [
    {
      id: 1,
      employeeName: 'Alice Cooper',
      type: 'Sick Leave',
      from: '2026-01-05',
      to: '2026-01-07',
      days: 3,
      status: 'Pending'
    },
    {
      id: 2,
      employeeName: 'Bob Martin',
      type: 'Casual Leave',
      from: '2026-01-10',
      to: '2026-01-12',
      days: 3,
      status: 'Pending'
    },
    {
      id: 3,
      employeeName: 'Carol White',
      type: 'Annual Leave',
      from: '2026-01-15',
      to: '2026-01-20',
      days: 6,
      status: 'Pending'
    }
  ];

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
              <p className="text-xs text-gray-500 mt-1">This month</p>
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
              <p className="text-xs text-gray-500 mt-1">This month</p>
            </div>
            <div className="w-14 h-14 bg-[#A1CCA6]/10 rounded-xl flex items-center justify-center">
              <Calendar className="w-7 h-7 text-[#A1CCA6]" />
            </div>
          </div>
        </div>
      </div>

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
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-[#097087]/10 rounded-full flex items-center justify-center">
                          <span className="text-[#097087] font-bold">
                            {employee.name.split(' ').map(n => n[0]).join('')}
                          </span>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button className="text-[#23CED9] hover:text-[#097087] transition-colors">
                        <Eye className="w-5 h-5" />
                      </button>
                      <button className="text-[#097087] hover:text-[#23CED9] transition-colors">
                        <Edit className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Leave Approvals View */}
      {selectedView === 'leaves' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Pending Leave Approvals</h2>
          <div className="space-y-4">
            {pendingLeaveRequests.map((request) => (
              <div
                key={request.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                      {request.employeeName}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Type</p>
                        <p className="font-medium text-gray-800">{request.type}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">From</p>
                        <p className="font-medium text-gray-800">{request.from}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">To</p>
                        <p className="font-medium text-gray-800">{request.to}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Days</p>
                        <p className="font-medium text-gray-800">{request.days} days</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-3 ml-6">
                    <button className="px-6 py-2 bg-[#A1CCA6] text-white rounded-lg hover:bg-[#A1CCA6]/90 transition-colors font-medium">
                      Approve
                    </button>
                    <button className="px-6 py-2 bg-[#FCA47C] text-white rounded-lg hover:bg-[#FCA47C]/90 transition-colors font-medium">
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attendance Records View */}
      {selectedView === 'attendance' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Attendance Records</h2>
          <p className="text-gray-600">Attendance records feature coming soon...</p>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
