import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Edit3, 
  Check, 
  Info,
  Scale
} from 'lucide-react';
import { BidderSubmission, RuleEvaluationResult, ComplianceStatus, RuleCategory } from '../types/stamas';

interface ComplianceMatrixViewProps {
  bidder: BidderSubmission;
  onUpdateEvaluation: (updatedBidder: BidderSubmission) => void;
}

export const ComplianceMatrixView: React.FC<ComplianceMatrixViewProps> = ({
  bidder,
  onUpdateEvaluation,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ComplianceStatus>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | RuleCategory>('ALL');
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  // Override editing state
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [overrideStatus, setOverrideStatus] = useState<ComplianceStatus>('PASS');
  const [overrideReason, setOverrideReason] = useState('');
  const [reviewerName, setReviewerName] = useState('Procurement Lead Officer');

  const toggleRow = (ruleId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [ruleId]: !prev[ruleId],
    }));
  };

  const handleSaveOverride = (ruleId: string) => {
    if (!overrideReason.trim()) return;

    const updatedResults = bidder.evaluationResults.map((r) => {
      if (r.ruleId === ruleId) {
        return {
          ...r,
          status: overrideStatus,
          reviewerOverride: {
            status: overrideStatus,
            reason: overrideReason.trim(),
            reviewer: reviewerName.trim(),
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          },
        };
      }
      return r;
    });

    const passCount = updatedResults.filter((r) => r.status === 'PASS').length;
    const failCount = updatedResults.filter((r) => r.status === 'FAIL').length;
    const reviewCount = updatedResults.filter((r) => r.status === 'REVIEW').length;
    const mandatoryPassed = updatedResults
      .filter((r) => r.mandatory)
      .every((r) => r.status === 'PASS');
    const total = updatedResults.length || 1;
    const overallPercentage = Math.round(((passCount * 1.0 + reviewCount * 0.5) / total) * 100);

    const updatedBidder: BidderSubmission = {
      ...bidder,
      evaluationResults: updatedResults,
      score: {
        ...bidder.score,
        passCount,
        failCount,
        reviewCount,
        mandatoryPassed,
        overallPercentage,
      },
    };

    onUpdateEvaluation(updatedBidder);
    setEditingRuleId(null);
    setOverrideReason('');
  };

  // Filter items
  const filteredResults = bidder.evaluationResults.filter((item) => {
    const matchesSearch =
      item.ruleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.bidderSubmittedValue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.evidenceQuote.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Top Controls & Matrix Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Detailed Evaluation Matrix</span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-slate-200">{bidder.bidderName}</span>
              <span aria-hidden="true">·</span>
              <span>Doc: {bidder.documentName}</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">
              Clause-by-Clause PASS / FAIL / REVIEW Compliance Register
            </h2>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-slate-400">Overall Conformance</div>
              <div className="text-lg font-bold text-white">{bidder.score.overallPercentage}%</div>
            </div>
            <div className="h-7 w-px bg-slate-800" />
            <div className="text-right">
              <div className="text-xs text-slate-400">Mandatory Status</div>
              <div
                className={`text-sm font-bold ${
                  bidder.score.mandatoryPassed ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {bidder.score.mandatoryPassed ? 'ELIGIBLE' : 'DISQUALIFIED'}
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="mt-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search clause names, evidence quotes, specs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Segmented Buttons */}
            <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              {(['ALL', 'PASS', 'FAIL', 'REVIEW'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    statusFilter === s
                      ? s === 'PASS'
                        ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                        : s === 'FAIL'
                        ? 'bg-rose-500/20 text-rose-300 font-bold'
                        : s === 'REVIEW'
                        ? 'bg-amber-500/20 text-amber-300 font-bold'
                        : 'bg-slate-800 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Category Dropdown */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Categories</option>
              <option value="MANDATORY">Mandatory Only</option>
              <option value="TECHNICAL">Technical Specifications</option>
              <option value="FINANCIAL">Financial &amp; Commercial</option>
              <option value="LEGAL_STATUTORY">Legal &amp; Statutory</option>
              <option value="SLA_WARRANTY">SLA &amp; Warranties</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table / Matrix Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4 w-12">Status</th>
                <th className="py-3 px-4">Clause &amp; Description</th>
                <th className="py-3 px-4">Tender Benchmark</th>
                <th className="py-3 px-4">Bidder Submission</th>
                <th className="py-3 px-4 text-center w-24">Confidence</th>
                <th className="py-3 px-4 text-right w-24">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredResults.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No compliance criteria matched the search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredResults.map((item) => {
                  const isExpanded = !!expandedRows[item.ruleId];
                  const isEditing = editingRuleId === item.ruleId;

                  return (
                    <React.Fragment key={item.ruleId}>
                      <tr
                        className={`hover:bg-slate-850/50 transition-colors ${
                          item.status === 'FAIL' ? 'bg-rose-950/10' : ''
                        }`}
                      >
                        {/* Status Icon/Badge */}
                        <td className="py-3.5 px-4 align-top">
                          <span
                            className={`inline-block font-bold px-2 py-0.5 rounded text-[11px] ${
                              item.status === 'PASS'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : item.status === 'FAIL'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>

                        {/* Clause Name & Category */}
                        <td className="py-3.5 px-4 align-top space-y-1">
                          <div className="font-semibold text-slate-100 flex items-center gap-2">
                            <span>{item.ruleName}</span>
                            {item.mandatory && (
                              <span className="text-[10px] text-rose-400 font-semibold tracking-wide">
                                MANDATORY
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2">
                            <span className="text-slate-500 font-mono">{item.ruleId}</span>
                            <span>·</span>
                            <span>{item.category.replace('_', ' ')}</span>
                          </div>
                        </td>

                        {/* Tender Requirement */}
                        <td className="py-3.5 px-4 align-top text-slate-300 max-w-xs">
                          <div className="line-clamp-2">{item.tenderRequirement}</div>
                        </td>

                        {/* Bidder Submitted Value */}
                        <td className="py-3.5 px-4 align-top text-slate-200 max-w-sm">
                          <div className="font-medium text-slate-100 line-clamp-2">
                            {item.bidderSubmittedValue}
                          </div>
                          {item.evidenceQuote && (
                            <div className="text-[11px] text-slate-400 line-clamp-1 italic mt-0.5">
                              "{item.evidenceQuote}"
                            </div>
                          )}
                        </td>

                        {/* Confidence */}
                        <td className="py-3.5 px-4 align-top text-center">
                          <span className="font-mono text-xs font-semibold text-slate-300">
                            {item.confidence}%
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 align-top text-right space-x-1">
                          <button
                            onClick={() => toggleRow(item.ruleId)}
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title={isExpanded ? 'Hide Evidence Drawer' : 'View Full Evidence Quote'}
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Evidence Drawer */}
                      {isExpanded && (
                        <tr className="bg-slate-950/90 border-y border-slate-800">
                          <td colSpan={6} className="p-4 sm:p-5">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 text-xs">
                              {/* Left: OCR & Evidence Quotation (8 cols) */}
                              <div className="md:col-span-8 space-y-3">
                                <div>
                                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Verified OCR Evidence Citation</span>
                                    {item.documentPage && (
                                      <span className="text-slate-400 font-normal">
                                        (Page {item.documentPage} of {item.documentSource || 'Proposal'})
                                      </span>
                                    )}
                                  </div>
                                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-slate-200 font-mono text-[11px] leading-relaxed">
                                    {item.evidenceQuote || 'No verbatim text quote provided.'}
                                  </div>
                                </div>

                                <div>
                                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                                    Evaluator &amp; AI Analysis Notes
                                  </div>
                                  <p className="text-slate-300 text-xs bg-slate-900/60 p-2.5 rounded border border-slate-800">
                                    {item.notes}
                                  </p>
                                </div>

                                {/* Reviewer Override History if exists */}
                                {item.reviewerOverride && (
                                  <div className="p-2.5 rounded bg-emerald-950/30 border border-emerald-800/60 text-xs text-emerald-200">
                                    <div className="font-semibold flex items-center gap-1.5">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                      <span>Manual Override Applied: {item.reviewerOverride.status}</span>
                                    </div>
                                    <div className="text-[11px] text-slate-300 mt-1">
                                      "{item.reviewerOverride.reason}" — Reviewed by {item.reviewerOverride.reviewer} on {item.reviewerOverride.timestamp}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Right: Manual Override Action Box (4 cols) */}
                              <div className="md:col-span-4 bg-slate-900 border border-slate-800 rounded-lg p-3.5 space-y-3">
                                <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                                  <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Reviewer Override Action</span>
                                </div>

                                {!isEditing ? (
                                  <div>
                                    <p className="text-[11px] text-slate-400 mb-3">
                                      Lead evaluators may adjust status from Review to Pass or vice versa with justification for audit records.
                                    </p>
                                    <button
                                      onClick={() => {
                                        setEditingRuleId(item.ruleId);
                                        setOverrideStatus(item.status);
                                        setOverrideReason(item.reviewerOverride?.reason || '');
                                      }}
                                      className="w-full py-1.5 px-3 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-colors"
                                    >
                                      Override Clause Status
                                    </button>
                                  </div>
                                ) : (
                                  <div className="space-y-2.5">
                                    <div>
                                      <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">
                                        Set New Status
                                      </label>
                                      <div className="grid grid-cols-3 gap-1">
                                        {(['PASS', 'REVIEW', 'FAIL'] as ComplianceStatus[]).map((st) => (
                                          <button
                                            key={st}
                                            type="button"
                                            onClick={() => setOverrideStatus(st)}
                                            className={`py-1 text-[11px] font-bold rounded transition-colors ${
                                              overrideStatus === st
                                                ? st === 'PASS'
                                                  ? 'bg-emerald-600 text-white'
                                                  : st === 'FAIL'
                                                  ? 'bg-rose-600 text-white'
                                                  : 'bg-amber-600 text-white'
                                                : 'bg-slate-950 text-slate-400 hover:text-white'
                                            }`}
                                          >
                                            {st}
                                          </button>
                                        ))}
                                      </div>
                                    </div>

                                    <div>
                                      <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">
                                        Justification for Audit Trail
                                      </label>
                                      <textarea
                                        rows={2}
                                        value={overrideReason}
                                        onChange={(e) => setOverrideReason(e.target.value)}
                                        placeholder="e.g. Committee verified registrar portal and accepted supplementary filing."
                                        className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                                      />
                                    </div>

                                    <div className="flex gap-2 pt-1">
                                      <button
                                        onClick={() => setEditingRuleId(null)}
                                        className="flex-1 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={() => handleSaveOverride(item.ruleId)}
                                        disabled={!overrideReason.trim()}
                                        className="flex-1 py-1 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-xs font-semibold text-white transition-colors"
                                      >
                                        Save Override
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
