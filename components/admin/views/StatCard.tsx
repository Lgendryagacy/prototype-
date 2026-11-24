import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  change?: number;
  changeType?: 'positive' | 'negative';
  description: string;
  changeDescription?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, change, changeType, description, changeDescription }) => {
  const isPositive = changeType ? changeType === 'positive' : change === undefined || change >= 0;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 flex flex-col justify-between min-h-[160px]">
      <div>
        <div className="flex justify-between items-start">
            <p className="text-sm font-semibold text-gray-400">{title}</p>
            <div className="text-gray-500">{icon}</div>
        </div>
        <p className="text-3xl font-bold text-white mt-2">{value}</p>
        <p className="text-xs text-gray-400 mt-1">{description}</p>
      </div>
      <div className="flex items-center text-xs mt-3">
        {change !== undefined && (
          <span className={`flex items-center mr-2 font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? <TrendingUp size={14} className="mr-1"/> : <TrendingDown size={14} className="mr-1"/>}
            {Math.abs(change)}%
          </span>
        )}
        {changeDescription && (
            <span className={`text-sm font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>{changeDescription}</span>
        )}
      </div>
    </div>
  );
};