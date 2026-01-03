import React, { useState, useEffect } from 'react';
import { DollarSign, Users, TrendingUp, Edit, Save, X, Search } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';

const AdminPayrollManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editFormData, setEditFormData] = useState({
    basicSalary: 0,
    allowances: {
      hra: 0,
      transport: 0,
      medical: 0,
      other: 0
    },
    deductions: {
      tax: 0,
      providentFund: 0,
      insurance: 0,
      other: 0
    }
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [employeesRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/salary/all`, { withCredentials: true }),
        axios.get(`${API_URL}/salary/statistics`, { withCredentials: true })
      ]);

      setEmployees(employeesRes.data.data.salaries);
      setStatistics(statsRes.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch payroll data');
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const startEditing = (employee) => {
    setEditingEmployee(employee.employeeId);
    setEditFormData({
      basicSalary: employee.basicSalary || 0,
      allowances: {
        hra: employee.allowances?.hra || 0,
        transport: employee.allowances?.transport || 0,
        medical: employee.allowances?.medical || 0,
        other: employee.allowances?.other || 0
      },
      deductions: {
        tax: employee.deductions?.tax || 0,
        providentFund: employee.deductions?.providentFund || 0,
        insurance: employee.deductions?.insurance || 0,
        other: employee.deductions?.other || 0
      }
    });
  };

  const cancelEditing = () => {
    setEditingEmployee(null);
    setEditFormData({
      basicSalary: 0,
      allowances: { hra: 0, transport: 0, medical: 0, other: 0 },
      deductions: { tax: 0, providentFund: 0, insurance: 0, other: 0 }
    });
  };

  const handleSalaryUpdate = async (employeeId) => {
    try {
      await axios.put(
        `${API_URL}/salary/${employeeId}`,
        editFormData,
        { withCredentials: true }
      );

      toast.success('Salary updated successfully!');
      setEditingEmployee(null);
      fetchData();
    } catch (error) {
      console.error('Error updating salary:', error);
      toast.error(error.response?.data?.message || 'Failed to update salary');
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const searchLower = searchQuery.toLowerCase();
    return (
      emp.employeeName?.toLowerCase().includes(searchLower) ||
      emp.employeeCode?.toLowerCase().includes(searchLower) ||
      emp.department?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#097087] to-[#23CED9] rounded-lg p-6 text-white shadow-lg">
        <div>
          <h1 className="text-3xl font-bold mb-2">Payroll Management</h1>
          <p className="text-white/90">Manage employee salary structure and payroll</p>
        </div>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-[#097087] to-[#23CED9] rounded-lg shadow-md p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm opacity-90">Total Monthly Payroll</div>
              <DollarSign className="w-6 h-6" />
            </div>
            <div className="text-3xl font-bold">{formatCurrency(statistics.totalPayroll)}</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm opacity-90">Average Salary</div>
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="text-3xl font-bold">{formatCurrency(statistics.averageSalary)}</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm opacity-90">Total Employees</div>
              <Users className="w-6 h-6" />
            </div>
            <div className="text-3xl font-bold">{statistics.totalEmployees}</div>
          </div>
        </div>
      )}

      {/* Employees Payroll Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#097087]" />
            Employee Payroll
          </h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097087] focus:border-transparent"
            />
          </div>
        </div>

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
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Department</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Basic Salary</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Allowances</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Deductions</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Net Salary</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => (
                  <React.Fragment key={employee.employeeId}>
                    <tr className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{employee.employeeName}</div>
                          <div className="text-xs text-gray-500">{employee.employeeCode}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{employee.department || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                        {formatCurrency(employee.basicSalary)}
                      </td>
                      <td className="px-4 py-3 text-sm text-green-600 text-right">
                        {formatCurrency(employee.totalAllowances)}
                      </td>
                      <td className="px-4 py-3 text-sm text-red-600 text-right">
                        {formatCurrency(employee.totalDeductions)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right font-bold">
                        {formatCurrency(employee.netSalary)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {editingEmployee === employee.employeeId ? (
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleSalaryUpdate(employee.employeeId)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Save"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEditing(employee)}
                            className="p-2 text-[#097087] hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                    
                    {/* Edit Form Row */}
                    {editingEmployee === employee.employeeId && (
                      <tr className="bg-blue-50 border-b">
                        <td colSpan="7" className="px-4 py-6">
                          <div className="space-y-4">
                            <h3 className="font-semibold text-gray-800 mb-4">Edit Salary Structure</h3>
                            
                            {/* Basic Salary */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white rounded-lg">
                              <div className="md:col-span-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Basic Salary (₹)
                                </label>
                                <input
                                  type="number"
                                  value={editFormData.basicSalary}
                                  onChange={(e) => setEditFormData({ ...editFormData, basicSalary: parseFloat(e.target.value) || 0 })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097087] focus:border-transparent"
                                />
                              </div>
                            </div>

                            {/* Allowances */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-green-50 rounded-lg">
                              <div className="md:col-span-4 mb-2">
                                <h4 className="font-medium text-green-800">Allowances</h4>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">HRA (₹)</label>
                                <input
                                  type="number"
                                  value={editFormData.allowances.hra}
                                  onChange={(e) => setEditFormData({
                                    ...editFormData,
                                    allowances: { ...editFormData.allowances, hra: parseFloat(e.target.value) || 0 }
                                  })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Transport (₹)</label>
                                <input
                                  type="number"
                                  value={editFormData.allowances.transport}
                                  onChange={(e) => setEditFormData({
                                    ...editFormData,
                                    allowances: { ...editFormData.allowances, transport: parseFloat(e.target.value) || 0 }
                                  })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Medical (₹)</label>
                                <input
                                  type="number"
                                  value={editFormData.allowances.medical}
                                  onChange={(e) => setEditFormData({
                                    ...editFormData,
                                    allowances: { ...editFormData.allowances, medical: parseFloat(e.target.value) || 0 }
                                  })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Other (₹)</label>
                                <input
                                  type="number"
                                  value={editFormData.allowances.other}
                                  onChange={(e) => setEditFormData({
                                    ...editFormData,
                                    allowances: { ...editFormData.allowances, other: parseFloat(e.target.value) || 0 }
                                  })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                              </div>
                            </div>

                            {/* Deductions */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-red-50 rounded-lg">
                              <div className="md:col-span-4 mb-2">
                                <h4 className="font-medium text-red-800">Deductions</h4>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tax (₹)</label>
                                <input
                                  type="number"
                                  value={editFormData.deductions.tax}
                                  onChange={(e) => setEditFormData({
                                    ...editFormData,
                                    deductions: { ...editFormData.deductions, tax: parseFloat(e.target.value) || 0 }
                                  })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">PF (₹)</label>
                                <input
                                  type="number"
                                  value={editFormData.deductions.providentFund}
                                  onChange={(e) => setEditFormData({
                                    ...editFormData,
                                    deductions: { ...editFormData.deductions, providentFund: parseFloat(e.target.value) || 0 }
                                  })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Insurance (₹)</label>
                                <input
                                  type="number"
                                  value={editFormData.deductions.insurance}
                                  onChange={(e) => setEditFormData({
                                    ...editFormData,
                                    deductions: { ...editFormData.deductions, insurance: parseFloat(e.target.value) || 0 }
                                  })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Other (₹)</label>
                                <input
                                  type="number"
                                  value={editFormData.deductions.other}
                                  onChange={(e) => setEditFormData({
                                    ...editFormData,
                                    deductions: { ...editFormData.deductions, other: parseFloat(e.target.value) || 0 }
                                  })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredEmployees.length} of {employees.length} employees
        </div>
      </div>
    </div>
  );
};

export default AdminPayrollManagement;
