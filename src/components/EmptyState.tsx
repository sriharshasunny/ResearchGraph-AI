import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No records found',
  description = 'Try refining your query or filters.',
  icon: Icon = Inbox,
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800/80 bg-white/10 dark:bg-slate-900/10 backdrop-blur-sm min-h-[300px] w-full">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-500 mb-4">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
        {title}
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-450 mt-1 max-w-sm">
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-750 text-white text-xs font-semibold shadow transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
