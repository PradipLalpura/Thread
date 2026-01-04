
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { User, AttendanceRecord, LeaveRequest, UserRole, AttendanceStatus, SalaryInfo } from '../types';

interface AppContextType {
  users: User[];
  currentUser: User | null;
  attendance: AttendanceRecord[];
  leaves: LeaveRequest[];
  companies: { id: string; name: string }[];
  login: (emailOrId: string, password: string, companyId: string) => Promise<User>;
  signup: (data: any) => Promise<User>;
  logout: () => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  addEmployee: (data: any) => Promise<User>;
  changePassword: (newPassword: string) => void;
  submitAttendance: (record: Partial<AttendanceRecord>) => void;
  updateAttendance: (recordId: string, updates: Partial<AttendanceRecord>) => void;
  submitLeave: (request: Partial<LeaveRequest>) => void;
  updateLeaveStatus: (leaveId: string, status: any, remarks?: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allAttendance, setAllAttendance] = useState<AttendanceRecord[]>([]);
  const [allLeaves, setAllLeaves] = useState<LeaveRequest[]>([]);

  useEffect(() => {
    const storedUsers = localStorage.getItem('thread_users');
    const storedAttendance = localStorage.getItem('thread_attendance');
    const storedLeaves = localStorage.getItem('thread_leaves');
    const storedCurrent = localStorage.getItem('thread_current_user');

    if (storedUsers) setAllUsers(JSON.parse(storedUsers));
    if (storedAttendance) setAllAttendance(JSON.parse(storedAttendance));
    if (storedLeaves) setAllLeaves(JSON.parse(storedLeaves));
    if (storedCurrent) setCurrentUser(JSON.parse(storedCurrent));
  }, []);

  useEffect(() => {
    localStorage.setItem('thread_users', JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem('thread_attendance', JSON.stringify(allAttendance));
  }, [allAttendance]);

  useEffect(() => {
    localStorage.setItem('thread_leaves', JSON.stringify(allLeaves));
  }, [allLeaves]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('thread_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('thread_current_user');
    }
  }, [currentUser]);

  const companies = useMemo(() => {
    const unique = new Map<string, string>();
    allUsers.forEach(u => unique.set(u.companyId, u.companyName));
    return Array.from(unique.entries()).map(([id, name]) => ({ id, name }));
  }, [allUsers]);

  const isolatedUsers = useMemo(() => 
    currentUser ? allUsers.filter(u => u.companyId === currentUser.companyId) : [],
    [allUsers, currentUser]
  );

  const isolatedAttendance = useMemo(() => 
    currentUser ? allAttendance.filter(a => a.companyId === currentUser.companyId) : [],
    [allAttendance, currentUser]
  );

  const isolatedLeaves = useMemo(() => 
    currentUser ? allLeaves.filter(l => l.companyId === currentUser.companyId) : [],
    [allLeaves, currentUser]
  );

  const validatePhone = (phone: string) => {
    if (!/^\d{10}$/.test(phone)) {
      throw new Error('Phone number must contain exactly 10 digits.');
    }
  };

  const validateDomain = (email: string) => {
    const lower = email.toLowerCase();
    if (!lower.endsWith('@admin.com') && !lower.endsWith('@employee.com')) {
      throw new Error('Invalid email domain. Please use your official company email (@admin.com or @employee.com).');
    }
  };

  const generateEmployeeId = (companyName: string, firstName: string, lastName: string, year: number, serial: number) => {
    const companyCode = companyName.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
    const f2First = firstName.slice(0, 2).toUpperCase();
    const f2Last = lastName.slice(0, 2).toUpperCase();
    const serialStr = String(serial).padStart(4, '0');
    return `${companyCode}${f2First}${f2Last}${year}${serialStr}`;
  };

  const login = async (emailOrId: string, password: string, companyId: string) => {
    const user = allUsers.find(u => (u.email === emailOrId || u.employeeId === emailOrId));
    if (!user) throw new Error('Invalid credentials. User not found.');
    
    validateDomain(user.email);
    
    if (user.companyId !== companyId) {
      throw new Error('Selected company does not match user account.');
    }

    if (user.password && user.password !== password) throw new Error('Invalid credentials. Incorrect password.');
    setCurrentUser(user);
    return user;
  };

  const signup = async (data: any) => {
    const isExisting = allUsers.find(u => u.email === data.email);
    if (isExisting) throw new Error('Email already registered');

    validateDomain(data.email);
    validatePhone(data.phone);

    const role = data.email.toLowerCase().endsWith('@admin.com') ? UserRole.ADMIN : UserRole.EMPLOYEE;
    const year = new Date().getFullYear();
    const companyId = data.companyName.toLowerCase().replace(/\s+/g, '-');
    const companySerial = allUsers.filter(u => u.companyId === companyId && u.joiningYear === year).length + 1;
    
    const [firstName, ...lastNameParts] = data.name.split(' ');
    const lastName = lastNameParts.join(' ') || 'User';
    const empId = generateEmployeeId(data.companyName, firstName, lastName, year, companySerial);

    const newUser: User = {
      id: crypto.randomUUID(),
      employeeId: empId,
      companyId: companyId,
      companyName: data.companyName,
      companyLogo: data.companyLogo || undefined,
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: role,
      joiningYear: year,
      status: AttendanceStatus.ABSENT,
      password: data.password,
      isFirstLogin: false,
      designation: role === UserRole.ADMIN ? 'HR Manager' : 'Software Engineer',
      department: role === UserRole.ADMIN ? 'Human Resources' : 'Technology',
      employmentType: 'Full-time',
      location: 'Remote',
      about: 'Strategic professional committed to excellence and driving organizational growth.',
      salary: {
        wageType: 'Monthly',
        totalWage: 50000,
        basic: 25000,
        hra: 12500,
        allowances: 7500,
        bonus: 5000,
        pf: 3000,
        tax: 200,
        extraWages: 0,
        deductions: 0
      }
    };

    setAllUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    return newUser;
  };

