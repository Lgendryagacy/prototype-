import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Image as ImageIcon, Video, FileText, X, Send, Paperclip } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Hide scrollbar CSS
const hideScrollbarStyle = `
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

interface AttachmentConfig {
  allowImages: boolean;
  allowVideos: boolean;
  allowPDFs: boolean;
}

interface AttachmentFile {
  file: File;
  preview?: string;
  type: 'image' | 'video' | 'pdf';
}

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (message: string, files: File[]) => void;
  placeholder?: string;
  attachmentConfig?: AttachmentConfig;
  disabled?: boolean;
}

export const MessageInput = ({
  value,
  onChange,
  onSend,
  placeholder = 'Type your message...',
  attachmentConfig = {
    allowImages: true,
    allowVideos: true,
    allowPDFs: true
  },
  disabled = false
}: MessageInputProps) => {
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [value]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'pdf') => {
    const files = event.target.files;
    if (!files) return;

    const newAttachments: AttachmentFile[] = [];

    Array.from(files).forEach(file => {
      // Validate file type
      if (type === 'image' && !file.type.startsWith('image/')) return;
      if (type === 'video' && !file.type.startsWith('video/')) return;
      if (type === 'pdf' && file.type !== 'application/pdf') return;

      // Create preview for images
      if (type === 'image') {
        const reader = new FileReader();
        reader.onload = (e) => {
          newAttachments.push({
            file,
            preview: e.target?.result as string,
            type
          });
          setAttachments(prev => [...prev, ...newAttachments]);
        };
        reader.readAsDataURL(file);
      } else {
        newAttachments.push({
          file,
          type
        });
      }
    });

    if (newAttachments.length > 0 && type !== 'image') {
      setAttachments(prev => [...prev, ...newAttachments]);
    }

    setShowAttachMenu(false);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = () => {
    // Trim leading and trailing newlines/whitespace
    const trimmedValue = value.trim();
    
    if (!trimmedValue && attachments.length === 0) return;

    const files = attachments.map(a => a.file);
    onSend(trimmedValue, files);
    setAttachments([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (default WhatsApp behavior)
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      handleSend();
    }
    // Shift+Enter, Ctrl+Enter, or Cmd+Enter → New line (allow default behavior)
  };

  return (
    <div className="space-y-3">
      <style>{hideScrollbarStyle}</style>
      
      {/* Attachment Previews */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2"
          >
            {attachments.map((attachment, index) => (
              <div
                key={index}
                className="relative group"
              >
                {attachment.type === 'image' && attachment.preview && (
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-[--color-border]">
                    <img
                      src={attachment.preview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeAttachment(index)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
                {attachment.type === 'video' && (
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-[--color-border] bg-[--color-bg-tertiary] flex items-center justify-center">
                    <Video size={32} className="text-[--color-text-secondary]" />
                    <button
                      onClick={() => removeAttachment(index)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
                {attachment.type === 'pdf' && (
                  <div className="relative px-3 py-2 rounded-lg border border-[--color-border] bg-[--color-bg-tertiary] flex items-center gap-2">
                    <FileText size={20} className="text-[--color-text-secondary]" />
                    <span className="text-xs text-[--color-text-secondary] max-w-[100px] truncate">
                      {attachment.file.name}
                    </span>
                    <button
                      onClick={() => removeAttachment(index)}
                      className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center"
                    >
                      <X size={10} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message Input */}
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="hide-scrollbar w-full resize-none rounded-lg border border-[--color-border] bg-[--color-bg-secondary] px-4 py-3 pr-12 text-sm placeholder:text-[--color-text-secondary] focus:outline-none focus:ring-2 focus:ring-[--color-primary] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 overflow-y-auto"
            style={{ 
              minHeight: '44px', 
              maxHeight: '120px'
            }}
          />
          
          {/* Attachment Button */}
          <div className="absolute right-2 bottom-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0"
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              disabled={disabled}
            >
              <Paperclip size={18} />
            </Button>

            {/* Attachment Menu */}
            <AnimatePresence>
              {showAttachMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute bottom-full right-0 mb-2 bg-[--color-card] border border-[--color-border] rounded-lg shadow-lg p-2 space-y-1 min-w-[150px]"
                >
                  {attachmentConfig.allowImages && (
                    <label className="flex items-center gap-2 px-3 py-2 rounded hover:bg-[--color-bg-tertiary] cursor-pointer transition-colors">
                      <ImageIcon size={18} className="text-blue-500" />
                      <span className="text-sm">Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => handleFileSelect(e, 'image')}
                      />
                    </label>
                  )}
                  {attachmentConfig.allowVideos && (
                    <label className="flex items-center gap-2 px-3 py-2 rounded hover:bg-[--color-bg-tertiary] cursor-pointer transition-colors">
                      <Video size={18} className="text-purple-500" />
                      <span className="text-sm">Video</span>
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={(e) => handleFileSelect(e, 'video')}
                      />
                    </label>
                  )}
                  {attachmentConfig.allowPDFs && (
                    <label className="flex items-center gap-2 px-3 py-2 rounded hover:bg-[--color-bg-tertiary] cursor-pointer transition-colors">
                      <FileText size={18} className="text-red-500" />
                      <span className="text-sm">PDF</span>
                      <input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={(e) => handleFileSelect(e, 'pdf')}
                      />
                    </label>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <Button
          type="button"
          size="icon"
          onClick={handleSend}
          disabled={disabled || (!value.trim() && attachments.length === 0)}
          className="h-11"
        >
          <Send size={18} />
        </Button>
      </div>

      {/* Hint Text */}
      {/* <div className="text-xs text-[--color-text-secondary] px-1">
        Press <kbd className="px-1.5 py-0.5 rounded bg-[--color-bg-tertiary] border border-[--color-border] font-mono">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 rounded bg-[--color-bg-tertiary] border border-[--color-border] font-mono">Shift+Enter</kbd> for new line
      </div> */}
    </div>
  );
};
