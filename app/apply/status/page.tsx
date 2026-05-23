'use client';

import { useEffect, useState } from 'react';
import { useRequireAuth } from '@/lib/auth';
import { apiGet } from '@/lib/api';
import { Loan } from '@/lib/types';
import StepBar from '@/components/StepBar';
import { formatDate, formatINR, statusColor } from '@/lib/format';

export default function StatusPage() {
  const { user, loading } = useRequireAuth(['borrower']);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!user) return;
    apiGet<{ loans: Loan[] }>('/loans/mine')
      .then(({ loans }) => setLoans(loans))
      .finally(() => setFetching(false));
  }, [user]);

  if (loading || !user) {
    return <div className="p-8 text-slate-500">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <StepBar active="status" />
      <h1 className="mb-4 text-xl font-bold">Your loans</h1>
      {fetching ? (
        <div className="text-slate-500">Loading…</div>
      ) : loans.length === 0 ? (
        <div className="card p-6 text-slate-500">No loans yet.</div>
      ) : (
        <div className="space-y-4">
          {loans.map((l) => (
            <div key={l._id} className="card p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-xs text-slate-500">
                    Applied {formatDate(l.createdAt)}
                  </div>
                  <div className="text-lg font-semibold">
                    {formatINR(l.amount)} · {l.tenureDays} days
                  </div>
                </div>
                <span
                  className={`badge uppercase ${statusColor(l.status)}`}
                >
                  {l.status}
                </span>
              </div>
              <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
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
                <div>
                  <dt className="text-slate-500">Paid</dt>
                  <dd className="font-medium">{formatINR(l.amountPaid)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Outstanding</dt>
                  <dd className="font-medium">
                    {formatINR(l.totalRepayment - l.amountPaid)}
                  </dd>
                </div>
              </dl>
              {l.status === 'rejected' && l.rejectionReason && (
                <div className="mt-3 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  Rejection reason: {l.rejectionReason}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
