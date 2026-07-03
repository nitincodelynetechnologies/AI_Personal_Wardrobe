'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Loader2, RefreshCw, Trash2, UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToastStore } from '@/components/ui/toaster';
import { AdminCard } from '@/features/admin/components/AdminCard';
import { useAdminUsers } from '@/features/admin/hooks/useAdminUsers';
import { resolveBackendAssetUrl } from '@/features/admin/utils/resolveBackendAssetUrl';

function formatRegisteredAt(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function UserFaceThumbnail({ user }) {
  const imageUrl = resolveBackendAssetUrl(user.face_image_url);
  const displayName = user.name || user.email || 'Registered user';

  if (imageUrl) {
    return (
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-borderColor bg-slate-100 dark:border-white/10 dark:bg-[#150d22]">
        <Image
          src={imageUrl}
          alt={`Face registration for ${displayName}`}
          fill
          unoptimized
          className="object-cover"
          sizes="48px"
        />
      </div>
    );
  }

  return (
    <div
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-dashed border-borderColor bg-slate-50 text-slate-400 dark:border-white/10 dark:bg-[#150d22] dark:text-slate-500"
      title="No face image on disk"
    >
      <UserRound className="h-5 w-5" aria-hidden />
    </div>
  );
}

function formatAdminDisplayName(user) {
  if (user.name?.trim()) return user.name.trim();
  const email = user.email?.trim();
  if (email) return email.split('@')[0];
  return user.mobile || 'Unnamed user';
}

function RegisteredUserTableRow({ user, onDelete, isDeleting }) {
  const displayName = formatAdminDisplayName(user);
  const email = user.email || user.mobile || 'No contact on file';

  return (
    <tr className="border-b border-borderColor/60 transition-colors hover:bg-slate-50/80 dark:border-white/5 dark:hover:bg-white/[0.02]">
      <td className="px-4 py-3">
        <UserFaceThumbnail user={user} />
      </td>
      <td className="px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{displayName}</p>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">{email}</p>
        </div>
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
        {formatRegisteredAt(user.created_at)}
      </td>
      <td className="px-4 py-3">
        {user.has_face_vector ? (
          <span className="inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Face vector stored
          </span>
        ) : (
          <span className="inline-flex rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            No face vector
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        <button
          type="button"
          onClick={() => onDelete(user)}
          disabled={isDeleting}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-rose-600 transition-colors hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:text-rose-400',
          )}
        >
          {isDeleting ? (
            <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
          ) : (
            <Trash2 className="h-3 w-3" aria-hidden />
          )}
          {isDeleting ? 'Deleting…' : 'Delete user'}
        </button>
      </td>
    </tr>
  );
}

export function AdminRegisteredUsersPanel() {
  const { users, total, loading, error, deletingUserId, refresh, removeUser } = useAdminUsers();
  const showToast = useToastStore((state) => state.showToast);
  const [pendingDelete, setPendingDelete] = useState(null);

  const sortedUsers = useMemo(
    () =>
      [...users].sort((left, right) => {
        const leftTime = new Date(left.created_at).getTime();
        const rightTime = new Date(right.created_at).getTime();
        return rightTime - leftTime;
      }),
    [users],
  );

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;

    try {
      await removeUser(pendingDelete.id);
      showToast({
        message: `${pendingDelete.email || pendingDelete.name || pendingDelete.id} was removed with face files.`,
        variant: 'success',
      });
      setPendingDelete(null);
    } catch (err) {
      showToast({
        message: err instanceof Error ? err.message : 'Could not delete user',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-magenta">User Management</p>
          <h2 className="font-playfair text-3xl font-semibold text-slate-900 dark:text-white">
            Registered Users
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
            Live registry from PostgreSQL and face storage. Refreshes every 5 seconds.
          </p>
        </div>

        <button
          type="button"
          onClick={() => refresh()}
          className="inline-flex items-center gap-2 rounded-xl border border-borderColor bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-[#150d22] dark:text-slate-200 dark:hover:bg-white/5"
        >
          <RefreshCw className="h-4 w-4" aria-hidden />
          Refresh now
        </button>
      </section>

      <AdminCard className="flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-500">Total registered users</p>
          <p className="mt-2 font-playfair text-5xl font-semibold text-slate-900 dark:text-white">
            {loading && total === 0 ? '—' : total.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="text-right text-sm text-slate-500 dark:text-slate-400">
          <p>Data source: live API</p>
          <p>{sortedUsers.length} users loaded</p>
        </div>
      </AdminCard>

      {error && (
        <AdminCard className="border-rose-500/30 bg-rose-500/5 p-4 text-sm text-rose-600 dark:text-rose-400">
          {error}
        </AdminCard>
      )}

      {loading && sortedUsers.length === 0 ? (
        <div className="flex min-h-[240px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-magenta" aria-label="Loading registered users" />
        </div>
      ) : sortedUsers.length === 0 ? (
        <AdminCard className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
          No registered users found in the database.
        </AdminCard>
      ) : (
        <AdminCard className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="border-b border-borderColor bg-slate-50/80 dark:border-white/10 dark:bg-black/20">
                  {['Image', 'User Details', 'Registered Date', 'Status', 'Action'].map((header) => (
                    <th
                      key={header}
                      scope="col"
                      className={cn(
                        'px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400',
                        header === 'Action' && 'text-right',
                      )}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedUsers.map((user) => (
                  <RegisteredUserTableRow
                    key={user.id}
                    user={user}
                    isDeleting={deletingUserId === user.id}
                    onDelete={setPendingDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </AdminCard>
      )}

      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <AdminCard className="w-full max-w-md p-6">
            <h3 className="font-playfair text-2xl font-semibold text-slate-900 dark:text-white">Delete user?</h3>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              This permanently removes{' '}
              <span className="font-semibold text-slate-900 dark:text-white">
                {pendingDelete.email || pendingDelete.name || pendingDelete.id}
              </span>
              , their face image files, wardrobe uploads, and vector data.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                className="rounded-xl border border-borderColor px-4 py-2 text-sm font-semibold text-slate-600 dark:border-white/10 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deletingUserId === pendingDelete.id}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-60"
              >
                {deletingUserId === pendingDelete.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Trash2 className="h-4 w-4" aria-hidden />
                )}
                Delete permanently
              </button>
            </div>
          </AdminCard>
        </div>
      )}
    </div>
  );
}

export default AdminRegisteredUsersPanel;
