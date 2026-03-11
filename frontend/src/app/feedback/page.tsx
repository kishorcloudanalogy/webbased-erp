'use client';
import { useQuery } from '@tanstack/react-query';
import { Star, MessageSquare, TrendingUp, Award } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { feedbackAPI } from '@/lib/api';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star key={i} className={`w-4 h-4 ${i < Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
      ))}
      <span className="text-sm font-semibold text-gray-700 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function FeedbackPage() {
  const { data: feedbackData, isLoading } = useQuery({
    queryKey: ['feedback'],
    queryFn: () => feedbackAPI.getAll({ limit: 20 }).then(r => r.data),
  });

  const { data: analyticsData } = useQuery({
    queryKey: ['feedback-analytics'],
    queryFn: () => feedbackAPI.getAnalytics().then(r => r.data.data),
  });

  const feedbacks = feedbackData?.data || [];
  const analytics = analyticsData;

  const radarData = [
    { subject: 'Trainer', value: (analytics?.overall?.trainerRating || 0).toFixed(1) },
    { subject: 'Content', value: (analytics?.overall?.contentRating || 0).toFixed(1) },
    { subject: 'Infrastructure', value: (analytics?.overall?.infraRating || 0).toFixed(1) },
    { subject: 'Overall', value: (analytics?.overall?.overallRating || 0).toFixed(1) },
  ];

  const topTrainerData = (analytics?.topTrainers || []).map((t: any) => ({
    name: t.trainerName?.split(' ')[0] || 'N/A',
    rating: parseFloat((t._avg?.overallRating || 0).toFixed(2)),
    feedbacks: t._count?.id || 0
  }));

  return (
    <DashboardLayout title="Feedback & Ratings" subtitle="Student feedback, trainer ratings, and satisfaction analytics">
      {/* Hero */}
      <div className="bg-gradient-to-r from-pink-500 to-rose-600 rounded-2xl p-6 mb-6 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-48 h-48 bg-white/5 rounded-full -translate-y-24 translate-x-24" />
        <h2 className="text-xl font-bold mb-1">Feedback Analytics Hub</h2>
        <p className="text-pink-100 text-sm mb-4">Gain insights from student feedback to improve training quality</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Feedback', value: analytics?.totalFeedbacks || 0 },
            { label: 'Avg Trainer Rating', value: `${(analytics?.overall?.trainerRating || 0).toFixed(1)}★` },
            { label: 'Content Rating', value: `${(analytics?.overall?.contentRating || 0).toFixed(1)}★` },
            { label: 'Overall Score', value: `${(analytics?.overall?.overallRating || 0).toFixed(1)}/5` },
          ].map(s => (
            <div key={s.label} className="bg-white/15 rounded-xl p-3 border border-white/20">
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-xs text-pink-200">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Rating Overview</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: '#64748b' }} />
              <Radar name="Rating" dataKey="value" stroke="#ec4899" fill="#ec4899" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Top Rated Trainers</h3>
          {topTrainerData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topTrainerData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} width={60} />
                <Tooltip contentStyle={{ borderRadius: '10px', fontSize: 12 }} />
                <Bar dataKey="rating" fill="#ec4899" radius={[0, 4, 4, 0]} name="Rating" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-44 text-gray-400">
              <div className="text-center">
                <Star className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No feedback data yet</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Feedback List */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-5">Recent Feedback</h3>
        {isLoading ? (
          <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        ) : feedbacks.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-400">No feedback submitted yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {feedbacks.map((fb: any) => (
              <div key={fb.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-sm transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white text-sm font-bold">
                      {fb.student?.user?.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{fb.student?.user?.name}</p>
                      <p className="text-xs text-gray-500">→ {fb.trainer?.user?.name}</p>
                    </div>
                  </div>
                  <StarRating rating={fb.overallRating} />
                </div>
                <div className="grid grid-cols-3 gap-3 mb-2">
                  {[
                    { label: 'Trainer', value: fb.trainerRating },
                    { label: 'Content', value: fb.contentRating },
                    { label: 'Infra', value: fb.infraRating },
                  ].map(r => (
                    <div key={r.label} className="text-center bg-white rounded-xl p-2">
                      <p className="text-sm font-bold text-gray-900">{r.value}/5</p>
                      <p className="text-xs text-gray-400">{r.label}</p>
                    </div>
                  ))}
                </div>
                {fb.comment && (
                  <p className="text-sm text-gray-600 italic">"{fb.comment}"</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
