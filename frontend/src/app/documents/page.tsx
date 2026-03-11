'use client';
import { useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FileText, Upload, Download, Eye, Trash2, CheckCircle, FolderOpen, Search, File, Image, Video } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { documentsAPI } from '@/lib/api';
import clsx from 'clsx';
import toast from 'react-hot-toast';

const categories = ['ALL', 'STUDENT_DOCS', 'COURSE_MATERIAL', 'INSTITUTIONAL', 'REPORTS', 'OTHER'];
const typeIcons: Record<string, any> = {
  'application/pdf': File,
  'image/jpeg': Image,
  'image/png': Image,
  'video/mp4': Video,
};

const categoryColors: Record<string, string> = {
  AADHAAR: 'badge-blue', CERTIFICATE: 'badge-green', RESUME: 'badge-purple',
  MOU: 'badge-orange', COURSE_MATERIAL: 'badge-teal', REPORT: 'badge-red', OTHER: 'badge-gray'
};

function formatFileSize(bytes: number) {
  if (!bytes) return '-';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function DocumentsPage() {
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['documents', category, search],
    queryFn: () => documentsAPI.getAll({ category: category || undefined, limit: 30 }).then(r => r.data),
  });

  const documents = (data?.data || []).filter((d: any) =>
    !search || d.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', file.name);
    formData.append('category', 'OTHER');
    try {
      await documentsAPI.upload(formData);
      toast.success('Document uploaded successfully!');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this document?')) return;
    try {
      await documentsAPI.delete(id);
      toast.success('Document deleted');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <DashboardLayout title="Document Management" subtitle="Centralized repository for all institutional and student documents">
      {/* Hero */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-2xl p-6 mb-6 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-48 h-48 bg-white/5 rounded-full -translate-y-24 translate-x-24" />
        <h2 className="text-xl font-bold mb-1">Document Repository</h2>
        <p className="text-slate-300 text-sm mb-4">Secure, role-based access to all institutional and student documents</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Documents', value: data?.pagination?.total || 0 },
            { label: 'Verified', value: (data?.data || []).filter((d: any) => d.isVerified).length },
            { label: 'Pending Verification', value: (data?.data || []).filter((d: any) => !d.isVerified).length },
            { label: 'Storage Used', value: '2.4 GB' },
          ].map(s => (
            <div key={s.label} className="bg-white/10 rounded-xl p-3 border border-white/20">
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-xs text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {categories.map(cat => (
          <button key={cat} onClick={() => setCategory(cat === 'ALL' ? '' : cat)}
            className={clsx('px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all',
              (cat === 'ALL' && !category) || category === cat ? 'gradient-blue text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
            )}>
            {cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="flex items-center gap-2 flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
            <Search className="w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents..." className="flex-1 bg-transparent text-sm outline-none" />
          </div>
          <label className={clsx('btn-primary cursor-pointer', uploading && 'opacity-75 pointer-events-none')}>
            <Upload className="w-4 h-4" />
            {uploading ? 'Uploading...' : 'Upload Document'}
            <input ref={fileRef} type="file" className="hidden" onChange={handleUpload}
              accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.mp4" />
          </label>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-400">No documents found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc: any) => {
              const Icon = typeIcons[doc.mimeType] || FileText;
              return (
                <div key={doc.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white hover:shadow-sm transition-all group">
                  <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                    doc.mimeType?.includes('pdf') ? 'bg-red-100 text-red-600' :
                    doc.mimeType?.includes('image') ? 'bg-blue-100 text-blue-600' :
                    'bg-gray-200 text-gray-600'
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{doc.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={clsx('badge text-xs', categoryColors[doc.type] || 'badge-gray')}>{doc.type}</span>
                      {doc.isVerified && <span className="badge badge-green text-xs flex items-center gap-0.5"><CheckCircle className="w-2.5 h-2.5" />Verified</span>}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{formatFileSize(doc.size)} • {new Date(doc.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a href={`${process.env.NEXT_PUBLIC_API_URL}${doc.url}`} target="_blank" className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Eye className="w-3.5 h-3.5" />
                    </a>
                    <button onClick={() => handleDelete(doc.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
