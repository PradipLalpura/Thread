
import React from 'react';

export const COLORS = {
  background: '#F9F7F2',
  border: '#3B3C36',
  primary: '#3B3C36',
  text: '#2C2C2C',
  orange: '#FF7043',
  green: '#8BC34A',
  yellow: '#FFEB3B',
};

export const Logo: React.FC<{ size?: number; showText?: boolean }> = ({ size = 40, showText = true }) => (
  <div className="flex items-center gap-3">
    <div style={{ width: size, height: size }} className="relative flex items-center justify-center rounded-full border border-gray-400 overflow-hidden bg-white">
      <svg viewBox="0 0 100 100" className="w-full h-full p-1">
        <path d="M50 20 C20 20, 20 50, 50 50 C80 50, 80 80, 50 80" fill="none" stroke={COLORS.orange} strokeWidth="12" strokeLinecap="round" />
        <path d="M50 20 C80 20, 80 50, 50 50 C20 50, 20 80, 50 80" fill="none" stroke={COLORS.green} strokeWidth="12" strokeLinecap="round" opacity="0.8" />
        <circle cx="50" cy="50" r="6" fill={COLORS.yellow} />
      </svg>
    </div>
    {showText && <span className="text-xl font-bold tracking-tight text-[#2C2C2C]">THREAD</span>}
  </div>
);

export const StatusDot: React.FC<{ status: 'PRESENT' | 'LEAVE' | 'ABSENT' }> = ({ status }) => {
  const colors = {
    PRESENT: 'bg-green-500',
    LEAVE: 'bg-yellow-500',
    ABSENT: 'bg-red-500',
  };
  return <div className={`w-3 h-3 rounded-full ${colors[status]}`} />;
};
