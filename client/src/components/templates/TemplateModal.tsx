import { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';

interface Template {
  id?: string;
  name: string;
  content: string;
}

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  initialData?: Template;
  initialContent?: string; // For "Save as Template" from CreatePost
}

export default function TemplateModal({ isOpen, onClose, onSave, initialData, initialContent }: TemplateModalProps) {
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setContent(initialData.content);
      } else if (initialContent) {
        setName('');
        setContent(initialContent);
      } else {
        setName('');
        setContent('');
      }
    }
  }, [isOpen, initialData, initialContent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !content) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = initialData?.id 
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/templates/${initialData.id}`
        : '${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/templates';
      
      const method = initialData?.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, content })
      });

      if (response.ok) {
        onSave();
        onClose();
      } else {
        alert('Failed to save template');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Error saving template');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {initialData ? 'Edit Template' : 'Save Template'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Template Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Monday Motivation"
              className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              placeholder="Write your caption template here..."
              className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Template
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
