import React from 'react';
import { Wrench } from 'lucide-react';

interface PlaceholderViewProps {
  title: string;
}

const PlaceholderView: React.FC<PlaceholderViewProps> = ({ title }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center bg-slate-800 border border-slate-700 rounded-lg p-8 min-h-[400px]">
      <Wrench size={48} className="text-gray-600 mb-4" />
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      <p className="text-gray-400 mt-2">This section is under construction.</p>
      <p className="text-gray-500 text-sm mt-1">Check back later for updates!</p>
    </div>
  );
};

export default PlaceholderView;