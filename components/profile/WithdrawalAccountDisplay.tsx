import React, { useState } from 'react';
import { CreditCard, DollarSign, Building, Hash, Wallet, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { WithdrawalAccount } from '../../firebase/types/user';

interface WithdrawalAccountDisplayProps {
    withdrawalAccount?: WithdrawalAccount;
    className?: string;
}

const WithdrawalAccountDisplay = React.memo(({ withdrawalAccount, className = "" }: WithdrawalAccountDisplayProps) => {
    const [activeTab, setActiveTab] = useState<'pkr' | 'usd'>('pkr');

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

    // Don't render if no accounts
    if (!hasPkrAccount && !hasUsdAccount) {
        return null;
    }

    // If only one account exists, show it directly without tabs
    if (hasPkrAccount && !hasUsdAccount) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard size={20} />
                        Withdrawal Accounts
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                        <Building size={16} className="text-[--color-text-secondary]" />
                        <span className="text-[--color-text-secondary]">Bank:</span>
                        <span className="font-medium">{withdrawalAccount?.pkr?.bankName}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                        <Hash size={16} className="text-[--color-text-secondary]" />
                        <span className="text-[--color-text-secondary]">Account:</span>
                        <span className="font-medium">{withdrawalAccount?.pkr?.accountNumber}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                        <CreditCard size={16} className="text-[--color-text-secondary]" />
                        <span className="text-[--color-text-secondary]">Name:</span>
                        <span className="font-medium">{withdrawalAccount?.pkr?.accountName}</span>
                    </div>

                    {withdrawalAccount?.pkr?.ibanNumber && (
                        <div className="flex items-center gap-2 text-sm">
                            <Globe size={16} className="text-[--color-text-secondary]" />
                            <span className="text-[--color-text-secondary]">IBAN:</span>
                            <span className="font-medium">{withdrawalAccount.pkr.ibanNumber}</span>
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    }

    if (hasUsdAccount && !hasPkrAccount) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign size={20} />
                        Withdrawal Accounts
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                        <Wallet size={16} className="text-[--color-text-secondary]" />
                        <span className="text-[--color-text-secondary]">Service:</span>
                        <span className="font-medium">{withdrawalAccount?.usd?.serviceName}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                        <Hash size={16} className="text-[--color-text-secondary]" />
                        <span className="text-[--color-text-secondary]">Address:</span>
                        <span className="font-medium">{withdrawalAccount?.usd?.walletAddress}</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // If both accounts exist, show tabbed interface
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CreditCard size={20} />
                    Withdrawal Accounts
                </CardTitle>

                {/* Tab Navigation */}
                <div className="flex space-x-1 bg-[--color-bg-secondary] p-1 rounded-lg mt-4">
                    <button
                        onClick={() => setActiveTab('pkr')}
                        className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${activeTab === 'pkr'
                                ? 'bg-[--color-bg-primary] text-[--color-text-primary] shadow-sm'
                                : 'text-[--color-text-secondary] hover:text-[--color-text-primary]'
                            }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <CreditCard size={16} />
                            PKR Bank
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('usd')}
                        className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${activeTab === 'usd'
                                ? 'bg-[--color-bg-primary] text-[--color-text-primary] shadow-sm'
                                : 'text-[--color-text-secondary] hover:text-[--color-text-primary]'
                            }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <DollarSign size={16} />
                            USD Wallet
                        </div>
                    </button>
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                {activeTab === 'pkr' && hasPkrAccount && (
                    <>
                        <div className="flex items-center gap-2 text-sm">
                            <Building size={16} className="text-[--color-text-secondary]" />
                            <span className="text-[--color-text-secondary]">Bank:</span>
                            <span className="font-medium">{withdrawalAccount?.pkr?.bankName}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                            <Hash size={16} className="text-[--color-text-secondary]" />
                            <span className="text-[--color-text-secondary]">Account:</span>
                            <span className="font-medium">{withdrawalAccount?.pkr?.accountNumber}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                            <CreditCard size={16} className="text-[--color-text-secondary]" />
                            <span className="text-[--color-text-secondary]">Name:</span>
                            <span className="font-medium">{withdrawalAccount?.pkr?.accountName}</span>
                        </div>

                        {withdrawalAccount?.pkr?.ibanNumber && (
                            <div className="flex items-center gap-2 text-sm">
                                <Globe size={16} className="text-[--color-text-secondary]" />
                                <span className="text-[--color-text-secondary]">IBAN:</span>
                                <span className="font-medium">{withdrawalAccount.pkr.ibanNumber}</span>
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'usd' && hasUsdAccount && (
                    <>
                        <div className="flex items-center gap-2 text-sm">
                            <Wallet size={16} className="text-[--color-text-secondary]" />
                            <span className="text-[--color-text-secondary]">Service:</span>
                            <span className="font-medium">{withdrawalAccount?.usd?.serviceName}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                            <Hash size={16} className="text-[--color-text-secondary]" />
                            <span className="text-[--color-text-secondary]">Address:</span>
                            <span className="font-medium">{withdrawalAccount?.usd?.walletAddress}</span>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
});

WithdrawalAccountDisplay.displayName = 'WithdrawalAccountDisplay';

export default WithdrawalAccountDisplay;
