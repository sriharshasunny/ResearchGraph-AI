import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div
          key={idx}
          className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/45 p-6 backdrop-blur-md animate-pulse"
        >
          {/* Top metadata skeleton */}
          <div className="flex gap-3 mb-4">
            <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
            <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
          </div>
          {/* Title skeleton */}
          <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-lg w-5/6 mb-2"></div>
          <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-lg w-2/3 mb-4"></div>
          {/* Author skeleton */}
          <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mb-4"></div>
          {/* Abstract skeleton */}
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full mb-2"></div>
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full mb-2"></div>
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-4/5 mb-6"></div>
          {/* Footer skeleton */}
          <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800/30 pt-4">
            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded"></div>
            <div className="flex gap-2">
              <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
              <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
              <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
