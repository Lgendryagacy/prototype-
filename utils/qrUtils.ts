import QRCode from 'qrcode';

export const formatWalletAddress = (address: string = ''): string => {
  if (!address) return '';
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const isValidWalletAddress = (address: string = ''): boolean => {
  if (!address || typeof address !== 'string') return false;
  return address.trim().length >= 6;
};

export const generateWalletQRCode = async (data: any): Promise<string> => {
  try {
    const text = typeof data === 'string' ? data : JSON.stringify(data);
    return await QRCode.toDataURL(text, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

export const downloadQRCode = async (data: any, filename: string = 'wallet-qr.png'): Promise<void> => {
  try {
    const dataURL = await generateWalletQRCode(data);
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading QR code:', error);
    throw error;
  }
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
};

export const parseQRCodeData = (raw: string): any => {
  try {
    return JSON.parse(raw);
  } catch {
    return { walletAddress: raw };
  }
};
