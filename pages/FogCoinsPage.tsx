import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, AlertCircle, CheckCircle2,
  Clock, Copy, ChevronRight,
  Lock, Banknote, XCircle, Ban, Globe,
  AlertTriangle, ArrowDown, Loader2,
  ExternalLink, CreditCard, ArrowLeft, Repeat,
  ArrowUp, TrendingUp, Gift, Briefcase,
  ShoppingBag, Package, DollarSign, Receipt, Upload
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { type Route } from '../types';
import { useAuth } from '../firebase/hooks/useAuth';
import { getFogCoinSettings } from '../firebase/services/fogCoinSettingsService';
import {
  getBankAccountsByCurrency,
  createPaymentRequest,
  getUserPendingRequestsCount,
  getUserPaymentRequests,
  submitPaymentVerification
} from '../firebase/services/paymentsService';
import { uploadFile } from '../firebase/services/storageService';
import type { Currency, BankAccount, PaymentRequest } from '../firebase/types/payments';
import { toast } from 'react-hot-toast';
import { getWalletBalance } from '../firebase/services/walletService';
import type { WalletBalance } from '../firebase/types/wallet';
import { getUserEarnings, getRecentTransactions } from '../firebase/services/earningsService';
import type { UserEarnings } from '../firebase/types/earnings';
import type { Transaction } from '../firebase/types/transaction';
import { getUserProfile } from '../firebase/services/userService';
import { createWithdrawalRequest } from '../firebase/services/withdrawalService';

// --- Configuration & Constants ---
const MIN_WITHDRAWAL = 10; // Minimum FOG
const MIN_DEPOSIT_PKR = 500; // Minimum PKR for deposit

// 3D Assets - Using local icons
const ASSETS = {
  coin: "/images/fog-coins-icons/stack-of-coins.png",
  wallet: "/images/fog-coins-icons/wallet.png",
  bank: "https://img.icons8.com/3d-fluency/375/museum.png",
  safe: "/images/fog-coins-icons/safe.png",
  growth: "/images/fog-coins-icons/chart.png"
};

type PurchaseStep = 'idle' | 'currency' | 'amount' | 'bank' | 'verification' | 'submitted';
type ActiveTab = 'deposit' | 'withdraw' | 'hodl';

interface FogCoinsPageProps {
  navigate: (route: Route) => void;
}

