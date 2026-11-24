import React, { useState, useMemo, useEffect } from 'react';
import { TrendingUp, CreditCard, Shield, SlidersHorizontal, Settings, History, Save, RefreshCw, X, DollarSign } from 'lucide-react';
import { AdminStatCard } from './AdminStatCard';
import ToggleSwitch from './ui/ToggleSwitch';
import { AdminInput } from './ui/AdminInput';
import { AdminTextarea } from './ui/AdminTextarea';
import { useAuth } from '../../../firebase/hooks/useAuth';
import { 
  FogCoinSettings, 
  FogCoinSettingsFormData, 
  FogCoinSettingsHistory,
  FOG_COIN_VALIDATION 
} from '../../../firebase/types/fogCoinSettings';
import { 
  getFogCoinSettings, 
  updateFogCoinSettings, 
  getFogCoinSettingsHistory,
  validateFogCoinSettings 
} from '../../../firebase/services/fogCoinSettingsService';
import { clearFogCoinSettingsCache } from '../../../utils/fogCoinUtils';
import { toast } from 'react-hot-toast';

const FogCoinManagementView = () => {
    const { user } = useAuth();
    const [currentSettings, setCurrentSettings] = useState<FogCoinSettings | null>(null);
    const [history, setHistory] = useState<FogCoinSettingsHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Refs for smooth scrolling
    const historyRef = React.useRef<HTMLDivElement>(null);

    const [fogRate, setFogRate] = useState('0.1');
    const [usdToPkrRate, setUsdToPkrRate] = useState('284.67');
    const [dailyLimit, setDailyLimit] = useState('100');
    const [minWithdrawal, setMinWithdrawal] = useState('50');
    const [withdrawalsEnabled, setWithdrawalsEnabled] = useState(false);
    const [notes, setNotes] = useState('');
    const [reason, setReason] = useState('');

    // Load data from Firebase
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [settings, settingsHistory] = await Promise.all([
                getFogCoinSettings(),
                getFogCoinSettingsHistory(10)
            ]);
            
            setCurrentSettings(settings);
            setHistory(settingsHistory);
            
            // Update form with current settings
            setFogRate(settings.fogToUsdRate.toString());
            setUsdToPkrRate(settings.usdToPkrRate.toString());
            setDailyLimit(settings.maximumDailyEarnings.toString());
            setMinWithdrawal(settings.minimumWithdrawAmount.toString());
            setWithdrawalsEnabled(settings.isWithdrawalsEnabled);
            setNotes(settings.notes || '');
        } catch (error) {
            console.error('Error loading FOG coin settings:', error);
            toast.error('Failed to load FOG coin settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!user) {
            toast.error('Authentication required');
            return;
        }

        // Validate change reason
        if (!reason.trim()) {
            toast.error('Please provide a reason for this change');
            return;
        }

        // Prepare form data
        const formData: FogCoinSettingsFormData = {
            fogToUsdRate: parseFloat(fogRate) || 0,
            usdToPkrRate: parseFloat(usdToPkrRate) || 0,
            minimumWithdrawAmount: parseFloat(minWithdrawal) || 0,
            maximumDailyEarnings: parseFloat(dailyLimit) || 0,
            isWithdrawalsEnabled: withdrawalsEnabled,
            notes: notes.trim()
        };

        // Validate form data
        const validationErrors = validateFogCoinSettings(formData);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            toast.error('Please fix the validation errors');
            return;
        }

        try {
            setSaving(true);
            await updateFogCoinSettings(formData, user.uid, reason);
            
            // Clear cache and reload data
            clearFogCoinSettingsCache();
            await loadData();
            
            // Reset form
            setReason('');
            setErrors({});
            
            toast.success('FOG coin settings updated successfully!');
        } catch (error) {
            console.error('Error updating FOG coin settings:', error);
            toast.error(`Failed to update FOG coin settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setSaving(false);
        }
    };

    const handleToggleHistory = () => {
        if (!showHistory) {
            setShowHistory(true);
            // Scroll to history section after a brief delay to allow rendering
            setTimeout(() => {
                historyRef.current?.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start',
                    inline: 'nearest'
                });
            }, 100);
        } else {
            setShowHistory(false);
            // Scroll back to top of form when hiding
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const isFormReadyToSave = useMemo(() => {
        return reason.trim().length > 0 && !loading;
    }, [reason, loading]);

    const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

    if (loading) {
        return (
            <div className="space-y-6 text-white">
                <h2 className="text-2xl font-bold">FOG Coin Management</h2>
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-3 text-gray-400">Loading FOG coin settings...</span>
                </div>
            </div>
        );
    }

    if (!currentSettings) {
        return (
            <div className="space-y-6 text-white">
                <h2 className="text-2xl font-bold">FOG Coin Management</h2>
                <div className="text-center py-12">
                    <p className="text-gray-400">Failed to load FOG coin settings</p>
                    <button 
                        onClick={loadData}
                        className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="space-y-8 text-white">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center border border-slate-700">
                             <TrendingUp className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">FOG Coin Management</h2>
                            <p className="text-gray-400 text-sm mt-1">Manage FOG coin conversion rates and withdrawal settings</p>
                            {currentSettings && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Last updated: {new Date(currentSettings.lastUpdatedAt).toLocaleString()}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={loadData}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white font-semibold px-3 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button 
                        onClick={handleToggleHistory}
                        className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                        <History size={16} />
                        {showHistory ? 'Hide History' : 'View History'}
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <AdminStatCard 
                    title="Current Rate" 
                    value={formatCurrency(currentSettings.fogToUsdRate)} 
                    icon={<TrendingUp size={24} />} 
                    valueColor="text-green-400" 
                />
                <AdminStatCard 
                    title="USD to PKR" 
                    value={`${currentSettings.usdToPkrRate.toFixed(2)}`} 
                    icon={<DollarSign size={24} />} 
                    valueColor="text-blue-400" 
                />
                <AdminStatCard 
                    title="Min. Withdrawal" 
                    value={`${currentSettings.minimumWithdrawAmount} FOG`} 
                    icon={<CreditCard size={24} />} 
                />
                {/* <AdminStatCard 
                    title="Daily Limit" 
                    value={`${currentSettings.maximumDailyEarnings} FOG`} 
                    icon={<SlidersHorizontal size={24} />} 
                /> */}
                <AdminStatCard 
                    title="Withdrawals" 
                    value={currentSettings.isWithdrawalsEnabled ? "Enabled" : "Disabled"} 
                    icon={<Shield size={24} />} 
                    valueColor={currentSettings.isWithdrawalsEnabled ? "text-green-400" : "text-red-400"} 
                />
            </div>

            {/* Settings Form */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                    <Settings size={20} className="text-gray-400"/>
                    <h3 className="text-xl font-semibold">Update FOG Coin Settings</h3>
                </div>
                <p className="text-sm text-gray-400 mb-8">Changes will take effect immediately. All values will be logged for audit purposes.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="fog-rate" className="block text-sm font-medium text-gray-300 mb-1">FOG to USD Rate</label>
                            <AdminInput 
                                id="fog-rate" 
                                type="number" 
                                value={fogRate} 
                                onChange={(e) => {
                                    setFogRate(e.target.value);
                                    if (errors.fogToUsdRate) {
                                        setErrors(prev => ({ ...prev, fogToUsdRate: '' }));
                                    }
                                }} 
                                step="0.01"
                                min="0"
                                max="1"
                            />
                            {errors.fogToUsdRate && (
                                <p className="text-xs text-red-400 mt-1">{errors.fogToUsdRate}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">Current: 1 FOG = {formatCurrency(parseFloat(fogRate) || 0)}</p>
                        </div>
                        <div>
                            <label htmlFor="usd-to-pkr-rate" className="block text-sm font-medium text-gray-300 mb-1">USD to PKR Rate</label>
                            <AdminInput 
                                id="usd-to-pkr-rate" 
                                type="number" 
                                value={usdToPkrRate} 
                                onChange={(e) => {
                                    setUsdToPkrRate(e.target.value);
                                    if (errors.usdToPkrRate) {
                                        setErrors(prev => ({ ...prev, usdToPkrRate: '' }));
                                    }
                                }} 
                                step="0.01"
                                min="100"
                                max="500"
                            />
                            {errors.usdToPkrRate && (
                                <p className="text-xs text-red-400 mt-1">{errors.usdToPkrRate}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">Current: $1 = PKR {parseFloat(usdToPkrRate) || 0} | 1 FOG = PKR {((parseFloat(fogRate) || 0) * (parseFloat(usdToPkrRate) || 0)).toFixed(2)}</p>
                        </div>
                         <div>
                            <label htmlFor="daily-limit" className="block text-sm font-medium text-gray-300 mb-1">Daily Earnings Limit (FOG)</label>
                            <AdminInput 
                                id="daily-limit" 
                                type="number" 
                                value={dailyLimit} 
                                onChange={(e) => {
                                    setDailyLimit(e.target.value);
                                    if (errors.maximumDailyEarnings) {
                                        setErrors(prev => ({ ...prev, maximumDailyEarnings: '' }));
                                    }
                                }}
                                min="0"
                            />
                            {errors.maximumDailyEarnings && (
                                <p className="text-xs text-red-400 mt-1">{errors.maximumDailyEarnings}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">Equivalent: ≈ {formatCurrency((parseFloat(dailyLimit) || 0) * (parseFloat(fogRate) || 0))}</p>
                        </div>
                        <div>
                             <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-1">Notes (Optional)</label>
                             <AdminTextarea id="notes" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
                        </div>
                    </div>
                    {/* Right Column */}
                     <div className="space-y-6">
                         <div>
                            <label htmlFor="min-withdrawal" className="block text-sm font-medium text-gray-300 mb-1">Minimum Withdrawal (FOG)</label>
                            <AdminInput 
                                id="min-withdrawal" 
                                type="number" 
                                value={minWithdrawal} 
                                onChange={(e) => {
                                    setMinWithdrawal(e.target.value);
                                    if (errors.minimumWithdrawAmount) {
                                        setErrors(prev => ({ ...prev, minimumWithdrawAmount: '' }));
                                    }
                                }}
                                min="0"
                            />
                            {errors.minimumWithdrawAmount && (
                                <p className="text-xs text-red-400 mt-1">{errors.minimumWithdrawAmount}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">Equivalent: ≈ {formatCurrency((parseFloat(minWithdrawal) || 0) * (parseFloat(fogRate) || 0))}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Withdrawal Status</label>
                            <ToggleSwitch enabled={withdrawalsEnabled} setEnabled={setWithdrawalsEnabled} />
                             <p className="text-xs text-gray-400 mt-2">Withdrawals are temporarily {withdrawalsEnabled ? 'enabled' : 'disabled'}.</p>
                        </div>
                     </div>
                </div>
                {/* Reason and Summary */}
                 <div className="mt-8 border-t border-slate-700 pt-6">
                     <label htmlFor="reason" className="block text-sm font-medium text-gray-300 mb-1">Reason for Change*</label>
                     <AdminTextarea id="reason" placeholder="e.g., Market adjustment, policy update, etc." rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
                     <p className="text-xs text-gray-400 mt-1">This reason will be logged for audit purposes.</p>
                 </div>

                 <div className="mt-6 bg-slate-900/50 border border-slate-700 rounded-lg p-4 text-sm">
                    <h4 className="font-semibold mb-2">Current Form Values:</h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                        <p className="text-gray-400">FOG Rate: <span className="font-mono text-white">{parseFloat(fogRate) || 0}</span></p>
                        <p className="text-gray-400">USD to PKR: <span className="font-mono text-white">{parseFloat(usdToPkrRate) || 0}</span></p>
                        <p className="text-gray-400">FOG to PKR: <span className="font-mono text-green-400">{((parseFloat(fogRate) || 0) * (parseFloat(usdToPkrRate) || 0)).toFixed(2)}</span></p>
                        <p className="text-gray-400">Min Withdrawal: <span className="font-mono text-white">{parseFloat(minWithdrawal) || 0}</span></p>
                        <p className="text-gray-400">Daily Limit: <span className="font-mono text-white">{parseFloat(dailyLimit) || 0}</span></p>
                        <p className="text-gray-400">Withdrawals: <span className={`font-mono font-semibold ${withdrawalsEnabled ? 'text-green-400' : 'text-red-400'}`}>{withdrawalsEnabled ? 'Enabled' : 'Disabled'}</span></p>
                         <p className="text-gray-400 col-span-2">Change Reason: <span className={`font-mono ${reason.trim() ? 'text-white' : 'text-yellow-400'}`}>{reason.trim() || 'Not provided'}</span></p>
                         <p className="text-gray-400 col-span-2">Ready to Save: <span className={`font-mono font-semibold ${isFormReadyToSave ? 'text-green-400' : 'text-red-400'}`}>{isFormReadyToSave ? 'Yes' : 'No'}</span></p>
                    </div>
                 </div>
            </div>

            {/* History Section */}
            {showHistory && (
                <div 
                    ref={historyRef} 
                    className="bg-slate-800 border-2 border-blue-500/30 rounded-lg p-6 transition-all duration-300 ease-out shadow-lg shadow-blue-500/10"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <History size={20} className="text-gray-400"/>
                            <h3 className="text-xl font-semibold">Settings History</h3>
                        </div>
                        <button 
                            onClick={() => setShowHistory(false)}
                            className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white font-semibold px-3 py-2 rounded-lg text-sm transition-colors"
                        >
                            <X size={16} />
                            Hide History
                        </button>
                    </div>
                    
                    {history.length === 0 ? (
                        <p className="text-gray-400 text-center py-8">No history available</p>
                    ) : (
                        <div className="space-y-4">
                            {history.map((entry) => (
                                <div key={entry.id} className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <p className="text-sm text-gray-300">
                                                Changed by: <span className="text-white font-medium">{entry.changedBy}</span>
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {new Date(entry.changedAt).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            ID: {entry.id.slice(0, 8)}...
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-3">
                                        <div>
                                            <p className="text-xs text-gray-400">FOG Rate</p>
                                            <p className="text-sm text-white font-mono">{formatCurrency(entry.settings.fogToUsdRate)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">USD to PKR</p>
                                            <p className="text-sm text-white font-mono">PKR {entry.settings.usdToPkrRate?.toFixed(2) || '0.00'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">Min Withdrawal</p>
                                            <p className="text-sm text-white font-mono">{entry.settings.minimumWithdrawAmount} FOG</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">Daily Limit</p>
                                            <p className="text-sm text-white font-mono">{entry.settings.maximumDailyEarnings} FOG</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">Withdrawals</p>
                                            <p className={`text-sm font-medium ${entry.settings.isWithdrawalsEnabled ? 'text-green-400' : 'text-red-400'}`}>
                                                {entry.settings.isWithdrawalsEnabled ? 'Enabled' : 'Disabled'}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="border-t border-slate-700 pt-3">
                                        <p className="text-xs text-gray-400 mb-1">Change Reason:</p>
                                        <p className="text-sm text-gray-300">{entry.changeReason}</p>
                                        {entry.settings.notes && (
                                            <>
                                                <p className="text-xs text-gray-400 mb-1 mt-2">Notes:</p>
                                                <p className="text-sm text-gray-300">{entry.settings.notes}</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

             {/* Footer Action */}
            <div className="flex justify-end">
                <button 
                    onClick={handleSave}
                    disabled={!isFormReadyToSave || saving}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors disabled:bg-slate-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                    <Save size={16} />
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
};

export default FogCoinManagementView;
