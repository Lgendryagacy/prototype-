import React from 'react';
import { X, Wallet, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { UserEarnings } from '../../../firebase/types/earnings';

interface ViewEarningsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserEarnings & { name: string; email: string };
}

const ViewEarningsModal: React.FC<ViewEarningsModalProps> = ({ isOpen, onClose, user }) => {
  if (!isOpen) return null;

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} FOG`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const earningsSources = [
    { label: 'Ads Earnings', current: user.adsEarnings, total: user.totalAdsEarnings, color: 'blue' },
    { label: 'Freelance Jobs', current: user.freelanceJobsEarnings, total: user.totalFreelanceJobsEarnings, color: 'green' },
    { label: 'Fogsly Services', current: user.fogslyServicesEarnings, total: user.totalFogslyServicesEarnings, color: 'purple' },
    { label: 'Referrals', current: user.referralEarnings, total: user.totalReferralEarnings, color: 'yellow' },
    { label: 'Tasks', current: user.taskEarnings, total: user.totalTaskEarnings, color: 'pink' },
    { label: 'Bonuses', current: user.bonusEarnings, total: user.totalBonusEarnings, color: 'orange' },
    { label: 'Deposits', current: user.depositEarnings, total: user.totalDepositEarnings, color: 'indigo' },
    { label: 'Physical Products', current: user.fogslyPhysicalEarnings, total: user.totalFogslyPhysicalEarnings, color: 'cyan' }
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      blue: { bg: 'bg-blue-900/20', text: 'text-blue-400', border: 'border-blue-500/30' },
      green: { bg: 'bg-green-900/20', text: 'text-green-400', border: 'border-green-500/30' },
      purple: { bg: 'bg-purple-900/20', text: 'text-purple-400', border: 'border-purple-500/30' },
      yellow: { bg: 'bg-yellow-900/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
      pink: { bg: 'bg-pink-900/20', text: 'text-pink-400', border: 'border-pink-500/30' },
      orange: { bg: 'bg-orange-900/20', text: 'text-orange-400', border: 'border-orange-500/30' },
      indigo: { bg: 'bg-indigo-900/20', text: 'text-indigo-400', border: 'border-indigo-500/30' },
      cyan: { bg: 'bg-cyan-900/20', text: 'text-cyan-400', border: 'border-cyan-500/30' }
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Wallet className="w-6 h-6 text-blue-400" />
              Earnings Details
            </h2>
            <p className="text-gray-400 mt-1">{user.name} ({user.email})</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <Wallet className="w-4 h-4" />
                Available Balance
              </div>
              <div className="text-2xl font-bold text-white">{formatCurrency(user.availableBalance)}</div>
            </div>
            
            <div className="bg-slate-900/50 border border-green-700/30 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <TrendingUp className="w-4 h-4" />
                Lifetime Earnings
              </div>
              <div className="text-2xl font-bold text-green-400">{formatCurrency(user.lifetimeEarnings)}</div>
            </div>
            
            <div className="bg-slate-900/50 border border-red-700/30 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <TrendingDown className="w-4 h-4" />
                Total Withdrawn
              </div>
              <div className="text-2xl font-bold text-red-400">{formatCurrency(user.totalWithdrawn)}</div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-gray-400 text-sm mb-1">Total Spent</div>
                <div className="text-lg font-semibold text-yellow-400">{formatCurrency(user.totalSpent)}</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm mb-1">Net Earnings</div>
                <div className="text-lg font-semibold text-blue-400">
                  {formatCurrency(user.lifetimeEarnings - user.totalWithdrawn - user.totalSpent)}
                </div>
              </div>
            </div>
          </div>

          {/* Earnings by Source */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Earnings by Source
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {earningsSources.map((source) => {
                const colors = getColorClasses(source.color);
                return (
                  <div
                    key={source.label}
                    className={`${colors.bg} border ${colors.border} rounded-lg p-4`}
                  >
                    <div className="text-gray-300 text-sm font-medium mb-3">{source.label}</div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">Current Balance:</span>
                        <span className={`text-sm font-semibold ${colors.text}`}>
                          {formatCurrency(source.current)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">Lifetime Total:</span>
                        <span className="text-sm font-semibold text-gray-300">
                          {formatCurrency(source.total)}
                        </span>
                      </div>
                      {source.total > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-700">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-400">Remaining %:</span>
                            <span className="text-xs font-medium text-gray-300">
                              {((source.current / source.total) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="mt-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${colors.bg.replace('/20', '/60')}`}
                              style={{ width: `${(source.current / source.total) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Account Created: </span>
                <span className="text-white">{formatDate(user.createdAt)}</span>
              </div>
              <div>
                <span className="text-gray-400">Last Updated: </span>
                <span className="text-white">{formatDate(user.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-800 border-t border-slate-700 p-4">
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewEarningsModal;
