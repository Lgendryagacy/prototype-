# WithdrawalAccountDisplay Component

A beautifully designed, reusable React component for displaying user withdrawal accounts (PKR bank accounts and USD digital wallets) with modern UI/UX and interactive features.

## ✨ Enhanced Features

- **Modern Card Design**: Clean, rounded cards with subtle shadows and hover effects
- **Icon-Only Interface**: No labels, just meaningful icons with intuitive design
- **Copy to Clipboard**: One-click copy functionality for account numbers, IBAN, and wallet addresses
- **Smart Layout**: Content wraps naturally when it exceeds line length
- **Smooth Animations**: Tab transitions and hover effects for better user experience
- **Color-coded Tabs**: PKR (blue), USD (green) with visual indicators
- **Responsive Design**: Works perfectly in sidebars and various container sizes

## 🎨 Design Highlights

- **Card-based Items**: Each account detail in its own interactive card
- **Hover States**: Subtle background changes and copy button reveals
- **Visual Hierarchy**: Icons, content, and actions clearly organized
- **Adaptive Spacing**: Content flows naturally without forced single-line constraints
- **Micro-interactions**: Copy confirmation with check icon animation

## Usage

### Basic Usage

```tsx
import WithdrawalAccountDisplay from './components/profile/WithdrawalAccountDisplay';

// In your component
<WithdrawalAccountDisplay 
  withdrawalAccount={userProfile?.withdrawalAccount}
/>
```

### With Custom Styling

```tsx
<WithdrawalAccountDisplay 
  withdrawalAccount={userProfile?.withdrawalAccount}
  className="mb-6 shadow-lg"
/>
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `withdrawalAccount` | `WithdrawalAccount` | No | The withdrawal account object containing PKR and/or USD account details |
| `className` | `string` | No | Additional CSS classes to apply to the component |

## WithdrawalAccount Type Structure

```typescript
interface WithdrawalAccount {
  pkr?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    ibanNumber?: string;
  };
  usd?: {
    serviceName: string;
    walletAddress: string;
  };
}
```

## UI Behavior

1. **No Accounts**: Component returns `null` and doesn't render
2. **PKR Only**: Shows single card with PKR bank details
3. **USD Only**: Shows single card with USD wallet details  
4. **Both Accounts**: Shows tabbed interface allowing user to switch between PKR and USD views

## Examples

### In Profile Sidebar
```tsx
// Already implemented in ProfileSidebar.tsx
<WithdrawalAccountDisplay 
  withdrawalAccount={userProfile?.withdrawalAccount} 
/>
```

### In Dashboard
```tsx
// Example usage in a dashboard component
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div className="lg:col-span-2">
    {/* Main content */}
  </div>
  <div className="space-y-6">
    <WithdrawalAccountDisplay 
      withdrawalAccount={userProfile?.withdrawalAccount}
      className="border-l-4 border-blue-500"
    />
    {/* Other sidebar content */}
  </div>
</div>
```

### In Settings Preview
```tsx
// Show current accounts before editing
<div className="bg-gray-50 p-4 rounded-lg">
  <h3 className="text-lg font-semibold mb-4">Current Withdrawal Accounts</h3>
  <WithdrawalAccountDisplay 
    withdrawalAccount={userProfile?.withdrawalAccount}
  />
</div>
```

## Styling

The component uses CSS custom properties for theming:
- `--color-bg-primary`: Primary background color
- `--color-bg-secondary`: Secondary background color  
- `--color-text-primary`: Primary text color
- `--color-text-secondary`: Secondary text color

## Icons Used

- `CreditCard`: PKR bank accounts
- `DollarSign`: USD wallets
- `Building`: Bank name
- `Hash`: Account/wallet numbers
- `Wallet`: Service provider
- `Globe`: IBAN numbers
