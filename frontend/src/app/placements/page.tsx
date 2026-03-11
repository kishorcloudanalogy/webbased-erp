'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Briefcase, Building2, TrendingUp, Award, DollarSign, Users, Plus, CheckCircle } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { placementsAPI } from '@/lib/api';
import clsx from 'clsx';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const statusColors: Record<string, string> = {
  SHORTLISTED: 'badge-blue', INTERVIEWING: 'badge-yellow',
  OFFERED: 'badge-orange', ACCEPTED: 'badge-green', REJECTED: 'badge-red'
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function PlacementsPage() {
  const [activeTab, setActiveTab] = useState<'placements' | 'companies'>('placements');
  const [type, setType] = useState('');

  const { data: placementData, isLoading } = useQuery({
    queryKey: ['placements', type],
    queryFn: () => placementsAPI.getAll({ type: type || undefined, limit: 20 }).then(r => r.data),
  });

  const { data: statsData } = useQuery({
    queryKey: ['placement-stats'],
    queryFn: () => placementsAPI.getStats().then(r => r.data.data),
  });

  const { data: companyData } = useQuery({
    queryKey: ['companies'],
    queryFn: () => placementsAPI.getCompanies({ limit: 20 }).then(r => r.data),
    enabled: activeTab === 'companies',
  });

  const placements = placementData?.data || [];
  const companies = companyData?.data || [];
  const stats = statsData;

  const industryData = companies.reduce((acc: any[], c: any) => {
    const existing = acc.find(a => a.name === c.industry);
    if (existing) existing.value++;
    else acc.push({ name: c.industry, value: 1 });
    return acc;
  }, []);

  return (
    <DashboardLayout title="Placement Management" subtitle="Track internships, placements, and industry partnerships">
      {/* Hero */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-700 rounded-2xl p-6 mb-6 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-48 h-48 bg-white/5 rounded-full -translate-y-24 translate-x-24" />
        <h2 className="text-xl font-bold mb-1">Placement Cell</h2>
        <p className="text-indigo-100 text-sm mb-4">Connecting skilled students with industry leaders for successful career launches</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Placements', value: stats?.total || 0 },
            { label: 'Successful', value: stats?.accepted || 0 },
            { label: 'Internships', value: stats?.internships || 0 },
            { label: 'Placement Rate', value: `${stats?.placementRate || 0}%` },
          ].map(s => (
            <div key={s.label} className="bg-white/15 rounded-xl p-3 border border-white/20">
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-xs text-indigo-200">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Avg Salary Banner */}
      {stats?.avgSalary > 0 && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 mb-5 flex items-center gap-4">
          <div className="w-12 h-12 gradient-green rounded-xl flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Average Placement Package</p>
            <p className="text-2xl font-bold text-emerald-700">₹{(stats.avgSalary / 100000).toFixed(1)}L / year</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">+12% YoY</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-xl w-fit">
        {[{ key: 'placements', label: 'Placements' }, { key: 'companies', label: 'Companies' }].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
            className={clsx('px-5 py-2 rounded-xl text-sm font-medium transition-all', activeTab === tab.key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500')}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'placements' && (
        <>
          <div className="flex gap-3 mb-5">
            <select value={type} onChange={e => setType(e.target.value)} className="input-field w-48">
              <option value="">All Types</option>
              <option value="PLACEMENT">Full-time</option>
              <option value="INTERNSHIP">Internship</option>
            </select>
          </div>

          <div className="card">
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Company</th>
                    <th>Role</th>
                    <th>Type</th>
                    <th>Salary</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={7} className="text-center py-8 text-gray-400">Loading...</td></tr>
                  ) : placements.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-12">
                      <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-400">No placement records</p>
                    </td></tr>
                  ) : placements.map((p: any) => (
                    <tr key={p.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg gradient-blue flex items-center justify-center text-white text-xs font-bold">
                            {p.student?.user?.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{p.student?.user?.name}</p>
                            <p className="text-xs text-gray-500">{p.student?.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <p className="font-medium text-gray-900">{p.company?.name}</p>
                          <p className="text-xs text-gray-500">{p.company?.industry}</p>
                        </div>
                      </td>
                      <td className="text-sm text-gray-700">{p.role}</td>
                      <td><span className={clsx('badge', p.type === 'PLACEMENT' ? 'badge-blue' : 'badge-purple')}>{p.type}</span></td>
                      <td className="text-sm font-medium text-emerald-700">
                        {p.salary ? `₹${(p.salary / 100000).toFixed(1)}L` : '-'}
                      </td>
                      <td><span className={clsx('badge', statusColors[p.status] || 'badge-gray')}>{p.status}</span></td>
                      <td className="text-xs text-gray-400">{p.startDate || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'companies' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {companies.map((company: any) => (
            <div key={company.id} className="card-hover">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl gradient-blue flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {company.name?.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{company.name}</h3>
                  <span className="badge badge-blue">{company.industry}</span>
                </div>
              </div>
              {company.location && <p className="text-sm text-gray-500 mb-2">📍 {company.location}</p>}
              {company.hrName && (
                <div className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">HR: </span>{company.hrName}
                </div>
              )}
              {company.hrEmail && <p className="text-xs text-gray-400 mb-3">{company.hrEmail}</p>}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-sm text-gray-600">{company._count?.placements || 0} placements</span>
                {company.website && (
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">Visit ↗</a>
                )}
              </div>
            </div>
          ))}
          {companies.length === 0 && (
            <div className="col-span-3 text-center py-12">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400">No companies registered</p>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
