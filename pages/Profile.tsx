
import React, { useState, useEffect } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { useApp } from '../store/context';
import { UserRole, SalaryInfo, AttendanceStatus } from '../types';
import { Camera, Mail, Phone, MapPin, Shield, DollarSign, FileText, User as UserIcon, Save, ArrowLeft, ShieldAlert, Briefcase, Globe, Info, Clock, CheckCircle } from 'lucide-react';

const Profile: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { users, currentUser, updateUser } = useApp();
  const [activeTab, setActiveTab] = useState('Overview');
  const [isEditing, setIsEditing] = useState(false);
  const [authError, setAuthError] = useState(false);

  const profileUser = users.find(u => u.id === id);
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    if (profileUser) {
      setFormData({ ...profileUser });
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  }, [profileUser, id]);

  if (authError || !currentUser) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 animate-in fade-in duration-500">
        <div className="bg-red-50 p-6 rounded-full text-red-500">
          <ShieldAlert size={60} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-800">403 Unauthorized</h2>
          <p className="text-gray-400 font-medium">You do not have permission to access this company's data.</p>
        </div>
        <button onClick={() => navigate('/dashboard')} className="px-6 py-2 bg-[#3B3C36] text-white rounded-xl font-bold">Back to Dashboard</button>
      </div>
    );
  }

  if (!formData) return null;

  const isAdmin = currentUser.role === UserRole.ADMIN;
  const isOwnProfile = currentUser.id === profileUser!.id;
  
  // Restriction: Admins cannot see or edit their own salary data
  const showSalaryTab = !(isAdmin && isOwnProfile);

  const canEditField = (field: string) => {
    if (isAdmin) {
      // Admin can edit everything EXCEPT their own salary
      if (isOwnProfile && field === 'salary') return false;
      return true;
    }
    if (isOwnProfile && ['phone', 'address', 'profilePhoto', 'about'].includes(field)) return true;
    return false;
  };

  const handleSave = () => {
    try {
      updateUser(profileUser!.id, formData);
      setIsEditing(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const updateSalaryComponents = (total: number) => {
    const basic = Math.round(total * 0.5);
    const hra = Math.round(basic * 0.5);
    const allowances = Math.round(total * 0.15);
    const pf = Math.round(basic * 0.12);
    const tax = 200;
    const bonus = Math.round(total * 0.1);

    setFormData({
      ...formData,
      salary: {
        ...formData.salary,
        totalWage: total,
        basic,
        hra,
        allowances,
        bonus,
        pf,
        tax
      }
    });
  };

  const updateManualWage = (key: keyof SalaryInfo, val: number) => {
    setFormData({
      ...formData,
      salary: {
        ...formData.salary,
        [key]: val
      }
    });
  };

  const tabs = ['Overview', 'Job Details', showSalaryTab && 'Payroll', 'Security'].filter(Boolean) as string[];

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-400 hover:text-[#3B3C36] font-bold text-xs uppercase tracking-widest transition-colors mb-2">
        <ArrowLeft size={16} /> Directory
      </button>

      {/* Header Profile Card */}
      <div className="bg-white border border-gray-100 rounded-[3rem] overflow-hidden shadow-2xl shadow-gray-200/50">
        <div className="h-48 bg-[#3B3C36] relative overflow-hidden">
           <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                 <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="url(#grid)" />
              </svg>
           </div>
        </div>
        <div className="px-10 pb-10 -mt-24 flex flex-col md:flex-row items-end gap-8 relative z-10">
          <div className="relative group">
            <div className="w-48 h-48 rounded-[3rem] bg-white border-8 border-white shadow-2xl overflow-hidden flex items-center justify-center">
              {formData.profilePhoto ? (
                <img src={formData.profilePhoto} alt={formData.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-200">
                  <UserIcon size={80} />
                </div>
              )}
            </div>
            {canEditField('profilePhoto') && (
              <label className="absolute bottom-4 right-4 p-4 bg-[#FF7043] text-white rounded-2xl shadow-lg hover:scale-110 transition-transform cursor-pointer">
                <Camera size={24} />
                <input type="file" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = () => setFormData({...formData, profilePhoto: reader.result});
                    reader.readAsDataURL(file);
                  }
                }} />
              </label>
            )}
          </div>
          <div className="flex-1 pb-4">
            <div className="flex items-center gap-3">
              <h1 className="text-5xl font-black text-[#2C2C2C] tracking-tight">{formData.name}</h1>
              {formData.status === AttendanceStatus.PRESENT && (
                <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                   <CheckCircle size={10} /> Active
                </span>
              )}
            </div>
            <p className="text-[#FF7043] font-black uppercase tracking-[0.3em] text-xs mt-3">{formData.designation} • {formData.department}</p>
            <p className="text-gray-300 font-bold text-xs mt-1 uppercase tracking-widest">{formData.employeeId}</p>
          </div>
          {(isAdmin || isOwnProfile) && (
            <div className="pb-4">
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-10 py-4 bg-[#3B3C36] text-white rounded-[2rem] hover:bg-[#2C2D28] transition-all font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-[#3B3C36]/30"
                >
                  Edit Profile
                </button>
              ) : (
                <button 
                  onClick={handleSave}
                  className="px-10 py-4 bg-[#FF7043] text-white rounded-[2rem] flex items-center gap-3 hover:bg-[#e6603a] transition-all font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-[#FF7043]/30"
                >
                  <Save size={18} /> Sync Changes
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10 space-y-10 shadow-sm">
             <section className="space-y-6">
                <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-gray-300">Communication</h3>
                <div className="space-y-6">
                  <ContactItem icon={<Mail size={18} />} label="Email Address" value={formData.email} />
                  <ContactItem 
                    icon={<Phone size={18} />} 
                    label="Mobile Number" 
                    value={formData.phone} 
                    isEditing={isEditing && canEditField('phone')}
                    onChange={v => setFormData({...formData, phone: v})}
                  />
                  <ContactItem 
                    icon={<Globe size={18} />} 
                    label="Work Location" 
                    value={formData.location || 'Distributed'} 
                    isEditing={isEditing && canEditField('location')}
                    onChange={v => setFormData({...formData, location: v})}
                  />
                </div>
             </section>

             <section className="space-y-6">
                <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-gray-300">Reporting</h3>
                <div className="space-y-6">
                  <ContactItem icon={<UserIcon size={18} />} label="Manager" value={formData.manager || 'Leadership'} />
                  <ContactItem icon={<Briefcase size={18} />} label="Employment" value={formData.employmentType || 'Full-time'} />
                </div>
             </section>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm overflow-hidden min-h-[600px]">
            <div className="border-b border-gray-50 flex p-4 gap-4 bg-gray-50/20">
              {tabs.map(tab => {
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-8 py-4 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl transition-all ${activeTab === tab ? 'bg-[#3B3C36] text-white shadow-xl' : 'text-gray-400 hover:bg-gray-100'}`}
                  >
                    {tab}
                  </button>
                )
              })}
            </div>
            
            <div className="p-12">
              {activeTab === 'Overview' && (
                <div className="max-w-3xl space-y-12">
                  <section>
                    <h4 className="text-2xl font-black mb-6 flex items-center gap-4"><Info className="text-[#3B3C36]" /> Executive Summary</h4>
                    {isEditing && canEditField('about') ? (
                      <textarea 
                        value={formData.about || ''} 
                        onChange={e => setFormData({...formData, about: e.target.value})}
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-[#3B3C36] rounded-3xl p-6 outline-none font-medium text-lg leading-relaxed h-48 resize-none"
                      />
                    ) : (
                      <p className="text-gray-500 leading-relaxed text-xl font-medium italic">
                        "{formData.about || 'A dedicated professional contributing to the organizational mission through excellence and strategic action.'}"
                      </p>
                    )}
                  </section>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-50">
                     <InfoBlock icon={<Clock className="text-blue-500" />} label="Joined Organization" value={`Since ${formData.joiningYear}`} />
                     <InfoBlock icon={<MapPin className="text-orange-500" />} label="Resident Address" value={formData.address || 'Confidential'} />
                  </div>
                </div>
              )}

              {activeTab === 'Job Details' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   <JobInfoField label="Primary Designation" value={formData.designation} />
                   <JobInfoField label="Departmental Unit" value={formData.department} />
                   <JobInfoField label="Reporting Line" value={formData.manager || 'HR Directorate'} />
                   <JobInfoField label="Standard Schedule" value="Monday - Friday, 9AM - 6PM" />
                   <JobInfoField label="Employee Tenure" value={`${new Date().getFullYear() - formData.joiningYear} Years`} />
                   <JobInfoField label="Contract Identity" value={formData.employeeId} />
                </div>
              )}

              {activeTab === 'Payroll' && (
                <div className="space-y-12 animate-in fade-in zoom-in duration-500">
                  <div className="bg-[#F9F7F2] p-12 rounded-[3.5rem] border border-[#3B3C36]/5 flex flex-col md:flex-row items-center justify-between gap-10 shadow-inner">
                    <div className="text-center md:text-left">
                      <h4 className="text-3xl font-black text-[#3B3C36]">Payroll Summary</h4>
                      <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-2">Calculated for the current pay cycle • <span className="text-green-600">Verified</span></p>
                    </div>
                    <div className="flex flex-col items-end">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Net Remuneration</p>
                       <div className="flex items-center gap-4">
                        {isAdmin && isEditing ? (
                          <input 
                            type="number"
                            value={formData.salary.totalWage}
                            onChange={(e) => updateSalaryComponents(Number(e.target.value))}
                            className="text-5xl font-black border-b-8 border-[#3B3C36] bg-transparent outline-none w-56 text-right focus:border-[#FF7043] transition-colors"
                          />
                        ) : (
                          <span className="text-6xl font-black text-[#3B3C36] tracking-tighter">₹{(formData.salary.totalWage + formData.salary.extraWages + formData.salary.bonus - formData.salary.deductions).toLocaleString()}</span>
                        )}
                       </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-[3rem] border border-gray-100 p-10">
                    <h5 className="font-black text-xs uppercase tracking-[0.3em] text-gray-300 mb-8">Detailed Breakdown</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-24 gap-y-2">
                      <SalaryItem label="Base Component (Basic)" value={formData.salary.basic} sub="50% OF TOTAL CTC" />
                      <SalaryItem label="Accommodation Benefit (HRA)" value={formData.salary.hra} sub="ESTABLISHED STATUTORY" />
                      <SalaryItem label="Variable Allowances" value={formData.salary.allowances} sub="CONVEYANCE & MEDICAL" />
                      
                      <EditableSalaryItem 
                        label="Incentive / Bonus" 
                        value={formData.salary.bonus} 
                        sub="PERFORMANCE EVALUATION" 
                        isAdmin={isAdmin && isEditing}
                        onChange={v => updateManualWage('bonus', v)}
                      />
                      <EditableSalaryItem 
                        label="Overtime / Extra Wages" 
                        value={formData.salary.extraWages} 
                        sub="ATTENDANCE ADJ." 
                        isAdmin={isAdmin && isEditing}
                        onChange={v => updateManualWage('extraWages', v)}
                        variant="success"
                      />
                      <EditableSalaryItem 
                        label="Policy Deductions" 
                        value={formData.salary.deductions} 
                        sub="ASSETS & PENALTIES" 
                        isAdmin={isAdmin && isEditing}
                        onChange={v => updateManualWage('deductions', v)}
                        negative
                      />

                      <SalaryItem label="Retirement Fund (EPF)" value={formData.salary.pf} sub="GOVT. MANDATED 12%" negative />
                      <SalaryItem label="Statutory Professional Tax" value={formData.salary.tax} sub="MONTHLY FIXED" negative />
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest italic">Last processed by Admin on {new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              )}

              {activeTab === 'Security' && (
                <div className="space-y-10 max-w-lg">
                   <h4 className="text-2xl font-black flex items-center gap-4"><Shield className="text-[#3B3C36]" /> Access & Security</h4>
                   <div className="space-y-6">
                      <SecurityAction label="Renew Security Password" description="Update your system access credentials" />
                      <SecurityAction label="Identity Verification (2FA)" description="Enable secondary biometric auth" />
                      <SecurityAction label="Active Sessions Log" description="Monitor unauthorized device access" />
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ContactItem: React.FC<{ icon: any; label: string; value: string; isEditing?: boolean; onChange?: (v: string) => void }> = ({ icon, label, value, isEditing, onChange }) => (
  <div className="flex flex-col gap-2">
    <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">{label}</span>
    <div className="flex items-center gap-4 text-[#2C2C2C]">
      <div className="text-gray-400 p-3 bg-gray-50 rounded-2xl group-hover:bg-[#3B3C36] group-hover:text-white transition-all shadow-sm">{icon}</div>
      {isEditing ? (
        <input 
          value={value}
          onChange={e => onChange?.(e.target.value)}
          className="text-sm font-bold border-b-2 border-gray-100 focus:border-[#3B3C36] outline-none w-full bg-transparent py-2"
        />
      ) : (
        <span className="text-sm font-black truncate">{value}</span>
      )}
    </div>
  </div>
);

const InfoBlock: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="bg-gray-50/30 p-8 rounded-[2.5rem] border border-gray-50 flex items-start gap-5">
    <div className="p-3 bg-white rounded-2xl shadow-sm mt-1">{icon}</div>
    <div>
      <label className="block text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-2">{label}</label>
      <p className="text-xl font-black text-[#3B3C36] leading-tight">{value}</p>
    </div>
  </div>
);

const JobInfoField: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="space-y-2 group">
    <label className="block text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] group-hover:text-[#FF7043] transition-colors">{label}</label>
    <p className="text-lg font-black text-[#2C2C2C] border-b border-gray-50 pb-3">{value}</p>
  </div>
);

const SalaryItem: React.FC<{ label: string; value: number; sub: string; negative?: boolean }> = ({ label, value, sub, negative }) => (
  <div className="flex items-center justify-between py-6 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-all px-4 rounded-[1.5rem] group">
    <div>
      <p className="font-black text-sm text-[#2C2C2C] tracking-tight group-hover:translate-x-1 transition-transform">{label}</p>
      <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">{sub}</span>
    </div>
    <div className="text-right">
      <span className={`text-xl font-black ${negative ? 'text-red-500' : 'text-[#3B3C36]'}`}>
        {negative ? '-' : ''}₹{value.toLocaleString()}
      </span>
    </div>
  </div>
);

const EditableSalaryItem: React.FC<{ label: string; value: number; sub: string; isAdmin: boolean; onChange: (v: number) => void; negative?: boolean; variant?: 'success' | 'default' }> = ({ label, value, sub, isAdmin, onChange, negative, variant }) => (
  <div className="flex items-center justify-between py-6 border-b border-gray-50 group px-4 rounded-[1.5rem] bg-gray-50/20">
    <div>
      <p className="font-black text-sm text-[#2C2C2C] tracking-tight">{label}</p>
      <span className={`text-[9px] font-black uppercase tracking-widest ${negative ? 'text-red-400' : variant === 'success' ? 'text-green-500' : 'text-gray-400'}`}>{sub}</span>
    </div>
    {isAdmin ? (
      <input 
        type="number" value={value} 
        onChange={e => onChange(parseInt(e.target.value) || 0)}
        className="w-32 text-right bg-white border-2 border-transparent focus:border-[#3B3C36] rounded-xl px-4 py-2 font-black text-lg outline-none transition-all shadow-sm" 
      />
    ) : (
      <span className={`text-xl font-black ${negative ? 'text-red-600' : variant === 'success' ? 'text-green-600' : 'text-[#3B3C36]'}`}>
        {negative ? '-' : ''}₹{value.toLocaleString()}
      </span>
    )}
  </div>
);

const SecurityAction: React.FC<{ label: string; description: string }> = ({ label, description }) => (
  <button className="w-full text-left px-10 py-6 bg-[#F9F7F2] border border-[#3B3C36]/5 rounded-[2.5rem] hover:bg-[#3B3C36] hover:text-white hover:shadow-2xl transition-all group overflow-hidden relative">
    <div className="relative z-10">
      <p className="font-black text-xs uppercase tracking-[0.2em]">{label}</p>
      <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest mt-2">{description}</p>
    </div>
    <div className="absolute top-0 right-0 h-full w-2 bg-[#FF7043] group-hover:w-4 transition-all" />
  </button>
);

export default Profile;
