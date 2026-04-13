'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiSave } from 'react-icons/fi';

const inputClass = 'w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 transition-colors';
const labelClass = 'block text-xs font-medium text-slate-400 mb-1';

const groups = [
  { key: 'brand',    label: 'Brand & Company' },
  { key: 'hero',     label: 'Hero Section' },
  { key: 'contact',  label: 'Contact Info' },
  { key: 'social',   label: 'Social Links' },
  { key: 'stats',    label: 'Statistics' },
  { key: 'about',    label: 'About Section' },
  { key: 'seo',      label: 'SEO Settings' },
  { key: 'sections', label: 'Homepage Sections' },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [activeGroup, setActiveGroup] = useState('brand');

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(data => {
      setSettings(data.settings || {});
      setLoading(false);
    });
  }, []);

  const setValue = (key, value) => setSettings(s => ({ ...s, [key]: { ...s[key], value } }));

  const handleSave = async () => {
    setSaving(true);
    const payload = {};
    Object.entries(settings).forEach(([key, s]) => { payload[key] = s.value; });
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings: payload }),
    });
    setSaving(false);
    if (res.ok) toast.success('Settings saved!');
    else toast.error('Failed to save settings');
  };

  const groupSettings = Object.entries(settings).filter(([, s]) => s.group === activeGroup);

  if (loading) return <div className="p-8 text-slate-500 text-center">Loading settings...</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Settings</h1>
          <p className="text-slate-500 text-sm mt-1">Control your website content and configuration</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-60">
          {saving ? 'Saving...' : <><FiSave className="w-4 h-4"/> Save Changes</>}
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar tabs */}
        <div className="w-48 shrink-0 space-y-1">
          {groups.map(g => (
            <button
              key={g.key}
              onClick={() => setActiveGroup(g.key)}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeGroup===g.key?'bg-blue-600 text-white':'text-slate-400 hover:text-white hover:bg-white/8'}`}
            >
              {g.label}
            </button>
          ))}
        </div>

        {/* Settings panel */}
        <div className="flex-1 bg-white/5 border border-white/8 rounded-2xl p-6">
          <h2 className="text-white font-semibold text-base mb-6 pb-3 border-b border-white/8">
            {groups.find(g => g.key === activeGroup)?.label}
          </h2>

          {groupSettings.length === 0 ? (
            <p className="text-slate-500 text-sm">No settings in this group.</p>
          ) : (
            <div className="space-y-5">
              {groupSettings.map(([key, setting]) => (
                <div key={key}>
                  <label className={labelClass}>{setting.label || key}</label>
                  {typeof setting.value === 'boolean' ? (
                    <label className="flex items-center gap-3 cursor-pointer mt-1">
                      <div
                        onClick={() => setValue(key, !setting.value)}
                        className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${setting.value ? 'bg-blue-600' : 'bg-white/10'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${setting.value ? 'translate-x-6' : 'translate-x-1'}`} />
                      </div>
                      <span className="text-slate-300 text-sm">{setting.value ? 'Enabled' : 'Disabled'}</span>
                    </label>
                  ) : key === 'googleMapEmbed' || key.includes('story') || key.includes('Story') || setting.value?.length > 100 ? (
                    <textarea
                      rows={4}
                      value={setting.value || ''}
                      onChange={e => setValue(key, e.target.value)}
                      className={`${inputClass} resize-none`}
                    />
                  ) : (
                    <input
                      type="text"
                      value={setting.value || ''}
                      onChange={e => setValue(key, e.target.value)}
                      className={inputClass}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
