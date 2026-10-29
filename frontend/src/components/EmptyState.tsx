import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-[#131B2E] border border-white/[0.06] rounded-lg">
      <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
        <Icon className="w-5 h-5" strokeWidth={1.75} />
      </div>
      <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
      {description && <p className="text-xs text-slate-400 mt-1 max-w-sm">{description}</p>}
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-3 py-1.5 rounded-md bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-semibold transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

