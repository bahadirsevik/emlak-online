import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { ArrowLeft, BarChart3, Calendar, CheckCircle, XCircle } from 'lucide-react';

interface AnalyticsData {
  stats: {
    total: number;
    published: number;
    failed: number;
    scheduled: number;
    successRate: number;
  };
  chartData: {
    date: string;
    count: number;
  }[];
}

interface AccountStats {
  username: string;
  totalPosts: number;
  publishedPosts: number;
  successRate: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function Analytics() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<AnalyticsData | null>(null);
  const [accountStats, setAccountStats] = useState<AccountStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [overviewRes, accountsRes] = await Promise.all([
        fetch('${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/analytics/overview', { headers }),
        fetch('${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/analytics/accounts', { headers })
      ]);

      if (overviewRes.ok) setOverview(await overviewRes.json());
      if (accountsRes.ok) setAccountStats(await accountsRes.json());
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading analytics...</div>;
  if (!overview) return <div className="p-8 text-center">Failed to load data</div>;

  const pieData = [
    { name: 'Published', value: overview.stats.published },
    { name: 'Failed', value: overview.stats.failed },
    { name: 'Scheduled', value: overview.stats.scheduled },
  ].filter(d => d.value > 0);

  return (
    <div className="min-h-screen bg-gray-50 p-8 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="rounded-full p-2 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-4">
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Posts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{overview.stats.total}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-indigo-500" />
            </div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">{overview.stats.successRate}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Scheduled</p>
                <p className="text-2xl font-bold text-blue-600">{overview.stats.scheduled}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Failed</p>
                <p className="text-2xl font-bold text-red-600">{overview.stats.failed}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Posting Volume Trend */}
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">Posting Volume (Last 30 Days)</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={overview.chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip labelFormatter={(date) => new Date(date).toLocaleDateString()} />
                  <Line type="monotone" dataKey="count" stroke="#4F46E5" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status Distribution */}
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">Post Status Distribution</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent ? percent * 100 : 0).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Account Performance */}
          <div className="rounded-lg bg-white p-6 shadow-sm lg:col-span-2 dark:bg-gray-800">
            <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">Account Performance</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={accountStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="username" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalPosts" name="Total Posts" fill="#4F46E5" />
                  <Bar dataKey="publishedPosts" name="Published" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
