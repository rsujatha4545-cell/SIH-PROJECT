import React, { useState, useEffect } from 'react';
import { SAMPLE_TENDERS } from './data/sampleTenders';
import { TenderDocument, BidderSubmission, ComplianceRule } from './types/stamas';
import { Header, ActiveTab } from './components/Header';
import { EvaluationDashboard } from './components/EvaluationDashboard';
import { ComplianceMatrixView } from './components/ComplianceMatrixView';
import { VendorComparisonView } from './components/VendorComparisonView';
import { RuleEngineConfig } from './components/RuleEngineConfig';
import { AuditTrailView } from './components/AuditTrailView';
import { DeploymentHub } from './components/DeploymentHub';
import { ExportReportModal } from './components/ExportReportModal';
import { getSavedBackendUrl } from './services/apiClient';

export default function App() {
  const [tenders, setTenders] = useState<TenderDocument[]>(SAMPLE_TENDERS);
  const [currentTender, setCurrentTender] = useState<TenderDocument>(SAMPLE_TENDERS[0]);
  const [selectedBidder, setSelectedBidder] = useState<BidderSubmission>(
    SAMPLE_TENDERS[0].submissions[0]
  );
  const [activeTab, setActiveTab] = useState<ActiveTab>('evaluation');
  const [backendUrl, setBackendUrl] = useState<string>('https://stamas-backend.onrender.com');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Initialize saved backend URL on mount
  useEffect(() => {
    const saved = getSavedBackendUrl();
    if (saved) {
      setBackendUrl(saved);
    }
  }, []);

  // When tender changes, select its first bidder
  const handleSelectTender = (tender: TenderDocument) => {
    setCurrentTender(tender);
    if (tender.submissions.length > 0) {
      setSelectedBidder(tender.submissions[0]);
    }
  };

  // When a bidder is updated or re-evaluated
  const handleBidderEvaluated = (updatedBidder: BidderSubmission) => {
    setSelectedBidder(updatedBidder);

    const updatedSubmissions = currentTender.submissions.some((s) => s.id === updatedBidder.id)
      ? currentTender.submissions.map((s) => (s.id === updatedBidder.id ? updatedBidder : s))
      : [updatedBidder, ...currentTender.submissions];

    const updatedTender: TenderDocument = {
      ...currentTender,
      submissions: updatedSubmissions,
    };

    setCurrentTender(updatedTender);
    setTenders((prev) => prev.map((t) => (t.id === updatedTender.id ? updatedTender : t)));
  };

  // When rules are updated or added
  const handleUpdateRules = (newRules: ComplianceRule[]) => {
    const updatedTender: TenderDocument = {
      ...currentTender,
      rules: newRules,
    };
    setCurrentTender(updatedTender);
    setTenders((prev) => prev.map((t) => (t.id === updatedTender.id ? updatedTender : t)));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Platform Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentTender={currentTender}
        allTenders={tenders}
        onSelectTender={handleSelectTender}
        backendUrl={backendUrl}
        setBackendUrl={setBackendUrl}
        onOpenExportModal={() => setIsExportModalOpen(true)}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'evaluation' && (
          <EvaluationDashboard
            tender={currentTender}
            selectedBidder={selectedBidder}
            onSelectBidder={setSelectedBidder}
            onBidderEvaluated={handleBidderEvaluated}
            onViewMatrix={() => setActiveTab('matrix')}
            backendUrl={backendUrl}
          />
        )}

        {activeTab === 'matrix' && (
          <ComplianceMatrixView
            bidder={selectedBidder}
            onUpdateEvaluation={handleBidderEvaluated}
          />
        )}

        {activeTab === 'comparison' && (
          <VendorComparisonView
            tender={currentTender}
            onSelectBidder={setSelectedBidder}
            onViewMatrix={() => setActiveTab('matrix')}
          />
        )}

        {activeTab === 'rules' && (
          <RuleEngineConfig
            tender={currentTender}
            onUpdateRules={handleUpdateRules}
          />
        )}

        {activeTab === 'audit' && (
          <AuditTrailView tender={currentTender} />
        )}

        {activeTab === 'deployment' && (
          <DeploymentHub
            backendUrl={backendUrl}
            setBackendUrl={setBackendUrl}
          />
        )}
      </main>

      {/* Export / Official Certificate Modal */}
      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        tender={currentTender}
        selectedBidder={selectedBidder}
      />

      {/* Professional Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">STAMAS</span>
            <span>·</span>
            <span>Intelligent Bid &amp; Tender Compliance Platform</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>FastAPI Backend: <strong className="text-slate-400 font-mono">{backendUrl}</strong></span>
            <span>·</span>
            <button
              onClick={() => setActiveTab('deployment')}
              className="text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Deployment Guide
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
