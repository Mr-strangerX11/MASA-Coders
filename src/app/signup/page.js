'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FiUser, FiMail, FiLock, FiBriefcase,
  FiArrowRight, FiEye, FiEyeOff, FiCheck, FiRefreshCw,
  FiCheckCircle, FiFileText, FiMessageSquare, FiShield,
  FiAlertCircle, FiChevronDown,
} from 'react-icons/fi';

// Top countries — most common first, rest alphabetical
const COUNTRIES = [
  { code: 'NP', dial: '+977', name: 'Nepal',          flag: '🇳🇵' },
  { code: 'US', dial: '+1',   name: 'United States',  flag: '🇺🇸' },
  { code: 'GB', dial: '+44',  name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'IN', dial: '+91',  name: 'India',           flag: '🇮🇳' },
  { code: 'AU', dial: '+61',  name: 'Australia',       flag: '🇦🇺' },
  { code: 'CA', dial: '+1',   name: 'Canada',          flag: '🇨🇦' },
  { code: 'AE', dial: '+971', name: 'UAE',             flag: '🇦🇪' },
  { code: 'SG', dial: '+65',  name: 'Singapore',       flag: '🇸🇬' },
  { code: 'PK', dial: '+92',  name: 'Pakistan',        flag: '🇵🇰' },
  { code: 'BD', dial: '+880', name: 'Bangladesh',      flag: '🇧🇩' },
  { code: 'LK', dial: '+94',  name: 'Sri Lanka',       flag: '🇱🇰' },
  { code: 'MY', dial: '+60',  name: 'Malaysia',        flag: '🇲🇾' },
  { code: 'PH', dial: '+63',  name: 'Philippines',     flag: '🇵🇭' },
  { code: 'DE', dial: '+49',  name: 'Germany',         flag: '🇩🇪' },
  { code: 'FR', dial: '+33',  name: 'France',          flag: '🇫🇷' },
  { code: 'JP', dial: '+81',  name: 'Japan',           flag: '🇯🇵' },
  { code: 'KR', dial: '+82',  name: 'South Korea',     flag: '🇰🇷' },
  { code: 'CN', dial: '+86',  name: 'China',           flag: '🇨🇳' },
  { code: 'BR', dial: '+55',  name: 'Brazil',          flag: '🇧🇷' },
  { code: 'NG', dial: '+234', name: 'Nigeria',         flag: '🇳🇬' },
  { code: 'ZA', dial: '+27',  name: 'South Africa',    flag: '🇿🇦' },
  { code: 'KE', dial: '+254', name: 'Kenya',           flag: '🇰🇪' },
  { code: 'GH', dial: '+233', name: 'Ghana',           flag: '🇬🇭' },
  { code: 'NL', dial: '+31',  name: 'Netherlands',     flag: '🇳🇱' },
  { code: 'SE', dial: '+46',  name: 'Sweden',          flag: '🇸🇪' },
  { code: 'IT', dial: '+39',  name: 'Italy',           flag: '🇮🇹' },
  { code: 'ES', dial: '+34',  name: 'Spain',           flag: '🇪🇸' },
  { code: 'MX', dial: '+52',  name: 'Mexico',          flag: '🇲🇽' },
  { code: 'AR', dial: '+54',  name: 'Argentina',       flag: '🇦🇷' },
  { code: 'EG', dial: '+20',  name: 'Egypt',           flag: '🇪🇬' },
  { code: 'SA', dial: '+966', name: 'Saudi Arabia',    flag: '🇸🇦' },
  { code: 'QA', dial: '+974', name: 'Qatar',           flag: '🇶🇦' },
  { code: 'ID', dial: '+62',  name: 'Indonesia',       flag: '🇮🇩' },
  { code: 'TH', dial: '+66',  name: 'Thailand',        flag: '🇹🇭' },
  { code: 'VN', dial: '+84',  name: 'Vietnam',         flag: '🇻🇳' },
  { code: 'NZ', dial: '+64',  name: 'New Zealand',     flag: '🇳🇿' },
  { code: 'CH', dial: '+41',  name: 'Switzerland',     flag: '🇨🇭' },
  { code: 'NO', dial: '+47',  name: 'Norway',          flag: '🇳🇴' },
  { code: 'DK', dial: '+45',  name: 'Denmark',         flag: '🇩🇰' },
];

