import React from 'react';
import { RefreshCw, Users, Palette, LogIn, Megaphone, CircleDollarSign, Wallet, HandCoins, ShieldCheck, UserPlus, BookUser, Wrench } from 'lucide-react';
import { StatCard } from './StatCard';

const recentActivities = [
    { type: 'payment', description: 'New payment request submitted', user: 'user@example.com', time: '2 minutes ago', icon: Wallet},
    { type: 'theme', description: 'Theme "Ocean Blue" activated', user: 'Admin', time: '15 minutes ago', icon: Palette},
    { type: 'user', description: 'New user "John Doe" registered', user: 'system', time: '1 hour ago', icon: UserPlus},
];

const DashboardView = () => {
  return (
    <div className="space-y-6 text-white">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Welcome back, Fogsly Admin!</h2>
          <p className="text-blue-200">Here's what's happening with FOGSLY today.</p>
        </div>
        <div className="flex items-center gap-4">
            <span className="text-xs text-blue-200 hidden md:inline">Last updated: 10:07:45 PM</span>
            <button className="bg-white/20 hover:bg-white/30 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors">
                <RefreshCw size={14} />
                Refresh Data
            </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value="1,250" description="Registered users" icon={<Users size={20} />} change={3.5} />
        <StatCard title="Active Themes" value="5/8" description="Theme configurations" icon={<Palette size={20} />} changeDescription="+2" />
        <StatCard title="Today's Logins" value="89" description="Active sessions" icon={<LogIn size={20} />} change={8.7} />
        <StatCard title="Active Ads" value="18/24" description="Advertisement campaigns" icon={<Megaphone size={20} />} changeDescription="+3" />
        <StatCard title="Total Revenue" value="$15,670" description="This month" icon={<CircleDollarSign size={20} />} change={24.4} />
        <StatCard title="Pending Payments" value="12" description="Awaiting approval" icon={<Wallet size={20} />} change={-5} changeType='negative'/>
        <StatCard title="FOG Coins Distributed" value="45,230" description="Total circulation" icon={<HandCoins size={20} />} change={10.7} />
        <StatCard title="System Health" value="98.7%" description="Overall performance" icon={<ShieldCheck size={20} />} change={0.1} />
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
            <p className="text-sm text-gray-400 mb-4">Latest system activities and changes</p>
            <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center">
                           <activity.icon size={16} className="text-blue-400" />
                        </div>
                        <div>
                            <p className="font-medium text-sm text-white">{activity.description}</p>
                            <p className="text-xs text-gray-400">{activity.time} by {activity.user}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <p className="text-sm text-gray-400 mb-4">Common administrative tasks</p>
            <div className="space-y-3">
                <button className="w-full text-left bg-pink-500/80 hover:bg-pink-500 p-4 rounded-lg flex items-center gap-4 transition-colors">
                    <Palette size={20}/>
                    <div>
                        <p className="font-semibold">Create New Theme</p>
                        <p className="text-xs text-pink-100">Design a custom theme</p>
                    </div>
                </button>
                 <button className="w-full text-left bg-cyan-500/80 hover:bg-cyan-500 p-4 rounded-lg flex items-center gap-4 transition-colors">
                    <BookUser size={20}/>
                    <div>
                        <p className="font-semibold">View Users</p>
                        <p className="text-xs text-cyan-100">Manage user accounts</p>
                    </div>
                </button>
                 <button className="w-full text-left bg-green-500/80 hover:bg-green-500 p-4 rounded-lg flex items-center gap-4 transition-colors">
                    <Wrench size={20}/>
                    <div>
                        <p className="font-semibold">System Settings</p>
                        <p className="text-xs text-green-100">Configure system settings</p>
                    </div>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;