import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/slices/authSlice';
import { Button } from './ui/button';
import toast from 'react-hot-toast';
import { LogOut, User, Mail, Briefcase, Building } from 'lucide-react';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      toast.success('Logged out successfully');
      navigate('/signin');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Employee Management System
          </h1>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {user.employee?.firstName || 'User'}! 👋
          </h2>
          <p className="text-gray-600">
            You are logged in as{' '}
            <span className="font-semibold text-[#097087]">{user.role}</span>
          </p>
        </div>

        {/* User Profile Card */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-linear-to-r from-[#097087] to-[#23CED9] h-32"></div>
          <div className="px-6 py-4">
            <div className="flex items-center -mt-16 mb-4">
              <div className="bg-white rounded-full p-2 shadow-lg">
                <div className="bg-[#097087]/10 rounded-full p-4">
                  <User className="h-16 w-16 text-[#097087]" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {user.employee?.firstName} {user.employee?.lastName}
                </h3>
                <p className="text-gray-500">{user.employee?.designation || 'Not specified'}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-gray-900">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Briefcase className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Employee ID</p>
                    <p className="text-gray-900">{user.employee?.employeeCode || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Building className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Department</p>
                    <p className="text-gray-900">{user.employee?.department || 'Not assigned'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Role</p>
                    <p className="text-gray-900">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#097087]/10 text-[#097087]">
                        {user.role}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Attendance
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              View and manage your attendance records
            </p>
            <Button className="w-full">View Attendance</Button>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Leave Requests
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Apply for leave and track your requests
            </p>
            <Button className="w-full">Manage Leaves</Button>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Salary Details
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              View your salary and payment information
            </p>
            <Button className="w-full">View Salary</Button>
          </div>
        </div>

        {/* Admin Actions */}
        {(user.role === 'ADMIN' || user.role === 'HR') && (
          <div className="mt-8 bg-linear-to-r from-[#FCA47C] to-[#097087] rounded-lg shadow-lg p-6 text-white">
            <h3 className="text-xl font-bold mb-4">Admin / HR Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="bg-white text-[#097087] hover:bg-[#23CED9]/10">
                Manage Employees
              </Button>
              <Button variant="outline" className="bg-white text-[#097087] hover:bg-[#23CED9]/10">
                Approve Leaves
              </Button>
              <Button variant="outline" className="bg-white text-[#097087] hover:bg-[#23CED9]/10">
                View Reports
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;

