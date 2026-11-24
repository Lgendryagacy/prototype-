import React from 'react';
import { Palette, Plus, Eye, Edit, CheckCircle } from 'lucide-react';

const themes = [
  {
    name: 'Fogsly Dark (Default)',
    status: 'Active',
    type: 'Dashboard',
    previewColor: 'bg-slate-800',
    users: 'All Users',
  },
  {
    name: 'Fogsly Light',
    status: 'Inactive',
    type: 'Dashboard',
    previewColor: 'bg-gray-100',
    users: '0 Users',
  },
  {
    name: 'Minimalist Store',
    status: 'Active',
    type: 'Store',
    previewColor: 'bg-white',
    users: '1,240 Shops',
  },
  {
    name: 'Ocean Breeze',
    status: 'Inactive',
    type: 'Store',
    previewColor: 'bg-cyan-100',
    users: '0 Shops',
  },
   {
    name: 'Desert Hues',
    status: 'Inactive',
    type: 'Dashboard',
    previewColor: 'bg-orange-100',
    users: '0 Users',
  },
   {
    name: 'Tech Noir',
    status: 'Inactive',
    type: 'Store',
    previewColor: 'bg-purple-900',
    users: '0 Shops',
  },
];

const ThemeCard = ({ theme }: { theme: typeof themes[0] }) => {
  const isActive = theme.status === 'Active';
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden transition-all hover:border-blue-500/50 hover:shadow-xl">
      <div className={`h-32 flex items-center justify-center ${theme.previewColor}`}>
        <Palette size={48} className={theme.name.includes('Light') || theme.name.includes('Store') ? 'text-slate-500' : 'text-slate-400'}/>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-white">{theme.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            isActive ? 'bg-green-900/50 text-green-400' : 'bg-gray-700 text-gray-400'
          }`}>{theme.status}</span>
          <span className="text-xs bg-slate-700 text-gray-300 px-2 py-0.5 rounded-full">{theme.type}</span>
        </div>
        <p className="text-xs text-gray-400 mt-2">{theme.users}</p>
      </div>
      <div className="p-4 border-t border-slate-700 flex gap-2">
        <button disabled={isActive} className="flex-1 text-sm bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 disabled:bg-slate-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
          <CheckCircle size={14}/> Activate
        </button>
        <button className="text-sm bg-slate-700 text-gray-300 px-3 py-1.5 rounded-md hover:bg-slate-600 transition-colors flex items-center justify-center gap-2">
          <Edit size={14}/> Edit
        </button>
        <button className="text-sm bg-slate-700 text-gray-300 px-3 py-1.5 rounded-md hover:bg-slate-600 transition-colors flex items-center justify-center gap-2">
          <Eye size={14}/> Preview
        </button>
      </div>
    </div>
  );
};

const ThemeManagementView = () => {
  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Theme Management</h2>
          <p className="text-gray-400 text-sm mt-1">Customize user dashboards and store themes.</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
          <Plus size={16} />
          Add New Theme
        </button>
      </div>

      {/* Theme List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {themes.map((theme, index) => <ThemeCard key={index} theme={theme} />)}
      </div>
    </div>
  );
};

export default ThemeManagementView;
