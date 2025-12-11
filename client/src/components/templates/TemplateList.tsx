import { useState, useEffect } from 'react';

import { Copy } from 'lucide-react';
import { Trash2 } from 'lucide-react';
import { Edit2 } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  content: string;
}

interface TemplateListProps {
  onSelect: (content: string) => void;
  onEdit: (template: Template) => void;
  refreshTrigger: number;
}

export default function TemplateList({ onSelect, onEdit, refreshTrigger }: TemplateListProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, [refreshTrigger]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/templates', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/templates/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  if (loading && templates.length === 0) {
    return <div className="text-center text-gray-500 py-4">Loading templates...</div>;
  }

  if (templates.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        No templates found. Save your first template!
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {templates.map((template) => (
        <div key={template.id} className="group relative rounded-lg border border-gray-200 bg-white p-4 hover:border-indigo-300 hover:shadow-sm transition-all">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-medium text-gray-900 truncate pr-8" title={template.name}>
              {template.name}
            </h4>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEdit(template)}
                className="p-1 text-gray-400 hover:text-indigo-600 rounded"
                title="Edit"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => handleDelete(template.id)}
                className="p-1 text-gray-400 hover:text-red-600 rounded"
                title="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          
          <p className="text-xs text-gray-500 line-clamp-3 mb-3 h-12">
            {template.content}
          </p>

          <button
            onClick={() => onSelect(template.content)}
            className="w-full flex items-center justify-center gap-2 rounded bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100 transition-colors"
          >
            <Copy className="h-3 w-3" />
            Use Template
          </button>
        </div>
      ))}
    </div>
  );
}
