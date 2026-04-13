'use client';
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { FiMail, FiCheck, FiTrash2, FiPhone, FiUser, FiMessageSquare } from 'react-icons/fi';
import { formatDate } from '@/lib/utils';

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState(null);
  const [filter, setFilter]       = useState('all');

  const fetch_ = useCallback(async () => {
    const params = filter !== 'all' ? `?isRead=${filter === 'read'}` : '';
    const res = await fetch(`/api/inquiries${params}`);
    const data = await res.json();
    setInquiries(data.inquiries || []);
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetch_(); }, [fetch_]);

  const markRead = async (id, isRead) => {
    await fetch(`/api/inquiries/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({isRead: !isRead}) });
    fetch_();
    if (selected?._id === id) setSelected({...selected, isRead: !isRead});
  };

  const deleteInq = async (id) => {
    if (!confirm('Delete this inquiry?')) return;
    await fetch(`/api/inquiries/${id}`, { method:'DELETE' });
    toast.success('Deleted');
    if (selected?._id === id) setSelected(null);
    fetch_();
  };

  const openInquiry = async (inq) => {
    setSelected(inq);
    if (!inq.isRead) { markRead(inq._id, false); }
  };

  return (
    <div className="p-8 h-screen flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Inquiries</h1>
          <p className="text-slate-500 text-sm mt-1">Messages from your contact form</p>
        </div>
        <div className="flex gap-2">
          {['all','unread','read'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${filter===f?'bg-blue-600 text-white':'bg-white/5 text-slate-400 hover:bg-white/10'}`}>{f}</button>
          ))}
        </div>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* List */}
        <div className="w-80 shrink-0 bg-white/5 border border-white/8 rounded-2xl overflow-y-auto">
          {loading ? <div className="p-8 text-slate-500 text-center">Loading...</div>
          : inquiries.length === 0 ? <div className="p-8 text-slate-500 text-center">No inquiries</div>
          : inquiries.map(inq => (
            <button
              key={inq._id}
              onClick={() => openInquiry(inq)}
              className={`w-full text-left p-4 border-b border-white/5 hover:bg-white/5 transition-colors ${selected?._id===inq._id?'bg-blue-600/10 border-l-2 border-l-blue-500':''}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-medium ${inq.isRead?'text-slate-400':'text-white'}`}>{inq.name}</span>
                {!inq.isRead && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"/>}
              </div>
              <p className="text-xs text-slate-500 truncate">{inq.subject || inq.message}</p>
              <p className="text-xs text-slate-600 mt-1">{formatDate(inq.createdAt, {month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</p>
            </button>
          ))}
        </div>

        {/* Detail */}
        <div className="flex-1 bg-white/5 border border-white/8 rounded-2xl overflow-y-auto">
          {!selected ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-600">
              <FiMessageSquare className="w-12 h-12 mb-3"/>
              <p>Select an inquiry to view details</p>
            </div>
          ) : (
            <div className="p-7">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-white font-display font-bold text-xl">{selected.name}</h2>
                  <p className="text-slate-500 text-sm mt-0.5">{formatDate(selected.createdAt, {year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'})}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => markRead(selected._id, selected.isRead)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors" title={selected.isRead?'Mark unread':'Mark read'}>
                    {selected.isRead ? <FiCheck className="w-4 h-4"/> : <FiMail className="w-4 h-4"/>}
                  </button>
                  <button onClick={() => deleteInq(selected._id)} className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"><FiTrash2 className="w-4 h-4"/></button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-slate-500 text-xs mb-1"><FiUser className="w-3.5 h-3.5"/> Email</div>
                  <a href={`mailto:${selected.email}`} className="text-blue-400 text-sm hover:underline">{selected.email}</a>
                </div>
                {selected.phone && (
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-slate-500 text-xs mb-1"><FiPhone className="w-3.5 h-3.5"/> Phone</div>
                    <a href={`tel:${selected.phone}`} className="text-white text-sm">{selected.phone}</a>
                  </div>
                )}
                {selected.service && (
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="text-slate-500 text-xs mb-1">Service Needed</div>
                    <p className="text-white text-sm">{selected.service}</p>
                  </div>
                )}
                {selected.budget && (
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="text-slate-500 text-xs mb-1">Budget</div>
                    <p className="text-white text-sm">{selected.budget}</p>
                  </div>
                )}
              </div>

              {selected.subject && (
                <div className="mb-4">
                  <p className="text-slate-500 text-xs mb-1">Subject</p>
                  <p className="text-white font-medium">{selected.subject}</p>
                </div>
              )}

              <div className="mb-6">
                <p className="text-slate-500 text-xs mb-2">Message</p>
                <div className="bg-white/5 rounded-xl p-5">
                  <p className="text-slate-300 leading-relaxed whitespace-pre-wrap text-sm">{selected.message}</p>
                </div>
              </div>

              <a
                href={`mailto:${selected.email}?subject=Re: ${selected.subject || 'Your Inquiry'}`}
                className="btn-primary"
              >
                <FiMail className="w-4 h-4"/> Reply via Email
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
