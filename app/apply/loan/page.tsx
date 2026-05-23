'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/lib/auth';
import { apiGet, apiPost, ApiError } from '@/lib/api';
import { BorrowerProfile } from '@/lib/types';
import StepBar from '@/components/StepBar';
import { formatINR } from '@/lib/format';

const RATE = 12;

function calc(amount: number, days: number) {
  const interest = (amount * RATE * days) / (365 * 100);
  return {
    interest: Math.round(interest * 100) / 100,
    repayment: Math.round((amount + interest) * 100) / 100,
  };
}

export default function LoanConfigPage() {
  const router = useRouter();
  const { user, loading } = useRequireAuth(['borrower']);
  const [amount, setAmount] = useState(100000);
  const [tenure, setTenure] = useState(90);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    apiGet<{ profile: BorrowerProfile | null }>('/profile/me')
      .then(({ profile }) => {
        if (!profile || !profile.breCleared) {
          router.replace('/apply/details');
        } else if (!profile.salarySlipPath) {
          router.replace('/apply/upload');
        }
      })
      .catch(() => {});
  }, [user, router]);

  const { interest, repayment } = useMemo(
    () => calc(amount, tenure),
    [amount, tenure]
  );

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await apiPost('/loans', { amount, tenureDays: tenure });
      router.push('/apply/status');
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !user) {
    return <div className="p-8 text-slate-500">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <StepBar active="loan" />
      <div className="card p-6">
        <h1 className="mb-1 text-xl font-bold">Configure your loan</h1>
        <p className="mb-6 text-sm text-slate-500">
          Interest is fixed at {RATE}% p.a., calculated using simple interest.
        </p>
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="label mb-0">Loan amount</label>
              <span className="text-sm font-semibold text-brand">
                {formatINR(amount)}
              </span>
            </div>
            <input
              type="range"
              min={50000}
              max={500000}
              step={1000}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full accent-brand"
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>₹50,000</span>
              <span>₹5,00,000</span>
            </div>
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="label mb-0">Tenure</label>
              <span className="text-sm font-semibold text-brand">
                {tenure} days
              </span>
            </div>
            <input
              type="range"
              min={30}
              max={365}
              step={1}
              value={tenure}
              onChange={(e) => setTenure(Number(e.target.value))}
              className="w-full accent-brand"
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>30 days</span>
              <span>365 days</span>
            </div>
          </div>

          <div className="rounded-lg bg-slate-50 p-4 ring-1 ring-slate-200">
            <h3 className="mb-2 text-sm font-semibold text-slate-700">
              Live calculation
            </h3>
            <dl className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <dt className="text-slate-500">Principal</dt>
                <dd className="text-base font-semibold text-slate-900">
                  {formatINR(amount)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Interest ({RATE}% p.a.)</dt>
                <dd className="text-base font-semibold text-slate-900">
                  {formatINR(interest)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Total repayment</dt>
                <dd className="text-base font-semibold text-emerald-700">
                  {formatINR(repayment)}
                </dd>
              </div>
            </dl>
          </div>

          {error && (
            <div className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          )}

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => router.push('/apply/upload')}
              className="btn-outline"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
            >
              {submitting ? 'Submitting…' : 'Apply for loan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
