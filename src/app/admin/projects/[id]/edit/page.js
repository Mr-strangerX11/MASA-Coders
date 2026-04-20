'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Image from 'next/image';
import { FiArrowLeft, FiSave, FiUpload, FiX } from 'react-icons/fi';

const inputClass = 'w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 transition-colors';
const labelClass = 'block text-sm font-medium text-slate-300 mb-1.5';

export default function EditProjectPage() {
  const { id } = useParams();
  const router  = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm]       = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');

  useEffect(() => {
    fetch(`/api/projects/${id}?admin=true`).then((r) => r.json()).then(({ project }) => {
      if (project) {
        setForm({ ...project, technologies: (project.technologies || []).join(', ') });
        if (project.thumbnail) setThumbnailPreview(project.thumbnail);
      }
    });
  }, [id]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const handleThumbnailUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result;
      setThumbnailPreview(base64String);
      setForm((f) => ({ ...f, thumbnail: base64String }));
    };
    reader.readAsDataURL(file);
  };

  const clearThumbnail = () => {
    setThumbnailPreview('');
    setForm((f) => ({ ...f, thumbnail: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, technologies: form.technologies.split(',').map((t) => t.trim()).filter(Boolean) };
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { toast.error('Failed to update'); return; }
      toast.success('Project updated!');
      router.push('/admin/projects');
    } catch { toast.error('Error updating project'); }
    finally { setLoading(false); }
  };

  if (!form) return <div className="p-8 text-slate-500">Loading...</div>;

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/projects" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
          <FiArrowLeft className="w-4 h-4 text-slate-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Edit Project</h1>
          <p className="text-slate-500 text-sm">{form.title}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white/5 border border-white/8 rounded-2xl p-6 space-y-5">
          <h2 className="text-white font-semibold text-base border-b border-white/8 pb-3">Basic Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Project Title *</label>
              <input type="text" value={form.title} onChange={set('title')} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Category *</label>
              <input type="text" value={form.category} onChange={set('category')} required className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Project Thumbnail *</label>
            <div className="space-y-3">
              {/* File Upload */}
              <div className="relative">
                <input
                  type="file"
                  id="thumbnail-upload"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  className="hidden"
                />
                <label
                  htmlFor="thumbnail-upload"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 border-dashed text-white cursor-pointer hover:bg-white/8 transition-colors"
                >
                  <FiUpload className="w-4 h-4" />
                  <span className="text-sm">Click to upload new thumbnail</span>
                </label>
                <p className="text-xs text-slate-500 mt-1">Supported: JPG, PNG, WebP (Max 5MB)</p>
              </div>

              {/* Preview */}
              {thumbnailPreview && (
                <div className="relative w-full h-40 rounded-xl overflow-hidden bg-white/5 border border-white/10 group">
                  <Image src={thumbnailPreview} alt="preview" fill className="object-cover" unoptimized />
                  <button
                    type="button"
                    onClick={clearThumbnail}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-600/90 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-slate-500">OR</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* URL Input as alternative */}
              <div>
                <label className={`${labelClass} text-xs`}>Paste Image URL</label>
                <input
                  type="url"
                  value={form.thumbnail && !form.thumbnail.startsWith('data:') ? form.thumbnail : ''}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, thumbnail: e.target.value }));
                    if (e.target.value) {
                      setThumbnailPreview(e.target.value);
                    }
                  }}
                  placeholder="https://..."
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          <div>
            <label className={labelClass}>Short Description *</label>
            <textarea rows={2} value={form.shortDesc || ''} onChange={set('shortDesc')} required className={`${inputClass} resize-none`} maxLength={300} />
          </div>
          <div>
            <label className={labelClass}>Full Description *</label>
            <textarea rows={6} value={form.description || ''} onChange={set('description')} required className={`${inputClass} resize-none`} />
          </div>
          <div>
            <label className={labelClass}>Technologies (comma separated)</label>
            <input type="text" value={form.technologies || ''} onChange={set('technologies')} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Results / Impact</label>
            <textarea rows={3} value={form.result || ''} onChange={set('result')} className={`${inputClass} resize-none`} />
          </div>
        </div>

        <div className="bg-white/5 border border-white/8 rounded-2xl p-6 space-y-5">
          <h2 className="text-white font-semibold text-base border-b border-white/8 pb-3">Publish Settings</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Status</label>
              <select value={form.status} onChange={set('status')} className={inputClass}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="featured">Featured</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Project URL</label>
              <input type="url" value={form.projectUrl || ''} onChange={set('projectUrl')} className={inputClass} />
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.isFeatured || false} onChange={set('isFeatured')} className="w-4 h-4 accent-blue-600" />
            <span className="text-slate-300 text-sm">Featured on homepage</span>
          </label>
        </div>

        <div className="flex gap-4">
          <button type="submit" disabled={loading} className="btn-primary disabled:opacity-60">
            {loading ? 'Saving...' : <><FiSave className="w-4 h-4" /> Save Changes</>}
          </button>
          <Link href="/admin/projects" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
