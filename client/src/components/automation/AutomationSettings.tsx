import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Loader2, ArrowLeft } from 'lucide-react';

export default function AutomationSettings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    isActive: false,
    keywords: '',
    dmTemplate: '',
    replyToComment: true,
    commentReplyTemplate: ''
  });

  useEffect(() => {
    // Fetch settings (mock for now as we haven't implemented GET /api/automation/settings)
    // In a real scenario, we would fetch from the backend.
    // For MVP, we'll just use local state or mock data.
    setSettings({
      isActive: true,
      keywords: 'fiyat, bilgi, kaç para, detay',
      dmTemplate: 'Merhaba! İlgilendiğiniz ilan hakkında detaylı bilgi için: [LINK]',
      replyToComment: true,
      commentReplyTemplate: 'Merhaba, detaylı bilgiyi DM üzerinden ilettim. 📩'
    });
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 dark:bg-gray-900">
      <div className="mx-auto max-w-3xl">
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </button>

        <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">Automation Settings</h1>

        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Auto-Response</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Automatically reply to comments containing specific keywords.</p>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={settings.isActive}
                onChange={(e) => setSettings({ ...settings, isActive: e.target.checked })}
                className="h-6 w-6 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Keywords (comma separated)</label>
              <input
                type="text"
                value={settings.keywords}
                onChange={(e) => setSettings({ ...settings, keywords: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="price, info, details"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">DM Template</label>
              <textarea
                rows={3}
                value={settings.dmTemplate}
                onChange={(e) => setSettings({ ...settings, dmTemplate: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <p className="mt-1 text-xs text-gray-500">Use [LINK] to insert the post link automatically.</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="replyToComment"
                checked={settings.replyToComment}
                onChange={(e) => setSettings({ ...settings, replyToComment: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
              />
              <label htmlFor="replyToComment" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Also reply to the comment publicly
              </label>
            </div>

            {settings.replyToComment && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Public Reply Template</label>
                <input
                  type="text"
                  value={settings.commentReplyTemplate}
                  onChange={(e) => setSettings({ ...settings, commentReplyTemplate: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
