import { Users, Search, Filter, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';

const Employees = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#097087] to-[#23CED9] rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Employee Management</h1>
            <p className="text-white/90 mt-2">Manage all employee records</p>
          </div>
          <Button className="bg-white text-[#097087] hover:bg-white/90">
            <Plus className="w-5 h-5 mr-2" />
            Add Employee
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <p className="text-gray-600">Full employee management features coming soon...</p>
      </div>
    </div>
  );
};

export default Employees;
