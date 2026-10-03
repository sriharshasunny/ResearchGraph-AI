import React, { useState } from 'react';
import { X, User, BookOpen, Bookmark, Edit2, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ProfileModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { savedPaperIds, allPapers } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('Dr. Jane Doe');
  const [role, setRole] = useState('Senior Research Scientist');
  const [affiliation, setAffiliation] = useState('Stanford AI Lab / Deep Learning Systems');
  const [bio, setBio] = useState('Researching test-time compute scaling and self-supervised vision models.');
  
  if (!isOpen) return null;

  const handleSave = () => {
    setIsEditing(false);
    // In a real app we'd dispatch to context/API here
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#0B1A38] rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-gray-800 shadow-2xl space-y-6 text-gray-900 dark:text-gray-100">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Researcher Profile
          </h2>
          <div className="flex gap-2">
            {isEditing ? (
              <button onClick={handleSave} className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-200 transition-colors">
                <Check className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={() => setIsEditing(true)} className="p-1.5 rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Profile Card */}
        <div className="flex items-start gap-4 p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl font-bold shadow-md shrink-0">
            {name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'JD'}
          </div>
          <div className="flex-1 space-y-2">
            {isEditing ? (
              <>
                <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-sm font-bold" />
                <input value={role} onChange={e => setRole(e.target.value)} className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-xs" />
                <input value={affiliation} onChange={e => setAffiliation(e.target.value)} className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-xs" />
              </>
            ) : (
              <>
                <h3 className="text-base font-bold">{name}</h3>
                <p className="text-[12px] text-gray-500 dark:text-gray-400 font-medium">{role}</p>
                <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">{affiliation}</p>
              </>
            )}
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Bio</span>
          {isEditing ? (
            <textarea 
              value={bio} 
              onChange={e => setBio(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm h-20 resize-none"
            />
          ) : (
            <p className="text-sm text-gray-700 dark:text-gray-300">{bio}</p>
          )}
        </div>

        {/* Research Metrics */}
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
            <span className="text-xl font-black block">{savedPaperIds.length}</span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium flex items-center justify-center gap-1 mt-0.5">
              <Bookmark className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Saved Papers
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
            <span className="text-xl font-black block">{allPapers.length}</span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium flex items-center justify-center gap-1 mt-0.5">
              <BookOpen className="w-3 h-3 text-blue-600 dark:text-blue-400" /> Corpus Access
            </span>
          </div>
        </div>

        {/* Research Interests */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Primary Research Fields:</span>
          <div className="flex flex-wrap gap-1.5">
            {['Self-Supervised Learning', 'Vision Transformers', 'Test-Time Compute', 'Graph RAG', 'Reinforcement Learning'].map((tag, idx) => (
              <span key={idx} className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[11px] font-semibold">
                {tag}
              </span>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
