import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Users, Calendar, Footprints } from 'lucide-react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [employees, setEmployees] = useState([]);
  const [boschWalkins, setBoschWalkins] = useState(0);
  const [furnitureWalkins, setFurnitureWalkins] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [empRes, leadsRes] = await Promise.all([
          api.get('/admin/employees'),
          api.get('/customer-entries/all')
        ]);
        setEmployees(empRes.data);
        
        // Calculate walkins for current month
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        let bosch = 0;
        let furniture = 0;
        
        leadsRes.data.forEach(lead => {
          if (lead.createdAt && lead.source?.toUpperCase() === 'WALK-IN') {
            const date = new Date(lead.createdAt);
            if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
              if (lead.brand === 'Bosch') bosch++;
              else if (lead.brand === 'Furniture') furniture++;
            }
          }
        });
        
        setBoschWalkins(bosch);
        setFurnitureWalkins(furniture);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6 p-4 md:p-8">
      <h1 className="text-2xl font-bold text-gray-800">Welcome, {user?.name}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="card text-center md:col-span-1 border-0 shadow-sm">
          <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full mb-4 overflow-hidden shadow-soft flex items-center justify-center">
            {user?.photo ? (
              <img src={user.photo} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User size={48} className="text-gray-400" />
            )}
          </div>
          <h2 className="text-xl font-bold text-gray-800">{user?.name}</h2>
          <p className="text-primary font-medium mb-4">{user?.role}</p>
          <div className="flex flex-col gap-3 mt-4 text-sm text-gray-600 text-left bg-gray-50 p-4 rounded-xl">
            <div className="flex justify-between">
              <span>Employee ID:</span> <span className="font-bold text-gray-800">{user?.employeeId}</span>
            </div>
            <div className="flex justify-between">
              <span>Department:</span> <span className="font-bold text-gray-800">{user?.department || 'Administration'}</span>
            </div>
          </div>
        </div>

        {/* Actions & Quick Stats */}
        <div className="md:col-span-2 space-y-6">
          <div className="card flex flex-col md:flex-row items-start md:items-center justify-between p-6 md:p-8 gap-4 bg-gradient-to-r from-primary to-accent text-white border-0 shadow-sm">
            <div>
              <h2 className="text-2xl font-bold mb-1">Mark Your Attendance</h2>
              <p className="text-blue-100">Keep your own attendance records up to date.</p>
            </div>
            <button onClick={() => navigate('/attendance')} className="bg-white text-primary px-8 py-3 rounded-xl font-bold shadow-soft hover:scale-105 transition-transform">
              Punch Now
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col justify-center items-center p-8 text-center">
              <Users size={40} className="text-blue-500 mb-3" />
              <h3 className="text-4xl font-bold text-gray-800">{employees.length}</h3>
              <p className="text-gray-600 font-medium mt-1">Total<br/>Employees</p>
            </div>
            
            <div className="card border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100 flex flex-col justify-center items-center p-8 text-center">
              <Calendar size={40} className="text-purple-500 mb-3" />
              <h3 className="text-4xl font-bold text-gray-800">{new Date().toLocaleString('default', { month: 'short' })}</h3>
              <p className="text-gray-600 font-medium mt-1">Current<br/>Month</p>
            </div>

            <div className="card border-0 shadow-sm bg-gradient-to-br from-indigo-50 to-indigo-100 flex flex-col justify-center items-center p-8 relative overflow-hidden text-center">
              <Footprints size={40} className="text-indigo-500 mb-3" />
              <h3 className="text-4xl font-bold text-gray-800 flex items-center gap-2">
                {boschWalkins}
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" title="Bosch Walk-ins"></span>
              </h3>
              <p className="text-gray-600 font-medium mt-1 leading-tight">Bosch<br/>Walk-ins</p>
            </div>

            <div className="card border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100 flex flex-col justify-center items-center p-8 relative overflow-hidden text-center">
              <Footprints size={40} className="text-orange-500 mb-3" />
              <h3 className="text-4xl font-bold text-gray-800 flex items-center gap-2">
                {furnitureWalkins}
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" title="Furniture Walk-ins"></span>
              </h3>
              <p className="text-gray-600 font-medium mt-1 leading-tight">Furniture<br/>Walk-ins</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
