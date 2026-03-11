'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { ArrowLeft, User, Mail, Lock, Phone, MapPin, BookOpen, CreditCard } from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { studentsAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface StudentForm {
  name: string; email: string; password: string;
  dob: string; gender: string; mobile: string; address: string;
  aadhaarNumber: string; qualification: string; skills: string;
}

export default function CreateStudentPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<StudentForm>();

  const onSubmit = async (data: StudentForm) => {
    setIsLoading(true);
    try {
      await studentsAPI.create(data);
      toast.success('Student created successfully!');
      router.push('/students');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create student');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout title="Add New Student" subtitle="Create a new student profile" requiredRoles={['ADMIN', 'COORDINATOR']}>
      <div className="max-w-3xl mx-auto">
        <Link href="/students" className="btn-secondary mb-6 inline-flex">
          <ArrowLeft className="w-4 h-4" /> Back to Students
        </Link>

        {/* Header Card */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">New Student Registration</h2>
              <p className="text-blue-100 text-sm">Fill in the details below to register a new student</p>
              <div className="flex gap-4 mt-2 text-xs text-blue-200">
                <span>✓ NSDC Compliant</span>
                <span>✓ Auto-generates Student ID</span>
                <span>✓ Sends Welcome Email</span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Personal Info */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" /> Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name *</label>
                <input {...register('name', { required: 'Name is required' })} className="input-field" placeholder="Enter full name" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="label">Email Address *</label>
                <input {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })} type="email" className="input-field" placeholder="student@email.com" />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label className="label">Password *</label>
                <input {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 chars' } })} type="password" className="input-field" placeholder="Set a password" />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>
              <div>
                <label className="label">Date of Birth</label>
                <input {...register('dob')} type="date" className="input-field" />
              </div>
              <div>
                <label className="label">Gender</label>
                <select {...register('gender')} className="input-field">
                  <option value="">Select gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="label">Mobile Number</label>
                <input {...register('mobile')} type="tel" className="input-field" placeholder="10-digit mobile" />
              </div>
            </div>
          </div>

          {/* Address & Identity */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" /> Address & Identity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="label">Address</label>
                <textarea {...register('address')} className="input-field h-20 resize-none" placeholder="Full address" />
              </div>
              <div>
                <label className="label">Aadhaar / ID Number</label>
                <input {...register('aadhaarNumber')} className="input-field" placeholder="XXXX-XXXX-XXXX" />
              </div>
            </div>
          </div>

          {/* Academic Info */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" /> Academic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Highest Qualification</label>
                <select {...register('qualification')} className="input-field">
                  <option value="">Select qualification</option>
                  <option>10th Pass</option>
                  <option>12th Pass</option>
                  <option>Diploma</option>
                  <option>B.A.</option>
                  <option>B.Sc</option>
                  <option>B.Com</option>
                  <option>B.Tech / B.E.</option>
                  <option>BCA</option>
                  <option>MCA</option>
                  <option>M.Tech</option>
                  <option>MBA</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="label">Skills / Interests</label>
                <input {...register('skills')} className="input-field" placeholder="e.g., Python, Web Design" />
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Link href="/students" className="btn-secondary">Cancel</Link>
            <button type="submit" disabled={isLoading} className="btn-primary">
              {isLoading ? 'Creating...' : 'Create Student'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
