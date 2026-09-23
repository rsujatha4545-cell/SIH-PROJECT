import React from 'react';
import { 
  AlertTriangle, 
  AlertCircle, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Download,
  Building
} from 'lucide-react';
import { TenderDocument } from '../types/stamas';

interface AuditTrailViewProps {
  tender: TenderDocument;
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({ tender }) => {
  // Aggregate all discrepancies across all bidders
  const allDiscrepancies = tender.submissions.flatMap((b) =>
    b.discrepancies.map((d) => ({
      ...d,
      bidderName: b.bidderName,
      bidderId: b.id,
    }))
  );

  // Collect all reviewer overrides
  const allOverrides = tender.submissions.flatMap((b) =>
    b.evaluationResults
      .filter((r) => r.reviewerOverride)
      .map((r) => ({
        bidderName: b.bidderName,
        ruleName: r.ruleName,
        override: r.reviewerOverride!,
      }))
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Risk &amp; Integrity Center</span>
              <span aria-hidden="true">·</span>
              <span>{allDiscrepancies.length} Flagged Discrepancies</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-400 font-semibold">{tender.code}</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">
              Procurement Audit Trail &amp; Discrepancy Register
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl">
              Immutable log of non-compliances, missing statutory attachments, commercial deviations, and committee officer overrides.
            </p>
          </div>
        </div>

        {/* Severity Metrics Bar */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Critical Disqualifications</div>
            <div className="text-xl font-bold text-rose-400 mt-0.5">
              {allDiscrepancies.filter((d) => d.severity === 'CRITICAL').length}
            </div>
            <div className="text-[10px] text-slate-500">Violates mandatory RFP clauses</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Major Deviations</div>
            <div className="text-xl font-bold text-amber-400 mt-0.5">
              {allDiscrepancies.filter((d) => d.severity === 'MAJOR').length}
            </div>
            <div className="text-[10px] text-slate-500">Commercial or SLA liability variances</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Clarification Notices</div>
            <div className="text-xl font-bold text-slate-200 mt-0.5">
              {allDiscrepancies.filter((d) => d.severity === 'MINOR').length}
            </div>
            <div className="text-[10px] text-slate-500">Requires formal bidder response</div>
          </div>
        </div>
      </div>

      {/* Discrepancies Detailed Feed */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white">Active Risk &amp; Discrepancy Findings</h3>
        </div>

        <div className="divide-y divide-slate-800/80">
          {allDiscrepancies.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No discrepancies or non-compliance findings detected across submissions.
            </div>
          ) : (
            allDiscrepancies.map((item) => (
              <div key={item.id} className="p-4 sm:p-5 space-y-2 hover:bg-slate-850/40 transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                        item.severity === 'CRITICAL'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : item.severity === 'MAJOR'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}
                    >
                      {item.severity}
                    </span>
                    <span className="font-semibold text-slate-200 text-xs">{item.title}</span>
                  </div>

                  <span className="text-xs text-slate-400 font-medium">
                    Bidder: <strong className="text-slate-200">{item.bidderName}</strong>
                  </span>
                </div>

                <p className="text-xs text-slate-300">{item.description}</p>

                <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-slate-400">
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-800/80">
                    <span className="text-slate-400 font-semibold uppercase text-[10px] block mb-0.5">
                      Procurement Impact:
                    </span>
                    <span className="text-slate-200">{item.impact}</span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-800/80">
                    <span className="text-slate-400 font-semibold uppercase text-[10px] block mb-0.5">
                      Statutory Action / Recommendation:
                    </span>
                    <span className="text-slate-200">{item.recommendation}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Evaluator Overrides Log */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Official Evaluator Overrides Log</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Audited modifications made by human procurement officers overriding AI decisions.
            </p>
          </div>
          <span className="text-xs text-slate-400">{allOverrides.length} logged overrides</span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {allOverrides.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-xs">
              No manual overrides recorded. All results currently match pure AI &amp; Rule Engine synthesis.
            </div>
          ) : (
            allOverrides.map((ov, idx) => (
              <div key={idx} className="p-4 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">{ov.bidderName} · {ov.ruleName}</span>
                  <span className="text-emerald-400 font-bold">{ov.override.status}</span>
                </div>
                <div className="text-slate-400 italic">"{ov.override.reason}"</div>
                <div className="text-[11px] text-slate-500">
                  By {ov.override.reviewer} · {ov.override.timestamp}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
