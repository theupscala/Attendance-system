import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, LogOut, ClipboardCheck } from 'lucide-react';

const AdminLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Employees', path: '/admin/employees', icon: <Users size={20} /> },
    { name: 'Holidays', path: '/admin/holidays', icon: <Calendar size={20} /> },
    { name: 'Attendance', path: '/admin/attendance', icon: <ClipboardCheck size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden flex-col md:flex-row">
      
      {/* Mobile Top Header */}
      <header className="md:hidden bg-primary text-white p-4 flex justify-between items-center shadow-md z-20 shrink-0">
        <h1 className="text-xl font-bold">Admin Panel</h1>
        <button onClick={handleLogout} className="text-white hover:text-red-300 transition-colors p-2">
          <LogOut size={20} />
        </button>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden w-64 bg-white shadow-xl md:flex flex-col z-20 shrink-0">
        <div className="p-6 bg-primary text-white flex items-center justify-center">
          <h1 className="text-xl font-bold">Admin Panel</h1>
        </div>
        
        <div className="p-4 flex-1">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                    isActive 
                    ? 'bg-primary text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-primary'
                  }`
                }
              >
                {item.icon}
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Admin Profile Area in Sidebar */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shrink-0">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="font-bold text-gray-800 text-sm truncate">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-danger hover:bg-red-50 rounded-lg transition-colors font-medium text-sm border border-transparent hover:border-red-100"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-gray-50">
        <div className="flex-1 overflow-auto p-4 pb-24 md:p-8 md:pb-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-2 pb-safe shadow-[0_-4px_20px_-2px_rgba(0,0,0,0.1)] z-40">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `flex flex-col items-center gap-1 p-2 min-w-[64px] rounded-lg transition-colors ${
                isActive ? 'text-primary font-bold' : 'text-gray-500'
              }`
            }
          >
            {item.icon}
            <span className="text-[10px] truncate">{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default AdminLayout;
