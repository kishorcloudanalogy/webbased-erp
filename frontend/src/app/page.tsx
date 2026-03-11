'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) router.replace('/dashboard');
    else router.replace('/login');
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700">
      <div className="text-center text-white">
        <div className="w-16 h-16 spinner mx-auto mb-4" style={{ border: '3px solid rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
        <p className="text-lg font-medium opacity-75">Loading...</p>
      </div>
    </div>
  );
}
