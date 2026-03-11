'use client';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Star, Clock, BookOpen, MessageSquare, GraduationCap, Mail, Award } from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { trainersAPI } from '@/lib/api';

export default function TrainerProfilePage({ params }: { params: { id: string } }) {
  const { data, isLoading } = useQuery({
    queryKey: ['trainer', params.id],
    queryFn: () => trainersAPI.getById(params.id).then(r => r.data.data),
  });

  if (isLoading) return <DashboardLayout title="Trainer Profile"><div className="flex justify-center items-center h-64"><div className="spinner w-10 h-10" /></div></DashboardLayout>;
  if (!data) return <DashboardLayout title="Trainer Profile"><p className="text-gray-500">Not found</p></DashboardLayout>;

  const trainer = data;

  return (
    <DashboardLayout title="Trainer Profile" subtitle={trainer.user?.name}>
      <div className="max-w-4xl mx-auto space-y-5">
        <Link href="/trainers" className="btn-secondary inline-flex"><ArrowLeft className="w-4 h-4" /> Back</Link>

        <div className="bg-gradient-to-r from-green-600 to-teal-700 rounded-2xl p-6 text-white">
          <div className="flex flex-col md:flex-row items-start gap-5">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-4xl font-bold">
              {trainer.user?.name?.charAt(0)}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{trainer.user?.name}</h1>
              <p className="text-green-100">{trainer.user?.email}</p>
              <div className="flex flex-wrap gap-3 mt-2 text-sm text-green-100">
                <span>{trainer.trainerCode}</span>
                {trainer.domain && <span>• {trainer.domain}</span>}
                {trainer.experience && <span>• {trainer.experience}y exp</span>}
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/15 px-4 py-2 rounded-xl">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span className="text-xl font-bold">{data.feedbackStats?.overallRating?.toFixed(1) || 'N/A'}</span>
              <span className="text-green-200 text-sm">/ 5.0</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Professional Info</h3>
            <div className="space-y-3 text-sm">
              {trainer.qualification && <div><p className="text-xs text-gray-400">Qualification</p><p className="text-gray-700">{trainer.qualification}</p></div>}
              {trainer.certifications && <div><p className="text-xs text-gray-400">Certifications</p><p className="text-gray-700">{trainer.certifications}</p></div>}
              {trainer.skills && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {trainer.skills.split(',').map((s: string) => (
                      <span key={s} className="badge badge-blue text-xs">{s.trim()}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-600" /> Assigned Batches
            </h3>
            <div className="space-y-2">
              {(trainer.batches || []).map((b: any) => (
                <div key={b.id} className="p-2.5 bg-gray-50 rounded-xl">
                  <p className="text-sm font-medium text-gray-900">{b.name}</p>
                  <p className="text-xs text-gray-500">{b.course?.name}</p>
                </div>
              ))}
              {(!trainer.batches || trainer.batches.length === 0) && <p className="text-sm text-gray-400">No batches assigned</p>}
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" /> Recent Feedback
            </h3>
            <div className="space-y-2">
              {(trainer.feedbacks || []).slice(0, 4).map((f: any) => (
                <div key={f.id} className="p-2.5 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-gray-700">{f.student?.user?.name}</p>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < f.overallRating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                      ))}
                    </div>
                  </div>
                  {f.comment && <p className="text-xs text-gray-500 italic line-clamp-1">"{f.comment}"</p>}
                </div>
              ))}
              {(!trainer.feedbacks || trainer.feedbacks.length === 0) && <p className="text-sm text-gray-400">No feedback yet</p>}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
