import React, { useState } from 'react';
import { Package, Clock, DollarSign, Calendar, Info } from 'lucide-react';

interface ServiceInquiryMessageProps {
  serviceName: string;
  packageName?: string;
  price?: string;
  deliveryTime?: string;
  hourlyRate?: string;
  minimumHours?: number;
  isUser: boolean;
}

export const ServiceInquiryMessage = ({
  serviceName,
  packageName,
  price,
  deliveryTime,
  hourlyRate,
  minimumHours,
  isUser
}: ServiceInquiryMessageProps) => {
  const [showDetails, setShowDetails] = useState(true);

  const isPackageBased = !!packageName;

  return (
    <div className={`w-full ${isUser ? 'max-w-[280px] sm:max-w-sm md:max-w-md ml-auto' : 'max-w-[280px] sm:max-w-sm md:max-w-md'}`}>
      {/* Header */}
      <div className={`flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2 px-0.5 md:px-1`}>
        <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center ${
          isUser ? 'bg-[--color-primary]/20 text-[--color-primary]' : 'bg-purple-500/20 text-purple-500'
        }`}>
          <Package className="w-3 h-3 md:w-3.5 md:h-3.5" />
        </div>
        <span className={`text-[10px] md:text-xs font-semibold ${
          isUser ? 'text-[--color-primary]' : 'text-purple-600 dark:text-purple-400'
        }`}>
          Service Inquiry
        </span>
      </div>

      {/* Card */}
      <div className={`rounded-xl overflow-hidden border ${
        isUser 
          ? 'bg-[--color-primary]/5 border-[--color-primary]/20' 
          : 'bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-700/30'
      }`}>
        {/* Service Name - Always Visible */}
        <div className={`px-3 md:px-4 py-2 md:py-3 border-b ${
          isUser 
            ? 'bg-[--color-primary]/10 border-[--color-primary]/20' 
            : 'bg-purple-100 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700/30'
        }`}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[--color-text-secondary] mb-1">Interested in:</p>
              <h4 className="font-semibold text-sm text-[--color-text-primary] line-clamp-2">
                {serviceName}
              </h4>
            </div>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                isUser
                  ? 'hover:bg-[--color-primary]/20 text-[--color-text-secondary]'
                  : 'hover:bg-purple-200 dark:hover:bg-purple-800/30 text-[--color-text-secondary]'
              }`}
              title={showDetails ? 'Hide details' : 'Show details'}
            >
              <Info className={`w-3.5 h-3.5 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Details - Collapsible */}
        {showDetails && (
          <div className="px-3 md:px-4 py-2.5 md:py-3 space-y-2 md:space-y-2.5">
            {isPackageBased ? (
              <>
                {/* Package Name */}
                <div className="flex items-center gap-1.5 md:gap-2">
                  <div className={`w-6 md:w-7 h-6 md:h-7 rounded-lg flex items-center justify-center ${
                    isUser 
                      ? 'bg-[--color-primary]/10 text-[--color-primary]' 
                      : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                  }`}>
                    <Package className="w-3 md:w-3.5 h-3 md:h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] md:text-xs text-[--color-text-secondary]">Package</p>
                    <p className="text-xs md:text-sm font-medium text-[--color-text-primary]">{packageName}</p>
                  </div>
                </div>

                {/* Price */}
                {price && (
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <div className={`w-6 md:w-7 h-6 md:h-7 rounded-lg flex items-center justify-center ${
                      isUser 
                        ? 'bg-[--color-primary]/10 text-[--color-primary]' 
                        : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                    }`}>
                      <DollarSign className="w-3 md:w-3.5 h-3 md:h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] md:text-xs text-[--color-text-secondary]">Price</p>
                      <p className="text-xs md:text-sm font-medium text-[--color-text-primary]">{price}</p>
                    </div>
                  </div>
                )}

                {/* Delivery Time */}
                {deliveryTime && (
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <div className={`w-6 md:w-7 h-6 md:h-7 rounded-lg flex items-center justify-center ${
                      isUser 
                        ? 'bg-[--color-primary]/10 text-[--color-primary]' 
                        : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                    }`}>
                      <Clock className="w-3 md:w-3.5 h-3 md:h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] md:text-xs text-[--color-text-secondary]">Delivery</p>
                      <p className="text-xs md:text-sm font-medium text-[--color-text-primary]">{deliveryTime}</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Hourly Rate */}
                {hourlyRate && (
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <div className={`w-6 md:w-7 h-6 md:h-7 rounded-lg flex items-center justify-center ${
                      isUser 
                        ? 'bg-[--color-primary]/10 text-[--color-primary]' 
                        : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                    }`}>
                      <DollarSign className="w-3 md:w-3.5 h-3 md:h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] md:text-xs text-[--color-text-secondary]">Hourly Rate</p>
                      <p className="text-xs md:text-sm font-medium text-[--color-text-primary]">{hourlyRate}</p>
                    </div>
                  </div>
                )}

                {/* Minimum Hours */}
                {minimumHours !== undefined && (
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <div className={`w-6 md:w-7 h-6 md:h-7 rounded-lg flex items-center justify-center ${
                      isUser 
                        ? 'bg-[--color-primary]/10 text-[--color-primary]' 
                        : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                    }`}>
                      <Calendar className="w-3 md:w-3.5 h-3 md:h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] md:text-xs text-[--color-text-secondary]">Minimum Hours</p>
                      <p className="text-xs md:text-sm font-medium text-[--color-text-primary]">{minimumHours} hours</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Footer */}
        <div className={`px-3 md:px-4 py-2 md:py-2.5 border-t text-[10px] md:text-xs ${
          isUser 
            ? 'bg-[--color-primary]/5 border-[--color-primary]/20 text-[--color-text-secondary]' 
            : 'bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-700/30 text-[--color-text-secondary]'
        }`}>
          💬 Looking forward to discussing this further
        </div>
      </div>
    </div>
  );
};
