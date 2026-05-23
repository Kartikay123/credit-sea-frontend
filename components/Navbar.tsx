'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, landingPathForRole } from '@/lib/auth';
import { prettyRole } from '@/lib/format';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  if (!user) return null;
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link
          href={landingPathForRole(user.role)}
          className="text-lg font-semibold text-brand"
        >
          CreditFlow LMS
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden text-slate-600 sm:inline">
            {user.name} · <span className="font-medium">{prettyRole(user.role)}</span>
          </span>
          <button
            className="btn-outline"
            onClick={() => {
              logout();
              router.replace('/login');
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
