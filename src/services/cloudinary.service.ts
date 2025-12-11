import cloudinary from '../config/cloudinary';
import fs from 'fs';

export const uploadImage = async (filePath: string) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'instagram-poster',
      resource_type: 'auto',
    });
    
    // Delete file from local storage after upload
    fs.unlinkSync(filePath);
    
    return result;
  } catch (error) {
    // Ensure file is deleted even if upload fails
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw error;
  }
};

export const optimizeImage = (publicId: string) => {
  return {
    square: cloudinary.url(publicId, {
      transformation: [
        { width: 1080, height: 1080, crop: 'fill' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    }),
    portrait: cloudinary.url(publicId, {
      transformation: [
        { width: 1080, height: 1350, crop: 'fill' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    }),
    landscape: cloudinary.url(publicId, {
      transformation: [
        { width: 1080, height: 566, crop: 'fill' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    })
  };
};
