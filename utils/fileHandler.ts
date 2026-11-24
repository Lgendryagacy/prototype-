// File handling utility for local browser preview / uploads

export interface SaveFileResult {
  success: boolean;
  filePath: string;
  error?: string;
}

export const saveFileToPublic = async (
  file: File,
  folder: string,
  id: string
): Promise<SaveFileResult> => {
  try {
    const extension = file.name.split('.').pop() || 'dat';
    const fileName = `${folder}_${id}_${Date.now()}.${extension}`;
    
    // In browser, create an Object URL or data URL
    const objectUrl = URL.createObjectURL(file);
    return {
      success: true,
      filePath: objectUrl
    };
  } catch (error: any) {
    console.error('Error saving file:', error);
    return {
      success: false,
      filePath: '',
      error: error?.message || 'Failed to save file'
    };
  }
};
