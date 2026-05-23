'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, landingPathForRole } from '@/lib/auth';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (loading) return;
    if (user) router.replace(landingPathForRole(user.role));
    else router.replace('/login');
  }, [user, loading, router]);
  return (
    <div className="flex h-[60vh] items-center justify-center text-slate-500">
      Loading…
    </div>
  );
}
