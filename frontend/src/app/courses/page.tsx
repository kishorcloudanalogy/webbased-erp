'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, BookOpen, Clock, Award, Users, Grid, List } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { coursesAPI } from '@/lib/api';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/store/authStore';

const sectorColors: Record<string, string> = {
  'IT/ITeS': 'badge-blue',
  'BFSI': 'badge-green',
  'Media & Entertainment': 'badge-purple',
  'Electronics': 'badge-orange',
  'Healthcare': 'badge-red',
};

export default function CoursesPage() {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();
  const { register, handleSubmit, reset } = useForm();

  const { data, isLoading: loadingCourses, refetch } = useQuery({
    queryKey: ['courses', search],
    queryFn: () => coursesAPI.getAll({ search, limit: 50 }).then(r => r.data),
  });

  const courses = data?.data || [];
  const canCreate = user?.role === 'ADMIN' || user?.role === 'COORDINATOR';

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      await coursesAPI.create(data);
      toast.success('Course created!');
      setShowForm(false);
      reset();
      refetch();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout title="Course Management" subtitle="Manage NSDC-aligned training programs">
      {/* Hero */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-700 rounded-2xl p-6 mb-6 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-48 h-48 bg-white/5 rounded-full -translate-y-24 translate-x-24" />
        <h2 className="text-xl font-bold mb-1">Course Repository</h2>
        <p className="text-teal-100 text-sm mb-4">NSDC certified skill training courses across multiple sectors</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Courses', value: courses.length },
            { label: 'Active Courses', value: courses.filter((c: any) => c.isActive).length },
            { label: 'Total Batches', value: courses.reduce((s: number, c: any) => s + (c._count?.batches || 0), 0) },
            { label: 'NSDC Certified', value: courses.filter((c: any) => c.nsdcCode).length },
          ].map(s => (
            <div key={s.label} className="bg-white/15 rounded-xl p-3 border border-white/20">
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-xs text-teal-200">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex items-center gap-2 flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2.5 shadow-sm">
          <Search className="w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses..." className="flex-1 bg-transparent text-sm outline-none" />
        </div>
        {canCreate && (
          <button onClick={() => setShowForm(!showForm)} className="btn-primary whitespace-nowrap">
            <Plus className="w-4 h-4" /> New Course
          </button>
        )}
      </div>

      {/* Create Course Form */}
      {showForm && (
        <div className="card mb-5 border-2 border-blue-100">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" /> Create New Course
          </h3>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <label className="label">Course Name *</label>
              <input {...register('name', { required: true })} className="input-field" placeholder="e.g., Full Stack Web Development" />
            </div>
            <div>
              <label className="label">Duration (hours) *</label>
              <input {...register('duration', { required: true })} type="number" className="input-field" placeholder="480" />
            </div>
            <div>
              <label className="label">Sector</label>
              <select {...register('sector')} className="input-field">
                <option value="">Select sector</option>
                <option>IT/ITeS</option>
                <option>BFSI</option>
                <option>Healthcare</option>
                <option>Electronics</option>
                <option>Media & Entertainment</option>
                <option>Retail</option>
              </select>
            </div>
            <div>
              <label className="label">Certification Type</label>
              <input {...register('certType')} className="input-field" placeholder="NSDC Certificate" />
            </div>
            <div>
              <label className="label">NSDC Code</label>
              <input {...register('nsdcCode')} className="input-field" placeholder="NSDC/IT/001" />
            </div>
            <div className="lg:col-span-3">
              <label className="label">Description</label>
              <textarea {...register('description')} className="input-field h-20 resize-none" placeholder="Course description" />
            </div>
            <div className="lg:col-span-3">
              <label className="label">Modules (comma separated)</label>
              <input {...register('modules')} className="input-field" placeholder="Module 1, Module 2, Module 3" />
            </div>
            <div className="lg:col-span-3 flex gap-3">
              <button type="submit" disabled={isLoading} className="btn-primary">
                {isLoading ? 'Creating...' : 'Create Course'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Course Cards */}
      {loadingCourses ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course: any) => {
            const modules = course.modules?.split(',') || [];
            return (
              <div key={course.id} className="card-hover">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl gradient-teal flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex gap-1">
                    {course.sector && <span className={clsx('badge', sectorColors[course.sector] || 'badge-gray')}>{course.sector}</span>}
                    {!course.isActive && <span className="badge badge-red">Inactive</span>}
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{course.name}</h3>
                <p className="text-xs text-gray-500 font-mono mb-3">{course.code}</p>

                {course.description && <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>}

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-gray-400" />{course.duration}h</span>
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-gray-400" />{course._count?.batches || 0} batches</span>
                  {course.certType && <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5 text-gray-400" />{course.certType}</span>}
                </div>

                {modules.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {modules.slice(0, 3).map((m: string) => (
                      <span key={m} className="badge badge-gray text-xs">{m.trim()}</span>
                    ))}
                    {modules.length > 3 && <span className="badge badge-gray text-xs">+{modules.length - 3}</span>}
                  </div>
                )}

                {course.nsdcCode && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-400">NSDC: {course.nsdcCode}</span>
                  </div>
                )}
              </div>
            );
          })}
          {courses.length === 0 && (
            <div className="col-span-3 text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400">No courses found</p>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