  const addEmployee = async (data: any) => {
    if (!currentUser || currentUser.role !== UserRole.ADMIN) throw new Error('Unauthorized');
    
    if (!data.email.toLowerCase().endsWith('@employee.com')) {
      throw new Error('New employees must have an @employee.com domain.');
    }
    
    const isExisting = allUsers.find(u => u.email === data.email);
    if (isExisting) throw new Error('Employee email already registered');

    validatePhone(data.phone);

    const year = parseInt(data.yearOfJoining) || new Date().getFullYear();
    const companySerial = allUsers.filter(u => u.companyId === currentUser.companyId && u.joiningYear === year).length + 1;
    
    const empId = generateEmployeeId(currentUser.companyName, data.firstName, data.lastName, year, companySerial);
    const tempPassword = Math.random().toString(36).slice(-8);

    const newUser: User = {
      id: crypto.randomUUID(),
      employeeId: empId,
      companyId: currentUser.companyId,
      companyName: currentUser.companyName,
      companyLogo: currentUser.companyLogo,
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      phone: data.phone,
      role: UserRole.EMPLOYEE,
      joiningYear: year,
      status: AttendanceStatus.ABSENT,
      password: tempPassword,
      isFirstLogin: true,
      designation: 'Associate Consultant',
      department: 'Operations',
      employmentType: 'Full-time',
      location: 'On-site',
      about: 'Enthusiastic team player focused on delivering value.',
      salary: {
        wageType: 'Monthly',
        totalWage: data.totalWage || 50000,
        basic: (data.totalWage || 50000) * 0.5,
        hra: (data.totalWage || 50000) * 0.25,
        allowances: (data.totalWage || 50000) * 0.15,
        bonus: (data.totalWage || 50000) * 0.1,
        pf: ((data.totalWage || 50000) * 0.5) * 0.12,
        tax: 200,
        extraWages: 0,
        deductions: 0
      }
    };

    setAllUsers(prev => [...prev, newUser]);
    return newUser;
  };

  const changePassword = (newPassword: string) => {
    if (!currentUser) return;
    updateUser(currentUser.id, { password: newPassword, isFirstLogin: false });
  };

  const logout = () => setCurrentUser(null);

  const updateUser = (userId: string, updates: Partial<User>) => {
    const target = allUsers.find(u => u.id === userId);
    if (!target || (currentUser && target.companyId !== currentUser.companyId)) {
        throw new Error('403: Unauthorized update attempt.');
    }
    
    // Admin Salary Visibility Restriction: Cannot edit self salary
    if (currentUser?.id === userId && updates.salary && currentUser.role === UserRole.ADMIN) {
      throw new Error('Administrators cannot modify their own salary data.');
    }

    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
    if (currentUser?.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const submitAttendance = (record: Partial<AttendanceRecord>) => {
    if (!currentUser) return;
    const newRecord: AttendanceRecord = {
      id: crypto.randomUUID(),
      userId: currentUser.id,
      companyId: currentUser.companyId,
      date: new Date().toISOString().split('T')[0],
      workHours: 0,
      extraHours: 0,
      status: AttendanceStatus.PRESENT,
      ...record
    } as AttendanceRecord;
    setAllAttendance(prev => [...prev, newRecord]);
    updateUser(currentUser.id, { status: AttendanceStatus.PRESENT });
  };

  const updateAttendance = (recordId: string, updates: Partial<AttendanceRecord>) => {
    const target = allAttendance.find(a => a.id === recordId);
    if (!target || (currentUser && target.companyId !== currentUser.companyId)) {
        throw new Error('403: Unauthorized attendance update.');
    }
    setAllAttendance(prev => prev.map(r => r.id === recordId ? { ...r, ...updates } : r));
  };

  const submitLeave = (request: Partial<LeaveRequest>) => {
    if (!currentUser) return;
    const newRequest: LeaveRequest = {
      id: crypto.randomUUID(),
      userId: currentUser.id,
      companyId: currentUser.companyId,
      userName: currentUser.name,
      status: 'PENDING',
      ...request
    } as LeaveRequest;
    setAllLeaves(prev => [...prev, newRequest]);
  };

  const updateLeaveStatus = (leaveId: string, status: any, remarks?: string) => {
    const target = allLeaves.find(l => l.id === leaveId);
    if (!target || (currentUser && target.companyId !== currentUser.companyId)) {
        throw new Error('403: Unauthorized leave status update.');
    }
    setAllLeaves(prev => prev.map(l => l.id === leaveId ? { ...l, status, adminRemarks: remarks } : l));
    if (status === 'APPROVED') {
       updateUser(target.userId, { status: AttendanceStatus.LEAVE });
    }
  };

  return (
    <AppContext.Provider value={{
      users: isolatedUsers, 
      currentUser, 
      attendance: isolatedAttendance, 
      leaves: isolatedLeaves,
      companies,
      login, signup, logout, updateUser, addEmployee, changePassword, submitAttendance, updateAttendance, submitLeave, updateLeaveStatus
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
