'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, Download, TrendingUp, Users, GraduationCap, Briefcase, CheckCircle, AlertCircle, Shield } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { reportsAPI } from '@/lib/api';
import clsx from 'clsx';

const reportTypes = [
  { key: 'student-progress', label: 'Student Progress', icon: Users, color: 'from-blue-500 to-indigo-600', desc: 'Attendance, scores, and completion status' },
  { key: 'trainer-performance', label: 'Trainer Performance', icon: GraduationCap, color: 'from-green-500 to-teal-600', desc: 'Session counts, feedback ratings' },
  { key: 'placement', label: 'Placement Report', icon: Briefcase, color: 'from-purple-500 to-violet-600', desc: 'Placement rates, salary data, companies' },
  { key: 'attendance', label: 'Attendance Report', icon: BarChart3, color: 'from-orange-500 to-amber-600', desc: 'Session-wise attendance analytics' },
  { key: 'nsdc-compliance', label: 'NSDC Compliance', icon: Shield, color: 'from-red-500 to-rose-600', desc: 'NSDC registration and mapping status' },
];

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState('student-progress');

  const { data: studentData, isLoading: loadingStudents } = useQuery({
    queryKey: ['report-students'],
    queryFn: () => reportsAPI.getStudentProgress().then(r => r.data.data),
    enabled: activeReport === 'student-progress',
  });

  const { data: trainerData, isLoading: loadingTrainers } = useQuery({
    queryKey: ['report-trainers'],
    queryFn: () => reportsAPI.getTrainerPerformance().then(r => r.data.data),
    enabled: activeReport === 'trainer-performance',
  });

  const { data: placementReport, isLoading: loadingPlacement } = useQuery({
    queryKey: ['report-placement'],
    queryFn: () => reportsAPI.getPlacement().then(r => r.data.data),
    enabled: activeReport === 'placement',
  });

  const { data: attendanceReport, isLoading: loadingAttendance } = useQuery({
    queryKey: ['report-attendance'],
    queryFn: () => reportsAPI.getAttendance().then(r => r.data.data),
    enabled: activeReport === 'attendance',
  });

  const { data: nsdcReport, isLoading: loadingNsdc } = useQuery({
    queryKey: ['report-nsdc'],
    queryFn: () => reportsAPI.getNsdcCompliance().then(r => r.data.data),
    enabled: activeReport === 'nsdc-compliance',
  });

  const isLoading = loadingStudents || loadingTrainers || loadingPlacement || loadingAttendance || loadingNsdc;
  const currentType = reportTypes.find(r => r.key === activeReport);

  return (
    <DashboardLayout title="Reports & Analytics" subtitle="Comprehensive reporting for academic and operational metrics">
      {/* Hero */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 mb-6 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-48 h-48 bg-white/5 rounded-full -translate-y-24 translate-x-24" />
        <h2 className="text-xl font-bold mb-1">Reporting Center</h2>
        <p className="text-gray-300 text-sm mb-4">Generate comprehensive reports for NSDC compliance, academic performance, and placement outcomes</p>
        <div className="flex flex-wrap gap-2">
          {['Student Progress', 'NSDC Compliance', 'Trainer KPIs', 'Placement Analytics', 'Attendance Summary'].map(tag => (
            <span key={tag} className="bg-white/10 text-white text-xs px-3 py-1 rounded-full border border-white/20">{tag}</span>
          ))}
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        {reportTypes.map(type => {
          const Icon = type.icon;
          return (
            <button key={type.key} onClick={() => setActiveReport(type.key)}
              className={clsx('p-4 rounded-2xl border text-left transition-all', activeReport === type.key ? 'border-transparent shadow-md' : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm')}>
              <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center mb-3', activeReport === type.key ? `bg-gradient-to-br ${type.color} text-white` : 'bg-gray-100 text-gray-500')}>
                <Icon className="w-5 h-5" />
              </div>
              <p className={clsx('text-sm font-semibold', activeReport === type.key ? 'text-gray-900' : 'text-gray-700')}>{type.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{type.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Report Content */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            {currentType && <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${currentType.color} flex items-center justify-center`}>
              {(() => { const Icon = currentType.icon; return <Icon className="w-4 h-4 text-white" />; })()}
            </div>}
            <h3 className="font-semibold text-gray-900">{currentType?.label} Report</h3>
          </div>
          <button className="btn-secondary text-xs">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="spinner w-8 h-8 mr-3" />
            <span className="text-gray-500">Generating report...</span>
          </div>
        ) : activeReport === 'student-progress' && (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Student Code</th><th>Name</th><th>Enrolled Courses</th>
                  <th>Attendance %</th><th>Avg Score</th><th>Assessments</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(studentData || []).map((s: any, i: number) => (
                  <tr key={i}>
                    <td><span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{s.studentCode}</span></td>
                    <td><div><p className="font-medium text-gray-900">{s.name}</p><p className="text-xs text-gray-500">{s.email}</p></div></td>
                    <td className="text-sm text-gray-700 max-w-32 truncate">{s.enrolledCourses || '-'}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-14 h-1.5 bg-gray-100 rounded-full">
                          <div className={`h-full rounded-full ${s.attendancePercentage >= 75 ? 'bg-green-500' : 'bg-amber-500'}`} style={{ width: `${s.attendancePercentage}%` }} />
                        </div>
                        <span className="text-sm font-medium">{s.attendancePercentage}%</span>
                      </div>
                    </td>
                    <td><span className="font-semibold text-gray-900">{s.avgAssessmentScore}%</span></td>
                    <td><span className="text-sm">{s.passedAssessments}/{s.totalAssessments}</span></td>
                    <td><span className={clsx('badge', s.status === 'ACTIVE' ? 'badge-green' : 'badge-gray')}>{s.status}</span></td>
                  </tr>
                ))}
                {(!studentData || studentData.length === 0) && (
                  <tr><td colSpan={7} className="text-center py-8 text-gray-400">No data available</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeReport === 'trainer-performance' && (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr><th>Code</th><th>Name</th><th>Domain</th><th>Experience</th><th>Batches</th><th>Sessions</th><th>Avg Rating</th></tr>
              </thead>
              <tbody>
                {(trainerData || []).map((t: any, i: number) => (
                  <tr key={i}>
                    <td><span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{t.trainerCode}</span></td>
                    <td className="font-medium text-gray-900">{t.name}</td>
                    <td className="text-sm text-gray-700">{t.domain || '-'}</td>
                    <td className="text-sm">{t.experience ? `${t.experience}y` : '-'}</td>
                    <td><span className="font-semibold">{t.totalBatches}</span></td>
                    <td><span className="font-semibold">{t.totalSessions}</span></td>
                    <td>
                      <div className="flex items-center gap-1">
                        <span className="text-amber-500">★</span>
                        <span className="font-semibold">{t.avgRating || 'N/A'}</span>
                        <span className="text-xs text-gray-400">({t.totalFeedbacks})</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeReport === 'nsdc-compliance' && nsdcReport && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { label: 'Student NSDC Registration', value: nsdcReport.nsdcRegistered, total: nsdcReport.totalStudents, rate: nsdcReport.registrationRate, color: 'bg-blue-500' },
              { label: 'Batch NSDC Mapping', value: nsdcReport.nsdcMappedBatches, total: nsdcReport.totalBatches, rate: nsdcReport.batchMappingRate, color: 'bg-green-500' },
              { label: 'Certification Rate', value: nsdcReport.certifiedStudents, total: nsdcReport.totalStudents, rate: nsdcReport.certificationRate, color: 'bg-purple-500' },
            ].map(item => (
              <div key={item.label} className="p-5 bg-gray-50 rounded-2xl">
                <p className="text-sm font-medium text-gray-700 mb-3">{item.label}</p>
                <p className="text-3xl font-bold text-gray-900 mb-1">{item.rate}%</p>
                <p className="text-sm text-gray-500 mb-3">{item.value} / {item.total}</p>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.rate}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {activeReport === 'placement' && placementReport && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-5">
              {[
                { label: 'Total', value: placementReport.stats?.total, color: 'bg-blue-50 text-blue-700' },
                { label: 'Accepted', value: placementReport.stats?.accepted, color: 'bg-green-50 text-green-700' },
                { label: 'Internships', value: placementReport.stats?.internships, color: 'bg-purple-50 text-purple-700' },
                { label: 'Full-Time', value: placementReport.stats?.fullPlacements, color: 'bg-indigo-50 text-indigo-700' },
                { label: 'Avg Package', value: `₹${((placementReport.stats?.avgSalary || 0) / 100000).toFixed(1)}L`, color: 'bg-amber-50 text-amber-700' },
              ].map(s => (
                <div key={s.label} className={`p-4 rounded-2xl text-center ${s.color}`}>
                  <p className="text-xl font-bold">{s.value}</p>
                  <p className="text-xs mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="table-wrapper">
              <table className="table">
                <thead><tr><th>Student</th><th>Company</th><th>Role</th><th>Type</th><th>Salary</th><th>Status</th></tr></thead>
                <tbody>
                  {(placementReport.placements || []).slice(0, 10).map((p: any, i: number) => (
                    <tr key={i}>
                      <td className="font-medium text-gray-900">{p.student?.user?.name}</td>
                      <td className="text-sm text-gray-700">{p.company?.name}</td>
                      <td className="text-sm text-gray-700">{p.role}</td>
                      <td><span className={clsx('badge', p.type === 'PLACEMENT' ? 'badge-blue' : 'badge-purple')}>{p.type}</span></td>
                      <td className="text-sm font-medium text-emerald-700">{p.salary ? `₹${(p.salary / 100000).toFixed(1)}L` : '-'}</td>
                      <td><span className={clsx('badge', p.status === 'ACCEPTED' ? 'badge-green' : 'badge-yellow')}>{p.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
