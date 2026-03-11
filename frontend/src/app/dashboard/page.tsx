'use client';
import { useQuery } from '@tanstack/react-query';
import { Users, GraduationCap, BookOpen, Calendar, TrendingUp, Award, Briefcase, Star, Activity, CheckCircle, ArrowUpRight } from 'lucide-react';
import { dashboardAPI } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import StatsCard from '@/components/StatsCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { useAuthStore } from '@/store/authStore';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

const batchStatusLabels: Record<string, string> = {
  CREATED: 'Created', ENROLLMENT: 'Enrollment', TRAINING: 'Training',
  MID_ASSESSMENT: 'Mid Assessment', FINAL_ASSESSMENT: 'Final Assessment',
  CERTIFICATION: 'Certification', PLACEMENT: 'Placement', COMPLETED: 'Completed'
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardAPI.getStats().then(r => r.data.data),
    refetchInterval: 60000,
  });

  const stats = data?.overview;

  const activityFeed = [
    { action: 'New student enrolled', detail: 'Riya Singh joined FSWB-2024-01', time: '2 min ago', type: 'enrollment', color: 'text-blue-500 bg-blue-100' },
    { action: 'Assessment completed', detail: 'Mid-term exam results published', time: '1 hour ago', type: 'assessment', color: 'text-green-500 bg-green-100' },
    { action: 'Placement offer', detail: 'Arjun Kumar received offer from Infosys', time: '3 hours ago', type: 'placement', color: 'text-purple-500 bg-purple-100' },
    { action: 'Session logged', detail: 'Amit Verma logged 3hr session - React Hooks', time: '5 hours ago', type: 'session', color: 'text-orange-500 bg-orange-100' },
    { action: 'Feedback submitted', detail: '8 students submitted trainer feedback', time: 'Yesterday', type: 'feedback', color: 'text-teal-500 bg-teal-100' },
  ];

  const highlights = [
    { label: 'Batch Completion Rate', value: '94%', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Avg Attendance Rate', value: `${stats?.avgAttendance || 0}%`, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Avg Feedback Rating', value: `${stats?.avgFeedbackRating || 0}/5`, icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Active Batches', value: stats?.activeBatches || 0, icon: Activity, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <DashboardLayout title="Dashboard" subtitle={`Good day, ${user?.name?.split(' ')[0]}! Here's your overview.`}>
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="spinner w-10 h-10 mx-auto mb-3" />
            <p className="text-gray-500">Loading dashboard...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
          {/* Hero Banner */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
            <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-white/5 rounded-full translate-y-24" />
            <div className="relative z-10">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-blue-200 text-sm font-medium mb-1">NSDC Integrated Platform</p>
                  <h2 className="text-2xl font-bold mb-2">Skill Training ERP Dashboard</h2>
                  <p className="text-blue-100 text-sm max-w-md">Managing {stats?.totalStudents || 0} students across {stats?.totalBatches || 0} batches with {stats?.totalCourses || 0} active courses.</p>
                </div>
                <div className="hidden md:grid grid-cols-2 gap-3">
                  {highlights.map(h => {
                    const Icon = h.icon;
                    return (
                      <div key={h.label} className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20">
                        <p className="text-lg font-bold text-white">{h.value}</p>
                        <p className="text-blue-200 text-xs">{h.label}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatsCard title="Total Students" value={stats?.totalStudents || 0} change="12% this month" positive icon={Users} gradient="gradient-blue" description="Enrolled learners" />
            <StatsCard title="Active Trainers" value={stats?.totalTrainers || 0} change="3 new this week" positive icon={GraduationCap} gradient="gradient-purple" description="Certified instructors" />
            <StatsCard title="Total Courses" value={stats?.totalCourses || 0} change="2 new courses" positive icon={BookOpen} gradient="gradient-teal" description="NSDC certified" />
            <StatsCard title="Placements" value={stats?.totalPlacements || 0} change="87% success rate" positive icon={Briefcase} gradient="gradient-orange" description="Successful placements" />
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {highlights.map(h => {
              const Icon = h.icon;
              return (
                <div key={h.label} className={`${h.bg} rounded-2xl p-4 flex items-center gap-3`}>
                  <div className={`${h.color} ${h.bg} rounded-xl p-2`}>
                    <Icon className={`w-5 h-5 ${h.color}`} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">{h.value}</p>
                    <p className="text-xs text-gray-500">{h.label}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Monthly Trend */}
            <div className="lg:col-span-2 card">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-semibold text-gray-900">Enrollment & Placement Trend</h3>
                  <p className="text-sm text-gray-500">Monthly performance metrics</p>
                </div>
                <span className="badge badge-blue">2024</span>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={data?.monthlyTrend || []}>
                  <defs>
                    <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorPlacements" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 12 }} />
                  <Area type="monotone" dataKey="students" stroke="#3b82f6" fill="url(#colorStudents)" strokeWidth={2} name="New Students" />
                  <Area type="monotone" dataKey="placements" stroke="#8b5cf6" fill="url(#colorPlacements)" strokeWidth={2} name="Placements" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Batch Status */}
            <div className="card">
              <div className="mb-5">
                <h3 className="font-semibold text-gray-900">Batch Status</h3>
                <p className="text-sm text-gray-500">Current distribution</p>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={(data?.batchStatusDistribution || []).map((item: any) => ({
                      name: batchStatusLabels[item.status] || item.status,
                      value: item._count.id
                    }))}
                    cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                    paddingAngle={3} dataKey="value"
                  >
                    {(data?.batchStatusDistribution || []).map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '10px', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-2">
                {(data?.batchStatusDistribution || []).slice(0, 4).map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-gray-600">{batchStatusLabels[item.status] || item.status}</span>
                    </div>
                    <span className="font-semibold text-gray-800">{item._count.id}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Students & Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Recent Students */}
            <div className="card">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-semibold text-gray-900">Recent Students</h3>
                  <p className="text-sm text-gray-500">Latest enrollments</p>
                </div>
                <a href="/students" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                  View all <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
              <div className="space-y-3">
                {(data?.recentStudents || []).map((student: any) => (
                  <div key={student.id} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full gradient-blue flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {student.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{student.name}</p>
                      <p className="text-xs text-gray-500">{student.code}</p>
                    </div>
                    <span className="badge badge-green">Active</span>
                  </div>
                ))}
                {(!data?.recentStudents || data.recentStudents.length === 0) && (
                  <p className="text-sm text-gray-400 text-center py-4">No recent students</p>
                )}
              </div>
            </div>

            {/* Activity Feed */}
            <div className="card">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-semibold text-gray-900">Recent Activity</h3>
                  <p className="text-sm text-gray-500">Latest platform updates</p>
                </div>
                <span className="badge badge-blue">Live</span>
              </div>
              <div className="space-y-3">
                {activityFeed.map((activity, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs flex-shrink-0 ${activity.color}`}>
                      <Activity className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-500 truncate">{activity.detail}</p>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
