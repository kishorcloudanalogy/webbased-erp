'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, CheckCircle, XCircle, Clock, BarChart2, Users } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { attendanceAPI, batchesAPI } from '@/lib/api';
import clsx from 'clsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const statusColors: Record<string, string> = {
  PRESENT: 'badge-green', ABSENT: 'badge-red', LATE: 'badge-yellow'
};
const statusIcons: Record<string, any> = {
  PRESENT: CheckCircle, ABSENT: XCircle, LATE: Clock
};

const weeklyData = [
  { day: 'Mon', present: 28, absent: 4, late: 3 },
  { day: 'Tue', present: 32, absent: 2, late: 1 },
  { day: 'Wed', present: 25, absent: 7, late: 3 },
  { day: 'Thu', present: 30, absent: 5, late: 0 },
  { day: 'Fri', present: 27, absent: 6, late: 2 },
];

export default function AttendancePage() {
  const [selectedBatch, setSelectedBatch] = useState('');
  const [page, setPage] = useState(1);

  const { data: batchData } = useQuery({
    queryKey: ['batches-list'],
    queryFn: () => batchesAPI.getAll({ limit: 50 }).then(r => r.data),
  });

  const { data: attendanceData, isLoading } = useQuery({
    queryKey: ['attendance', selectedBatch, page],
    queryFn: () => attendanceAPI.getAll({ batchId: selectedBatch || undefined, page, limit: 20 }).then(r => r.data),
  });

  const { data: summaryData } = useQuery({
    queryKey: ['attendance-summary', selectedBatch],
    queryFn: () => attendanceAPI.getSummary({ batchId: selectedBatch || undefined }).then(r => r.data.data),
  });

  const records = attendanceData?.data || [];
  const summary = summaryData;
  const batches = batchData?.data || [];

  return (
    <DashboardLayout title="Attendance Management" subtitle="Track student and trainer attendance">
      {/* Hero */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl p-6 mb-6 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-48 h-48 bg-white/5 rounded-full -translate-y-24 translate-x-24" />
        <h2 className="text-xl font-bold mb-1">Attendance Dashboard</h2>
        <p className="text-orange-100 text-sm mb-4">Monitor attendance patterns and ensure compliance across all batches</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Overall Present', value: summary ? `${summary.percentage}%` : '0%', icon: CheckCircle },
            { label: 'Total Sessions', value: summary?.total || 0, icon: Calendar },
            { label: 'Present Count', value: summary?.present || 0, icon: CheckCircle },
            { label: 'Absent Count', value: summary?.absent || 0, icon: XCircle },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-white/15 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-4 h-4 text-orange-200" />
                  <span className="text-xs text-orange-200">{s.label}</span>
                </div>
                <p className="text-xl font-bold">{s.value}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <div className="lg:col-span-2 card">
          <h3 className="font-semibold text-gray-900 mb-4">Weekly Attendance Overview</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ borderRadius: '10px', fontSize: 12 }} />
              <Bar dataKey="present" fill="#10b981" radius={[4, 4, 0, 0]} name="Present" />
              <Bar dataKey="absent" fill="#ef4444" radius={[4, 4, 0, 0]} name="Absent" />
              <Bar dataKey="late" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Late" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Attendance Summary</h3>
          <div className="space-y-3">
            {[
              { label: 'Present', value: summary?.present || 0, total: summary?.total || 1, color: 'bg-emerald-500' },
              { label: 'Absent', value: summary?.absent || 0, total: summary?.total || 1, color: 'bg-red-500' },
              { label: 'Late', value: summary?.late || 0, total: summary?.total || 1, color: 'bg-amber-500' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{item.label}</span>
                  <span className="font-medium">{item.value}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${(item.value / item.total) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <p className="text-3xl font-bold text-gradient">{summary?.percentage || 0}%</p>
              <p className="text-sm text-gray-500">Overall Attendance Rate</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <select value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)} className="input-field w-full sm:w-64">
            <option value="">All Batches</option>
            {batches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <span className="text-sm text-gray-500 self-center">{attendanceData?.pagination?.total || 0} records</span>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Session Date</th>
                <th>Topic</th>
                <th>Batch</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">Loading...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400">No attendance records</p>
                </td></tr>
              ) : records.map((record: any) => {
                const StatusIcon = statusIcons[record.status] || CheckCircle;
                return (
                  <tr key={record.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg gradient-orange flex items-center justify-center text-white text-xs font-bold">
                          {record.student?.user?.name?.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900">{record.student?.user?.name}</span>
                      </div>
                    </td>
                    <td className="text-sm text-gray-600">{record.session?.date}</td>
                    <td className="text-sm text-gray-700 max-w-32 truncate">{record.session?.topic}</td>
                    <td className="text-sm text-gray-600">{record.session?.batch?.name}</td>
                    <td>
                      <span className={clsx('badge flex items-center gap-1 w-fit', statusColors[record.status])}>
                        <StatusIcon className="w-3 h-3" />
                        {record.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
