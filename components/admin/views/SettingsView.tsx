import React, { useState } from 'react';
import { Settings2, Shield, Globe, Landmark, KeyRound, Database } from 'lucide-react';
import ToggleSwitch from './ui/ToggleSwitch';
import { runAllMigrations } from '../../../firebase/migrations/migrateEarningsStructure';
import { toast } from 'react-toastify';

type SettingsSection = 'general' | 'security' | 'localization' | 'tax' | 'api' | 'migrations';

const sections = [
  { id: 'general', label: 'General', icon: Settings2 },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'localization', label: 'Localization', icon: Globe },
  { id: 'tax', label: 'Tax & VAT', icon: Landmark },
  { id: 'api', label: 'API Keys', icon: KeyRound },
  { id: 'migrations', label: 'Database Migrations', icon: Database },
];

const GeneralSettings = () => (
    <div>
        <h3 className="text-xl font-bold">General Settings</h3>
        <p className="text-gray-400 mt-1">Manage basic platform information.</p>
        <div className="mt-6 space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Platform Name</label>
                <input type="text" defaultValue="FOGSLY" className="w-full max-w-sm bg-slate-900 border border-slate-600 rounded-md px-3 py-2 text-sm text-white" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Platform Logo</label>
                <input type="file" className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"/>
            </div>
        </div>
    </div>
);

const SecuritySettings = () => {
    const [tfaEnabled, setTfaEnabled] = useState(true);
    return (
        <div>
            <h3 className="text-xl font-bold">Security Settings</h3>
            <p className="text-gray-400 mt-1">Configure security policies for admins and users.</p>
            <div className="mt-6 space-y-4 divide-y divide-slate-700">
                <div className="flex justify-between items-center pt-4 first:pt-0">
                    <div>
                        <h4 className="font-medium">Two-Factor Authentication (Admins)</h4>
                        <p className="text-sm text-gray-400">Require 2FA for all administrator accounts.</p>
                    </div>
                    <ToggleSwitch enabled={tfaEnabled} setEnabled={setTfaEnabled} />
                </div>
                <div className="pt-4">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Password Policy</label>
                    <select className="w-full max-w-xs bg-slate-900 border border-slate-600 rounded-md px-3 py-2 text-sm text-white">
                        <option>Medium (8 chars, 1 number)</option>
                        <option>Strong (12 chars, 1 number, 1 symbol)</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

const MigrationsSettings = () => {
    const [isMigrating, setIsMigrating] = useState(false);
    const [migrationResults, setMigrationResults] = useState<any>(null);

    const handleRunMigration = async () => {
        if (!confirm('⚠️ Are you sure you want to run the earnings migration?\n\nThis will:\n1. Update all user earnings to new structure\n2. Initialize daily activities\n3. Sync wallet balances\n\nThis is safe to run multiple times.')) {
            return;
        }

        setIsMigrating(true);
        setMigrationResults(null);
        
        const toastId = toast.info('🔄 Starting migration...', { autoClose: false });

        try {
            console.log('🚀 Starting earnings migration from admin panel...');
            await runAllMigrations();
            
            toast.dismiss(toastId);
            toast.success('✅ Migration completed successfully! Check console for details.');
            
            setMigrationResults({
                status: 'success',
                message: 'Migration completed successfully. Check browser console for detailed results.'
            });
        } catch (error) {
            console.error('❌ Migration failed:', error);
            toast.dismiss(toastId);
            toast.error('❌ Migration failed. Check console for details.');
            
            setMigrationResults({
                status: 'error',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        } finally {
            setIsMigrating(false);
        }
    };

    return (
        <div>
            <h3 className="text-xl font-bold">Database Migrations</h3>
            <p className="text-gray-400 mt-1">Run database migrations to update user data structures.</p>
            
            <div className="mt-6 space-y-6">
                {/* Earnings Structure Migration */}
                <div className="bg-slate-900 border border-slate-700 rounded-lg p-5">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h4 className="font-semibold text-lg flex items-center gap-2">
                                <Database size={20} className="text-blue-400" />
                                Earnings Structure Migration
                            </h4>
                            <p className="text-sm text-gray-400 mt-2">
                                Updates all user earnings documents to the new structure with 8 earning sources:
                            </p>
                            <ul className="text-sm text-gray-400 mt-2 ml-5 space-y-1 list-disc">
                                <li>Ads, Referrals, Tasks, Bonuses</li>
                                <li>Deposits, Freelance Jobs, Fogsly Services, Physical Products</li>
                                <li>Adds lifetime totals for all earning types</li>
                                <li>Initializes daily activity tracking</li>
                                <li>Syncs wallet balances</li>
                            </ul>
                            
                            <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded text-sm text-yellow-200">
                                <strong>⚠️ Important:</strong> This migration is safe to run multiple times. It will only update documents that need changes.
                            </div>

                            {migrationResults && (
                                <div className={`mt-4 p-3 border rounded text-sm ${
                                    migrationResults.status === 'success' 
                                        ? 'bg-green-900/20 border-green-600/30 text-green-200'
                                        : 'bg-red-900/20 border-red-600/30 text-red-200'
                                }`}>
                                    <strong>{migrationResults.status === 'success' ? '✅ Success:' : '❌ Error:'}</strong> {migrationResults.message}
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="mt-5 pt-5 border-t border-slate-700">
                        <button
                            onClick={handleRunMigration}
                            disabled={isMigrating}
                            className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                                isMigrating
                                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30'
                            }`}
                        >
                            {isMigrating ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Running Migration...
                                </span>
                            ) : (
                                '🚀 Run Earnings Migration'
                            )}
                        </button>
                        
                        <p className="text-xs text-gray-500 mt-3">
                            💡 Tip: Open browser console (F12) to see detailed migration progress and results.
                        </p>
                    </div>
                </div>

                {/* Future migrations can be added here */}
                <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-5 opacity-60">
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                        <Database size={20} className="text-gray-400" />
                        Future Migrations
                    </h4>
                    <p className="text-sm text-gray-400 mt-2">
                        Additional migration tools will appear here as they become available.
                    </p>
                </div>
            </div>
        </div>
    );
};

// ... other section components would be similar

const SettingsView = () => {
    const [activeSection, setActiveSection] = useState<SettingsSection>('general');

    const renderSection = () => {
        switch(activeSection) {
            case 'general': return <GeneralSettings />;
            case 'security': return <SecuritySettings />;
            case 'migrations': return <MigrationsSettings />;
            default: return <div><h3 className="text-xl font-bold">{sections.find(s=>s.id===activeSection)?.label}</h3><p className="text-gray-400 mt-1">Settings for this section are under construction.</p></div>;
        }
    }

    return (
        <div className="text-white">
            <h2 className="text-2xl font-bold mb-6">Settings</h2>
            <div className="flex flex-col md:flex-row gap-8">
                <aside className="md:w-1/4 lg:w-1/5">
                    <nav className="space-y-1">
                        {sections.map(section => (
                            <button key={section.id} onClick={() => setActiveSection(section.id as SettingsSection)}
                                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                    activeSection === section.id ? 'bg-slate-800 text-white' : 'text-gray-400 hover:bg-slate-800/50'
                                }`}>
                                <section.icon size={18} />
                                {section.label}
                            </button>
                        ))}
                    </nav>
                </aside>
                <main className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-6">
                    {renderSection()}
                </main>
            </div>
        </div>
    );
};

export default SettingsView;
