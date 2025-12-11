import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Hash } from 'lucide-react';

interface HashtagGroup {
  id: string;
  name: string;
  hashtags: string[];
}

interface HashtagManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (hashtags: string[]) => void;
}

export default function HashtagManager({ isOpen, onClose, onSelect }: HashtagManagerProps) {
  const [groups, setGroups] = useState<HashtagGroup[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupTags, setNewGroupTags] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchGroups();
    }
  }, [isOpen]);

  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/hashtags/groups', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setGroups(await response.json());
      }
    } catch (error) {
      console.error('Error fetching hashtag groups:', error);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || !newGroupTags.trim()) return;

    const hashtags = newGroupTags
      .split(/[\s,]+/)
      .filter(tag => tag.length > 0)
      .map(tag => tag.startsWith('#') ? tag : `#${tag}`);

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/hashtags/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newGroupName, hashtags })
      });

      if (response.ok) {
        setNewGroupName('');
        setNewGroupTags('');
        fetchGroups();
      }
    } catch (error) {
      console.error('Error creating group:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async (id: string) => {
    if (!confirm('Are you sure you want to delete this group?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/hashtags/groups/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setGroups(groups.filter(g => g.id !== id));
    } catch (error) {
      console.error('Error deleting group:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl dark:bg-gray-800">
        <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Hashtag Manager</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          {/* Create New Group Form */}
          <form onSubmit={handleCreateGroup} className="mb-6 space-y-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
            <input
              type="text"
              placeholder="Group Name (e.g., Summer Vibes)"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-indigo-500 focus:outline-none dark:bg-gray-600 dark:border-gray-500 dark:text-white dark:placeholder-gray-400"
            />
            <textarea
              placeholder="Hashtags (separated by space or comma)"
              value={newGroupTags}
              onChange={(e) => setNewGroupTags(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-indigo-500 focus:outline-none dark:bg-gray-600 dark:border-gray-500 dark:text-white dark:placeholder-gray-400"
              rows={3}
            />
            <button
              type="submit"
              disabled={loading || !newGroupName || !newGroupTags}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Create Group
            </button>
          </form>

          {/* Groups List */}
          <div className="max-h-[300px] space-y-3 overflow-y-auto">
            {groups.length === 0 ? (
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">No hashtag groups yet.</p>
            ) : (
              groups.map((group) => (
                <div key={group.id} className="rounded-lg border border-gray-200 p-3 hover:border-indigo-200 dark:border-gray-700 dark:hover:border-indigo-700">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 dark:text-white">{group.name}</h3>
                    <button
                      onClick={() => handleDeleteGroup(group.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="mb-3 text-xs text-gray-500 line-clamp-2 dark:text-gray-400">
                    {group.hashtags.join(' ')}
                  </p>
                  <button
                    onClick={() => onSelect(group.hashtags)}
                    className="flex w-full items-center justify-center gap-2 rounded border border-indigo-600 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
                  >
                    <Hash className="h-3 w-3" />
                    Use Hashtags
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