const FEATURES = [
  { icon: FiCheckCircle,  label: 'Live project tracking',  color: 'text-blue-400',    bg: 'bg-blue-500/10'    },
  { icon: FiFileText,     label: 'Invoices & payments',    color: 'text-violet-400',  bg: 'bg-violet-500/10'  },
  { icon: FiMessageSquare,label: '24/7 support portal',    color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { icon: FiShield,       label: 'Secure document vault',  color: 'text-amber-400',   bg: 'bg-amber-500/10'   },
];

// Phone input: country selector + number field
function PhoneInput({ dialCode, onDialChange, number, onNumberChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);
  const selected = COUNTRIES.find(c => c.dial === dialCode) || COUNTRIES[0];

  const filtered = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.dial.includes(search)
  );

  useEffect(() => {
    function handleClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="flex gap-2" ref={ref}>
      {/* Country dropdown */}
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 h-full px-3 bg-white/[0.05] border border-white/[0.08] rounded-xl text-sm text-white hover:border-white/20 transition-colors"
        >
          <span className="text-base leading-none">{selected.flag}</span>
          <span className="text-slate-300 font-medium">{selected.dial}</span>
          <FiChevronDown size={11} className={`text-slate-600 transition-transform ${open ? 'rotate-180' : ''}`}/>
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              transition={{ duration: 0.12 }}
              className="absolute left-0 top-full mt-1 z-50 w-60 bg-[#1a2235] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
            >
              {/* Search */}
              <div className="p-2 border-b border-white/8">
                <input
                  type="text"
                  placeholder="Search country..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500/40 placeholder-slate-700"
                  autoFocus
                />
              </div>
              {/* List */}
              <div className="max-h-44 overflow-y-auto">
                {filtered.map(c => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => { onDialChange(c.dial); setOpen(false); setSearch(''); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-white/5 transition-colors text-left ${c.dial === dialCode ? 'bg-blue-500/10 text-blue-300' : 'text-slate-300'}`}
                  >
                    <span className="text-sm">{c.flag}</span>
                    <span className="flex-1 truncate">{c.name}</span>
                    <span className="text-slate-600 shrink-0">{c.dial}</span>
                  </button>
                ))}
                {filtered.length === 0 && (
                  <div className="px-3 py-4 text-center text-xs text-slate-600">No results</div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Number input */}
      <input
        type="tel"
        required
        value={number}
        onChange={e => onNumberChange(e.target.value.replace(/[^0-9\s\-]/g, ''))}
        placeholder="98XXXXXXXX"
        className="flex-1 bg-white/[0.05] border border-white/[0.08] text-white rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/40 transition placeholder-slate-700"
      />
    </div>
  );
}

function StepBar({ step }) {
  const labels = ['Account', 'Verify', 'Done'];
  return (
    <div className="flex items-center gap-1.5 mb-7">
      {labels.map((label, i) => {
        const idx = i + 1;
        const done = step > idx; const active = step === idx;
        return (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-300 ${
              done ? 'bg-blue-600 text-white' : active ? 'border-2 border-blue-500 text-blue-400 bg-blue-500/10' : 'border border-white/10 text-slate-600 bg-white/5'
            }`}>
              {done ? <FiCheck size={10}/> : idx}
            </div>
            <span className={`text-[11px] font-medium hidden sm:block transition-colors ${active ? 'text-white' : done ? 'text-slate-500' : 'text-slate-700'}`}>{label}</span>
            {i < labels.length - 1 && <div className={`w-6 h-px mx-0.5 ${step > idx ? 'bg-blue-500' : 'bg-white/10'}`}/>}
          </div>
        );
      })}
    </div>
  );
}

