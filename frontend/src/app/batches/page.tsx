'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, GraduationCap, Calendar, Users, ArrowRight } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { batchesAPI } from '@/lib/api';
import clsx from 'clsx';
import Link from 'next/link';

const statusSteps = ['CREATED', 'ENROLLMENT', 'TRAINING', 'MID_ASSESSMENT', 'FINAL_ASSESSMENT', 'CERTIFICATION', 'PLACEMENT', 'COMPLETED'];
const statusColors: Record<string, string> = {
  CREATED: 'badge-gray', ENROLLMENT: 'badge-blue', TRAINING: 'badge-green',
  MID_ASSESSMENT: 'badge-yellow', FINAL_ASSESSMENT: 'badge-orange', CERTIFICATION: 'badge-purple',
  PLACEMENT: 'badge-teal', COMPLETED: 'badge-green',
};
const statusBg: Record<string, string> = {
  CREATED: 'bg-gray-100', ENROLLMENT: 'bg-blue-50', TRAINING: 'bg-green-50',
  MID_ASSESSMENT: 'bg-amber-50', FINAL_ASSESSMENT: 'bg-orange-50',
  CERTIFICATION: 'bg-purple-50', PLACEMENT: 'bg-teal-50', COMPLETED: 'bg-emerald-50',
};

export default function BatchesPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['batches', search, status, page],
    queryFn: () => batchesAPI.getAll({ search, status, page, limit: 12 }).then(r => r.data),
  });

  const batches = data?.data || [];
  const pagination = data?.pagination;

  const statusCounts = statusSteps.map(s => ({
    status: s,
    count: batches.filter((b: any) => b.status === s).length
  }));

  return (
    <DashboardLayout title="Batch Management" subtitle="Track training batches through their complete lifecycle">
      {/* Lifecycle Pipeline */}
      <div className="card mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Batch Lifecycle Pipeline</h3>
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {statusSteps.map((step, i) => (
            <div key={step} className="flex items-center gap-1 flex-shrink-0">
              <div className={clsx('px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all', status === step ? 'gradient-blue text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}
                onClick={() => setStatus(s => s === step ? '' : step)}>
                <span className="block font-semibold">{step.replace('_', ' ')}</span>
                <span className="text-xs opacity-75">{batches.filter((b: any) => b.status === step).length} batches</span>
              </div>
              {i < statusSteps.length - 1 && <ArrowRight className="w-3 h-3 text-gray-300 flex-shrink-0" />}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex items-center gap-2 flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2.5 shadow-sm">
          <Search className="w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search batches..." className="flex-1 bg-transparent text-sm outline-none" />
        </div>
        <select value={status} onChange={e => setStatus(e.target.value)} className="input-field w-full sm:w-44">
          <option value="">All Statuses</option>
          {statusSteps.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
        <Link href="/batches/create" className="btn-primary whitespace-nowrap">
          <Plus className="w-4 h-4" /> New Batch
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {batches.map((batch: any) => {
            const stepIndex = statusSteps.indexOf(batch.status);
            const progress = ((stepIndex + 1) / statusSteps.length) * 100;
            return (
              <div key={batch.id} className={clsx('rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all', statusBg[batch.status] || 'bg-white')}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{batch.name}</h3>
                    <p className="text-sm text-gray-600">{batch.course?.name}</p>
                  </div>
                  <span className={clsx('badge', statusColors[batch.status] || 'badge-gray')} style={{ fontSize: '10px' }}>
                    {batch.status?.replace('_', ' ')}
                  </span>
                </div>

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-gray-400" />{batch._count?.enrollments || 0}/{batch.maxStudents}</span>
                  <span className="flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5 text-gray-400" />{batch.trainer?.user?.name?.split(' ')[0] || 'TBD'}</span>
                  <span className="flex items-center gap-1 col-span-2"><Calendar className="w-3.5 h-3.5 text-gray-400" />{batch.startDate} → {batch.endDate}</span>
                </div>

                {batch.venue && <p className="text-xs text-gray-400 mb-3">📍 {batch.venue}</p>}

                <Link href={`/batches/${batch.id}`} className="btn-secondary w-full justify-center py-2 text-xs">
                  View Details
                </Link>
              </div>
            );
          })}

          {batches.length === 0 && (
            <div className="col-span-3 text-center py-12">
              <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400">No batches found</p>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
