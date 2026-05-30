'use client';
import { useEffect, useState } from 'react';
import { FiFolder, FiFile, FiSearch, FiDownload, FiEye, FiFileText } from 'react-icons/fi';

const EXT_ICONS = { pdf: '📄', docx: '📝', xlsx: '📊', pptx: '📋', png: '🖼️', jpg: '🖼️', zip: '📦' };

function FileIcon({ ext }) {
  return <span className="text-lg">{EXT_ICONS[ext?.toLowerCase()] || '📎'}</span>;
}

function formatSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes/1024).toFixed(1)} KB`;
  return `${(bytes/1048576).toFixed(1)} MB`;
}

export default function ClientDocumentsPage() {
  const [docs, setDocs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [currentFolder, setCurrentFolder] = useState(null);
  const [breadcrumb, setBreadcrumb]       = useState([{ id: null, name: 'Documents' }]);

  function loadDocs(parentId) {
    setLoading(true);
    fetch(`/api/documents?parentId=${parentId || ''}`)
      .then(r => r.json())
      .then(d => setDocs(d.documents || []))
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadDocs(null); }, []);

  function openFolder(folder) {
    setCurrentFolder(folder._id);
    setBreadcrumb(prev => [...prev, { id: folder._id, name: folder.name }]);
    loadDocs(folder._id);
  }

  function navigateTo(crumb, idx) {
    setCurrentFolder(crumb.id);
    setBreadcrumb(prev => prev.slice(0, idx + 1));
    loadDocs(crumb.id);
    setSearch('');
  }

  const filtered = docs.filter(d => !search || d.name.toLowerCase().includes(search.toLowerCase()));
  const folders  = filtered.filter(d => d.type === 'folder');
  const files    = filtered.filter(d => d.type === 'file');

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Documents</h1>
          <p className="text-slate-400 text-sm mt-0.5">Your contracts, invoices, and project files</p>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1 mb-5 text-sm">
        {breadcrumb.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <span className="text-slate-600">/</span>}
            <button onClick={() => navigateTo(crumb, i)} className={`transition-colors ${i === breadcrumb.length - 1 ? 'text-white font-medium' : 'text-slate-400 hover:text-white'}`}>
              {crumb.name}
            </button>
          </span>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search files and folders..."
          className="w-full max-w-sm bg-white/3 border border-white/8 text-white rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-white/20 placeholder-slate-600"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => <div key={i} className="h-24 bg-white/3 rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-500">No files here.</div>
      ) : (
        <>
          {folders.length > 0 && (
            <div className="mb-6">
              <div className="text-xs font-medium text-slate-500 uppercase mb-3">Folders</div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {folders.map(folder => (
                  <button key={folder._id} onClick={() => openFolder(folder)}
                    className="bg-white/3 border border-white/8 rounded-xl p-4 text-center hover:bg-white/8 hover:border-white/15 transition-all group"
                  >
                    <FiFolder className="mx-auto text-yellow-400 mb-2 group-hover:scale-110 transition-transform" size={24} />
                    <div className="text-white text-xs font-medium truncate">{folder.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {files.length > 0 && (
            <div>
              <div className="text-xs font-medium text-slate-500 uppercase mb-3">Files</div>
              <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
                {files.map((file, i) => (
                  <div key={file._id} className={`flex items-center gap-4 px-5 py-3.5 hover:bg-white/5 transition-colors ${i > 0 ? 'border-t border-white/5' : ''}`}>
                    <FileIcon ext={file.extension} />
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium truncate">{file.name}</div>
                      <div className="text-slate-500 text-xs">{formatSize(file.size)} · {file.category}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {file.url && (
                        <a href={file.url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10">
                          <FiDownload size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
