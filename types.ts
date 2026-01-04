
export enum UserRole {
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE'
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  LEAVE = 'LEAVE',
  ABSENT = 'ABSENT'
}

export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum LeaveType {
  PTO = 'Paid Time Off',
  SICK = 'Sick Leave',
  UNPAID = 'Unpaid Leave'
}

export interface SalaryInfo {
  wageType: 'Monthly' | 'Yearly';
  totalWage: number;
  basic: number;
  hra: number;
  allowances: number;
  bonus: number;
  pf: number;
  tax: number;
  extraWages: number;
  deductions: number;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  companyId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  workHours: number;
  extraHours: number;
  status: AttendanceStatus;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  companyId: string;
  userName: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  attachment?: string;
  adminRemarks?: string;
}

export interface User {
  id: string;
  employeeId: string;
  companyId: string;
  companyName: string;
  companyLogo?: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  profilePhoto?: string;
  role: UserRole;
  salary: SalaryInfo;
  joiningYear: number;
  status: AttendanceStatus;
  password?: string;
  isFirstLogin: boolean;
  // Enriched Content Fields
  designation?: string;
  department?: string;
  manager?: string;
  employmentType?: 'Full-time' | 'Part-time' | 'Contract' | 'Intern';
  location?: string;
  about?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
