'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { FiSend, FiZap, FiMoreVertical, FiUser, FiTag, FiArchive, FiLoader } from 'react-icons/fi';
import toast from 'react-hot-toast';
import MessageBubble from './MessageBubble';
import AISuggestionPanel from './AISuggestionPanel';
import PlatformIcon from './PlatformIcon';
import { useSocket } from '@/hooks/useSocket';
import { cn } from '@/lib/utils';

const STATUS_OPTIONS = ['new','active','waiting','resolved','closed'];
const MODE_OPTIONS   = [
  { value: 'manual',    label: 'Manual',    desc: 'AI suggests — you approve' },
  { value: 'semi_auto', label: 'Semi-Auto', desc: 'AI handles simple queries' },
  { value: 'full_auto', label: 'Full Auto', desc: 'AI replies to all messages' },
];

export default function ChatWindow({ conversation, onUpdate }) {
  const [messages, setMessages]       = useState([]);
  const [suggestion, setSuggestion]   = useState(null);
  const [text, setText]               = useState('');
  const [sending, setSending]         = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [mode, setMode]               = useState(conversation?.ai_mode || 'manual');
  const [status, setStatus]           = useState(conversation?.status || 'new');
  const bottomRef = useRef(null);
  const { socket } = useSocket();

  // Fetch messages + suggestions
  const loadConversation = useCallback(async () => {
    if (!conversation?.id) return;
    setLoadingMsgs(true);
    const res  = await fetch(`/api/inbox/${conversation.id}`);
    const data = await res.json();
    setMessages(data.messages || []);
    setSuggestion(data.suggestions?.[0] || null);
    setMode(data.conversation?.ai_mode || 'manual');
    setStatus(data.conversation?.status || 'new');
    setLoadingMsgs(false);
  }, [conversation?.id]);

  useEffect(() => { loadConversation(); }, [loadConversation]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Real-time socket events
  useEffect(() => {
    if (!socket || !conversation?.id) return;
    socket.emit('join_conversation', conversation.id);

    const onMessage = (data) => {
      if (data.conversationId === conversation.id) {
        setMessages((prev) => {
          const exists = prev.some((m) => m.id === data.message?.id);
          return exists ? prev : [...prev, data.message || data];
        });
      }
    };

    const onSuggestion = (data) => {
      if (data.conversationId === conversation.id) {
        setSuggestion({ id: data.suggestionId, suggested_reply: data.reply, intent: data.intent, sentiment: data.sentiment, confidence: data.confidence });
      }
    };

    socket.on('message',       onMessage);
    socket.on('ai_suggestion', onSuggestion);
    return () => {
      socket.off('message',       onMessage);
      socket.off('ai_suggestion', onSuggestion);
      socket.emit('leave_conversation', conversation.id);
    };
  }, [socket, conversation?.id]);

  const sendMessage = async (textToSend, suggId = null) => {
    const msg = textToSend.trim();
    if (!msg) return;
    setSending(true);
    try {
      const res = await fetch(`/api/inbox/${conversation.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: msg, suggestionId: suggId }),
      });
      if (!res.ok) throw new Error('Send failed');
      const data = await res.json();
      setMessages((prev) => [...prev, data.message]);
      setText('');
      setSuggestion(null);
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const updateConversation = async (changes) => {
    await fetch(`/api/inbox/${conversation.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(changes),
    });
    onUpdate?.();
  };

  const requestAISuggestion = async () => {
    try {
      const res  = await fetch('/api/ai/suggest', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ conversationId: conversation.id }) });
      const data = await res.json();
      if (res.ok) { setSuggestion(data.suggestion); toast.success('AI suggestion ready'); }
    } catch { toast.error('AI suggestion failed'); }
  };

  if (!conversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-600">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <FiUser className="w-7 h-7" />
        </div>
        <p className="text-sm">Select a conversation to start</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/8 bg-white/2 shrink-0">
        <div className="relative">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
            {(conversation.contact_name || '?').charAt(0).toUpperCase()}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5">
            <PlatformIcon platform={conversation.platform} size="sm" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm truncate">{conversation.contact_name || 'Unknown'}</p>
          <div className="flex items-center gap-2">
            <PlatformIcon platform={conversation.platform} size="sm" showLabel />
            {conversation.contact_email && <span className="text-slate-600 text-xs truncate">{conversation.contact_email}</span>}
          </div>
        </div>

        {/* Status + mode selectors */}
        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); updateConversation({ status: e.target.value }); }}
            className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-400 text-xs focus:outline-none focus:border-blue-500"
          >
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
          </select>

          <select
            value={mode}
            onChange={(e) => { setMode(e.target.value); updateConversation({ ai_mode: e.target.value }); }}
            className="px-2 py-1 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs focus:outline-none"
          >
            {MODE_OPTIONS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-0.5">
        {loadingMsgs ? (
          <div className="flex justify-center py-12">
            <FiLoader className="w-6 h-6 text-slate-600 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-600">
            <p className="text-sm">No messages yet</p>
          </div>
        ) : (
          messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
        )}
        <div ref={bottomRef} />
      </div>

      {/* AI Suggestion Panel */}
      {suggestion && (
        <AISuggestionPanel
          suggestion={suggestion}
          conversationId={conversation.id}
          onApprove={(text, suggId) => { sendMessage(text, suggId); setSuggestion(null); }}
          onReject={() => setSuggestion(null)}
        />
      )}

      {/* Composer */}
      <div className="shrink-0 border-t border-white/8 p-3">
        <div className="flex items-end gap-2">
          <button
            onClick={requestAISuggestion}
            title="Get AI suggestion"
            className="p-2.5 rounded-xl bg-blue-600/15 border border-blue-500/20 text-blue-400 hover:bg-blue-600/25 transition-colors shrink-0 self-end"
          >
            <FiZap className="w-4 h-4" />
          </button>

          <div className="flex-1 relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(text); } }}
              placeholder="Type a message… (Enter to send, Shift+Enter for newline)"
              rows={1}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500 resize-none transition-colors"
              style={{ minHeight: '42px', maxHeight: '120px' }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
            />
          </div>

          <button
            onClick={() => sendMessage(text)}
            disabled={sending || !text.trim()}
            className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-50 shrink-0 self-end"
          >
            {sending ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiSend className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
