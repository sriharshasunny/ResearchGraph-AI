import React, { useState, useEffect } from 'react';
import { 
  X, Key, Sliders, Check, User, 
  Keyboard, Shield, Database, Eye, EyeOff, 
  Download, Trash2
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SettingsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { theme, setTheme, uiMode } = useApp();
  const [activeTab, setActiveTab] = useState<'appearance' | 'preferences' | 'integrations' | 'account' | 'privacy' | 'shortcuts'>('appearance');

  // Preferences states
  const [exportFormat, setExportFormat] = useState('bibtex');
  const [groundingStrictness, setGroundingStrictness] = useState<'strict' | 'exploratory'>('strict');
  const [autoSyncLibrary, setAutoSyncLibrary] = useState(true);

  // Integrations states
  const [openAlexKey, setOpenAlexKey] = useState('sk-alex-••••••••••••••••');
  const [semanticScholarKey, setSemanticScholarKey] = useState('sk-sem-••••••••••••••••');
  const [showAlexKey, setShowAlexKey] = useState(false);
  const [showSemanticKey, setShowSemanticKey] = useState(false);
  const [zoteroConnected, setZoteroConnected] = useState(true);
  const [mendeleyConnected, setMendeleyConnected] = useState(false);

  // Account states
  const [email] = useState('jane.doe@stanford.edu');
  const [name, setName] = useState('Dr. Jane Doe');

  // Auto-save toast & Undo State
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [lastChangedSetting] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      setSaveStatus('saved');
      const reset = setTimeout(() => setSaveStatus('idle'), 2000);
      return () => clearTimeout(reset);
    }, 400);
    return () => clearTimeout(timer);
  }, [theme, uiMode, exportFormat, groundingStrictness, autoSyncLibrary, openAlexKey, semanticScholarKey, name, isOpen]);

  if (!isOpen) return null;

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: <Monitor className="w-4 h-4" /> },
    { id: 'preferences', label: 'Research Preferences', icon: <Sliders className="w-4 h-4" /> },
    { id: 'integrations', label: 'Integrations & API', icon: <Key className="w-4 h-4" /> },
    { id: 'account', label: 'Account', icon: <User className="w-4 h-4" /> },
    { id: 'privacy', label: 'Privacy & Data', icon: <Shield className="w-4 h-4" /> },
    { id: 'shortcuts', label: 'Shortcuts & A11y', icon: <Keyboard className="w-4 h-4" /> },
  ] as const;

  const handleExportData = () => {
    const data = {
      theme,
      uiMode,
      exportFormat,
      groundingStrictness,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ResearchGraph-Settings-Backup.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-[640px] flex flex-col sm:flex-row bg-white dark:bg-[#111D35] dark:bg-[#0B1A38] rounded-3xl border border-gray-200 dark:border-white/[0.06] dark:border-gray-800 shadow-2xl overflow-hidden text-gray-900 dark:text-white dark:text-gray-100">
        
        {/* Sidebar Tabs */}
        <div className="w-full sm:w-64 bg-gray-50 dark:bg-white/[0.04] dark:bg-[#06111F] border-r border-gray-200 dark:border-white/[0.06] dark:border-gray-800 flex flex-col shrink-0">
          <div className="p-6 pb-2">
            <h2 className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-white dark:text-white">
              <Sliders className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Settings
            </h2>
          </div>
          <nav className="flex-1 px-4 py-3 space-y-1 overflow-y-auto scrollbar-thin">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-[13px] font-semibold transition-all ${
                  activeTab === tab.id 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-600/20 dark:text-blue-400 shadow-xs' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/[0.04] dark:border-gray-800">
            <h3 className="font-bold text-base capitalize">{activeTab}</h3>
            <div className="flex items-center gap-4">
              {/* Auto-save toast indicator */}
              <span className={`text-xs font-semibold flex items-center gap-1 transition-opacity duration-300 ${saveStatus === 'idle' ? 'opacity-0' : 'opacity-100'} ${saveStatus === 'saved' ? 'text-emerald-600' : 'text-gray-400'}`}>
                {saveStatus === 'saved' && <Check className="w-3.5 h-3.5" />}
                {saveStatus === 'saving' ? 'Autosaving...' : `${lastChangedSetting || 'Settings'} saved`}
              </span>
              <button 
                onClick={onClose} 
                className="p-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:text-white dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="p-6 overflow-y-auto flex-1 space-y-6 scrollbar-thin">
            
            {/* ── APPEARANCE TAB ── */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white dark:text-gray-100 mb-1">Color Theme</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Live system adaptation with zero flash.</p>
                  <div className="grid grid-cols-3 gap-3">
                    {['light', 'dark', 'system'].map(t => (
                      <button 
                        key={t}
                        onClick={() => {
                          setTheme(t as any);
                          setLastChangedSetting('Theme');
                        }}
                        className={`p-3 rounded-xl border text-xs font-bold uppercase transition-all ${
                          theme === t 
                            ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 shadow-xs' 
                            : 'border-gray-200 dark:border-white/[0.06] dark:border-gray-700 hover:border-blue-300'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* ── PREFERENCES TAB ── */}
            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white dark:text-gray-100 mb-1">Default Citation Format</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Applied automatically when copying paper citations.</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['bibtex', 'apa', 'mla', 'ris'].map(fmt => (
                      <button 
                        key={fmt}
                        onClick={() => setExportFormat(fmt)}
                        className={`p-2.5 rounded-xl border text-xs font-bold uppercase transition-all ${
                          exportFormat === fmt ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 shadow-xs' : 'border-gray-200 dark:border-white/[0.06] dark:border-gray-700'
                        }`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white dark:text-gray-100 mb-1">AI Grounding Strictness</h4>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <button
                      onClick={() => setGroundingStrictness('strict')}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        groundingStrictness === 'strict' ? 'border-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-900/30' : 'border-gray-200 dark:border-white/[0.06] dark:border-gray-700'
                      }`}
                    >
                      <div className="font-bold text-xs">Strict Attribution</div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Only cite verified publications in the active corpus.</div>
                    </button>
                    <button
                      onClick={() => setGroundingStrictness('exploratory')}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        groundingStrictness === 'exploratory' ? 'border-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-900/30' : 'border-gray-200 dark:border-white/[0.06] dark:border-gray-700'
                      }`}
                    >
                      <div className="font-bold text-xs">Exploratory Synthesis</div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Allow cross-disciplinary hypotheses generation.</div>
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.04] dark:bg-gray-800/40 border border-gray-200 dark:border-white/[0.06] dark:border-gray-700 flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-xs text-gray-900 dark:text-white dark:text-gray-100">Auto-sync library with cloud</h5>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">Keep saved papers synchronized across your devices.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoSyncLibrary}
                    onChange={(e) => setAutoSyncLibrary(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* ── INTEGRATIONS TAB ── */}
            {activeTab === 'integrations' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-1">OpenAlex Academic API Key</label>
                    <div className="relative">
                      <input
                        type={showAlexKey ? 'text' : 'password'}
                        value={openAlexKey}
                        onChange={(e) => setOpenAlexKey(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.06] dark:border-gray-700 bg-gray-50 dark:bg-white/[0.04] dark:bg-gray-800 font-mono text-xs pr-10 focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAlexKey(!showAlexKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-300"
                      >
                        {showAlexKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-1">Semantic Scholar API Key</label>
                    <div className="relative">
                      <input
                        type={showSemanticKey ? 'text' : 'password'}
                        value={semanticScholarKey}
                        onChange={(e) => setSemanticScholarKey(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.06] dark:border-gray-700 bg-gray-50 dark:bg-white/[0.04] dark:bg-gray-800 font-mono text-xs pr-10 focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSemanticKey(!showSemanticKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-300"
                      >
                        {showSemanticKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-white/[0.04] dark:border-gray-800">
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Reference Managers:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl border border-gray-200 dark:border-white/[0.06] dark:border-gray-700 flex items-center justify-between text-xs">
                      <span className="font-bold">Zotero Web API</span>
                      <button
                        onClick={() => setZoteroConnected(!zoteroConnected)}
                        className={`px-3 py-1 rounded-lg font-semibold ${zoteroConnected ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600 dark:text-gray-300'}`}
                      >
                        {zoteroConnected ? 'Connected' : 'Connect'}
                      </button>
                    </div>

                    <div className="p-3 rounded-xl border border-gray-200 dark:border-white/[0.06] dark:border-gray-700 flex items-center justify-between text-xs">
                      <span className="font-bold">Mendeley</span>
                      <button
                        onClick={() => setMendeleyConnected(!mendeleyConnected)}
                        className={`px-3 py-1 rounded-lg font-semibold ${mendeleyConnected ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600 dark:text-gray-300'}`}
                      >
                        {mendeleyConnected ? 'Connected' : 'Connect'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── ACCOUNT TAB ── */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl border border-gray-200 dark:border-white/[0.06] dark:border-gray-700 bg-gray-50 dark:bg-white/[0.04] dark:bg-gray-800/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white dark:text-white">{name}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{email}</p>
                    </div>
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      PRO RESEARCHER TIER
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 pt-1">
                    Indexed citations: 14,200 · Workspace storage: 12.4 MB / 5 GB used
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Account Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.06] dark:border-gray-700 bg-white dark:bg-[#111D35] dark:bg-gray-800 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* ── PRIVACY & DATA TAB ── */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl border border-gray-200 dark:border-white/[0.06] dark:border-gray-700 space-y-3">
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white dark:text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-blue-600" />
                    Export Local Data Backup
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Download a full JSON backup of your saved paper collections, history traces, and configuration preferences.
                  </p>
                  <button
                    onClick={handleExportData}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download JSON Backup</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50/40 dark:bg-red-900/10 space-y-3">
                  <h4 className="font-bold text-sm text-red-600 dark:text-red-400">Danger Zone</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300 dark:text-gray-400">
                    Permanently delete all indexed citations, cache directories, and local history.
                  </p>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to clear all local data? This action cannot be undone.')) {
                        localStorage.clear();
                        window.location.reload();
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-colors shadow-xs flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All Local Workspace Data</span>
                  </button>
                </div>
              </div>
            )}

            {/* ── SHORTCUTS & A11Y TAB ── */}
            {activeTab === 'shortcuts' && (
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white dark:text-gray-100">Keyboard Shortcuts</h4>
                <div className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                  {[
                    { action: 'Toggle Sidebar Navigation', keys: ['Ctrl', 'B'] },
                    { action: 'Focus Global Literature Search', keys: ['Ctrl', 'K'] },
                    { action: 'Send Inquiry in AI Assistant', keys: ['Enter'] },
                    { action: 'Insert New Line in Prompt', keys: ['Shift', 'Enter'] },
                    { action: 'Close Modal / Cancel Drawer', keys: ['Escape'] },
                    { action: 'Toggle Dark / Light Theme', keys: ['Ctrl', 'Shift', 'T'] }
                  ].map((s, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between">
                      <span className="text-gray-700 dark:text-gray-200 dark:text-gray-300 font-medium">{s.action}</span>
                      <div className="flex items-center gap-1">
                        {s.keys.map((k, i) => (
                          <kbd key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-white/[0.06] dark:border-gray-700 rounded-md font-mono text-[11px] text-gray-800 dark:text-gray-200 font-bold shadow-2xs">
                            {k}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};
