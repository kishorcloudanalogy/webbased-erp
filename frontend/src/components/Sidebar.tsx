'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, Calendar, ClipboardList,
  MessageSquare, Briefcase, FileText, BarChart3, Settings, LogOut,
  ChevronLeft, ChevronRight, Award, Building2, UserCheck, Menu, X, Shield
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { authAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'COORDINATOR', 'TRAINER', 'PLACEMENT_COORDINATOR', 'STUDENT'] },
  { label: 'Students', href: '/students', icon: Users, roles: ['ADMIN', 'COORDINATOR'] },
  { label: 'Trainers', href: '/trainers', icon: UserCheck, roles: ['ADMIN', 'COORDINATOR'] },
  { label: 'Courses', href: '/courses', icon: BookOpen, roles: ['ADMIN', 'COORDINATOR', 'TRAINER', 'STUDENT'] },
  { label: 'Batches', href: '/batches', icon: GraduationCap, roles: ['ADMIN', 'COORDINATOR', 'TRAINER', 'STUDENT'] },
  { label: 'Attendance', href: '/attendance', icon: Calendar, roles: ['ADMIN', 'COORDINATOR', 'TRAINER', 'STUDENT'] },
  { label: 'Assessments', href: '/assessments', icon: ClipboardList, roles: ['ADMIN', 'COORDINATOR', 'TRAINER', 'STUDENT'] },
  { label: 'Feedback', href: '/feedback', icon: MessageSquare, roles: ['ADMIN', 'COORDINATOR', 'TRAINER', 'STUDENT'] },
  { label: 'Placements', href: '/placements', icon: Briefcase, roles: ['ADMIN', 'COORDINATOR', 'PLACEMENT_COORDINATOR', 'STUDENT'] },
  { label: 'Documents', href: '/documents', icon: FileText, roles: ['ADMIN', 'COORDINATOR', 'TRAINER', 'STUDENT'] },
  { label: 'Reports', href: '/reports', icon: BarChart3, roles: ['ADMIN', 'COORDINATOR', 'PLACEMENT_COORDINATOR'] },
  { label: 'Admin Settings', href: '/admin/settings', icon: Settings, roles: ['ADMIN'] },
];

const roleColors: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-700',
  COORDINATOR: 'bg-blue-100 text-blue-700',
  TRAINER: 'bg-green-100 text-green-700',
  PLACEMENT_COORDINATOR: 'bg-purple-100 text-purple-700',
  STUDENT: 'bg-amber-100 text-amber-700',
};

const roleLabels: Record<string, string> = {
  ADMIN: 'Admin',
  COORDINATOR: 'Coordinator',
  TRAINER: 'Trainer',
  PLACEMENT_COORDINATOR: 'Placement',
  STUDENT: 'Student',
};

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  const filteredNavItems = navItems.filter(item => user && item.roles.includes(user.role));

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch {}
    clearAuth();
    router.push('/login');
    toast.success('Logged out successfully');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-gray-100">
        <div className={clsx('flex items-center gap-3', collapsed && 'justify-center')}>
          <div className="w-9 h-9 rounded-xl gradient-blue flex items-center justify-center shadow-md flex-shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-sm font-bold text-gray-900 leading-tight">Skill ERP</h1>
              <p className="text-xs text-gray-500">NSDC Platform</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={clsx(
                'sidebar-item',
                isActive ? 'sidebar-item-active' : 'sidebar-item-inactive',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="px-3 py-4 border-t border-gray-100">
        {!collapsed ? (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
            <div className="w-8 h-8 rounded-full gradient-blue flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">{user?.name}</p>
              <span className={clsx('text-[10px] font-medium px-1.5 py-0.5 rounded-full', roleColors[user?.role || ''])}>
                {roleLabels[user?.role || '']}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full gradient-blue flex items-center justify-center text-white text-xs font-bold cursor-pointer">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={clsx(
            'mt-2 flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-red-600 transition-colors px-3 py-2 rounded-xl hover:bg-red-50 w-full',
            collapsed && 'justify-center'
          )}
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && 'Sign Out'}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-lg border border-gray-200"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <div className={clsx(
        'lg:hidden fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-2xl transition-transform duration-300',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <SidebarContent />
      </div>

      {/* Desktop sidebar */}
      <div className={clsx(
        'hidden lg:flex flex-col bg-white border-r border-gray-100 shadow-sm transition-all duration-300 h-screen sticky top-0',
        collapsed ? 'w-16' : 'w-64'
      )}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 z-10 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
        >
          {collapsed ? <ChevronRight className="w-3 h-3 text-gray-600" /> : <ChevronLeft className="w-3 h-3 text-gray-600" />}
        </button>
        <SidebarContent />
      </div>
    </>
  );
}
