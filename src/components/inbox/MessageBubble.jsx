import { FiCheck, FiClock, FiZap } from 'react-icons/fi';

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const STATUS_ICON = {
  pending:   <FiClock className="w-3 h-3 text-slate-500" />,
  sent:      <FiCheck className="w-3 h-3 text-slate-500" />,
  delivered: <span className="text-slate-500 text-xs">✓✓</span>,
  read:      <span className="text-blue-400 text-xs">✓✓</span>,
  failed:    <span className="text-red-400 text-xs">!</span>,
};

export default function MessageBubble({ message }) {
  const isOutbound = message.direction === 'outbound';
  const isAI       = message.sender_type === 'ai' || message.ai_suggested;

  return (
    <div className={`flex ${isOutbound ? 'justify-end' : 'justify-start'} mb-1`}>
      <div className={`max-w-[72%] group`}>
        <div
          className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed relative
            ${isOutbound
              ? 'bg-blue-600 text-white rounded-br-sm'
              : 'bg-white/8 text-slate-200 rounded-bl-sm border border-white/5'
            }`}
        >
          {/* AI badge */}
          {isAI && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-200 mb-1 opacity-80">
              <FiZap className="w-2.5 h-2.5" /> AI
            </span>
          )}
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>

        {/* Timestamp + status */}
        <div className={`flex items-center gap-1 mt-0.5 px-1 ${isOutbound ? 'justify-end' : 'justify-start'}`}>
          <span className="text-[10px] text-slate-600">{formatTime(message.created_at)}</span>
          {isOutbound && STATUS_ICON[message.status]}
        </div>
      </div>
    </div>
  );
}
