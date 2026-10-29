import React from 'react';

interface KpiStatItem {
  id: string;
  label: string;
  value: number | string;
  unit?: string;
  comparison?: {
    text: string;
    type?: 'neutral' | 'positive' | 'negative' | 'warning';
  };
}

interface KpiStatProps {
  items: KpiStatItem[];
}

export const KpiStat: React.FC<KpiStatProps> = ({ items }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map((item) => {
        let compColor = 'text-slate-400';
        if (item.comparison?.type === 'positive') compColor = 'text-emerald-400';
        if (item.comparison?.type === 'negative') compColor = 'text-rose-400';
        if (item.comparison?.type === 'warning') compColor = 'text-amber-400';

        return (
          <div
            key={item.id}
            className="bg-[#131B2E] border border-white/[0.08] rounded-lg p-3.5 flex flex-col justify-between"
          >
            <span className="text-xs text-slate-400 font-medium">{item.label}</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-bold text-slate-100 font-mono tracking-tight tabular-nums">
                {item.value}
              </span>
              {item.unit && <span className="text-xs text-slate-400 font-medium">{item.unit}</span>}
            </div>
            {item.comparison && (
              <span className={`text-[11px] mt-1.5 ${compColor}`}>
                {item.comparison.text}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

