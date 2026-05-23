'use client';

const steps = [
  { key: 'details', label: 'Personal Details' },
  { key: 'upload', label: 'Salary Slip' },
  { key: 'loan', label: 'Loan Config' },
  { key: 'status', label: 'Status' },
];

export default function StepBar({ active }: { active: string }) {
  const idx = steps.findIndex((s) => s.key === active);
  return (
    <ol className="mb-8 grid grid-cols-4 gap-2">
      {steps.map((s, i) => {
        const isDone = i < idx;
        const isCurrent = i === idx;
        return (
          <li
            key={s.key}
            className={`rounded-md border px-3 py-2 text-center text-xs sm:text-sm ${
              isCurrent
                ? 'border-brand bg-brand text-white'
                : isDone
                ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                : 'border-slate-200 bg-white text-slate-500'
            }`}
          >
            <div className="font-semibold">Step {i + 1}</div>
            <div>{s.label}</div>
          </li>
        );
      })}
    </ol>
  );
}
