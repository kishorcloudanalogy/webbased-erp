'use client';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Users, Calendar, GraduationCap, BookOpen, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { batchesAPI } from '@/lib/api';
import clsx from 'clsx';

const statusSteps = ['CREATED', 'ENROLLMENT', 'TRAINING', 'MID_ASSESSMENT', 'FINAL_ASSESSMENT', 'CERTIFICATION', 'PLACEMENT', 'COMPLETED'];

export default function BatchDetailPage({ params }: { params: { id: string } }) {
  const { data, isLoading } = useQuery({
    queryKey: ['batch', params.id],
    queryFn: () => batchesAPI.getById(params.id).then(r => r.data.data),
  });

  if (isLoading) return <DashboardLayout title="Batch Details"><div className="flex justify-center items-center h-64"><div className="spinner w-10 h-10" /></div></DashboardLayout>;
  if (!data) return <DashboardLayout title="Batch Details"><p className="text-gray-500">Not found</p></DashboardLayout>;

  const batch = data;
  const currentStep = statusSteps.indexOf(batch.status);
  const progress = ((currentStep + 1) / statusSteps.length) * 100;

  return (
    <DashboardLayout title="Batch Details" subtitle={batch.name}>
      <div className="max-w-5xl mx-auto space-y-5">
        <Link href="/batches" className="btn-secondary inline-flex"><ArrowLeft className="w-4 h-4" /> Back</Link>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-1">{batch.name}</h1>
              <p className="text-blue-100">{batch.course?.name}</p>
              <div className="flex flex-wrap gap-3 mt-3 text-sm text-blue-100">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{batch.startDate} → {batch.endDate}</span>
                {batch.trainer && <span className="flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5" />{batch.trainer.user?.name}</span>}
                {batch.venue && <span>📍 {batch.venue}</span>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Enrolled', value: batch._count?.enrollments || 0 },
                { label: 'Max', value: batch.maxStudents },
                { label: 'Sessions', value: batch._count?.sessions || 0 },
                { label: 'Assessments', value: batch._count?.assessments || 0 },
              ].map(m => (
                <div key={m.label} className="bg-white/15 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold">{m.value}</p>
                  <p className="text-xs text-blue-200">{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Batch Lifecycle Progress</h3>
          <div className="flex items-center gap-1 mb-3">
            {statusSteps.map((step, i) => (
              <div key={step} className="flex-1 relative">
                <div className={clsx('h-2 rounded-full', i <= currentStep ? 'bg-blue-600' : 'bg-gray-200')} />
                {i === currentStep && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow" />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4">
            {statusSteps.map((step, i) => (
              <span key={step} className={clsx('text-xs', i === currentStep ? 'text-blue-600 font-bold' : 'text-gray-400')}>
                {step.replace('_', '\n')}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Enrolled Students */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" /> Enrolled Students ({batch.enrollments?.length || 0})
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {(batch.enrollments || []).map((e: any) => (
                <div key={e.id} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 rounded-lg gradient-blue flex items-center justify-center text-white text-xs font-bold">
                    {e.student?.user?.name?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{e.student?.user?.name}</p>
                    <p className="text-xs text-gray-500">{e.student?.user?.email}</p>
                  </div>
                  <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', e.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600')}>
                    {e.status}
                  </span>
                </div>
              ))}
              {(!batch.enrollments || batch.enrollments.length === 0) && (
                <p className="text-sm text-gray-400 text-center py-4">No students enrolled</p>
              )}
            </div>
          </div>

          {/* Recent Sessions */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" /> Recent Sessions
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {(batch.sessions || []).map((s: any) => (
                <div key={s.id} className="p-2.5 bg-gray-50 rounded-xl">
                  <p className="text-sm font-medium text-gray-900">{s.topic}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span>{s.date}</span>
                    <span>{s.duration}h</span>
                  </div>
                </div>
              ))}
              {(!batch.sessions || batch.sessions.length === 0) && (
                <p className="text-sm text-gray-400 text-center py-4">No sessions recorded</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
