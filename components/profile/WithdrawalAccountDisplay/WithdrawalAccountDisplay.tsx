import React, { useState } from 'react';
import { CreditCard, DollarSign, Building, Hash, Wallet, Globe, Copy, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card';
import { WithdrawalAccount } from '../../../firebase/types/user';

interface WithdrawalAccountDisplayProps {
  withdrawalAccount?: WithdrawalAccount;
  className?: string;
}

const WithdrawalAccountDisplay = React.memo(({ withdrawalAccount, className = "" }: WithdrawalAccountDisplayProps) => {
  const [activeTab, setActiveTab] = useState<'pkr' | 'usd'>('pkr');
  const [copiedField, setCopiedField] = useState<string>('');

  // Check if accounts exist
  const hasPkrAccount = withdrawalAccount?.pkr && (
    withdrawalAccount.pkr.accountName || 
    withdrawalAccount.pkr.accountNumber || 
    withdrawalAccount.pkr.bankName
  );

  const hasUsdAccount = withdrawalAccount?.usd && (
    withdrawalAccount.usd.serviceName || 
    withdrawalAccount.usd.walletAddress
  );

  // Copy to clipboard function
  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(''), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Don't render if no accounts
  if (!hasPkrAccount && !hasUsdAccount) {
    return null;
  }

  // Account info item component
  const AccountInfoItem = ({ icon: Icon, value, copyable = false, fieldKey = '' }: { 
    icon: any, 
    value: string, 
    copyable?: boolean,
    fieldKey?: string 
  }) => (
    <div className="group relative flex items-center gap-3 p-3 rounded-lg bg-[--color-bg-secondary]/50 hover:bg-[--color-bg-secondary] transition-all duration-200">
      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-[--color-primary]/10 text-[--color-primary]">
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[--color-text-primary] break-words">{value}</p>
      </div>
      {copyable && (
        <button
          onClick={() => copyToClipboard(value, fieldKey)}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 rounded-md hover:bg-[--color-bg-primary] text-[--color-text-secondary] hover:text-[--color-text-primary]"
          title="Copy to clipboard"
        >
          {copiedField === fieldKey ? (
            <Check size={14} className="text-green-500" />
          ) : (
            <Copy size={14} />
          )}
        </button>
      )}
    </div>
  );

  // If only one account exists, show it directly without tabs
  if (hasPkrAccount && !hasUsdAccount) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center">
              <CreditCard size={14} className="text-blue-600" />
            </div>
            PKR Bank Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <AccountInfoItem 
            icon={Building} 
            value={withdrawalAccount?.pkr?.bankName || ''} 
          />
          
          <AccountInfoItem 
            icon={Hash} 
            value={withdrawalAccount?.pkr?.accountNumber || ''} 
            copyable={true}
            fieldKey="pkr-account"
          />
          
          <AccountInfoItem 
            icon={CreditCard} 
            value={withdrawalAccount?.pkr?.accountName || ''} 
          />
          
          {withdrawalAccount?.pkr?.ibanNumber && (
            <AccountInfoItem 
              icon={Globe} 
              value={withdrawalAccount.pkr.ibanNumber} 
              copyable={true}
              fieldKey="pkr-iban"
            />
          )}
        </CardContent>
      </Card>
    );
  }

  if (hasUsdAccount && !hasPkrAccount) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="w-6 h-6 rounded-lg bg-green-100 flex items-center justify-center">
              <DollarSign size={14} className="text-green-600" />
            </div>
            USD Digital Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <AccountInfoItem 
            icon={Wallet} 
            value={withdrawalAccount?.usd?.serviceName || ''} 
          />
          
          <AccountInfoItem 
            icon={Hash} 
            value={withdrawalAccount?.usd?.walletAddress || ''} 
            copyable={true}
            fieldKey="usd-wallet"
          />
        </CardContent>
      </Card>
    );
  }

  // If both accounts exist, show tabbed interface
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="w-6 h-6 rounded-lg bg-purple-100 flex items-center justify-center">
            <CreditCard size={14} className="text-purple-600" />
          </div>
          Payment Accounts
        </CardTitle>
        
        {/* Enhanced Tab Navigation */}
        <div className="flex space-x-1 bg-[--color-bg-secondary] p-1 rounded-xl mt-4">
          <button
            onClick={() => setActiveTab('pkr')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'pkr'
                ? 'bg-[--color-bg-primary] text-[--color-text-primary] shadow-sm scale-[0.98]'
                : 'text-[--color-text-secondary] hover:text-[--color-text-primary] hover:bg-[--color-bg-primary]/50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-100 flex items-center justify-center">
                <CreditCard size={10} className="text-blue-600" />
              </div>
              PKR
            </div>
          </button>
          <button
            onClick={() => setActiveTab('usd')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'usd'
                ? 'bg-[--color-bg-primary] text-[--color-text-primary] shadow-sm scale-[0.98]'
                : 'text-[--color-text-secondary] hover:text-[--color-text-primary] hover:bg-[--color-bg-primary]/50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 rounded bg-green-100 flex items-center justify-center">
                <DollarSign size={10} className="text-green-600" />
              </div>
              USD
            </div>
          </button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {activeTab === 'pkr' && hasPkrAccount && (
          <div className="space-y-3 animate-in slide-in-from-left-1 duration-200">
            <AccountInfoItem 
              icon={Building} 
              value={withdrawalAccount?.pkr?.bankName || ''} 
            />
            
            <AccountInfoItem 
              icon={Hash} 
              value={withdrawalAccount?.pkr?.accountNumber || ''} 
              copyable={true}
              fieldKey="pkr-account-tab"
            />
            
            <AccountInfoItem 
              icon={CreditCard} 
              value={withdrawalAccount?.pkr?.accountName || ''} 
            />
            
            {withdrawalAccount?.pkr?.ibanNumber && (
              <AccountInfoItem 
                icon={Globe} 
                value={withdrawalAccount.pkr.ibanNumber} 
                copyable={true}
                fieldKey="pkr-iban-tab"
              />
            )}
          </div>
        )}

        {activeTab === 'usd' && hasUsdAccount && (
          <div className="space-y-3 animate-in slide-in-from-right-1 duration-200">
            <AccountInfoItem 
              icon={Wallet} 
              value={withdrawalAccount?.usd?.serviceName || ''} 
            />
            
            <AccountInfoItem 
              icon={Hash} 
              value={withdrawalAccount?.usd?.walletAddress || ''} 
              copyable={true}
              fieldKey="usd-wallet-tab"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
});

WithdrawalAccountDisplay.displayName = 'WithdrawalAccountDisplay';

export default WithdrawalAccountDisplay;
