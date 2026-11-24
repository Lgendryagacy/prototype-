import React from 'react';
import { RefreshCw } from 'lucide-react';
import { useAdminNotifications } from '../../../contexts/AdminNotificationContext';

export const SyncIndicator: React.FC = () => {
  const { isSyncing, lastSyncTime } = useAdminNotifications();

  if (!lastSyncTime && !isSyncing) return null;

  return (
    <div className="flex items-center gap-2 text-xs text-gray-400">
      <RefreshCw 
        size={12} 
        className={`${isSyncing ? 'animate-spin text-blue-400' : ''}`} 
      />
      {isSyncing ? (
        <span className="text-blue-400">Syncing...</span>
      ) : lastSyncTime ? (
        <span>Last sync: {new Date(lastSyncTime).toLocaleTimeString()}</span>
      ) : null}
    </div>
  );
};

export default SyncIndicator;
