'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth, landingPathForRole } from '@/lib/auth';
import DashboardShell from '@/components/DashboardShell';

export default function DashboardHome() {
  const router = useRouter();
  const { user, loading } = useRequireAuth([
    'admin',
    'sales',
    'sanction',
    'disbursement',
    'collection',
  ]);

  useEffect(() => {
    if (loading || !user) return;
    if (user.role !== 'admin') router.replace(landingPathForRole(user.role));
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="p-8 text-slate-500">Loading…</div>;
  }

  return (
    <DashboardShell>
      <div className="card p-6">
        <h1 className="text-xl font-bold">Welcome, {user.name}</h1>
        <p className="mt-2 text-sm text-slate-600">
          You&apos;re signed in as <strong>{user.role}</strong>. Pick a module
          from the tabs above to get started.
        </p>
      </div>
    </DashboardShell>
  );
}
