import React, { useState, useEffect } from 'react';
import { X, Key, Sliders, Download, Check, User, Monitor, Eye, Shield, Bell } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SettingsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { theme, setTheme, uiMode, setUIMode } = useApp();
  const [activeTab, setActiveTab] = useState('appearance');
  
  // States
  const [openAlexKey, setOpenAlexKey] = useState('');
  const [semanticScholarKey, setSemanticScholarKey] = useState('');
  const [exportFormat, setExportFormat] = useState('bibtex');
  
  // Auto-save toast
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    if (!isOpen) return;
    
    // Simulate auto-save on value change
    const timer = setTimeout(() => {
      if (openAlexKey || semanticScholarKey) {
        setSaveStatus('saving');
        setTimeout(() => setSaveStatus('saved'), 600);
        setTimeout(() => setSaveStatus('idle'), 2000);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [openAlexKey, semanticScholarKey, exportFormat, theme, uiMode, isOpen]);

  if (!isOpen) return null;

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: <Monitor className="w-4 h-4" /> },
    { id: 'integrations', label: 'Integrations', icon: <Key className="w-4 h-4" /> },
    { id: 'preferences', label: 'Preferences', icon: <Sliders className="w-4 h-4" /> },
    { id: 'account', label: 'Account', icon: <User className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl h-[600px] flex bg-white dark:bg-[#0B1A38] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden text-gray-900 dark:text-gray-100">
        
        {/* Sidebar Tabs */}
        <div className="w-64 bg-gray-50 dark:bg-[#06111F] border-r border-gray-200 dark:border-gray-800 flex flex-col">
          <div className="p-6 pb-2">
            <h2 className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-white">
              <Sliders className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Settings
            </h2>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-600/20 dark:text-blue-400' 
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-bold text-lg capitalize">{activeTab}</h3>
            <div className="flex items-center gap-4">
              {/* Auto-save toast inline */}
              <span className={`text-xs font-semibold flex items-center gap-1 transition-opacity duration-300 ${saveStatus === 'idle' ? 'opacity-0' : 'opacity-100'} ${saveStatus === 'saved' ? 'text-emerald-500' : 'text-gray-500'}`}>
                {saveStatus === 'saved' && <Check className="w-3.5 h-3.5" />}
                {saveStatus === 'saving' ? 'Saving...' : 'Saved'}
              </span>
              <button onClick={onClose} className="p-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="p-6 overflow-y-auto flex-1 space-y-8">
            
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">Theme Preference</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {['light', 'dark', 'system'].map(t => (
                      <button 
                        key={t}
                        onClick={() => setTheme(t as any)}
                        className={`p-3 rounded-xl border text-sm font-semibold capitalize transition-all ${theme === t ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-1">UI Mode</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Toggle between simple reading mode and expert analytical mode.</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setUIMode('simple')}
                      className={`p-4 rounded-xl border text-left transition-all ${uiMode === 'simple' ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'border-gray-200 dark:border-gray-700'}`}
                    >
                      <div className="font-bold text-sm">Simple Mode</div>
                      <div className="text-xs mt-1 opacity-80">Clean interface, fewer technical details.</div>
                    </button>
                    <button 
                      onClick={() => setUIMode('expert')}
                      className={`p-4 rounded-xl border text-left transition-all ${uiMode === 'expert' ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'border-gray-200 dark:border-gray-700'}`}
                    >
                      <div className="font-bold text-sm">Expert Mode</div>
                      <div className="text-xs mt-1 opacity-80">Full database schemas, advanced graph algorithms.</div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'integrations' && (
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-bold text-gray-900 dark:text-gray-100 block mb-1">OpenAlex API Key</label>
                  <input
                    type="password"
                    placeholder="Enter OpenAlex token..."
                    value={openAlexKey}
                    onChange={(e) => setOpenAlexKey(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-900 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-900 dark:text-gray-100 block mb-1">Semantic Scholar API Key</label>
                  <input
                    type="password"
                    placeholder="Enter Semantic Scholar key..."
                    value={semanticScholarKey}
                    onChange={(e) => setSemanticScholarKey(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-900 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                  />
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">Default Citation Format</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {['bibtex', 'apa', 'ris'].map(fmt => (
                      <button 
                        key={fmt}
                        onClick={() => setExportFormat(fmt)}
                        className={`p-2.5 rounded-xl border text-sm font-bold uppercase transition-all ${exportFormat === fmt ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'}`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'account' && (
              <div className="space-y-6">
                 <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
                   <div>
                     <h4 className="font-bold text-sm">Dr. Jane Doe</h4>
                     <p className="text-xs text-gray-500 dark:text-gray-400">jane.doe@stanford.edu</p>
                   </div>
                   <button className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-xs font-semibold shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600">Edit Profile</button>
                 </div>
                 
                 <div>
                   <h4 className="text-sm font-bold text-red-600 mb-2">Danger Zone</h4>
                   <button className="px-4 py-2 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-lg text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left">
                     Delete Account & Data
                   </button>
                 </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};