// --- Helper Components ---

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles = {
    approved: "bg-[--color-success-bg] text-[--color-success-icon] border-[--color-success-icon]/20",
    completed: "bg-[--color-success-bg] text-[--color-success-icon] border-[--color-success-icon]/20",
    pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    active: "bg-[--color-accent]/10 text-[--color-accent] border-[--color-accent]/20",
    rejected: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  };

  const icons = {
    approved: CheckCircle2,
    completed: CheckCircle2,
    pending: Clock,
    active: Lock,
    rejected: XCircle,
  };

  const normalizedStatus = status.toLowerCase() as keyof typeof styles;
  const StyleClass = styles[normalizedStatus] || styles.pending;
  const Icon = icons[normalizedStatus] || Clock;

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${StyleClass}`}>
      <Icon size={12} strokeWidth={2.5} />
      {status}
    </div>
  );
};

const StatCard: React.FC<{
  label: string;
  value: string;
  icon3d: string;
  subValue?: string;
  highlight?: boolean;
  delay?: number
}> = ({ label, value, icon3d, subValue, highlight, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className={`
      relative overflow-hidden p-4 sm:p-5 md:p-6 rounded-2xl md:rounded-[2rem] border transition-all duration-500 group
      ${highlight
        ? 'bg-gradient-to-br from-[--color-primary] to-[--color-accent] text-white border-[--color-primary]/50 shadow-xl shadow-[--color-primary]/20'
        : 'bg-[--color-card]/40 backdrop-blur-xl border-[--color-border] text-[--color-text-primary] shadow-lg hover:shadow-xl hover:-translate-y-1'
      }
    `}
  >
    {/* Animated Shine for Highlight Card */}
    {highlight && (
       <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full animate-[shimmer_2.5s_infinite]" />
    )}

    {/* Decorative Blur Blob */}
    <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full blur-[50px] transition-all duration-500 ${highlight ? 'bg-white/30' : 'bg-[--color-primary]/5'}`} />

    <div className="relative z-10 flex justify-between items-start h-full">
      <div className="flex flex-col justify-between h-full space-y-2 sm:space-y-3 md:space-y-4">
        <div className="flex-1 min-w-0">
           <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1 opacity-80 ${highlight ? 'text-white' : 'text-[--color-text-secondary]'}`}>{label}</p>
           <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold font-heading tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">{value}</h3>
        </div>
        {subValue && (
          <div className={`inline-flex items-center gap-1.5 px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 rounded-lg md:rounded-xl text-[9px] sm:text-[10px] font-bold backdrop-blur-md ${highlight ? 'bg-white/20 text-white border border-white/20' : 'bg-[--color-bg-secondary]/80 text-[--color-text-secondary] border border-[--color-border]'}`}>
            {subValue}
          </div>
        )}
      </div>
      <motion.div
        whileHover={{ scale: 1.1, rotate: 10 }}
        className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 -mr-1 sm:-mr-2 -mt-1 sm:-mt-2 filter drop-shadow-lg flex-shrink-0"
      >
        <img src={icon3d} alt="icon" className="w-full h-full object-contain" />
      </motion.div>
    </div>
  </motion.div>
);

// Helper function to get transaction display properties
const getTransactionDisplayInfo = (transaction: Transaction) => {
  const typeMap: Record<string, { title: string; icon: any; color: string; category: 'deposit' | 'withdraw' | 'hodl' }> = {
    'earning': { title: 'Earning', icon: TrendingUp, color: 'success', category: 'deposit' },
    'deposit_request': { title: 'Deposit Request', icon: Clock, color: 'amber', category: 'deposit' },
    'deposit_approved': { title: 'Deposit Approved', icon: ArrowDown, color: 'success', category: 'deposit' },
    'deposit_rejected': { title: 'Deposit Rejected', icon: XCircle, color: 'rose', category: 'deposit' },
    'withdrawal': { title: 'Withdrawal', icon: ArrowUp, color: 'amber', category: 'withdraw' },
    'transfer_sent': { title: 'Transfer Sent', icon: ArrowUp, color: 'amber', category: 'withdraw' },
    'transfer_received': { title: 'Transfer Received', icon: ArrowDown, color: 'success', category: 'deposit' },
    'ad_earning': { title: 'Ad Earning', icon: TrendingUp, color: 'success', category: 'deposit' },
    'referral_earning': { title: 'Referral Earning', icon: Gift, color: 'success', category: 'deposit' },
    'task_earning': { title: 'Task Earning', icon: CheckCircle2, color: 'success', category: 'deposit' },
    'bonus_earning': { title: 'Bonus Reward', icon: Gift, color: 'success', category: 'deposit' },
    'freelance_job_earning': { title: 'Job Earning', icon: Briefcase, color: 'success', category: 'deposit' },
    'fogsly_service_earning': { title: 'Service Earning', icon: ShoppingBag, color: 'success', category: 'deposit' },
    'fogsly_physical_earning': { title: 'Physical Product Earning', icon: Package, color: 'success', category: 'deposit' },
    'job_payment': { title: 'Job Payment', icon: DollarSign, color: 'rose', category: 'withdraw' },
    'job_refund': { title: 'Job Refund', icon: Receipt, color: 'success', category: 'deposit' },
    'platform_tax': { title: 'Platform Fee', icon: Receipt, color: 'rose', category: 'withdraw' },
  };

  const info = typeMap[transaction.type] || {
    title: 'Transaction',
    icon: transaction.amount >= 0 ? ArrowDown : ArrowUp,
    color: transaction.amount >= 0 ? 'success' : 'amber',
    category: transaction.amount >= 0 ? 'deposit' : 'withdraw'
  };

  // Get description from transaction or create a default one
  const description = transaction.description || `FOG ${Math.abs(transaction.amount).toFixed(2)}`;

  return {
    ...info,
    amount: transaction.amount,
    date: transaction.createdAt,
    status: transaction.status,
    description
  };
};

const FogCoinsPage = ({ navigate }: FogCoinsPageProps) => {
  const { user } = useAuth();
  const [hasError, setHasError] = useState(false);
  const depositSectionRef = React.useRef<HTMLDivElement>(null);

  // Firebase state from original
  const [fogUsdRate, setFogUsdRate] = useState(0.10);
  const [usdToPkrRate, setUsdToPkrRate] = useState(280);
  const [fogToPkrRate, setFogToPkrRate] = useState(28);
  const [isLoadingPrice, setIsLoadingPrice] = useState(true);
  const [lastPriceUpdate, setLastPriceUpdate] = useState<Date | null>(null);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  // Wallet balance state
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);

  // User earnings state
  const [userEarnings, setUserEarnings] = useState<UserEarnings | null>(null);

  // Transactions state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);

  // Pending payment requests state
  const [pendingPaymentRequests, setPendingPaymentRequests] = useState<PaymentRequest[]>([]);

  // UI state
  const [activeTab, setActiveTab] = useState<ActiveTab>('deposit');
  const [transactionFilter, setTransactionFilter] = useState<'deposit' | 'withdraw'>('deposit');
  const [showPendingRequests, setShowPendingRequests] = useState(false);

  // Deposit state
  const [depositStep, setDepositStep] = useState<1 | 2 | 3 | 4>(1);
  const [depositCurrency, setDepositCurrency] = useState<Currency>('PKR'); // Currency for deposit section
  const [depositLocalAmount, setDepositLocalAmount] = useState<string>(''); // Amount in local currency (PKR or USD)
  const [depositFog, setDepositFog] = useState<string>('');

  // Verification form state for deposit
  const [verificationData, setVerificationData] = useState({
    transactionId: '',
    accountName: '',
    accountNumber: '',
  });
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [isUploadingVerification, setIsUploadingVerification] = useState(false);
  const [createdPaymentRequestId, setCreatedPaymentRequestId] = useState<string>('');
  const [isCompletingPendingVerification, setIsCompletingPendingVerification] = useState(false);

  // Withdraw state
  const [withdrawStep, setWithdrawStep] = useState<1 | 2 | 3>(1);
  const [withdrawCurrency, setWithdrawCurrency] = useState<Currency>('PKR');
  const [withdrawLocalAmount, setWithdrawLocalAmount] = useState<string>('');
  const [withdrawFog, setWithdrawFog] = useState<string>('');

  // User profile state for bank account
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Purchase flow state (from original)
  const [purchaseStep, setPurchaseStep] = useState<PurchaseStep>('idle');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('USD');
  const [usdValue, setUsdValue] = useState('100.00');
  const [fogValue, setFogValue] = useState('');
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [isLoadingBankAccounts, setIsLoadingBankAccounts] = useState(false);
  const [selectedBankAccount, setSelectedBankAccount] = useState<BankAccount | null>(null);
  const [paymentRequestId, setPaymentRequestId] = useState<string>('');
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);

  const isModalOpen = purchaseStep !== 'idle';
  const hasTooManyPendingRequests = pendingRequestsCount >= 2;

  // Load FOG coin price
  const loadFogCoinPrice = async (showSuccessToast = false, isInitialLoad = false) => {
    setIsLoadingPrice(true);
    try {
      const settings = await getFogCoinSettings();
      if (settings) {
        const previousRate = fogUsdRate;
        const newRate = settings.fogToUsdRate;
        const newUsdToPkr = settings.usdToPkrRate;
        const newFogToPkr = settings.fogToPkrRate;

        if (isInitialLoad || previousRate !== newRate) {
          setFogUsdRate(newRate);
          setUsdToPkrRate(newUsdToPkr);
          setFogToPkrRate(newFogToPkr);

          if (usdValue && !isNaN(parseFloat(usdValue))) {
            setFogValue((parseFloat(usdValue) / newRate).toFixed(2));
          } else {
            setFogValue((100 / newRate).toFixed(2));
          }

          if (showSuccessToast && !isInitialLoad) {
            toast.success('Price updated successfully!');
          }
        } else {
          if (showSuccessToast) {
            toast.success('Price checked - no changes');
          }
        }

        setLastPriceUpdate(new Date());
      }
    } catch (error) {
      console.error('Error loading FOG coin settings:', error);
      setHasError(true);
      if (!isInitialLoad) {
        toast.error('Failed to load current rates');
      }
    } finally {
      setIsLoadingPrice(false);
    }
  };

  // Load pending requests
  const loadPendingRequests = async () => {
    if (!user?.uid) return;

    try {
      const count = await getUserPendingRequestsCount(user.uid);
      setPendingRequestsCount(count);
    } catch (error) {
      console.error('Error loading pending requests:', error);
      setHasError(true);
    }
  };

  // Load wallet balance and user earnings
  const loadWalletBalance = async () => {
    if (!user?.uid) return;

    setIsLoadingBalance(true);
    try {
      const [balance, earnings] = await Promise.all([
        getWalletBalance(user.uid),
        getUserEarnings(user.uid)
      ]);
      setWalletBalance(balance);
      setUserEarnings(earnings);
    } catch (error) {
      console.error('Error loading wallet balance:', error);
      setHasError(true);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  // Load user transactions
  const loadTransactions = async () => {
    if (!user?.uid) return;

    setIsLoadingTransactions(true);
    try {
      const [userTransactions, paymentRequests] = await Promise.all([
        getRecentTransactions(user.uid, 20),
        getUserPaymentRequests(user.uid)
      ]);
      setTransactions(userTransactions);

      // Filter to show only pending/processing requests
      const pending = paymentRequests.filter(req =>
        req.status === 'pending' || req.status === 'processing'
      );
      setPendingPaymentRequests(pending);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  // Load user profile for bank account details
  const loadUserProfile = async () => {
    if (!user?.uid) return;

    setIsLoadingProfile(true);
    try {
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Effects
  useEffect(() => {
    const init = async () => {
      try {
        await loadFogCoinPrice(false, true);
      } catch (error) {
        console.error('Failed to initialize price:', error);
        setHasError(true);
      }
    };

    init();

    const priceInterval = setInterval(() => {
      loadFogCoinPrice(false, false);
    }, 30000);

    return () => clearInterval(priceInterval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (user?.uid) {
      const init = async () => {
        try {
          await loadPendingRequests();
          await loadWalletBalance();
          await loadTransactions();
          await loadUserProfile(); // Load user profile for bank account
        } catch (error) {
          console.error('Failed to initialize user data:', error);
          setHasError(true);
        }
      };

      init();

      const requestsInterval = setInterval(() => {
        loadPendingRequests();
        loadWalletBalance();
        loadTransactions();
        loadUserProfile(); // Refresh profile periodically
      }, 15000);

      return () => clearInterval(requestsInterval);
    }
  }, [user?.uid]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (selectedCurrency) {
      const loadBankAccountsData = async () => {
        setIsLoadingBankAccounts(true);
        try {
          const accounts = await getBankAccountsByCurrency(selectedCurrency);
          setBankAccounts(accounts);
        } catch (error) {
          console.error('Error loading bank accounts:', error);
          toast.error('Failed to load bank accounts');
        } finally {
          setIsLoadingBankAccounts(false);
        }
      };

      loadBankAccountsData();
    }
  }, [selectedCurrency]);

  // Validation
  const validateDecimal = (val: string) => val === '' || /^\d+(\.\d{0,2})?$/.test(val);

  // Calculate minimum deposit based on currency
  const getMinDeposit = (currency: Currency) => {
    if (currency === 'PKR') return MIN_DEPOSIT_PKR;
    // For USD, convert minimum PKR to USD equivalent
    return Math.ceil(MIN_DEPOSIT_PKR / usdToPkrRate);
  };

  // Get the rate to convert local currency to FOG
  const getLocalToFogRate = (currency: Currency) => {
    return currency === 'PKR' ? fogToPkrRate : fogUsdRate;
  };

  // Get currency symbol
  const getCurrencySymbol = (currency: Currency) => {
    return currency === 'PKR' ? 'PKR' : '$';
  };

  const depositLocalNum = parseFloat(depositLocalAmount) || 0;
  const minDepositAmount = getMinDeposit(depositCurrency);
  const isValidDeposit = depositLocalNum >= minDepositAmount;

  const withdrawFogNum = parseFloat(withdrawFog) || 0;
  const availableBalance = userEarnings?.availableBalance || 0;
  const isValidWithdraw = withdrawFogNum >= MIN_WITHDRAWAL && withdrawFogNum <= availableBalance;

  // Handlers - Deposit
  const handleDepositLocalAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (validateDecimal(val)) {
      setDepositLocalAmount(val);
      if (val) {
        const rate = getLocalToFogRate(depositCurrency);
        setDepositFog((parseFloat(val) / rate).toFixed(2));
      } else {
        setDepositFog('');
      }
    }
  };

  const handleDepositFogChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (validateDecimal(val)) {
      setDepositFog(val);
      if (val) {
        const rate = getLocalToFogRate(depositCurrency);
        setDepositLocalAmount((parseFloat(val) * rate).toFixed(2));
      } else {
        setDepositLocalAmount('');
      }
    }
  };

  // Toggle deposit currency
  const toggleDepositCurrency = () => {
    setDepositCurrency(prev => {
      const newCurrency = prev === 'PKR' ? 'USD' : 'PKR';
      // Recalculate local amount based on FOG value when switching currency
      if (depositFog && parseFloat(depositFog) > 0) {
        const newRate = getLocalToFogRate(newCurrency);
        setDepositLocalAmount((parseFloat(depositFog) * newRate).toFixed(2));
      }
      return newCurrency;
    });
  };

  // Handlers - Withdraw
  const handleWithdrawFogChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (validateDecimal(val)) {
      setWithdrawFog(val);
      if (val) {
        const rate = getLocalToFogRate(withdrawCurrency);
        setWithdrawLocalAmount((parseFloat(val) * rate).toFixed(2));
      } else {
        setWithdrawLocalAmount('');
      }
    }
  };

  const handleWithdrawLocalAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (validateDecimal(val)) {
      setWithdrawLocalAmount(val);
      if (val) {
        const rate = getLocalToFogRate(withdrawCurrency);
        setWithdrawFog((parseFloat(val) / rate).toFixed(2));
      } else {
        setWithdrawFog('');
      }
    }
  };

  // Toggle withdraw currency
  const toggleWithdrawCurrency = () => {
    setWithdrawCurrency(prev => {
      const newCurrency = prev === 'PKR' ? 'USD' : 'PKR';
      // Recalculate local amount based on FOG value when switching currency
      if (withdrawFog && parseFloat(withdrawFog) > 0) {
        const newRate = getLocalToFogRate(newCurrency);
        setWithdrawLocalAmount((parseFloat(withdrawFog) * newRate).toFixed(2));
      }
      return newCurrency;
    });
  };

  const handleTabSwitch = (tab: ActiveTab) => {
    setActiveTab(tab);
    setDepositStep(1);
    setWithdrawStep(1);
    setDepositLocalAmount('');
    setDepositFog('');
    setWithdrawLocalAmount('');
    setWithdrawFog('');
    // Reset verification data
    setVerificationData({
      transactionId: '',
      accountName: '',
      accountNumber: '',
    });
    setScreenshot(null);
    setCreatedPaymentRequestId('');
    setIsCompletingPendingVerification(false);
    setSelectedBankAccount(null);
  };

  // Helper function to check if bank account is complete
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

  // Handle withdrawal request submission
  const handleWithdrawRequest = async () => {
    if (!user) {
      toast.error('Please log in to withdraw funds');
      navigate('auth');
      return;
    }

    // Validate amount
    if (!isValidWithdraw) {
      if (withdrawFogNum < MIN_WITHDRAWAL) {
        toast.error(`Minimum withdrawal is ${MIN_WITHDRAWAL} FOG`);
      } else {
        toast.error('Insufficient balance');
      }
      return;
    }

    // Check if user profile is loaded
    if (!userProfile) {
      toast.error('Loading user profile... Please try again');
      return;
    }

    // Get account for selected currency
    const accountData = withdrawCurrency === 'PKR'
      ? userProfile.withdrawalAccount?.pkr
      : userProfile.withdrawalAccount?.usd;

    // Validate account exists and is complete
    if (!accountData) {
      toast.error(`${withdrawCurrency} account not found. Please add your account details in Profile Settings.`);
      return;
    }

    if (!isAccountComplete(accountData, withdrawCurrency)) {
      toast.error(`${withdrawCurrency} account is incomplete. Please complete all required fields in Profile Settings.`);
      return;
    }

    try {
      setWithdrawStep(2);

      // Create withdrawal request
      await createWithdrawalRequest(
        user.uid,
        withdrawFogNum,
        withdrawCurrency,
        accountData
      );

      toast.success('Withdrawal request submitted successfully!');

      // Refresh data
      await loadWalletBalance();
      await loadTransactions();
    } catch (error: any) {
      console.error('Error submitting withdrawal:', error);
      toast.error(error.message || 'Failed to submit withdrawal request');
      setWithdrawStep(1); // Go back to step 1 on error
    }
  };

  // Original handlers
  const handleContinueDeposit = () => {
    console.log('=== handleContinueDeposit called ===');
    console.log('depositCurrency:', depositCurrency);
    console.log('user:', user);

    if (!user) {
      toast.error('Please log in to purchase FOG Coins');
      navigate('auth');
      return;
    }

    // Check if USD is selected
    if (depositCurrency === 'USD') {
      console.log('USD detected! Showing error message');
      toast.error('USD deposits coming soon! Please select PKR currency to continue.');
      return;
    }

    console.log('Proceeding to step 2');
    // Move to step 2 in the same card interface
    setDepositStep(2);
  };

  const handleDepositPaymentConfirm = async () => {
    if (!user) {
      toast.error('Please log in to create a payment request');
      navigate('auth');
      return;
    }

    setIsCreatingPayment(true);
    try {
      // Calculate USD amount based on deposit currency
      const usdAmt = depositCurrency === 'PKR'
        ? depositLocalNum / usdToPkrRate
        : depositLocalNum;

      // Load bank accounts for the selected currency
      const accounts = await getBankAccountsByCurrency(depositCurrency);

      if (accounts.length === 0) {
        toast.error(`No ${depositCurrency} bank accounts available. Please contact support.`);
        setIsCreatingPayment(false);
        return;
      }

      // Filter to only show Meezan Bank accounts (exclude Easypaisa)
      const bankAccounts = accounts.filter(acc => acc.bankName.toLowerCase().includes('meezan') || acc.bankName.toLowerCase().includes('bank'));

      if (bankAccounts.length === 0) {
        toast.error('Meezan Bank account not available. Please contact support.');
        setIsCreatingPayment(false);
        return;
      }

      // Use the first Meezan Bank account
      const selectedBank = bankAccounts[0];

      // Create payment request~
      const requestId = await createPaymentRequest(
        user.uid,
        user.email || '',
        user.displayName || 'Unknown User',
        parseFloat(depositFog),
        usdAmt,
        depositCurrency,
        fogUsdRate,
        selectedBank.id
      );

      setCreatedPaymentRequestId(requestId);
      setSelectedBankAccount(selectedBank);
      setDepositStep(3);
      loadPendingRequests();

      toast.success('Payment request created! Please complete verification below.');
    } catch (error) {
      console.error('Error creating payment request:', error);
      toast.error('Failed to create payment request');
    } finally {
      setIsCreatingPayment(false);
    }
  };

  const handleCurrencySelect = (currency: Currency) => {
    setSelectedCurrency(currency);
    setPurchaseStep('amount');
  };

  const handleAmountConfirm = () => {
    setPurchaseStep('bank');
  };

  const handleBankSelect = async (bank: BankAccount) => {
    if (!user) return;

    setIsCreatingPayment(true);
    try {
      setSelectedBankAccount(bank);

      const requestId = await createPaymentRequest(
        user.uid,
        user.email || '',
        user.displayName || 'Unknown User',
        fogValue && !isNaN(parseFloat(fogValue)) ? parseFloat(fogValue) : 0,
        parseFloat(usdValue),
        selectedCurrency,
        fogUsdRate,
        bank.id
      );

      setPaymentRequestId(requestId);
      setPurchaseStep('submitted');
      loadPendingRequests();

      // After modal closes, go back to deposit step 1
      setTimeout(() => {
        setDepositStep(3);
      }, 100);

      toast.success('Payment request created! Please complete verification in Customer Service.');
    } catch (error) {
      console.error('Error creating payment request:', error);
      toast.error('Failed to create payment request');
    } finally {
      setIsCreatingPayment(false);
    }
  };

  const handleCloseModal = () => {
    setPurchaseStep('idle');
    setSelectedCurrency('USD');
    setSelectedBankAccount(null);
    setPaymentRequestId('');

    // If we're in deposit tab, show success message
    if (activeTab === 'deposit' && depositFog) {
      setDepositStep(3);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const getLocalAmount = () => {
    const usd = parseFloat(usdValue);
    return selectedCurrency === 'USD' ? usd : usd * usdToPkrRate;
  };

  const getLocalCurrencySymbol = () => {
    return selectedCurrency === 'USD' ? '$' : 'PKR ';
  };

  // Show error state if Firebase is not configured
  if (hasError) {
    return (
      <div className="min-h-screen pt-20 sm:pt-24 pb-16 sm:pb-24 bg-[--color-bg-primary] text-[--color-text-primary] flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-8">
            <AlertCircle className="w-16 h-16 text-rose-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Unable to Load Page</h2>
            <p className="text-[--color-text-secondary] mb-6">
              There was an error loading the FOG Coins page. Please check your internet connection and try again.
            </p>
            <Button
              onClick={() => {
                setHasError(false);
                loadFogCoinPrice(false, true);
                if (user?.uid) {
                  loadPendingRequests();
                  loadWalletBalance();
                  loadTransactions();
                }
              }}
              className="w-full"
            >
              Try Again
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate('home')}
              className="w-full mt-3"
            >
              Go Back Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen pt-20 sm:pt-4 pb-16 sm:pb-24 bg-[--color-bg-primary] text-[--color-text-primary] transition-colors duration-500 font-sans selection:bg-[--color-primary]/30">

        {/* Background Decor - Ambient Lights */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-[--color-accent]/5 rounded-full blur-[150px]" />
          <div className="absolute top-[40%] -right-[10%] w-[50%] h-[60%] bg-[--color-primary]/5 rounded-full blur-[150px]" />
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 relative z-10">

          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <button
              onClick={() => navigate('home')}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-[--color-text-primary] hover:text-[--color-primary] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Go Back</span>
            </button>
          </motion.div>

          {/* --- Header Section --- */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 md:gap-8 mb-8 md:mb-16">
             <div className="text-center lg:text-left w-full lg:w-auto">
                <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 mb-4 md:mb-6 rounded-full bg-[--color-card]/50 backdrop-blur-md border border-[--color-border] shadow-sm">
                   <img src={ASSETS.coin} className="w-4 h-4 md:w-5 md:h-5" alt="coin" />
                   <span className="text-[10px] md:text-xs font-bold text-[--color-text-secondary] uppercase tracking-wider">Official Platform Currency</span>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold font-heading tracking-tight mb-3 md:mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[--color-text-primary] to-[--color-text-secondary]/80">
                  Fog Coin Wallet
                </h1>
                <p className="text-[--color-text-secondary] text-sm md:text-base lg:text-lg max-w-lg mx-auto lg:mx-0 font-light leading-relaxed px-4 lg:px-0">
                  The secure heart of your Fogsly experience. Earn, grow, and manage your digital assets with enterprise-grade security.
                </p>
             </div>

             {/* Trust Badge / Status */}
             <div className="hidden lg:flex flex-col items-end gap-2">
                <div className="flex items-center gap-4 px-6 py-4 bg-[--color-card]/60 backdrop-blur-xl border border-[--color-border] rounded-3xl shadow-xl">
                  <div className="bg-[--color-success-bg] p-3 rounded-2xl text-[--color-success-icon] shadow-inner">
                      <ShieldCheck size={28} />
                  </div>
                  <div>
                      <p className="text-xs font-bold text-[--color-text-secondary] uppercase tracking-wider mb-0.5">Security Level</p>
                      <div className="flex items-center gap-2">
                        <p className="text-base font-bold text-[--color-text-primary]">Bank-Grade Escrow</p>
                        <CheckCircle2 size={14} className="text-[--color-success-icon] fill-current" />
                      </div>
                  </div>
                </div>
             </div>
          </div>

          {/* --- Wallet Stats Grid --- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-8 md:mb-12">
             <StatCard
               label="Available Balance"
               value={isLoadingBalance ? '...' : `${Number(userEarnings?.availableBalance ?? 0).toFixed(2)} FOG`}
               subValue={`≈ ${(Number(userEarnings?.availableBalance ?? 0) * fogToPkrRate).toLocaleString()} PKR`}
               icon3d={ASSETS.wallet}
               highlight
               delay={0.1}
             />
             
             <StatCard
               label="Lifetime Earnings"
               value={isLoadingBalance ? '...' : `${Number(userEarnings?.lifetimeEarnings ?? 0).toFixed(2)} FOG`}
               subValue="All Time"
               icon3d={ASSETS.safe}
               delay={0.2}
             />
             <StatCard
               label="Total Withdrawn"
               value={isLoadingBalance ? '...' : `${Number(userEarnings?.totalWithdrawn ?? 0).toFixed(2)} FOG`}
               subValue="Outgoing"
               icon3d={ASSETS.coin}
               delay={0.3}
             />
             <StatCard
               label="Total Spent"
               value={isLoadingBalance ? '...' : `${Number(userEarnings?.totalSpent ?? 0).toFixed(2)} FOG`}
               subValue="On Services"
               icon3d={ASSETS.growth}
               delay={0.4}
             />
          </div>

          {/* Warning message for pending requests */}
          {user && hasTooManyPendingRequests && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4 md:mb-6"
            >
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg md:rounded-xl p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-3">
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-left flex-1">
                    <p className="text-xs sm:text-sm md:text-base text-amber-700 font-medium mb-2 sm:mb-0">
                      You have {pendingRequestsCount} pending/processing request{pendingRequestsCount > 1 ? 's' : ''}.
                      Please complete verification before creating a new deposit request.
                    </p>
                    <button
                      onClick={() => setShowPendingRequests(true)}
                      className="inline-flex items-center gap-1.5 sm:gap-2 mt-2 text-xs sm:text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors"
                    >
                      <span>Verify Now</span>
                      <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Pending Requests Section */}
          {user && showPendingRequests && pendingPaymentRequests.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 md:mb-6"
            >
              <div className="bg-[--color-card]/60 backdrop-blur-2xl border border-[--color-border] rounded-2xl md:rounded-3xl shadow-xl overflow-hidden">
                <div className="p-4 sm:p-5 md:p-6 border-b border-[--color-border]/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-[--color-text-primary]">
                        Pending Deposits ({pendingPaymentRequests.length})
                      </h3>
                      <p className="text-xs sm:text-sm text-[--color-text-secondary]">
                        Complete verification to proceed with new deposits
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPendingRequests(false)}
                    className="p-2 hover:bg-[--color-bg-secondary]/50 rounded-lg transition-colors"
                  >
                    <XCircle className="w-5 h-5 text-[--color-text-secondary]" />
                  </button>
                </div>

                <div className="p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4 max-h-[400px] overflow-y-auto">
                  {pendingPaymentRequests.map((request, index) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-[--color-bg-secondary]/40 border border-[--color-border]/50 rounded-xl md:rounded-2xl p-3 sm:p-4 hover:border-[--color-border] transition-all"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <StatusBadge status={request.status} />
                            <span className="text-xs text-[--color-text-secondary]">
                              {new Date(request.submittedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="text-[--color-text-secondary] text-xs">FOG Coins</p>
                              <p className="font-bold text-[--color-text-primary]">
                                {request.fogCoinsAmount.toFixed(2)} FOG
                              </p>
                            </div>
                            <div>
                              <p className="text-[--color-text-secondary] text-xs">Amount</p>
                              <p className="font-bold text-[--color-text-primary]">
                                {request.localAmount.toLocaleString()} {request.currency}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {request.verificationDetails ? (
                        <div className="pt-3 border-t border-[--color-border]/30">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            <span className="text-xs font-medium text-green-600">Verification Submitted</span>
                          </div>
                          <div className="text-xs text-[--color-text-secondary] space-y-1">
                            <p><span className="font-medium">Transaction ID:</span> {request.verificationDetails.transactionId}</p>
                            <p><span className="font-medium">Account:</span> {request.verificationDetails.accountName}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="pt-3 border-t border-[--color-border]/30">
                          <p className="text-xs text-amber-600 mb-2 flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Verification required
                          </p>
                          <button
                            onClick={async () => {
                              try {
                                // Load the bank account for this request
                                const accounts = await getBankAccountsByCurrency(request.currency);
                                const bankAccount = accounts.find(acc => acc.id === request.selectedBankAccountId);

                                if (!bankAccount) {
                                  toast.error('Bank account not found. Please contact support.');
                                  return;
                                }

                                // Set all the deposit flow states
                                setDepositCurrency(request.currency);
                                setDepositLocalAmount(request.localAmount.toString());
                                setDepositFog(request.fogCoinsAmount.toFixed(2));
                                setCreatedPaymentRequestId(request.id);
                                setSelectedBankAccount(bankAccount);
                                setIsCompletingPendingVerification(true); // Mark as pending verification
                                setActiveTab('deposit'); // Switch to deposit tab
                                setDepositStep(3); // Go directly to step 3 (verification form)
                                setShowPendingRequests(false);

                                toast.success('Complete the verification form below');

                                // Smooth scroll to deposit section after a short delay
                                setTimeout(() => {
                                  depositSectionRef.current?.scrollIntoView({
                                    behavior: 'smooth',
                                    block: 'start'
                                  });
                                }, 300);
                              } catch (error) {
                                console.error('Error loading bank account:', error);
                                toast.error('Failed to load verification form. Please try again.');
                              }
                            }}
                            className="w-full px-3 py-2 bg-[--color-primary] hover:bg-[--color-primary]/90 text-white rounded-lg text-xs font-medium transition-colors"
                          >
                            Complete Verification
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          <div className="grid lg:grid-cols-12 gap-4 md:gap-8">

            {/* --- LEFT COLUMN: Main Interaction Area --- */}
            <div className="lg:col-span-7 xl:col-span-8" ref={depositSectionRef}>
              <div className="bg-[--color-card]/60 backdrop-blur-2xl border border-[--color-border] rounded-2xl md:rounded-[2.5rem] shadow-2xl overflow-hidden min-h-[500px] md:min-h-[600px] flex flex-col relative z-0">

                 {/* Tab Navigation Pill */}
                 <div className="p-3 sm:p-4 md:p-5 border-b border-[--color-border]/40">
                    <div className="flex gap-2 p-2 sm:p-2.5 rounded-2xl md:rounded-3xl relative bg-[--color-bg-secondary]/80 backdrop-blur-sm">
                       <motion.div
                          className="absolute top-2 sm:top-2.5 bottom-2 sm:bottom-2.5 bg-gradient-to-r from-[--color-primary] to-[--color-accent] rounded-xl md:rounded-2xl shadow-xl z-0"
                          initial={false}
                          animate={{
                             width: 'calc(33.33% - 0.5rem)',
                             left: activeTab === 'deposit' ? '0.5rem' : activeTab === 'withdraw' ? 'calc(33.33% + 0.5rem)' : 'calc(66.66% + 0.5rem)'
                          }}
                          transition={{ type: "spring", stiffness: 350, damping: 35 }}
                       />
                       {['deposit', 'withdraw', 'hodl'].map((tab) => (
                         <button
                           key={tab}
                           onClick={() => handleTabSwitch(tab as ActiveTab)}
                           className={`relative z-10 flex-1 py-3.5 sm:py-4 md:py-5 px-2 sm:px-3 text-center text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-wide transition-all duration-300 ${activeTab === tab ? 'text-white' : 'text-[--color-text-secondary] hover:text-[--color-text-primary]'}`}
                         >
                           {tab === 'hodl' ? (
                             <>
                               <span className="hidden min-[400px]:inline">Growth Plans</span>
                               <span className="min-[400px]:hidden text-[11px]">Growth</span>
                             </>
                           ) : (
                             <>
                               <span className="hidden min-[400px]:inline capitalize">{tab}</span>
                               <span className="min-[400px]:hidden text-[11px] capitalize">{tab}</span>
                             </>
                           )}
                         </button>
                       ))}
                    </div>
                 </div>

                 {/* Content Area */}
                 <div className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 relative">
                   <AnimatePresence mode="wait">

                     {/* === DEPOSIT FLOW === */}
                     {activeTab === 'deposit' && (
                       <motion.div key="deposit" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.3 }} className="h-full flex flex-col">

                          {/* Step 1: Input */}
                          {depositStep === 1 && (
                             <div className="space-y-4 md:space-y-6 animate-fade-in">

                                {/* Region & Rate Header with Currency Toggle */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                                    <button
                                       onClick={toggleDepositCurrency}
                                       className="flex items-center gap-2 sm:gap-3 p-2 pr-3 sm:pr-4 bg-[--color-accent]/10 rounded-full border border-[--color-accent]/20 w-fit hover:bg-[--color-accent]/20 transition-all cursor-pointer group"
                                    >
                                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[--color-accent] text-white flex items-center justify-center">
                                            <Globe size={14} className="sm:w-4 sm:h-4" />
                                        </div>
                                        <div className="flex flex-col leading-none">
                                            <span className="text-[9px] sm:text-[10px] font-bold text-[--color-accent] uppercase tracking-wider">Region</span>
                                            <span className="text-xs sm:text-sm font-bold text-[--color-text-primary]">
                                               {depositCurrency === 'PKR' ? 'Pakistan (PKR)' : 'International (USD)'}
                                            </span>
                                        </div>
                                        <Repeat size={12} className="text-[--color-accent] group-hover:rotate-180 transition-transform duration-300 sm:w-3.5 sm:h-3.5" />
                                    </button>
                                    <div className="text-left sm:text-right">
                                        <p className="text-[9px] sm:text-[10px] font-bold text-[--color-text-secondary] uppercase">Rate</p>
                                        <p className="text-xs sm:text-sm font-bold text-[--color-text-primary]">
                                           1 FOG = <span className="text-[--color-primary]">
                                              {depositCurrency === 'PKR' ? `${fogToPkrRate} PKR` : `$${fogUsdRate.toFixed(3)}`}
                                           </span>
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3 md:space-y-4">
                                   {/* Local Currency Input (PKR or USD) */}
                                   <div className="space-y-2">
                                       <label className="text-xs sm:text-sm font-bold text-[--color-text-secondary] uppercase tracking-wider ml-1">You Pay</label>
                                       <div className="relative group">
                                          <input
                                            type="number"
                                            value={depositLocalAmount}
                                            onChange={handleDepositLocalAmountChange}
                                            disabled={hasTooManyPendingRequests}
                                            className={`w-full bg-[--color-bg-primary] border-2 ${hasTooManyPendingRequests ? 'border-gray-300 cursor-not-allowed opacity-50' : 'border-[--color-border] focus:border-[--color-primary] hover:border-[--color-border]'} rounded-xl md:rounded-2xl py-4 sm:py-5 md:py-6 pl-4 sm:pl-5 md:pl-6 pr-16 sm:pr-20 md:pr-24 text-xl sm:text-2xl md:text-3xl font-extrabold text-[--color-text-primary] placeholder:text-[--color-text-secondary]/30 font-heading focus:outline-none transition-all`}
                                            placeholder="0.00"
                                          />
                                          <span className="absolute right-4 sm:right-5 md:right-6 top-1/2 -translate-y-1/2 text-sm sm:text-base md:text-lg font-bold text-[--color-text-secondary]">
                                             {depositCurrency}
                                          </span>
                                       </div>
                                   </div>

                                   {/* Swap Icon Divider */}
                                   <div className="flex justify-center -my-2 md:-my-3 relative z-10">
                                      <div className="bg-[--color-card] border border-[--color-border] p-2 rounded-full shadow-sm text-[--color-text-secondary]">
                                          <ArrowDown size={14} className="sm:w-4 sm:h-4" />
                                      </div>
                                   </div>

                                   {/* FOG Input */}
                                   <div className="space-y-2">
                                       <label className="text-xs sm:text-sm font-bold text-[--color-text-secondary] uppercase tracking-wider ml-1">You Receive</label>
                                       <div className="relative group">
                                          <input
                                            type="number"
                                            value={depositFog}
                                            onChange={handleDepositFogChange}
                                            disabled={hasTooManyPendingRequests}
                                            className={`w-full bg-[--color-bg-primary] border-2 ${hasTooManyPendingRequests ? 'border-gray-300 cursor-not-allowed opacity-50' : 'border-[--color-border] focus:border-[--color-primary] hover:border-[--color-border]'} rounded-xl md:rounded-2xl py-4 sm:py-5 md:py-6 pl-4 sm:pl-5 md:pl-6 pr-16 sm:pr-20 md:pr-24 text-xl sm:text-2xl md:text-3xl font-extrabold text-[--color-text-primary] placeholder:text-[--color-text-secondary]/30 font-heading focus:outline-none transition-all`}
                                            placeholder="0.00"
                                          />
                                          <span className="absolute right-4 sm:right-5 md:right-6 top-1/2 -translate-y-1/2 text-sm sm:text-base md:text-lg font-bold text-[--color-primary]">FOG</span>
                                       </div>
                                   </div>

                                   {!isValidDeposit && depositLocalAmount !== '' && (
                                       <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-rose-600 text-[10px] sm:text-xs font-bold ml-2 flex items-center gap-1.5">
                                          <XCircle size={12} className="sm:w-3.5 sm:h-3.5"/>
                                          Minimum deposit required: {depositCurrency === 'PKR' ? `${minDepositAmount} PKR` : `$${minDepositAmount}`}
                                       </motion.p>
                                   )}
                                </div>

                                <div className="pt-2">
                                   <Button
                                      size="lg"
                                      className="w-full py-4 sm:py-5 md:py-6 text-sm sm:text-base md:text-lg rounded-xl md:rounded-2xl shadow-xl shadow-[--color-primary]/20 flex items-center justify-center gap-2"
                                      disabled={!isValidDeposit || hasTooManyPendingRequests}
                                      onClick={handleContinueDeposit}
                                   >
                                      Continue to Payment
                                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                                   </Button>
                                </div>
                             </div>
                          )}

                          {/* Step 2: Confirmation before creating request */}
                          {depositStep === 2 && (
                             <div className="space-y-4 sm:space-y-6 md:space-y-8 animate-fade-in">
                                <button onClick={() => setDepositStep(1)} className="flex items-center text-xs sm:text-sm font-bold text-[--color-text-secondary] hover:text-[--color-primary] transition-colors group">
                                   <ChevronRight size={14} className="rotate-180 group-hover:-translate-x-1 transition-transform sm:w-4 sm:h-4" /> Back
                                </button>

                                <div className="text-center p-6 sm:p-8 bg-[--color-bg-secondary]/50 rounded-2xl border border-[--color-border]">
                                   <h3 className="text-xl sm:text-2xl font-bold mb-4">Confirm Deposit Request</h3>
                                   <div className="space-y-3 text-left max-w-sm mx-auto">
                                      <div className="flex justify-between">
                                         <span className="text-[--color-text-secondary]">You Pay:</span>
                                         <span className="font-bold">{depositCurrency === 'PKR' ? `${depositLocalAmount} PKR` : `$${depositLocalAmount}`}</span>
                                      </div>
                                      <div className="flex justify-between">
                                         <span className="text-[--color-text-secondary]">You Receive:</span>
                                         <span className="font-bold text-[--color-primary]">{depositFog} FOG</span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                         <span className="text-[--color-text-secondary]">Currency:</span>
                                         <span className="font-medium">{depositCurrency}</span>
                                      </div>
                                   </div>
                                </div>

                                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                                   <div className="flex gap-3 items-start">
                                      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                      <div>
                                         <p className="text-sm font-bold text-amber-700 mb-1">Next Steps</p>
                                         <p className="text-xs text-amber-600">
                                            After clicking continue, you'll see bank details and a verification form to complete your deposit.
                                         </p>
                                      </div>
                                   </div>
                                </div>

                                <Button
                                   size="lg"
                                   className="w-full py-4 sm:py-5 md:py-6 text-sm sm:text-base md:text-lg rounded-xl md:rounded-2xl shadow-xl shadow-[--color-primary]/20"
                                   onClick={handleDepositPaymentConfirm}
                                   disabled={isCreatingPayment}
                                >
                                   {isCreatingPayment ? (
                                      <>
                                         <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                         Creating Request...
                                      </>
                                   ) : (
                                      'Continue to Payment'
                                   )}
                                </Button>
                             </div>
                          )}

                          {/* Step 3: Bank Details + Verification Form */}
                          {depositStep === 3 && selectedBankAccount && (
                             <div className="space-y-4 sm:space-y-6 md:space-y-8 animate-fade-in max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                                {/* Only show Start Over if this is NOT from a pending verification */}
                                {!isCompletingPendingVerification && (
                                   <button onClick={() => {
                                      setDepositStep(1);
                                      setVerificationData({ transactionId: '', accountName: '', accountNumber: '' });
                                      setScreenshot(null);
                                      setSelectedBankAccount(null);
                                      setCreatedPaymentRequestId('');
                                   }} className="flex items-center text-xs sm:text-sm font-bold text-[--color-text-secondary] hover:text-[--color-primary] transition-colors group">
                                      <ChevronRight size={14} className="rotate-180 group-hover:-translate-x-1 transition-transform sm:w-4 sm:h-4" /> Start Over
                                   </button>
                                )}

                                {/* Bank Card */}
                                <div className="relative overflow-hidden rounded-2xl md:rounded-[2rem] p-4 sm:p-6 md:p-8 text-white shadow-2xl">
                                   <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 z-0"></div>
                                   <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 z-0 mix-blend-overlay"></div>
                                   <div className="absolute top-0 right-0 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-white/5 rounded-full blur-[80px]"></div>

                                   <div className="relative z-10 flex flex-col h-full justify-between min-h-[180px] sm:min-h-[200px] md:min-h-[220px]">
                                      <div className="flex justify-between items-start">
                                         <div>
                                            <p className="text-[8px] sm:text-[9px] md:text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] mb-1">Bank Transfer</p>
                                            <h4 className="text-base sm:text-lg md:text-xl font-bold tracking-wide">{selectedBankAccount.bankName}</h4>
                                         </div>
                                         <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center shadow-lg">
                                            <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
                                         </div>
                                      </div>

                                      <div className="space-y-1">
                                         <p className="text-[8px] sm:text-[9px] md:text-[10px] text-white/50 uppercase tracking-widest">
                                            IBAN / ACCOUNT NUMBER
                                         </p>
                                         <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                                            <p className="text-sm sm:text-base md:text-lg lg:text-xl font-mono tracking-wider text-white shadow-black drop-shadow-md break-all">
                                               {selectedBankAccount.iban || selectedBankAccount.accountNumber}
                                            </p>
                                            <button
                                               onClick={() => {
                                                  navigator.clipboard.writeText(selectedBankAccount.iban || selectedBankAccount.accountNumber);
                                                  toast.success('Copied to clipboard!');
                                               }}
                                               className="p-1.5 sm:p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all backdrop-blur-md border border-white/10 flex-shrink-0"
                                            >
                                               <Copy size={14} className="sm:w-4 sm:h-4"/>
                                            </button>
                                         </div>
                                      </div>

                                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 sm:gap-0 border-t border-white/10 pt-4 sm:pt-5 md:pt-6 mt-2">
                                         <div>
                                            <p className="text-[8px] sm:text-[9px] md:text-[10px] font-bold text-white/50 uppercase">Account Title</p>
                                            <p className="text-sm sm:text-base font-bold tracking-wider">{selectedBankAccount.accountHolderName}</p>
                                         </div>
                                         <div className="text-left sm:text-right">
                                             <p className="text-[8px] sm:text-[9px] md:text-[10px] font-bold text-white/50 uppercase">Total Payable</p>
                                             <p className="font-bold text-lg sm:text-xl md:text-2xl text-white drop-shadow-md">
                                                {depositCurrency === 'PKR' ? `${parseFloat(depositLocalAmount || '0').toFixed(2)} PKR` : `$${parseFloat(depositLocalAmount || '0').toFixed(2)}`}
                                             </p>
                                         </div>
                                      </div>
                                   </div>
                                </div>

                                {/* Verification Form */}
                                <div className="bg-[--color-bg-secondary]/30 border border-[--color-border] rounded-2xl p-4 sm:p-6 space-y-4">
                                   <h3 className="text-lg font-bold">Payment Verification</h3>
                                   <p className="text-xs sm:text-sm text-[--color-text-secondary]">
                                      Complete the payment using the details above, then fill in this form to verify your transaction.
                                   </p>

                                   <div className="space-y-4">
                                      <div>
                                         <label className="block text-xs sm:text-sm font-medium mb-1.5">Transaction ID *</label>
                                         <input
                                            type="text"
                                            className="w-full p-3 border border-[--color-border] rounded-lg bg-[--color-bg-primary] text-sm"
                                            placeholder="Enter transaction/reference ID from your bank"
                                            value={verificationData.transactionId}
                                            onChange={(e) => setVerificationData({...verificationData, transactionId: e.target.value})}
                                         />
                                      </div>

                                      <div>
                                         <label className="block text-xs sm:text-sm font-medium mb-1.5">Your Account Name *</label>
                                         <input
                                            type="text"
                                            className="w-full p-3 border border-[--color-border] rounded-lg bg-[--color-bg-primary] text-sm"
                                            placeholder="Name on your bank account (sender)"
                                            value={verificationData.accountName}
                                            onChange={(e) => setVerificationData({...verificationData, accountName: e.target.value})}
                                         />
                                      </div>

                                      <div>
                                         <label className="block text-xs sm:text-sm font-medium mb-1.5">Your Account Number *</label>
                                         <input
                                            type="text"
                                            className="w-full p-3 border border-[--color-border] rounded-lg bg-[--color-bg-primary] text-sm"
                                            placeholder="Your account number (sender)"
                                            value={verificationData.accountNumber}
                                            onChange={(e) => setVerificationData({...verificationData, accountNumber: e.target.value})}
                                         />
                                      </div>

                                      <div>
                                         <label className="block text-xs sm:text-sm font-medium mb-1.5">Payment Screenshot *</label>

                                         {!screenshot ? (
                                            <div className="relative group cursor-pointer border-2 border-dashed border-[--color-border] hover:border-[--color-primary] rounded-xl bg-[--color-bg-secondary]/30 hover:bg-[--color-primary]/5 transition-all p-6 flex flex-col items-center justify-center text-center">
                                               <div className="w-12 h-12 bg-[--color-primary]/10 rounded-full shadow-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                                                  <Upload className="w-6 h-6 text-[--color-primary]"/>
                                               </div>
                                               <p className="font-bold text-sm text-[--color-text-primary] mb-1">Upload Payment Receipt</p>
                                               <p className="text-xs text-[--color-text-secondary] mb-4">JPG, PNG (Max 5MB)</p>
                                               <input
                                                  type="file"
                                                  accept="image/*"
                                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                  onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                                               />
                                            </div>
                                         ) : (
                                            <div className="relative border-2 border-[--color-success-icon]/30 bg-[--color-success-bg] rounded-xl p-4 flex items-center gap-3">
                                               <div className="w-10 h-10 bg-[--color-success-icon]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                                  <CheckCircle2 className="w-5 h-5 text-[--color-success-icon]" />
                                               </div>
                                               <div className="flex-1 min-w-0">
                                                  <p className="text-sm font-bold text-[--color-text-primary] truncate">{screenshot.name}</p>
                                                  <p className="text-xs text-[--color-text-secondary]">{(screenshot.size / 1024).toFixed(2)} KB</p>
                                               </div>
                                               <button
                                                  onClick={() => setScreenshot(null)}
                                                  className="p-2 hover:bg-rose-500/10 rounded-lg transition-colors flex-shrink-0"
                                               >
                                                  <XCircle className="w-5 h-5 text-rose-600" />
                                               </button>
                                            </div>
                                         )}

                                         <p className="text-xs text-[--color-text-secondary] mt-1.5">
                                            Upload a clear screenshot of your payment confirmation/receipt
                                         </p>
                                      </div>
                                   </div>

                                   <Button
                                      size="lg"
                                      className="w-full py-4 text-sm sm:text-base rounded-xl shadow-xl shadow-[--color-primary]/20"
                                      disabled={!verificationData.transactionId || !verificationData.accountName || !verificationData.accountNumber || !screenshot || isUploadingVerification}
                                      onClick={async () => {
                                         if (!screenshot || !createdPaymentRequestId) return;

                                         try {
                                            setIsUploadingVerification(true);

                                            // Upload screenshot
                                            const screenshotUrl = await uploadFile(
                                               screenshot,
                                               `payment-screenshots/${createdPaymentRequestId}/${Date.now()}`
                                            );

                                            // Submit verification
                                            await submitPaymentVerification(createdPaymentRequestId, {
                                               transactionId: verificationData.transactionId,
                                               accountName: verificationData.accountName,
                                               accountNumber: verificationData.accountNumber,
                                               paymentScreenshot: screenshot
                                            }, screenshotUrl);

                                            // Move to success step
                                            setDepositStep(4);
                                            loadPendingRequests();
                                            loadTransactions();

                                            toast.success('Verification submitted successfully!');
                                         } catch (error) {
                                            console.error('Error submitting verification:', error);
                                            toast.error('Failed to submit verification');
                                         } finally {
                                            setIsUploadingVerification(false);
                                         }
                                      }}
                                   >
                                      {isUploadingVerification ? (
                                         <>
                                            <Upload className="w-4 h-4 mr-2 animate-spin" />
                                            Uploading...
                                         </>
                                      ) : (
                                         'Submit Verification'
                                      )}
                                   </Button>
                                </div>
                             </div>
                          )}

                          {/* Step 4: Success */}
                          {depositStep === 4 && (
                             <div className="flex flex-col items-center justify-center h-full text-center py-8 sm:py-10 md:py-12 animate-fade-in">
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-[--color-success-bg] rounded-full flex items-center justify-center mb-6 sm:mb-7 md:mb-8 shadow-lg"
                                >
                                   <CheckCircle2 size={40} className="text-[--color-success-icon] sm:w-12 sm:h-12 md:w-14 md:h-14" />
                                </motion.div>
                                <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-heading mb-3 sm:mb-4 px-4">Verification Submitted!</h3>
                                <p className="text-[--color-text-secondary] text-sm sm:text-base md:text-lg max-w-md mb-8 sm:mb-9 md:mb-10 leading-relaxed px-4">
                                   Your deposit of <strong className="text-[--color-text-primary]">{depositFog} FOG</strong> is being reviewed. We'll notify you once approved (usually within 1-2 hours).
                                </p>
                                <Button variant="outline" size="lg" className="rounded-lg md:rounded-xl border-2 text-sm sm:text-base" onClick={() => {
                                  setDepositStep(1);
                                  setDepositLocalAmount('');
                                  setDepositFog('');
                                  setVerificationData({ transactionId: '', accountName: '', accountNumber: '' });
                                  setScreenshot(null);
                                  setCreatedPaymentRequestId('');
                                  setIsCompletingPendingVerification(false);
                                  setSelectedBankAccount(null);
                                }}>Make Another Deposit</Button>
                             </div>
                          )}
                       </motion.div>
                     )}

                     {/* === WITHDRAW FLOW === */}
                     {activeTab === 'withdraw' && (
                       <motion.div key="withdraw" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.3 }} className="h-full flex flex-col">

                          {withdrawStep === 1 && (
                             <div className="space-y-4 md:space-y-6 animate-fade-in">
                                {/* Region & Rate Header with Currency Toggle */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                                    <button
                                       onClick={toggleWithdrawCurrency}
                                       className="flex items-center gap-2 sm:gap-3 p-2 pr-3 sm:pr-4 bg-[--color-accent]/10 rounded-full border border-[--color-accent]/20 w-fit hover:bg-[--color-accent]/20 transition-all cursor-pointer group"
                                    >
                                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[--color-accent] text-white flex items-center justify-center">
                                            <Globe size={14} className="sm:w-4 sm:h-4" />
                                        </div>
                                        <div className="flex flex-col leading-none">
                                            <span className="text-[9px] sm:text-[10px] font-bold text-[--color-accent] uppercase tracking-wider">Receive In</span>
                                            <span className="text-xs sm:text-sm font-bold text-[--color-text-primary]">
                                               {withdrawCurrency === 'PKR' ? 'Pakistan (PKR)' : 'International (USD)'}
                                            </span>
                                        </div>
                                        <Repeat size={12} className="text-[--color-accent] group-hover:rotate-180 transition-transform duration-300 sm:w-3.5 sm:h-3.5" />
                                    </button>
                                    <div className="text-left sm:text-right">
                                        <p className="text-[9px] sm:text-[10px] font-bold text-[--color-text-secondary] uppercase">Rate</p>
                                        <p className="text-xs sm:text-sm font-bold text-[--color-text-primary]">
                                           1 FOG = <span className="text-[--color-primary]">
                                              {withdrawCurrency === 'PKR' ? `${fogToPkrRate} PKR` : `$${fogUsdRate.toFixed(3)}`}
                                           </span>
                                        </p>
                                    </div>
                                </div>

                                <div className="p-3 sm:p-4 md:p-5 bg-amber-500/10 border border-amber-500/20 rounded-xl md:rounded-2xl flex gap-2 sm:gap-3 md:gap-4 items-start">
                                   <div className="p-1.5 sm:p-2 bg-amber-500/20 rounded-lg text-amber-600 flex-shrink-0"><AlertTriangle size={16} className="sm:w-5 sm:h-5" /></div>
                                   <div>
                                      <p className="text-xs sm:text-sm font-bold text-amber-700">Withdrawal Policy</p>
                                      <p className="text-[10px] sm:text-xs text-amber-600/80 mt-1 leading-relaxed">
                                         Manual approval required. Minimum withdrawal is {MIN_WITHDRAWAL} FOG. Processing time: 24-48 hours.
                                      </p>
                                   </div>
                                </div>

                                <div className="space-y-3 md:space-y-4">
                                   <div className="flex justify-between items-center px-1">
                                      <label className="text-xs sm:text-sm font-bold text-[--color-text-secondary] uppercase tracking-wider">You Sell</label>
                                      <span
                                         className="text-[10px] sm:text-xs font-bold text-[--color-primary] cursor-pointer hover:underline bg-[--color-primary]/10 px-2 py-1 rounded-lg"
                                         onClick={() => {
                                            const val = availableBalance.toString();
                                            setWithdrawFog(val);
                                            const rate = getLocalToFogRate(withdrawCurrency);
                                            setWithdrawLocalAmount((parseFloat(val) * rate).toFixed(2));
                                         }}
                                      >
                                         Max: {availableBalance.toFixed(2)}
                                      </span>
                                   </div>

                                   {/* FOG Input */}
                                   <div className="relative group">
                                      <input
                                        type="number"
                                        value={withdrawFog}
                                        onChange={handleWithdrawFogChange}
                                        className="w-full bg-[--color-bg-primary] border-2 border-[--color-border] focus:border-[--color-primary] hover:border-[--color-border] rounded-xl md:rounded-2xl py-4 sm:py-5 md:py-6 pl-4 sm:pl-5 md:pl-6 pr-16 sm:pr-20 md:pr-24 text-xl sm:text-2xl md:text-3xl font-extrabold text-[--color-text-primary] placeholder:text-[--color-text-secondary]/30 font-heading focus:outline-none transition-all"
                                        placeholder="0.00"
                                      />
                                      <span className="absolute right-4 sm:right-5 md:right-6 top-1/2 -translate-y-1/2 text-sm sm:text-base md:text-lg font-bold text-[--color-primary]">FOG</span>
                                   </div>

                                   {/* Swap Icon Divider */}
                                   <div className="flex justify-center -my-2 md:-my-3 relative z-10">
                                      <div className="bg-[--color-card] border border-[--color-border] p-2 rounded-full shadow-sm text-[--color-text-secondary]">
                                          <ArrowDown size={14} className="sm:w-4 sm:h-4" />
                                      </div>
                                   </div>

                                   {/* Local Currency Input (PKR or USD) */}
                                   <div className="space-y-2">
                                       <label className="text-xs sm:text-sm font-bold text-[--color-text-secondary] uppercase tracking-wider ml-1">You Receive</label>
                                       <div className="relative group">
                                          <input
                                            type="number"
                                            value={withdrawLocalAmount}
                                            onChange={handleWithdrawLocalAmountChange}
                                            className="w-full bg-[--color-bg-primary] border-2 border-[--color-border] focus:border-[--color-primary] hover:border-[--color-border] rounded-xl md:rounded-2xl py-4 sm:py-5 md:py-6 pl-4 sm:pl-5 md:pl-6 pr-16 sm:pr-20 md:pr-24 text-xl sm:text-2xl md:text-3xl font-extrabold text-[--color-text-primary] placeholder:text-[--color-text-secondary]/30 font-heading focus:outline-none transition-all"
                                            placeholder="0.00"
                                          />
                                          <span className="absolute right-4 sm:right-5 md:right-6 top-1/2 -translate-y-1/2 text-sm sm:text-base md:text-lg font-bold text-[--color-text-secondary]">
                                             {withdrawCurrency}
                                          </span>
                                       </div>
                                   </div>

                                   {withdrawFog !== '' && !isValidWithdraw && (
                                       <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-rose-600 text-[10px] sm:text-xs font-bold ml-2 flex items-center gap-1.5">
                                          <Ban size={12} className="sm:w-3.5 sm:h-3.5" />
                                          {withdrawFogNum < MIN_WITHDRAWAL ? `Minimum is ${MIN_WITHDRAWAL} FOG` : 'Insufficient Funds'}
                                       </motion.p>
                                   )}
                                </div>

                                {/* Bank Account Display */}
                                <div className="p-3 sm:p-4 md:p-5 rounded-2xl md:rounded-3xl border border-[--color-border] bg-[--color-card]/50">
                                   <div className="flex justify-between items-center mb-2 sm:mb-3">
                                       <p className="text-[9px] sm:text-[10px] font-bold text-[--color-text-secondary] uppercase tracking-wider">Destination Account</p>
                                       {userProfile?.withdrawalAccount && (
                                         withdrawCurrency === 'PKR' ? (
                                           isAccountComplete(userProfile.withdrawalAccount.pkr, 'PKR') ? (
                                             <div className="bg-[--color-success-bg] text-[--color-success-icon] px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[9px] sm:text-[10px] font-bold uppercase flex items-center gap-1">
                                               <CheckCircle2 size={10} /> Verified
                                             </div>
                                           ) : (
                                             <div className="bg-rose-500/10 text-rose-600 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[9px] sm:text-[10px] font-bold uppercase flex items-center gap-1">
                                               <AlertCircle size={10} /> Incomplete
                                             </div>
                                           )
                                         ) : (
                                           isAccountComplete(userProfile.withdrawalAccount.usd, 'USD') ? (
                                             <div className="bg-[--color-success-bg] text-[--color-success-icon] px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[9px] sm:text-[10px] font-bold uppercase flex items-center gap-1">
                                               <CheckCircle2 size={10} /> Verified
                                             </div>
                                           ) : (
                                             <div className="bg-rose-500/10 text-rose-600 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[9px] sm:text-[10px] font-bold uppercase flex items-center gap-1">
                                               <AlertCircle size={10} /> Incomplete
                                             </div>
                                           )
                                         )
                                       )}
                                   </div>
                                   {isLoadingProfile ? (
                                     <div className="flex items-center justify-center py-4">
                                       <Loader2 className="w-6 h-6 animate-spin text-[--color-primary]" />
                                     </div>
                                   ) : !userProfile?.withdrawalAccount ? (
                                     <div className="text-center py-4">
                                       <p className="text-sm text-[--color-text-secondary] mb-3">No bank account added yet</p>
                                       <Button size="sm" variant="outline" onClick={() => navigate('profile')}>
                                         Add Account in Settings
                                       </Button>
                                     </div>
                                   ) : (
                                     <>
                                       {withdrawCurrency === 'PKR' && userProfile.withdrawalAccount.pkr && (
                                         <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                                           <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full bg-[--color-bg-secondary] flex items-center justify-center border border-[--color-border] flex-shrink-0">
                                             <Banknote size={18} className="text-[--color-primary] sm:w-5 sm:h-5 md:w-[22px] md:h-[22px]"/>
                                           </div>
                                           <div className="flex-1 min-w-0">
                                             <p className="font-bold text-sm sm:text-base text-[--color-text-primary] truncate">
                                               {userProfile.withdrawalAccount.pkr.bankName || 'Bank Name Required'}
                                               {userProfile.withdrawalAccount.pkr.accountNumber && ` •••• ${userProfile.withdrawalAccount.pkr.accountNumber.slice(-4)}`}
                                             </p>
                                             <p className="text-[10px] sm:text-xs text-[--color-text-secondary] font-medium truncate">
                                               {userProfile.withdrawalAccount.pkr.accountName || 'Account Name Required'}
                                             </p>
                                           </div>
                                           <Button size="sm" variant="ghost" className="ml-auto text-[10px] sm:text-xs flex-shrink-0" onClick={() => navigate('profile')}>
                                             Edit
                                           </Button>
                                         </div>
                                       )}
                                       {withdrawCurrency === 'USD' && userProfile.withdrawalAccount.usd && (
                                         <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                                           <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full bg-[--color-bg-secondary] flex items-center justify-center border border-[--color-border] flex-shrink-0">
                                             <DollarSign size={18} className="text-[--color-primary] sm:w-5 sm:h-5 md:w-[22px] md:h-[22px]"/>
                                           </div>
                                           <div className="flex-1 min-w-0">
                                             <p className="font-bold text-sm sm:text-base text-[--color-text-primary] truncate">
                                               {userProfile.withdrawalAccount.usd.serviceName || 'Service Name Required'}
                                             </p>
                                             <p className="text-[10px] sm:text-xs text-[--color-text-secondary] font-medium truncate">
                                               {userProfile.withdrawalAccount.usd.walletAddress ?
                                                 `${userProfile.withdrawalAccount.usd.walletAddress.slice(0, 12)}...${userProfile.withdrawalAccount.usd.walletAddress.slice(-8)}` :
                                                 'Wallet Address Required'}
                                             </p>
                                           </div>
                                           <Button size="sm" variant="ghost" className="ml-auto text-[10px] sm:text-xs flex-shrink-0" onClick={() => navigate('profile')}>
                                             Edit
                                           </Button>
                                         </div>
                                       )}
                                     </>
                                   )}
                                </div>

                                <div className="pt-2">
                                   <Button
                                      size="lg"
                                      className="w-full py-4 sm:py-5 md:py-6 text-sm sm:text-base md:text-lg rounded-xl md:rounded-2xl shadow-xl shadow-[--color-primary]/20"
                                      disabled={!isValidWithdraw}
                                      onClick={handleWithdrawRequest}
                                   >
                                      Request Withdrawal
                                   </Button>
                                </div>
                             </div>
                          )}

                          {withdrawStep === 2 && (
                             <div className="flex flex-col items-center justify-center h-full text-center py-8 sm:py-10 md:py-12 animate-fade-in">
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-[--color-primary]/10 rounded-full flex items-center justify-center mb-6 sm:mb-7 md:mb-8">
                                   <Clock size={40} className="text-[--color-primary] sm:w-12 sm:h-12 md:w-14 md:h-14" />
                                </motion.div>
                                <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-heading mb-3 sm:mb-4 px-4">Processing...</h3>
                                <p className="text-[--color-text-secondary] text-sm sm:text-base md:text-lg max-w-md mb-8 sm:mb-9 md:mb-10 leading-relaxed px-4">
                                   We've received your request for <strong className="text-[--color-text-primary]">{withdrawFog} FOG</strong>. Funds will appear in your bank account shortly after admin approval.
                                </p>
                                <Button variant="outline" size="lg" className="rounded-lg md:rounded-xl border-2 text-sm sm:text-base" onClick={() => handleTabSwitch('withdraw')}>Return to Wallet</Button>
                             </div>
                          )}
                       </motion.div>
                     )}


                     {/* === HODL PLACEHOLDER === */}
                     {activeTab === 'hodl' && (
                       <motion.div key="hodl" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.3 }} className="h-full flex flex-col items-center justify-center">
                          <div className="text-center px-4">
                             <Lock size={48} className="mx-auto mb-3 sm:mb-4 text-[--color-text-secondary] sm:w-14 sm:h-14 md:w-16 md:h-16" />
                             <h3 className="text-xl sm:text-2xl font-bold mb-2">Coming Soon</h3>
                             <p className="text-sm sm:text-base text-[--color-text-secondary]">HODL features will be available soon. Stay tuned!</p>
                          </div>
                       </motion.div>
                     )}
                   </AnimatePresence>
                 </div>
              </div>
            </div>

            {/* --- RIGHT COLUMN: Transaction History --- */}
            <div className="lg:col-span-5 xl:col-span-4">
              <div className="bg-[--color-card]/60 backdrop-blur-2xl border border-[--color-border] rounded-2xl md:rounded-[2.5rem] p-4 sm:p-6 md:p-8 shadow-xl lg:sticky lg:top-8">
                 <div className="flex items-center justify-between mb-4 sm:mb-5 md:mb-6">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold font-heading text-[--color-text-primary]">Transaction History</h3>
                    <Button variant="ghost" size="sm" className="h-7 w-7 sm:h-8 sm:w-8 rounded-full p-0">
                      <Clock size={16} className="sm:w-[18px] sm:h-[18px]"/>
                    </Button>
                 </div>

                 {/* Filter Tabs */}
                 <div className="flex gap-1.5 sm:gap-2 mb-4 sm:mb-5 md:mb-6 overflow-x-auto no-scrollbar pb-2 p-1 bg-[--color-card]/30 backdrop-blur-sm rounded-lg md:rounded-xl border border-[--color-border]">
                    {['deposit', 'withdraw'].map(filter => (
                       <button
                          key={filter}
                          onClick={() => setTransactionFilter(filter as typeof transactionFilter)}
                          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wide whitespace-nowrap transition-all ${
                             transactionFilter === filter
                             ? 'bg-gradient-to-r from-[--color-primary] to-[--color-accent] text-white shadow-md'
                             : 'text-[--color-text-secondary] hover:bg-[--color-bg-secondary]/50'
                          }`}
                       >
                          {filter}
                       </button>
                    ))}
                 </div>


                 {/* Transaction List */}
                 <div className="space-y-2 sm:space-y-3 max-h-[400px] sm:max-h-[450px] md:max-h-[500px] overflow-y-auto custom-scrollbar pr-1 sm:pr-2">
                    {isLoadingTransactions ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-[--color-primary]" />
                      </div>
                    ) : transactions.length === 0 ? (
                      <div className="text-center py-12">
                        <Clock className="w-12 h-12 mx-auto mb-3 text-[--color-text-secondary] opacity-50" />
                        <p className="text-sm text-[--color-text-secondary]">No transactions yet</p>
                      </div>
                    ) : (
                      transactions
                        .filter(tx => {
                          // Exclude job payment, job refund, and platform tax transactions
                          const excludedTypes = ['job_payment', 'job_refund', 'platform_tax'];
                          if (excludedTypes.includes(tx.type)) return false;

                          // Filter by selected tab (deposit or withdraw)
                          const info = getTransactionDisplayInfo(tx);
                          return info.category === transactionFilter;
                        })
                        .map((tx, index) => {
                          const info = getTransactionDisplayInfo(tx);
                          const formattedDate = new Date(info.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          });

                          return (
                            <motion.div
                              key={tx.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="flex items-center justify-between p-3 sm:p-4 rounded-xl md:rounded-2xl hover:bg-[--color-bg-secondary]/40 transition-colors border border-transparent hover:border-[--color-border]/50 group cursor-default"
                            >
                              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                <div className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-105 flex-shrink-0 ${
                                  info.color === 'purple' ? 'bg-purple-500/10 text-purple-600' :
                                  info.color === 'success' ? 'bg-[--color-success-bg] text-[--color-success-icon]' :
                                  info.color === 'amber' ? 'bg-amber-500/10 text-amber-600' :
                                  info.color === 'rose' ? 'bg-rose-500/10 text-rose-600' :
                                  'bg-[--color-text-secondary]/10 text-[--color-text-secondary]'
                                }`}>
                                  <info.icon size={16} className="sm:w-[18px] sm:h-[18px]" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs sm:text-sm font-bold text-[--color-text-primary] truncate">{info.title}</p>
                                  <p className="text-[10px] sm:text-xs text-[--color-text-secondary] truncate">{info.description}</p>
                                  <p className="text-[9px] sm:text-[10px] text-[--color-text-secondary]/60 truncate mt-0.5">{formattedDate}</p>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0 ml-2">
                                <p className={`text-xs sm:text-sm font-bold ${info.amount > 0 ? 'text-[--color-success-icon]' : 'text-rose-600'}`}>
                                  {info.amount > 0 ? '+' : ''}{info.amount.toFixed(2)} FOG
                                </p>
                                <StatusBadge status={info.status} />
                              </div>
                            </motion.div>
                          );
                        })
                    )}
                 </div>

                 {/* View Full Statement Link */}
                 <div className="mt-4 sm:mt-5 md:mt-6 pt-4 sm:pt-5 md:pt-6 border-t border-[--color-border]">
                    <button className="w-full text-center text-xs sm:text-sm font-bold text-[--color-primary] hover:underline">
                       VIEW FULL STATEMENT
                    </button>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Original Modal for Bank Selection Flow */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        preventBackgroundClose={true}
        title={
          purchaseStep === 'currency' ? "Select Currency" :
            purchaseStep === 'amount' ? "Confirm Amount" :
              purchaseStep === 'bank' ? "Select Payment Method" :
                purchaseStep === 'submitted' ? "Request Submitted" : ""
        }
      >
        {/* Currency Selection */}
        {purchaseStep === 'currency' && (
          <div className="space-y-4">
            <p className="text-[--color-text-secondary] mb-4">
              Choose your preferred currency for payment:
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-16 flex flex-col items-center"
                onClick={() => handleCurrencySelect('USD')}
              >
                <CreditCard className="w-6 h-6 mb-1" />
                <span>USD</span>
                <span className="text-xs text-[--color-text-secondary]">International</span>
              </Button>
              <Button
                variant="outline"
                className="h-16 flex flex-col items-center"
                onClick={() => handleCurrencySelect('PKR')}
              >
                <Banknote className="w-6 h-6 mb-1" />
                <span>PKR</span>
                <span className="text-xs text-[--color-text-secondary]">Pakistan</span>
              </Button>
            </div>
          </div>
        )}

        {/* Amount Confirmation */}
        {purchaseStep === 'amount' && (
          <div className="space-y-4">
            <div className="text-center p-6 bg-[--color-bg-secondary] rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Payment Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>FOG Coins:</span>
                  <span className="font-bold">{fogValue && !isNaN(parseFloat(fogValue)) ? parseFloat(fogValue).toLocaleString() : '0'} FOG</span>
                </div>
                <div className="flex justify-between">
                  <span>USD Amount:</span>
                  {isLoadingPrice ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-xs">Loading...</span>
                    </div>
                  ) : (
                    <span className="font-bold">${parseFloat(usdValue).toFixed(2)}</span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span>Local Amount:</span>
                  {isLoadingPrice ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-xs">Loading...</span>
                    </div>
                  ) : (
                    <span className="font-bold">{getLocalCurrencySymbol()}{getLocalAmount().toFixed(2)}</span>
                  )}
                </div>
                <div className="flex justify-between text-xs text-[--color-text-secondary]">
                  <span>Exchange Rate:</span>
                  <span>{selectedCurrency === 'PKR' ? `1 USD = ${usdToPkrRate} PKR` : '1 USD = 1 USD'}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setPurchaseStep('currency')} className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleAmountConfirm}
                className="flex-1"
                disabled={isLoadingPrice}
              >
                {isLoadingPrice ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Continue'
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Bank Selection */}
        {purchaseStep === 'bank' && (
          <div className="space-y-4">
            <p className="text-[--color-text-secondary] mb-4">
              Select a payment method for {selectedCurrency}:
            </p>
            {isLoadingBankAccounts ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-[--color-primary]" />
                <p className="text-[--color-text-secondary]">Loading payment methods...</p>
              </div>
            ) : bankAccounts.length === 0 ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 mx-auto bg-amber-500/10 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-[--color-text-primary]">
                  No {selectedCurrency} Payment Methods Available
                </h3>
                <p className="text-sm text-[--color-text-secondary]">
                  We don't have any {selectedCurrency} bank accounts set up yet.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button
                    onClick={() => {
                      setSelectedCurrency(selectedCurrency === 'USD' ? 'PKR' : 'USD');
                      setPurchaseStep('amount');
                    }}
                    className="w-full sm:w-auto"
                  >
                    Try {selectedCurrency === 'USD' ? 'PKR' : 'USD'} Instead
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPurchaseStep('amount')}
                    className="w-full sm:w-auto"
                  >
                    Back to Amount
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {bankAccounts.map((bank) => (
                    <div
                      key={bank.id}
                      className={`cursor-pointer hover:bg-[--color-bg-secondary] transition-colors p-4 border border-[--color-border] rounded-lg ${
                        isCreatingPayment ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      onClick={() => !isCreatingPayment && handleBankSelect(bank)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{bank.bankName}</h4>
                          <p className="text-sm text-[--color-text-secondary]">
                            {bank.accountHolderName}
                          </p>
                          <p className="text-xs text-[--color-text-secondary]">
                            {bank.accountNumber}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium text-[--color-primary]">
                            {bank.currency}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {isCreatingPayment && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg z-10">
                    <div className="bg-[--color-bg-primary] p-6 rounded-lg shadow-xl text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-[--color-primary]" />
                      <p className="font-medium">Creating payment request...</p>
                      <p className="text-sm text-[--color-text-secondary] mt-1">Please wait</p>
                    </div>
                  </div>
                )}
                <Button
                  variant="ghost"
                  onClick={() => setPurchaseStep('amount')}
                  className="w-full"
                  disabled={isCreatingPayment}
                >
                  Back to Amount
                </Button>
              </>
            )}
          </div>
        )}

        {/* Submitted Confirmation */}
        {purchaseStep === 'submitted' && selectedBankAccount && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-[--color-success-bg] rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-[--color-success-icon]" />
              </div>
              <h3 className="text-xl font-bold text-[--color-text-primary]">Payment Request Created!</h3>
              <p className="text-[--color-text-secondary] mt-2">
                Request ID: <span className="font-mono font-bold">{paymentRequestId}</span>
              </p>
            </div>

            <div className="bg-[--color-bg-secondary] p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Payment Instructions</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span>Bank:</span>
                  <span className="font-medium">{selectedBankAccount.bankName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Account Name:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{selectedBankAccount.accountHolderName}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() => copyToClipboard(selectedBankAccount.accountHolderName)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Account Number:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{selectedBankAccount.accountNumber}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() => copyToClipboard(selectedBankAccount.accountNumber)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                {selectedBankAccount.iban && (
                  <div className="flex justify-between items-center">
                    <span>IBAN:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{selectedBankAccount.iban}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => copyToClipboard(selectedBankAccount.iban)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between items-center font-bold">
                    <span>Amount to Send:</span>
                    <span className="text-[--color-primary]">
                      {getLocalCurrencySymbol()}{getLocalAmount().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg">
              <h4 className="font-semibold text-amber-700 mb-2">Next Steps:</h4>
              <ol className="text-sm text-amber-600 space-y-1">
                <li>1. Make the payment using the details above</li>
                <li>2. Take a screenshot of your payment confirmation</li>
                <li>3. Go to Customer Service to upload verification details</li>
                <li>4. Our team will approve your deposit within 24 hours</li>
              </ol>
            </div>

            <div className="flex gap-3">
              <Button variant="ghost" onClick={handleCloseModal} className="flex-1">
                Close
              </Button>
              <Button
                onClick={() => {
                  handleCloseModal();
                  navigate('customer-service');
                }}
                className="flex-1"
              >
                Complete Verification
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default FogCoinsPage;
