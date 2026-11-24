import React from 'react';

interface AdminStatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  valueColor?: string;
}

export const AdminStatCard: React.FC<AdminStatCardProps> = ({ title, value, icon, valueColor = 'text-white' }) => {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-400">{title}</p>
        <p className={`text-3xl font-bold mt-1 ${valueColor}`}>{value}</p>
      </div>
      <div className="text-gray-500">{icon}</div>
    </div>
  );
};