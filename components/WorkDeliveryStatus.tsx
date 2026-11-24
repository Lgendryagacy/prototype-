import React from 'react';
import {
  Package,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  FileText,
  Download,
  ExternalLink
} from 'lucide-react';
import { WorkDelivery, DeliveryStatus } from '../../firebase/types/workDelivery';
import { Button } from './ui/Button';

interface WorkDeliveryStatusProps {
  delivery: WorkDelivery;
  userType: 'client' | 'freelancer';
  onRequestModification?: () => void;
  onAcceptWork?: () => void;
  onRedelivery?: () => void;
  onViewDelivery?: () => void;
}

export default function WorkDeliveryStatus({
  delivery,
  userType,
  onRequestModification,
  onAcceptWork,
  onRedelivery,
  onViewDelivery
}: WorkDeliveryStatusProps) {

  // Get status configuration
  const getStatusConfig = (status: DeliveryStatus) => {
    switch (status) {
      case 'delivered':
        return {
          icon: Package,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          label: 'Work Delivered',
          description: 'Waiting for client review'
        };
      case 'modification_requested':
        return {
          icon: AlertTriangle,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          label: 'Modification Requested',
          description: 'Client has requested changes'
        };
      case 're_delivered':
        return {
          icon: RefreshCw,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          label: 'Work Re-delivered',
          description: 'Updated work submitted for review'
        };
      case 'accepted':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          label: 'Work Accepted',
          description: 'Client has accepted the delivery'
        };
      case 'rejected':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          label: 'Work Rejected',
          description: 'Delivery was not accepted'
        };
      default:
        return {
          icon: Clock,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          label: 'Unknown Status',
          description: ''
        };
    }
  };

  const statusConfig = getStatusConfig(delivery.status);
  const StatusIcon = statusConfig.icon;

  // Format time ago
  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInHours < 1) return 'Less than an hour ago';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    if (diffInDays < 7) return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  // Check if client can take actions
  const canClientTakeActions = userType === 'client' && (delivery.status === 'delivered' || delivery.status === 're_delivered');

  // Check if freelancer can re-deliver
  const canFreelancerRedelivery = userType === 'freelancer' &&
    delivery.status === 'modification_requested' &&
    delivery.modificationCount < 5;

  return (
    <div className="max-w-5xl w-full rounded-xl border-2 bg-[--color-bg-secondary] p-6 shadow-sm transition-all duration-200 hover:shadow-md" style={{ borderColor: statusConfig.color.replace('text-', '') }}>
      {/* Status Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-full bg-[--color-bg-tertiary] ring-2 ring-offset-2 ring-offset-[--color-bg-secondary]" style={{ ringColor: statusConfig.color.replace('text-', '') }}>
            <StatusIcon className="w-6 h-6" style={{ color: statusConfig.color.replace('text-', '') }} />
          </div>
          <div>
            <h3 className="text-lg font-bold" style={{ color: statusConfig.color.replace('text-', '') }}>
              {statusConfig.label}
            </h3>
            <p className="text-sm text-[--color-text-secondary]">
              {statusConfig.description}
            </p>
          </div>
        </div>
        <span className="text-xs font-medium text-[--color-text-secondary] bg-[--color-bg-primary] px-3 py-1 rounded-full">
          {formatTimeAgo(delivery.deliveredAt)}
        </span>
      </div>

      {/* Delivery Info */}
      <div className="mb-4 space-y-3">
        {/* Description */}
        <div className="bg-[--color-bg-primary] p-4 rounded-lg border border-[--color-border]">
          <p className="text-xs font-semibold text-[--color-text-secondary] uppercase tracking-wide mb-2">Description</p>
          <p className="text-sm text-[--color-text-primary] leading-relaxed">{delivery.description}</p>
        </div>

        {/* Files */}
        {delivery.files.length > 0 && (
          <div className="bg-[--color-bg-primary] p-4 rounded-lg border border-[--color-border]">
            <p className="text-xs font-semibold text-[--color-text-secondary] uppercase tracking-wide mb-3">Attached Files</p>
            <div className="space-y-2">
              {delivery.files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-[--color-bg-secondary] rounded-lg border border-[--color-border] hover:bg-[--color-bg-tertiary] transition-colors group">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <FileText className="w-5 h-5 text-[--color-primary] flex-shrink-0" />
                    <span className="text-sm text-[--color-text-primary] truncate">{file.name}</span>
                  </div>
                  <button
                    onClick={() => window.open(file.url, '_blank')}
                    className="p-2 text-[--color-primary] hover:bg-[--color-bg-primary] rounded-lg transition-colors flex-shrink-0 ml-2"
                    title="Download file"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* URLs */}
        {delivery.urls.length > 0 && (
          <div className="bg-[--color-bg-primary] p-4 rounded-lg border border-[--color-border]">
            <p className="text-xs font-semibold text-[--color-text-secondary] uppercase tracking-wide mb-3">External Links</p>
            <div className="space-y-2">
              {delivery.urls.map((url, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-[--color-bg-secondary] rounded-lg border border-[--color-border] hover:bg-[--color-bg-tertiary] transition-colors group">
                  <ExternalLink className="w-5 h-5 text-[--color-primary] flex-shrink-0" />
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[--color-primary] hover:underline truncate flex-1"
                  >
                    {url}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modification Count */}
        {delivery.modificationCount > 0 && (
          <div className="inline-flex items-center px-3 py-2 bg-[--color-bg-tertiary] rounded-full border border-[--color-border]">
            <RefreshCw className="w-4 h-4 text-[--color-text-secondary] mr-2" />
            <span className="text-xs font-medium text-[--color-text-primary]">
              Revisions: {delivery.modificationCount}/5
            </span>
          </div>
        )}
      </div>

      {/* Latest Modification Request */}
      {delivery.status === 'modification_requested' && delivery.modificationRequests.length > 0 && (
        <div className="mb-5 p-4 bg-[--color-bg-tertiary] border-l-4 rounded-r-lg shadow-sm" style={{ borderLeftColor: '#f97316' }}>
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-[--color-bg-secondary] rounded-full flex-shrink-0">
              <AlertTriangle className="w-5 h-5" style={{ color: '#f97316' }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-[--color-text-primary] mb-2" style={{ color: '#f97316' }}>Changes Requested</p>
              <p className="text-sm text-[--color-text-primary] leading-relaxed mb-3 bg-[--color-bg-primary] p-3 rounded-lg border border-[--color-border]">
                {delivery.modificationRequests[delivery.modificationRequests.length - 1].description}
              </p>
              <div className="flex items-center text-xs text-[--color-text-secondary]">
                <span className="font-medium">{delivery.modificationRequests[delivery.modificationRequests.length - 1].clientName}</span>
                <span className="mx-2">•</span>
                <span>{formatTimeAgo(delivery.modificationRequests[delivery.modificationRequests.length - 1].requestedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-[--color-border] flex-wrap gap-3">
        <button
          onClick={onViewDelivery}
          className="px-4 py-2 bg-[--color-bg-primary] border border-[--color-border] text-[--color-text-primary] rounded-lg hover:bg-[--color-bg-tertiary] transition-all shadow-sm hover:shadow-md flex items-center space-x-2 text-sm font-medium"
        >
          <FileText className="w-4 h-4" />
          <span>View Details</span>
        </button>

        <div className="flex space-x-3 flex-wrap gap-2">
          {/* Client Actions */}
          {canClientTakeActions && (
            <>
              <button
                onClick={onRequestModification}
                className="px-4 py-2 border-2 text-sm font-medium rounded-lg transition-all shadow-sm hover:shadow-md flex items-center space-x-2"
                style={{
                  borderColor: '#f97316',
                  color: '#f97316',
                  backgroundColor: 'var(--color-bg-primary)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-primary)'}
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Request Changes</span>
              </button>
              <button
                onClick={onAcceptWork}
                className="px-4 py-2 text-white rounded-lg transition-all shadow-sm hover:shadow-md flex items-center space-x-2 text-sm font-medium"
                style={{
                  background: 'linear-gradient(to right, #10b981, #059669)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #059669, #047857)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #10b981, #059669)'}
              >
                <CheckCircle className="w-4 h-4" />
                <span>Accept Work</span>
              </button>
            </>
          )}

          {/* Freelancer Actions */}
          {canFreelancerRedelivery && (
            <button
              onClick={onRedelivery}
              className="px-4 py-2 bg-[--color-primary] text-white rounded-lg transition-all shadow-sm hover:shadow-md hover:opacity-90 flex items-center space-x-2 text-sm font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Re-deliver Work</span>
            </button>
          )}
        </div>
      </div>

      {/* Warning for max modifications */}
      {delivery.modificationCount >= 5 && userType === 'client' && (
        <div className="mt-4 p-4 bg-[--color-bg-tertiary] border-l-4 rounded-r-lg" style={{ borderLeftColor: '#ef4444' }}>
          <div className="flex items-start space-x-3">
            <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#ef4444' }} />
            <div>
              <p className="text-sm font-bold text-[--color-text-primary]" style={{ color: '#ef4444' }}>Maximum Revisions Reached</p>
              <p className="text-xs text-[--color-text-secondary] mt-1">No further modification requests can be submitted for this delivery.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}