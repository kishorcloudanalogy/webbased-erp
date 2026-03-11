'use client';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Settings, Users, Shield, Bell, Database, Link, Plus, Edit, ToggleLeft, ToggleRight } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { usersAPI } from '@/lib/api';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const tabs = [
  { key: 'users', label: 'User Management', icon: Users },
  { key: 'system', label: 'System Config', icon: Settings },
  { key: 'nsdc', label: 'NSDC Integration', icon: Link },
  { key: 'security', label: 'Security', icon: Shield },
  { key: 'notifications', label: 'Notifications', icon: Bell },
];

const roleColors: Record<string, string> = {
  ADMIN: 'badge-red', COORDINATOR: 'badge-blue', TRAINER: 'badge-green',
  PLACEMENT_COORDINATOR: 'badge-purple', STUDENT: 'badge-yellow'
};

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('users');
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm();

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => usersAPI.getAll({ limit: 50 }).then(r => r.data),
    enabled: activeTab === 'users',
  });

  const users = usersData?.data || [];

  const createUser = async (data: any) => {
    setIsCreating(true);
    try {
      await usersAPI.create(data);
      toast.success('User created successfully!');
      setShowCreateUser(false);
      reset();
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to create user');
    } finally {
      setIsCreating(false);
    }
  };

  const toggleUserStatus = async (id: string, isActive: boolean) => {
    try {
      await usersAPI.update(id, { isActive: !isActive });
      toast.success(`User ${isActive ? 'deactivated' : 'activated'}`);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    } catch {
      toast.error('Failed to update');
    }
  };

  return (
    <DashboardLayout title="Admin Settings" subtitle="System configuration and user management" requiredRoles={['ADMIN']}>
      {/* Hero */}
      <div className="bg-gradient-to-r from-gray-700 to-slate-800 rounded-2xl p-6 mb-6 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-48 h-48 bg-white/5 rounded-full -translate-y-24 translate-x-24" />
        <h2 className="text-xl font-bold mb-1">System Administration</h2>
        <p className="text-gray-300 text-sm">Manage users, system configuration, NSDC integration, and security settings</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Sidebar Tabs */}
        <div className="lg:w-48 flex-shrink-0">
          <div className="card p-2 space-y-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={clsx('sidebar-item w-full text-left', activeTab === tab.key ? 'sidebar-item-active' : 'sidebar-item-inactive')}>
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'users' && (
            <div className="card">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-gray-900">User Management</h3>
                <button onClick={() => setShowCreateUser(!showCreateUser)} className="btn-primary">
                  <Plus className="w-4 h-4" /> Add User
                </button>
              </div>

              {showCreateUser && (
                <div className="mb-5 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <h4 className="font-semibold text-gray-900 mb-4">Create New User</h4>
                  <form onSubmit={handleSubmit(createUser)} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="label">Full Name *</label>
                      <input {...register('name', { required: true })} className="input-field" placeholder="Full name" />
                    </div>
                    <div>
                      <label className="label">Email *</label>
                      <input {...register('email', { required: true })} type="email" className="input-field" placeholder="Email" />
                    </div>
                    <div>
                      <label className="label">Password *</label>
                      <input {...register('password', { required: true, minLength: 6 })} type="password" className="input-field" placeholder="Min 6 chars" />
                    </div>
                    <div>
                      <label className="label">Role *</label>
                      <select {...register('role', { required: true })} className="input-field">
                        <option value="">Select role</option>
                        <option value="ADMIN">Admin</option>
                        <option value="COORDINATOR">Academic Coordinator</option>
                        <option value="TRAINER">Trainer</option>
                        <option value="PLACEMENT_COORDINATOR">Placement Coordinator</option>
                        <option value="STUDENT">Student</option>
                      </select>
                    </div>
                    <div className="md:col-span-2 flex gap-3">
                      <button type="submit" disabled={isCreating} className="btn-primary">
                        {isCreating ? 'Creating...' : 'Create User'}
                      </button>
                      <button type="button" onClick={() => setShowCreateUser(false)} className="btn-secondary">Cancel</button>
                    </div>
                  </form>
                </div>
              )}

              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr><th>User</th><th>Role</th><th>Last Login</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr><td colSpan={5} className="text-center py-8 text-gray-400">Loading...</td></tr>
                    ) : users.map((user: any) => (
                      <tr key={user.id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl gradient-blue flex items-center justify-center text-white text-sm font-bold">
                              {user.name?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{user.name}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td><span className={clsx('badge', roleColors[user.role] || 'badge-gray')}>{user.role?.replace('_', ' ')}</span></td>
                        <td className="text-xs text-gray-500">
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                        </td>
                        <td>
                          <span className={clsx('badge', user.isActive ? 'badge-green' : 'badge-red')}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <button onClick={() => toggleUserStatus(user.id, user.isActive)}
                            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                            {user.isActive ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4 text-gray-400" />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="card space-y-5">
              <h3 className="font-semibold text-gray-900">System Configuration</h3>
              {[
                { label: 'Application Name', value: 'Skill Training ERP', type: 'text' },
                { label: 'Max Students per Batch', value: '30', type: 'number' },
                { label: 'Session Duration (min)', value: '180', type: 'number' },
                { label: 'Min Attendance %', value: '75', type: 'number' },
                { label: 'Passing Score %', value: '40', type: 'number' },
              ].map(setting => (
                <div key={setting.label} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{setting.label}</p>
                    <p className="text-xs text-gray-400">System-wide configuration</p>
                  </div>
                  <input defaultValue={setting.value} type={setting.type} className="input-field w-40 text-right" />
                </div>
              ))}
              <button className="btn-primary">Save Configuration</button>
            </div>
          )}

          {activeTab === 'nsdc' && (
            <div className="card space-y-5">
              <h3 className="font-semibold text-gray-900">NSDC API Integration</h3>
              <div className="p-4 bg-green-50 rounded-xl border border-green-200 flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-green-700">NSDC API Connected (Mock Mode)</span>
              </div>
              {[
                { label: 'NSDC API URL', value: 'https://api.nsdc.org.in/v1', desc: 'Base URL for NSDC API' },
                { label: 'API Key', value: '••••••••••••••••', desc: 'Your NSDC API authentication key' },
                { label: 'Institution Code', value: 'NSDC-KA-001', desc: 'Registered institution identifier' },
              ].map(field => (
                <div key={field.label}>
                  <label className="label">{field.label}</label>
                  <input defaultValue={field.value} className="input-field" />
                  <p className="text-xs text-gray-400 mt-1">{field.desc}</p>
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <button className="btn-primary">Test Connection</button>
                <button className="btn-secondary">Save Settings</button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="card space-y-4">
              <h3 className="font-semibold text-gray-900">Security Settings</h3>
              {[
                { label: 'Two-Factor Authentication', desc: 'Require 2FA for admin accounts', enabled: false },
                { label: 'Audit Logs', desc: 'Track all user actions', enabled: true },
                { label: 'IP Whitelist', desc: 'Restrict access by IP address', enabled: false },
                { label: 'Session Timeout', desc: 'Auto-logout after 30 min inactivity', enabled: true },
                { label: 'Password Complexity', desc: 'Enforce strong password policy', enabled: true },
              ].map(setting => (
                <div key={setting.label} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{setting.label}</p>
                    <p className="text-xs text-gray-400">{setting.desc}</p>
                  </div>
                  <div className={clsx('w-11 h-6 rounded-full cursor-pointer transition-colors', setting.enabled ? 'bg-blue-600' : 'bg-gray-300')}
                    onClick={() => toast.success('Setting updated')}>
                    <div className={clsx('w-5 h-5 bg-white rounded-full shadow-sm m-0.5 transition-transform', setting.enabled ? 'translate-x-5' : '')} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="card space-y-4">
              <h3 className="font-semibold text-gray-900">Notification Settings</h3>
              {[
                { label: 'Email Notifications', desc: 'Send email alerts for key events', enabled: true },
                { label: 'SMS Notifications', desc: 'Send SMS to students and trainers', enabled: false },
                { label: 'New Enrollment Alerts', desc: 'Notify coordinators on enrollment', enabled: true },
                { label: 'Assessment Reminders', desc: 'Remind students before exams', enabled: true },
                { label: 'Attendance Alerts', desc: 'Alert when attendance drops below threshold', enabled: true },
                { label: 'Placement Updates', desc: 'Notify on new placement opportunities', enabled: false },
              ].map(setting => (
                <div key={setting.label} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{setting.label}</p>
                    <p className="text-xs text-gray-400">{setting.desc}</p>
                  </div>
                  <div className={clsx('w-11 h-6 rounded-full cursor-pointer transition-colors', setting.enabled ? 'bg-blue-600' : 'bg-gray-300')}
                    onClick={() => toast.success('Setting updated')}>
                    <div className={clsx('w-5 h-5 bg-white rounded-full shadow-sm m-0.5 transition-transform', setting.enabled ? 'translate-x-5' : '')} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
