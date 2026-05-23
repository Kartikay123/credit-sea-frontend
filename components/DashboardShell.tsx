'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { useAuth } from '@/lib/auth';
import { Role } from '@/lib/types';

const MODULES: { href: string; label: string; role: Role }[] = [
  { href: '/dashboard/sales', label: 'Sales', role: 'sales' },
  { href: '/dashboard/sanction', label: 'Sanction', role: 'sanction' },
  { href: '/dashboard/disbursement', label: 'Disbursement', role: 'disbursement' },
  { href: '/dashboard/collection', label: 'Collection', role: 'collection' },
];

export default function DashboardShell({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  if (!user) return null;

  const visible = MODULES.filter(
    (m) => user.role === 'admin' || user.role === m.role
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <nav className="mb-6 flex flex-wrap gap-2">
        {visible.map((m) => {
          const active = pathname?.startsWith(m.href);
          return (
            <Link
              key={m.href}
              href={m.href}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                active
                  ? 'bg-brand text-white'
                  : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100'
              }`}
            >
              {m.label}
            </Link>
          );
        })}
      </nav>
      {children}
    </div>
  );
}
