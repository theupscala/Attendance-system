import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Calendar, Clock, MapPin, User, LogOut, Users, X, Lock, Plus, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === 'Admin') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  return (
    <div className="min-h-screen bg-background">
      {/* Top Navbar */}
      <header className="bg-primary text-white p-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold">AttendanceSystem</h1>
        <div className="flex items-center gap-4">
          <span className="font-medium hidden sm:inline">{user?.name}</span>
          <button onClick={handleLogout} className="text-white hover:text-red-300 transition-colors p-2">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Card */}
        <div className="card text-center md:col-span-1">
          <div className="w-24 h-24 mx-auto bg-gray-200 rounded-full mb-4 overflow-hidden shadow-sm">
            {user?.photo ? (
              <img src={user.photo} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User size={48} className="text-gray-400 m-auto mt-6" />
            )}
          </div>
          <h2 className="text-xl font-bold">{user?.name}</h2>
          <p className="text-gray-500 mb-2">{user?.designation || user?.role}</p>
          <div className="flex flex-col gap-2 mt-4 text-sm text-gray-600 text-left">
            <div className="flex justify-between border-b pb-2">
              <span>Employee ID:</span> <span className="font-medium text-primary">{user?.employeeId}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span>Department:</span> <span className="font-medium text-primary">{user?.department}</span>
            </div>
            <div className="flex justify-between">
              <span>Shift:</span> <span className="font-medium text-primary">{user?.shift}</span>
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="md:col-span-2 space-y-6">
          <div className="card flex items-center justify-between p-8 bg-gradient-to-r from-primary to-accent text-white border-0">
            <div>
              <h2 className="text-2xl font-bold mb-1">Ready to start?</h2>
              <p className="text-blue-100">Make sure you are within the office premises.</p>
            </div>
            <button onClick={() => navigate('/attendance')} className="bg-white text-primary px-8 py-3 rounded-xl font-bold shadow-soft hover:scale-105 transition-transform">
              Punch Now
            </button>
          </div>

          <div className="grid gap-4 grid-cols-1">
            <div className="card flex flex-col items-center justify-center p-6 cursor-pointer hover:border-accent transition-colors" onClick={() => navigate('/history')}>
              <Calendar size={32} className="text-accent mb-2" />
              <span className="font-medium">My Attendance</span>
            </div>
          </div>
        </div>

      </main>


      {/* View Credentials Modal Removed */}

    </div>
  );
};

export default Dashboard;
