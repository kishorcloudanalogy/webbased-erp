'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Star, GraduationCap, Users, Clock, Eye } from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { trainersAPI } from '@/lib/api';
import clsx from 'clsx';

export default function TrainersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['trainers', search, page],
    queryFn: () => trainersAPI.getAll({ search, page, limit: 12 }).then(r => r.data),
  });

  const trainers = data?.data || [];

  return (
    <DashboardLayout title="Trainer Management" subtitle="Manage faculty and training professionals">
      {/* Hero */}
      <div className="bg-gradient-to-r from-green-600 to-teal-700 rounded-2xl p-6 mb-6 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-48 h-48 bg-white/5 rounded-full -translate-y-24 translate-x-24" />
        <h2 className="text-xl font-bold mb-1">Trainer Management Hub</h2>
        <p className="text-green-100 text-sm mb-4">Onboard, monitor, and evaluate your training professionals</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Trainers', value: data?.pagination?.total || 0 },
            { label: 'Active Batches', value: trainers.reduce((s: number, t: any) => s + (t.batches?.length || 0), 0) },
            { label: 'Avg Rating', value: '4.5★' },
            { label: 'Sessions This Month', value: '120+' },
          ].map(s => (
            <div key={s.label} className="bg-white/15 backdrop-blur-sm rounded-xl p-3 border border-white/20">
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-xs text-green-200">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex items-center gap-2 flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2.5 shadow-sm">
          <Search className="w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search trainers..." className="flex-1 bg-transparent text-sm outline-none" />
        </div>
        <Link href="/trainers/create" className="btn-primary whitespace-nowrap">
          <Plus className="w-4 h-4" /> Add Trainer
        </Link>
      </div>

      {/* Trainer Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {trainers.map((trainer: any) => (
            <div key={trainer.id} className="card-hover group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl gradient-green flex items-center justify-center text-white text-lg font-bold">
                    {trainer.user?.name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{trainer.user?.name}</h3>
                    <p className="text-xs text-gray-500">{trainer.trainerCode}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  <span className="text-xs font-semibold text-amber-700">{trainer.avgRating || 'N/A'}</span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <GraduationCap className="w-4 h-4 text-gray-400" />
                  <span>{trainer.domain || 'Not specified'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>{trainer.experience ? `${trainer.experience} years experience` : 'Experience not listed'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>{trainer._count?.batches || 0} batches assigned</span>
                </div>
              </div>

              {trainer.skills && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {trainer.skills.split(',').slice(0, 3).map((skill: string) => (
                    <span key={skill} className="badge badge-blue text-xs">{skill.trim()}</span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                <Link href={`/trainers/${trainer.id}`} className="btn-secondary flex-1 justify-center py-2 text-xs">
                  <Eye className="w-3 h-3" /> View Profile
                </Link>
                <span className="badge badge-green">Active</span>
              </div>
            </div>
          ))}

          {trainers.length === 0 && (
            <div className="col-span-3 text-center py-12">
              <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400">No trainers found</p>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
