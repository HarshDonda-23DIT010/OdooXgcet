import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Clock,
  UserCircle,
  LogOut,
  Menu,
  X,
  CheckSquare,
  Settings,
  Briefcase,
  DollarSign
} from 'lucide-react';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'HR';

  const employeeMenuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/profile', icon: UserCircle, label: 'My Profile' },
    { path: '/attendance', icon: Clock, label: 'Attendance' },
    { path: '/leave', icon: FileText, label: 'Leave Management' },
    { path: '/payroll', icon: DollarSign, label: 'My Payroll' },
  ];

  const adminMenuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/employees', icon: Users, label: 'Employees' },
    { path: '/attendance-management', icon: Calendar, label: 'Attendance Management' },
    { path: '/leave-approvals', icon: CheckSquare, label: 'Leave Approvals' },
    { path: '/payroll-management', icon: DollarSign, label: 'Payroll Management' },
    { path: '/profile', icon: UserCircle, label: 'My Profile' },
  ];

  const menuItems = isAdmin ? adminMenuItems : employeeMenuItems;

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      toast.success('Logged out successfully');
      navigate('/signin');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-[#097087] text-white"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-gradient-to-b from-[#097087] to-[#23CED9] text-white transition-transform duration-300 z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 ${isOpen ? 'w-64' : 'w-20'}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center justify-between">
              {isOpen && (
                <div>
                  <h1 className="text-2xl font-bold">GCET EMS</h1>
                  <p className="text-xs text-white/80 mt-1">
                    {isAdmin ? 'Admin Panel' : 'Employee Portal'}
                  </p>
                </div>
              )}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="hidden lg:block p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* User Info */}
          {isOpen && (
            <div className="p-4 border-b border-white/20">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <UserCircle className="h-8 w-8" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">
                    {user?.employee?.firstName} {user?.employee?.lastName}
                  </p>
                  <p className="text-xs text-white/80 truncate">{user?.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-[#F9D779] text-[#097087] font-medium">
                    {user?.role}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Menu */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-3">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                        active
                          ? 'bg-white text-[#097087] shadow-lg'
                          : 'text-white hover:bg-white/10'
                      }`}
                      title={!isOpen ? item.label : ''}
                    >
                      <Icon className={`h-5 w-5 ${active ? 'text-[#097087]' : ''}`} />
                      {isOpen && (
                        <span className="font-medium">{item.label}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-white/20">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-white hover:bg-red-500/20 transition-colors"
              title={!isOpen ? 'Logout' : ''}
            >
              <LogOut className="h-5 w-5" />
              {isOpen && <span className="font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
