import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '../ui/Badge';
import { Clock, Image as ImageIcon, Video, FileText, File } from 'lucide-react';

interface ConversationItemProps {
  brandName: string;
  brandLogo?: string;
  lastMessage: string;
  lastMessageType: string;
  lastMessageTime: Date;
  unreadCount: number;
  isOnline: boolean;
  isActive: boolean;
  onClick: () => void;
}

export const ConversationItem = ({
  brandName,
  brandLogo,
  lastMessage,
  lastMessageType,
  lastMessageTime,
  unreadCount,
  isOnline,
  isActive,
  onClick
}: ConversationItemProps) => {
  const getMessagePreview = () => {
    switch (lastMessageType) {
      case 'image':
        return (
          <div className="flex items-center gap-1 text-[--color-text-secondary]">
            <ImageIcon size={14} />
            <span>Photo</span>
          </div>
        );
      case 'video':
        return (
          <div className="flex items-center gap-1 text-[--color-text-secondary]">
            <Video size={14} />
            <span>Video</span>
          </div>
        );
      case 'pdf':
        return (
          <div className="flex items-center gap-1 text-[--color-text-secondary]">
            <FileText size={14} />
            <span>Document</span>
          </div>
        );
      case 'service-list':
        return <span className="text-[--color-text-secondary]">Service list</span>;
      default:
        // Truncate text to 4 words
        const words = lastMessage.split(' ').slice(0, 4);
        const truncatedText = words.join(' ') + (lastMessage.split(' ').length > 4 ? '...' : '');
        return (
          <span className="text-[--color-text-secondary] block overflow-hidden text-ellipsis whitespace-nowrap">
            {truncatedText}
          </span>
        );
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <motion.div
      whileHover={{ backgroundColor: 'var(--color-bg-tertiary)' }}
      onClick={onClick}
      className={`flex items-center gap-3 p-3 cursor-pointer transition-colors rounded-lg ${
        isActive ? 'bg-[--color-bg-tertiary]' : ''
      }`}
    >
      <div className="relative flex-shrink-0">
        {brandLogo ? (
          <img
            src={brandLogo}
            alt={brandName}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[--color-primary] to-[--color-primary]/80 flex items-center justify-center text-white font-bold text-sm">
            {brandName.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
        )}
        {isOnline && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[--color-card]" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-semibold text-[--color-text-primary] truncate">{brandName}</h4>
          <span className="text-xs text-[--color-text-secondary] ml-2">{formatTime(lastMessageTime)}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0 text-sm">
            {getMessagePreview()}
          </div>
          {unreadCount > 0 && (
            <Badge className="ml-2 bg-[--color-primary] text-white min-w-[20px] h-5 flex items-center justify-center px-1.5">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </motion.div>
  );
};
