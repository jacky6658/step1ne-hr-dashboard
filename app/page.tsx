'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, Users, Briefcase, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface DashboardData {
  generated_at: string;
  summary: {
    total_jobs: number;
    active_jobs: number;
    total_candidates: number;
    in_pool: number;
    in_process: number;
    placed: number;
  };
  pipeline: {
    new: number;
    matching: number;
    recommended: number;
    interview: number;
    offer: number;
    placed: number;
    closed: number;
    pool: number;
  };
  need_followup: number;
  recent_activity: Array<{
    id: string;
    name: string;
    status: string;
    updated: string;
  }>;
}

const PIPELINE_STAGES = {
  pool: { label: '📋 履歷池', color: 'bg-gray-500' },
  new: { label: '🆕 新進件', color: 'bg-blue-500' },
  matching: { label: '🔍 匹配中', color: 'bg-yellow-500' },
  recommended: { label: '📤 已推薦', color: 'bg-purple-500' },
  interview: { label: '🎤 面試中', color: 'bg-orange-500' },
  offer: { label: '💰 Offer中', color: 'bg-pink-500' },
  placed: { label: '✅ 已報到', color: 'bg-green-500' },
  closed: { label: '❌ 已結案', color: 'bg-red-500' },
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setError(null);
      const res = await fetch('/api/dashboard');
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch dashboard');
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refreshDashboard = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/dashboard', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to refresh');
      const json = await res.json();
      setData(json.dashboard);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    // 每 30 秒自動重新整理
    const interval = setInterval(fetchDashboard, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">載入中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-white text-xl mb-4">{error}</p>
          <button
            onClick={fetchDashboard}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            重試
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const totalInPipeline = Object.entries(data.pipeline)
    .filter(([key]) => !['pool', 'closed'].includes(key))
    .reduce((sum, [, count]) => sum + count, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              HR 招募總覽看板
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              更新時間：{new Date(data.generated_at).toLocaleString('zh-TW')}
            </p>
          </div>
          <button
            onClick={refreshDashboard}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? '更新中...' : '重新整理'}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* 提醒區 */}
        {data.need_followup > 0 && (
          <div className="mb-6 p-4 bg-orange-500/20 border border-orange-500/50 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-orange-400" />
            <div>
              <p className="font-semibold text-orange-300">需要跟進</p>
              <p className="text-sm text-orange-200">有 {data.need_followup} 位候選人超過 3 天未更新</p>
            </div>
          </div>
        )}

        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={<Briefcase className="w-8 h-8" />}
            title="活躍職缺"
            value={data.summary.active_jobs}
            subtitle={`共 ${data.summary.total_jobs} 個職缺`}
            color="from-blue-500 to-cyan-500"
          />
          <StatCard
            icon={<Users className="w-8 h-8" />}
            title="候選人總數"
            value={data.summary.total_candidates}
            subtitle={`履歷池 ${data.summary.in_pool} 人`}
            color="from-purple-500 to-pink-500"
          />
          <StatCard
            icon={<Clock className="w-8 h-8" />}
            title="進行中"
            value={data.summary.in_process}
            subtitle={`${totalInPipeline} 人在 Pipeline 中`}
            color="from-orange-500 to-yellow-500"
          />
          <StatCard
            icon={<CheckCircle className="w-8 h-8" />}
            title="已成交"
            value={data.summary.placed}
            subtitle={`成功到職人數`}
            color="from-green-500 to-emerald-500"
          />
        </div>

        {/* Pipeline 視覺化 */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Pipeline 階段</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(PIPELINE_STAGES).map(([key, { label, color }]) => {
              const count = data.pipeline[key as keyof typeof data.pipeline] || 0;
              const total = data.summary.total_candidates || 1;
              const percentage = Math.round((count / total) * 100);

              return (
                <div
                  key={key}
                  className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg p-4 hover:bg-white/10 transition"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{label}</span>
                    <span className="text-2xl font-bold">{count}</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${color} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{percentage}%</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 最近動態 */}
        <div>
          <h2 className="text-2xl font-bold mb-4">最近動態</h2>
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg overflow-hidden">
            {data.recent_activity.length === 0 ? (
              <p className="p-6 text-gray-400 text-center">尚無動態記錄</p>
            ) : (
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">候選人 ID</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">姓名</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">狀態</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">更新日期</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.recent_activity.map((activity, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition">
                      <td className="px-6 py-4 text-sm font-mono">{activity.id}</td>
                      <td className="px-6 py-4 text-sm">{activity.name}</td>
                      <td className="px-6 py-4 text-sm">{activity.status}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">{activity.updated}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  subtitle: string;
  color: string;
}

function StatCard({ icon, title, value, subtitle, color }: StatCardProps) {
  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg p-6 hover:bg-white/10 transition">
      <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="text-gray-400 text-sm mb-1">{title}</h3>
      <p className="text-4xl font-bold mb-2">{value}</p>
      <p className="text-sm text-gray-400">{subtitle}</p>
    </div>
  );
}
