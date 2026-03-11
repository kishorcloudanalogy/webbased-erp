'use client';
import { Bell, Search, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const { user } = useAuthStore();
  const [notifOpen, setNotifOpen] = useState(false);

  const notifications = [
    { id: 1, message: 'New student enrollment in FSWB-2024-01', time: '2m ago', unread: true },
    { id: 2, message: 'Assessment scheduled for next week', time: '1h ago', unread: true },
    { id: 3, message: 'Trainer Amit submitted session log', time: '3h ago', unread: false },
  ];

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-400 w-48 cursor-pointer hover:border-blue-300 transition-colors">
          <Search className="w-4 h-4" />
          <span>Search...</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-50">
              <div className="px-3 py-2 border-b border-gray-100 mb-1">
                <span className="text-sm font-semibold text-gray-900">Notifications</span>
              </div>
              {notifications.map(n => (
                <div key={n.id} className={`px-3 py-2.5 rounded-xl hover:bg-gray-50 cursor-pointer ${n.unread ? 'bg-blue-50/50' : ''}`}>
                  <p className="text-sm text-gray-800">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 rounded-full gradient-blue flex items-center justify-center text-white text-sm font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-gray-900 leading-tight">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
