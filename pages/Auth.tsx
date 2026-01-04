
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../store/context';
import { Logo } from '../constants';
import { Eye, EyeOff, Building, User, Mail, Phone, Lock, Upload, ArrowRight, XCircle, ShieldCheck, CheckCircle } from 'lucide-react';

export const Auth: React.FC<{ type: 'login' | 'signup' }> = ({ type }) => {
  const navigate = useNavigate();
  const { login, signup, currentUser, changePassword, companies } = useApp();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [formData, setFormData] = useState({
    companyId: '', // For Login only
    companyName: '', // For Signup only
    companyLogo: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [newPassData, setNewPassData] = useState({
    pass: '',
    confirm: ''
  });

  useEffect(() => {
    if (currentUser?.isFirstLogin) {
      setIsChangingPassword(true);
    } else if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file.');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setError('File size too large. Max limit is 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, companyLogo: reader.result as string });
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const getContextMessage = () => {
    const email = formData.email.toLowerCase();
    if (email.endsWith('@admin.com')) return 'Admin access detected';
    if (email.endsWith('@employee.com')) return 'Employee access detected';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (type === 'signup') {
        if (!formData.companyName) throw new Error('Company name is required');
        if (formData.password !== formData.confirmPassword) throw new Error('Passwords do not match');
        if (formData.password.length < 8) throw new Error('Password must be at least 8 characters');
        await signup(formData);
      } else {
        if (!formData.companyId) throw new Error('Please select your company.');
        await login(formData.email, formData.password, formData.companyId);
        setSuccessMsg('Company verified successfully');
      }
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handlePassChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassData.pass.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (newPassData.pass !== newPassData.confirm) {
      setError('Passwords do not match');
      return;
    }
    changePassword(newPassData.pass);
    navigate('/dashboard');
  };

  if (isChangingPassword) {
    return (
      <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white border border-[#3B3C36]/10 rounded-3xl p-8 md:p-12 shadow-2xl">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={32} />
            </div>
            <h2 className="text-3xl font-black text-[#2C2C2C] mb-2">Security Update</h2>
            <p className="text-gray-400 font-medium">As this is your first login, please update your temporary password to continue.</p>
          </div>

          {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold flex items-center gap-2"><XCircle size={18}/> {error}</div>}

          <form onSubmit={handlePassChangeSubmit} className="space-y-5">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="password" placeholder="New Secure Password" required
                value={newPassData.pass} onChange={e => setNewPassData({...newPassData, pass: e.target.value})}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#3B3C36] outline-none font-medium"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="password" placeholder="Confirm New Password" required
                value={newPassData.confirm} onChange={e => setNewPassData({...newPassData, confirm: e.target.value})}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#3B3C36] outline-none font-medium"
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-[#3B3C36] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#2C2D28] shadow-xl shadow-[#3B3C36]/20 transition-all flex items-center justify-center gap-2"
            >
              Update & Login <ArrowRight size={20} />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F7F2] flex flex-col md:flex-row">
      <div className="hidden md:flex flex-col justify-center p-12 lg:p-24 bg-[#3B3C36] text-white w-2/5">
        <Logo size={60} showText={true} />
        <div className="mt-12 space-y-6">
          <h1 className="text-5xl font-black leading-tight">Orchestrate your workforce.</h1>
          <p className="text-xl text-gray-300 leading-relaxed font-light">
            THREAD is the premium HRMS platform designed for modern companies that value efficiency and elegance in management.
          </p>
          <div className="pt-8 flex gap-8">
            <Stat label="Total Hired" value="2.4k+" />
            <Stat label="Retention" value="98%" />
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 md:p-12 overflow-y-auto">
        <div className="w-full max-w-md bg-white border border-[#3B3C36]/10 rounded-3xl p-8 md:p-12 shadow-2xl shadow-gray-200/50">
          <div className="flex justify-center mb-8">
            {type === 'signup' && formData.companyLogo ? (
              <div className="relative group">
                <img src={formData.companyLogo} alt="Preview" className="h-16 w-auto object-contain" />
                <button onClick={() => setFormData({...formData, companyLogo: ''})} className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full shadow-md"><XCircle size={16}/></button>
              </div>
            ) : (
              <Logo size={40} />
            )}
          </div>

          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-black text-[#2C2C2C] mb-2">{type === 'login' ? 'Sign In' : 'Join the Thread'}</h2>
            <p className="text-gray-400 font-medium">{type === 'login' ? 'Enter your credentials to access the dashboard' : 'Create an account for your organization'}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-xl flex items-center gap-2">
              <XCircle size={18} /> {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 bg-green-50 border border-green-100 text-green-600 text-sm font-bold rounded-xl flex items-center gap-2">
              <CheckCircle size={18} /> {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {type === 'login' && (
              <div className="relative">
                <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <select 
                  required
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#3B3C36] outline-none transition-all font-bold appearance-none"
                  value={formData.companyId} onChange={e => setFormData({...formData, companyId: e.target.value})}
                >
                  <option value="">Select Company</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                   <ArrowRight size={16} className="rotate-90" />
                </div>
              </div>
            )}

            {type === 'signup' && (
              <>
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" placeholder="Company Name" required
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#3B3C36] outline-none transition-all font-medium"
                    value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})}
                  />
                </div>
                <div className="relative">
                   <label className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <Upload size={18} className="text-gray-400" />
                        <span className="text-sm text-gray-400 font-bold uppercase tracking-wider">{formData.companyLogo ? 'Logo Uploaded' : 'Company Logo'}</span>
                      </div>
                      <span className="text-xs bg-[#3B3C36] text-white px-2 py-1 rounded">Upload</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                   </label>
                </div>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" placeholder="Full Name" required
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#3B3C36] outline-none transition-all font-medium"
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="tel" placeholder="Phone Number (10 digits)" required
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#3B3C36] outline-none transition-all font-medium"
                    value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" placeholder="Email Address or Employee ID" required
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#3B3C36] outline-none transition-all font-medium"
                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
              />
              <p className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase text-[#FF7043] tracking-widest">{getContextMessage()}</p>
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type={showPassword ? 'text' : 'password'} placeholder="Password" required
                className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#3B3C36] outline-none transition-all font-medium"
                value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
              />
              <button 
                type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#3B3C36]"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {type === 'signup' && (
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="password" placeholder="Confirm Password" required
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#3B3C36] outline-none transition-all font-medium"
                  value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                />
              </div>
            )}

            <button 
              type="submit" disabled={isLoading}
              className="w-full bg-[#3B3C36] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#2C2D28] transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-[#3B3C36]/20"
            >
              {isLoading ? 'Processing...' : (type === 'login' ? 'Sign In' : 'Create Account')}
              {!isLoading && <ArrowRight size={20} />}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-400 font-medium">
              {type === 'login' ? "Don't have an account? " : "Already have an account? "}
              <Link to={type === 'login' ? '/signup' : '/login'} className="text-[#3B3C36] font-black hover:underline underline-offset-4">
                {type === 'login' ? 'Sign up' : 'Sign in'}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Stat: React.FC<{ label: string, value: string }> = ({ label, value }) => (
  <div>
    <p className="text-3xl font-black">{value}</p>
    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{label}</p>
  </div>
);
