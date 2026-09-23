import React from 'react';
import { 
  Scale, 
  Trophy, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  DollarSign, 
  FileText,
  TrendingDown,
  Building
} from 'lucide-react';
import { TenderDocument, BidderSubmission } from '../types/stamas';

interface VendorComparisonViewProps {
  tender: TenderDocument;
  onSelectBidder: (bidder: BidderSubmission) => void;
  onViewMatrix: () => void;
}

export const VendorComparisonView: React.FC<VendorComparisonViewProps> = ({
  tender,
  onSelectBidder,
  onViewMatrix,
}) => {
  const bidders = [...tender.submissions].sort((a, b) => {
    // Eligible bidders first, then by score descending
    if (a.score.mandatoryPassed && !b.score.mandatoryPassed) return -1;
    if (!a.score.mandatoryPassed && b.score.mandatoryPassed) return 1;
    return b.score.overallPercentage - a.score.overallPercentage;
  });

  return (
    <div className="space-y-6">
      {/* Overview & Winner Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Multi-Bidder Evaluation</span>
              <span aria-hidden="true">·</span>
              <span>{bidders.length} Proposals Submitted</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-400 font-semibold">{tender.code}</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">
              Comparative Technical &amp; Commercial Evaluation Matrix
            </h2>
          </div>

          <div className="text-xs text-slate-400 bg-slate-950 px-3 py-2 rounded-lg border border-slate-800">
            Estimated Budget: <strong className="text-white">{tender.estimatedBudget}</strong>
          </div>
        </div>

        {/* Vendor Ranking Cards Grid */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          {bidders.map((bidder, idx) => {
            const isRank1 = idx === 0 && bidder.score.mandatoryPassed;
            return (
              <div
                key={bidder.id}
                className={`p-4 rounded-xl border relative transition-all ${
                  isRank1
                    ? 'bg-slate-900 border-emerald-500/60 shadow-lg shadow-emerald-950/20'
                    : bidder.score.mandatoryPassed
                    ? 'bg-slate-950/80 border-slate-800'
                    : 'bg-rose-950/20 border-rose-900/40'
                }`}
              >
                {/* Ranking Tag */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    {isRank1 ? (
                      <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        <Trophy className="w-3.5 h-3.5" />
                        <span>Recommended Award #1</span>
                      </div>
                    ) : (
                      <span className="text-xs font-semibold text-slate-400">
                        {bidder.score.mandatoryPassed ? `Rank #${idx + 1}` : 'Non-Responsive'}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-xs font-bold ${
                      bidder.score.mandatoryPassed ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {bidder.score.mandatoryPassed ? 'ELIGIBLE' : 'DISQUALIFIED'}
                  </span>
                </div>

                {/* Company Name */}
                <h3 className="text-sm font-bold text-white truncate">{bidder.bidderName}</h3>
                <div className="text-xs text-slate-400 mt-0.5">
                  Turnover: {bidder.extractedMetadata.annualTurnoverAvg}
                </div>

                {/* Price and Score */}
                <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-medium">Offered Price</div>
                    <div className="text-base font-bold text-white mt-0.5">
                      ${(bidder.bidAmount / 1_000_000).toFixed(2)}M
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-medium">Compliance</div>
                    <div className="text-base font-bold text-emerald-400 mt-0.5">
                      {bidder.score.overallPercentage}%
                    </div>
                  </div>
                </div>

                {/* Rule Breakdown */}
                <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="text-emerald-400 font-semibold">{bidder.score.passCount} PASS</span>
                  <span>·</span>
                  <span className="text-rose-400 font-semibold">{bidder.score.failCount} FAIL</span>
                  <span>·</span>
                  <span className="text-amber-400 font-semibold">{bidder.score.reviewCount} REVIEW</span>
                </div>

                <div className="mt-3">
                  <button
                    onClick={() => {
                      onSelectBidder(bidder);
                      onViewMatrix();
                    }}
                    className="w-full py-1.5 px-3 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
                  >
                    Inspect Full Matrix
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Side-by-Side Clause Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white">
            Cross-Bidder Clause Compliance Comparison
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Direct comparison of all tender rules against each competing bidder's verified evidence.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4 w-72">Tender Specification / Rule</th>
                <th className="py-3 px-4 w-28">Type</th>
                {bidders.map((b) => (
                  <th key={b.id} className="py-3 px-4 min-w-[200px]">
                    <div className="font-bold text-slate-200">{b.bidderName}</div>
                    <div className="text-[10px] text-slate-400 normal-case">
                      ${(b.bidAmount / 1_000_000).toFixed(2)}M USD
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {tender.rules.map((rule) => {
                return (
                  <tr key={rule.id} className="hover:bg-slate-850/40 transition-colors">
                    {/* Rule name */}
                    <td className="py-3.5 px-4 align-top space-y-1">
                      <div className="font-semibold text-slate-100">{rule.name}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">{rule.description}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{rule.id}</div>
                    </td>

                    {/* Category / Mandatory */}
                    <td className="py-3.5 px-4 align-top">
                      {rule.mandatory ? (
                        <span className="text-[10px] font-bold text-rose-400 block">MANDATORY</span>
                      ) : (
                        <span className="text-[10px] text-slate-400 block font-medium">TECHNICAL</span>
                      )}
                      <span className="text-[10px] text-slate-500">Weight {rule.weight}x</span>
                    </td>

                    {/* Bidders response cells */}
                    {bidders.map((b) => {
                      const res = b.evaluationResults.find((r) => r.ruleId === rule.id);
                      if (!res) {
                        return (
                          <td key={b.id} className="py-3.5 px-4 align-top text-slate-500">
                            No data
                          </td>
                        );
                      }

                      return (
                        <td key={b.id} className="py-3.5 px-4 align-top space-y-1">
                          <span
                            className={`inline-block font-bold px-2 py-0.5 rounded text-[10px] ${
                              res.status === 'PASS'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : res.status === 'FAIL'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            {res.status} ({res.confidence}%)
                          </span>
                          <div className="text-[11px] text-slate-300 font-medium line-clamp-2">
                            {res.bidderSubmittedValue}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
