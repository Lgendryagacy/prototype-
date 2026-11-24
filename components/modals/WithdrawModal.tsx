import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Wallet,
  DollarSign,
  Clock,
  AlertCircle,
  CreditCard,
  Settings,
  ArrowLeft,
  CheckCircle,
  ExternalLink,
  EyeOff,
  Eye,
  Trash2
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { formatFog, formatUsd, getFogCoinSettingsWithCache } from '../../utils/fogCoinUtils';
import {
  createWithdrawalRequest,
  getUserWithdrawalRequests,
  getWithdrawalSettings,
  cancelWithdrawalRequest,
  toggleWithdrawalHiddenStatus
} from '../../firebase/services/withdrawalService';
import { getUserEarnings } from '../../firebase/services/earningsService';
import { getUserProfile } from '../../firebase/services/userService';
import { WithdrawalRequest, WithdrawalSettings } from '../../firebase/types/withdrawals';
import { UserEarnings } from '../../firebase/types/earnings';
import { UserProfile } from '../../firebase/types/user';
import { FogCoinSettings } from '../../firebase/types/fogCoinSettings';
import { toast } from 'react-hot-toast';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onNavigateToSettings?: () => void;
}

type WithdrawStep = 'amount' | 'account' | 'confirmation' | 'success' | 'history';
type ActiveTab = 'withdraw' | 'history';

