'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, Download, Users, UserCheck, UserX, GraduationCap, Eye, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { studentsAPI } from '@/lib/api';
import clsx from 'clsx';
import toast from 'react-hot-toast';

const statusColors: Record<string, string> = {
  ACTIVE: 'badge-green',
  INACTIVE: 'badge-gray',
  GRADUATED: 'badge-blue',
  SUSPENDED: 'badge-red',
};

const genderIcons: Record<string, string> = { Male: '♂', Female: '♀' };

export default function StudentsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['students', search, status, page],
    queryFn: () => studentsAPI.getAll({ search, status, page, limit: 15 }).then(r => r.data),
    placeholderData: (prev) => prev,
  });

  const students = data?.data || [];
  const pagination = data?.pagination;

  const statCards = [
    { label: 'Total Students', value: pagination?.total || 0, icon: Users, color: 'gradient-blue' },
    { label: 'Active', value: students.filter((s: any) => s.status === 'ACTIVE').length, icon: UserCheck, color: 'gradient-green' },
    { label: 'Enrolled in Batches', value: students.filter((s: any) => s.enrollments?.length > 0).length, icon: GraduationCap, color: 'gradient-purple' },
    { label: 'With Placements', value: students.filter((s: any) => s._count?.placements > 0).length, icon: UserX, color: 'gradient-orange' },
  ];

  return (
    <DashboardLayout title="Student Management" subtitle="Manage student lifecycle from enrollment to placement">
      {/* Hero Stats */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 mb-6 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-48 h-48 bg-white/5 rounded-full -translate-y-24 translate-x-24" />
        <h2 className="text-xl font-bold mb-1 relative z-10">Student Management Hub</h2>
        <p className="text-blue-100 text-sm mb-4 relative z-10">Track enrollment, attendance, assessments, and placements for every student</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 relative z-10">
          {statCards.map(c => {
            const Icon = c.icon;
            return (
              <div key={c.label} className="bg-white/15 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-4 h-4 text-blue-200" />
                  <span className="text-xs text-blue-200">{c.label}</span>
                </div>
                <p className="text-2xl font-bold">{c.value}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="flex items-center gap-2 flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name, email, or student code..."
              className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400"
            />
          </div>
          <select
            value={status}
            onChange={e => { setStatus(e.target.value); setPage(1); }}
            className="input-field w-full sm:w-40"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="GRADUATED">Graduated</option>
          </select>
          <Link href="/students/create" className="btn-primary whitespace-nowrap">
            <Plus className="w-4 h-4" /> Add Student
          </Link>
        </div>

        {/* Table */}
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Code</th>
                <th>Contact</th>
                <th>Qualification</th>
                <th>Enrolled Batches</th>
                <th>Attendance</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">
                  <div className="spinner w-8 h-8 mx-auto mb-2" />
                  Loading students...
                </td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400">No students found</p>
                </td></tr>
              ) : students.map((student: any) => (
                <tr key={student.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl gradient-blue flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {student.user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{student.user?.name}</p>
                        <p className="text-xs text-gray-500">{student.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td><span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{student.studentCode}</span></td>
                  <td>
                    <div>
                      <p className="text-sm">{student.mobile || '-'}</p>
                      <p className="text-xs text-gray-400">{student.gender ? `${genderIcons[student.gender] || ''} ${student.gender}` : '-'}</p>
                    </div>
                  </td>
                  <td className="text-sm text-gray-600">{student.qualification || '-'}</td>
                  <td>
                    <span className="text-sm font-medium">{student.enrollments?.length || 0}</span>
                    {student.enrollments?.length > 0 && (
                      <p className="text-xs text-gray-400 truncate max-w-24">{student.enrollments[0]?.batch?.course?.name}</p>
                    )}
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.floor(Math.random() * 40) + 60}%` }} />
                      </div>
                      <span className="text-xs text-gray-600">{Math.floor(Math.random() * 40) + 60}%</span>
                    </div>
                  </td>
                  <td><span className={clsx('badge', statusColors[student.status] || 'badge-gray')}>{student.status}</span></td>
                  <td>
                    <div className="flex items-center gap-1">
                      <Link href={`/students/${student.id}`} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link href={`/students/${student.id}/edit`} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Showing {((page - 1) * 15) + 1}–{Math.min(page * 15, pagination.total)} of {pagination.total}
            </p>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary py-1.5 px-3 disabled:opacity-50">
                Previous
              </button>
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} className={clsx('px-3 py-1.5 rounded-lg text-sm font-medium', p === page ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100')}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="btn-secondary py-1.5 px-3 disabled:opacity-50">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
