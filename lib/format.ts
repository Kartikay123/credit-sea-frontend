export function formatINR(n: number): string {
  if (!Number.isFinite(n)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(n);
}

export function formatDate(s: string | Date | undefined): string {
  if (!s) return '—';
  const d = typeof s === 'string' ? new Date(s) : s;
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

export function prettyRole(role: string): string {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export function statusColor(status: string): string {
  switch (status) {
    case 'applied':
      return 'bg-sky-100 text-sky-800';
    case 'sanctioned':
      return 'bg-amber-100 text-amber-800';
    case 'rejected':
      return 'bg-rose-100 text-rose-800';
    case 'disbursed':
      return 'bg-violet-100 text-violet-800';
    case 'closed':
      return 'bg-emerald-100 text-emerald-800';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}