const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  onClose,
  userId,
  onNavigateToSettings
}) => {
  // State management
  const [activeTab, setActiveTab] = useState<ActiveTab>('withdraw');
  const [currentStep, setCurrentStep] = useState<WithdrawStep>('amount');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [selectedCurrency, setSelectedCurrency] = useState<'PKR' | 'USD'>('PKR');
  const [selectedAccount, setSelectedAccount] = useState<'PKR' | 'USD' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHiddenRequests, setShowHiddenRequests] = useState(false);

  // Data state
  const [userEarnings, setUserEarnings] = useState<UserEarnings | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [withdrawalSettings, setWithdrawalSettings] = useState<WithdrawalSettings | null>(null);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [fogSettings, setFogSettings] = useState<FogCoinSettings | null>(null);
  const [successRequestId, setSuccessRequestId] = useState<string>('');

  // Load data when modal opens or hidden requests toggle changes
  useEffect(() => {
    if (isOpen && userId) {
      loadData();
    }
  }, [isOpen, userId, showHiddenRequests]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep('amount');
      setWithdrawAmount('');
      setSelectedCurrency('PKR');
      setSelectedAccount(null);
      setActiveTab('withdraw');
      setSuccessRequestId('');
    }
  }, [isOpen]);

  // Helper function to check if account is complete
  const isAccountComplete = (account: any, type: 'PKR' | 'USD'): boolean => {
    if (!account) return false;

    if (type === 'PKR') {
      return !!(account.bankName?.trim() &&
        account.accountName?.trim() &&
        account.accountNumber?.trim());
    } else {
      return !!(account.serviceName?.trim() &&
        account.walletAddress?.trim());
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [earnings, profile, settings, requests, fogCoinSettings] = await Promise.all([
        getUserEarnings(userId),
        getUserProfile(userId),
        getWithdrawalSettings(),
        getUserWithdrawalRequests(userId, showHiddenRequests),
        getFogCoinSettingsWithCache()
      ]);

      setUserEarnings(earnings);
      setUserProfile(profile);
      setWithdrawalSettings(settings);
      setWithdrawalRequests(requests);
      setFogSettings(fogCoinSettings);

      // If user has previous requests, show history tab by default
      if (requests.length > 0) {
        setActiveTab('history');
      }
    } catch (error) {
      console.error('Error loading withdrawal data:', error);
      toast.error('Failed to load withdrawal data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMaxAmount = () => {
    if (userEarnings) {
      setWithdrawAmount(userEarnings.availableBalance.toString());
    }
  };

  const validateAmount = (): string | null => {
    const amount = parseFloat(withdrawAmount);

    if (!withdrawAmount.trim()) {
      return 'Please enter an amount';
    }

    if (isNaN(amount) || amount <= 0) {
      return 'Please enter a valid amount';
    }

    if (withdrawalSettings && amount < withdrawalSettings.minimumWithdrawAmount) {
      return `Minimum withdrawal amount is ${withdrawalSettings.minimumWithdrawAmount} FOG coins`;
    }

    if (userEarnings && amount > userEarnings.availableBalance) {
      return `Insufficient balance. You can only withdraw your available balance (${userEarnings.availableBalance.toFixed(2)} FOG coins).`;
    }

    return null;
  };

  const handleAmountNext = () => {
    const error = validateAmount();
    if (error) {
      toast.error(error);
      return;
    }
    const amount = parseFloat(withdrawAmount);

    if (!amount) {
      toast.error('Please enter the amount..');
    } else if (amount <= 0) {
      toast.error('Invalid Amount');
    }
    // Additional validation for withdrawal settings
    if (!withdrawalSettings?.isWithdrawalsEnabled) {
      toast.error('Withdrawals are currently disabled. Please try again later.');
      return;
    }

    setCurrentStep('account');
  };

  const handleAccountSelect = (accountType: 'PKR' | 'USD') => {
    // Validate account details exist and are complete
    const accountData = accountType === 'PKR'
      ? userProfile?.withdrawalAccount?.pkr
      : userProfile?.withdrawalAccount?.usd;

    if (!accountData) {
      toast.error(`${accountType} account details not found. Please add account details first.`);
      return;
    }

    // Validate PKR account completeness
    if (accountType === 'PKR') {
      const pkrAccount = accountData as any;
      if (!pkrAccount.bankName || !pkrAccount.accountName || !pkrAccount.accountNumber ||
        pkrAccount.bankName.trim() === '' || pkrAccount.accountName.trim() === '' ||
        pkrAccount.accountNumber.trim() === '') {
        toast.error('PKR account is incomplete. Please update your bank account details.');
        return;
      }

      // Also check for IBAN if it's required
      if (pkrAccount.ibanNumber && pkrAccount.ibanNumber.trim() === '') {
        toast.error('PKR account IBAN number is incomplete. Please update your bank account details.');
        return;
      }
    }

    // Validate USD account completeness
    if (accountType === 'USD') {
      const usdAccount = accountData as any;
      if (!usdAccount.serviceName || !usdAccount.walletAddress ||
        usdAccount.serviceName.trim() === '' || usdAccount.walletAddress.trim() === '') {
        toast.error('USD account is incomplete. Please update your wallet details.');
        return;
      }
    }

    setSelectedAccount(accountType);
    setSelectedCurrency(accountType);
    setCurrentStep('confirmation');
  };

  const handleSubmitWithdrawal = async () => {
    if (!selectedAccount || !userProfile) return;





    setIsSubmitting(true);
    try {

      const amount = parseFloat(withdrawAmount);
      const accountDetails = selectedAccount === 'PKR'
        ? userProfile.withdrawalAccount?.pkr
        : userProfile.withdrawalAccount?.usd;

      const requestId = await createWithdrawalRequest(
        userId,
        amount,
        selectedCurrency,
        accountDetails
      );

      setSuccessRequestId(requestId);
      setCurrentStep('success');

      // Refresh data
      await loadData();

      toast.success('Withdrawal request submitted successfully!');
    } catch (error: any) {
      console.error('Error submitting withdrawal:', error);
      toast.error(error.message || 'Failed to submit withdrawal request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      await cancelWithdrawalRequest(requestId, userId);
      toast.success('Withdrawal request cancelled');
      await loadData(); // Refresh data
    } catch (error: any) {
      console.error('Error cancelling withdrawal:', error);
      toast.error(error.message || 'Failed to cancel withdrawal request');
    }
  };

  const handleHideRequest = async (requestId: string, currentlyHidden: boolean) => {
    try {
      await toggleWithdrawalHiddenStatus(requestId, userId, !currentlyHidden);
      toast.success(currentlyHidden ? 'Request restored to history' : 'Request hidden from history');
      await loadData(); // Refresh data
    } catch (error: any) {
      console.error('Error toggling request visibility:', error);
      toast.error(error.message || 'Failed to update request visibility');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green text-white border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderAmountStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Wallet className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-[--color-text-primary] mb-2">
          Enter Withdrawal Amount
        </h3>
        <p className="text-[--color-text-secondary]">
          Available Balance: <span className="font-semibold text-[--color-primary]">
            {formatFog(userEarnings?.availableBalance || 0)}
          </span>
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="amount">Amount (FOG Coins)</Label>
          <div className="flex gap-2">
            <Input
              id="amount"
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="Enter amount"
              min="0"
              step="0.01"
              className="flex-1"
            />
            <Button variant="outline" onClick={handleMaxAmount}>
              Max
            </Button>
          </div>
          {withdrawAmount && (
            <p className="text-sm text-[--color-text-secondary] mt-1">
              ≈ {formatUsd((fogSettings?.fogToUsdRate || 0.10) * parseFloat(withdrawAmount || '0'))}
            </p>
          )}

          {/* Real-time validation feedback */}
          {withdrawAmount && validateAmount() && (
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg mt-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                <p className="text-sm text-red-600">{validateAmount()}</p>
              </div>
            </div>
          )}
        </div>

        {withdrawalSettings && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">Withdrawal Requirements</p>
                <ul className="space-y-1 text-xs">
                  <li>• Minimum withdrawal: {withdrawalSettings.minimumWithdrawAmount} FOG coins</li>
                  <li>• Your available balance: {userEarnings?.availableBalance.toFixed(2) || 0} FOG coins</li>
                  <li>• Processing time: {withdrawalSettings.processingTimeHours} hours</li>
                  <li>• Supported currencies: {withdrawalSettings.supportedCurrencies.join(', ')}</li>
                  {!withdrawalSettings.isWithdrawalsEnabled && (
                    <li className="text-red-600 font-medium">• ⚠️ Withdrawals are currently disabled</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleAmountNext}>
          Next
        </Button>
      </div>
    </div>
  );

  const renderAccountStep = () => {
    const hasPkrAccount = userProfile?.withdrawalAccount?.pkr &&
      isAccountComplete(userProfile.withdrawalAccount.pkr, 'PKR');
    const hasUsdAccount = userProfile?.withdrawalAccount?.usd &&
      isAccountComplete(userProfile.withdrawalAccount.usd, 'USD');

    const hasCompleteAccounts = hasPkrAccount || hasUsdAccount;

    if (!hasCompleteAccounts) {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-xl font-semibold text-[--color-text-primary] mb-2">
              Complete Your Withdrawal Account
            </h3>
            <p className="text-[--color-text-secondary] mb-6">
              Your withdrawal accounts exist but are incomplete. Please complete all required fields to proceed with your withdrawal.
            </p>

            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div className="text-sm text-amber-800 dark:text-amber-200 text-left">
                  <p className="font-medium mb-2">Required fields missing:</p>
                  {userProfile?.withdrawalAccount?.pkr && !isAccountComplete(userProfile.withdrawalAccount.pkr, 'PKR') && (
                    <div className="mb-2">
                      <p className="font-medium text-xs">PKR Account:</p>
                      <ul className="space-y-1 text-xs ml-2">
                        {!userProfile.withdrawalAccount.pkr.bankName?.trim() && <li>• Bank name</li>}
                        {!userProfile.withdrawalAccount.pkr.accountName?.trim() && <li>• Account holder name</li>}
                        {!userProfile.withdrawalAccount.pkr.accountNumber?.trim() && <li>• Account number</li>}
                      </ul>
                    </div>
                  )}
                  {userProfile?.withdrawalAccount?.usd && !isAccountComplete(userProfile.withdrawalAccount.usd, 'USD') && (
                    <div className="mb-2">
                      <p className="font-medium text-xs">USD Account:</p>
                      <ul className="space-y-1 text-xs ml-2">
                        {!userProfile.withdrawalAccount.usd.serviceName?.trim() && <li>• Service name (PayPal, Wise, etc.)</li>}
                        {!userProfile.withdrawalAccount.usd.walletAddress?.trim() && <li>• Wallet address/email</li>}
                      </ul>
                    </div>
                  )}
                  <p className="text-xs mt-2">Go to Profile Settings → Setting Tab → Complete Withdrawal Details</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" onClick={() => setCurrentStep('amount')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button onClick={() => {
                onClose();
                onNavigateToSettings?.();
              }} className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Add Account Now
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-[--color-text-primary] mb-2">
            Select Withdrawal Account
          </h3>
          <p className="text-[--color-text-secondary]">
            Choose the account where you want to receive {formatFog(parseFloat(withdrawAmount))}
          </p>
        </div>

        <div className="space-y-3">
          {userProfile.withdrawalAccount?.pkr && (
            <Card
              className={`cursor-pointer transition-all border-2 ${isAccountComplete(userProfile.withdrawalAccount.pkr, 'PKR')
                ? 'hover:shadow-md hover:border-[--color-primary]'
                : 'border-red-200 bg-red-50 dark:bg-red-900/10'
                }`}
              onClick={() => {
                if (isAccountComplete(userProfile.withdrawalAccount.pkr, 'PKR')) {
                  handleAccountSelect('PKR');
                } else {
                  toast.error('PKR account is incomplete. Please update your bank account details first.');
                }
              }}
            >
              <CardContent className="p-5 pt-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isAccountComplete(userProfile.withdrawalAccount.pkr, 'PKR')
                      ? 'bg-green-100'
                      : 'bg-red-100'
                      }`}>
                      <span className={`text-sm font-bold ${isAccountComplete(userProfile.withdrawalAccount.pkr, 'PKR')
                        ? 'text-green-600'
                        : 'text-red-600'
                        }`}>PKR</span>
                    </div>
                    <div>
                      <p className="font-medium text-[--color-text-primary] flex items-center gap-2">
                        {userProfile.withdrawalAccount.pkr.bankName?.trim() || 'Bank Name Required'}
                        {!isAccountComplete(userProfile.withdrawalAccount.pkr, 'PKR') && (
                          <span className="text-xs text-red-500 font-normal">(Incomplete)</span>
                        )}
                      </p>
                      <p className="text-sm text-[--color-text-secondary]">
                        {userProfile.withdrawalAccount.pkr.accountName?.trim() || 'Account Name Required'}
                      </p>
                      <p className="text-xs text-[--color-text-secondary]">
                        {userProfile.withdrawalAccount.pkr.accountNumber?.trim()
                          ? `****${userProfile.withdrawalAccount.pkr.accountNumber.slice(-4)}`
                          : 'Account Number Required'}
                      </p>
                    </div>
                  </div>
                  {isAccountComplete(userProfile.withdrawalAccount.pkr, 'PKR') ? (
                    <ArrowLeft className="w-5 h-5 text-[--color-text-secondary] rotate-180" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {userProfile.withdrawalAccount?.usd && (
            <Card
              className={`cursor-pointer transition-all border-2 ${isAccountComplete(userProfile.withdrawalAccount.usd, 'USD')
                ? 'hover:shadow-md hover:border-[--color-primary]'
                : 'border-red-200 bg-red-50 dark:bg-red-900/10'
                }`}
              onClick={() => {
                if (isAccountComplete(userProfile.withdrawalAccount.usd, 'USD')) {
                  handleAccountSelect('USD');
                } else {
                  toast.error('USD account is incomplete. Please update your wallet details first.');
                }
              }}
            >
              <CardContent className="p-5 pt-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isAccountComplete(userProfile.withdrawalAccount.usd, 'USD')
                      ? 'bg-blue-100'
                      : 'bg-red-100'
                      }`}>
                      <span className={`text-sm font-bold ${isAccountComplete(userProfile.withdrawalAccount.usd, 'USD')
                        ? 'text-blue-600'
                        : 'text-red-600'
                        }`}>USD</span>
                    </div>
                    <div>
                      <p className="font-medium text-[--color-text-primary] flex items-center gap-2">
                        {userProfile.withdrawalAccount.usd.serviceName?.trim() || 'Service Name Required'}
                        {!isAccountComplete(userProfile.withdrawalAccount.usd, 'USD') && (
                          <span className="text-xs text-red-500 font-normal">(Incomplete)</span>
                        )}
                      </p>
                      <p className="text-xs text-[--color-text-secondary]">
                        {userProfile.withdrawalAccount.usd.walletAddress?.trim()
                          ? `${userProfile.withdrawalAccount.usd.walletAddress.slice(0, 8)}...${userProfile.withdrawalAccount.usd.walletAddress.slice(-6)}`
                          : 'Wallet Address Required'}
                      </p>
                    </div>
                  </div>
                  {isAccountComplete(userProfile.withdrawalAccount.usd, 'USD') ? (
                    <ArrowLeft className="w-5 h-5 text-[--color-text-secondary] rotate-180" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setCurrentStep('amount')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </div>
    );
  };

  const renderConfirmationStep = () => {
    const selectedAccountData = selectedAccount === 'PKR'
      ? userProfile?.withdrawalAccount?.pkr
      : userProfile?.withdrawalAccount?.usd;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold text-[--color-text-primary] mb-2">
            Confirm Withdrawal
          </h3>
          <p className="text-[--color-text-secondary]">
            Please review your withdrawal details before submitting
          </p>
        </div>

        <div className="bg-[--color-bg-secondary] rounded-lg p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-[--color-text-secondary]">Amount:</span>
            <span className="font-semibold text-[--color-text-primary]">
              {formatFog(parseFloat(withdrawAmount))}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[--color-text-secondary]">USD Value:</span>
            <span className="text-[--color-text-primary]">
              ≈ {formatUsd((fogSettings?.fogToUsdRate || 0.10) * parseFloat(withdrawAmount))}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[--color-text-secondary]">Currency:</span>
            <span className="text-[--color-text-primary]">{selectedCurrency}</span>
          </div>
          <hr className="border-[--color-border]" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-[--color-text-primary]">Withdrawal Account:</p>
            {selectedAccount === 'PKR' && selectedAccountData && (
              <div className="text-sm text-[--color-text-secondary]">
                <p>{(selectedAccountData as any).bankName}</p>
                <p>{(selectedAccountData as any).accountName}</p>
                <p>****{(selectedAccountData as any).accountNumber.slice(-4)}</p>
              </div>
            )}
            {selectedAccount === 'USD' && selectedAccountData && (
              <div className="text-sm text-[--color-text-secondary]">
                <p>{(selectedAccountData as any).serviceName}</p>
                <p>{(selectedAccountData as any).walletAddress.slice(0, 12)}...{(selectedAccountData as any).walletAddress.slice(-8)}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="text-sm text-amber-800 dark:text-amber-200">
              <p className="font-medium mb-1">Processing Information</p>
              <p>Your withdrawal will be processed within {withdrawalSettings?.processingTimeHours || 24} hours. You'll receive a confirmation once the transfer is completed.</p>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setCurrentStep('account')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={handleSubmitWithdrawal}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Withdrawal Request'}
          </Button>
        </div>
      </div>
    );
  };

  const renderSuccessStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-[--color-text-primary] mb-2">
          Withdrawal Request Submitted!
        </h3>
        <p className="text-[--color-text-secondary] mb-6">
          Your withdrawal request has been successfully submitted and is now being processed.
        </p>

        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-left">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="text-sm text-green-800 dark:text-green-200">
              <p className="font-medium mb-1">What happens next?</p>
              <ul className="space-y-1 text-xs">
                <li>• Your request is now in the processing queue</li>
                <li>• You'll receive updates via email</li>
                <li>• Processing typically takes {withdrawalSettings?.processingTimeHours || 24} hours</li>
                <li>• You can track the status in your withdrawal history</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-3">
        <Button variant="outline" onClick={() => setActiveTab('history')}>
          View History
        </Button>
        <Button onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );

  const renderHistoryTab = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[--color-text-primary]">
          Withdrawal History
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHiddenRequests(!showHiddenRequests)}
            className="flex items-center gap-1 text-xs"
          >
            {showHiddenRequests ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            {showHiddenRequests ? 'Hide' : 'Show'}
          </Button>
          <Badge variant="secondary" className="text-xs">
            {withdrawalRequests.length}
          </Badge>
        </div>
      </div>

      {withdrawalRequests.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-[--color-text-secondary]">No withdrawal requests found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {withdrawalRequests.map((request) => (
            <Card 
              key={request.id} 
              className={`border hover:shadow-md transition-all duration-200 ${
                request.hiddenByUser && showHiddenRequests 
                  ? 'opacity-60 border-dashed border-gray-300 ' 
                  : 'border-gray-200 hover:border-[--color-primary]/30'
              }`}
            >
              <CardContent className="pb-1 pt-5 relative">
                {/* Header Row */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      request.status === 'completed' ? 'bg-green-100' :
                      request.status === 'rejected' ? 'bg-red-100' :
                      request.status === 'pending' ? 'bg-yellow-100' :
                      'bg-blue-100'
                    }`}>
                      <span className={`text-xs font-bold ${
                        request.status === 'completed' ? 'text-green-600' :
                        request.status === 'rejected' ? 'text-red-600' :
                        request.status === 'pending' ? 'text-yellow-600' :
                        'text-blue-600'
                      }`}>
                        {request.currency}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <Badge className={getStatusColor(request.status)}>
                          {request.status.toUpperCase()}
                        </Badge>
                        {request.hiddenByUser && showHiddenRequests && (
                          <Badge variant="outline" className="text-xs">
                            Hidden
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-[--color-text-secondary] mt-1">
                        {new Date(request.requestedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })} at {new Date(request.requestedAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-[--color-text-primary]">
                      {formatFog(request.amount)}
                    </p>
                    <p className="text-xs text-[--color-text-secondary]">
                      ≈ {formatUsd((fogSettings?.fogToUsdRate || 0.10) * request.amount)}
                    </p>
                  </div>
                </div>

                {/* Additional Details */}
                {(request.completedAt || request.rejectionReason || request.transactionId) && (
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded p-3 space-y-1 text-xs">
                    {request.completedAt && (
                      <div className="flex justify-between">
                        <span className="font-medium text-[--color-text-secondary]">Completed:</span>
                        <span className="text-[--color-text-primary]">
                          {new Date(request.completedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    )}

                    {request.rejectionReason && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-2">
                        <span className="font-medium text-red-700 dark:text-red-400 text-xs">Reason: </span>
                        <span className="text-red-600 dark:text-red-300 text-xs">{request.rejectionReason}</span>
                      </div>
                    )}

                    {request.transactionId && (
                      <div className="flex justify-between">
                        <span className="font-medium text-[--color-text-secondary]">TX ID:</span>
                        <span className="font-mono text-[--color-text-primary] bg-gray-100 dark:bg-gray-700 px-1 rounded text-xs">
                          {request.transactionId.slice(0, 8)}...
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-3 flex justify-between items-center">
                  <div>
                    {request.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelRequest(request.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs h-7"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                  
                  {/* Hide/Show button for completed and rejected requests */}
                  {(request.status === 'completed' || request.status === 'rejected') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleHideRequest(request.id, request.hiddenByUser || false)}
                      className="absolute top-4 right-3 text-gray-500 hover:text-gray-700  text-xs h-0 px-2"
                      title={request.hiddenByUser ? 'Show in history' : 'Hide from history'}
                    >
                      {request.hiddenByUser ? (
                        <Eye className="w-3 h-3" />
                      ) : (
                        <EyeOff className="w-3 h-3" />
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      // Don't close on backdrop click
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-[--color-bg-primary] rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[--color-border]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[--color-primary]/10 rounded-full flex items-center justify-center">
                <Wallet className="w-4 h-4 text-[--color-primary]" />
              </div>
              <h2 className="text-xl font-bold text-[--color-text-primary]">
                Withdraw Funds
              </h2>
            </div>
            <Button variant="ghost" onClick={onClose} className="p-2">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Tabs - only show if user has withdrawal history */}
          {withdrawalRequests.length > 0 && currentStep === 'amount' && (
            <div className="border-b border-[--color-border]">
              <div className="flex">
                <button
                  className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'withdraw'
                    ? 'border-b-2 border-[--color-primary] text-[--color-primary]'
                    : 'text-[--color-text-secondary] hover:text-[--color-text-primary]'
                    }`}
                  onClick={() => setActiveTab('withdraw')}
                >
                  New Withdrawal
                </button>
                <button
                  className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'history'
                    ? 'border-b-2 border-[--color-primary] text-[--color-primary]'
                    : 'text-[--color-text-secondary] hover:text-[--color-text-primary]'
                    }`}
                  onClick={() => setActiveTab('history')}
                >
                  History
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          <div
            className="p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800"
            style={{ maxHeight: 'calc(90vh - 140px)' }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[--color-primary]"></div>
              </div>
            ) : (
              <>
                {activeTab === 'withdraw' && (
                  <>
                    {currentStep === 'amount' && renderAmountStep()}
                    {currentStep === 'account' && renderAccountStep()}
                    {currentStep === 'confirmation' && renderConfirmationStep()}
                    {currentStep === 'success' && renderSuccessStep()}
                  </>
                )}
                {activeTab === 'history' && renderHistoryTab()}
              </>
            )}
          </div>

          {/* Footer Note */}
          {activeTab === 'withdraw' && currentStep === 'amount' && (
            <div className="px-6 py-4 bg-[--color-bg-secondary] border-t border-[--color-border]">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-[--color-text-secondary] mt-0.5 flex-shrink-0" />
                <p className="text-xs text-[--color-text-secondary]">
                  <span className="font-medium">Processing Time:</span> Withdrawals are processed within {withdrawalSettings?.processingTimeHours || 24} hours.
                  Please check your withdrawal history for updates.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WithdrawModal;
