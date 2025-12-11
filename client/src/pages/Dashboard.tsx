import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ConnectAccount from '../components/instagram/ConnectAccount';
import AccountList from '../components/instagram/AccountList';
import ThemeToggle from '../components/layout/ThemeToggle';
import { BarChart3, Calendar, CheckCircle, XCircle, Clock, RefreshCw, LineChart, MessageSquare, Bot } from 'lucide-react';

interface Stats {
  total: number;
  scheduled: number;
  published: number;
  failed: number;
}

interface Post {
  id: string;
  caption: string;
  status: string;
  scheduledTime: string;
  imageUrl: string;
  instagramAccount: {
    username: string;
  };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');
  const [stats, setStats] = useState<Stats>({ total: 0, scheduled: 0, published: 0, failed: 0 });
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const headers = { 'Authorization': `Bearer ${token}` };

      const [statsRes, recentRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/posts/stats`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/posts/recent`, { headers })
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (recentRes.ok) {
        const data = await recentRes.json();
        setRecentPosts(data.posts);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 p-8 dark:bg-gray-900">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <div className="flex gap-3">
            <ThemeToggle />
            <button
              onClick={fetchData}
              className="flex items-center gap-2 rounded-md bg-white px-4 py-2 text-gray-700 shadow-sm hover:bg-gray-50 border border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => navigate('/create-post')}
              className="rounded-md bg-indigo-600 px-4 py-2 text-white shadow-md hover:bg-indigo-700"
            >
              New Post
            </button>
            <button
              onClick={() => navigate('/analytics')}
              className="flex items-center gap-2 rounded-md bg-white px-4 py-2 text-gray-700 shadow-sm hover:bg-gray-50 border border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"
            >
              <LineChart className="h-4 w-4" />
              Analytics
            </button>
            <button
              onClick={() => navigate('/calendar')}
              className="flex items-center gap-2 rounded-md bg-white px-4 py-2 text-gray-700 shadow-sm hover:bg-gray-50 border border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"
            >
              <Calendar className="h-4 w-4" />
              Calendar
            </button>
            <button
              onClick={() => navigate('/leads')}
              className="flex items-center gap-2 rounded-md bg-white px-4 py-2 text-gray-700 shadow-sm hover:bg-gray-50 border border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"
            >
              <MessageSquare className="h-4 w-4" />
              Leads
            </button>
            <button
              onClick={() => navigate('/settings/automation')}
              className="flex items-center gap-2 rounded-md bg-white px-4 py-2 text-gray-700 shadow-sm hover:bg-gray-50 border border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"
            >
              <Bot className="h-4 w-4" />
              Automation
            </button>
            {JSON.parse(localStorage.getItem('user') || '{}').role === 'ADMIN' && (
              <button
                onClick={() => navigate('/admin')}
                className="rounded-md bg-purple-600 px-4 py-2 text-white shadow-md hover:bg-purple-700"
              >
                Admin Panel
              </button>
            )}
            <button
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
              }}
              className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 shadow-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Logout
            </button>
            <ConnectAccount />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Posts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-indigo-500" />
            </div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Scheduled</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.scheduled}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Published</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.published}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Failed</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.failed}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </div>
        </div>

        {status === 'success' && (
          <div className="mb-6 rounded-md bg-green-50 p-4 text-green-700">
            Instagram account connected successfully!
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="rounded-lg bg-white shadow-sm dark:bg-gray-800">
              <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                    <tr>
                      <th className="px-6 py-3">Post</th>
                      <th className="px-6 py-3">Account</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Scheduled For</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPosts.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                          No posts found. Create your first post!
                        </td>
                      </tr>
                    ) : (
                      recentPosts.map((post) => (
                        <tr key={post.id} className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img src={post.imageUrl} alt="" className="h-10 w-10 rounded object-cover" />
                              <span className="truncate max-w-[200px]">{post.caption}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">{post.instagramAccount?.username}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                              ${post.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                                post.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'}`}>
                              {post.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(post.scheduledTime).toLocaleString()}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Connected Accounts Sidebar */}
          <div>
            <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white">Connected Accounts</h2>
            <AccountList />
          </div>
        </div>
      </div>
    </div>
  );
}