export default function SignupPage() {
  const router = useRouter();

  const [form, setForm]     = useState({ name: '', email: '', password: '', company: '' });
  const [dialCode, setDialCode]   = useState('+977'); // Nepal default
  const [phoneNum, setPhoneNum]   = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [step, setStep]           = useState(1);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verifying, setVerifying] = useState(false);
  const otpInputs = useRef([]);
  const setOtpRef = useCallback((el, i) => { otpInputs.current[i] = el; }, []);

  // ?verify=1 redirect from login — no useSearchParams needed
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('verify') !== '1') return;
    const email = sessionStorage.getItem('verify_email');
    if (!email) return;
    sessionStorage.removeItem('verify_email');
    setForm(p => ({ ...p, email }));
    fetch('/api/client/otp?action=send', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }).then(async r => {
      const d = await r.json();
      if (!r.ok) { toast.error(d.error || 'Could not send OTP.'); return; }
      setResendCooldown(60); setStep(2);
      setTimeout(() => otpInputs.current[0]?.focus(), 150);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const update = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  function handleOtpInput(idx, val) {
    const d = val.replace(/\D/, '').slice(-1);
    const next = [...otpDigits]; next[idx] = d;
    setOtpDigits(next);
    if (d && idx < 5) otpInputs.current[idx + 1]?.focus();
  }
  function handleOtpKeyDown(idx, e) {
    if (e.key === 'Backspace' && !otpDigits[idx] && idx > 0) otpInputs.current[idx - 1]?.focus();
  }
  function handleOtpPaste(e) {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!text) return; e.preventDefault();
    const next = [...otpDigits]; text.split('').forEach((d, i) => { next[i] = d; });
    setOtpDigits(next); otpInputs.current[Math.min(text.length, 5)]?.focus();
  }

  async function sendOtp(email) {
    const res  = await fetch('/api/client/otp?action=send', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not send OTP.');
  }

  async function handleResend() {
    if (resendCooldown > 0) return;
    try {
      await sendOtp(form.email);
      toast.success('New code sent!');
      setResendCooldown(60);
      setOtpDigits(['', '', '', '', '', '']);
      otpInputs.current[0]?.focus();
    } catch (err) { toast.error(err.message); }
  }

  async function handleVerify(e) {
    e.preventDefault();
    const code = otpDigits.join('');
    if (code.length < 6) { toast.error('Enter all 6 digits.'); return; }
    setVerifying(true);
    try {
      const res  = await fetch('/api/client/otp?action=verify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, otp: code }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Verification failed.'); return; }
      setStep(3);
      setTimeout(() => router.push('/client/dashboard'), 2200);
    } finally { setVerifying(false); }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim())        { toast.error('Please enter your name.');               return; }
    if (!form.email.trim())       { toast.error('Please enter your email.');              return; }
    if (!phoneNum.trim())         { toast.error('Please enter your phone number.');       return; }
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters.'); return; }
    if (form.password !== confirmPw) { toast.error('Passwords do not match.');            return; }

    setLoading(true);
    try {
      const phone = `${dialCode}${phoneNum.trim()}`;
      const res   = await fetch('/api/client/auth?action=register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, phone }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }

      try {
        await sendOtp(data.email || form.email);
      } catch (emailErr) {
        toast.error(emailErr.message);
        return;
      }

      setResendCooldown(60); setStep(2);
      setTimeout(() => otpInputs.current[0]?.focus(), 150);
    } finally { setLoading(false); }
  }

  const strength = (() => {
    const p = form.password; if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++; if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++; if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();

  const pwMatch = confirmPw.length > 0 && form.password === confirmPw;
  const pwMismatch = confirmPw.length > 0 && form.password !== confirmPw;

  const INPUT = 'w-full bg-white/[0.05] border border-white/[0.08] text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/40 transition placeholder-slate-700';

  return (
    <div className="min-h-screen bg-[#060912] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-700/6 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"/>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-violet-700/6 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none"/>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-16 lg:pt-32">
        <div className="grid lg:grid-cols-[1fr_480px] gap-12 lg:gap-20 items-start">

          {/* ── Left: value proposition ── */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="hidden lg:flex flex-col justify-center pt-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold w-fit mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>
              Free client portal — no credit card needed
            </div>
            <h1 className="text-5xl font-bold text-white leading-[1.12] mb-5">
              Your project hub,<br/>
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">always on.</span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-md">
              One workspace to track every deliverable, manage payments, and communicate with our team.
            </p>
            <div className="grid grid-cols-2 gap-3 mb-10">
              {FEATURES.map(({ icon: Icon, label, color, bg }) => (
                <div key={label} className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                    <Icon size={14} className={color}/>
                  </div>
                  <span className="text-slate-300 text-sm font-medium">{label}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2.5">
                {[['RS','bg-blue-600'],['PM','bg-violet-600'],['JW','bg-emerald-600'],['AK','bg-rose-600']].map(([init, bg]) => (
                  <div key={init} className={`w-9 h-9 rounded-full border-2 border-[#060912] flex items-center justify-center text-[11px] font-bold text-white ${bg}`}>{init}</div>
                ))}
              </div>
              <div>
                <div className="text-white text-sm font-semibold">150+ clients onboarded</div>
                <div className="flex items-center gap-0.5 mt-0.5">
                  {[...Array(5)].map((_,i) => (
                    <svg key={i} className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  ))}
                  <span className="text-slate-500 text-xs ml-1.5">4.9 / 5</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Right: form card ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-7 sm:p-8 shadow-2xl">
              <StepBar step={step}/>

              {/* ── Step 3: Success ── */}
              {step === 3 && (
                <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center mx-auto mb-4">
                    <FiCheck size={32} className="text-emerald-400"/>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-1">Email Verified!</h2>
                  <p className="text-slate-400 text-sm mb-1">
                    Welcome{form.name ? <span>, <strong className="text-white">{form.name.split(' ')[0]}</strong></span> : null}!
                  </p>
                  <p className="text-slate-600 text-sm">Redirecting to your dashboard…</p>
                  <div className="mt-5 w-full bg-white/5 rounded-full h-0.5 overflow-hidden">
                    <motion.div className="h-full bg-blue-500 rounded-full" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 2.0, ease: 'linear' }}/>
                  </div>
                </motion.div>
              )}

              {/* ── Step 2: OTP ── */}
              {step === 2 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-3">
                      <FiMail size={20} className="text-blue-400"/>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-1">Check your inbox</h2>
                    <p className="text-slate-500 text-sm">
                      Code sent to <span className="text-slate-300 font-medium">{form.email}</span>
                    </p>
                  </div>
                  <form onSubmit={handleVerify} className="space-y-5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide text-center mb-3">Verification code</label>
                      <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                        {otpDigits.map((d, i) => (
                          <input key={i} ref={el => setOtpRef(el, i)}
                            type="text" inputMode="numeric" maxLength={1} value={d}
                            onChange={e => handleOtpInput(i, e.target.value)}
                            onKeyDown={e => handleOtpKeyDown(i, e)}
                            className="w-11 h-14 text-center text-xl font-bold bg-white/[0.05] border-2 border-white/[0.08] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition caret-transparent"
                          />
                        ))}
                      </div>
                    </div>
                    <button type="submit" disabled={verifying || otpDigits.join('').length < 6}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {verifying ? <span className="w-5 h-5 border-2 border-white/25 border-t-white rounded-full animate-spin"/> : <><span>Verify Email</span><FiCheck size={14}/></>}
                    </button>
                    <div className="text-center space-y-2 pt-1">
                      <button type="button" onClick={handleResend} disabled={resendCooldown > 0}
                        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-400 disabled:text-slate-700 disabled:cursor-not-allowed transition-colors"
                      >
                        <FiRefreshCw size={12}/>
                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                      </button>
                      <br/>
                      <button type="button" onClick={() => setStep(1)} className="text-xs text-slate-700 hover:text-slate-400 transition-colors">← Back</button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* ── Step 1: Registration form ── */}
              {step === 1 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
                  <div className="mb-5">
                    <h2 className="text-xl font-bold text-white mb-1">Create your account</h2>
                    <p className="text-slate-500 text-sm">
                      Already have one?{' '}
                      <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">Sign in</Link>
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name + Company */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Name <span className="text-red-400 normal-case">*</span></label>
                        <div className="relative">
                          <FiUser size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600"/>
                          <input type="text" required value={form.name} onChange={update('name')} placeholder="John Doe" className={INPUT}/>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Company</label>
                        <div className="relative">
                          <FiBriefcase size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600"/>
                          <input type="text" value={form.company} onChange={update('company')} placeholder="Acme Corp" className={INPUT}/>
                        </div>
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Email <span className="text-red-400 normal-case">*</span></label>
                      <div className="relative">
                        <FiMail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600"/>
                        <input type="email" required value={form.email} onChange={update('email')} placeholder="you@company.com" className={INPUT}/>
                      </div>
                    </div>

                    {/* Phone with country code */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                        Phone <span className="text-red-400 normal-case">*</span>
                      </label>
                      <PhoneInput
                        dialCode={dialCode}
                        onDialChange={setDialCode}
                        number={phoneNum}
                        onNumberChange={setPhoneNum}
                      />
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Password <span className="text-red-400 normal-case">*</span></label>
                      <div className="relative">
                        <FiLock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600"/>
                        <input
                          type={showPw ? 'text' : 'password'} required
                          value={form.password} onChange={update('password')}
                          placeholder="Min. 8 characters"
                          className="w-full bg-white/[0.05] border border-white/[0.08] text-white rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/40 transition placeholder-slate-700"
                        />
                        <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors">
                          {showPw ? <FiEyeOff size={13}/> : <FiEye size={13}/>}
                        </button>
                      </div>
                      {form.password && (
                        <div className="mt-2">
                          <div className="flex gap-1">
                            {[1,2,3,4].map(i => (
                              <div key={i} className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${i <= strength ? ['','bg-red-500','bg-yellow-500','bg-blue-500','bg-emerald-500'][strength] : 'bg-white/10'}`}/>
                            ))}
                          </div>
                          <span className={`text-[11px] font-medium mt-1 block ${['','text-red-400','text-yellow-400','text-blue-400','text-emerald-400'][strength]}`}>
                            {['','Weak','Fair','Good','Strong'][strength]}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Confirm Password <span className="text-red-400 normal-case">*</span></label>
                      <div className="relative">
                        <FiLock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600"/>
                        <input
                          type={showConfirm ? 'text' : 'password'} required
                          value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                          placeholder="Re-enter password"
                          className={`w-full bg-white/[0.05] border text-white rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 transition placeholder-slate-700 ${
                            pwMatch    ? 'border-emerald-500/50 focus:ring-emerald-500/20 focus:border-emerald-500/50' :
                            pwMismatch ? 'border-red-500/40 focus:ring-red-500/20 focus:border-red-500/40' :
                                         'border-white/[0.08] focus:ring-blue-500/30 focus:border-blue-500/40'
                          }`}
                        />
                        <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors">
                          {showConfirm ? <FiEyeOff size={13}/> : <FiEye size={13}/>}
                        </button>
                        {pwMatch && <FiCheck size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-400 pointer-events-none"/>}
                        {pwMismatch && <FiAlertCircle size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-red-400 pointer-events-none"/>}
                      </div>
                      {pwMismatch && (
                        <p className="text-red-400 text-[11px] mt-1.5 flex items-center gap-1">
                          <FiAlertCircle size={10}/> Passwords do not match
                        </p>
                      )}
                      {pwMatch && (
                        <p className="text-emerald-400 text-[11px] mt-1.5 flex items-center gap-1">
                          <FiCheck size={10}/> Passwords match
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={loading || pwMismatch || (confirmPw.length > 0 && !pwMatch)}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-semibold py-3 rounded-xl transition-all mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading
                        ? <span className="w-5 h-5 border-2 border-white/25 border-t-white rounded-full animate-spin"/>
                        : <><span>Create Free Account</span><FiArrowRight size={14}/></>
                      }
                    </button>

                    <p className="text-center text-slate-700 text-[11px] pt-0.5">
                      By signing up you agree to our{' '}
                      <Link href="/contact" className="text-slate-500 hover:text-blue-400 transition-colors">Terms</Link>
                      {' & '}
                      <Link href="/contact" className="text-slate-500 hover:text-blue-400 transition-colors">Privacy Policy</Link>
                    </p>
                  </form>
                </motion.div>
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
