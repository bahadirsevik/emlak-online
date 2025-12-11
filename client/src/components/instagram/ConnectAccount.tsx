import { useState } from 'react';
import { Instagram, Loader2 } from 'lucide-react';

export default function ConnectAccount() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    instagramBusinessId: '',
    facebookPageId: '',
    accessToken: ''
  });

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/instagram/manual_connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const data = await response.json();
        const errorMessage = data.error ? `${data.message}: ${data.error}` : (data.message || 'Failed to connect');
        throw new Error(errorMessage);
      }
      
      window.location.reload(); // Refresh to show new account
    } catch (error: any) {
      console.error('Connection failed:', error);
      alert(`Connection failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-md bg-pink-600 px-4 py-2 text-white hover:bg-pink-700"
      >
        <Instagram className="h-5 w-5" />
        Connect Account
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Connect Instagram Business</h2>
        
        <form onSubmit={handleConnect} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Instagram Business ID</label>
            <input
              type="text"
              value={formData.instagramBusinessId}
              onChange={e => setFormData({...formData, instagramBusinessId: e.target.value})}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-pink-500 focus:ring-pink-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
              placeholder="e.g. 17841..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Facebook Page ID</label>
            <input
              type="text"
              value={formData.facebookPageId}
              onChange={e => setFormData({...formData, facebookPageId: e.target.value})}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-pink-500 focus:ring-pink-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
              placeholder="e.g. 10055..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Facebook Page Access Token</label>
            <textarea
              value={formData.accessToken}
              onChange={e => setFormData({...formData, accessToken: e.target.value})}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-pink-500 focus:ring-pink-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
              rows={3}
              placeholder="EAAG..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex flex-1 items-center justify-center gap-2 rounded-md bg-pink-600 px-4 py-2 text-white hover:bg-pink-700 disabled:bg-pink-400"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Connect
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
