'use client';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Mail, Phone, MapPin, BookOpen, Calendar, Award, Briefcase, FileText, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { studentsAPI } from '@/lib/api';
import clsx from 'clsx';

export default function StudentProfilePage({ params }: { params: { id: string } }) {
  const { data, isLoading } = useQuery({
    queryKey: ['student', params.id],
    queryFn: () => studentsAPI.getById(params.id).then(r => r.data.data),
  });

  if (isLoading) return (
    <DashboardLayout title="Student Profile">
      <div className="flex items-center justify-center h-64">
        <div className="spinner w-10 h-10" />
      </div>
    </DashboardLayout>
  );

  if (!data) return (
    <DashboardLayout title="Student Profile">
      <div className="text-center py-12"><p className="text-gray-500">Student not found</p></div>
    </DashboardLayout>
  );

  const student = data;

  return (
    <DashboardLayout title="Student Profile" subtitle={student.user?.name}>
      <div className="max-w-5xl mx-auto space-y-5">
        <Link href="/students" className="btn-secondary inline-flex">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-4xl font-bold text-white flex-shrink-0">
              {student.user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-start gap-3">
                <div>
                  <h1 className="text-2xl font-bold">{student.user?.name}</h1>
                  <p className="text-blue-200">{student.user?.email}</p>
                </div>
                <span className="badge bg-white/20 text-white px-3 py-1 text-sm">{student.studentCode}</span>
              </div>
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-blue-100">
                {student.mobile && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{student.mobile}</span>}
                {student.qualification && <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3" />{student.qualification}</span>}
                {student.gender && <span>{student.gender}</span>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Attendance', value: `${student.attendancePercentage || 0}%` },
                { label: 'Assessments', value: student._count?.results || 0 },
                { label: 'Enrollments', value: student._count?.enrollments || 0 },
                { label: 'Placements', value: student._count?.placements || 0 },
              ].map(m => (
                <div key={m.label} className="bg-white/15 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold">{m.value}</p>
                  <p className="text-xs text-blue-200">{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Personal Details */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Personal Details</h3>
            <div className="space-y-3 text-sm">
              {[
                { icon: Mail, label: 'Email', value: student.user?.email },
                { icon: Phone, label: 'Mobile', value: student.mobile },
                { icon: Calendar, label: 'DOB', value: student.dob },
                { icon: MapPin, label: 'Address', value: student.address },
                { icon: BookOpen, label: 'Qualification', value: student.qualification },
              ].map(({ icon: Icon, label, value }) => value ? (
                <div key={label} className="flex items-start gap-2">
                  <Icon className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="text-gray-700">{value}</p>
                  </div>
                </div>
              ) : null)}
            </div>
          </div>

          {/* Enrollments */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-600" /> Enrolled Batches
            </h3>
            <div className="space-y-2">
              {student.enrollments?.length > 0 ? student.enrollments.map((e: any) => (
                <div key={e.id} className="p-3 bg-blue-50 rounded-xl">
                  <p className="text-sm font-medium text-gray-900">{e.batch?.name}</p>
                  <p className="text-xs text-gray-500">{e.batch?.course?.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-full', e.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600')}>
                      {e.status}
                    </span>
                  </div>
                </div>
              )) : <p className="text-sm text-gray-400">No enrollments</p>}
            </div>
          </div>

          {/* Assessment Results */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-600" /> Assessment Results
            </h3>
            <div className="space-y-2">
              {student.results?.length > 0 ? student.results.map((r: any) => (
                <div key={r.id} className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-sm font-medium text-gray-900">{r.assessment?.title}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm text-gray-600">{r.score}/{r.totalMarks}</span>
                    <span className={clsx('text-xs font-bold px-2 py-0.5 rounded-full', r.isPassed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                      {r.grade || (r.isPassed ? 'Pass' : 'Fail')}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full mt-2">
                    <div className={`h-full rounded-full ${r.isPassed ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${r.percentage}%` }} />
                  </div>
                </div>
              )) : <p className="text-sm text-gray-400">No results yet</p>}
            </div>
          </div>
        </div>

        {/* Placements */}
        {student.placements?.length > 0 && (
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-600" /> Placement History
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {student.placements.map((p: any) => (
                <div key={p.id} className="p-4 border border-gray-100 rounded-xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{p.company?.name}</p>
                      <p className="text-sm text-gray-600">{p.role}</p>
                      {p.salary && <p className="text-sm font-semibold text-green-600">₹{p.salary.toLocaleString()}/yr</p>}
                    </div>
                    <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', p.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700')}>
                      {p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
