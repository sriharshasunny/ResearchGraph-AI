import React, { useState } from 'react';
import { X, Key, Sliders, Download, Check } from 'lucide-react';

export const SettingsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [openAlexKey, setOpenAlexKey] = useState('');
  const [semanticScholarKey, setSemanticScholarKey] = useState('');
  const [exportFormat, setExportFormat] = useState('bibtex');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xl space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-blue-600" />
              ResearchGraph OS Settings
            </h2>
            <p className="text-[12px] text-gray-500 mt-0.5">Configure academic indexing, API endpoints &amp; citation formats.</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* API Integration */}
        <div className="space-y-4">
          <h3 className="text-[12px] font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
            <Key className="w-4 h-4 text-blue-600" /> Academic API Connections
          </h3>

          <div className="space-y-3 text-[13px]">
            <div>
              <label className="text-gray-600 font-medium block mb-1">OpenAlex API Key (Optional)</label>
              <input
                type="password"
                placeholder="Enter OpenAlex token..."
                value={openAlexKey}
                onChange={(e) => setOpenAlexKey(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-gray-600 font-medium block mb-1">Semantic Scholar API Key</label>
              <input
                type="password"
                placeholder="Enter Semantic Scholar key..."
                value={semanticScholarKey}
                onChange={(e) => setSemanticScholarKey(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Citation & Export Preferences */}
        <div className="space-y-3">
          <h3 className="text-[12px] font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
            <Download className="w-4 h-4 text-blue-600" /> Default Citation Format
          </h3>
          <div className="grid grid-cols-3 gap-2 text-[12px]">
            {['bibtex', 'apa', 'ris'].map((fmt) => (
              <button
                key={fmt}
                onClick={() => setExportFormat(fmt)}
                className={`py-2 px-3 rounded-xl border font-bold uppercase transition-all ${
                  exportFormat === fmt
                    ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-sm'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 text-[12px] font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[12px] rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            {saved ? <Check className="w-4 h-4 text-emerald-300" /> : null}
            <span>{saved ? 'Preferences Saved!' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
