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
    <div className="flex flex-col items-center justify-center text-center p-8 rounded-xl border border-dashed border-brand-border bg-brand-surface min-h-[300px] w-full">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-bg text-brand-textMuted mb-4 border border-brand-border">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-[14px] font-semibold text-brand-text">
        {title}
      </h3>
      <p className="text-[13px] text-brand-textMuted mt-1 max-w-sm">
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-5 px-4 py-2 rounded-lg bg-brand-text hover:bg-brand-textMuted text-brand-surface text-[13px] font-medium transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
