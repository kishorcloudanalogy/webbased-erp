'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { ArrowLeft, UserCheck } from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { trainersAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function CreateTrainerPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      await trainersAPI.create(data);
      toast.success('Trainer created successfully!');
      router.push('/trainers');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create trainer');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout title="Add New Trainer" requiredRoles={['ADMIN', 'COORDINATOR']}>
      <div className="max-w-3xl mx-auto">
        <Link href="/trainers" className="btn-secondary mb-6 inline-flex"><ArrowLeft className="w-4 h-4" /> Back</Link>

        <div className="bg-gradient-to-r from-green-600 to-teal-700 rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <UserCheck className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Trainer Onboarding</h2>
              <p className="text-green-100 text-sm">Register a new trainer/faculty member to the platform</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="card">
            <h3 className="font-semibold mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name *</label>
                <input {...register('name', { required: true })} className="input-field" placeholder="Trainer's full name" />
              </div>
              <div>
                <label className="label">Email *</label>
                <input {...register('email', { required: true })} type="email" className="input-field" placeholder="trainer@email.com" />
              </div>
              <div>
                <label className="label">Password *</label>
                <input {...register('password', { required: true, minLength: 6 })} type="password" className="input-field" placeholder="Set password" />
              </div>
              <div>
                <label className="label">Domain / Specialization</label>
                <input {...register('domain')} className="input-field" placeholder="e.g., Full Stack Development" />
              </div>
              <div>
                <label className="label">Qualification</label>
                <input {...register('qualification')} className="input-field" placeholder="e.g., B.Tech CS" />
              </div>
              <div>
                <label className="label">Years of Experience</label>
                <input {...register('experience')} type="number" className="input-field" placeholder="Years" />
              </div>
              <div className="md:col-span-2">
                <label className="label">Skills</label>
                <input {...register('skills')} className="input-field" placeholder="Comma-separated: React, Node.js, Python" />
              </div>
              <div className="md:col-span-2">
                <label className="label">Certifications</label>
                <input {...register('certifications')} className="input-field" placeholder="e.g., AWS Certified, Google Cloud" />
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Link href="/trainers" className="btn-secondary">Cancel</Link>
            <button type="submit" disabled={isLoading} className="btn-primary">
              {isLoading ? 'Creating...' : 'Create Trainer'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
