import React, { useState, useRef } from 'react';
import { X, Upload, Link, FileText, Image as ImageIcon, Video, AlertCircle, Check, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { toast } from 'react-hot-toast';
import { CreateWorkDeliveryData, DeliveryType } from '../../firebase/types/workDelivery';

interface WorkDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateWorkDeliveryData) => Promise<void>;
  jobTitle: string;
  deadlineInfo?: string;
  isSubmitting?: boolean;
}

const MAX_FILE_SIZE = 150 * 1024 * 1024; // 150MB
const ALLOWED_FILE_TYPES = [
  // Images
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  // Documents
  'application/pdf', 'text/plain', 
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  // Archives
  'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed',
  // Videos (common formats)
  'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime',
  // Audio
  'audio/mpeg', 'audio/wav', 'audio/ogg'
];

export default function WorkDeliveryModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  jobTitle, 
  deadlineInfo,
  isSubmitting = false 
}: WorkDeliveryModalProps) {
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('files');
  const [files, setFiles] = useState<File[]>([]);
  const [urls, setUrls] = useState<string[]>(['']);
  const [description, setDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file icon based on type
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="w-4 h-4" />;
    if (type.startsWith('video/')) return <Video className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const selectedFiles = Array.from(e.target.files);
    const validFiles: File[] = [];
    const errors: string[] = [];

    selectedFiles.forEach(file => {
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name} exceeds 150MB limit`);
        return;
      }

      // Check file type
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        errors.push(`${file.name} file type not supported`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      toast.error(errors.join(', '));
    }

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove file
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Handle URL changes
  const handleUrlChange = (index: number, value: string) => {
    setUrls(prev => prev.map((url, i) => i === index ? value : url));
  };

  // Add new URL input
  const addUrlInput = () => {
    setUrls(prev => [...prev, '']);
  };

  // Remove URL input
  const removeUrlInput = (index: number) => {
    if (urls.length > 1) {
      setUrls(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Validate form
  const isFormValid = (): boolean => {
    if (!description.trim()) return false;
    
    if (deliveryType === 'files' && files.length === 0) return false;
    if (deliveryType === 'url' && !urls.some(url => url.trim())) return false;
    if (deliveryType === 'both' && files.length === 0 && !urls.some(url => url.trim())) return false;
    
    return true;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const filteredUrls = urls.filter(url => url.trim());
    
    const deliveryData: CreateWorkDeliveryData = {
      jobRequestId: '', // Will be set by parent component
      proposalId: '', // Will be set by parent component
      deliveryType,
      files,
      urls: filteredUrls,
      description: description.trim()
    };

    await onSubmit(deliveryData);
  };

  // Reset form
  const resetForm = () => {
    setDeliveryType('files');
    setFiles([]);
    setUrls(['']);
    setDescription('');
  };

  // Handle close
  const handleClose = () => {
    if (isSubmitting) return; // Prevent closing while submitting
    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[--color-bg-primary] rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[--color-border]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[--color-border]">
          <div>
            <h2 className="text-xl font-semibold text-[--color-text-primary]">Deliver Work</h2>
            <p className="text-sm text-[--color-text-secondary] mt-1">{jobTitle}</p>
            {deadlineInfo && (
              <p className="text-xs text-[--color-text-secondary] mt-1">{deadlineInfo}</p>
            )}
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-[--color-bg-secondary] rounded-full transition-colors disabled:opacity-50 text-[--color-text-secondary]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Delivery Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Delivery Method *
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryType('files')}
                className={`p-3 border-2 rounded-lg text-center transition-colors ${
                  deliveryType === 'files'
                    ? 'border-[--color-primary] bg-[--color-primary]/10 text-[--color-primary]'
                    : 'border-[--color-border] hover:border-[--color-primary]/30 text-[--color-text-primary]'
                }`}
              >
                <Upload className="w-5 h-5 mx-auto mb-1" />
                <span className="text-sm font-medium">Files</span>
              </button>
              <button
                type="button"
                onClick={() => setDeliveryType('url')}
                className={`p-3 border-2 rounded-lg text-center transition-colors ${
                  deliveryType === 'url'
                    ? 'border-[--color-primary] bg-[--color-primary]/10 text-[--color-primary]'
                    : 'border-[--color-border] hover:border-[--color-primary]/30 text-[--color-text-primary]'
                }`}
              >
                <Link className="w-5 h-5 mx-auto mb-1" />
                <span className="text-sm font-medium">URLs</span>
              </button>
              <button
                type="button"
                onClick={() => setDeliveryType('both')}
                className={`p-3 border-2 rounded-lg text-center transition-colors ${
                  deliveryType === 'both'
                    ? 'border-[--color-primary] bg-[--color-primary]/10 text-[--color-primary]'
                    : 'border-[--color-border] hover:border-[--color-primary]/30 text-[--color-text-primary]'
                }`}
              >
                <div className="flex items-center justify-center mb-1">
                  <Upload className="w-4 h-4" />
                  <Link className="w-4 h-4 ml-1" />
                </div>
                <span className="text-sm font-medium">Both</span>
              </button>
            </div>
          </div>

          {/* File Upload Section */}
          {(deliveryType === 'files' || deliveryType === 'both') && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Attach Files {deliveryType === 'files' && '*'}
              </label>
              
              {/* File Input */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[--color-border] rounded-lg p-6 text-center hover:border-[--color-primary]/50 transition-colors cursor-pointer"
              >
                <Upload className="w-8 h-8 mx-auto mb-2 text-[--color-text-secondary]" />
                <p className="text-sm text-[--color-text-primary]">
                  Click to select files or drag and drop
                </p>
                <p className="text-xs text-[--color-text-secondary] mt-1">
                  Maximum file size: 150MB per file
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ALLOWED_FILE_TYPES.join(',')}
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Selected Files */}
              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-[--color-bg-secondary] rounded-lg">
                      <div className="flex items-center">
                        {getFileIcon(file.type)}
                        <div className="ml-3">
                          <p className="text-sm font-medium text-[--color-text-primary]">{file.name}</p>
                          <p className="text-xs text-[--color-text-secondary]">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="p-1 hover:bg-[--color-bg-tertiary] rounded"
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* URL Section */}
          {(deliveryType === 'url' || deliveryType === 'both') && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                URLs {deliveryType === 'url' && '*'}
              </label>
              <div className="space-y-3">
                {urls.map((url, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => handleUrlChange(index, e.target.value)}
                      placeholder="https://example.com/your-work"
                      className="flex-1 px-3 py-2 bg-[--color-bg-primary] border border-[--color-border] rounded-md focus:ring-2 focus:ring-[--color-primary] focus:border-[--color-primary] text-[--color-text-primary] placeholder:text-[--color-text-secondary]"
                    />
                    {urls.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeUrlInput(index)}
                        className="p-2 text-[--color-text-secondary] hover:text-[--color-text-primary]"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addUrlInput}
                  className="text-sm text-[--color-primary] hover:opacity-80"
                >
                  + Add another URL
                </button>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Delivery Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you've delivered, key features, or any important notes for the client..."
              rows={4}
              className="w-full px-3 py-2 bg-[--color-bg-primary] border border-[--color-border] rounded-md focus:ring-2 focus:ring-[--color-primary] focus:border-[--color-primary] text-[--color-text-primary] placeholder:text-[--color-text-secondary] resize-none"
              required
            />
          </div>

          {/* Warning Message */}
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="ml-3 text-sm text-yellow-800">
                <p className="font-medium">Important Notice:</p>
                <p className="mt-1">
                  If you don't deliver work on time, it may affect your gig rating and result in negative reviews. 
                  You have a maximum of 5 modification requests if the client requires changes.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid() || isSubmitting}
              className="flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Submit Delivery</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}