import React, { useState, useEffect } from 'react';
import { Users, Search, Download, Eye, FileText, Filter, X, Mail, Phone, MapPin, Calendar, Briefcase, DollarSign, User } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filters, setFilters] = useState({
    department: '',
    status: '',
    employmentType: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/profile/all`, {
        withCredentials: true
      });
      setEmployees(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to fetch employees');
      setLoading(false);
    }
  };

  const handleExportEmployees = async () => {
    try {
      const response = await axios.get(`${API_URL}/attendance/export/employees`, {
        withCredentials: true,
        responseType: 'blob'
      });

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

  const clearFilters = () => {
    setFilters({
      department: '',
      status: '',
      employmentType: ''
    });
    setSearchQuery('');
  };

  // Filter employees based on search and filters
  const filteredEmployees = employees.filter(emp => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      emp.firstName?.toLowerCase().includes(searchLower) ||
      emp.lastName?.toLowerCase().includes(searchLower) ||
      emp.employeeCode?.toLowerCase().includes(searchLower) ||
      emp.userId?.email?.toLowerCase().includes(searchLower);

    const matchesDepartment = !filters.department || emp.department === filters.department;
    const matchesStatus = !filters.status || emp.status === filters.status;
    const matchesEmploymentType = !filters.employmentType || emp.employmentType === filters.employmentType;

    return matchesSearch && matchesDepartment && matchesStatus && matchesEmploymentType;
  });

  // Get unique departments and employment types for filters
  const departments = [...new Set(employees.map(emp => emp.department).filter(Boolean))];
  const employmentTypes = [...new Set(employees.map(emp => emp.employmentType).filter(Boolean))];

  const getStatusBadge = (status) => {
    const styles = {
      Active: 'bg-green-100 text-green-800',
      Inactive: 'bg-red-100 text-red-800',
      'On Leave': 'bg-yellow-100 text-yellow-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#097087] to-[#23CED9] rounded-lg p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Employee Management</h1>
            <p className="text-white/90">Manage all employee profiles and information</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportEmployees}
              className="flex items-center gap-2 px-4 py-2 bg-white text-[#097087] rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              <Download className="w-4 h-4" />
              Export to Excel
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-600 mb-1">Total Employees</div>
          <div className="text-3xl font-bold text-[#097087]">{employees.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-600 mb-1">Active</div>
          <div className="text-3xl font-bold text-green-600">
            {employees.filter(e => e.status === 'Active').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-600 mb-1">Departments</div>
          <div className="text-3xl font-bold text-[#23CED9]">{departments.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-600 mb-1">On Leave</div>
          <div className="text-3xl font-bold text-yellow-600">
            {employees.filter(e => e.status === 'On Leave').length}
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#097087]" />
            Employee List
          </h2>
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-initial md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097087] focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                showFilters
                  ? 'bg-[#097087] text-white border-[#097087]'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>

        {/* Filter Section */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097087] focus:border-transparent"
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097087] focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
              <select
                value={filters.employmentType}
                onChange={(e) => setFilters({ ...filters, employmentType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097087] focus:border-transparent"
              >
                <option value="">All Types</option>
                {employmentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Employee Table */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#097087]"></div>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No employees found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Employee</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Code</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Department</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Designation</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Employment Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr key={employee._id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden">
                          {employee.profileImage ? (
                            <img 
                              src={employee.profileImage} 
                              alt={`${employee.firstName} ${employee.lastName}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#097087] to-[#23CED9] flex items-center justify-center">
                              <span className="text-white font-bold text-sm">
                                {employee.firstName?.[0]}{employee.lastName?.[0]}
                              </span>
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {employee.firstName} {employee.lastName}
                          </div>
                          <div className="text-xs text-gray-500">{employee.userId?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{employee.employeeCode}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{employee.department || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{employee.designation || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{employee.employmentType || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(employee.status)}`}>
                        {employee.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button 
                        className="text-[#097087] hover:text-[#23CED9] transition-colors"
                        onClick={() => {
                          setSelectedEmployee(employee);
                          setShowDetailModal(true);
                        }}
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Results count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredEmployees.length} of {employees.length} employees
        </div>
      </div>

      {/* Employee Detail Modal */}
      {showDetailModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header with Profile */}
            <div className="relative">
              <div className="bg-gradient-to-r from-[#097087] to-[#23CED9] h-32"></div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
              
              <div className="px-8 pb-6">
                <div className="flex items-end justify-between -mt-16">
                  <div className="flex items-end space-x-4">
                    {/* Profile Image */}
                    <div className="w-32 h-32 bg-white rounded-full border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
                      {selectedEmployee.profileImage ? (
                        <img 
                          src={selectedEmployee.profileImage} 
                          alt={`${selectedEmployee.firstName} ${selectedEmployee.lastName}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#097087] to-[#23CED9] flex items-center justify-center">
                          <span className="text-white text-4xl font-bold">
                            {selectedEmployee.firstName?.[0]}{selectedEmployee.lastName?.[0]}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="pb-2 text-white">
                      <h2 className="text-3xl font-bold">
                        {selectedEmployee.firstName} {selectedEmployee.lastName}
                      </h2>
                      <p className="text-white/90 text-lg">
                        {selectedEmployee.designation || 'Employee'} • {selectedEmployee.employeeCode}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedEmployee.status)}`}>
                          {selectedEmployee.status}
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white">
                          {selectedEmployee.employmentType || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="px-8 pb-8 space-y-8">
              {/* Contact Information */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-[#097087]">
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-[#097087]/10 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-[#097087]" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Email Address</div>
                      <div className="font-medium text-gray-900">{selectedEmployee.userId?.email || selectedEmployee.email || 'N/A'}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-[#097087]/10 rounded-lg flex items-center justify-center">
                      <Phone className="w-5 h-5 text-[#097087]" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Phone Number</div>
                      <div className="font-medium text-gray-900">{selectedEmployee.phone || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-[#097087]">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Date of Birth</div>
                    <div className="font-medium text-gray-900">
                      {selectedEmployee.dateOfBirth 
                        ? new Date(selectedEmployee.dateOfBirth).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })
                        : 'N/A'}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Gender</div>
                    <div className="font-medium text-gray-900">{selectedEmployee.gender || 'N/A'}</div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Marital Status</div>
                    <div className="font-medium text-gray-900">{selectedEmployee.maritalStatus || 'N/A'}</div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Nationality</div>
                    <div className="font-medium text-gray-900">{selectedEmployee.nationality || 'N/A'}</div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Blood Group</div>
                    <div className="font-medium text-gray-900">{selectedEmployee.bloodGroup || 'N/A'}</div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Languages</div>
                    <div className="font-medium text-gray-900">
                      {selectedEmployee.languages?.join(', ') || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-[#097087]">
                  Address Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Street Address</div>
                    <div className="font-medium text-gray-900">{selectedEmployee.address || 'N/A'}</div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">City</div>
                    <div className="font-medium text-gray-900">{selectedEmployee.city || 'N/A'}</div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">State / Province</div>
                    <div className="font-medium text-gray-900">{selectedEmployee.state || 'N/A'}</div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Postal Code</div>
                    <div className="font-medium text-gray-900">{selectedEmployee.postalCode || 'N/A'}</div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg md:col-span-2">
                    <div className="text-xs text-gray-500 mb-1">Country</div>
                    <div className="font-medium text-gray-900">{selectedEmployee.country || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Employment Details */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-[#097087]">
                  Employment Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Department</div>
                    <div className="font-medium text-gray-900">{selectedEmployee.department || 'N/A'}</div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Designation</div>
                    <div className="font-medium text-gray-900">{selectedEmployee.designation || 'N/A'}</div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Employment Type</div>
                    <div className="font-medium text-gray-900">{selectedEmployee.employmentType || 'N/A'}</div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Join Date</div>
                    <div className="font-medium text-gray-900">
                      {selectedEmployee.joinDate 
                        ? new Date(selectedEmployee.joinDate).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })
                        : 'N/A'}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Work Location</div>
                    <div className="font-medium text-gray-900">{selectedEmployee.workLocation || 'N/A'}</div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Reporting Manager</div>
                    <div className="font-medium text-gray-900">{selectedEmployee.managerId || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Salary Information */}
              {selectedEmployee.baseSalary && (
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-[#097087]">
                    Compensation Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                      <div className="text-xs text-green-700 mb-1">Base Salary</div>
                      <div className="font-bold text-2xl text-green-800">
                        ${selectedEmployee.baseSalary?.toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">Payment Frequency</div>
                      <div className="font-medium text-gray-900">{selectedEmployee.paymentFrequency || 'N/A'}</div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">Currency</div>
                      <div className="font-medium text-gray-900">{selectedEmployee.currency || 'USD'}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bank Information */}
              {selectedEmployee.bankAccountNumber && (
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-[#097087]">
                    Bank Account Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">Bank Name</div>
                      <div className="font-medium text-gray-900">{selectedEmployee.bankName || 'N/A'}</div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">Account Number</div>
                      <div className="font-medium text-gray-900">{selectedEmployee.bankAccountNumber || 'N/A'}</div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">IFSC Code</div>
                      <div className="font-medium text-gray-900">{selectedEmployee.ifscCode || 'N/A'}</div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">Branch</div>
                      <div className="font-medium text-gray-900">{selectedEmployee.bankBranch || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Emergency Contact */}
              {selectedEmployee.emergencyContactName && (
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-[#097087]">
                    Emergency Contact
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="text-xs text-red-700 mb-1">Contact Name</div>
                      <div className="font-medium text-gray-900">{selectedEmployee.emergencyContactName}</div>
                    </div>
                    
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="text-xs text-red-700 mb-1">Phone Number</div>
                      <div className="font-medium text-gray-900">{selectedEmployee.emergencyContactPhone || 'N/A'}</div>
                    </div>
                    
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="text-xs text-red-700 mb-1">Relationship</div>
                      <div className="font-medium text-gray-900">{selectedEmployee.emergencyContactRelationship || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Documents */}
              {selectedEmployee.documents && selectedEmployee.documents.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-[#097087]">
                    Documents
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedEmployee.documents.map((doc, index) => (
                      <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <FileText className="w-8 h-8 text-[#097087]" />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{doc.type}</div>
                          <div className="text-xs text-gray-500">{doc.name || 'Document'}</div>
                        </div>
                        {doc.url && (
                          <a 
                            href={doc.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[#097087] hover:text-[#23CED9]"
                          >
                            <Eye className="w-5 h-5" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education & Experience */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedEmployee.education && selectedEmployee.education.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-3 pb-2 border-b border-[#097087]">
                      Education
                    </h3>
                    <div className="space-y-3">
                      {selectedEmployee.education.map((edu, index) => (
                        <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="font-medium text-gray-900">{edu.degree}</div>
                          <div className="text-sm text-gray-600">{edu.institution}</div>
                          <div className="text-xs text-gray-500">{edu.year}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedEmployee.workExperience && selectedEmployee.workExperience.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-3 pb-2 border-b border-[#097087]">
                      Work Experience
                    </h3>
                    <div className="space-y-3">
                      {selectedEmployee.workExperience.map((exp, index) => (
                        <div key={index} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="font-medium text-gray-900">{exp.position}</div>
                          <div className="text-sm text-gray-600">{exp.company}</div>
                          <div className="text-xs text-gray-500">{exp.duration}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Skills & Certifications */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedEmployee.skills && selectedEmployee.skills.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-3 pb-2 border-b border-[#097087]">
                      Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedEmployee.skills.map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-[#097087] text-white rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedEmployee.certifications && selectedEmployee.certifications.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-3 pb-2 border-b border-[#097087]">
                      Certifications
                    </h3>
                    <div className="space-y-2">
                      {selectedEmployee.certifications.map((cert, index) => (
                        <div key={index} className="p-2 bg-yellow-50 rounded-lg border border-yellow-200 text-sm">
                          <div className="font-medium text-gray-900">{cert.name}</div>
                          <div className="text-xs text-gray-500">{cert.issuer} • {cert.year}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
