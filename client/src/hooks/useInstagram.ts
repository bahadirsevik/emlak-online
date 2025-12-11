import { useState, useEffect } from 'react';

interface InstagramAccount {
  id: string;
  username: string;
  accountType: string;
  connectedAt: string;
  instagramUserId: string;
  isActive: boolean;
  watermarkPublicId?: string;
  watermarkPosition?: string;
  watermarkOpacity?: number;
  watermarkScale?: number;
}

export const useInstagram = () => {
  const [accounts, setAccounts] = useState<InstagramAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/instagram/accounts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch accounts');
      
      const data = await response.json();
      setAccounts(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const connectAccount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/instagram/auth', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to initialize auth');
      
      const { url } = await response.json();
      window.location.href = url;
    } catch (err: any) {
      setError(err.message);
    }
  };

  const disconnectAccount = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/instagram/accounts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to disconnect account');
      
      setAccounts(accounts.filter(acc => acc.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  return { accounts, loading, error, connectAccount, disconnectAccount, fetchAccounts };
};
