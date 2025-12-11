import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bot, User } from 'lucide-react';

export default function Settings() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 p-8 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl">
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </button>

        <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>

        <div className="grid gap-6 md:grid-cols-2">
          <div 
            onClick={() => navigate('/settings/automation')}
            className="cursor-pointer rounded-lg bg-white p-6 shadow-sm transition-all hover:shadow-md dark:bg-gray-800"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
              <Bot className="h-6 w-6" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">Automation</h2>
            <p className="text-gray-500 dark:text-gray-400">
              Configure auto-replies, DM templates, and lead generation settings.
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm opacity-50 dark:bg-gray-800">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
              <User className="h-6 w-6" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">Account (Coming Soon)</h2>
            <p className="text-gray-500 dark:text-gray-400">
              Manage your profile, password, and subscription.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
