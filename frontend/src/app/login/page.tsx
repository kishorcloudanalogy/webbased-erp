'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Shield, GraduationCap, Users, BookOpen, Award, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

interface LoginForm {
  email: string;
  password: string;
}

const demoCredentials = [
  { role: 'Admin', email: 'admin@erp.com', password: 'admin123', color: 'from-red-500 to-rose-600', icon: Shield },
  { role: 'Coordinator', email: 'academic@erp.com', password: 'password123', color: 'from-blue-500 to-indigo-600', icon: Users },
  { role: 'Trainer', email: 'trainer@erp.com', password: 'password123', color: 'from-green-500 to-emerald-600', icon: GraduationCap },
  { role: 'Placement', email: 'placement@erp.com', password: 'password123', color: 'from-purple-500 to-violet-600', icon: BookOpen },
  { role: 'Student', email: 'student@erp.com', password: 'password123', color: 'from-amber-500 to-orange-600', icon: Award },
];

const stats = [
  { label: 'Students Enrolled', value: '15,000+' },
  { label: 'Training Courses', value: '200+' },
  { label: 'Placement Rate', value: '87%' },
  { label: 'Industry Partners', value: '500+' },
];

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setAuth, isAuthenticated } = useAuthStore();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginForm>();

  useEffect(() => {
    if (isAuthenticated) router.replace('/dashboard');
  }, [isAuthenticated, router]);

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const res = await authAPI.login(data.email, data.password);
      const { token, user } = res.data.data;
      setAuth(user, token);
      toast.success(`Welcome back, ${user.name}!`);
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-40 translate-x-40" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-32 -translate-x-32" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Skill Training ERP</h1>
              <p className="text-blue-200 text-sm">NSDC Integrated Platform</p>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
              Empowering Skills,<br />
              <span className="text-blue-200">Transforming Futures</span>
            </h2>
            <p className="text-blue-100 text-lg leading-relaxed">
              Complete lifecycle management for skill training institutes. From enrollment to placement, manage everything in one platform.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-12">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-blue-200 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="space-y-3">
            {['Student Lifecycle Management', 'NSDC API Integration', 'Real-time Analytics & Reports', 'Assessment & Certification'].map(feature => (
              <div key={feature} className="flex items-center gap-2 text-blue-100">
                <div className="w-5 h-5 rounded-full bg-blue-400/30 flex items-center justify-center">
                  <ChevronRight className="w-3 h-3 text-blue-200" />
                </div>
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-blue-300 text-sm">
          © 2024 Skill Training ERP. Powered by NSDC Framework.
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 gradient-blue rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Skill Training ERP</h1>
              <p className="text-gray-500 text-xs">NSDC Platform</p>
            </div>
          </div>

          <div className="card">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
              <p className="text-gray-500 mt-1">Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="label">Email Address</label>
                <input
                  {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })}
                  type="email"
                  className="input-field"
                  placeholder="Enter your email"
                  autoComplete="email"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                    type={showPassword ? 'text' : 'password'}
                    className="input-field pr-10"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center py-3">
                {isLoading ? (
                  <span className="flex items-center gap-2"><span className="spinner w-4 h-4" />Signing in...</span>
                ) : 'Sign In'}
              </button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Login (Demo)</p>
              <div className="grid grid-cols-1 gap-2">
                {demoCredentials.map((cred) => {
                  const Icon = cred.icon;
                  return (
                    <button
                      key={cred.role}
                      onClick={() => { setValue('email', cred.email); setValue('password', cred.password); }}
                      className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all text-left group"
                    >
                      <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${cred.color} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-semibold text-gray-700 block">{cred.role}</span>
                        <span className="text-xs text-gray-400 truncate block">{cred.email}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-blue-400 transition-colors" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
