
import React, { useState, useMemo } from 'react';
import { useApp } from '../store/context';
import { UserRole, LeaveType, LeaveStatus } from '../types';
import { Calendar, Plus, Check, X, FileText, Info, ShieldAlert, Clock, MessageSquare, History } from 'lucide-react';

const TimeOff: React.FC = () => {
  const { currentUser, leaves, submitLeave, updateLeaveStatus, users } = useApp();
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [activeRequest, setActiveRequest] = useState<string | null>(null);
  const [newLeave, setNewLeave] = useState({
    type: LeaveType.PTO,
    startDate: '',
    endDate: '',
    reason: '',
  });

  if (!currentUser) return null;

  const isAdmin = currentUser.role === UserRole.ADMIN;
  const displayLeaves = isAdmin ? leaves : leaves.filter(l => l.userId === currentUser.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitLeave(newLeave);
    setShowApplyModal(false);
    setNewLeave({ type: LeaveType.PTO, startDate: '', endDate: '', reason: '' });
  };

  const balances = useMemo(() => {
    const userLeaves = leaves.filter(l => l.userId === currentUser.id && l.status === LeaveStatus.APPROVED);
    const ptoUsed = userLeaves.filter(l => l.type === LeaveType.PTO).length;
    const sickUsed = userLeaves.filter(l => l.type === LeaveType.SICK).length;
    const unpaidUsed = userLeaves.filter(l => l.type === LeaveType.UNPAID).length;
    return {
      PTO: { used: ptoUsed, total: 24 },
      SICK: { used: sickUsed, total: 10 },
      UNPAID: { used: unpaidUsed, total: Infinity }
    };
  }, [leaves, currentUser.id]);

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-[#2C2C2C] tracking-tight">Time Off Registry</h1>
          <p className="text-gray-400 font-medium mt-1">Global leave management and allocation</p>
        </div>
        {!isAdmin && (
          <button 
            onClick={() => setShowApplyModal(true)}
            className="bg-[#3B3C36] text-white px-10 py-4 rounded-[2rem] flex items-center gap-3 hover:bg-[#2C2D28] transition-all shadow-2xl shadow-[#3B3C36]/20 font-black text-xs uppercase tracking-[0.2em]"
          >
            <Plus size={18} /> Request Absence
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <BalanceCard label="Paid Annual Leave" count={balances.PTO.used} available={balances.PTO.total} color="bg-[#FF7043]" />
        <BalanceCard label="Sick & Wellness" count={balances.SICK.used} available={balances.SICK.total} color="bg-[#8BC34A]" />
        <BalanceCard label="Unpaid General" count={balances.UNPAID.used} available={balances.UNPAID.total} color="bg-gray-300" />
      </div>

      <div className="bg-white border border-gray-100 rounded-[3rem] overflow-hidden shadow-2xl shadow-gray-200/30">
        <div className="p-10 border-b border-gray-50 flex items-center justify-between bg-gray-50/20">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-white rounded-2xl shadow-sm"><History size={20} className="text-[#3B3C36]" /></div>
             <h3 className="font-black text-xl text-[#3B3C36]">Application Records</h3>
          </div>
          <div className="flex gap-2">
            <span className="bg-[#3B3C36] text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-[#3B3C36]/10">Archive Size: {displayLeaves.length}</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
              <tr>
                {isAdmin && <th className="px-10 py-6">Applicant</th>}
                <th className="px-10 py-6">Leave Category</th>
                <th className="px-10 py-6">Schedule Duration</th>
                <th className="px-10 py-6">Context / Reason</th>
                <th className="px-10 py-6">Approval Status</th>
                {isAdmin && <th className="px-10 py-6 text-right">Decisions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[...displayLeaves].reverse().map(leave => {
                const user = users.find(u => u.id === leave.userId);
                const isPending = leave.status === 'PENDING';
                return (
                  <tr key={leave.id} className="hover:bg-gray-50/50 transition-colors group">
                    {isAdmin && (
                      <td className="px-10 py-6">
                        <div className="flex flex-col">
                           <p className="font-black text-sm text-[#2C2C2C] group-hover:text-[#3B3C36] transition-colors">{leave.userName}</p>
                           <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">{user?.designation}</span>
                        </div>
                      </td>
                    )}
                    <td className="px-10 py-6">
                      <span className="text-xs font-black text-gray-500 uppercase tracking-tight">{leave.type}</span>
                    </td>
                    <td className="px-10 py-6 text-xs text-gray-400 font-bold">
                      <div className="flex items-center gap-3">
                        <Calendar size={14} className="text-blue-400" /> {leave.startDate} <span className="text-gray-200">→</span> {leave.endDate}
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500 truncate max-w-[250px] font-medium italic">"{leave.reason}"</p>
                        {leave.adminRemarks && (
                           <p className="text-[9px] font-black text-[#FF7043] uppercase tracking-widest flex items-center gap-1">
                              <MessageSquare size={10} /> {leave.adminRemarks}
                           </p>
                        )}
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <StatusBadge status={leave.status} />
                    </td>
                    {isAdmin && (
                      <td className="px-10 py-6 text-right">
                        {isPending && (
                          <div className="flex items-center justify-end gap-3 animate-in slide-in-from-right-2">
                            {activeRequest === leave.id ? (
                               <div className="flex items-center gap-2 bg-[#F9F7F2] p-2 rounded-2xl border border-gray-100 shadow-xl">
                                  <input 
                                    type="text" 
                                    placeholder="Add remark..." 
                                    className="bg-white border rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#3B3C36]" 
                                    value={remarks}
                                    onChange={e => setRemarks(e.target.value)}
                                  />
                                  <button onClick={() => { updateLeaveStatus(leave.id, 'APPROVED', remarks); setActiveRequest(null); setRemarks(''); }} className="bg-green-500 text-white p-2 rounded-xl"><Check size={16}/></button>
                                  <button onClick={() => { updateLeaveStatus(leave.id, 'REJECTED', remarks); setActiveRequest(null); setRemarks(''); }} className="bg-red-500 text-white p-2 rounded-xl"><X size={16}/></button>
                               </div>
                            ) : (
                              <button 
                                onClick={() => setActiveRequest(leave.id)}
                                className="px-6 py-2.5 bg-[#3B3C36] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-[#3B3C36]/20"
                              >
                                Review Request
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
          {displayLeaves.length === 0 && (
            <div className="py-32 text-center">
              <Clock className="mx-auto mb-6 text-gray-50" size={80} />
              <p className="text-gray-300 font-black uppercase tracking-widest text-xs">No pending or historical requests in the system</p>
            </div>
          )}
        </div>
      </div>

      {showApplyModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#2C2C2C]/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-[#3B3C36] text-white">
              <div className="flex items-center gap-4">
                <Calendar size={28} className="text-[#FF7043]" />
                <h3 className="text-xl font-black uppercase tracking-widest">Submit Absence Request</h3>
              </div>
              <button onClick={() => setShowApplyModal(false)} className="hover:rotate-90 transition-transform p-3 bg-white/10 rounded-full"><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-12 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 mb-3 uppercase tracking-[0.2em]">Absence Logic</label>
                  <select 
                    value={newLeave.type}
                    onChange={e => setNewLeave({...newLeave, type: e.target.value as LeaveType})}
                    className="w-full bg-[#F9F7F2] border-2 border-transparent rounded-2xl px-6 py-4 outline-none focus:border-[#3B3C36] font-black text-xs uppercase tracking-widest transition-all shadow-inner"
                  >
                    <option value={LeaveType.PTO}>Paid Time Off</option>
                    <option value={LeaveType.SICK}>Medical Leave</option>
                    <option value={LeaveType.UNPAID}>Unpaid Absence</option>
                  </select>
                </div>
                <div>
                   <label className="block text-[10px] font-black text-gray-400 mb-3 uppercase tracking-[0.2em]">Medical Evidence (optional)</label>
                   <label className="w-full bg-[#F9F7F2] rounded-2xl px-6 py-4 flex items-center justify-between cursor-pointer border-2 border-dashed border-gray-200 hover:border-[#3B3C36] transition-all shadow-inner">
                      <span className="text-[10px] font-black text-gray-300 uppercase">Attach Documents</span>
                      <Plus size={16} className="text-gray-300" />
                      <input type="file" className="hidden" />
                   </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 mb-3 uppercase tracking-[0.2em]">Departure Date</label>
                  <input 
                    type="date" required value={newLeave.startDate}
                    onChange={e => setNewLeave({...newLeave, startDate: e.target.value})}
                    className="w-full bg-[#F9F7F2] border-2 border-transparent rounded-2xl px-6 py-4 outline-none focus:border-[#3B3C36] font-bold text-sm transition-all shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 mb-3 uppercase tracking-[0.2em]">Re-Entry Date</label>
                  <input 
                    type="date" required value={newLeave.endDate}
                    onChange={e => setNewLeave({...newLeave, endDate: e.target.value})}
                    className="w-full bg-[#F9F7F2] border-2 border-transparent rounded-2xl px-6 py-4 outline-none focus:border-[#3B3C36] font-bold text-sm transition-all shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 mb-3 uppercase tracking-[0.2em]">Justification Detail</label>
                <textarea 
                  required rows={4} value={newLeave.reason}
                  onChange={e => setNewLeave({...newLeave, reason: e.target.value})}
                  className="w-full bg-[#F9F7F2] border-2 border-transparent rounded-[2rem] px-6 py-5 outline-none focus:border-[#3B3C36] font-medium text-sm resize-none transition-all shadow-inner"
                  placeholder="Provide comprehensive reasoning for the review committee..."
                />
              </div>

              <div className="flex gap-6 pt-6">
                <button 
                  type="button" onClick={() => setShowApplyModal(false)}
                  className="flex-1 py-5 font-black text-gray-400 hover:text-gray-600 transition-colors uppercase text-xs tracking-widest"
                >
                  Discard
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-[#3B3C36] text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-[#3B3C36]/20 hover:bg-[#2C2D28] transition-all"
                >
                  Finalize Submission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const BalanceCard: React.FC<{ label: string; count: number; available: number; color: string }> = ({ label, count, available, color }) => (
  <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-sm hover:shadow-2xl transition-all group overflow-hidden relative">
    <div className={`absolute top-0 right-0 w-3 h-full ${color} opacity-10 group-hover:opacity-100 transition-opacity`} />
    <div className="flex items-center justify-between mb-8">
      <h4 className="font-black text-gray-300 uppercase text-[10px] tracking-[0.4em]">{label}</h4>
      <div className="p-3 bg-gray-50 rounded-2xl shadow-inner"><Info size={16} className="text-gray-300" /></div>
    </div>
    <div className="flex items-end gap-3">
      <span className="text-6xl font-black text-[#3B3C36] tracking-tighter leading-none">{count}</span>
      <span className="text-gray-400 font-black text-[10px] uppercase mb-2 tracking-widest">/ {available === Infinity ? 'Unlimited' : `${available} Days Accrued`}</span>
    </div>
    <div className="mt-8 h-3 bg-gray-50 rounded-full overflow-hidden shadow-inner">
      <div className={`h-full ${color} transition-all duration-1000 ease-out`} style={{ width: available === Infinity ? '0%' : `${(count / available) * 100}%` }} />
    </div>
    <div className="mt-4 flex justify-between text-[8px] font-black text-gray-300 uppercase tracking-widest">
       <span>Utilized Capacity</span>
       <span>Available: {available === Infinity ? '∞' : available - count}</span>
    </div>
  </div>
);

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, string> = {
    PENDING: 'bg-yellow-50 text-yellow-600 border-yellow-100',
    APPROVED: 'bg-green-50 text-green-600 border-green-100',
    REJECTED: 'bg-red-50 text-red-600 border-red-100',
  };
  return (
    <span className={`px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest border ${styles[status]}`}>
      {status}
    </span>
  );
};

export default TimeOff;
