import React, { useState, useCallback } from 'react';
import { User, Settings, Linkedin, Edit, Edit2, CreditCard} from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Label } from '../../ui/Label';
import { Textarea } from '../../ui/Textarea';
import { User as FirebaseUser, UserProfile } from '../../../firebase/types/user';
import { EditForm, ProfileActions } from '../types';
import { scrollToTop } from '../../../utils/navigationUtils';

// Validation state interface
interface ValidationState {
  [key: string]: {
    touched: boolean;
    error: string;
  };
}

// Validation rules for required fields
const validateField = (fieldName: string, value: string): string => {
  const requiredFields = ['name', 'phone', 'country', 'city'];
  const pkrRequiredFields = ['pkrAccountName', 'pkrAccountNumber', 'pkrBankName'];
  const usdRequiredFields = ['usdServiceName', 'usdWalletAddress'];

  if (requiredFields.includes(fieldName) || pkrRequiredFields.includes(fieldName) || usdRequiredFields.includes(fieldName)) {
    if (!value || value.trim() === '') {
      switch (fieldName) {
        case 'name':
          return 'Full name is required';
        case 'phone':
          return 'Phone number is required';
        case 'country':
          return 'Country is required';
        case 'city':
          return 'City is required';
        case 'pkrAccountName':
          return 'PKR account name is required';
        case 'pkrAccountNumber':
          return 'PKR account number is required';
        case 'pkrBankName':
          return 'PKR bank name is required';
        case 'usdServiceName':
          return 'USD service name is required';
        case 'usdWalletAddress':
          return 'USD wallet address is required';
        default:
          return 'This field is required';
      }
    }
  }

  // IBAN validation (optional but if provided should be valid format)
  if (fieldName === 'pkrIbanNumber' && value && value.trim() !== '') {
    // Basic IBAN format validation (should start with 2 letters followed by 2 digits)
    const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{4,30}$/;
    if (!ibanRegex.test(value.replace(/\s/g, '').toUpperCase())) {
      return 'Please enter a valid IBAN number';
    }
  }

  return '';
};

// Enhanced input component with validation
const MemoizedInput = React.memo(({
  id,
  label,
  value,
  onChange,
  disabled,
  placeholder,
  isRequired = false,
  validationError,
  onBlur
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  placeholder?: string;
  isRequired?: boolean;
  validationError?: string;
  onBlur?: () => void;
}) => (
  <div className="space-y-1">
    <Label htmlFor={id}>{label}</Label>
    <Input
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      disabled={disabled}
      placeholder={placeholder}
      className={validationError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
    />
    {validationError && (
      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
        <span className="w-4 h-4 text-red-500">⚠</span>
        {validationError}
      </p>
    )}
  </div>
));

const MemoizedTextarea = React.memo(({ id, label, value, onChange, disabled, placeholder }: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  placeholder?: string;
}) => (
  <div className="space-y-1 sm:col-span-2">
    <Label htmlFor={id}>{label}</Label>
    <Textarea
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder={placeholder}
      rows={4}
    />
  </div>
));

MemoizedInput.displayName = 'MemoizedInput';
MemoizedTextarea.displayName = 'MemoizedTextarea';

// SettingsSection component
const SettingsSection = React.memo(({ title, icon: Icon, children }: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) => (
  <div>
    <div className="flex items-center mb-4">
      <Icon className="w-5 h-5 mr-3 text-[--color-primary]" />
      <h3 className="text-lg font-semibold text-[--color-text-primary]">{title}</h3>
    </div>
    <div className="pl-8 border-l-2 border-[--color-border]">
      {children}
    </div>
  </div>
));

SettingsSection.displayName = 'SettingsSection';

interface SettingsTabProps {
  editForm: EditForm;
  isEditing: boolean;
  isSaving: boolean;
  newSkill: string;
  userProfile: UserProfile | null;
  currentUser: FirebaseUser | null;
  actions: ProfileActions;
}

