import { Request, Response } from 'express';
import * as cloudinaryService from '../services/cloudinary.service';

export const upload = async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const result = await cloudinaryService.uploadImage(req.file.path);
    
    let optimizedUrls = {};
    // Only generate optimized URLs for images
    if (result.resource_type === 'image') {
      optimizedUrls = cloudinaryService.optimizeImage(result.public_id);
    }

    res.status(200).json({
      message: 'File uploaded successfully',
      url: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type,
      thumbnailUrl: result.resource_type === 'video' ? result.secure_url.replace(/\.[^/.]+$/, ".jpg") : null, // Simple thumbnail generation for video
      optimizedUrls
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error uploading image', error: error.message });
  }
};
