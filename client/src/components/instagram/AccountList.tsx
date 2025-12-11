import { useState } from 'react';
import { Trash2, Instagram, Settings } from 'lucide-react';
import { useInstagram } from '../../hooks/useInstagram';
import WatermarkSettingsModal from './WatermarkSettingsModal';

export default function AccountList() {
  const { accounts, loading, disconnectAccount, fetchAccounts } = useInstagram();
  const [selectedAccount, setSelectedAccount] = useState<any>(null);

  if (loading) {
    return <div className="text-center text-gray-500 dark:text-gray-400">Loading accounts...</div>;
  }

  if (accounts.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
        <Instagram className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
        <p className="mt-2 text-gray-500 dark:text-gray-400">No accounts connected yet.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1">
      {accounts.map((account) => (
        <div key={account.id} className="relative rounded-lg border bg-white p-4 shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 text-white">
              <Instagram className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{account.username}</h3>
              <p className="text-xs text-gray-500 capitalize dark:text-gray-400">{account.accountType.toLowerCase()}</p>
              <div className="mt-1 flex flex-col gap-0.5 text-[10px] text-gray-400 dark:text-gray-500">
                <span>ID: {account.instagramUserId}</span>
                <span>Connected: {new Date(account.connectedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => disconnectAccount(account.id)}
            className="absolute right-2 top-2 rounded-full p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
            title="Disconnect account"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setSelectedAccount(account)}
            className="absolute right-10 top-2 rounded-full p-1 text-gray-400 hover:bg-gray-50 hover:text-gray-600 dark:hover:bg-gray-700"
            title="Watermark Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      ))}

      {selectedAccount && (
        <WatermarkSettingsModal
          isOpen={!!selectedAccount}
          onClose={() => setSelectedAccount(null)}
          account={selectedAccount}
          onUpdate={() => {
            fetchAccounts(); // Refresh accounts to get updated settings
            setSelectedAccount(null);
          }}
        />
      )}
    </div>
  );
}
