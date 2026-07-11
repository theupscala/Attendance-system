import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, User, Lock, Eye, EyeOff, Building } from 'lucide-react';
import api from '../services/api';

const AdminSignup = () => {
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMsg('');
    
    try {
      await api.post('/auth/register-admin', { name, employeeId, password });
      setSuccessMsg('Admin created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary/5 p-4">
      <div className="card w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-accent text-white w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-soft">
            <UserPlus size={32} />
          </div>
          <h1 className="text-2xl font-bold text-primary mb-2">Create Admin</h1>
          <p className="text-gray-500">Sign up a new administrative account</p>
        </div>

        {error && (
          <div className="bg-red-50 text-danger p-3 rounded-xl text-sm mb-4 text-center">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="bg-green-50 text-green-600 p-3 rounded-xl text-sm mb-4 text-center">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <div className="relative">
              <Building size={20} className="absolute left-3 top-3 text-gray-400" />
              <input 
                type="text" 
                required
                className="input-field pl-10" 
                placeholder="Enter admin name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username / ID</label>
            <div className="relative">
              <User size={20} className="absolute left-3 top-3 text-gray-400" />
              <input 
                type="text" 
                required
                className="input-field pl-10" 
                placeholder="Enter unique ID or username"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock size={20} className="absolute left-3 top-3 text-gray-400" />
              <input 
                type={showPassword ? "text" : "password"}
                required
                className="input-field pl-10 pr-10" 
                placeholder="Enter secure password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="btn-primary w-full flex justify-center items-center py-3 bg-accent hover:bg-accent/90"
          >
            {isLoading ? 'Creating...' : 'Sign Up as Admin'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-accent hover:underline font-medium">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminSignup;
