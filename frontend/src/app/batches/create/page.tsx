'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { ArrowLeft, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { batchesAPI, coursesAPI, trainersAPI } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export default function CreateBatchPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { register, handleSubmit } = useForm();

  const { data: coursesData } = useQuery({ queryKey: ['courses-list'], queryFn: () => coursesAPI.getAll({ limit: 100 }).then(r => r.data) });
  const { data: trainersData } = useQuery({ queryKey: ['trainers-list'], queryFn: () => trainersAPI.getAll({ limit: 100 }).then(r => r.data) });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      await batchesAPI.create(data);
      toast.success('Batch created!');
      router.push('/batches');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout title="Create New Batch" requiredRoles={['ADMIN', 'COORDINATOR']}>
      <div className="max-w-2xl mx-auto">
        <Link href="/batches" className="btn-secondary mb-6 inline-flex"><ArrowLeft className="w-4 h-4" /> Back</Link>
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 mb-6 text-white flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Create Training Batch</h2>
            <p className="text-blue-100 text-sm">Set up a new batch with course, trainer, and schedule</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4">
          <div>
            <label className="label">Batch Name *</label>
            <input {...register('name', { required: true })} className="input-field" placeholder="e.g., FSWB-2024-01" />
          </div>
          <div>
            <label className="label">Course *</label>
            <select {...register('courseId', { required: true })} className="input-field">
              <option value="">Select course</option>
              {(coursesData?.data || []).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Assign Trainer</label>
            <select {...register('trainerId')} className="input-field">
              <option value="">Select trainer (optional)</option>
              {(trainersData?.data || []).map((t: any) => <option key={t.id} value={t.id}>{t.user?.name} - {t.domain}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Start Date *</label>
              <input {...register('startDate', { required: true })} type="date" className="input-field" />
            </div>
            <div>
              <label className="label">End Date *</label>
              <input {...register('endDate', { required: true })} type="date" className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Max Students</label>
              <input {...register('maxStudents')} type="number" defaultValue={30} className="input-field" />
            </div>
            <div>
              <label className="label">Venue</label>
              <input {...register('venue')} className="input-field" placeholder="Lab/Room number" />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Link href="/batches" className="btn-secondary">Cancel</Link>
            <button type="submit" disabled={isLoading} className="btn-primary">
              {isLoading ? 'Creating...' : 'Create Batch'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
