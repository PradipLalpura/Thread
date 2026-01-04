
import React from 'react';
import { useApp } from '../store/context';
import { Logo } from '../constants';
import { NavLink, useNavigate } from 'react-router-dom';
import { User, LogOut, ChevronDown, Bell, Users, Clock, Calendar } from 'lucide-react';
import { UserRole } from '../types';

export const AuthenticatedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, logout } = useApp();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = React.useState(false);

  if (!currentUser) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-[#3B3C36]/10 h-20 sticky top-0 z-50 px-6 md:px-12 flex items-center justify-between shadow-sm backdrop-blur-md bg-white/90">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-4">
            {currentUser.companyLogo ? (
              <img src={currentUser.companyLogo} alt={currentUser.companyName} className="h-10 w-auto object-contain max-w-[120px]" />
            ) : (
              <Logo size={40} />
            )}
            <div className="h-6 w-[1px] bg-gray-200 hidden md:block" />
            <span className="hidden lg:block font-black text-xs uppercase tracking-widest text-gray-400 truncate max-w-[150px]">{currentUser.companyName}</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-2">
            {currentUser.role === UserRole.ADMIN ? (
              <>
                <NavItem to="/dashboard" label="Employees" icon={<Users size={16} />} />
                <NavItem to="/attendance" label="Attendance" icon={<Clock size={16} />} />
                <NavItem to="/time-off" label="Time Off" icon={<Calendar size={16} />} />
              </>
            ) : (
              <>
                <NavItem to="/dashboard" label="Directory" icon={<Users size={16} />} />
                <NavItem to="/attendance" label="My Attendance" icon={<Clock size={16} />} />
                <NavItem to="/time-off" label="My Leaves" icon={<Calendar size={16} />} />
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <button className="relative p-2 text-gray-400 hover:text-[#3B3C36] transition-colors">
            <Bell size={22} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border-2 border-white" />
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 pl-3 pr-1 py-1 bg-gray-50 rounded-full hover:bg-gray-100 transition-all border border-gray-100"
            >
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-xs font-black text-[#2C2C2C] leading-none">{currentUser.name}</span>
                <span className="text-[10px] font-bold text-gray-400 leading-none mt-1 uppercase tracking-tighter">{currentUser.role}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-white border border-gray-200 overflow-hidden shadow-sm">
                {currentUser.profilePhoto ? (
                  <img src={currentUser.profilePhoto} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#3B3C36] text-white font-bold text-sm">
                    {currentUser.name.slice(0, 1)}
                  </div>
                )}
              </div>
              <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                <div className="absolute right-0 mt-4 w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in duration-200 origin-top-right">
                  <div className="px-4 py-3 border-b border-gray-50 mb-1">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Signed in as</p>
                    <p className="text-sm font-bold text-[#3B3C36] truncate">{currentUser.email}</p>
                  </div>
                  <DropdownItem onClick={() => { navigate(`/profile/${currentUser.id}`); setShowDropdown(false); }} icon={<User size={16} />} label="My Profile" />
                  <DropdownItem onClick={() => { logout(); navigate('/login'); }} icon={<LogOut size={16} />} label="Sign Out" variant="danger" />
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 bg-[#F9F7F2] px-6 md:px-12 py-10">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

const NavItem: React.FC<{ to: string; label: string; icon: React.ReactNode }> = ({ to, label, icon }) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => `
      px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2
      ${isActive ? 'bg-[#3B3C36] text-white shadow-lg' : 'text-gray-400 hover:text-[#3B3C36] hover:bg-white'}
    `}
  >
    {icon} {label}
  </NavLink>
);

const DropdownItem: React.FC<{ onClick: () => void; icon: any; label: string; variant?: 'danger' | 'default' }> = ({ onClick, icon, label, variant = 'default' }) => (
  <button 
    onClick={onClick}
    className={`w-full text-left px-4 py-3 text-sm font-bold flex items-center gap-3 transition-colors ${variant === 'danger' ? 'text-red-500 hover:bg-red-50' : 'text-gray-600 hover:bg-gray-50'}`}
  >
    {icon} {label}
  </button>
);
