import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Layers, 
  Scale, 
  Sliders, 
  AlertTriangle, 
  Server, 
  Printer, 
  ChevronDown, 
  Check, 
  RefreshCw, 
  ExternalLink,
  Cpu
} from 'lucide-react';
import { TenderDocument } from '../types/stamas';
import { pingBackend, saveBackendUrl } from '../services/apiClient';

export type ActiveTab = 'evaluation' | 'matrix' | 'comparison' | 'rules' | 'audit' | 'deployment';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentTender: TenderDocument;
  allTenders: TenderDocument[];
  onSelectTender: (tender: TenderDocument) => void;
  backendUrl: string;
  setBackendUrl: (url: string) => void;
  onOpenExportModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentTender,
  allTenders,
  onSelectTender,
  backendUrl,
  setBackendUrl,
  onOpenExportModal,
}) => {
  const [showTenderMenu, setShowTenderMenu] = useState(false);
  const [showBackendModal, setShowBackendModal] = useState(false);
  const [inputUrl, setInputUrl] = useState(backendUrl);
  const [isPinging, setIsPinging] = useState(false);
  const [pingStatus, setPingStatus] = useState<{ ok: boolean; message: string; latency?: number } | null>(null);

  const handlePing = async (urlToTest: string) => {
    setIsPinging(true);
    setPingStatus(null);
    const result = await pingBackend(urlToTest);
    setIsPinging(false);
    setPingStatus({
      ok: result.ok,
      message: result.message,
      latency: result.latencyMs,
    });
  };

  const handleSaveBackend = () => {
    const clean = inputUrl.trim();
    setBackendUrl(clean);
    saveBackendUrl(clean);
    setShowBackendModal(false);
  };

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'evaluation', label: 'Evaluation Hub', icon: <Cpu className="w-4 h-4" /> },
    { id: 'matrix', label: 'Compliance Matrix', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'comparison', label: 'Vendor Comparison', icon: <Scale className="w-4 h-4" /> },
    { id: 'rules', label: 'Rule Engine', icon: <Sliders className="w-4 h-4" /> },
    { id: 'audit', label: 'Audit & Discrepancies', icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'deployment', label: 'Architecture & Deploy', icon: <Server className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-slate-100 shadow-sm">
      {/* Top Banner with Brand and Context */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Brand & RFP Selector */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold tracking-wider text-base">
              ST
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white">STAMAS</span>
                <span className="text-xs text-slate-400 font-medium tracking-wide">BID COMPLIANCE</span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                AI Tender & Proposal Verification Engine
              </p>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800 hidden md:block" />

          {/* Active Tender Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowTenderMenu(!showTenderMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs text-slate-200 transition-colors text-left"
            >
              <span className="truncate max-w-[200px] sm:max-w-[280px] font-medium">
                {currentTender.code}: {currentTender.title}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            </button>

            {showTenderMenu && (
              <div className="absolute left-0 mt-2 w-80 sm:w-96 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50">
                <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  Select Active Tender / RFP
                </div>
                <div className="max-h-72 overflow-y-auto py-1">
                  {allTenders.map((tender) => (
                    <button
                      key={tender.id}
                      onClick={() => {
                        onSelectTender(tender);
                        setShowTenderMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-colors flex items-start justify-between gap-2 ${
                        tender.id === currentTender.id
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                          : 'text-slate-300 hover:bg-slate-800/70'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-slate-100">{tender.code}</div>
                        <div className="text-slate-400 line-clamp-1 mt-0.5">{tender.title}</div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          {tender.submissions.length} Bidders · {tender.rules.length} Rules · {tender.estimatedBudget}
                        </div>
                      </div>
                      {tender.id === currentTender.id && (
                        <Check className="w-4 h-4 text-emerald-400 mt-1 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Backend Gateway Control & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Backend Connection Indicator Button */}
          <button
            onClick={() => setShowBackendModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs text-slate-300 transition-colors"
            title="Configure FastAPI Backend URL (Render / Localhost)"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline font-medium">FastAPI Engine</span>
            <span className="text-[11px] text-slate-400">Render</span>
          </button>

          {/* Export Report Action */}
          <button
            onClick={onOpenExportModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-sm transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Main Tab Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/80">
        <nav className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none" aria-label="Views">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <span className={isActive ? 'text-emerald-400' : 'text-slate-500'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Backend Configuration Modal */}
      {showBackendModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Server className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-semibold text-white">FastAPI Backend Gateway</h3>
              </div>
              <button
                onClick={() => setShowBackendModal(false)}
                className="text-slate-400 hover:text-white text-sm px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs text-slate-300">
              <p>
                Connect this STAMAS React frontend to your deployed Render FastAPI service or local Uvicorn development server:
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Backend API Base URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="https://stamas-backend.onrender.com"
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={() => handlePing(inputUrl)}
                    disabled={isPinging}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
                    <span>Test Ping</span>
                  </button>
                </div>
              </div>

              {/* Ping Result Alert */}
              {pingStatus && (
                <div
                  className={`p-3 rounded-lg border text-xs ${
                    pingStatus.ok
                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
                      : 'bg-amber-950/40 border-amber-800 text-amber-200'
                  }`}
                >
                  <div className="font-semibold flex items-center gap-1.5">
                    {pingStatus.ok ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span>Connected successfully to backend</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        <span>Remote ping check notice</span>
                      </>
                    )}
                  </div>
                  <div className="mt-1 text-slate-300">{pingStatus.message}</div>
                  {!pingStatus.ok && (
                    <div className="mt-2 text-[11px] text-slate-400">
                      💡 Note: The STAMAS platform includes a built-in high-accuracy client compliance engine, so all evaluations and tests work seamlessly even before your Render backend is deployed!
                    </div>
                  )}
                </div>
              )}

              {/* Quick Presets */}
              <div className="pt-2">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block mb-2">
                  Quick Presets:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setInputUrl('https://stamas-backend.onrender.com')}
                    className="p-2 text-left bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-lg transition-colors"
                  >
                    <div className="font-medium text-slate-200">Render Production</div>
                    <div className="text-[11px] text-slate-500 truncate">https://stamas-backend.onrender.com</div>
                  </button>
                  <button
                    onClick={() => setInputUrl('http://localhost:8000')}
                    className="p-2 text-left bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-lg transition-colors"
                  >
                    <div className="font-medium text-slate-200">Local Uvicorn</div>
                    <div className="text-[11px] text-slate-500 truncate">http://localhost:8000</div>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2.5 pt-4 border-t border-slate-800">
              <button
                onClick={() => setShowBackendModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBackend}
                className="px-4 py-2 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
              >
                Save Backend Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
