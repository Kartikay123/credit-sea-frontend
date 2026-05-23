'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/lib/auth';
import { apiGet, apiPut, ApiError } from '@/lib/api';
import { BorrowerProfile, EmploymentMode } from '@/lib/types';
import StepBar from '@/components/StepBar';

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

export default function DetailsPage() {
  const router = useRouter();
  const { user, loading } = useRequireAuth(['borrower']);
  const [fullName, setFullName] = useState('');
  const [pan, setPan] = useState('');
  const [dob, setDob] = useState('');
  const [monthlySalary, setMonthlySalary] = useState<number>(30000);
  const [employmentMode, setEmploymentMode] =
    useState<EmploymentMode>('salaried');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reasons, setReasons] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    apiGet<{ profile: BorrowerProfile | null }>('/profile/me')
      .then(({ profile }) => {
        if (profile) {
          setFullName(profile.fullName);
          setPan(profile.pan);
          setDob(profile.dob ? profile.dob.slice(0, 10) : '');
          setMonthlySalary(profile.monthlySalary);
          setEmploymentMode(profile.employmentMode);
        }
      })
      .catch(() => {});
  }, [user]);

  const panInvalid = pan.length > 0 && !PAN_REGEX.test(pan.toUpperCase());

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setReasons([]);
    if (panInvalid) {
      setError('PAN format is invalid (expected AAAAA9999A)');
      return;
    }
    setSubmitting(true);
    try {
      await apiPut('/profile/me', {
        fullName,
        pan: pan.toUpperCase(),
        dob,
        monthlySalary: Number(monthlySalary),
        employmentMode,
      });
      router.push('/apply/upload');
    } catch (err) {
      const e = err as ApiError;
      setError(e.message);
      if (e.reasons) setReasons(e.reasons);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !user) {
    return <div className="p-8 text-slate-500">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <StepBar active="details" />
      <div className="card p-6">
        <h1 className="mb-1 text-xl font-bold">Personal details</h1>
        <p className="mb-6 text-sm text-slate-500">
          We&apos;ll run quick eligibility checks (age, salary, PAN, employment).
        </p>
        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="label">Full name</label>
            <input
              className="input"
              value={fullName}
              required
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div>
            <label className="label">PAN</label>
            <input
              className="input uppercase"
              value={pan}
              required
              maxLength={10}
              onChange={(e) => setPan(e.target.value.toUpperCase())}
              placeholder="ABCDE1234F"
            />
            {panInvalid && (
              <p className="mt-1 text-xs text-rose-600">
                Format: 5 letters, 4 digits, 1 letter (AAAAA9999A)
              </p>
            )}
          </div>
          <div>
            <label className="label">Date of birth</label>
            <input
              type="date"
              className="input"
              value={dob}
              required
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setDob(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Monthly salary (₹)</label>
            <input
              type="number"
              min={0}
              className="input"
              value={monthlySalary}
              required
              onChange={(e) => setMonthlySalary(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="label">Employment mode</label>
            <select
              className="input"
              value={employmentMode}
              onChange={(e) =>
                setEmploymentMode(e.target.value as EmploymentMode)
              }
            >
              <option value="salaried">Salaried</option>
              <option value="self_employed">Self-employed</option>
              <option value="unemployed">Unemployed</option>
            </select>
          </div>

          {(error || reasons.length > 0) && (
            <div className="md:col-span-2 rounded-md bg-rose-50 px-3 py-3 text-sm text-rose-700">
              <div className="font-medium">{error}</div>
              {reasons.length > 0 && (
                <ul className="ml-5 mt-1 list-disc">
                  {reasons.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
            >
              {submitting ? 'Checking…' : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
