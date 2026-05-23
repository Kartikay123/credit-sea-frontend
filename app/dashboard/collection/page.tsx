'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRequireAuth } from '@/lib/auth';
import { apiGet, apiPost, ApiError } from '@/lib/api';
import { Loan, Payment } from '@/lib/types';
import DashboardShell from '@/components/DashboardShell';
import { formatDate, formatINR, statusColor } from '@/lib/format';

export default function CollectionPage() {
  const { user, loading } = useRequireAuth(['collection']);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [fetching, setFetching] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [utr, setUtr] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setFetching(true);
    try {
      const { loans } = await apiGet<{ loans: Loan[] }>(
        '/dashboard/collection/loans'
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

  async function openLoan(loanId: string) {
    if (expanded === loanId) {
      setExpanded(null);
      return;
    }
    setExpanded(loanId);
    setUtr('');
    setAmount(0);
    setError(null);
    const { payments } = await apiGet<{ payments: Payment[] }>(
      `/dashboard/collection/loans/${loanId}/payments`
    );
    setPayments(payments);
  }

  async function record(e: FormEvent, loan: Loan) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await apiPost(
        `/dashboard/collection/loans/${loan._id}/payments`,
        { utrNumber: utr, amount, paymentDate }
      );
      setUtr('');
      setAmount(0);
      await refresh();
      const { payments } = await apiGet<{ payments: Payment[] }>(
        `/dashboard/collection/loans/${loan._id}/payments`
      );
      setPayments(payments);
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !user)
    return <div className="p-8 text-slate-500">Loading…</div>;

  return (
    <DashboardShell>
      <div className="mb-4">
        <h1 className="text-xl font-bold">Collection — Disbursed loans</h1>
        <p className="text-sm text-slate-500">
          Record repayments. Loan auto-closes once total is paid.
        </p>
      </div>
      {fetching ? (
        <div className="card p-6 text-slate-500">Loading…</div>
      ) : loans.length === 0 ? (
        <div className="card p-6 text-slate-500">No disbursed loans yet.</div>
      ) : (
        <div className="space-y-3">
          {loans.map((l) => {
            const outstanding = l.totalRepayment - l.amountPaid;
            const open = expanded === l._id;
            return (
              <div key={l._id} className="card">
                <button
                  type="button"
                  onClick={() => openLoan(l._id)}
                  className="flex w-full items-center justify-between p-5 text-left"
                >
                  <div>
                    <div className="text-base font-semibold">
                      {l.profile?.fullName} · {formatINR(l.amount)}
                    </div>
                    <div className="text-xs text-slate-500">
                      Disbursed {formatDate(l.disbursedAt)} · Outstanding{' '}
                      {formatINR(outstanding)}
                    </div>
                  </div>
                  <span
                    className={`badge uppercase ${statusColor(l.status)}`}
                  >
                    {l.status}
                  </span>
                </button>

                {open && (
                  <div className="border-t border-slate-200 p-5">
                    <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                      <div>
                        <dt className="text-slate-500">Total repayment</dt>
                        <dd className="font-medium">
                          {formatINR(l.totalRepayment)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Paid</dt>
                        <dd className="font-medium">
                          {formatINR(l.amountPaid)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Outstanding</dt>
                        <dd className="font-medium">
                          {formatINR(outstanding)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Closed</dt>
                        <dd className="font-medium">
                          {formatDate(l.closedAt)}
                        </dd>
                      </div>
                    </dl>

                    {l.status === 'disbursed' && (
                      <form
                        onSubmit={(e) => record(e, l)}
                        className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-4"
                      >
                        <div className="sm:col-span-2">
                          <label className="label">UTR number</label>
                          <input
                            className="input uppercase"
                            value={utr}
                            required
                            onChange={(e) =>
                              setUtr(e.target.value.toUpperCase())
                            }
                          />
                        </div>
                        <div>
                          <label className="label">Amount</label>
                          <input
                            type="number"
                            min={1}
                            max={outstanding}
                            step="0.01"
                            className="input"
                            value={amount || ''}
                            required
                            onChange={(e) =>
                              setAmount(Number(e.target.value))
                            }
                          />
                        </div>
                        <div>
                          <label className="label">Date</label>
                          <input
                            type="date"
                            className="input"
                            value={paymentDate}
                            onChange={(e) => setPaymentDate(e.target.value)}
                          />
                        </div>
                        {error && (
                          <div className="sm:col-span-4 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
                            {error}
                          </div>
                        )}
                        <div className="sm:col-span-4">
                          <button
                            type="submit"
                            disabled={submitting}
                            className="btn-primary"
                          >
                            {submitting ? 'Recording…' : 'Record payment'}
                          </button>
                        </div>
                      </form>
                    )}

                    <div className="mt-5">
                      <h4 className="mb-2 text-sm font-semibold">
                        Payments
                      </h4>
                      {payments.length === 0 ? (
                        <p className="text-sm text-slate-500">
                          No payments recorded yet.
                        </p>
                      ) : (
                        <table className="min-w-full divide-y divide-slate-200 text-sm">
                          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                            <tr>
                              <th className="px-3 py-2">Date</th>
                              <th className="px-3 py-2">UTR</th>
                              <th className="px-3 py-2">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {payments.map((p) => (
                              <tr key={p._id}>
                                <td className="px-3 py-2">
                                  {formatDate(p.paymentDate)}
                                </td>
                                <td className="px-3 py-2 font-mono">
                                  {p.utrNumber}
                                </td>
                                <td className="px-3 py-2">
                                  {formatINR(p.amount)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
