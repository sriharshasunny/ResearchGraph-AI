import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Toast: React.FC = () => {
  const { toast } = useApp();

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-white/20 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/90 p-4 shadow-2xl backdrop-blur-xl md:max-w-sm"
        >
          {toast.type === 'success' && (
            <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
          )}
          {toast.type === 'info' && (
            <Info className="h-5 w-5 text-indigo-500 flex-shrink-0" />
          )}
          {toast.type === 'warning' && (
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
          )}
          
          <div className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-200">
            {toast.message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
