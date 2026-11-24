export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export const compressionPresets = {
  mainImage: {
    maxWidth: 1200,
    maxHeight: 800,
    quality: 0.85,
    format: 'jpeg' as const
  },
  thumbnail: {
    maxWidth: 400,
    maxHeight: 300,
    quality: 0.8,
    format: 'jpeg' as const
  },
  avatar: {
    maxWidth: 512,
    maxHeight: 512,
    quality: 0.85,
    format: 'jpeg' as const
  },
  cover: {
    maxWidth: 1920,
    maxHeight: 600,
    quality: 0.9,
    format: 'jpeg' as const
  }
};

export const compressImage = async (
  file: File,
  options: CompressionOptions = {}
): Promise<File> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      resolve(file);
      return;
    }

    const {
      maxWidth = 1200,
      maxHeight = 1200,
      quality = 0.85,
      format = 'jpeg'
    } = options;

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    reader.onerror = (err) => {
      reject(err);
    };

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);

      const mimeType = format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg';
      
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const extension = format === 'png' ? '.png' : format === 'webp' ? '.webp' : '.jpg';
          const newName = file.name.replace(/\.[^/.]+$/, "") + extension;
          const compressedFile = new File([blob], newName, {
            type: mimeType,
            lastModified: Date.now()
          });
          resolve(compressedFile);
        },
        mimeType,
        quality
      );
    };

    img.onerror = (err) => {
      reject(err);
    };

    reader.readAsDataURL(file);
  });
};
