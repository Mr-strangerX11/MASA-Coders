'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Image from 'next/image';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import { slugify } from '@/lib/utils';

const inputClass = 'w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 transition-colors';
const labelClass = 'block text-sm font-medium text-slate-300 mb-1.5';

export default function CreateProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', slug: '', category: '', thumbnail: '', shortDesc: '', description: '',
    technologies: '', result: '', impact: '', clientName: '', projectUrl: '',
    status: 'draft', isFeatured: false, order: 0,
  });

  const set = (k) => (e) => setForm((f) => ({
    ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
    ...(k === 'title' && !f.slug ? { slug: slugify(e.target.value) } : {}),
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        technologies: form.technologies.split(',').map((t) => t.trim()).filter(Boolean),
      };
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Failed to create project'); return; }
      toast.success('Project created successfully!');
      router.push('/admin/projects');
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/projects" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
          <FiArrowLeft className="w-4 h-4 text-slate-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-white">New Project</h1>
          <p className="text-slate-500 text-sm">Fill in the details to add a new portfolio project</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white/5 border border-white/8 rounded-2xl p-6 space-y-5">
          <h2 className="text-white font-semibold text-base border-b border-white/8 pb-3">Basic Information</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Project Title *</label>
              <input type="text" value={form.title} onChange={set('title')} placeholder="My Awesome Project" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Slug (URL)</label>
              <input type="text" value={form.slug} onChange={set('slug')} placeholder="my-awesome-project" className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Category *</label>
              <input type="text" value={form.category} onChange={set('category')} placeholder="Web Development" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Client Name</label>
              <input type="text" value={form.clientName} onChange={set('clientName')} placeholder="Client Inc." className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Thumbnail URL</label>
            <input type="url" value={form.thumbnail} onChange={set('thumbnail')} placeholder="https://..." className={inputClass} />
            {form.thumbnail && (
              <div className="relative mt-2 w-full h-40 rounded-xl overflow-hidden">
                <Image src={form.thumbnail} alt="preview" fill className="object-cover" unoptimized />
              </div>
            )}
          </div>

          <div>
            <label className={labelClass}>Short Description *</label>
            <textarea rows={2} value={form.shortDesc} onChange={set('shortDesc')} placeholder="A brief description (shown in cards)" required className={`${inputClass} resize-none`} maxLength={300} />
          </div>

          <div>
            <label className={labelClass}>Full Description *</label>
            <textarea rows={6} value={form.description} onChange={set('description')} placeholder="Detailed project description..." required className={`${inputClass} resize-none`} />
          </div>

          <div>
            <label className={labelClass}>Technologies Used</label>
            <input type="text" value={form.technologies} onChange={set('technologies')} placeholder="Next.js, Tailwind CSS, Node.js (comma separated)" className={inputClass} />
          </div>
        </div>

        <div className="bg-white/5 border border-white/8 rounded-2xl p-6 space-y-5">
          <h2 className="text-white font-semibold text-base border-b border-white/8 pb-3">Results & Links</h2>
          <div>
            <label className={labelClass}>Results / Impact</label>
            <textarea rows={3} value={form.result} onChange={set('result')} placeholder="What results did the project achieve?" className={`${inputClass} resize-none`} />
          </div>
          <div>
            <label className={labelClass}>Project URL</label>
            <input type="url" value={form.projectUrl} onChange={set('projectUrl')} placeholder="https://project-url.com" className={inputClass} />
          </div>
        </div>

        <div className="bg-white/5 border border-white/8 rounded-2xl p-6 space-y-5">
          <h2 className="text-white font-semibold text-base border-b border-white/8 pb-3">Publish Settings</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Status</label>
              <select value={form.status} onChange={set('status')} className={inputClass}>
                <option value="draft">Draft (not visible)</option>
                <option value="published">Published (visible)</option>
                <option value="featured">Featured (homepage)</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Display Order</label>
              <input type="number" value={form.order} onChange={set('order')} className={inputClass} min={0} />
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.isFeatured} onChange={set('isFeatured')} className="w-4 h-4 rounded accent-blue-600" />
            <span className="text-slate-300 text-sm">Mark as Featured (show in homepage featured section)</span>
          </label>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              <><FiSave className="w-4 h-4" /> Create Project</>
            )}
          </button>
          <Link href="/admin/projects" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
