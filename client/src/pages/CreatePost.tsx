import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ImageUploader from '../components/upload/ImageUploader';
import PropertyDetailsForm from '../components/ai/PropertyDetailsForm';

import TemplateList from '../components/templates/TemplateList';
import HashtagManager from '../components/hashtags/HashtagManager';
import ImageEditorModal from '../components/upload/ImageEditorModal';
import { ArrowLeft, Loader2, Wand2, Hash, Pencil, Link as LinkIcon } from 'lucide-react';
import { useInstagram } from '../hooks/useInstagram';

export default function CreatePost() {
  const navigate = useNavigate();
  const { accounts } = useInstagram();
  
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);
  const [caption, setCaption] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoadTemplateOpen, setIsLoadTemplateOpen] = useState(false);
  const [imageAnalysis, setImageAnalysis] = useState<any>(null);
  const [isHashtagManagerOpen, setIsHashtagManagerOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<any>(null);
  const [applyWatermark, setApplyWatermark] = useState(true);
  const [mediaType, setMediaType] = useState<'IMAGE' | 'VIDEO' | 'CAROUSEL' | 'REELS'>('IMAGE');
  const [importUrl, setImportUrl] = useState('');
  const [importing, setImporting] = useState(false);

  const handleUploadComplete = (data: { url: string; publicId: string; optimizedUrls: any; resourceType: string; thumbnailUrl?: string }[]) => {
    const hasVideo = data.some(item => item.resourceType === 'video');
    
    if (hasVideo) {
      // If video is uploaded, we only support 1 video for now (Reels)
      setUploadedImages(data);
      setMediaType('REELS');
    } else {
      setUploadedImages(prev => {
        const newImages = [...prev, ...data];
        if (newImages.length > 1) setMediaType('CAROUSEL');
        else setMediaType('IMAGE');
        return newImages;
      });
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const analyzeImage = async (imageUrl: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/ai/analyze-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ imageUrl })
      });

      const data = await response.json();
      if (data.analysis) {
        setImageAnalysis(data.analysis);
        alert('Görsel analiz edildi! Şimdi "AI ile Profesyonel Metin Oluştur" butonuna basarak analizi emlak detaylarıyla birleştirebilirsiniz.');
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      alert('Failed to analyze image');
    } finally {
      setLoading(false);
    }
  };

  const handleEditorSave = async (editedImageBlob: Blob) => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      const file = new File([editedImageBlob], "edited-image.png", { type: "image/png" });
      formData.append('image', file);

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload edited image');

      const data = await response.json();

      setUploadedImages(prev => prev.map(img => 
        img.publicId === editingImage.publicId ? data : img
      ));
      
      setEditingImage(null);
    } catch (error) {
      console.error('Error saving edited image:', error);
      alert('Failed to save edited image');
    }
  };

  const handleImport = async () => {
    if (!importUrl) return;
    setImporting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/scraper/scrape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ url: importUrl })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Scraping failed');

      if (data.data) {
        const { title, price, location, features, description } = data.data;
        let newCaption = caption ? caption + '\n\n' : '';
        
        if (title) newCaption += `🏠 ${title}\n`;
        if (price) newCaption += `💰 ${price}\n`;
        if (location) newCaption += `📍 ${location}\n`;
        
        if (features) {
          if (features.m2) newCaption += `📏 ${features.m2}\n`;
          if (features.rooms) newCaption += `🛏️ ${features.rooms}\n`;
          if (features.floor) newCaption += `🏢 ${features.floor}\n`;
        }

        if (description) newCaption += `\n${description.substring(0, 200)}...\n`;

        setCaption(newCaption);
        
        if (!title && !price && !location) {
           alert('Scraping finished but no data was found. The site might be blocking us or the layout changed.');
        } else {
           alert('Data imported successfully!');
        }
      } else {
        throw new Error('No data returned from scraper');
      }
    } catch (error: any) {
      console.error('Import Error:', error);
      alert(error.message || 'Failed to import data');
    } finally {
      setImporting(false);
    }
  };

  const handleSubmit = async () => {
    if (uploadedImages.length === 0) return;
    
    const activeAccount = accounts.find(acc => acc.isActive);
    if (!activeAccount) {
      alert('Please connect an Instagram account first!');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/posts/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          images: uploadedImages.map(img => img.optimizedUrls.portrait || img.url),
          imagePublicIds: uploadedImages.map(img => img.publicId),
          caption,
          scheduledTime: scheduledTime ? new Date(scheduledTime).toISOString() : null,
          instagramAccountId: activeAccount.id,
          applyWatermark,
          mediaType,
          thumbnailUrl: uploadedImages[0]?.thumbnailUrl
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        const detailedError = errorData.error ? `${errorData.message}: ${errorData.error}` : errorData.message || 'Failed to schedule post';
        throw new Error(detailedError);
      }

      alert('Post scheduled successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error scheduling post:', error);
      alert(error.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 dark:bg-gray-900">
      <div className="mx-auto max-w-6xl">
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </button>

        <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">Create New Post</h1>

        {/* Import Section */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Import from URL</h2>
          <div className="flex gap-4">
            <input
              type="text"
              value={importUrl}
              onChange={(e) => setImportUrl(e.target.value)}
              placeholder="Paste Emlakjet or Hepsiemlak URL..."
              className="flex-1 rounded-md border border-gray-300 p-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <button
              onClick={handleImport}
              disabled={importing || !importUrl}
              className="flex items-center gap-2 rounded-md bg-indigo-600 px-6 py-2 text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {importing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Importing...</span>
                </>
              ) : (
                <>
                  <LinkIcon className="h-4 w-4" />
                  <span>Import</span>
                </>
              )}
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Supported sites: Emlakjet, Hepsiemlak. Data will be appended to the caption.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Column: Upload & Preview */}
          <div className="space-y-6">
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Media</h2>
              <ImageUploader onUploadComplete={handleUploadComplete} />
            </div>
            
            {uploadedImages.length > 0 && (
              <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Selected Images ({uploadedImages.length})</h2>
                  <button
                    onClick={() => analyzeImage(uploadedImages[0].url)}
                    disabled={loading}
                    className="flex items-center gap-2 rounded-md bg-purple-50 px-3 py-2 text-sm font-medium text-purple-700 border border-purple-200 transition-all hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800 dark:hover:bg-purple-900/40"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Analiz Ediliyor...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4" />
                        <span>Görseli Analiz Et</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {uploadedImages.map((img, index) => (
                    <div key={img.publicId} className="relative group">
                      {img.resourceType === 'video' ? (
                         <video 
                           src={img.url} 
                           className="h-32 w-full rounded-lg object-cover" 
                           controls 
                         />
                      ) : (
                        <img 
                          src={img.optimizedUrls?.square || img.url} 
                          alt={`Upload ${index + 1}`} 
                          className="h-32 w-full rounded-lg object-cover"
                        />
                      )}
                      <button
                        onClick={() => setEditingImage(img)}
                        className="absolute top-2 left-2 rounded-full bg-white p-1 text-gray-700 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 hover:text-indigo-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:text-indigo-400"
                        title="Edit Image"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Details */}
          <div className="space-y-6">
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Post Details</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsHashtagManagerOpen(true)}
                        className="flex items-center gap-2 rounded-md bg-pink-50 px-3 py-2 text-sm font-medium text-pink-700 hover:bg-pink-100 dark:bg-pink-900/20 dark:text-pink-300 dark:hover:bg-pink-900/40"
                    >
                        <Hash className="h-4 w-4" />
                        Hashtags
                    </button>
                    <button
                        onClick={() => setIsLoadTemplateOpen(true)}
                        className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                        Load Template
                    </button>
                </div>
              </div>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={10}
                className="mb-4 block w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                placeholder="AI tarafından oluşturulan metin buraya gelecek. Düzenleyebilirsiniz..."
              />
              <PropertyDetailsForm 
                onCaptionGenerated={(newCaption) => setCaption(newCaption)}
                imageAnalysis={imageAnalysis}
              />
              
              <div className="mt-4 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="applyWatermark"
                  checked={applyWatermark}
                  onChange={(e) => setApplyWatermark(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <label htmlFor="applyWatermark" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Apply Brand Watermark (if configured)
                </label>
              </div>

              {mediaType === 'REELS' && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs font-medium text-pink-600 bg-pink-50 px-2 py-1 rounded dark:bg-pink-900/20 dark:text-pink-300">
                    Posting as Reel
                  </span>
                </div>
              )}
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Schedule Time (Optional)</label>
                <input
                  type="datetime-local"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Leave empty to post immediately.</p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={uploadedImages.length === 0 || loading}
                className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {loading ? 'Scheduling...' : (scheduledTime ? 'Schedule Post' : 'Post Now')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isLoadTemplateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl dark:bg-gray-800">
            <div className="flex items-center justify-between border-b border-gray-100 p-4 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select Template</h3>
              <button onClick={() => setIsLoadTemplateOpen(false)} className="text-gray-400 hover:text-gray-600">
                <span className="sr-only">Close</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <TemplateList
                onSelect={(content) => {
                  setCaption(content);
                  setIsLoadTemplateOpen(false);
                }}
                onEdit={() => {}} 
                refreshTrigger={0}
              />
            </div>
          </div>
        </div>
      )}

      {isHashtagManagerOpen && (
        <HashtagManager
          isOpen={isHashtagManagerOpen}
          onClose={() => setIsHashtagManagerOpen(false)}
          onSelect={(hashtags) => {
            setCaption(prev => prev + (prev ? '\n\n' : '') + hashtags.join(' '));
            setIsHashtagManagerOpen(false);
          }}
        />
      )}

      {editingImage && (
        <ImageEditorModal
          isOpen={!!editingImage}
          imageUrl={editingImage.url}
          onClose={() => setEditingImage(null)}
          onSave={handleEditorSave}
        />
      )}
    </div>
  );
}
