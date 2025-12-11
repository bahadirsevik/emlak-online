import { useState } from 'react';
import { Plus, Layout } from 'lucide-react';
import TemplateList from '../components/templates/TemplateList';
import TemplateModal from '../components/templates/TemplateModal';

export default function Templates() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleEdit = (template: any) => {
    setEditingTemplate(template);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    setRefreshTrigger(prev => prev + 1);
    setEditingTemplate(null);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingTemplate(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 dark:text-white">
              <Layout className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              Templates
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Manage your caption templates for faster posting.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            New Template
          </button>
        </div>

        <TemplateList
          onSelect={() => {}} // No-op for management page
          onEdit={handleEdit}
          refreshTrigger={refreshTrigger}
        />

        <TemplateModal
          isOpen={isModalOpen}
          onClose={handleClose}
          onSave={handleSave}
          initialData={editingTemplate}
        />
      </div>
    </div>
  );
}
