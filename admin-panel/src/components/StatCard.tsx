import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  detail?: string;
  icon?: React.ReactNode;
}

export function StatCard({ label, value, detail, icon }: StatCardProps) {
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-lg shadow-black/20">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">{label}</p>
          <p className="mt-4 text-3xl font-semibold text-white">{value}</p>
          {detail ? <p className="mt-2 text-sm text-slate-400">{detail}</p> : null}
        </div>
        {icon ? <div className="text-purple-400 text-3xl">{icon}</div> : null}
      </div>
    </div>
  );
}
