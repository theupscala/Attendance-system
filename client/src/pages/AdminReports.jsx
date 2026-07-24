import React, { useState, useEffect } from 'react';
import { Filter, Users, Briefcase, Calendar, Eye, Phone, LayoutList, UserCircle } from 'lucide-react';
import api from '../services/api';
import CustomerDetailsDrawer from '../components/CustomerDetailsDrawer';

const AdminReports = () => {
  const [entries, setEntries] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter States
  const [mode, setMode] = useState('PRODUCT'); // 'PRODUCT' | 'EMPLOYEE'
  const [dataset, setDataset] = useState('LEADS'); // 'LEADS' | 'CLIENTS'
  const [product, setProduct] = useState('ALL');
  const [employeeId, setEmployeeId] = useState('ALL');
  const [timeFilter, setTimeFilter] = useState('1M'); // Default to 1 Month

  // Drawer State
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);

  const PRODUCT_OPTIONS = ['Washing machine', 'Chimney', 'Fridge', 'Dishwasher', 'Mixxie', 'others'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [entriesRes, employeesRes] = await Promise.all([
        api.get('/customer-entries/all'),
        api.get('/admin/employees')
      ]);
      setEntries(entriesRes.data);
      setEmployees(employeesRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch data for reports.');
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = entries.filter(entry => {
    // 1. Filter by Time
    let matchesTime = true;
    if (timeFilter !== 'ALL' && entry.createdAt) {
      const date = new Date(entry.createdAt);
      const now = new Date();
      const timeLimit = new Date();
      
      if (timeFilter === '1M') timeLimit.setMonth(now.getMonth() - 1);
      if (timeFilter === '3M') timeLimit.setMonth(now.getMonth() - 3);
      if (timeFilter === '6M') timeLimit.setMonth(now.getMonth() - 6);
      if (timeFilter === '1Y') timeLimit.setFullYear(now.getFullYear() - 1);
      
      matchesTime = date >= timeLimit;
    }

    if (!matchesTime) return false;

    // 2. Filter by Mode logic
    if (mode === 'PRODUCT') {
      const isClient = entry.status === 'QUALIFIED' || entry.status === 'QUALIFIED LEAD';
      const matchesDataset = dataset === 'CLIENTS' ? isClient : !isClient;
      const matchesProduct = product === 'ALL' || entry.serviceInterest === product;
      return matchesDataset && matchesProduct;
    } else {
      // EMPLOYEE mode
      const matchesEmployee = employeeId === 'ALL' || (entry.employeeId && entry.employeeId._id === employeeId);
      return matchesEmployee;
    }
  });

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'HOT': return <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-700"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>HOT</span>; 
      case 'WARM': return <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-700"><span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>WARM</span>;
      case 'COLD': return <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-700"><span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>COLD</span>;
      default: return <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-700"><span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>{priority || '-'}</span>;
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Reports...</div>;

  return (
    <div className="flex flex-col md:flex-row h-full bg-gray-50/50">
      
      {/* LEFT PANE: Filters */}
      <div className="w-full md:w-80 bg-white border-b md:border-b-0 md:border-r border-gray-200 flex flex-col shrink-0">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Filter size={20} className="text-primary" /> Advanced Filters
          </h1>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto scrollbar-hide">
          {/* Mode Selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Filter By</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setMode('PRODUCT'); setTimeFilter('1M'); }}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all ${mode === 'PRODUCT' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
              >
                <LayoutList size={20} />
                <span className="text-xs font-bold">Product</span>
              </button>
              <button
                onClick={() => { setMode('EMPLOYEE'); setTimeFilter('1M'); }}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all ${mode === 'EMPLOYEE' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
              >
                <UserCircle size={20} />
                <span className="text-xs font-bold">Employee</span>
              </button>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Dynamic Filters based on Mode */}
          {mode === 'PRODUCT' ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Dataset</label>
                <div className="flex bg-gray-100/50 p-1 rounded-lg">
                  <button 
                    onClick={() => setDataset('LEADS')}
                    className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${dataset === 'LEADS' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Leads
                  </button>
                  <button 
                    onClick={() => setDataset('CLIENTS')}
                    className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${dataset === 'CLIENTS' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Clients
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Product</label>
                <select 
                  value={product} 
                  onChange={(e) => setProduct(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer"
                >
                  <option value="ALL">All Products</option>
                  {PRODUCT_OPTIONS.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Time Period</label>
                <select 
                  value={timeFilter} 
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer"
                >
                  <option value="ALL">All Time</option>
                  <option value="1M">Last 1 Month</option>
                  <option value="3M">Last 3 Months</option>
                  <option value="6M">Last 6 Months</option>
                  <option value="1Y">Last 1 Year</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Employee</label>
                <select 
                  value={employeeId} 
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer"
                >
                  <option value="ALL">All Employees</option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>{emp.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">History Period</label>
                <select 
                  value={timeFilter} 
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer"
                >
                  <option value="ALL">All Time</option>
                  <option value="1M">Last 1 Month</option>
                  <option value="3M">Last 3 Months</option>
                  <option value="6M">Last 6 Months</option>
                </select>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* RIGHT PANE: Results Table */}
      <div className="flex-1 flex flex-col min-w-0 bg-white h-full overflow-hidden">
        
        {/* Results Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {filteredEntries.length} Record{filteredEntries.length !== 1 ? 's' : ''} Found
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {mode === 'PRODUCT' 
                ? `Showing ${product === 'ALL' ? 'all products' : product} in ${dataset.toLowerCase()}`
                : `Showing customer history for ${employeeId === 'ALL' ? 'all employees' : employees.find(e => e._id === employeeId)?.name || 'selected employee'}`
              }
            </p>
          </div>
        </div>

        {error && (
          <div className="m-8 mb-0 bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 shrink-0">
            {error}
          </div>
        )}

        {/* Table Area */}
        <div className="flex-1 overflow-auto bg-gray-50/30">
          {filteredEntries.length > 0 ? (
            <>
            <div className="hidden md:block">
            <table className="w-full min-w-[1000px] text-left border-collapse">
              <thead className="bg-white sticky top-0 z-10 border-b border-gray-100 shadow-sm">
                <tr>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Attended By</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm bg-white">
                {filteredEntries.map((entry) => (
                  <tr key={entry._id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-8 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                          {entry.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{entry.name}</div>
                          <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <Phone size={10} /> {entry.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded border border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wide bg-gray-50">
                        {entry.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 text-xs font-semibold">
                      {entry.serviceInterest !== '-' ? entry.serviceInterest : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-xs">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
                          {entry.employeeId?.name?.charAt(0) || '?'}
                        </div>
                        <span className="text-xs font-medium text-gray-700">
                          {entry.employeeId?.name || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap text-right">
                      <button 
                        onClick={() => {
                          setSelectedEntry(entry);
                          setIsDetailsDrawerOpen(true);
                        }}
                        className="text-primary hover:text-primary-dark transition-colors px-3 py-1.5 bg-primary/5 hover:bg-primary/10 rounded-lg text-xs font-bold flex items-center gap-2 ml-auto opacity-0 group-hover:opacity-100"
                      >
                        <Eye size={14} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden flex flex-col gap-4 p-4">
              {filteredEntries.map((entry) => (
                <div key={entry._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3 relative">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-sm font-bold text-blue-600 shrink-0">
                        {entry.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="overflow-hidden">
                        <h3 className="font-bold text-gray-900 text-base truncate">{entry.name}</h3>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                          <Phone size={12} /> {entry.phone}
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded border border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wide bg-gray-50 shrink-0 ml-2">
                      {entry.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 bg-gray-50/50 p-3 rounded-lg border border-gray-50 mt-1">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Product</span>
                      <span className="font-semibold text-gray-700">{entry.serviceInterest !== '-' ? entry.serviceInterest : 'N/A'}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Date</span>
                      <span className="text-gray-600">{new Date(entry.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex flex-col gap-1 col-span-2 border-t border-gray-100 pt-2 mt-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Attended By</span>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
                          {entry.employeeId?.name?.charAt(0) || '?'}
                        </div>
                        <span className="font-medium">{entry.employeeId?.name || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2 border-t border-gray-100 mt-1">
                    <button 
                      onClick={() => {
                        setSelectedEntry(entry);
                        setIsDetailsDrawerOpen(true);
                      }}
                      className="text-primary font-bold text-sm bg-primary/5 hover:bg-primary/10 px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 w-full justify-center"
                    >
                      <Eye size={16} /> View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4 py-20">
              <Filter size={48} className="text-gray-200 opacity-50" />
              <p>No records found matching your filters.</p>
            </div>
          )}
        </div>
      </div>

      {isDetailsDrawerOpen && selectedEntry && (
        <CustomerDetailsDrawer 
          isOpen={isDetailsDrawerOpen}
          onClose={() => setIsDetailsDrawerOpen(false)}
          lead={selectedEntry}
        />
      )}

    </div>
  );
};

export default AdminReports;
