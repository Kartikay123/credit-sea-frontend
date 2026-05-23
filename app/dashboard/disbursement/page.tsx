'use client';

import { useEffect, useState } from 'react';
import { useRequireAuth } from '@/lib/auth';
import { apiGet, apiPost, ApiError } from '@/lib/api';
import { Loan } from '@/lib/types';
import DashboardShell from '@/components/DashboardShell';
import { formatDate, formatINR, statusColor } from '@/lib/format';

export default function DisbursementPage() {
  const { user, loading } = useRequireAuth(['disbursement']);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [fetching, setFetching] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setFetching(true);
    try {
      const { loans } = await apiGet<{ loans: Loan[] }>(
        '/dashboard/disbursement/loans'
      );
      setLoans(loans);
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => {
    if (!user) return;
    refresh();
  }, [user]);

  async function disburse(id: string) {
    setActing(id);
    setError(null);
    try {
      await apiPost(`/dashboard/disbursement/loans/${id}/disburse`);
      await refresh();
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setActing(null);
    }
  }

  if (loading || !user)
    return <div className="p-8 text-slate-500">Loading…</div>;

  return (
    <DashboardShell>
      <div className="mb-4">
        <h1 className="text-xl font-bold">Disbursement — Sanctioned loans</h1>
        <p className="text-sm text-slate-500">
          Release funds for sanctioned loans. Marks the loan as disbursed.
        </p>
      </div>
      {error && (
        <div className="mb-3 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}
      {fetching ? (
        <div className="card p-6 text-slate-500">Loading…</div>
      ) : loans.length === 0 ? (
        <div className="card p-6 text-slate-500">
          No sanctioned loans waiting for disbursement.
        </div>
      ) : (
        <div className="space-y-3">
          {loans.map((l) => (
            <div key={l._id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-xs text-slate-500">
                    Sanctioned {formatDate(l.sanctionedAt)}
                  </div>
                  <div className="text-base font-semibold">
                    {l.profile?.fullName} · PAN {l.profile?.pan}
                  </div>
                  <div className="text-sm text-slate-600">
                    {l.user?.email}
                  </div>
                </div>
                <span
                  className={`badge uppercase ${statusColor(l.status)}`}
                >
                  {l.status}
                </span>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <div>
                  <dt className="text-slate-500">Amount</dt>
                  <dd className="font-medium">{formatINR(l.amount)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Tenure</dt>
                  <dd className="font-medium">{l.tenureDays} days</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Interest</dt>
                  <dd className="font-medium">{formatINR(l.totalInterest)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Total repayment</dt>
                  <dd className="font-medium">
                    {formatINR(l.totalRepayment)}
                  </dd>
                </div>
              </dl>
              <div className="mt-3">
                <button
                  className="btn-primary"
                  disabled={acting === l._id}
                  onClick={() => disburse(l._id)}
                >
                  Mark disbursed
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
