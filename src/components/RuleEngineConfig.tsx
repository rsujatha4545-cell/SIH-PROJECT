import React, { useState } from 'react';
import { 
  Sliders, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Check, 
  AlertCircle, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { TenderDocument, ComplianceRule, RuleCategory } from '../types/stamas';

interface RuleEngineConfigProps {
  tender: TenderDocument;
  onUpdateRules: (newRules: ComplianceRule[]) => void;
}

export const RuleEngineConfig: React.FC<RuleEngineConfigProps> = ({
  tender,
  onUpdateRules,
}) => {
  const [rules, setRules] = useState<ComplianceRule[]>(tender.rules);
  const [showAddForm, setShowAddForm] = useState(false);

  // New rule state
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<RuleCategory>('TECHNICAL');
  const [newDescription, setNewDescription] = useState('');
  const [newMandatory, setNewMandatory] = useState(true);
  const [newThreshold, setNewThreshold] = useState('');
  const [newWeight, setNewWeight] = useState(8);

  const handleToggleMandatory = (ruleId: string) => {
    const updated = rules.map((r) =>
      r.id === ruleId ? { ...r, mandatory: !r.mandatory } : r
    );
    setRules(updated);
    onUpdateRules(updated);
  };

  const handleDeleteRule = (ruleId: string) => {
    const updated = rules.filter((r) => r.id !== ruleId);
    setRules(updated);
    onUpdateRules(updated);
  };

  const handleAddRule = () => {
    if (!newName.trim()) return;

    const newRule: ComplianceRule = {
      id: `RULE-${String(rules.length + 1).padStart(2, '0')}`,
      name: newName.trim(),
      category: newCategory,
      description: newDescription.trim() || newName.trim(),
      mandatory: newMandatory,
      threshold: newThreshold.trim() || undefined,
      weight: newWeight,
    };

    const updated = [...rules, newRule];
    setRules(updated);
    onUpdateRules(updated);

    // Reset form
    setNewName('');
    setNewDescription('');
    setNewThreshold('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header and Rule Engine Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Deterministic Rule Engine</span>
              <span aria-hidden="true">·</span>
              <span>{rules.length} Rules Active</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-400 font-semibold">{tender.code}</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">
              Procurement Qualification &amp; Compliance Rule Configuration
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl">
              Configure mandatory thresholds, scoring weights, and verification rules enforced by STAMAS across all submitted bid proposals.
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-sm transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Compliance Rule</span>
          </button>
        </div>

        {/* Add Rule Form */}
        {showAddForm && (
          <div className="mt-4 p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
            <div className="text-xs font-semibold text-slate-200">
              Define New Qualification Criteria / Rule
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Rule Name</label>
                <input
                  type="text"
                  placeholder="e.g. ISO 14001 Environmental Management Certification"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as RuleCategory)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="MANDATORY">Mandatory Qualification</option>
                  <option value="TECHNICAL">Technical Specifications</option>
                  <option value="FINANCIAL">Financial &amp; Commercial</option>
                  <option value="LEGAL_STATUTORY">Legal &amp; Statutory</option>
                  <option value="SLA_WARRANTY">SLA &amp; Warranties</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] text-slate-400 mb-1">Requirement / Threshold Description</label>
                <textarea
                  rows={2}
                  placeholder="Explicit condition required for passing (e.g. Valid certificate without exclusions dated within last 24 months)..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Threshold String</label>
                <input
                  type="text"
                  placeholder="e.g. >= 99.9% uptime or Active ISO 14001"
                  value={newThreshold}
                  onChange={(e) => setNewThreshold(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-4 pt-4">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={newMandatory}
                    onChange={(e) => setNewMandatory(e.target.checked)}
                    className="rounded border-slate-700 text-emerald-600 focus:ring-0"
                  />
                  <span>Mandatory (Failure causes bid disqualification)</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRule}
                disabled={!newName.trim()}
                className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-xs font-semibold text-white transition-colors"
              >
                Save &amp; Activate Rule
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Rules List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="divide-y divide-slate-800/80">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-850/40 transition-colors"
            >
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono text-slate-500 font-semibold">{rule.id}</span>
                  <span>·</span>
                  <span className="text-slate-400">{rule.category.replace('_', ' ')}</span>
                  <span>·</span>
                  {rule.mandatory ? (
                    <span className="text-rose-400 font-bold">MANDATORY</span>
                  ) : (
                    <span className="text-slate-400">Optional / Weighted</span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-white">{rule.name}</h3>
                <p className="text-xs text-slate-300">{rule.description}</p>
                {rule.threshold && (
                  <div className="text-[11px] text-emerald-400 font-medium pt-0.5">
                    Threshold: {rule.threshold}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                {/* Mandatory toggle button */}
                <button
                  onClick={() => handleToggleMandatory(rule.id)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold border transition-colors ${
                    rule.mandatory
                      ? 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                  title="Toggle mandatory disqualification condition"
                >
                  {rule.mandatory ? 'Mandatory' : 'Optional'}
                </button>

                {/* Delete rule */}
                <button
                  onClick={() => handleDeleteRule(rule.id)}
                  className="p-1.5 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  title="Remove Rule"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
