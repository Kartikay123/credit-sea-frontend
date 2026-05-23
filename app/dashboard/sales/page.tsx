'use client';

import { useEffect, useState } from 'react';
import { useRequireAuth } from '@/lib/auth';
import { apiGet } from '@/lib/api';
import { Lead } from '@/lib/types';
import DashboardShell from '@/components/DashboardShell';
import { formatDate } from '@/lib/format';

export default function SalesPage() {
  const { user, loading } = useRequireAuth(['sales']);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!user) return;
    apiGet<{ leads: Lead[] }>('/dashboard/sales/leads')
      .then(({ leads }) => setLeads(leads))
      .finally(() => setFetching(false));
  }, [user]);

  if (loading || !user)
    return <div className="p-8 text-slate-500">Loading…</div>;

  return (
    <DashboardShell>
      <div className="mb-4">
        <h1 className="text-xl font-bold">Sales — Leads</h1>
        <p className="text-sm text-slate-500">
          Borrowers who have registered but not yet applied for a loan.
        </p>
      </div>
      <div className="card overflow-hidden">
        {fetching ? (
          <div className="p-6 text-slate-500">Loading…</div>
        ) : leads.length === 0 ? (
          <div className="p-6 text-slate-500">No open leads.</div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Registered</th>
                <th className="px-4 py-3">Profile</th>
                <th className="px-4 py-3">Salary slip</th>
                <th className="px-4 py-3">BRE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.map((l) => (
                <tr key={l.userId}>
                  <td className="px-4 py-3 font-medium">{l.name}</td>
                  <td className="px-4 py-3 text-slate-600">{l.email}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatDate(l.registeredAt)}
                  </td>
                  <td className="px-4 py-3">
                    {l.hasProfile ? '✅' : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {l.salarySlipUploaded ? '✅' : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {l.breCleared ? (
                      <span className="badge bg-emerald-100 text-emerald-800">
                        Cleared
                      </span>
                    ) : (
                      <span className="badge bg-slate-100 text-slate-700">
                        Pending
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardShell>
  );
}
