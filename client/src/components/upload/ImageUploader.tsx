import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ImageUploaderProps {
  onUploadComplete: (data: { url: string; publicId: string; optimizedUrls: any; resourceType: string; thumbnailUrl?: string }[]) => void;
}

export default function ImageUploader({ onUploadComplete }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);
    setError(null);

    const uploadedFiles: { url: string; publicId: string; optimizedUrls: any; resourceType: string; thumbnailUrl?: string }[] = [];

    try {
      const token = localStorage.getItem('token');
      
      // Upload files sequentially to avoid overwhelming the server/network
      for (const file of acceptedFiles) {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch('${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        const data = await response.json();
        uploadedFiles.push(data);
      }

      onUploadComplete(uploadedFiles);
    } catch (err: any) {
      setError(err.message || 'Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.heic'],
      'video/*': ['.mp4', '.mov']
    },
    maxFiles: 10,
    multiple: true
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={cn(
          "relative flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:bg-gray-100",
          isDragActive && "border-indigo-500 bg-indigo-50"
        )}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center justify-center p-6 text-center">
          <div className="mb-4 rounded-full bg-indigo-100 p-4 text-indigo-600">
            {uploading ? <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div> : <Upload className="h-8 w-8" />}
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            {isDragActive ? "Drop media here" : "Drag & drop images or video here"}
          </h3>
          <p className="mb-4 text-sm text-gray-500">
            or click to select files (Max 10 images or 1 video)
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <ImageIcon className="h-4 w-4" />
            <span>JPG, PNG, MP4</span>
          </div>
        </div>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
