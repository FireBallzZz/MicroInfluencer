import { useEffect, useState } from 'react';
import {
  listAdminUsers, suspendAdminUser, reactivateAdminUser, deleteAdminUser,
  type AdminUser,
} from '../../api/endpoints';
import { PageHeader, SectionHeader, EmptyState } from '../../components/ui';
import { ConfirmDialog, Modal } from '../../components/Modal';
import { Button, FormField, Input, Textarea, Select } from '../../components/ui';
import { useToast } from '../../state/ToastContext';
import { isApiError } from '../../api/client';
import { Search, ShieldOff, ShieldCheck, Trash2 } from 'lucide-react';
import type { Role } from '../../types';
import { useAdminAuth } from '../../state/AdminAuthContext';

const STATUSES = ['all', 'active', 'suspended'] as const;
const ROLES = ['all', 'creator', 'brand', 'admin'] as const;

export default function Users() {
  const { user: admin } = useAdminAuth();
  const { push } = useToast();
  const [list, setList] = useState<AdminUser[]>([]);
  const [q, setQ] = useState('');
  const [role, setRole] = useState<typeof ROLES[number]>('all');
  const [status, setStatus] = useState<typeof STATUSES[number]>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [target, setTarget] = useState<{ user: AdminUser; action: 'suspend' | 'reactivate' | 'delete' } | null>(null);
  const [reason, setReason] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listAdminUsers({
      q: q || undefined,
      role: role === 'all' ? undefined : (role as Role),
      status: status === 'all' ? undefined : status,
    })
      .then((list) => { if (!cancelled) setList(list); })
      .catch((err) => { if (!cancelled) setError(isApiError(err) ? err.message : 'Failed to load users.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [q, role, status]);

  const onConfirm = async () => {
    if (!target) return;
    if (!reason.trim()) {
      push('A reason is required for moderation actions.', 'error');
      return;
    }
    try {
      if (target.action === 'suspend') {
        const u = await suspendAdminUser(target.user.id, reason);
        setList((prev) => prev.map((p) => (p.id === u.id ? u : p)));
        push('User suspended', 'success');
      } else if (target.action === 'reactivate') {
        const u = await reactivateAdminUser(target.user.id, reason);
        setList((prev) => prev.map((p) => (p.id === u.id ? u : p)));
        push('User reactivated', 'success');
      } else if (target.action === 'delete') {
        await deleteAdminUser(target.user.id, reason);
        setList((prev) => prev.filter((p) => p.id !== target.user.id));
        push('User deleted', 'info');
      }
      setTarget(null);
      setReason('');
    } catch (err) {
      push(isApiError(err) ? err.message : 'Action failed.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="FR-22"
        title="Users"
        description="Search, filter, suspend or reactivate. Deleting is permanent."
      />

      <div className="card p-4 sm:p-5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-ink-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            className="pl-10 h-10"
            placeholder="Search by name, email, username"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Select value={role} onChange={(e) => setRole(e.target.value as any)}>
          {ROLES.map((r) => <option key={r} value={r}>{r === 'all' ? 'All roles' : r[0].toUpperCase() + r.slice(1)}</option>)}
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value as any)}>
          {STATUSES.map((s) => <option key={s} value={s}>{s === 'all' ? 'All statuses' : s[0].toUpperCase() + s.slice(1)}</option>)}
        </Select>
      </div>

      {loading ? (
        <div className="card p-8 text-center text-sm text-ink-500">Loading users…</div>
      ) : error ? (
        <div className="card p-8 text-center text-sm text-rose-700">{error}</div>
      ) : list.length === 0 ? (
        <div className="card">
          <EmptyState title="No users match your filters" description="Try clearing the search." />
        </div>
      ) : (
        <div className="card overflow-hidden">
          {/* Mobile card view */}
          <div className="sm:hidden divide-y divide-ink-200/60">
            {list.map((u) => {
              const isMe = admin?.id === String(u.id);
              return (
                <div key={u.id} className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-ink-900 truncate">{u.fullName}</div>
                      <div className="text-xs text-ink-500 truncate">@{u.username} · {u.email}</div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="tag tag-paper capitalize text-[10px]">{u.role}</span>
                      {u.status === 'active'
                        ? <span className="tag tag-green text-[10px]">Active</span>
                        : <span className="tag tag-amber text-[10px]">Suspended</span>}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-ink-500 pt-1 border-t border-ink-100">
                    <span>Joined {new Date(u.dateJoined).toLocaleDateString()} {u.emailVerified && '· Verified'}</span>
                    <div className="inline-flex items-center gap-1">
                      {u.status === 'active' ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => { setTarget({ user: u, action: 'suspend' }); setReason(''); }}
                          disabled={isMe}
                          className="px-2"
                        >
                          <ShieldOff className="w-3.5 h-3.5" /> Suspend
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => { setTarget({ user: u, action: 'reactivate' }); setReason(''); }}
                          disabled={isMe}
                          className="px-2"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" /> Reactivate
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => { setTarget({ user: u, action: 'delete' }); setReason(''); }}
                        disabled={isMe}
                        aria-label="Delete user"
                        className="px-2"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tablet/desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="table-quiet min-w-[720px]">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Verified</th>
                  <th>Joined</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((u) => {
                  const isMe = admin?.id === String(u.id);
                  return (
                    <tr key={u.id}>
                      <td>
                        <div className="font-semibold text-ink-900">{u.fullName}</div>
                        <div className="text-xs text-ink-500">@{u.username} · {u.email}</div>
                      </td>
                      <td><span className="tag tag-paper capitalize">{u.role}</span></td>
                      <td>
                        {u.status === 'active'
                          ? <span className="tag tag-green">Active</span>
                          : <span className="tag tag-amber">Suspended</span>}
                      </td>
                      <td>{u.emailVerified ? '✓' : '—'}</td>
                      <td className="text-ink-500 whitespace-nowrap text-xs">
                        {new Date(u.dateJoined).toLocaleDateString()}
                      </td>
                      <td className="text-right">
                        <div className="inline-flex items-center gap-1">
                          {u.status === 'active' ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => { setTarget({ user: u, action: 'suspend' }); setReason(''); }}
                              disabled={isMe}
                            >
                              <ShieldOff className="w-3.5 h-3.5" /> Suspend
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => { setTarget({ user: u, action: 'reactivate' }); setReason(''); }}
                              disabled={isMe}
                            >
                              <ShieldCheck className="w-3.5 h-3.5" /> Reactivate
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => { setTarget({ user: u, action: 'delete' }); setReason(''); }}
                            disabled={isMe}
                            aria-label="Delete user"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={!!target}
        onClose={() => { setTarget(null); setReason(''); }}
        title={
          target?.action === 'suspend' ? `Suspend ${target.user.fullName}?` :
          target?.action === 'reactivate' ? `Reactivate ${target.user.fullName}?` :
          `Delete ${target?.user.fullName}?`
        }
        size="md"
        footer={
          <>
            <button className="btn btn-secondary btn-md" onClick={() => { setTarget(null); setReason(''); }}>Cancel</button>
            <button
              className={
                target?.action === 'delete' ? 'btn btn-danger btn-md' :
                target?.action === 'suspend' ? 'btn btn-secondary btn-md' :
                'btn btn-primary btn-md'
              }
              onClick={onConfirm}
              disabled={!reason.trim()}
            >
              Confirm
            </button>
          </>
        }
      >
        <p className="text-sm text-ink-600 mb-3">
          {target?.action === 'suspend'
            ? 'A suspended user cannot log in until you reactivate them. Existing JWTs are not revoked, but the next login attempt will fail.'
            : target?.action === 'reactivate'
              ? 'The user will be able to log in again immediately.'
              : 'Deletion is permanent. All their campaigns, proposals, and reviews are removed.'}
        </p>
        <FormField label="Reason" required>
          <Textarea rows={3} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why are you taking this action?" />
        </FormField>
        <div className="text-xs text-ink-400 mt-1 text-right">{reason.length}/500</div>
      </Modal>
    </div>
  );
}
