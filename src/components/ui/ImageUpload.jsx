'use client';
import { useState, useRef } from 'react';
import Image from 'next/image';
import { FiUpload, FiX, FiLink, FiLoader } from 'react-icons/fi';
import toast from 'react-hot-toast';

/**
 * Reusable image upload component.
 * Supports file upload to Cloudinary OR manual URL input with live preview.
 *
 * Props:
 *   value      - current image URL
 *   onChange   - (url: string) => void
 *   folder     - Cloudinary folder (default: 'masa-coders')
 *   label      - Field label
 *   aspectRatio - CSS aspect-ratio for preview (default: '16/9')
 */
export default function ImageUpload({ value, onChange, folder = 'masa-coders', label = 'Image', aspectRatio = '16/9' }) {
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput]   = useState('');
  const [showUrl, setShowUrl]     = useState(false);
  const fileRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error('Image must be under 10 MB'); return; }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const res  = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Upload failed');
      onChange(data.url);
      toast.success('Image uploaded');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const applyUrl = () => {
    if (!urlInput.trim()) return;
    onChange(urlInput.trim());
    setUrlInput('');
    setShowUrl(false);
  };

  const clear = () => onChange('');

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-300">{label}</label>

      {value ? (
        <div className="relative rounded-xl overflow-hidden bg-white/5 border border-white/10 group" style={{ aspectRatio }}>
          <Image src={value} alt="preview" fill className="object-cover" unoptimized />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <label className="cursor-pointer p-2.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-white" title="Replace image">
              <FiUpload className="w-4 h-4" />
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </label>
            <button type="button" onClick={clear} className="p-2.5 rounded-lg bg-red-500/80 hover:bg-red-500 transition-colors text-white" title="Remove">
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <label className={`flex flex-col items-center justify-center gap-3 w-full py-10 rounded-xl bg-white/3 border-2 border-dashed border-white/10 hover:border-blue-500/40 hover:bg-white/5 transition-all cursor-pointer ${uploading ? 'pointer-events-none opacity-60' : ''}`}>
          {uploading
            ? <><FiLoader className="w-6 h-6 text-blue-400 animate-spin" /><span className="text-sm text-slate-400">Uploading…</span></>
            : <><FiUpload className="w-6 h-6 text-slate-500" /><span className="text-sm text-slate-400">Click to upload image</span><span className="text-xs text-slate-600">JPG, PNG, WebP — max 10 MB</span></>
          }
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        </label>
      )}

      {/* URL toggle */}
      <div>
        <button type="button" onClick={() => setShowUrl((v) => !v)} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors">
          <FiLink className="w-3.5 h-3.5" />
          {showUrl ? 'Hide URL input' : 'Or paste image URL'}
        </button>
        {showUrl && (
          <div className="flex gap-2 mt-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), applyUrl())}
              placeholder="https://..."
              className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button type="button" onClick={applyUrl} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors">
              Apply
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
