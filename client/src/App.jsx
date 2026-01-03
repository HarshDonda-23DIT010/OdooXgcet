import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getCurrentUser } from './store/slices/authSlice'

// Auth Pages
import SignUp from './features/auth/SignUp'
import SignIn from './features/auth/SignIn'
import VerifyEmail from './features/auth/VerifyEmailOTP'

// Layout
import DashboardLayout from './components/layout/DashboardLayout'
import ProtectedRoute from './components/ProtectedRoute'

// Dashboard Pages
import EmployeeDashboard from './components/dashboards/EmployeeDashboard'
import AdminDashboard from './components/dashboards/AdminDashboard'
import ProfileNew from './components/pages/ProfileNew'
import AttendanceNew from './components/pages/AttendanceNew'
import AdminAttendanceManagement from './components/pages/AdminAttendanceManagement'
import LeaveRequests from './components/pages/LeaveRequests'

function App() {
  const dispatch = useDispatch()
  const { isAuthenticated, user } = useSelector((state) => state.auth)

  useEffect(() => {
    // Try to get current user on app load only once
    dispatch(getCurrentUser())
  }, [])

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'HR'

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/signup" 
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <SignUp />} 
      />
      <Route 
        path="/signin" 
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <SignIn />} 
      />
      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* Protected Routes with Dashboard Layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" />} />
        <Route 
          path="dashboard" 
          element={isAdmin ? <AdminDashboard /> : <EmployeeDashboard />} 
        />
        <Route path="profile" element={<ProfileNew />} />
        <Route path="attendance" element={<AttendanceNew />} />
        <Route path="leave-requests" element={<LeaveRequests />} />
        
        {/* Admin/HR Only Routes */}
        {isAdmin && (
          <>
            <Route path="employees" element={<div>Employees Page Coming Soon</div>} />
            <Route path="attendance-management" element={<AdminAttendanceManagement />} />
            <Route path="leave-approvals" element={<div>Leave Approvals Coming Soon</div>} />
            <Route path="departments" element={<div>Departments Coming Soon</div>} />
            <Route path="settings" element={<div>Settings Coming Soon</div>} />
          </>
        )}
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App
