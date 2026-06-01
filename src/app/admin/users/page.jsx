'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FiUsers, FiSearch, FiCheck, FiX, FiShield, FiUserCheck,
  FiUserX, FiRefreshCw, FiChevronLeft, FiChevronRight,
  FiMail, FiBriefcase, FiPhone, FiClock, FiTrash2, FiAlertTriangle,
  FiDownload, FiCheckSquare,
} from 'react-icons/fi';

const STATUS_TABS = [
  { key: 'all',      label: 'All Users' },
  { key: 'pending',  label: 'Pending Verification' },
  { key: 'active',   label: 'Active' },
  { key: 'inactive', label: 'Inactive' },
];

const ROLES = ['client', 'staff', 'editor', 'manager', 'admin'];

const ROLE_COLORS = {
  client:  'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  staff:   'bg-violet-500/15 text-violet-400 border-violet-500/20',
  editor:  'bg-blue-500/15 text-blue-400 border-blue-500/20',
  manager: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  admin:   'bg-red-500/15 text-red-400 border-red-500/20',
};

function Avatar({ name }) {
  const initials = name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '??';
  const colors   = ['bg-blue-600', 'bg-violet-600', 'bg-emerald-600', 'bg-amber-600', 'bg-rose-600'];
  const color    = colors[(name?.charCodeAt(0) || 0) % colors.length];
  return (
    <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
      {initials}
    </div>
  );
}

