import { useState } from 'react';
import { Clock, Calendar, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { Button } from '../ui/button';
import toast from 'react-hot-toast';

const Attendance = () => {
  const [isMarked, setIsMarked] = useState(false);
  const [attendanceTime, setAttendanceTime] = useState(null);

  const attendanceHistory = [
    { date: '2026-01-02', status: 'Present', checkIn: '09:00 AM', checkOut: '06:00 PM' },
    { date: '2026-01-01', status: 'Present', checkIn: '09:15 AM', checkOut: '06:10 PM' },
    { date: '2025-12-31', status: 'Present', checkIn: '09:00 AM', checkOut: '06:00 PM' },
    { date: '2025-12-30', status: 'Absent', checkIn: '-', checkOut: '-' },
    { date: '2025-12-29', status: 'Present', checkIn: '09:05 AM', checkOut: '06:15 PM' },
  ];

  const stats = {
    presentDays: 20,
    absentDays: 2,
    totalDays: 22,
    attendanceRate: 91
  };

  const handleMarkAttendance = () => {
    const now = new Date();
    setAttendanceTime(now.toLocaleTimeString());
    setIsMarked(true);
    toast.success('Attendance marked successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#097087] to-[#23CED9] rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-bold">Attendance</h1>
        <p className="text-white/90 mt-2">Mark your attendance and view history</p>
      </div>

      {/* Mark Attendance Card */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-[#097087] to-[#23CED9] rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h2>
          <p className="text-4xl font-bold text-[#097087] mb-6">
            {new Date().toLocaleTimeString()}
          </p>
          
          {isMarked ? (
            <div className="space-y-4">
              <div className="inline-flex items-center px-6 py-3 bg-[#A1CCA6]/20 text-[#A1CCA6] rounded-lg">
                <CheckCircle className="w-6 h-6 mr-2" />
                <span className="font-semibold">Attendance Marked at {attendanceTime}</span>
              </div>
              <p className="text-gray-600">Have a productive day!</p>
            </div>
          ) : (
            <Button
              onClick={handleMarkAttendance}
              className="px-8 py-4 bg-[#097087] hover:bg-[#23CED9] text-white text-lg font-semibold rounded-lg shadow-lg"
            >
              Mark Attendance
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-[#097087]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Days</p>
              <p className="text-3xl font-bold text-[#097087]">{stats.totalDays}</p>
            </div>
            <Calendar className="w-10 h-10 text-[#097087]" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-[#A1CCA6]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Present</p>
              <p className="text-3xl font-bold text-[#A1CCA6]">{stats.presentDays}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-[#A1CCA6]" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-[#FCA47C]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Absent</p>
              <p className="text-3xl font-bold text-[#FCA47C]">{stats.absentDays}</p>
            </div>
            <XCircle className="w-10 h-10 text-[#FCA47C]" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-[#23CED9]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Rate</p>
              <p className="text-3xl font-bold text-[#23CED9]">{stats.attendanceRate}%</p>
            </div>
            <TrendingUp className="w-10 h-10 text-[#23CED9]" />
          </div>
        </div>
      </div>

      {/* Attendance History */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Attendance History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Check In</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Check Out</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {attendanceHistory.map((record, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(record.date).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      record.status === 'Present' 
                        ? 'bg-[#A1CCA6] text-white' 
                        : 'bg-[#FCA47C] text-white'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.checkIn}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.checkOut}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
