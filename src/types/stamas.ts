export type ComplianceStatus = 'PASS' | 'FAIL' | 'REVIEW';

export type RuleCategory = 'MANDATORY' | 'TECHNICAL' | 'FINANCIAL' | 'LEGAL_STATUTORY' | 'SLA_WARRANTY';

export interface ComplianceRule {
  id: string;
  category: RuleCategory;
  name: string;
  description: string;
  mandatory: boolean;
  threshold?: string;
  weight: number; // 1 to 10
}

export interface RuleEvaluationResult {
  ruleId: string;
  ruleName: string;
  category: RuleCategory;
  mandatory: boolean;
  status: ComplianceStatus;
  confidence: number; // 0 - 100
  tenderRequirement: string;
  bidderSubmittedValue: string;
  evidenceQuote: string;
  documentPage?: number;
  documentSource?: string;
  notes: string;
  reviewerOverride?: {
    status: ComplianceStatus;
    reason: string;
    reviewer: string;
    timestamp: string;
  };
}

export interface DiscrepancyItem {
  id: string;
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR';
  clauseRef: string;
  title: string;
  description: string;
  impact: string;
  recommendation: string;
}

export interface BidderSubmission {
  id: string;
  bidderName: string;
  submittedAt: string;
  bidAmount: number;
  currency: string;
  documentName: string;
  documentSize: string;
  totalPages: number;
  documentText?: string;
  extractedMetadata: {
    registrationNumber: string;
    incorporationYear: number;
    annualTurnoverAvg: string;
    isoCertifications: string[];
    securityClearance: string;
    warrantyOffered: string;
  };
  evaluationResults: RuleEvaluationResult[];
  discrepancies: DiscrepancyItem[];
  score: {
    overallPercentage: number;
    mandatoryPassed: boolean;
    passCount: number;
    failCount: number;
    reviewCount: number;
    rank: number;
  };
}

export interface TenderDocument {
  id: string;
  code: string;
  title: string;
  issuer: string;
  deadline: string;
  estimatedBudget: string;
  description: string;
  rules: ComplianceRule[];
  submissions: BidderSubmission[];
}

export interface PipelineStage {
  id: 'ocr' | 'rag' | 'rule_engine' | 'synthesis';
  label: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  progress: number;
  durationMs: number;
  details: string;
}

export interface BackendConnectionState {
  url: string;
  isConnected: boolean;
  isChecking: boolean;
  latencyMs: number | null;
  mode: 'render' | 'localhost' | 'standalone';
  lastPing: string | null;
  serverInfo?: {
    version: string;
    engine: string;
    activeWorkers: number;
  };
}
