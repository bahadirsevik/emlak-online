import { useState, useEffect } from 'react';
import { X, Upload, Save, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface WatermarkSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: any;
  onUpdate: () => void;
}

export default function WatermarkSettingsModal({ isOpen, onClose, account, onUpdate }: WatermarkSettingsModalProps) {
  const [settings, setSettings] = useState({
    watermarkPublicId: account?.watermarkPublicId || '',
    watermarkPosition: account?.watermarkPosition || 'south_east',
    watermarkOpacity: account?.watermarkOpacity || 80,
    watermarkScale: account?.watermarkScale || 20,
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);




  useEffect(() => {
    if (account) {
      setSettings({
        watermarkPublicId: account.watermarkPublicId || '',
        watermarkPosition: account.watermarkPosition || 'south_east',
        watermarkOpacity: account.watermarkOpacity || 80,
        watermarkScale: account.watermarkScale || 20,
      });
    }
  }, [account]);

  useEffect(() => {
    if (settings.watermarkPublicId) {
      // Construct Cloudinary transformation URL for preview
      // This is a simplified example. In a real app, you'd construct the full URL based on your cloud name.
      // Assuming we have a helper or just using the structure:
      // https://res.cloudinary.com/<cloud_name>/image/upload/l_<watermark_id>,w_<scale>_fl_relative,g_<position>,o_<opacity>/<sample_image>
      
      // For now, let's just show the watermark itself if we can't easily overlay on a sample without cloud name
      // Or better, just show the watermark image.
      // setPreviewUrl(settings.watermarkPublicId); 
    }
  }, [settings]);

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setSettings(prev => ({ ...prev, watermarkPublicId: data.publicId }));
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload watermark');
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'image/png': ['.png'] }, // Only PNGs for transparency
    maxFiles: 1
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/instagram/accounts/${account.id}/watermark`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      if (!response.ok) throw new Error('Update failed');

      onUpdate();
      onClose();
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Watermark Settings</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Upload Section */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Logo (PNG only)</label>
            <div
              {...getRootProps()}
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              <input {...getInputProps()} />
              {uploading ? (
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              ) : settings.watermarkPublicId ? (
                <div className="text-center">
                  <p className="text-sm text-green-600">Logo Uploaded</p>
                  <p className="text-xs text-gray-500">Click to replace</p>
                </div>
              ) : (
                <>
                  <Upload className="mb-2 h-8 w-8 text-gray-400" />
                  <p className="text-sm text-gray-500">Drop logo here or click to upload</p>
                </>
              )}
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">Position</label>
              <select
                value={settings.watermarkPosition}
                onChange={(e) => setSettings(prev => ({ ...prev, watermarkPosition: e.target.value }))}
                className="w-full rounded-md border border-gray-300 p-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="south_east">Bottom Right</option>
                <option value="south_west">Bottom Left</option>
                <option value="north_east">Top Right</option>
                <option value="north_west">Top Left</option>
                <option value="center">Center</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">Scale (%)</label>
              <input
                type="number"
                min="5"
                max="100"
                value={settings.watermarkScale}
                onChange={(e) => setSettings(prev => ({ ...prev, watermarkScale: parseInt(e.target.value) }))}
                className="w-full rounded-md border border-gray-300 p-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">Opacity (%)</label>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.watermarkOpacity}
              onChange={(e) => setSettings(prev => ({ ...prev, watermarkOpacity: parseInt(e.target.value) }))}
              className="w-full"
            />
            <div className="text-right text-xs text-gray-500">{settings.watermarkOpacity}%</div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
