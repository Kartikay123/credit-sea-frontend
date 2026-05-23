'use client';

import { useEffect, useState } from 'react';
import { useRequireAuth } from '@/lib/auth';
import { apiGet, apiPost, ApiError, API_URL } from '@/lib/api';
import { Loan } from '@/lib/types';
import DashboardShell from '@/components/DashboardShell';
import { formatDate, formatINR, statusColor } from '@/lib/format';

export default function SanctionPage() {
  const { user, loading } = useRequireAuth(['sanction']);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [fetching, setFetching] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [rejectFor, setRejectFor] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setFetching(true);
    try {
      const { loans } = await apiGet<{ loans: Loan[] }>(
        '/dashboard/sanction/loans'
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

  async function approve(id: string) {
    setActing(id);
    setError(null);
    try {
      await apiPost(`/dashboard/sanction/loans/${id}/approve`);
      await refresh();
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setActing(null);
    }
  }

  async function reject() {
    if (!rejectFor || !reason.trim()) return;
    setActing(rejectFor);
    setError(null);
    try {
      await apiPost(`/dashboard/sanction/loans/${rejectFor}/reject`, {
        reason: reason.trim(),
      });
      setRejectFor(null);
      setReason('');
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
        <h1 className="text-xl font-bold">Sanction — Applied loans</h1>
        <p className="text-sm text-slate-500">
          Review applications. Approve to move into Disbursement, or reject
          with a reason.
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
        <div className="card p-6 text-slate-500">No pending applications.</div>
      ) : (
        <div className="space-y-3">
          {loans.map((l) => (
            <div key={l._id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-xs text-slate-500">
                    Applied {formatDate(l.createdAt)}
                  </div>
                  <div className="text-base font-semibold">
                    {l.profile?.fullName} · PAN {l.profile?.pan}
                  </div>
                  <div className="text-sm text-slate-600">
                    {l.user?.email} · Salary{' '}
                    {formatINR(l.profile?.monthlySalary || 0)} ·{' '}
                    {l.profile?.employmentMode}
                  </div>
                  {l.profile?.salarySlipPath && (
                    <a
                      href={`${API_URL.replace(/\/api$/, '')}/uploads/${l.profile.salarySlipPath}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-block text-xs font-medium text-brand hover:underline"
                    >
                      View salary slip ↗
                    </a>
                  )}
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

              {rejectFor === l._id ? (
                <div className="mt-3 space-y-2">
                  <textarea
                    className="input"
                    rows={2}
                    placeholder="Reason for rejection"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button
                      className="btn-danger"
                      disabled={acting === l._id || !reason.trim()}
                      onClick={reject}
                    >
                      Confirm reject
                    </button>
                    <button
                      className="btn-outline"
                      onClick={() => {
                        setRejectFor(null);
                        setReason('');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-3 flex gap-2">
                  <button
                    className="btn-success"
                    disabled={acting === l._id}
                    onClick={() => approve(l._id)}
                  >
                    Approve
                  </button>
                  <button
                    className="btn-danger"
                    onClick={() => setRejectFor(l._id)}
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
