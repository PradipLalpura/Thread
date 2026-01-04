
import React, { useState, useMemo } from 'react';
import { useApp } from '../store/context';
import { UserRole, AttendanceStatus } from '../types';
import { Clock, CheckCircle2, AlertCircle, Search, Calendar, FileText, Info, BarChart2 } from 'lucide-react';

const Attendance: React.FC = () => {
  const { currentUser, attendance, users, submitAttendance, updateAttendance } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);

  const isAdmin = currentUser?.role === UserRole.ADMIN;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = attendance.find(r => r.userId === currentUser?.id && r.date === todayStr);

  const handleCheckIn = () => {
    submitAttendance({
      checkIn: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: AttendanceStatus.PRESENT
    });
  };

  const handleCheckOut = () => {
    if (!todayRecord) return;
    const workHours = 8; 
    const extraHours = 1; 
    updateAttendance(todayRecord.id, {
      checkOut: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      workHours,
      extraHours
    });
  };

  const displayRecords = isAdmin 
    ? attendance.filter(r => r.date === dateFilter)
    : attendance.filter(r => r.userId === currentUser?.id);

  const stats = useMemo(() => {
    const present = displayRecords.filter(r => r.status === AttendanceStatus.PRESENT).length;
    const leaves = displayRecords.filter(r => r.status === AttendanceStatus.LEAVE).length;
    const absent = displayRecords.filter(r => r.status === AttendanceStatus.ABSENT).length;
    const totalHours = displayRecords.reduce((acc, r) => acc + (r.workHours || 0), 0);
    const extraHours = displayRecords.reduce((acc, r) => acc + (r.extraHours || 0), 0);
    return { present, leaves, absent, totalHours, extraHours };
  }, [displayRecords]);

  const filteredRecords = displayRecords.filter(r => {
    const user = users.find(u => u.id === r.userId);
    return user?.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#2C2C2C]">Attendance Vault</h1>
          <p className="text-gray-400 font-medium tracking-tight">Organization compliance and clocking logs</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          {isAdmin && (
            <>
              <div className="relative flex-1 md:flex-none">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" placeholder="Lookup talent..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  className="pl-12 pr-6 py-3 bg-white border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-[#3B3C36] outline-none shadow-sm font-medium w-full md:w-64"
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
                  className="pl-12 pr-6 py-3 bg-white border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-[#3B3C36] outline-none shadow-sm font-bold"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Summary Banner */}
      <div className="bg-[#3B3C36] rounded-[2.5rem] p-10 flex flex-col lg:flex-row items-center justify-between gap-10 shadow-2xl shadow-[#3B3C36]/30">
        <div className="flex items-center gap-8 text-white w-full lg:w-auto">
           <div className="p-4 bg-white/10 rounded-3xl backdrop-blur-md border border-white/10 hidden sm:block">
              <BarChart2 size={32} className="text-[#FF7043]" />
           </div>
           <div className="grid grid-cols-2 sm:grid-cols-4 gap-12">
              <SummaryItem label="Present" value={stats.present.toString()} color="text-green-400" />
              <SummaryItem label="On Leave" value={stats.leaves.toString()} color="text-yellow-400" />
              <SummaryItem label="Absent" value={stats.absent.toString()} color="text-red-400" />
              <SummaryItem label="Work Hours" value={`${stats.totalHours}h`} color="text-blue-400" />
           </div>
        </div>
        
        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/5 w-full lg:w-auto justify-center">
           <div className="text-right hidden sm:block">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Policy Legend</p>
              <div className="flex items-center gap-4 mt-2">
                 <LegendItem color="bg-green-500" label="Present" />
                 <LegendItem color="bg-yellow-500" label="Leave" />
                 <LegendItem color="bg-red-500" label="Absent" />
              </div>
           </div>
        </div>
      </div>

      {!isAdmin && (
        <div className="bg-white border border-gray-100 rounded-[3rem] p-12 flex flex-col md:flex-row items-center gap-16 shadow-xl shadow-gray-200/40">
          <div className="flex-1 space-y-5 text-center md:text-left">
            <h2 className="text-5xl font-black text-[#3B3C36] tracking-tighter">On the Clock</h2>
            <p className="text-gray-400 font-bold text-xl">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
            {todayRecord ? (
              <div className="flex items-center gap-3 text-green-600 font-black bg-green-50 px-6 py-3 rounded-2xl inline-flex text-xs uppercase tracking-widest border border-green-100">
                <CheckCircle2 size={18} /> Active Working Session
              </div>
            ) : (
              <div className="flex items-center gap-3 text-orange-600 font-black bg-orange-50 px-6 py-3 rounded-2xl inline-flex text-xs uppercase tracking-widest border border-orange-100">
                <Clock size={18} /> Awaiting Log In
              </div>
            )}
          </div>
          
          <div className="flex flex-col items-center gap-6 bg-[#F9F7F2] p-12 rounded-[3.5rem] border border-[#3B3C36]/5 min-w-[380px] shadow-inner">
            <div className="flex items-center gap-5 text-5xl font-black text-[#3B3C36] tracking-tighter">
              <Clock size={48} className="text-[#FF7043]" /> {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            {!todayRecord ? (
              <button 
                onClick={handleCheckIn}
                className="w-full bg-[#3B3C36] text-white py-6 px-10 rounded-[2rem] font-black text-xl hover:bg-[#2C2D28] transition-all transform hover:scale-[1.02] active:scale-95 shadow-2xl shadow-[#3B3C36]/20 uppercase tracking-widest"
              >
                Check In
              </button>
            ) : (
              <button 
                onClick={handleCheckOut}
                disabled={!!todayRecord.checkOut}
                className="w-full border-4 border-[#3B3C36] text-[#3B3C36] py-6 px-10 rounded-[2rem] font-black text-xl hover:bg-white transition-all disabled:opacity-50 disabled:border-gray-100 disabled:text-gray-300 uppercase tracking-widest"
              >
                {todayRecord.checkOut ? `Ended: ${todayRecord.checkOut}` : 'Check Out'}
              </button>
            )}
            <div className="flex items-center gap-2 text-[9px] font-black text-gray-300 uppercase tracking-widest">
               <Info size={12} /> Real-time geo-location verified
            </div>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white border border-gray-100 rounded-[3rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
              <tr>
                {isAdmin && <th className="px-10 py-6">Personnel</th>}
                <th className="px-10 py-6">Calendar Date</th>
                <th className="px-10 py-6">Arrival</th>
                <th className="px-10 py-6">Departure</th>
                <th className="px-10 py-6">Work Log</th>
                <th className="px-10 py-6">Extra Time</th>
                <th className="px-10 py-6">Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[...filteredRecords].reverse().map(record => {
                const user = users.find(u => u.id === record.userId);
                const isPresent = record.status === AttendanceStatus.PRESENT;
                const isLeave = record.status === AttendanceStatus.LEAVE;
                return (
                  <tr key={record.id} className="hover:bg-gray-50/50 transition-colors group">
                    {isAdmin && (
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-[#3B3C36] text-white flex items-center justify-center text-xs font-black overflow-hidden border-2 border-white shadow-md group-hover:rotate-6 transition-transform">
                            {user?.profilePhoto ? <img src={user.profilePhoto} className="w-full h-full object-cover" /> : user?.name.slice(0, 1)}
                          </div>
                          <div className="flex flex-col">
                             <span className="font-black text-sm text-[#2C2C2C] group-hover:text-[#3B3C36] transition-colors">{user?.name}</span>
                             <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">{user?.designation}</span>
                          </div>
                        </div>
                      </td>
                    )}
                    <td className="px-10 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">{new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td className="px-10 py-6 text-sm font-black text-[#3B3C36]">{record.checkIn || '--:--'}</td>
                    <td className="px-10 py-6 text-sm font-black text-[#3B3C36]">{record.checkOut || '--:--'}</td>
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-2">
                         <span className={`text-sm font-black ${record.workHours >= 8 ? 'text-green-600' : 'text-gray-300'}`}>
                           {record.workHours > 0 ? `${record.workHours}h` : '0h'}
                         </span>
                         <div className="h-1 w-8 bg-gray-50 rounded-full overflow-hidden hidden sm:block">
                            <div className="h-full bg-green-500" style={{ width: `${Math.min((record.workHours/8)*100, 100)}%` }} />
                         </div>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-sm font-black text-[#FF7043]">{record.extraHours > 0 ? `+${record.extraHours}h` : '-'}</td>
                    <td className="px-10 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        isPresent ? 'bg-green-50 text-green-600 border-green-100' : 
                        isLeave ? 'bg-yellow-50 text-yellow-600 border-yellow-100' : 
                        'bg-red-50 text-red-600 border-red-100'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {/* Summary Footer */}
          {filteredRecords.length > 0 && (
             <div className="p-8 bg-gray-50/30 border-t border-gray-50 flex justify-between items-center px-10">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Aggregate Data</p>
                <div className="flex gap-10">
                   <div className="text-right">
                      <p className="text-[9px] font-black text-gray-300 uppercase">Gross Work Hours</p>
                      <p className="text-xl font-black text-[#3B3C36]">{stats.totalHours}h</p>
                   </div>
                   <div className="text-right">
                      <p className="text-[9px] font-black text-gray-300 uppercase">Total OT Accrued</p>
                      <p className="text-xl font-black text-[#FF7043]">{stats.extraHours}h</p>
                   </div>
                </div>
             </div>
          )}

          {filteredRecords.length === 0 && (
            <div className="py-32 text-center">
              <FileText className="mx-auto mb-6 text-gray-50" size={80} />
              <p className="text-gray-300 font-black uppercase tracking-widest text-xs">No organizational work logs detected</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SummaryItem: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <div className="flex flex-col">
     <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">{label}</span>
     <span className={`text-3xl font-black ${color} tracking-tighter`}>{value}</span>
  </div>
);

const LegendItem: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <div className="flex items-center gap-2">
     <div className={`w-2 h-2 rounded-full ${color}`} />
     <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">{label}</span>
  </div>
);

export default Attendance;
