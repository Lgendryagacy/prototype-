import React, { useState } from 'react';
import { ClipboardList, AlertTriangle, Check, X } from 'lucide-react';

const reportedContent = [
    { id: 1, type: 'Forum Post', snippet: 'This is definitely spam, buy my thing...', reporter: 'user123', reason: 'Spam/Scam', date: '2024-08-28' },
    { id: 2, type: 'Gig Review', snippet: 'This freelancer is the worst ever!!!', reporter: 'client456', reason: 'Abusive Language', date: '2024-08-27' },
    { id: 3, type: 'Tutorial', snippet: 'How to get rich quick with FOGSLY...', reporter: 'admin_bot', reason: 'Misleading Content', date: '2024-08-26' },
];

const ContentManagementView = () => {
    const [activeTab, setActiveTab] = useState('reported');

    const tabs = [
        { id: 'reported', label: 'Reported Content', count: reportedContent.length },
        { id: 'tutorials', label: 'Tutorials', count: 0 },
        { id: 'posts', label: 'Community Posts', count: 0 },
        { id: 'forums', label: 'Forum Topics', count: 0 },
    ];
    
    return (
        <div className="space-y-6 text-white">
             {/* Header */}
            <h2 className="text-2xl font-bold">Content Management</h2>
            
            {/* Tabs */}
            <div className="border-b border-slate-700">
                <nav className="-mb-px flex space-x-6">
                {tabs.map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                            activeTab === tab.id
                            ? 'border-blue-500 text-blue-400'
                            : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                        }`}
                    >
                        {tab.label} {tab.count > 0 && <span className="ml-2 bg-slate-700 text-gray-300 text-xs font-semibold px-2 py-0.5 rounded-full">{tab.count}</span>}
                    </button>
                ))}
                </nav>
            </div>

            {/* Content */}
            {activeTab === 'reported' && (
                <div className="bg-slate-800 border border-slate-700 rounded-lg">
                    <div className="p-4 border-b border-slate-700">
                        <h3 className="text-lg font-semibold flex items-center gap-2"><AlertTriangle className="text-yellow-400"/> Moderation Queue</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-900/50 text-xs text-gray-400 uppercase">
                                <tr>
                                    <th className="px-6 py-3">Content Snippet</th>
                                    <th className="px-6 py-3">Type</th>
                                    <th className="px-6 py-3">Reason</th>
                                    <th className="px-6 py-3">Reporter</th>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportedContent.map(item => (
                                <tr key={item.id} className="border-b border-slate-700 hover:bg-slate-800/50">
                                    <td className="px-6 py-4 font-mono text-gray-300 max-w-xs truncate italic">"{item.snippet}"</td>
                                    <td className="px-6 py-4">{item.type}</td>
                                    <td className="px-6 py-4 text-red-400 font-medium">{item.reason}</td>
                                    <td className="px-6 py-4">{item.reporter}</td>
                                    <td className="px-6 py-4 text-gray-400">{item.date}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center gap-2">
                                            <button className="p-1.5 bg-green-500/20 text-green-400 rounded-md hover:bg-green-500/30" title="Approve/Ignore"><Check size={16} /></button>
                                            <button className="p-1.5 bg-red-500/20 text-red-400 rounded-md hover:bg-red-500/30" title="Remove Content"><X size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
             {activeTab !== 'reported' && (
                 <div className="text-center py-16 bg-slate-800 border border-slate-700 rounded-lg">
                    <h3 className="text-xl font-semibold text-white">Coming Soon</h3>
                    <p className="text-gray-400 mt-2">Management interface for {tabs.find(t=>t.id===activeTab)?.label} will be here.</p>
                </div>
            )}
        </div>
    );
};

export default ContentManagementView;
