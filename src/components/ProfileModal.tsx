import React, { useState } from 'react';
import { X, User, BookOpen, Bookmark, Edit2, Check, Globe, Link2, Eye, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ProfileModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { savedPaperIds, allPapers } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('Dr. Jane Doe');
  const [role, setRole] = useState('Senior Research Scientist');
  const [affiliation, setAffiliation] = useState('Stanford AI Lab / Deep Learning Systems');
  const [bio, setBio] = useState('Researching test-time compute scaling, self-supervised vision models, and topological knowledge graph reasoning.');
  const [orcid, setOrcid] = useState('0000-0002-1825-0097');
  const [scholar, setScholar] = useState('scholar.google.com/citations?user=jane_doe_ai');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [saveToast, setSaveToast] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setIsEditing(false);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-[#111D35] dark:bg-[#0B1A38] rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-white/[0.06] dark:border-gray-800 shadow-2xl space-y-6 text-gray-900 dark:text-white dark:text-gray-100 max-h-[90vh] overflow-y-auto scrollbar-thin">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/[0.04] dark:border-gray-800">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Researcher Profile
          </h2>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <button 
                onClick={handleSave} 
                className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            ) : (
              <button 
                onClick={() => setIsEditing(true)} 
                className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 dark:text-gray-300 font-semibold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            )}
            <button 
              onClick={onClose} 
              className="p-1.5 rounded-xl text-gray-400 hover:text-gray-900 dark:text-white dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Profile Card */}
        <div className="flex items-start gap-4 p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xl font-black shadow-md shrink-0">
            {name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'JD'}
          </div>
          <div className="flex-1 space-y-2">
            {isEditing ? (
              <div className="space-y-2">
                <input 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  className="w-full bg-white dark:bg-[#111D35] dark:bg-gray-800 border border-gray-200 dark:border-white/[0.06] dark:border-gray-700 rounded-xl px-2.5 py-1 text-sm font-bold focus:outline-none focus:border-blue-500" 
                  placeholder="Full name"
                />
                <input 
                  value={role} 
                  onChange={e => setRole(e.target.value)} 
                  className="w-full bg-white dark:bg-[#111D35] dark:bg-gray-800 border border-gray-200 dark:border-white/[0.06] dark:border-gray-700 rounded-xl px-2.5 py-1 text-xs focus:outline-none focus:border-blue-500" 
                  placeholder="Title / Academic Role"
                />
                <input 
                  value={affiliation} 
                  onChange={e => setAffiliation(e.target.value)} 
                  className="w-full bg-white dark:bg-[#111D35] dark:bg-gray-800 border border-gray-200 dark:border-white/[0.06] dark:border-gray-700 rounded-xl px-2.5 py-1 text-xs focus:outline-none focus:border-blue-500" 
                  placeholder="Institution / Lab affiliation"
                />
              </div>
            ) : (
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white dark:text-white">{name}</h3>
                <p className="text-[12px] text-gray-500 dark:text-gray-400 dark:text-gray-400 font-medium">{role}</p>
                <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">{affiliation}</p>
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Bio &amp; Research Focus</span>
          {isEditing ? (
            <textarea 
              value={bio} 
              onChange={e => setBio(e.target.value)} 
              className="w-full bg-gray-50 dark:bg-white/[0.04] dark:bg-gray-800 border border-gray-200 dark:border-white/[0.06] dark:border-gray-700 rounded-xl p-2.5 text-xs h-20 resize-none focus:outline-none focus:border-blue-500"
            />
          ) : (
            <p className="text-xs text-gray-700 dark:text-gray-200 dark:text-gray-300 leading-relaxed">{bio}</p>
          )}
        </div>

        {/* ORCID & Scholar Identifiers */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Academic Identifiers</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl border border-gray-200 dark:border-white/[0.06] dark:border-gray-700 bg-gray-50 dark:bg-white/[0.04]/50 dark:bg-gray-800/40 flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase text-gray-400 block">ORCID</span>
                {isEditing ? (
                  <input 
                    value={orcid} 
                    onChange={e => setOrcid(e.target.value)} 
                    className="w-full text-xs bg-white dark:bg-[#111D35] dark:bg-gray-800 border rounded px-1 py-0.5"
                  />
                ) : (
                  <span className="font-mono text-gray-800 dark:text-gray-200 truncate block">{orcid}</span>
                )}
              </div>
            </div>

            <div className="p-2.5 rounded-xl border border-gray-200 dark:border-white/[0.06] dark:border-gray-700 bg-gray-50 dark:bg-white/[0.04]/50 dark:bg-gray-800/40 flex items-center gap-2">
              <Link2 className="w-4 h-4 text-blue-600 shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase text-gray-400 block">Scholar</span>
                {isEditing ? (
                  <input 
                    value={scholar} 
                    onChange={e => setScholar(e.target.value)} 
                    className="w-full text-xs bg-white dark:bg-[#111D35] dark:bg-gray-800 border rounded px-1 py-0.5"
                  />
                ) : (
                  <span className="font-mono text-gray-800 dark:text-gray-200 truncate block">{scholar}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Visibility Setting */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Profile Visibility</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setVisibility('public')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                visibility === 'public'
                  ? 'bg-blue-50 border-blue-400 text-blue-900 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'border-gray-200 dark:border-white/[0.06] dark:border-gray-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              <div className="font-bold text-xs flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-blue-600" />
                <span>Public Profile</span>
              </div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Discoverable by collaborators</div>
            </button>

            <button
              onClick={() => setVisibility('private')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                visibility === 'private'
                  ? 'bg-blue-50 border-blue-400 text-blue-900 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'border-gray-200 dark:border-white/[0.06] dark:border-gray-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              <div className="font-bold text-xs flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-purple-600" />
                <span>Workspace Only</span>
              </div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Private to local session</div>
            </button>
          </div>
        </div>

        {/* Research Metrics */}
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="p-3 rounded-2xl bg-gray-50 dark:bg-white/[0.04] dark:bg-gray-800/50 border border-gray-100 dark:border-white/[0.04] dark:border-gray-800">
            <span className="text-xl font-black block">{savedPaperIds.length}</span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 dark:text-gray-400 font-medium flex items-center justify-center gap-1 mt-0.5">
              <Bookmark className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Saved in Library
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-gray-50 dark:bg-white/[0.04] dark:bg-gray-800/50 border border-gray-100 dark:border-white/[0.04] dark:border-gray-800">
            <span className="text-xl font-black block">{allPapers.length}</span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 dark:text-gray-400 font-medium flex items-center justify-center gap-1 mt-0.5">
              <BookOpen className="w-3 h-3 text-blue-600 dark:text-blue-400" /> Corpus Papers
            </span>
          </div>
        </div>

        {/* Research Interests */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Primary Research Fields:</span>
          <div className="flex flex-wrap gap-1.5">
            {['Self-Supervised Learning', 'Vision Transformers', 'Test-Time Compute', 'Graph RAG', 'Reinforcement Learning'].map((tag, idx) => (
              <span key={idx} className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-white/[0.06] dark:border-gray-700 text-[11px] font-semibold">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {saveToast && (
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center justify-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Profile changes saved successfully.</span>
          </div>
        )}

      </div>
    </div>
  );
};
