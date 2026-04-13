'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiStar } from 'react-icons/fi';
import { cn, formatDate } from '@/lib/utils';

const STATUS_COLORS = {
  draft:     'status-draft',
  published: 'status-published',
  featured:  'status-featured',
  archived:  'status-archived',
};

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);

  const fetchProjects = async () => {
    const res = await fetch('/api/projects?admin=true');
    const data = await res.json();
    setProjects(data.projects || []);
    setLoading(false);
  };

  useEffect(() => { fetchProjects(); }, []);

  const updateStatus = async (id, status) => {
    const res = await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) { toast.success('Status updated'); fetchProjects(); }
    else toast.error('Update failed');
  };

  const toggleFeatured = async (id, isFeatured) => {
    const res = await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isFeatured: !isFeatured }),
    });
    if (res.ok) { toast.success(isFeatured ? 'Removed from featured' : 'Marked as featured'); fetchProjects(); }
  };

  const deleteProject = async (id) => {
    if (!confirm('Delete this project? This cannot be undone.')) return;
    const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    if (res.ok) { toast.success('Project deleted'); fetchProjects(); }
    else toast.error('Delete failed');
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Projects</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and publish your portfolio projects</p>
        </div>
        <Link href="/admin/projects/create" className="btn-primary">
          <FiPlus className="w-4 h-4" /> New Project
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/8">
          <p className="text-slate-400 text-lg mb-4">No projects yet</p>
          <Link href="/admin/projects/create" className="btn-primary">
            <FiPlus className="w-4 h-4" /> Create Your First Project
          </Link>
        </div>
      ) : (
        <div className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                <th className="text-left px-5 py-3.5 text-xs font-medium text-slate-500 uppercase tracking-wider">Project</th>
                <th className="text-left px-5 py-3.5 text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                <th className="text-left px-5 py-3.5 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3.5 text-xs font-medium text-slate-500 uppercase tracking-wider">Featured</th>
                <th className="text-left px-5 py-3.5 text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                <th className="text-right px-5 py-3.5 text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {projects.map((project) => (
                <tr key={project._id} className="hover:bg-white/3 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {project.thumbnail ? (
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-slate-800 shrink-0">
                          <Image src={project.thumbnail} alt={project.title} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-800 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="text-white text-sm font-medium truncate max-w-[200px]">{project.title}</p>
                        <p className="text-slate-500 text-xs truncate max-w-[200px]">{project.shortDesc}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-slate-400 text-sm">{project.category}</span>
                  </td>
                  <td className="px-5 py-4">
                    <select
                      value={project.status}
                      onChange={(e) => updateStatus(project._id, e.target.value)}
                      className={cn('badge cursor-pointer text-xs border-0 bg-transparent', STATUS_COLORS[project.status])}
                    >
                      {['draft', 'published', 'featured', 'archived'].map((s) => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => toggleFeatured(project._id, project.isFeatured)}
                      className={cn('p-1.5 rounded-lg transition-colors', project.isFeatured ? 'text-amber-400 bg-amber-400/10' : 'text-slate-600 hover:text-amber-400 hover:bg-amber-400/10')}
                    >
                      <FiStar className="w-4 h-4" fill={project.isFeatured ? 'currentColor' : 'none'} />
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-slate-500 text-xs">{formatDate(project.createdAt, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/projects/${project.slug || project._id}`}
                        target="_blank"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-400/10 transition-colors"
                      >
                        <FiEye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/projects/${project._id}/edit`}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => deleteProject(project._id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
