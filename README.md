🧵 THREAD – Human Resource Management System (HRMS)

Every workday, perfectly aligned.

THREAD is a modern, secure, and scalable Human Resource Management System (HRMS) designed to digitize and streamline employee management, attendance tracking, leave management, and salary visibility for organizations of any size.

This project was developed as part of the Odoo × GCET Hackathon with a focus on real-world usability, clean UX, and enterprise-grade data security.

🚀 Key Features
🔐 Authentication & Role Management

Secure Sign Up & Sign In

Role-based access control:

Admin / HR Officer

Employee

Role detection via email domain:

@admin → Admin / HR

@employee → Employee

Email verification & strong password validation

🆔 Automatic Employee ID Generation

Employee IDs are generated automatically after signup using a structured format:

<CompanyCode><First2LettersFirstName><First2LettersLastName><YearOfJoining><SerialNumber>


Example:

Company: Indian Railway → IR

Name: Pradip Lalpura

Year: 2025

Serial: 0001

Generated ID:

IRPRLA20250001


IDs are:

System-generated

Unique

Non-editable

Used across the platform for identification

🧑‍💼 Admin / HR Features
Employee Management

View employees (company-scoped only)

Edit complete employee profiles

View salary, attendance, and leave history

Status indicators for attendance

Attendance Management

Daily & date-filtered attendance view

Company-wide attendance visibility

Used as payroll reference

Read-only for integrity

Leave & Time-Off Management

View all leave requests

Approve / Reject with remarks

Leave types:

Paid Time Off

Sick Leave

Unpaid Leave

Real-time status updates

Salary Management (Admin Only)

Monthly / Yearly wage types

Automatic component calculation:

Basic

HRA

Allowances

Bonus

PF

Professional Tax

Live recalculation

Payroll visibility without manipulation risk

👨‍💻 Employee Features
Personal Dashboard

View personal profile

Attendance history

Leave status

Salary details (read-only)

Attendance

Check-In / Check-Out

Work hours & extra hours calculation

Visual status indicator

Leave Requests

Apply for leave

Upload supporting documents (for sick leave)

Track approval status in real time

🏢 Multi-Company Isolation (Security First)

THREAD enforces strict company-level data isolation:

Each record is linked to a companyId

Admins can access only their company’s data

Employees can access only their own records

Cross-company access is blocked at:

API level

Server logic

UI rendering

This ensures enterprise-grade data privacy.

🎨 UI / UX Design

Minimal, professional, and distraction-free

Brand-aligned color theme

Responsive across:

Desktop

Tablet

Mobile

Persistent company branding with logo support

Clear error messages & validations

🛠️ Tech Stack

Framework: Next.js (App Router)

Frontend: React, Server & Client Components

Backend: Secure API routes

Authentication: Session/JWT-based auth

Storage: Secure file uploads (logos & documents)

Architecture: Modular, scalable, and maintainable

🔒 Security Measures

Role-based authorization

Protected routes

Input validation & sanitization

Secure file upload handling

Unauthorized access prevention

Clear error handling (no silent failures)

📂 Project Structure (High Level)
/app
 ├── auth
 ├── dashboard
 ├── employees
 ├── attendance
 ├── time-off
 ├── profile
 └── api
/lib
/components
/middleware

🧪 Error Handling

Invalid credentials → User-friendly error

Unauthorized access → 403 response

Invalid file uploads → Clear warnings

No blank screens or silent crashes

🎯 Hackathon Focus

THREAD was built with:

Real usability

Production-grade logic

Judge-friendly clarity

Security-first mindset

No mock data. No shortcuts. No unsafe assumptions.

📌 Future Enhancements

Analytics dashboard

Salary slip generation

Notifications & alerts

Role expansion (Manager view)

Integration with external payroll systems

👥 Team

Built by passionate developers as part of the Odoo × GCET Hackathon, focused on solving real HR challenges with clean technology.
Harsh Purohit : https://github.com/Mythic-pixel630
Pradip Lalpura : https://github.com/PradipLalpura

📄 License

This project is created for educational and hackathon purposes.