const SettingsTab = React.memo(({
  editForm,
  isEditing,
  isSaving,
  newSkill,
  userProfile,
  currentUser,
  actions
}: SettingsTabProps) => {
  // Validation state
  const [validation, setValidation] = useState<ValidationState>({});
  // Currency tab state
  const [activeCurrency, setActiveCurrency] = useState<'PKR' | 'USD'>('PKR');

  // Handle field blur for validation
  const handleFieldBlur = useCallback((fieldName: string, value: string) => {
    const error = validateField(fieldName, value);
    setValidation(prev => ({
      ...prev,
      [fieldName]: {
        touched: true,
        error
      }
    }));
  }, []);

  // Enhanced save function with validation
  const handleSaveWithValidation = useCallback(async () => {
    const requiredFields = ['name', 'phone', 'country', 'city'];
    
    // Check if user has entered any PKR or USD data
    const hasPkrData = editForm.withdrawalAccount?.pkr?.accountName || 
                      editForm.withdrawalAccount?.pkr?.accountNumber || 
                      editForm.withdrawalAccount?.pkr?.bankName;
    
    const hasUsdData = editForm.withdrawalAccount?.usd?.serviceName || 
                      editForm.withdrawalAccount?.usd?.walletAddress;
    
    const pkrRequiredFields = hasPkrData ? ['pkrAccountName', 'pkrAccountNumber', 'pkrBankName'] : [];
    const usdRequiredFields = hasUsdData ? ['usdServiceName', 'usdWalletAddress'] : [];
    const allRequiredFields = [...requiredFields, ...pkrRequiredFields, ...usdRequiredFields];
    
    const newValidation: ValidationState = {};
    let hasErrors = false;

    // Check all required fields
    requiredFields.forEach(field => {
      const value = editForm[field as keyof EditForm] as string || '';
      const error = validateField(field, value);

      newValidation[field] = {
        touched: true,
        error
      };

      if (error) {
        hasErrors = true;
      }
    });

    // Check PKR fields if any PKR data is provided
    if (hasPkrData) {
      pkrRequiredFields.forEach(field => {
        let value = '';
        switch (field) {
          case 'pkrAccountName':
            value = editForm.withdrawalAccount?.pkr?.accountName || '';
            break;
          case 'pkrAccountNumber':
            value = editForm.withdrawalAccount?.pkr?.accountNumber || '';
            break;
          case 'pkrBankName':
            value = editForm.withdrawalAccount?.pkr?.bankName || '';
            break;
        }
        
        const error = validateField(field, value);
        newValidation[field] = {
          touched: true,
          error
        };

        if (error) {
          hasErrors = true;
        }
      });

      // Validate PKR IBAN if provided
      if (editForm.withdrawalAccount?.pkr?.ibanNumber) {
        const ibanError = validateField('pkrIbanNumber', editForm.withdrawalAccount.pkr.ibanNumber);
        newValidation.pkrIbanNumber = {
          touched: true,
          error: ibanError
        };
        if (ibanError) {
          hasErrors = true;
        }
      }
    }

    // Check USD fields if any USD data is provided
    if (hasUsdData) {
      usdRequiredFields.forEach(field => {
        let value = '';
        switch (field) {
          case 'usdServiceName':
            value = editForm.withdrawalAccount?.usd?.serviceName || '';
            break;
          case 'usdWalletAddress':
            value = editForm.withdrawalAccount?.usd?.walletAddress || '';
            break;
        }
        
        const error = validateField(field, value);
        newValidation[field] = {
          touched: true,
          error
        };

        if (error) {
          hasErrors = true;
        }
      });
    }

    setValidation(newValidation);

    // Only proceed with save if no validation errors
    if (!hasErrors) {
      try {
        await actions.handleSaveProfile();
        
        // Show success toast
        toast.success('Profile updated successfully! 🎉', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        
        // Scroll to top of the page
        scrollToTop();
        
      } catch (error) {
        // Show error toast
        toast.error('Failed to update profile. Please try again.', {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } else {
      // Scroll to first error field
      const firstErrorField = allRequiredFields.find(field => newValidation[field]?.error);
      if (firstErrorField) {
        const element = document.getElementById(firstErrorField);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element?.focus();
      }
    }
  }, [editForm, actions]);

  // Clear validation when editing is disabled
  React.useEffect(() => {
    if (!isEditing) {
      setValidation({});
    }
  }, [isEditing]);

  return (
    <div className="space-y-8">

      <SettingsSection title="Profile Information" icon={User}>
        <div className="flex justify-end relative">
          <Button
            variant="ghost"
            className="absolute bottom-3 right-4 bg-black hover:bg-black/40 text-white backdrop-blur-sm rounded-full"
            onClick={() => actions.setIsEditing(true)}
            disabled={isEditing || isSaving}
          > <Edit2 className="w-4 h-4" />
          </Button>

        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MemoizedInput
            id="name"
            label="Full Name *"
            value={editForm.name || ''}
            onChange={(value) => actions.handleFormChange('name', value)}
            disabled={!isEditing}
            isRequired={true}
            validationError={validation.name?.touched ? validation.name.error : ''}
            onBlur={() => handleFieldBlur('name', editForm.name || '')}
          />
          <MemoizedInput
            id="email"
            label="Email"
            value={userProfile?.email || currentUser?.email || ''}
            onChange={() => { }} // Email is read-only
            disabled={true}
          />
          <MemoizedInput
            id="role"
            label="Title"
            value={editForm.role || ''}
            onChange={(value) => actions.handleFormChange('role', value)}
            disabled={!isEditing}
            placeholder="e.g., Software Developer"
          />
          <MemoizedInput
            id="phone"
            label="Phone Number *"
            value={editForm.phone || ''}
            onChange={(value) => actions.handleFormChange('phone', value)}
            disabled={!isEditing}
            placeholder="e.g., +92 300 1234567"
            isRequired={true}
            validationError={validation.phone?.touched ? validation.phone.error : ''}
            onBlur={() => handleFieldBlur('phone', editForm.phone || '')}
          />
          <MemoizedInput
            id="city"
            label="City *"
            value={editForm.city || ''}
            onChange={(value) => actions.handleFormChange('city', value)}
            disabled={!isEditing}
            placeholder="e.g., Lahore"
            isRequired={true}
            validationError={validation.city?.touched ? validation.city.error : ''}
            onBlur={() => handleFieldBlur('city', editForm.city || '')}
          />
          <MemoizedInput
            id="country"
            label="Country *"
            value={editForm.country || ''}
            onChange={(value) => actions.handleFormChange('country', value)}
            disabled={!isEditing}
            placeholder="e.g., Pakistan"
            isRequired={true}
            validationError={validation.country?.touched ? validation.country.error : ''}
            onBlur={() => handleFieldBlur('country', editForm.country || '')}
          />
          <MemoizedTextarea
            id="bio"
            label="About / Bio"
            value={editForm.bio || ''}
            onChange={(value) => actions.handleFormChange('bio', value)}
            disabled={!isEditing}
            placeholder="Tell us about yourself..."
          />
        </div>
      </SettingsSection>

      <SettingsSection title="Skills" icon={Settings}>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {editForm.skills.map((skill: string, index: number) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-[--color-primary]/10 text-[--color-primary]"
              >
                {skill}
                {isEditing && (
                  <button
                    onClick={() => actions.handleSkillRemove(skill)}
                    className="ml-1 text-[--color-primary] hover:text-red-500 transition-colors"
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
          {isEditing && (
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => actions.setNewSkill(e.target.value)}
                placeholder="Add a skill"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    actions.handleSkillAdd(newSkill);
                    actions.setNewSkill('');
                  }
                }}
              />
              <Button
                variant="outline"
                onClick={() => {
                  actions.handleSkillAdd(newSkill);
                  actions.setNewSkill('');
                }}
              >
                Add
              </Button>
            </div>
          )}
        </div>
      </SettingsSection>

      <SettingsSection title="Social Links" icon={Linkedin}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MemoizedInput
            id="linkedin"
            label="LinkedIn"
            value={editForm.social?.linkedin || ''}
            onChange={(value) => actions.handleSocialChange('linkedin', value)}
            disabled={!isEditing}
            placeholder="https://linkedin.com/in/username"
          />
          <MemoizedInput
            id="facebook"
            label="Facebook"
            value={editForm.social?.facebook || ''}
            onChange={(value) => actions.handleSocialChange('facebook', value)}
            disabled={!isEditing}
            placeholder="https://facebook.com/username"
          />
          <MemoizedInput
            id="instagram"
            label="Instagram"
            value={editForm.social?.instagram || ''}
            onChange={(value) => actions.handleSocialChange('instagram', value)}
            disabled={!isEditing}
            placeholder="https://instagram.com/username"
          />
          <MemoizedInput
            id="tiktok"
            label="TikTok"
            value={editForm.social?.tiktok || ''}
            onChange={(value) => actions.handleSocialChange('tiktok', value)}
            disabled={!isEditing}
            placeholder="https://tiktok.com/@username"
          />
        </div>
      </SettingsSection>

      <SettingsSection title="Withdrawal Account" icon={CreditCard}>
        <div className="space-y-6">
          <p className="text-sm text-[--color-text-secondary]">
            Add your payment method details for withdrawal. You can add one PKR account and one USD account.
          </p>
          
          {/* Currency Tabs */}
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
            <button
              type="button"
              onClick={() => setActiveCurrency('PKR')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                activeCurrency === 'PKR'
                  ? 'bg-white dark:bg-gray-700 text-[--color-primary] shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
              disabled={!isEditing}
            >
              PKR Account
            </button>
            <button
              type="button"
              onClick={() => setActiveCurrency('USD')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                activeCurrency === 'USD'
                  ? 'bg-white dark:bg-gray-700 text-[--color-primary] shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
              disabled={!isEditing}
            >
              USD Account
            </button>
          </div>

          {/* PKR Account Fields */}
          {activeCurrency === 'PKR' && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-[--color-text-primary] flex items-center gap-2">
                🏦 PKR Bank Account Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MemoizedInput
                  id="pkr-accountName"
                  label="Account Name *"
                  value={editForm.withdrawalAccount?.pkr?.accountName || ''}
                  onChange={(value) => actions.handleWithdrawalAccountChange('pkr', 'accountName', value)}
                  disabled={!isEditing}
                  placeholder="Account holder's full name"
                  isRequired={true}
                  validationError={validation.pkrAccountName?.touched ? validation.pkrAccountName.error : ''}
                  onBlur={() => handleFieldBlur('pkrAccountName', editForm.withdrawalAccount?.pkr?.accountName || '')}
                />
                <MemoizedInput
                  id="pkr-accountNumber"
                  label="Account Number *"
                  value={editForm.withdrawalAccount?.pkr?.accountNumber || ''}
                  onChange={(value) => actions.handleWithdrawalAccountChange('pkr', 'accountNumber', value)}
                  disabled={!isEditing}
                  placeholder="e.g., 1234567890123456"
                  isRequired={true}
                  validationError={validation.pkrAccountNumber?.touched ? validation.pkrAccountNumber.error : ''}
                  onBlur={() => handleFieldBlur('pkrAccountNumber', editForm.withdrawalAccount?.pkr?.accountNumber || '')}
                />
                <MemoizedInput
                  id="pkr-bankName"
                  label="Bank Name *"
                  value={editForm.withdrawalAccount?.pkr?.bankName || ''}
                  onChange={(value) => actions.handleWithdrawalAccountChange('pkr', 'bankName', value)}
                  disabled={!isEditing}
                  placeholder="e.g., jazzCash/easyPaisa, Bank Account"
                  isRequired={true}
                  validationError={validation.pkrBankName?.touched ? validation.pkrBankName.error : ''}
                  onBlur={() => handleFieldBlur('pkrBankName', editForm.withdrawalAccount?.pkr?.bankName || '')}
                />
                <MemoizedInput
                  id="pkr-ibanNumber"
                  label="IBAN Number (Optional)"
                  value={editForm.withdrawalAccount?.pkr?.ibanNumber || ''}
                  onChange={(value) => actions.handleWithdrawalAccountChange('pkr', 'ibanNumber', value)}
                  disabled={!isEditing}
                  placeholder="e.g., 030000..."
                  validationError={validation.pkrIbanNumber?.touched ? validation.pkrIbanNumber.error : ''}
                  onBlur={() => handleFieldBlur('pkrIbanNumber', editForm.withdrawalAccount?.pkr?.ibanNumber || '')}
                />
              </div>
            </div>
          )}

          {/* USD Account Fields */}
          {activeCurrency === 'USD' && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-[--color-text-primary] flex items-center gap-2">
                💰 USD Crypto/Digital Wallet Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MemoizedInput
                  id="usd-serviceName"
                  label="Service Name *"
                  value={editForm.withdrawalAccount?.usd?.serviceName || ''}
                  onChange={(value) => actions.handleWithdrawalAccountChange('usd', 'serviceName', value)}
                  disabled={!isEditing}
                  placeholder="e.g., USDT TRC20, Binance USD"
                  isRequired={true}
                  validationError={validation.usdServiceName?.touched ? validation.usdServiceName.error : ''}
                  onBlur={() => handleFieldBlur('usdServiceName', editForm.withdrawalAccount?.usd?.serviceName || '')}
                />
                <MemoizedInput
                  id="usd-walletAddress"
                  label="Wallet Address *"
                  value={editForm.withdrawalAccount?.usd?.walletAddress || ''}
                  onChange={(value) => actions.handleWithdrawalAccountChange('usd', 'walletAddress', value)}
                  disabled={!isEditing}
                  placeholder="e.g., TXYZabc123... "
                  isRequired={true}
                  validationError={validation.usdWalletAddress?.touched ? validation.usdWalletAddress.error : ''}
                  onBlur={() => handleFieldBlur('usdWalletAddress', editForm.withdrawalAccount?.usd?.walletAddress || '')}
                />
              </div>
            </div>
          )}
        </div>
      </SettingsSection>

      {isEditing ? (
        <div className="space-y-4">
          {/* Validation Summary */}
          {/* {Object.values(validation).some(v => v.touched && v.error) && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-800 dark:text-red-200 mb-2">
                <span className="w-5 h-5">⚠</span>
                <h4 className="font-medium">Please fix the following errors:</h4>
              </div>
              <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300 space-y-1">
                {Object.entries(validation)
                  .filter(([_, v]) => v.touched && v.error)
                  .map(([field, v]) => (
                    <li key={field}>{v.error}</li>
                  ))}
              </ul>
            </div>
          )} */}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={actions.handleCancelEdit}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveWithValidation}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex justify-end">
          <Button onClick={() => actions.setIsEditing(true)}>
            Edit Profile
          </Button>
        </div>
      )}
    </div>
  );
});

SettingsTab.displayName = 'SettingsTab';

export default SettingsTab;
