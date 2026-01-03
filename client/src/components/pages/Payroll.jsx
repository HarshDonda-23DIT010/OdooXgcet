import React, { useState, useEffect } from 'react';
import { DollarSign, Calendar, TrendingUp, FileText, Download } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';

const Payroll = () => {
  const [salaryInfo, setSalaryInfo] = useState(null);
  const [salaryHistory, setSalaryHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchSalaryData();
  }, [selectedYear]);

  const fetchSalaryData = async () => {
    try {
      setLoading(true);
      const [infoRes, historyRes] = await Promise.all([
        axios.get(`${API_URL}/salary/my-salary`, { withCredentials: true }),
        axios.get(`${API_URL}/salary/my-history?year=${selectedYear}`, { withCredentials: true })
      ]);

      setSalaryInfo(infoRes.data.data);
      setSalaryHistory(historyRes.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching salary data:', error);
      toast.error('Failed to fetch salary data');
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

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#097087]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#097087] to-[#23CED9] rounded-lg p-6 text-white shadow-lg">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Payroll</h1>
          <p className="text-white/90">View your salary details and payment history</p>
        </div>
      </div>

      {/* Current Salary Overview */}
      {salaryInfo && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
              <div className="text-sm mb-1 opacity-90">Basic Salary</div>
              <div className="text-3xl font-bold">{formatCurrency(salaryInfo.basicSalary)}</div>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
              <div className="text-sm mb-1 opacity-90">Total Allowances</div>
              <div className="text-3xl font-bold">{formatCurrency(salaryInfo.totalAllowances)}</div>
            </div>
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-md p-6 text-white">
              <div className="text-sm mb-1 opacity-90">Total Deductions</div>
              <div className="text-3xl font-bold">{formatCurrency(salaryInfo.totalDeductions)}</div>
            </div>
            <div className="bg-gradient-to-br from-[#097087] to-[#23CED9] rounded-lg shadow-md p-6 text-white">
              <div className="text-sm mb-1 opacity-90">Net Salary</div>
              <div className="text-3xl font-bold">{formatCurrency(salaryInfo.netSalary)}</div>
            </div>
          </div>

          {/* Salary Breakdown */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#097087]" />
              Salary Breakdown
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Allowances */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b-2 border-green-500">
                  Allowances
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-gray-700">HRA (House Rent Allowance)</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(salaryInfo.allowances.hra)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-gray-700">Transport Allowance</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(salaryInfo.allowances.transport)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-gray-700">Medical Allowance</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(salaryInfo.allowances.medical)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-gray-700">Other Allowances</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(salaryInfo.allowances.other)}</span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b-2 border-red-500">
                  Deductions
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="text-gray-700">Tax</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(salaryInfo.deductions.tax)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="text-gray-700">Provident Fund (PF)</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(salaryInfo.deductions.providentFund)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="text-gray-700">Insurance</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(salaryInfo.deductions.insurance)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="text-gray-700">Other Deductions</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(salaryInfo.deductions.other)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Gross and Net */}
            <div className="mt-6 pt-6 border-t-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <div className="text-sm text-blue-700 mb-1">Gross Salary</div>
                  <div className="text-2xl font-bold text-blue-900">{formatCurrency(salaryInfo.grossSalary)}</div>
                  <div className="text-xs text-blue-600 mt-1">Basic + Allowances</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                  <div className="text-sm text-green-700 mb-1">Net Salary (Take Home)</div>
                  <div className="text-2xl font-bold text-green-900">{formatCurrency(salaryInfo.netSalary)}</div>
                  <div className="text-xs text-green-600 mt-1">Gross - Deductions</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}


      {/* Info Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> This payroll information is read-only. If you have any questions or notice discrepancies, 
          please contact the HR department or your manager.
        </p>
      </div>
    </div>
  );
};

export default Payroll;
