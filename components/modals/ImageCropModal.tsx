import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '../ui/Button';
import { X, ZoomIn, ZoomOut, RotateCw, Maximize2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageFile: File;
  onCropComplete: (croppedFile: File) => void;
  aspectRatio?: number; // Default will be 16/9
  title?: string;
  circularCrop?: boolean; // Enable circular crop overlay
}

const ImageCropModal = ({
  isOpen,
  onClose,
  imageFile,
  onCropComplete,
  aspectRatio = 16 / 9,
  title = 'Crop Image',
  circularCrop = false
}: ImageCropModalProps) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 90,
    height: 90,
    x: 5,
    y: 5
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (imageFile && isOpen) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
      };
      reader.readAsDataURL(imageFile);
    }

    return () => {
      if (imageSrc && imageSrc.startsWith('blob:')) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [imageFile, isOpen]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;

    // Calculate crop to match aspect ratio
    const imageAspect = width / height;
    let cropWidth = 90;
    let cropHeight = 90;

    if (imageAspect > aspectRatio) {
      // Image is wider than target aspect
      cropHeight = 90;
      cropWidth = (cropHeight * aspectRatio * height) / width;
    } else {
      // Image is taller than target aspect
      cropWidth = 90;
      cropHeight = (cropWidth * width) / (aspectRatio * height);
    }

    setCrop({
      unit: '%',
      width: cropWidth,
      height: cropHeight,
      x: (100 - cropWidth) / 2,
      y: (100 - cropHeight) / 2
    });
  };

  const getCroppedImage = async (): Promise<File | null> => {
    if (!completedCrop || !imgRef.current || !canvasRef.current) {
      return null;
    }

    const image = imgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return null;
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Set canvas size to match the cropped area
    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;

    // Apply transformations
    ctx.save();

    // Apply rotation if needed
    if (rotation !== 0) {
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    }

    // Draw the cropped image
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    ctx.restore();

    // Convert canvas to blob
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve(null);
          return;
        }

        // Create a File from the blob
        const file = new File([blob], imageFile.name, {
          type: imageFile.type,
          lastModified: Date.now(),
        });

        resolve(file);
      }, imageFile.type, 0.95);
    });
  };

  const handleCropConfirm = async () => {
    const croppedFile = await getCroppedImage();

    if (croppedFile) {
      onCropComplete(croppedFile);
      onClose();
    } else {
      toast.error('Failed to crop image. Please try again.');
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleFitToScreen = () => {
    setCrop({
      unit: '%',
      width: 90,
      height: 90,
      x: 5,
      y: 5
    });
    setZoom(1);
    setRotation(0);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[60]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[--color-card] rounded-xl max-w-5xl w-full max-h-[95vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[--color-border]">
            <div>
              <h2 className="text-2xl font-bold text-[--color-text-primary]">{title}</h2>
              <p className="text-sm text-[--color-text-secondary] mt-1">
                {circularCrop 
                  ? 'Adjust the crop area to select your profile picture (circular preview)'
                  : `Adjust the crop area to select the perfect portion (${aspectRatio === 16/9 ? '16:9' : aspectRatio === 1 ? '1:1' : aspectRatio === 16/5 ? '16:5' : aspectRatio === 21/9 ? '21:9' : 'custom'} ratio)`
                }
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>

          {/* Crop Area */}
          <div className="flex-1 overflow-auto p-6 bg-[--color-bg-secondary]">
            <div className="flex items-center justify-center min-h-full">
              {imageSrc && (
                <ReactCrop
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={aspectRatio}
                  circularCrop={circularCrop}
                  className="max-w-full"
                >
                  <img
                    ref={imgRef}
                    src={imageSrc}
                    alt="Crop preview"
                    onLoad={handleImageLoad}
                    style={{
                      transform: `scale(${zoom}) rotate(${rotation}deg)`,
                      transition: 'transform 0.2s ease',
                      maxHeight: '60vh',
                      maxWidth: '100%',
                      objectFit: 'contain'
                    }}
                  />
                </ReactCrop>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="p-6 border-t border-[--color-border] space-y-4">
            {/* Zoom Controls */}
            <div className="flex items-center gap-4">
              <div className='zoom-control flex items-center gap-4'>
                <span className="text-sm text-[--color-text-secondary] w-16">Zoom:</span>
                <Button variant="outline" size="sm" onClick={handleZoomOut}>
                  <ZoomOut size={16} />
                </Button>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="flex-1"
                />
                <Button variant="outline" size="sm" onClick={handleZoomIn}>
                  <ZoomIn size={16} />
                </Button>
                <span className="text-sm text-[--color-text-secondary] w-12">{(zoom * 100).toFixed(0)}%</span>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleRotate}>
                  <RotateCw size={16} className="mr-2" />
                  Rotate 90°
                </Button>
                <Button variant="outline" size="sm" onClick={handleFitToScreen}>
                  <Maximize2 size={16} className="mr-2" />
                  Reset View
                </Button>
              </div>
            </div>


            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t border-[--color-border]">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleCropConfirm}>
                Crop & Continue
              </Button>
            </div>
          </div>

          {/* Hidden canvas for crop processing */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ImageCropModal;
