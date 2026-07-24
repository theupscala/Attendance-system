import React, { useState } from 'react';
import { X, User, Building, Mail, Phone, CheckCircle } from 'lucide-react';
import api from '../services/api';

const CustomerEntryDrawer = ({ isOpen, onClose, onSuccess, onViewClient }) => {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    source: 'Website',
    serviceInterest: 'Washing Machine',
    budget: '',
    status: 'New',
    priority: 'Warm'
  });
  const [otherServiceInterest, setOtherServiceInterest] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [existingClient, setExistingClient] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setExistingClient(null);

    // Transform fields to match backend enum constraints
    let finalServiceInterest = formData.serviceInterest;
    if (finalServiceInterest === 'Others') {
      finalServiceInterest = otherServiceInterest;
    }

    const payloadData = {
      ...formData,
      serviceInterest: finalServiceInterest,
      status: formData.status.toUpperCase() + ' LEAD',
      source: formData.source.toUpperCase(),
      priority: formData.priority.toUpperCase()
    };

    const formDataToSend = new FormData();
    Object.keys(payloadData).forEach(key => {
      formDataToSend.append(key, payloadData[key]);
    });
    if (photoFile) {
      formDataToSend.append('photo', photoFile);
    }

    try {
      await api.post('/customer-entries', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      onSuccess('Lead created successfully!');
      onClose();
      // Reset form
      setFormData({
        name: '',
        company: '',
        email: '',
        phone: '',
        source: 'Website',
        serviceInterest: 'Washing Machine',
        budget: '',
        status: 'New',
        priority: 'Warm'
      });
      setOtherServiceInterest('');
      setPhotoFile(null);
      setPhotoPreview(null);
    } catch (err) {
      if (err.response?.status === 409) {
        setError('User already exists');
        setExistingClient(err.response.data.existingLead);
      } else {
        setError(err.response?.data?.message || 'Failed to save lead');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 transition-opacity backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full md:w-[450px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="flex items-start justify-between p-8 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create New Lead</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors mt-1"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 border border-red-100 flex items-center justify-between">
              <span>{error}</span>
              {existingClient && onViewClient && (
                <button 
                  type="button"
                  onClick={() => onViewClient(existingClient)}
                  className="bg-white px-3 py-1.5 text-xs font-bold text-red-700 border border-red-200 rounded hover:bg-red-50 transition-colors shrink-0"
                >
                  View Client
                </button>
              )}
            </div>
          )}

          <form id="leadForm" onSubmit={handleSubmit} className="space-y-8">

            {/* Avatar Placeholder / Upload */}
            <div className="flex justify-center mb-8">
              <label className="cursor-pointer relative group">
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 overflow-hidden relative">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <User size={24} className="mb-1 text-gray-300 group-hover:text-primary transition-colors" />
                      <span className="text-[10px] font-bold tracking-widest uppercase group-hover:text-primary transition-colors">Photo</span>
                    </>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-bold uppercase tracking-wider">{photoPreview ? 'Change' : 'Upload'}</span>
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setPhotoFile(e.target.files[0]);
                      setPhotoPreview(URL.createObjectURL(e.target.files[0]));
                    }
                  }}
                />
              </label>
            </div>

            {/* Section 1 */}
            <div>
              <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider rounded mb-6">
                Contact Details
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Name <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-3.5 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Full Name"
                      required
                      className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Phone <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-4 top-3.5 text-gray-400" />
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 000-000-0000"
                      required
                      className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-3.5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="email@address.com"
                      className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Company</label>
                  <div className="relative">
                    <Building size={18} className="absolute left-4 top-3.5 text-gray-400" />
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="Company Name"
                      className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm placeholder:text-gray-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Section 2 */}
            <div>
              <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider rounded mb-6">
                Profile Details
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Marketing Source</label>
                  <div className="relative">
                    <select
                      name="source"
                      value={formData.source}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none text-sm text-gray-700"
                    >
                      <option value="Walk-in">Walk-in</option>
                      <option value="Referral">Referral</option>
                      <option value="Google">Google</option>
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Service Interest</label>
                  <div className="relative">
                    <select
                      name="serviceInterest"
                      value={formData.serviceInterest}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none text-sm text-gray-700"
                    >
                      <option value="Washing Machine">Washing Machine</option>
                      <option value="Fridge">Fridge</option>
                      <option value="Chimney">Chimney</option>
                      <option value="Dishwasher">Dishwasher</option>
                      <option value="Others">Others</option>
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                  {formData.serviceInterest === 'Others' && (
                    <div className="mt-3 transition-all">
                      <input
                        type="text"
                        name="otherServiceInterest"
                        value={otherServiceInterest}
                        onChange={(e) => setOtherServiceInterest(e.target.value)}
                        placeholder="Please specify product enquiry"
                        required
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm placeholder:text-gray-400"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Budget Est.</label>
                  <input
                    type="text"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    placeholder="$0 - $5,000"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm placeholder:text-gray-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none text-sm text-gray-700"
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Qualified">Qualified</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Priority</label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none text-sm text-gray-700"
                    >
                      <option value="Warm">Warm</option>
                      <option value="Cold">Cold</option>
                      <option value="Hot">Hot</option>
                    </select>
                  </div>
                </div>

              </div>
            </div>

          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-4 shrink-0 rounded-bl-2xl rounded-br-2xl md:rounded-br-none">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <button
            form="leadForm"
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-[#0f172a] text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-colors disabled:opacity-50"
          >
            {loading ? (
              'Saving...'
            ) : (
              <>
                <CheckCircle size={18} className="text-primary" />
                Register Lead
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default CustomerEntryDrawer;
