import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { UserEarnings } from '../../../firebase/types/earnings';
import { updateUserEarnings } from '../../../firebase/services/earningsService';
import { toast } from 'react-hot-toast';

interface EditEarningsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserEarnings & { name: string; email: string };
  onSuccess: () => void;
}

// FormField component defined outside to prevent re-creation on every render
const FormField = ({ 
  label, 
  field, 
  value,
  onChange,
  description 
}: { 
  label: string; 
  field: string; 
  value: string;
  onChange: (field: string, value: string) => void;
  description?: string;
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-1">
      {label}
    </label>
    {description && (
      <p className="text-xs text-gray-500 mb-2">{description}</p>
    )}
    <input
      type="number"
      step="0.01"
      min="0"
      value={value}
      onChange={(e) => onChange(field, e.target.value)}
      className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

const EditEarningsModal: React.FC<EditEarningsModalProps> = ({ isOpen, onClose, user, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  
  // Store original values to calculate differences
  const [originalValues, setOriginalValues] = useState({
    adsEarnings: 0,
    referralEarnings: 0,
    taskEarnings: 0,
    bonusEarnings: 0,
    depositEarnings: 0,
    freelanceJobsEarnings: 0,
    fogslyServicesEarnings: 0,
    fogslyPhysicalEarnings: 0,
  });

  const [formData, setFormData] = useState({
    // Current balances (editable) - stored as strings to allow empty input
    adsEarnings: '0',
    referralEarnings: '0',
    taskEarnings: '0',
    bonusEarnings: '0',
    depositEarnings: '0',
    freelanceJobsEarnings: '0',
    fogslyServicesEarnings: '0',
    fogslyPhysicalEarnings: '0',
  });

  useEffect(() => {
    if (isOpen && user) {
      const initValues = {
        adsEarnings: user.adsEarnings || 0,
        referralEarnings: user.referralEarnings || 0,
        taskEarnings: user.taskEarnings || 0,
        bonusEarnings: user.bonusEarnings || 0,
        depositEarnings: user.depositEarnings || 0,
        freelanceJobsEarnings: user.freelanceJobsEarnings || 0,
        fogslyServicesEarnings: user.fogslyServicesEarnings || 0,
        fogslyPhysicalEarnings: user.fogslyPhysicalEarnings || 0,
      };
      const formValues = {
        adsEarnings: String(user.adsEarnings || 0),
        referralEarnings: String(user.referralEarnings || 0),
        taskEarnings: String(user.taskEarnings || 0),
        bonusEarnings: String(user.bonusEarnings || 0),
        depositEarnings: String(user.depositEarnings || 0),
        freelanceJobsEarnings: String(user.freelanceJobsEarnings || 0),
        fogslyServicesEarnings: String(user.fogslyServicesEarnings || 0),
        fogslyPhysicalEarnings: String(user.fogslyPhysicalEarnings || 0),
      };
      setFormData(formValues);
      setOriginalValues(initValues);
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    // Allow empty string or valid numbers >= 0
    if (value === '' || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Calculate automatic updates based on changes
  const calculateUpdates = () => {
    const updates: any = {};
    
    // Convert string values to numbers (empty strings become 0)
    const numericFormData = {
      adsEarnings: parseFloat(formData.adsEarnings) || 0,
      referralEarnings: parseFloat(formData.referralEarnings) || 0,
      taskEarnings: parseFloat(formData.taskEarnings) || 0,
      bonusEarnings: parseFloat(formData.bonusEarnings) || 0,
      depositEarnings: parseFloat(formData.depositEarnings) || 0,
      freelanceJobsEarnings: parseFloat(formData.freelanceJobsEarnings) || 0,
      fogslyServicesEarnings: parseFloat(formData.fogslyServicesEarnings) || 0,
      fogslyPhysicalEarnings: parseFloat(formData.fogslyPhysicalEarnings) || 0,
    };
    
    // Calculate differences for each source
    const adsDiff = numericFormData.adsEarnings - originalValues.adsEarnings;
    const referralDiff = numericFormData.referralEarnings - originalValues.referralEarnings;
    const taskDiff = numericFormData.taskEarnings - originalValues.taskEarnings;
    const bonusDiff = numericFormData.bonusEarnings - originalValues.bonusEarnings;
    const depositDiff = numericFormData.depositEarnings - originalValues.depositEarnings;
    const freelanceDiff = numericFormData.freelanceJobsEarnings - originalValues.freelanceJobsEarnings;
    const servicesDiff = numericFormData.fogslyServicesEarnings - originalValues.fogslyServicesEarnings;
    const physicalDiff = numericFormData.fogslyPhysicalEarnings - originalValues.fogslyPhysicalEarnings;
    
    // Total change in available balance
    const totalDiff = adsDiff + referralDiff + taskDiff + bonusDiff + depositDiff + freelanceDiff + servicesDiff + physicalDiff;
    
    // Update current balances
    updates.adsEarnings = numericFormData.adsEarnings;
    updates.referralEarnings = numericFormData.referralEarnings;
    updates.taskEarnings = numericFormData.taskEarnings;
    updates.bonusEarnings = numericFormData.bonusEarnings;
    updates.depositEarnings = numericFormData.depositEarnings;
    updates.freelanceJobsEarnings = numericFormData.freelanceJobsEarnings;
    updates.fogslyServicesEarnings = numericFormData.fogslyServicesEarnings;
    updates.fogslyPhysicalEarnings = numericFormData.fogslyPhysicalEarnings;
    
    // Update available balance
    updates.availableBalance = (user.availableBalance || 0) + totalDiff;
    
    // Update lifetime totals (only if increased)
    if (adsDiff > 0) {
      updates.totalAdsEarnings = (user.totalAdsEarnings || 0) + adsDiff;
    }
    if (referralDiff > 0) {
      updates.totalReferralEarnings = (user.totalReferralEarnings || 0) + referralDiff;
    }
    if (taskDiff > 0) {
      updates.totalTaskEarnings = (user.totalTaskEarnings || 0) + taskDiff;
    }
    if (bonusDiff > 0) {
      updates.totalBonusEarnings = (user.totalBonusEarnings || 0) + bonusDiff;
    }
    if (depositDiff > 0) {
      updates.totalDepositEarnings = (user.totalDepositEarnings || 0) + depositDiff;
    }
    if (freelanceDiff > 0) {
      updates.totalFreelanceJobsEarnings = (user.totalFreelanceJobsEarnings || 0) + freelanceDiff;
    }
    if (servicesDiff > 0) {
      updates.totalFogslyServicesEarnings = (user.totalFogslyServicesEarnings || 0) + servicesDiff;
    }
    if (physicalDiff > 0) {
      updates.totalFogslyPhysicalEarnings = (user.totalFogslyPhysicalEarnings || 0) + physicalDiff;
    }
    
    // Calculate new lifetime earnings
    const currentLifetime = user.lifetimeEarnings || 0;
    const lifetimeIncrease = Math.max(0,
      (adsDiff > 0 ? adsDiff : 0) +
      (referralDiff > 0 ? referralDiff : 0) +
      (taskDiff > 0 ? taskDiff : 0) +
      (bonusDiff > 0 ? bonusDiff : 0) +
      (depositDiff > 0 ? depositDiff : 0) +
      (freelanceDiff > 0 ? freelanceDiff : 0) +
      (servicesDiff > 0 ? servicesDiff : 0) +
      (physicalDiff > 0 ? physicalDiff : 0)
    );
    
    updates.lifetimeEarnings = currentLifetime + lifetimeIncrease;
    
    return updates;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const updates = calculateUpdates();
    
    // Validation
    if (updates.availableBalance < 0) {
      toast.error('Changes would result in negative available balance. Please adjust values.');
      return;
    }

    try {
      setLoading(true);
      await updateUserEarnings(user.userId, updates);
      toast.success('User earnings updated successfully');
      onSuccess();
    } catch (error) {
      console.error('Error updating user earnings:', error);
      toast.error('Failed to update user earnings');
    } finally {
      setLoading(false);
    }
  };

  // Calculate preview values
  const previewUpdates = calculateUpdates();
  const hasChanges = Object.keys(formData).some(
    key => (parseFloat(formData[key as keyof typeof formData]) || 0) !== originalValues[key as keyof typeof originalValues]
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Save className="w-6 h-6 text-green-400" />
              Edit User Earnings
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

        {/* Warning Banner */}
        <div className="mx-6 mt-6 bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-200">
            <p className="font-semibold mb-1">Automatic Calculation</p>
            <p>When you change earning source values, the system will automatically update:</p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>Available Balance (increases/decreases by the change amount)</li>
              <li>Lifetime Totals (only increases, never decreases)</li>
              <li>Overall Lifetime Earnings</li>
            </ul>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Current Source Balances */}
          <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Edit Current Source Balances</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Ads Earnings" field="adsEarnings" value={formData.adsEarnings} onChange={handleInputChange} />
              <FormField label="Freelance Jobs Earnings" field="freelanceJobsEarnings" value={formData.freelanceJobsEarnings} onChange={handleInputChange} />
              <FormField label="Fogsly Services Earnings" field="fogslyServicesEarnings" value={formData.fogslyServicesEarnings} onChange={handleInputChange} />
              <FormField label="Referral Earnings" field="referralEarnings" value={formData.referralEarnings} onChange={handleInputChange} />
              <FormField label="Task Earnings" field="taskEarnings" value={formData.taskEarnings} onChange={handleInputChange} />
              <FormField label="Bonus Earnings" field="bonusEarnings" value={formData.bonusEarnings} onChange={handleInputChange} />
              <FormField label="Deposit Earnings" field="depositEarnings" value={formData.depositEarnings} onChange={handleInputChange} />
              <FormField label="Physical Products Earnings" field="fogslyPhysicalEarnings" value={formData.fogslyPhysicalEarnings} onChange={handleInputChange} />
            </div>
          </div>

          {/* Preview of Changes */}
          {hasChanges && (
            <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Preview of Automatic Updates
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-300">Current Available Balance:</span>
                  <span className="text-white font-medium">{(user.availableBalance || 0).toFixed(2)} FOG</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-300">New Available Balance:</span>
                  <span className={`font-semibold ${
                    previewUpdates.availableBalance > (user.availableBalance || 0) ? 'text-green-400' :
                    previewUpdates.availableBalance < (user.availableBalance || 0) ? 'text-red-400' :
                    'text-white'
                  }`}>
                    {(previewUpdates.availableBalance || 0).toFixed(2)} FOG
                    {previewUpdates.availableBalance !== (user.availableBalance || 0) && (
                      <span className="ml-2 text-xs">
                        ({previewUpdates.availableBalance > (user.availableBalance || 0) ? '+' : ''}
                        {((previewUpdates.availableBalance || 0) - (user.availableBalance || 0)).toFixed(2)})
                      </span>
                    )}
                  </span>
                </div>
                
                <div className="h-px bg-slate-600 my-2"></div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-300">Current Lifetime Earnings:</span>
                  <span className="text-white font-medium">{(user.lifetimeEarnings || 0).toFixed(2)} FOG</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-300">New Lifetime Earnings:</span>
                  <span className={`font-semibold ${
                    previewUpdates.lifetimeEarnings > (user.lifetimeEarnings || 0) ? 'text-green-400' : 'text-white'
                  }`}>
                    {(previewUpdates.lifetimeEarnings || 0).toFixed(2)} FOG
                    {previewUpdates.lifetimeEarnings !== (user.lifetimeEarnings || 0) && (
                      <span className="ml-2 text-xs">
                        (+{((previewUpdates.lifetimeEarnings || 0) - (user.lifetimeEarnings || 0)).toFixed(2)})
                      </span>
                    )}
                  </span>
                </div>
                
                {previewUpdates.availableBalance < 0 && (
                  <div className="mt-3 p-3 bg-red-900/20 border border-red-700/50 rounded-lg">
                    <p className="text-red-400 text-sm font-medium">
                      ⚠️ Warning: This change would result in a negative balance!
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-700/50 text-white rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !hasChanges}
              className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  {hasChanges ? 'Save Changes' : 'No Changes'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEarningsModal;
