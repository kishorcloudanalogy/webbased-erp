'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ClipboardList, Trophy, AlertCircle, CheckCircle, Clock, Plus, Filter } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { assessmentsAPI } from '@/lib/api';
import clsx from 'clsx';

const typeColors: Record<string, string> = { MID: 'badge-blue', FINAL: 'badge-purple', PRACTICE: 'badge-green' };
const statusColors: Record<string, string> = { SCHEDULED: 'badge-yellow', ACTIVE: 'badge-blue', COMPLETED: 'badge-green', CANCELLED: 'badge-red' };

export default function AssessmentsPage() {
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [activeTab, setActiveTab] = useState<'assessments' | 'results'>('assessments');

  const { data, isLoading } = useQuery({
    queryKey: ['assessments', type, status],
    queryFn: () => assessmentsAPI.getAll({ type: type || undefined, status: status || undefined, limit: 30 }).then(r => r.data),
  });

  const { data: resultsData, isLoading: loadingResults } = useQuery({
    queryKey: ['results'],
    queryFn: () => assessmentsAPI.getResults({ limit: 20 }).then(r => r.data),
    enabled: activeTab === 'results',
  });

  const assessments = data?.data || [];
  const results = resultsData?.data || [];

  const passRate = results.length > 0 ? Math.round((results.filter((r: any) => r.isPassed).length / results.length) * 100) : 0;

  return (
    <DashboardLayout title="Assessments & Examinations" subtitle="Manage exams, question banks, and student results">
      {/* Hero */}
      <div className="bg-gradient-to-r from-purple-600 to-violet-700 rounded-2xl p-6 mb-6 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-48 h-48 bg-white/5 rounded-full -translate-y-24 translate-x-24" />
        <h2 className="text-xl font-bold mb-1">Assessment Center</h2>
        <p className="text-purple-100 text-sm mb-4">Create, schedule, and evaluate student assessments with automated scoring</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Assessments', value: assessments.length },
            { label: 'Results Recorded', value: results.length },
            { label: 'Pass Rate', value: `${passRate}%` },
            { label: 'Avg Score', value: results.length > 0 ? `${Math.round(results.reduce((s: number, r: any) => s + r.percentage, 0) / results.length)}%` : '0%' },
          ].map(s => (
            <div key={s.label} className="bg-white/15 rounded-xl p-3 border border-white/20">
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-xs text-purple-200">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-xl w-fit">
        {[{ key: 'assessments', label: 'Assessments' }, { key: 'results', label: 'Results' }].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
            className={clsx('px-5 py-2 rounded-xl text-sm font-medium transition-all', activeTab === tab.key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700')}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'assessments' && (
        <>
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <select value={type} onChange={e => setType(e.target.value)} className="input-field w-full sm:w-40">
              <option value="">All Types</option>
              <option value="MID">Mid Assessment</option>
              <option value="FINAL">Final Assessment</option>
              <option value="PRACTICE">Practice</option>
            </select>
            <select value={status} onChange={e => setStatus(e.target.value)} className="input-field w-full sm:w-40">
              <option value="">All Status</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {assessments.map((assessment: any) => (
                <div key={assessment.id} className="card-hover">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl gradient-purple flex items-center justify-center">
                      <ClipboardList className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex gap-1">
                      <span className={clsx('badge', typeColors[assessment.type])}>{assessment.type}</span>
                      <span className={clsx('badge', statusColors[assessment.status] || 'badge-gray')}>{assessment.status}</span>
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{assessment.title}</h3>
                  <p className="text-sm text-gray-500 mb-3">{assessment.batch?.course?.name} • {assessment.batch?.name}</p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {[
                      { label: 'Marks', value: assessment.totalMarks },
                      { label: 'Pass', value: assessment.passingMarks },
                      { label: 'Duration', value: `${assessment.duration}m` },
                    ].map(m => (
                      <div key={m.label} className="bg-gray-50 rounded-xl p-2">
                        <p className="text-sm font-bold text-gray-900">{m.value}</p>
                        <p className="text-xs text-gray-400">{m.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {assessment.scheduledAt}
                    </span>
                    <span className="text-xs text-gray-600">{assessment._count?.results || 0} results</span>
                  </div>
                </div>
              ))}
              {assessments.length === 0 && (
                <div className="col-span-3 text-center py-12">
                  <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400">No assessments found</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {activeTab === 'results' && (
        <div className="card">
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Assessment</th>
                  <th>Type</th>
                  <th>Score</th>
                  <th>Grade</th>
                  <th>Status</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {loadingResults ? (
                  <tr><td colSpan={7} className="text-center py-8 text-gray-400">Loading...</td></tr>
                ) : results.map((result: any) => (
                  <tr key={result.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg gradient-purple flex items-center justify-center text-white text-xs font-bold">
                          {result.student?.user?.name?.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900">{result.student?.user?.name}</span>
                      </div>
                    </td>
                    <td className="text-sm text-gray-700">{result.assessment?.title}</td>
                    <td><span className={clsx('badge', typeColors[result.assessment?.type])}>{result.assessment?.type}</span></td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{result.score}/{result.totalMarks}</span>
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full">
                          <div className={`h-full rounded-full ${result.isPassed ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${result.percentage}%` }} />
                        </div>
                        <span className="text-xs text-gray-500">{Math.round(result.percentage)}%</span>
                      </div>
                    </td>
                    <td><span className="font-bold text-gray-900">{result.grade || '-'}</span></td>
                    <td>
                      {result.isPassed ? (
                        <span className="badge badge-green flex items-center gap-1 w-fit"><CheckCircle className="w-3 h-3" />Pass</span>
                      ) : (
                        <span className="badge badge-red flex items-center gap-1 w-fit"><AlertCircle className="w-3 h-3" />Fail</span>
                      )}
                    </td>
                    <td className="text-xs text-gray-400">{new Date(result.submittedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
