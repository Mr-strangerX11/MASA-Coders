'use client';
import { useState } from 'react';
import ConversationList from '@/components/inbox/ConversationList';
import ChatWindow from '@/components/inbox/ChatWindow';

export default function InboxPage() {
  const [selected, setSelected] = useState(null);
  const [listKey, setListKey]   = useState(0);

  const handleUpdate = () => setListKey((k) => k + 1);

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Left panel — conversation list */}
      <div className="w-80 shrink-0 border-r border-white/8 flex flex-col h-full">
        <div className="px-4 py-3 border-b border-white/8 shrink-0">
          <h1 className="text-white font-semibold text-sm">Inbox</h1>
          <p className="text-slate-500 text-xs mt-0.5">Omnichannel conversations</p>
        </div>
        <div className="flex-1 overflow-hidden">
          <ConversationList
            key={listKey}
            selectedId={selected?.id}
            onSelect={setSelected}
          />
        </div>
      </div>

      {/* Right panel — chat window */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <ChatWindow conversation={selected} onUpdate={handleUpdate} />
      </div>
    </div>
  );
}
