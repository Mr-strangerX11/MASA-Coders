'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiFolder, FiFile, FiSearch, FiPlus, FiDownload, FiTrash2, FiEdit2, FiUploadCloud } from 'react-icons/fi';

const EXT_ICONS = { pdf:'📄', docx:'📝', xlsx:'📊', pptx:'📋', png:'🖼️', jpg:'🖼️', zip:'📦' };

function formatSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes/1024).toFixed(1)} KB`;
  return `${(bytes/1048576).toFixed(1)} MB`;
}

export default function AdminDocumentsPage() {
  const [docs, setDocs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [currentFolder, setCurrentFolder] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState([{id:null,name:'Documents'}]);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [creating, setCreating] = useState(false);

  function loadDocs(parentId) {
    setLoading(true);
    fetch(`/api/documents?parentId=${parentId||''}`)
      .then(r=>r.json()).then(d=>setDocs(d.documents||[])).finally(()=>setLoading(false));
  }

  useEffect(() => { loadDocs(null); }, []);

  function openFolder(folder) {
    setCurrentFolder(folder._id);
    setBreadcrumb(prev=>[...prev,{id:folder._id,name:folder.name}]);
    loadDocs(folder._id);
    setSearch('');
  }

  function navigateTo(crumb,idx) {
    setCurrentFolder(crumb.id);
    setBreadcrumb(prev=>prev.slice(0,idx+1));
    loadDocs(crumb.id);
    setSearch('');
  }

  async function createFolder() {
    if (!folderName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/documents', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ name:folderName, type:'folder', parentId:currentFolder }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success('Folder created!');
      setFolderName(''); setShowNewFolder(false);
      loadDocs(currentFolder);
    } finally { setCreating(false); }
  }

  async function archiveDoc(id) {
    if (!confirm('Archive this item?')) return;
    const res = await fetch(`/api/documents/${id}`, {method:'DELETE'});
    if (res.ok) { toast.success('Archived.'); loadDocs(currentFolder); }
  }

  const filtered = docs.filter(d=>!search||d.name.toLowerCase().includes(search.toLowerCase()));
  const folders  = filtered.filter(d=>d.type==='folder');
  const files    = filtered.filter(d=>d.type==='file');

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Document Vault</h1>
          <p className="text-slate-400 text-sm mt-0.5">Secure company document management</p>
        </div>
        <button onClick={()=>setShowNewFolder(true)} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-colors">
          <FiPlus size={15}/> New Folder
        </button>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1 mb-5 text-sm">
        {breadcrumb.map((crumb,i)=>(
          <span key={i} className="flex items-center gap-1">
            {i>0 && <span className="text-slate-600">/</span>}
            <button onClick={()=>navigateTo(crumb,i)} className={`transition-colors ${i===breadcrumb.length-1?'text-white font-medium':'text-slate-400 hover:text-white'}`}>{crumb.name}</button>
          </span>
        ))}
      </div>

      {showNewFolder && (
        <div className="flex items-center gap-3 mb-5 p-4 bg-white/3 border border-white/10 rounded-xl">
          <FiFolder size={16} className="text-yellow-400 shrink-0"/>
          <input value={folderName} onChange={e=>setFolderName(e.target.value)} placeholder="Folder name..."
            className="flex-1 bg-transparent text-white text-sm focus:outline-none placeholder-slate-600"
            autoFocus onKeyDown={e=>{if(e.key==='Enter')createFolder();if(e.key==='Escape'){setShowNewFolder(false);setFolderName('');}}}
          />
          <button onClick={createFolder} disabled={creating} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs">Create</button>
          <button onClick={()=>{setShowNewFolder(false);setFolderName('');}} className="px-3 py-1.5 bg-white/5 text-slate-400 rounded-lg text-xs">Cancel</button>
        </div>
      )}

      <div className="relative mb-6 max-w-sm">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14}/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search files and folders..."
          className="w-full bg-white/3 border border-white/8 text-white rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-white/20 placeholder-slate-600"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">{[...Array(8)].map((_,i)=><div key={i} className="h-24 bg-white/3 rounded-xl animate-pulse"/>)}</div>
      ) : (
        <>
          {folders.length > 0 && (
            <div className="mb-6">
              <div className="text-xs font-medium text-slate-500 uppercase mb-3">Folders ({folders.length})</div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {folders.map(folder=>(
                  <div key={folder._id} className="group relative">
                    <button onClick={()=>openFolder(folder)}
                      className="w-full bg-white/3 border border-white/8 rounded-xl p-4 text-center hover:bg-white/8 hover:border-white/15 transition-all"
                    >
                      <FiFolder className="mx-auto text-yellow-400 mb-2" size={24}/>
                      <div className="text-white text-xs font-medium truncate">{folder.name}</div>
                    </button>
                    <button onClick={()=>archiveDoc(folder._id)} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity text-slate-600 hover:text-red-400 p-1">
                      <FiTrash2 size={11}/>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {files.length > 0 && (
            <div>
              <div className="text-xs font-medium text-slate-500 uppercase mb-3">Files ({files.length})</div>
              <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
                {files.map((file,i)=>(
                  <div key={file._id} className={`flex items-center gap-4 px-5 py-3.5 hover:bg-white/5 transition-colors group ${i>0?'border-t border-white/5':''}`}>
                    <span className="text-lg">{EXT_ICONS[file.extension?.toLowerCase()]||'📎'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium truncate">{file.name}</div>
                      <div className="text-slate-500 text-xs">{formatSize(file.size)} · {file.category} · {file.uploadedBy?.name}</div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {file.url && (
                        <a href={file.url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10">
                          <FiDownload size={14}/>
                        </a>
                      )}
                      <button onClick={()=>archiveDoc(file._id)} className="text-slate-400 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-white/10">
                        <FiTrash2 size={14}/>
                      </button>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${file.access==='public'?'text-emerald-400':'text-slate-500'}`}>{file.access?.replace('_',' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {folders.length === 0 && files.length === 0 && !search && (
            <div className="text-center py-20">
              <FiUploadCloud className="mx-auto text-slate-600 mb-3" size={32}/>
              <div className="text-slate-500 text-sm">This folder is empty.</div>
              <div className="text-slate-600 text-xs mt-1">Use the Upload API to add files here.</div>
            </div>
          )}
          {(folders.length === 0 && files.length === 0 && search) && (
            <div className="text-center py-20 text-slate-500">No results for &quot;{search}&quot;</div>
          )}
        </>
      )}
    </div>
  );
}
