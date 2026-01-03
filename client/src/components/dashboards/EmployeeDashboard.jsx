import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  UserCircle,
  Clock,
  FileText,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  DollarSign
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const EmployeeDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    attendanceRate: 0,
    leavesRemaining: 0,
    pendingLeaves: 0,
    netSalary: 0,
    totalLeavesTaken: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/dashboard/employee-stats`, { 
        withCredentials: true 
      });

      const dashboardData = response.data.data;
      
      setStats({
        attendanceRate: dashboardData.stats.attendanceRate,
        leavesRemaining: dashboardData.stats.leavesRemaining,
        pendingLeaves: dashboardData.stats.pendingLeaves,
        netSalary: dashboardData.stats.netSalary,
        totalLeavesTaken: 0
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const quickAccessCards = [
    {
      title: 'My Profile',
      icon: UserCircle,
      color: 'from-[#097087] to-[#23CED9]',
      link: '/profile',
      description: 'View and update your personal information'
    },
    {
      title: 'Attendance',
      icon: Clock,
      color: 'from-[#23CED9] to-[#A1CCA6]',
      link: '/attendance',
      description: 'Mark attendance and view history'
    },
    {
      title: 'Leave Management',
      icon: FileText,
      color: 'from-[#FCA47C] to-[#F9D779]',
      link: '/leave',
      description: 'Apply for leave and track status'
    },
    {
      title: 'My Payroll',
      icon: DollarSign,
      color: 'from-[#A1CCA6] to-[#F9D779]',
      link: '/payroll',
      description: 'View salary details and payment history'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'success',
      message: 'Attendance marked successfully',
      time: '2 hours ago',
      icon: CheckCircle,
      color: 'text-[#A1CCA6]'
    },
    {
      id: 2,
      type: 'warning',
      message: 'Leave request pending approval',
      time: '1 day ago',
      icon: AlertCircle,
      color: 'text-[#F9D779]'
    },
    {
      id: 3,
      type: 'info',
      message: 'Profile updated successfully',
      time: '3 days ago',
      icon: CheckCircle,
      color: 'text-[#23CED9]'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#097087] to-[#23CED9] rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.employee?.firstName}! 👋
            </h1>
            <p className="text-white/90">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
              <UserCircle className="w-16 h-16" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-[#097087]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Attendance Rate</p>
              <p className="text-3xl font-bold text-[#097087]">
                {loading ? '...' : `${stats.attendanceRate}%`}
              </p>
            </div>
            <div className="w-12 h-12 bg-[#097087]/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-[#097087]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-[#A1CCA6]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Leaves Remaining</p>
              <p className="text-3xl font-bold text-[#A1CCA6]">
                {loading ? '...' : stats.leavesRemaining}
              </p>
            </div>
            <div className="w-12 h-12 bg-[#A1CCA6]/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-[#A1CCA6]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-[#F9D779]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending Leaves</p>
              <p className="text-3xl font-bold text-[#F9D779]">
                {loading ? '...' : stats.pendingLeaves}
              </p>
            </div>
            <div className="w-12 h-12 bg-[#F9D779]/10 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-[#F9D779]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-[#23CED9]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Net Salary</p>
              <p className="text-2xl font-bold text-[#23CED9]">
                {loading ? '...' : `₹${stats.netSalary.toLocaleString('en-IN')}`}
              </p>
            </div>
            <div className="w-12 h-12 bg-[#23CED9]/10 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-[#23CED9]" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickAccessCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.title}
                to={card.link}
                className="group bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{card.title}</h3>
                <p className="text-sm text-gray-600">{card.description}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {recentActivities.map((activity) => {
            const Icon = activity.icon;
            return (
              <div
                key={activity.id}
                className="flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className={`flex-shrink-0 ${activity.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 font-medium">{activity.message}</p>
                  <p className="text-sm text-gray-500">{activity.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alerts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-[#FCA47C]/20 to-[#F9D779]/20 border-l-4 border-[#FCA47C] rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-[#FCA47C] flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-gray-800 mb-2">Reminder</h3>
              <p className="text-sm text-gray-700">
                Don't forget to mark your attendance today before 10:00 AM
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#A1CCA6]/20 to-[#23CED9]/20 border-l-4 border-[#A1CCA6] rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-6 h-6 text-[#A1CCA6] flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-gray-800 mb-2">Good Job!</h3>
              <p className="text-sm text-gray-700">
                You have maintained 100% attendance this week. Keep it up!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
