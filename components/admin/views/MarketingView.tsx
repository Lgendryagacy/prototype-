import React, { useState } from 'react';
import { Send, Plus, Users, Percent, Search } from 'lucide-react';

const campaigns = [
  { id: 1, name: 'Welcome Series', status: 'Active', sent: 1250, openRate: '45.2%', clickRate: '12.1%' },
  { id: 2, name: 'Summer Promo', status: 'Sent', sent: 1100, openRate: '25.8%', clickRate: '5.2%' },
  { id: 3, name: 'FOG Coin Launch', status: 'Draft', sent: 0, openRate: 'N/A', clickRate: 'N/A' },
];

const affiliates = [
    { id: 1, name: 'Tech Influencer', referrals: 152, conversion: '8.5%', commission: '$1,250.60' },
    { id: 2, name: 'Freelance Guru', referrals: 98, conversion: '12.1%', commission: '$980.20' },
    { id: 3, name: 'Design Blog', referrals: 45, conversion: '15.0%', commission: '$650.00' },
];

const MarketingView = () => {
    const [activeTab, setActiveTab] = useState('campaigns');

    return (
        <div className="space-y-6 text-white">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Marketing</h2>
                    <p className="text-gray-400 text-sm mt-1">Manage campaigns, affiliates, and SEO.</p>
                </div>
                 <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
                    <Plus size={16} />
                    Create New Campaign
                </button>
            </div>
            
            {/* Tabs */}
            <div className="border-b border-slate-700">
                <nav className="-mb-px flex space-x-6">
                    <button onClick={() => setActiveTab('campaigns')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'campaigns' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}>Email Campaigns</button>
                    <button onClick={() => setActiveTab('affiliates')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'affiliates' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}>Affiliate Program</button>
                    <button onClick={() => setActiveTab('seo')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'seo' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}>Shop SEO</button>
                </nav>
            </div>
            
            {activeTab === 'campaigns' && (
                <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-x-auto">
                    <table className="w-full text-sm text-left">
                         <thead className="bg-slate-900/50 text-xs text-gray-400 uppercase">
                            <tr>
                                <th className="px-6 py-3">Campaign Name</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Sent</th>
                                <th className="px-6 py-3">Open Rate</th>
                                <th className="px-6 py-3">Click Rate</th>
                            </tr>
                        </thead>
                        <tbody>
                            {campaigns.map(c => <tr key={c.id} className="border-b border-slate-700 hover:bg-slate-800/50">
                                <td className="px-6 py-4 font-semibold">{c.name}</td>
                                <td className="px-6 py-4">{c.status}</td>
                                <td className="px-6 py-4">{c.sent.toLocaleString()}</td>
                                <td className="px-6 py-4">{c.openRate}</td>
                                <td className="px-6 py-4">{c.clickRate}</td>
                            </tr>)}
                        </tbody>
                    </table>
                </div>
            )}
            {activeTab === 'affiliates' && (
                 <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-x-auto">
                    <table className="w-full text-sm text-left">
                         <thead className="bg-slate-900/50 text-xs text-gray-400 uppercase">
                            <tr>
                                <th className="px-6 py-3">Affiliate Name</th>
                                <th className="px-6 py-3">Referrals</th>
                                <th className="px-6 py-3">Conversion</th>
                                <th className="px-6 py-3">Commission Earned</th>
                            </tr>
                        </thead>
                        <tbody>
                            {affiliates.map(a => <tr key={a.id} className="border-b border-slate-700 hover:bg-slate-800/50">
                                <td className="px-6 py-4 font-semibold">{a.name}</td>
                                <td className="px-6 py-4">{a.referrals}</td>
                                <td className="px-6 py-4">{a.conversion}</td>
                                <td className="px-6 py-4 font-semibold text-green-400">{a.commission}</td>
                            </tr>)}
                        </tbody>
                    </table>
                </div>
            )}
            {activeTab === 'seo' && (
                 <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold">Global Shop SEO Settings</h3>
                    <p className="text-sm text-gray-400 mt-1 mb-6">Set default templates for user shops to improve their search engine visibility.</p>
                    <div className="space-y-4 max-w-xl">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Meta Title Template</label>
                            <input type="text" defaultValue="{shop_name} on FOGSLY - {tagline}" className="w-full bg-slate-900 border border-slate-600 rounded-md px-3 py-2 text-sm text-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Meta Description Template</label>
                            <textarea rows={3} defaultValue="Discover amazing products and services from {shop_name} on the FOGSLY platform. {shop_description}" className="w-full bg-slate-900 border border-slate-600 rounded-md px-3 py-2 text-sm text-white" />
                        </div>
                         <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-sm">Save SEO Settings</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MarketingView;
