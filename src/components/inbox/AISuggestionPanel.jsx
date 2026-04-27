'use client';
import { useState } from 'react';
import { FiZap, FiCheck, FiEdit2, FiX, FiRefreshCw, FiLoader } from 'react-icons/fi';
import toast from 'react-hot-toast';

const INTENT_BADGE = {
  sales:   'bg-green-500/20 text-green-300 border-green-500/30',
  support: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  inquiry: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  spam:    'bg-red-500/20 text-red-300 border-red-500/30',
};

const SENTIMENT_BADGE = {
  positive: 'bg-green-500/20 text-green-300',
  neutral:  'bg-slate-500/20 text-slate-300',
  negative: 'bg-red-500/20 text-red-300',
};

export default function AISuggestionPanel({ suggestion, conversationId, onApprove, onReject }) {
  const [editing, setEditing]  = useState(false);
  const [edited, setEdited]    = useState(suggestion?.suggested_reply || '');
  const [loading, setLoading]  = useState(false);
  const [generating, setGenerating] = useState(false);

  if (!suggestion) return null;

  const handleAction = async (action) => {
    setLoading(true);
    try {
      const body = { id: suggestion.id, action, ...(action === 'edited' ? { editedReply: edited } : {}) };
      const res  = await fetch('/api/ai/suggest', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error('Failed');
      if (action === 'rejected') { onReject?.(suggestion.id); toast.success('Suggestion rejected'); }
      else { onApprove?.(action === 'edited' ? edited : suggestion.suggested_reply, suggestion.id); }
    } catch {
      toast.error('Action failed');
    } finally {
      setLoading(false);
      setEditing(false);
    }
  };

  const regenerate = async () => {
    setGenerating(true);
    try {
      const res  = await fetch('/api/ai/suggest', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ conversationId }) });
      const data = await res.json();
      if (res.ok) { setEdited(data.suggestion.suggested_reply); toast.success('New suggestion ready'); }
    } catch { toast.error('Regeneration failed'); }
    finally { setGenerating(false); }
  };

  const confidence = Math.round((suggestion.confidence || 0.7) * 100);

  return (
    <div className="border-t border-white/8 bg-blue-600/5 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
            <FiZap className="w-3 h-3 text-blue-400" />
          </div>
          <span className="text-xs font-semibold text-blue-300">AI Suggestion</span>
          <span className="text-[10px] text-slate-500">{confidence}% confidence</span>
        </div>
        <div className="flex items-center gap-1.5">
          {suggestion.intent && (
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border capitalize ${INTENT_BADGE[suggestion.intent] || INTENT_BADGE.inquiry}`}>
              {suggestion.intent}
            </span>
          )}
          {suggestion.sentiment && (
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded capitalize ${SENTIMENT_BADGE[suggestion.sentiment] || SENTIMENT_BADGE.neutral}`}>
              {suggestion.sentiment}
            </span>
          )}
        </div>
      </div>

      {/* Suggested reply */}
      {editing ? (
        <textarea
          value={edited}
          onChange={(e) => setEdited(e.target.value)}
          rows={3}
          className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500 resize-none transition-colors mb-3"
          autoFocus
        />
      ) : (
        <p className="text-sm text-slate-300 leading-relaxed bg-white/3 rounded-xl px-3 py-2.5 border border-white/5 mb-3">
          {suggestion.suggested_reply}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleAction(editing ? 'edited' : 'approved')}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors disabled:opacity-60"
        >
          {loading ? <FiLoader className="w-3 h-3 animate-spin" /> : <FiCheck className="w-3 h-3" />}
          {editing ? 'Send Edited' : 'Approve & Send'}
        </button>

        <button
          onClick={() => { setEditing((v) => !v); setEdited(suggestion.suggested_reply); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs transition-colors"
        >
          <FiEdit2 className="w-3 h-3" />
          {editing ? 'Cancel Edit' : 'Edit'}
        </button>

        <button
          onClick={regenerate}
          disabled={generating}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs transition-colors disabled:opacity-60"
        >
          {generating ? <FiLoader className="w-3 h-3 animate-spin" /> : <FiRefreshCw className="w-3 h-3" />}
          Regenerate
        </button>

        <button
          onClick={() => handleAction('rejected')}
          disabled={loading}
          className="ml-auto flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 text-xs transition-colors"
        >
          <FiX className="w-3 h-3" /> Reject
        </button>
      </div>
    </div>
  );
}
