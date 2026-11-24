import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Settings, ToggleLeft, ToggleRight, Trash2, Edit, RefreshCw, DollarSign, Banknote } from 'lucide-react';
import { getBankAccountsByCurrency, addBankAccount, updateBankAccount, deleteBankAccount } from '../../../firebase/services/paymentsService';
import { BankAccount, Currency } from '../../../firebase/types/payments';
import { toast } from 'react-hot-toast';

interface BankAccountFormData {
  currency: Currency;
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  iban?: string;
  branchName?: string;
  address?: string;
  isActive: boolean;
}

const initialMethods = [
  { name: 'Stripe', description: 'Credit/Debit Cards', enabled: true, logo: 'stripe' },
  { name: 'PayPal', description: 'Online Payments', enabled: true, logo: 'paypal' },
  { name: 'Easypaisa', description: 'Mobile Wallet (PK)', enabled: true, logo: 'easypaisa' },
  { name: 'Bank Transfer', description: 'Direct Bank Deposits', enabled: true, logo: 'bank' },
  { name: 'TRC20 Transfer', description: 'USDT Cryptocurrency', enabled: false, logo: 'trc20' },
];

// Simple logo components for demonstration
const Logo = ({ type }: { type: string }) => {
    const styles = "font-bold text-xl";
    if (type === 'stripe') return <span className={`${styles} text-indigo-400`}>stripe</span>
    if (type === 'paypal') return <span className={`${styles} text-blue-400`}>PayPal</span>
    if (type === 'easypaisa') return <span className={`${styles} text-green-400`}>easypaisa</span>
    if (type === 'bank') return <CreditCard className="w-8 h-8 text-gray-400"/>
    if (type === 'trc20') return <span className={`${styles} text-red-400`}>USDT</span>
    return null;
}

