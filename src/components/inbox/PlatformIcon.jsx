import { FaWhatsapp, FaFacebookMessenger, FaInstagram, FaEnvelope } from 'react-icons/fa';
import { FiMessageSquare } from 'react-icons/fi';

const CONFIGS = {
  whatsapp:  { Icon: FaWhatsapp,          bg: 'bg-green-500',  label: 'WhatsApp'  },
  messenger: { Icon: FaFacebookMessenger, bg: 'bg-blue-500',   label: 'Messenger' },
  instagram: { Icon: FaInstagram,         bg: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400', label: 'Instagram' },
  email:     { Icon: FaEnvelope,          bg: 'bg-slate-500',  label: 'Email'     },
  livechat:  { Icon: FiMessageSquare,     bg: 'bg-cyan-500',   label: 'Live Chat' },
};

export default function PlatformIcon({ platform, size = 'sm', showLabel = false }) {
  const cfg  = CONFIGS[platform] || CONFIGS.livechat;
  const Icon = cfg.Icon;
  const sz   = size === 'lg' ? 'w-8 h-8 text-base' : size === 'md' ? 'w-6 h-6 text-xs' : 'w-4 h-4 text-[10px]';

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`${sz} rounded-full ${cfg.bg} flex items-center justify-center text-white shrink-0`}>
        <Icon />
      </span>
      {showLabel && <span className="text-xs text-slate-400">{cfg.label}</span>}
    </span>
  );
}
