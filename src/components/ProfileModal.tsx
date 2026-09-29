import React from 'react';
import { X, User, BookOpen, Bookmark } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ProfileModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { savedPaperIds, allPapers } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xl space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Researcher Profile
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Card */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50/60 border border-blue-100">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl font-bold shadow-md shrink-0">
            JD
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Dr. Jane Doe</h3>
            <p className="text-[12px] text-gray-500 font-medium">Senior Research Scientist</p>
            <p className="text-[11px] text-blue-600 font-semibold mt-0.5">Stanford AI Lab / Deep Learning Systems</p>
          </div>
        </div>

        {/* Research Metrics */}
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
            <span className="text-xl font-black text-gray-900 block">{savedPaperIds.length}</span>
            <span className="text-[11px] text-gray-500 font-medium flex items-center justify-center gap-1 mt-0.5">
              <Bookmark className="w-3 h-3 text-emerald-600" /> Saved Papers
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
            <span className="text-xl font-black text-gray-900 block">{allPapers.length}</span>
            <span className="text-[11px] text-gray-500 font-medium flex items-center justify-center gap-1 mt-0.5">
              <BookOpen className="w-3 h-3 text-blue-600" /> Corpus Access
            </span>
          </div>
        </div>

        {/* Research Interests */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Primary Research Fields:</span>
          <div className="flex flex-wrap gap-1.5">
            {['Self-Supervised Learning', 'Vision Transformers', 'Test-Time Compute', 'Graph RAG', 'Reinforcement Learning'].map((tag, idx) => (
              <span key={idx} className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-[11px] font-semibold">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[12px] rounded-xl shadow-sm transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