function RoleDropdown({ userId, currentRole, onUpdate }) {
  const [open, setOpen]    = useState(false);
  const [saving, setSaving] = useState(false);

  async function changeRole(role) {
    if (role === currentRole) { setOpen(false); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, updates: { role } }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Failed to update role.'); return; }
      toast.success(`Role changed to ${role}`);
      onUpdate(data.user);
    } finally {
      setSaving(false);
      setOpen(false);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={saving}
        className={`px-2 py-0.5 rounded-md border text-xs font-semibold transition-all ${ROLE_COLORS[currentRole] || 'bg-white/5 text-slate-400 border-white/10'} hover:opacity-80`}
      >
        {saving ? '…' : currentRole}
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)}/>
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.95 }}
              transition={{ duration: 0.1 }}
              className="absolute left-0 top-7 z-20 bg-[#1c2333] border border-white/10 rounded-xl overflow-hidden shadow-xl min-w-[120px]"
            >
              {ROLES.map(r => (
                <button
                  key={r}
                  onClick={() => changeRole(r)}
                  className={`w-full text-left px-4 py-2 text-xs font-medium transition-colors ${r === currentRole ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5'}`}
                >
                  {r}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers]         = useState([]);
  const [total, setTotal]         = useState(0);
  const [pages, setPages]         = useState(1);
  const [page, setPage]           = useState(1);
  const [loading, setLoading]     = useState(true);
  const [status, setStatus]       = useState('all');
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch]       = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting]     = useState(false);
  const [selected, setSelected]     = useState(new Set());
  const [bulkAction, setBulkAction] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status, page, limit: 20 });
      if (search)     params.set('search', search);
      if (roleFilter) params.set('role', roleFilter);
      const res  = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Failed to load users.'); return; }
      setUsers(data.users);
      setTotal(data.total);
      setPages(data.pages);
    } finally {
      setLoading(false);
    }
  }, [status, page, search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  function updateUser(updated) {
    setUsers(prev => prev.map(u => u._id === updated._id ? { ...u, ...updated } : u));
  }

  async function toggleVerified(user) {
    const next = !user.isVerified;
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user._id, updates: { isVerified: next } }),
    });
    const data = await res.json();
    if (!res.ok) { toast.error(data.error); return; }
    toast.success(next ? 'User approved' : 'Verification removed');
    updateUser(data.user);
  }

  async function toggleActive(user) {
    const next = !user.isActive;
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user._id, updates: { isActive: next } }),
    });
    const data = await res.json();
    if (!res.ok) { toast.error(data.error); return; }
    toast.success(next ? 'User activated' : 'User deactivated');
    updateUser(data.user);
  }

  async function hardDelete(user) {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users?userId=${user._id}&hard=true`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Delete failed.'); return; }
      toast.success(`${user.name} deleted permanently.`);
      setUsers(prev => prev.filter(u => u._id !== user._id));
      setTotal(t => t - 1);
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  }

  async function executeBulkAction() {
    if (!bulkAction || selected.size === 0) return;
    const ids = [...selected];
    const updates =
      bulkAction === 'verify'     ? { isVerified: true }  :
      bulkAction === 'unverify'   ? { isVerified: false } :
      bulkAction === 'activate'   ? { isActive: true }    :
      bulkAction === 'deactivate' ? { isActive: false }   : null;

    if (updates) {
      await Promise.all(ids.map(userId =>
        fetch('/api/admin/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, updates }) })
      ));
      toast.success(`${ids.length} users updated.`);
      setSelected(new Set()); setBulkAction('');
      fetchUsers();
    }
  }

  const pendingCount = users.filter(u => !u.isVerified && u.isActive).length;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <FiUsers className="text-blue-400" size={22}/>
            User Management
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">{total} total users</p>
        </div>
        <div className="flex items-center gap-2">
          <a href="/api/export?type=users" download
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-sm font-medium transition-all"
          >
            <FiDownload size={14}/> Export CSV
          </a>
          <button onClick={fetchUsers}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-sm font-medium transition-all"
          >
            <FiRefreshCw size={14}/> Refresh
          </button>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 bg-white/5 p-1 rounded-xl w-fit border border-white/5">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => { setStatus(tab.key); setPage(1); }}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              status === tab.key
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
            {tab.key === 'pending' && pendingCount > 0 && status !== 'pending' && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-full">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Search + role filter */}
      <div className="flex gap-3 items-center">
        <div className="relative max-w-sm">
          <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/>
          <input
            type="text"
            placeholder="Search by name, email, company…"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="w-full bg-white/5 border border-white/10 text-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition placeholder-slate-600"
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
          className="bg-white/5 border border-white/10 text-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition"
        >
          <option value="">All roles</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-blue-600/10 border border-blue-500/20 rounded-xl">
          <FiCheckSquare size={14} className="text-blue-400"/>
          <span className="text-blue-300 text-sm font-medium">{selected.size} selected</span>
          <select value={bulkAction} onChange={e => setBulkAction(e.target.value)}
            className="ml-auto bg-white/5 border border-white/10 text-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
          >
            <option value="">Choose action…</option>
            <option value="verify">Verify all</option>
            <option value="unverify">Unverify all</option>
            <option value="activate">Activate all</option>
            <option value="deactivate">Deactivate all</option>
          </select>
          <button onClick={executeBulkAction} disabled={!bulkAction}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg disabled:opacity-40 transition-all"
          >Apply</button>
          <button onClick={() => setSelected(new Set())}
            className="text-slate-500 hover:text-slate-300 text-xs transition-colors"
          >Clear</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-[#161b27] border border-white/8 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-500 gap-3">
            <span className="w-5 h-5 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin"/>
            Loading users…
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <FiUsers size={32} className="mb-3 opacity-30"/>
            <p className="font-medium">No users found</p>
            <p className="text-xs mt-1">Try adjusting the filter or search</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-slate-500 text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 w-8">
                    <input type="checkbox" className="accent-blue-600"
                      checked={users.length > 0 && users.every(u => selected.has(u._id))}
                      onChange={e => setSelected(e.target.checked ? new Set(users.map(u => u._id)) : new Set())}
                    />
                  </th>
                  <th className="text-left px-5 py-3 font-medium">User</th>
                  <th className="text-left px-4 py-3 font-medium">Contact</th>
                  <th className="text-left px-4 py-3 font-medium">Role</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Joined</th>
                  <th className="text-right px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, i) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Checkbox */}
                    <td className="px-4 py-3.5 w-8">
                      <input type="checkbox" className="accent-blue-600"
                        checked={selected.has(user._id)}
                        onChange={e => setSelected(prev => {
                          const next = new Set(prev);
                          e.target.checked ? next.add(user._id) : next.delete(user._id);
                          return next;
                        })}
                      />
                    </td>
                    {/* User */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={user.name}/>
                        <div>
                          <div className="text-white font-medium">{user.name}</div>
                          {user.company && (
                            <div className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                              <FiBriefcase size={10}/>
                              {user.company}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-4 py-3.5">
                      <div className="text-slate-300 flex items-center gap-1.5 text-xs">
                        <FiMail size={11} className="text-slate-500"/>
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="text-slate-500 flex items-center gap-1.5 text-xs mt-0.5">
                          <FiPhone size={11}/>
                          {user.phone}
                        </div>
                      )}
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3.5">
                      <RoleDropdown userId={user._id} currentRole={user.role} onUpdate={updateUser}/>
                    </td>

                    {/* Status badges */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-1">
                        <span className={`px-2 py-0.5 rounded-md border text-xs font-semibold w-fit ${
                          user.isVerified
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {user.isVerified ? 'Verified' : 'Unverified'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md border text-xs font-semibold w-fit ${
                          user.isActive
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>

                    {/* Joined */}
                    <td className="px-4 py-3.5 text-slate-500 text-xs">
                      <div className="flex items-center gap-1">
                        <FiClock size={10}/>
                        {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Approve / Unverify */}
                        <button
                          onClick={() => toggleVerified(user)}
                          title={user.isVerified ? 'Remove verification' : 'Approve / verify email'}
                          className={`p-1.5 rounded-lg border transition-all ${
                            user.isVerified
                              ? 'bg-white/5 border-white/10 text-slate-400 hover:text-amber-400 hover:border-amber-500/30'
                              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                          }`}
                        >
                          {user.isVerified ? <FiCheck size={13}/> : <FiUserCheck size={13}/>}
                        </button>

                        {/* Activate / Deactivate */}
                        <button
                          onClick={() => toggleActive(user)}
                          title={user.isActive ? 'Deactivate user' : 'Activate user'}
                          className={`p-1.5 rounded-lg border transition-all ${
                            user.isActive
                              ? 'bg-white/5 border-white/10 text-slate-400 hover:text-amber-400 hover:border-amber-500/30'
                              : 'bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20'
                          }`}
                        >
                          {user.isActive ? <FiUserX size={13}/> : <FiShield size={13}/>}
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => setConfirmDelete(user)}
                          title="Delete user permanently"
                          className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-slate-400 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5 transition-all"
                        >
                          <FiTrash2 size={13}/>
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">
            Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <FiChevronLeft size={14}/>
            </button>
            <span className="flex items-center px-3 text-slate-400">{page} / {pages}</span>
            <button
              onClick={() => setPage(p => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <FiChevronRight size={14}/>
            </button>
          </div>
        </div>
      )}

      {/* ── Delete confirmation modal ── */}
      <AnimatePresence>
        {confirmDelete && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => !deleting && setConfirmDelete(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-[#151c2c] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/25 flex items-center justify-center shrink-0">
                    <FiAlertTriangle size={18} className="text-red-400"/>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-base">Delete User</h3>
                    <p className="text-slate-500 text-xs">This action cannot be undone.</p>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/8 rounded-xl p-3 mb-5">
                  <div className="text-white font-semibold text-sm">{confirmDelete.name}</div>
                  <div className="text-slate-400 text-xs mt-0.5">{confirmDelete.email}</div>
                  <div className="flex gap-2 mt-2">
                    <span className="px-2 py-0.5 rounded-md bg-slate-500/15 text-slate-400 border border-slate-500/20 text-[11px] font-semibold">{confirmDelete.role}</span>
                  </div>
                </div>

                <p className="text-slate-400 text-sm mb-5">
                  Permanently delete <strong className="text-white">{confirmDelete.name}</strong>? All their data will be removed from the database.
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmDelete(null)}
                    disabled={deleting}
                    className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 text-sm font-medium hover:bg-white/5 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => hardDelete(confirmDelete)}
                    disabled={deleting}
                    className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {deleting
                      ? <span className="w-4 h-4 border-2 border-white/25 border-t-white rounded-full animate-spin"/>
                      : <><FiTrash2 size={13}/> Delete Permanently</>
                    }
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
