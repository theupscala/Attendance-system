import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Search, Trash2, Plus, Filter, X } from 'lucide-react';

const AdminEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [isCreateEmployeeModalOpen, setIsCreateEmployeeModalOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ username: '', password: '', role: 'Employee', salary: '', shiftStart: '09:00', shiftEnd: '18:00', salaryType: 'Monthly' });
  const [isCreatingEmployee, setIsCreatingEmployee] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data } = await api.get('/admin/employees');
        setEmployees(data);
      } catch (err) {
        console.error('Failed to fetch employees', err);
      }
    };
    fetchEmployees();
  }, []);

  const handleRemoveEmployee = async (targetId) => {
    if (!targetId) return;
    if (window.confirm('Are you sure you want to completely remove this employee? This action cannot be undone.')) {
      try {
        await api.delete(`/admin/employees/${targetId}`);
        setEmployees(employees.filter(emp => emp._id !== targetId));
        alert('Employee successfully removed!');
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to remove employee');
      }
    }
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    setIsCreatingEmployee(true);
    try {
      const payload = {
        name: newEmployee.username,
        employeeId: newEmployee.username,
        password: newEmployee.password,
        role: newEmployee.role,
        department: newEmployee.department,
        salary: Number(newEmployee.salary),
        salaryType: newEmployee.salaryType,
        shiftStart: newEmployee.shiftStart,
        shiftEnd: newEmployee.shiftEnd
      };

      await api.post('/employees', payload);
      const res = await api.get('/admin/employees');
      setEmployees(res.data);
      setNewEmployee({ username: '', password: '', role: 'Employee', salary: '', shiftStart: '09:00', shiftEnd: '18:00', salaryType: 'Monthly' });
      alert(`Employee ${newEmployee.username} created successfully!`);
      setIsCreateEmployeeModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create employee');
    } finally {
      setIsCreatingEmployee(false);
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <h1 className="text-2xl font-bold text-primary">
          Employee Directory (Active Employees)
        </h1>
        <div className="flex items-center gap-4">
          <button onClick={() => setIsCreateEmployeeModalOpen(true)} className="btn-primary flex items-center gap-2 py-2 px-4">
            <Plus size={18} /> Create Employee
          </button>
        </div>
      </div>

      <div className="card w-full flex flex-col shadow-sm border-0 flex-1">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3.5 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search employees by name or ID..."
              className="input-field pl-9 w-full text-sm"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 text-sm text-gray-400 font-bold uppercase tracking-wider">
                <th className="pb-3 pr-4">Employee</th>
                <th className="pb-3 pr-4 text-center">Salary</th>
                <th className="pb-3 pr-4 text-center">Status</th>
                <th className="pb-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map(emp => (
                <tr key={emp._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="py-4 pr-4 font-bold text-gray-700 flex flex-col">
                    <span className="flex items-center gap-2">
                      {emp.name} 
                      {emp.role === 'Admin' && <span className="w-2.5 h-2.5 rounded-full bg-green-500" title="Admin"></span>}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">{emp.employeeId}</span>
                  </td>
                  <td className="py-4 pr-4 text-center">
                    <div className="flex flex-col items-center">
                      <span className="font-bold text-gray-700">₹{emp.salary || 0}/hr</span>
                      <span className={`px-2 py-0.5 mt-1 rounded text-[10px] uppercase font-bold ${emp.salaryType === 'Weekly' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>{emp.salaryType || 'Monthly'}</span>
                    </div>
                  </td>
                  <td className="py-4 pr-4 text-center">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">Active</span>
                  </td>
                  <td className="py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleRemoveEmployee(emp._id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-danger hover:bg-red-100 rounded-lg transition-colors font-bold text-sm"
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredEmployees.length === 0 && <p className="text-center text-sm text-gray-500 py-12">No employees found matching filters.</p>}
        </div>
      </div>

      {isCreateEmployeeModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative">
            <button onClick={() => setIsCreateEmployeeModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
            <h3 className="font-bold text-xl mb-4 text-primary">Create New Employee</h3>
            <form onSubmit={handleCreateEmployee} className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Username (Name)</label>
                <input type="text" required className="input-field w-full" value={newEmployee.username} onChange={e => setNewEmployee({ ...newEmployee, username: e.target.value })} placeholder="employee123" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input type="text" required className="input-field w-full" value={newEmployee.password} onChange={e => setNewEmployee({ ...newEmployee, password: e.target.value })} placeholder="password123" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select className="input-field w-full" value={newEmployee.role} onChange={e => setNewEmployee({ ...newEmployee, role: e.target.value })}>
                  <option value="Employee">Employee</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Salary Type</label>
                <select className="input-field w-full" value={newEmployee.salaryType} onChange={e => setNewEmployee({ ...newEmployee, salaryType: e.target.value })}>
                  <option value="Monthly">Monthly Salary</option>
                  <option value="Weekly">Weekly Salary</option>
                </select>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Salary (Hourly)</label>
                <input type="number" required min="0" step="0.01" className="input-field w-full" value={newEmployee.salary} onChange={e => setNewEmployee({ ...newEmployee, salary: e.target.value })} placeholder="e.g. 15.00" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Shift Start</label>
                <input type="time" required className="input-field w-full" value={newEmployee.shiftStart} onChange={e => setNewEmployee({ ...newEmployee, shiftStart: e.target.value })} />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Shift End</label>
                <input type="time" required className="input-field w-full" value={newEmployee.shiftEnd} onChange={e => setNewEmployee({ ...newEmployee, shiftEnd: e.target.value })} />
              </div>
              <div className="col-span-2 mt-2">
                <button type="submit" disabled={isCreatingEmployee} className="btn-primary w-full flex justify-center items-center gap-2 py-2">
                  {isCreatingEmployee ? 'Creating...' : <><Plus size={18} /> Create Account</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEmployees;
