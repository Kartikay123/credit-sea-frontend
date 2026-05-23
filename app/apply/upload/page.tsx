'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/lib/auth';
import { apiGet, apiUpload, ApiError } from '@/lib/api';
import { BorrowerProfile } from '@/lib/types';
import StepBar from '@/components/StepBar';

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED = ['application/pdf', 'image/jpeg', 'image/png'];

export default function UploadPage() {
  const router = useRouter();
  const { user, loading } = useRequireAuth(['borrower']);
  const [file, setFile] = useState<File | null>(null);
  const [profile, setProfile] = useState<BorrowerProfile | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    apiGet<{ profile: BorrowerProfile | null }>('/profile/me')
      .then(({ profile }) => {
        if (!profile || !profile.breCleared) {
          router.replace('/apply/details');
          return;
        }
        setProfile(profile);
      })
      .catch(() => {});
  }, [user, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!file) {
      setError('Please select a file');
      return;
    }
    if (!ALLOWED.includes(file.type)) {
      setError('Only PDF, JPG, PNG are allowed');
      return;
    }
    if (file.size > MAX_SIZE) {
      setError('Max file size is 5 MB');
      return;
    }
    setSubmitting(true);
    try {
      await apiUpload('/profile/me/salary-slip', file);
      router.push('/apply/loan');
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
      <StepBar active="upload" />
      <div className="card p-6">
        <h1 className="mb-1 text-xl font-bold">Upload salary slip</h1>
        <p className="mb-6 text-sm text-slate-500">
          Accepted: PDF, JPG, PNG · Max size 5&nbsp;MB
          {profile?.salarySlipPath && (
            <span className="ml-2 inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
              Already uploaded — you can replace it
            </span>
          )}
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-md file:border-0 file:bg-brand file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-brand-dark"
          />
          {error && (
            <div className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          )}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => router.push('/apply/details')}
              className="btn-outline"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={submitting || !file}
              className="btn-primary"
            >
              {submitting ? 'Uploading…' : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
