
import React, { useState, useMemo } from 'react';
import { useApp } from '../store/context';
import { UserRole, AttendanceStatus, LeaveStatus } from '../types';
import { StatusDot } from '../constants';
import { useNavigate, Navigate } from 'react-router-dom';
import { Search, Plus, User as UserIcon, ShieldAlert, X, Mail, Phone, Calendar as CalendarIcon, DollarSign, TrendingUp, Users, CheckCircle, Clock, PieChart, Activity } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { users, currentUser, attendance, leaves, addEmployee } = useApp();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [newEmployeeData, setNewEmployeeData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    yearOfJoining: new Date().getFullYear().toString(),
    totalWage: 50000
  });

  if (!currentUser) return <Navigate to="/login" />;

  const isAdmin = currentUser.role === UserRole.ADMIN;

  // Stats for Admin
  const adminStats = useMemo(() => {
    const presentToday = users.filter(u => u.status === AttendanceStatus.PRESENT).length;
    const pendingLeaves = leaves.filter(l => l.status === LeaveStatus.PENDING).length;
    const totalWagePool = users.reduce((acc, u) => acc + u.salary.totalWage, 0);
    return {
      totalEmployees: users.length,
      presentToday,
      pendingLeaves,
      payrollTotal: totalWagePool
    };
  }, [users, leaves]);

  // Stats for Employee
  const employeeStats = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const userAttendance = attendance.filter(a => a.userId === currentUser.id);
    const presentThisMonth = userAttendance.filter(a => a.date.startsWith(todayStr.slice(0, 7))).length;
    const remainingPTO = 24 - leaves.filter(l => l.userId === currentUser.id && l.status === LeaveStatus.APPROVED).length;
    const lastCheckIn = userAttendance.length > 0 ? userAttendance[userAttendance.length - 1].checkIn : '--:--';
    return {
      daysPresent: presentThisMonth,
      leavesRemaining: remainingPTO,
      lastCheckIn
    };
  }, [attendance, leaves, currentUser.id]);

  const filteredUsers = users.filter(u => 
    u.companyId === currentUser.companyId && (
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.designation?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccessMsg('');
    try {
      const added = await addEmployee(newEmployeeData);
      setSuccessMsg(`Employee added! Temp Password: ${added.password}`);
      setNewEmployeeData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        yearOfJoining: new Date().getFullYear().toString(),
        totalWage: 50000
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Welcome & Overview Section */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black text-[#2C2C2C]">Welcome back, {currentUser.name.split(' ')[0]}</h1>
            <p className="text-gray-400 font-medium tracking-tight mt-1">Here is what's happening at <span className="text-[#3B3C36] font-bold">{currentUser.companyName}</span> today.</p>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-sm font-black text-gray-300 uppercase tracking-widest">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">System Status: <span className="text-green-500">Online</span></p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isAdmin ? (
            <>
              <StatCard icon={<Users className="text-blue-500" />} label="Total Workforce" value={adminStats.totalEmployees.toString()} sub="Active personnel" />
              <StatCard icon={<CheckCircle className="text-green-500" />} label="Present Today" value={adminStats.presentToday.toString()} sub={`${((adminStats.presentToday / (adminStats.totalEmployees || 1)) * 100).toFixed(0)}% Attendance`} />
              <StatCard icon={<CalendarIcon className="text-orange-500" />} label="Pending Leaves" value={adminStats.pendingLeaves.toString()} sub="Requires approval" />
              <StatCard icon={<TrendingUp className="text-purple-500" />} label="Monthly Payroll" value={`₹${(adminStats.payrollTotal / 1000).toFixed(1)}k`} sub="Budgeted CTC" />
            </>
          ) : (
            <>
              <StatCard icon={<CalendarIcon className="text-blue-500" />} label="Days Present" value={employeeStats.daysPresent.toString()} sub="This month" />
              <StatCard icon={<Clock className="text-orange-500" />} label="Last Check-In" value={employeeStats.lastCheckIn || '--:--'} sub="Arrival log" />
              <StatCard icon={<PieChart className="text-green-500" />} label="Leave Balance" value={employeeStats.leavesRemaining.toString()} sub="Days available" />
              <StatCard icon={<Activity className="text-purple-500" />} label="Work Hours" value="164h" sub="Last 30 days" />
            </>
          )}
        </div>
      </section>

      {/* Directory Section */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-t border-gray-100 pt-10">
          <div>
            <h2 className="text-2xl font-black text-[#2C2C2C]">Organization Directory</h2>
            <p className="text-gray-400 font-medium">Connect with your colleagues across departments</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search by name, ID or role..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#3B3C36] w-full md:w-80 font-medium shadow-sm transition-all text-sm"
              />
            </div>
            {isAdmin && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-[#3B3C36] text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-[#2C2D28] transition-all font-black text-xs uppercase tracking-widest shadow-xl shadow-[#3B3C36]/20"
              >
                <Plus size={18} /> Add Talent
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredUsers.map((user) => (
            <div 
              key={user.id} 
              onClick={() => navigate(`/profile/${user.id}`)}
              className="bg-white border border-gray-100 rounded-[2rem] p-8 hover:shadow-2xl transition-all cursor-pointer relative group overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-2 h-full bg-[#3B3C36] opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-8 right-8">
                <StatusDot status={user.status} />
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-[2rem] bg-gray-50 border-4 border-white shadow-xl overflow-hidden mb-6 group-hover:scale-110 transition-transform duration-500">
                  {user.profilePhoto ? (
                    <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#3B3C36] text-white font-black text-2xl uppercase">
                      {user.name.slice(0, 1)}
                    </div>
                  )}
                </div>
                <h3 className="font-black text-xl text-[#2C2C2C] group-hover:text-[#3B3C36] transition-colors leading-tight">{user.name}</h3>
                <p className="text-[10px] text-[#FF7043] font-black uppercase tracking-[0.2em] mt-2">{user.designation || 'Specialist'}</p>
                <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest mt-1 mb-5">{user.employeeId}</p>
                
                <div className="flex flex-wrap justify-center gap-2 mt-auto">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${user.role === UserRole.ADMIN ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                    {user.role}
                  </span>
                  <span className="text-[9px] bg-gray-50 text-gray-400 px-3 py-1 rounded-full font-black border border-gray-100 uppercase">
                    {user.department || 'Gen Dev'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-gray-100 flex flex-col items-center gap-4">
            <ShieldAlert className="text-gray-100" size={64} />
            <p className="text-gray-400 font-black uppercase tracking-widest text-xs">No matching talent found in the directory</p>
          </div>
        )}
      </section>

      {/* Add Employee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#2C2C2C]/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-[#3B3C36] text-white">
              <div className="flex items-center gap-3">
                <Plus size={24} className="text-[#FF7043]" />
                <h3 className="text-xl font-black uppercase tracking-widest">Onboard New Talent</h3>
              </div>
              <button onClick={() => { setIsModalOpen(false); setSuccessMsg(''); setError(''); }} className="hover:rotate-90 transition-transform p-3 bg-white/10 rounded-full"><X size={20}/></button>
            </div>
            
            {successMsg ? (
              <div className="p-12 text-center space-y-8">
                <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle size={40} />
                </div>
                <div>
                  <h4 className="text-2xl font-black text-gray-800">Registration Complete</h4>
                  <div className="bg-[#F9F7F2] p-6 rounded-3xl border border-gray-100 mt-6 space-y-2">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Temporary Access Password</p>
                    <p className="text-2xl font-black text-[#3B3C36] tracking-widest font-mono">{successMsg.split(': ')[1]}</p>
                  </div>
                  <p className="text-sm text-gray-500 font-medium mt-6 leading-relaxed">Provide these credentials to the employee. They will be required to define a permanent password upon first access.</p>
                </div>
                <button 
                  onClick={() => { setIsModalOpen(false); setSuccessMsg(''); }}
                  className="w-full bg-[#3B3C36] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-[#3B3C36]/20"
                >
                  Confirm & Finish
                </button>
              </div>
            ) : (
              <form onSubmit={handleAddEmployee} className="p-10 space-y-6">
                {error && <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-3 border border-red-100"><ShieldAlert size={16}/> {error}</div>}
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">First Name</label>
                    <input 
                      type="text" required value={newEmployeeData.firstName}
                      onChange={e => setNewEmployeeData({...newEmployeeData, firstName: e.target.value})}
                      className="w-full bg-[#F9F7F2] rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-[#3B3C36] font-bold text-sm transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">Last Name</label>
                    <input 
                      type="text" required value={newEmployeeData.lastName}
                      onChange={e => setNewEmployeeData({...newEmployeeData, lastName: e.target.value})}
                      className="w-full bg-[#F9F7F2] rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-[#3B3C36] font-bold text-sm transition-all"
                    />
                  </div>
                </div>

                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="email" placeholder="Professional Email Address" required
                    value={newEmployeeData.email} onChange={e => setNewEmployeeData({...newEmployeeData, email: e.target.value})}
                    className="w-full pl-14 pr-5 py-4 bg-[#F9F7F2] rounded-2xl focus:ring-2 focus:ring-[#3B3C36] outline-none font-bold text-sm transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="relative">
                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="tel" placeholder="Phone" required
                      value={newEmployeeData.phone} onChange={e => setNewEmployeeData({...newEmployeeData, phone: e.target.value})}
                      className="w-full pl-14 pr-5 py-4 bg-[#F9F7F2] rounded-2xl focus:ring-2 focus:ring-[#3B3C36] outline-none font-bold text-sm transition-all"
                    />
                  </div>
                  <div className="relative">
                    <CalendarIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="number" placeholder="Joining Year" required
                      value={newEmployeeData.yearOfJoining} onChange={e => setNewEmployeeData({...newEmployeeData, yearOfJoining: e.target.value})}
                      className="w-full pl-14 pr-5 py-4 bg-[#F9F7F2] rounded-2xl focus:ring-2 focus:ring-[#3B3C36] outline-none font-bold text-sm transition-all"
                    />
                  </div>
                </div>

                <div className="relative">
                  <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="number" placeholder="Base Remuneration (Monthly CTC)" required
                    value={newEmployeeData.totalWage} onChange={e => setNewEmployeeData({...newEmployeeData, totalWage: parseInt(e.target.value) || 0})}
                    className="w-full pl-14 pr-5 py-4 bg-[#F9F7F2] rounded-2xl focus:ring-2 focus:ring-[#3B3C36] outline-none font-bold text-sm transition-all"
                  />
                  <p className="text-[9px] text-gray-400 font-black mt-3 uppercase tracking-widest text-center">Standard HRA, PF, and Tax calculations will be applied automatically</p>
                </div>

                <div className="flex gap-6 pt-6">
                  <button 
                    type="button" onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-5 font-black text-gray-400 hover:text-gray-600 transition-colors uppercase text-xs tracking-widest"
                  >
                    Discard
                  </button>
                  <button 
                    type="submit" disabled={isSubmitting}
                    className="flex-1 bg-[#3B3C36] text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-[#3B3C36]/20 hover:bg-[#2C2D28] transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? 'Processing...' : 'Onboard Employee'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; sub: string }> = ({ icon, label, value, sub }) => (
  <div className="bg-white border border-gray-100 p-6 rounded-[2rem] shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
    <div className="flex items-center gap-4">
      <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-white group-hover:shadow-md transition-all">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-black text-[#3B3C36] mt-0.5 tracking-tight">{value}</p>
      </div>
    </div>
    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter mt-4 border-t border-gray-50 pt-3">{sub}</p>
  </div>
);

export default Dashboard;