// Bank Account Card Component
const BankAccountCard = ({ account, onEdit, onDelete, onToggleStatus }: { 
  account: BankAccount; 
  onEdit: (account: BankAccount) => void;
  onDelete: (account: BankAccount) => void;
  onToggleStatus: (account: BankAccount) => void;
}) => {
  const getCurrencyIcon = (currency: Currency) => {
    return currency === 'USD' ? <DollarSign className="w-6 h-6 text-green-400" /> : <Banknote className="w-6 h-6 text-blue-400" />;
  };

  const getCurrencyColor = (currency: Currency) => {
    return currency === 'USD' ? 'text-green-400' : 'text-blue-400';
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 flex items-center justify-center bg-slate-900 rounded-lg">
          {getCurrencyIcon(account.currency)}
        </div>
        <div>
          <h3 className="font-semibold text-white">{account.bankName}</h3>
          <p className="text-sm text-gray-400">
            {account.currency === 'USD' ? 'Crypto/Online Payment' : 'Bank Account (PKR)'}
          </p>
          <div className="text-xs text-gray-500 mt-1">
            {account.currency === 'USD' ? (
              <span>Address: {account.address?.substring(0, 20)}...</span>
            ) : (
              <span>Account: {account.accountNumber} - {account.accountHolderName}</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <button 
          onClick={() => onToggleStatus(account)} 
          className="flex items-center gap-2 text-sm"
        >
          {account.isActive ? <ToggleRight size={32} className="text-green-400" /> : <ToggleLeft size={32} className="text-gray-500" />}
          <span className={account.isActive ? 'text-green-400' : 'text-gray-400'}>
            {account.isActive ? 'Active' : 'Inactive'}
          </span>
        </button>
        <button 
          onClick={() => onEdit(account)}
          className="flex items-center gap-1 text-sm bg-slate-700 text-gray-300 px-2 py-1.5 rounded-md hover:bg-slate-600 transition-colors"
          title="Edit Account"
        >
          <Edit size={12} />
        </button>
        <button 
          onClick={() => onDelete(account)}
          className="flex items-center gap-1 text-sm bg-red-900/50 text-red-400 px-2 py-1.5 rounded-md hover:bg-red-900/70 transition-colors"
          title="Delete Account"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
};

const PaymentMethodCard = ({ method: initialMethod }: { method: typeof initialMethods[0] }) => {
  const [method, setMethod] = useState(initialMethod);

  const toggleEnabled = () => {
    setMethod(prev => ({ ...prev, enabled: !prev.enabled }));
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 flex items-center justify-center bg-slate-900 rounded-lg">
          <Logo type={method.logo} />
        </div>
        <div>
          <h3 className="font-semibold text-white">{method.name}</h3>
          <p className="text-sm text-gray-400">{method.description}</p>
        </div>
      </div>
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <button onClick={toggleEnabled} className="flex items-center gap-2 text-sm">
          {method.enabled ? <ToggleRight size={32} className="text-green-400" /> : <ToggleLeft size={32} className="text-gray-500" />}
          <span className={method.enabled ? 'text-green-400' : 'text-gray-400'}>
            {method.enabled ? 'Enabled' : 'Disabled'}
          </span>
        </button>
        <button className="flex items-center gap-2 text-sm bg-slate-700 text-gray-300 px-3 py-1.5 rounded-md hover:bg-slate-600 transition-colors">
          <Settings size={14} /> Configure
        </button>
      </div>
    </div>
  );
};


const PaymentMethodsView = () => {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [processing, setProcessing] = useState(false);

  const [formData, setFormData] = useState<BankAccountFormData>({
    currency: 'USD',
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    iban: '',
    branchName: '',
    address: '',
    isActive: true
  });

  useEffect(() => {
    loadBankAccounts();
  }, []);

  const loadBankAccounts = async () => {
    try {
      setLoading(true);
      const [usdAccounts, pkrAccounts] = await Promise.all([
        getBankAccountsByCurrency('USD'),
        getBankAccountsByCurrency('PKR')
      ]);
      setBankAccounts([...usdAccounts, ...pkrAccounts]);
    } catch (error) {
      console.error('Error loading bank accounts:', error);
      toast.error('Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      currency: 'USD',
      bankName: '',
      accountHolderName: '',
      accountNumber: '',
      iban: '',
      branchName: '',
      address: '',
      isActive: true
    });
  };

  const handleAddAccount = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEditAccount = (account: BankAccount) => {
    setEditingAccount(account);
    setFormData({
      currency: account.currency,
      bankName: account.bankName,
      accountHolderName: account.accountHolderName,
      accountNumber: account.accountNumber,
      iban: account.iban || '',
      branchName: account.branchName || '',
      address: account.address || '',
      isActive: account.isActive
    });
    setShowEditModal(true);
  };

  const handleDeleteAccount = async (account: BankAccount) => {
    if (!confirm(`Are you sure you want to delete ${account.bankName} account?`)) return;

    try {
      setProcessing(true);
      await deleteBankAccount(account.id);
      setBankAccounts(prev => prev.filter(acc => acc.id !== account.id));
      toast.success('Payment method deleted successfully');
    } catch (error) {
      console.error('Error deleting bank account:', error);
      toast.error('Failed to delete payment method');
    } finally {
      setProcessing(false);
    }
  };

  const handleToggleStatus = async (account: BankAccount) => {
    try {
      const updatedAccount = await updateBankAccount(account.id, {
        ...account,
        isActive: !account.isActive
      });
      setBankAccounts(prev => prev.map(acc => acc.id === account.id ? updatedAccount : acc));
      toast.success(`Payment method ${!account.isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error updating bank account status:', error);
      toast.error('Failed to update payment method status');
    }
  };

  const handleSubmitAdd = async () => {
    // Currency-specific validation
    if (formData.currency === 'USD') {
      if (!formData.bankName || !formData.address) {
        toast.error('Please fill in Service Name and Wallet Address for USD payment method');
        return;
      }
    } else {
      if (!formData.bankName || !formData.accountHolderName || !formData.accountNumber) {
        toast.error('Please fill in Bank Name, Account Holder Name, and Account Number for PKR payment method');
        return;
      }
    }

    try {
      setProcessing(true);
      const newAccount = await addBankAccount(formData);
      setBankAccounts(prev => [...prev, newAccount]);
      toast.success('Payment method added successfully');
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      console.error('Error adding bank account:', error);
      toast.error('Failed to add payment method');
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (!editingAccount) return;

    // Currency-specific validation
    if (formData.currency === 'USD') {
      if (!formData.bankName || !formData.address) {
        toast.error('Please fill in Service Name and Wallet Address for USD payment method');
        return;
      }
    } else {
      if (!formData.bankName || !formData.accountHolderName || !formData.accountNumber) {
        toast.error('Please fill in Bank Name, Account Holder Name, and Account Number for PKR payment method');
        return;
      }
    }

    try {
      setProcessing(true);
      const updatedAccount = await updateBankAccount(editingAccount.id, formData);
      setBankAccounts(prev => prev.map(acc => acc.id === editingAccount.id ? updatedAccount : acc));
      toast.success('Payment method updated successfully');
      setShowEditModal(false);
      setEditingAccount(null);
    } catch (error) {
      console.error('Error updating bank account:', error);
      toast.error('Failed to update payment method');
    } finally {
      setProcessing(false);
    }
  };

  // Calculate stats
  const stats = {
    total: bankAccounts.length,
    usd: bankAccounts.filter(acc => acc.currency === 'USD').length,
    pkr: bankAccounts.filter(acc => acc.currency === 'PKR').length,
    active: bankAccounts.filter(acc => acc.isActive).length,
    inactive: bankAccounts.filter(acc => !acc.isActive).length
  };

  if (loading) {
    return (
      <div className="space-y-6 text-white">
        <h2 className="text-2xl font-bold">Payment Methods</h2>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-400">Loading payment methods...</span>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Payment Methods</h2>
          <p className="text-gray-400 text-sm mt-1">Manage and configure available payment gateways.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadBankAccounts}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-600/50 text-white rounded-lg transition-colors"
            title="Refresh Payment Methods"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button 
            onClick={handleAddAccount}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
          >
            <Plus size={16} />
            Add Gateway
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-white">{stats.total}</div>
          <div className="text-sm text-gray-400">Total Methods</div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{stats.usd}</div>
          <div className="text-sm text-gray-400">USD Methods</div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{stats.pkr}</div>
          <div className="text-sm text-gray-400">PKR Methods</div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-500">{stats.active}</div>
          <div className="text-sm text-gray-400">Active</div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-500">{stats.inactive}</div>
          <div className="text-sm text-gray-400">Inactive</div>
        </div>
      </div>
      
      {/* Fiat On/Off-Ramp Settings */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-5">
        <h3 className="text-lg font-semibold mb-2">Fiat On/Off-Ramp Settings</h3>
        <p className="text-sm text-gray-400">Control the flow of traditional currency in and out of the platform.</p>
        {/* Placeholder for settings */}
      </div>

      {/* Bank Accounts Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-white">Bank Accounts & Payment Methods</h3>
        <div className="space-y-4">
          {bankAccounts.length === 0 ? (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
              <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-500" />
              <p className="text-gray-400 mb-4">No payment methods configured yet.</p>
              <button 
                onClick={handleAddAccount}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Add Your First Payment Method
              </button>
            </div>
          ) : (
            bankAccounts.map(account => (
              <BankAccountCard 
                key={account.id} 
                account={account}
                onEdit={handleEditAccount}
                onDelete={handleDeleteAccount}
                onToggleStatus={handleToggleStatus}
              />
            ))
          )}
        </div>
      </div>

      {/* Default Payment Gateways */}
      {/* <div>
        <h3 className="text-lg font-semibold mb-4 text-white">Default Payment Gateways</h3>
        <div className="space-y-4">
          {initialMethods.map(method => (
            <PaymentMethodCard key={method.name} method={method} />
          ))}
        </div>
      </div> */}

      {/* Add/Edit Modals */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md border border-slate-700">
            <h3 className="text-xl font-semibold mb-4 text-white">Add Payment Method</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">Currency *</label>
                  <select
                    className="w-full p-2 border border-slate-600 rounded-md bg-slate-900 text-white"
                    value={formData.currency}
                    onChange={(e) => setFormData({...formData, currency: e.target.value as Currency})}
                  >
                    <option value="USD">USD</option>
                    <option value="PKR">PKR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">Status</label>
                  <select
                    className="w-full p-2 border border-slate-600 rounded-md bg-slate-900 text-white"
                    value={formData.isActive ? 'true' : 'false'}
                    onChange={(e) => setFormData({...formData, isActive: e.target.value === 'true'})}
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">
                  {formData.currency === 'USD' ? 'Service Name *' : 'Bank/Service Name *'}
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-slate-600 rounded-md bg-slate-900 text-white"
                  placeholder={formData.currency === 'USD' ? "e.g., USDC (TRC20), PayPal" : "e.g., Meezan Bank, Easypaisa"}
                  value={formData.bankName}
                  onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                />
              </div>

              {formData.currency === 'PKR' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-300">Account Holder Name *</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-slate-600 rounded-md bg-slate-900 text-white"
                      placeholder="Full name as registered"
                      value={formData.accountHolderName}
                      onChange={(e) => setFormData({...formData, accountHolderName: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-300">Account Number *</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-slate-600 rounded-md bg-slate-900 text-white"
                      placeholder="Account number"
                      value={formData.accountNumber}
                      onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-300">IBAN (Optional)</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-slate-600 rounded-md bg-slate-900 text-white"
                      placeholder="PK81MEZN0008320107924427"
                      value={formData.iban}
                      onChange={(e) => setFormData({...formData, iban: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-300">Branch Name (Optional)</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-slate-600 rounded-md bg-slate-900 text-white"
                      placeholder="e.g., CHAKRA BRANCH RWP"
                      value={formData.branchName}
                      onChange={(e) => setFormData({...formData, branchName: e.target.value})}
                    />
                  </div>
                </>
              )}

              {formData.currency === 'USD' && (
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">Wallet Address *</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-slate-600 rounded-md bg-slate-900 text-white"
                    placeholder="Cryptocurrency wallet address or payment account"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSubmitAdd}
                  disabled={processing}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg transition-colors"
                >
                  {processing ? 'Adding...' : 'Add Method'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editingAccount && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md border border-slate-700">
            <h3 className="text-xl font-semibold mb-4 text-white">Edit Payment Method</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">Currency *</label>
                  <select
                    className="w-full p-2 border border-slate-600 rounded-md bg-slate-900 text-white"
                    value={formData.currency}
                    onChange={(e) => setFormData({...formData, currency: e.target.value as Currency})}
                  >
                    <option value="USD">USD</option>
                    <option value="PKR">PKR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">Status</label>
                  <select
                    className="w-full p-2 border border-slate-600 rounded-md bg-slate-900 text-white"
                    value={formData.isActive ? 'true' : 'false'}
                    onChange={(e) => setFormData({...formData, isActive: e.target.value === 'true'})}
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">
                  {formData.currency === 'USD' ? 'Service Name *' : 'Bank/Service Name *'}
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-slate-600 rounded-md bg-slate-900 text-white"
                  placeholder={formData.currency === 'USD' ? "e.g., USDC (TRC20), PayPal" : "e.g., Meezan Bank, Easypaisa"}
                  value={formData.bankName}
                  onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                />
              </div>

              {formData.currency === 'PKR' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-300">Account Holder Name *</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-slate-600 rounded-md bg-slate-900 text-white"
                      placeholder="Full name as registered"
                      value={formData.accountHolderName}
                      onChange={(e) => setFormData({...formData, accountHolderName: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-300">Account Number *</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-slate-600 rounded-md bg-slate-900 text-white"
                      placeholder="Account number"
                      value={formData.accountNumber}
                      onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-300">IBAN (Optional)</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-slate-600 rounded-md bg-slate-900 text-white"
                      placeholder="PK81MEZN0008320107924427"
                      value={formData.iban}
                      onChange={(e) => setFormData({...formData, iban: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-300">Branch Name (Optional)</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-slate-600 rounded-md bg-slate-900 text-white"
                      placeholder="e.g., CHAKRA BRANCH RWP"
                      value={formData.branchName}
                      onChange={(e) => setFormData({...formData, branchName: e.target.value})}
                    />
                  </div>
                </>
              )}

              {formData.currency === 'USD' && (
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">Wallet Address *</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-slate-600 rounded-md bg-slate-900 text-white"
                    placeholder="Cryptocurrency wallet address or payment account"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSubmitEdit}
                  disabled={processing}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg transition-colors"
                >
                  {processing ? 'Updating...' : 'Update Method'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodsView;
