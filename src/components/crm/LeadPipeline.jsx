'use client';
import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiLoader, FiRefreshCw, FiX, FiCheck } from 'react-icons/fi';
import LeadCard from './LeadCard';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

const STAGES = [
  { key: 'new',        label: 'New',        color: 'border-slate-500/40  bg-slate-500/5'  },
  { key: 'contacted',  label: 'Contacted',  color: 'border-blue-500/40   bg-blue-500/5'   },
  { key: 'qualified',  label: 'Qualified',  color: 'border-amber-500/40  bg-amber-500/5'  },
  { key: 'proposal',   label: 'Proposal',   color: 'border-purple-500/40 bg-purple-500/5' },
  { key: 'won',        label: 'Won',        color: 'border-green-500/40  bg-green-500/5'  },
  { key: 'lost',       label: 'Lost',       color: 'border-red-500/40    bg-red-500/5'    },
];

const STAGE_DOT = {
  new:       'bg-slate-400',
  contacted: 'bg-blue-400',
  qualified: 'bg-amber-400',
  proposal:  'bg-purple-400',
  won:       'bg-green-400',
  lost:      'bg-red-400',
};

const BLANK_FORM = { contact_name: '', contact_email: '', contact_phone: '', company_name: '', notes: '', priority: 'medium', estimated_value: '', status: 'new' };

export default function LeadPipeline() {
  const [leads, setLeads]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [dragId, setDragId]     = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editLead, setEditLead] = useState(null);
  const [form, setForm]         = useState(BLANK_FORM);
  const [saving, setSaving]     = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/crm/leads?limit=200');
      const data = await res.json();
      setLeads(data.leads || []);
    } catch { toast.error('Failed to load leads'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const byStage = (stage) => leads.filter((l) => l.status === stage);

  // Drag-and-drop
  const onDragStart = (e, id) => { setDragId(id); e.dataTransfer.effectAllowed = 'move'; };
  const onDragOver  = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
  const onDrop      = async (e, targetStage) => {
    e.preventDefault();
    if (!dragId) return;
    const lead = leads.find((l) => l.id === dragId);
    if (!lead || lead.status === targetStage) { setDragId(null); return; }
    setLeads((prev) => prev.map((l) => l.id === dragId ? { ...l, status: targetStage } : l));
    setDragId(null);
    try {
      await fetch(`/api/crm/leads/${dragId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: targetStage }) });
    } catch { toast.error('Failed to move lead'); load(); }
  };

  const openCreate = () => { setEditLead(null); setForm(BLANK_FORM); setShowForm(true); };
  const openEdit   = (lead) => { setEditLead(lead); setForm({ contact_name: lead.contact_name || '', contact_email: lead.contact_email || '', contact_phone: lead.contact_phone || '', company_name: lead.company_name || '', notes: lead.notes || '', priority: lead.priority || 'medium', estimated_value: lead.estimated_value || '', status: lead.status || 'new' }); setShowForm(true); };

  const handleSave = async () => {
    if (!form.contact_name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      const url    = editLead ? `/api/crm/leads/${editLead.id}` : '/api/crm/leads';
      const method = editLead ? 'PUT' : 'POST';
      const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error('Save failed');
      toast.success(editLead ? 'Lead updated' : 'Lead created');
      setShowForm(false);
      load();
    } catch { toast.error('Failed to save lead'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this lead?')) return;
    try {
      await fetch(`/api/crm/leads/${id}`, { method: 'DELETE' });
      setLeads((prev) => prev.filter((l) => l.id !== id));
      toast.success('Lead deleted');
    } catch { toast.error('Failed to delete lead'); }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/8 shrink-0">
        <div>
          <h2 className="text-white font-semibold text-sm">Lead Pipeline</h2>
          <p className="text-slate-500 text-xs">{leads.length} leads total</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-500 hover:text-white transition-colors">
            <FiRefreshCw className="w-3.5 h-3.5" />
          </button>
          <button onClick={openCreate} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors">
            <FiPlus className="w-3.5 h-3.5" /> Add Lead
          </button>
        </div>
      </div>

      {/* Kanban board */}
      <div className="flex-1 overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <FiLoader className="w-6 h-6 text-slate-600 animate-spin" />
          </div>
        ) : (
          <div className="flex gap-3 p-4 h-full" style={{ minWidth: `${STAGES.length * 240}px` }}>
            {STAGES.map(({ key, label, color }) => {
              const stageleads = byStage(key);
              return (
                <div
                  key={key}
                  onDragOver={onDragOver}
                  onDrop={(e) => onDrop(e, key)}
                  className={cn('flex flex-col rounded-2xl border w-56 shrink-0 transition-colors', color, dragId && 'border-dashed')}
                >
                  {/* Column header */}
                  <div className="px-3 py-2.5 flex items-center gap-2 shrink-0">
                    <span className={cn('w-2 h-2 rounded-full shrink-0', STAGE_DOT[key])} />
                    <span className="text-xs font-semibold text-white">{label}</span>
                    <span className="ml-auto text-[10px] text-slate-500 bg-white/5 rounded px-1.5 py-0.5">
                      {stageleads.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-2">
                    {stageleads.map((lead) => (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => onDragStart(e, lead.id)}
                        className="cursor-grab active:cursor-grabbing"
                      >
                        <LeadCard lead={lead} onEdit={openEdit} onDelete={handleDelete} />
                      </div>
                    ))}
                    {stageleads.length === 0 && (
                      <div className="flex items-center justify-center py-8 text-slate-700 text-xs">
                        Drop here
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create / Edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0f1629] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
              <h3 className="text-white font-semibold text-sm">{editLead ? 'Edit Lead' : 'New Lead'}</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white transition-colors">
                <FiX className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              {[
                { field: 'contact_name',  label: 'Name *',     type: 'text'  },
                { field: 'contact_email', label: 'Email',      type: 'email' },
                { field: 'contact_phone', label: 'Phone',      type: 'tel'   },
                { field: 'company_name',  label: 'Company',    type: 'text'  },
                { field: 'estimated_value', label: 'Est. Value ($)', type: 'number' },
              ].map(({ field, label, type }) => (
                <div key={field}>
                  <label className="block text-xs text-slate-400 mb-1">{label}</label>
                  <input
                    type={type}
                    value={form[field]}
                    onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              ))}

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-slate-400 mb-1">Priority</label>
                  <select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-sm focus:outline-none focus:border-blue-500">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-slate-400 mb-1">Stage</label>
                  <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-sm focus:outline-none focus:border-blue-500">
                    {STAGES.map(({ key, label }) => <option key={key} value={key}>{label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500 resize-none transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-white/8">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg bg-white/5 text-slate-300 text-sm hover:bg-white/10 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold disabled:opacity-60 transition-colors">
                {saving ? <FiLoader className="w-3.5 h-3.5 animate-spin" /> : <FiCheck className="w-3.5 h-3.5" />}
                {editLead ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
