export type PriorityLevel = 'P0' | 'P1' | 'P2' | 'P3';
export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';
export type EvidenceType = 'automated' | 'heuristic' | 'ai' | 'accessibility';
export type AuditStatus = 'queued' | 'crawling' | 'analyzing' | 'generating' | 'completed' | 'failed';
export type VerificationStatus = 'PASS' | 'FAIL' | 'REVIEW' | 'TEST REQUIRED';

export interface UxScoreCategory {
  score: number;
  rationale: string;
  evidence: string[];
  confidence: number; // 0 - 1
}

export interface UxScorecard {
  overall: UxScoreCategory;
  firstImpression: UxScoreCategory;
  informationArchitecture: UxScoreCategory;
  navigation: UxScoreCategory;
  visualHierarchy: UxScoreCategory;
  content: UxScoreCategory;
  portfolioProduct: UxScoreCategory;
  conversion: UxScoreCategory;
  trustCredibility: UxScoreCategory;
  accessibility: UxScoreCategory;
  mobileUX: UxScoreCategory;
  interactionDesign: UxScoreCategory;
}

export interface UxFinding {
  id: string;
  category: string;
  priority: PriorityLevel;
  severity: SeverityLevel;
  confidence: number;
  page: string;
  element: string;
  title: string;
  description: string;
  evidence: string[];
  uxImpact: string;
  recommendation: string[];
  principle: string;
  evidenceType: EvidenceType;
  screenshot?: string;
  owner?: string;
}

export interface DiscoveredPage {
  url: string;
  title: string;
  pageType: string;
  status: number;
  wordCount?: number;
  headingCount?: number;
  imageCount?: number;
  linkCount?: number;
  score?: number;
  primaryStrength?: string;
  primaryIssue?: string;
  recommendation?: string;
}

export interface AccessibilityCheck {
  id: string;
  category: string;
  item: string;
  status: VerificationStatus;
  details: string;
  wcagRef?: string;
  elementRef?: string;
}

export interface ViewportAnalysis {
  device: 'Desktop' | 'Tablet' | 'Mobile';
  resolution: string;
  navigationState: string;
  layoutObservations: string[];
  touchTargetPass: boolean;
  horizontalOverflow: boolean;
  typographyLegibility: string;
}

export interface ConversionJourneyStep {
  stepName: string;
  page: string;
  frictionPoint?: string;
  recommendation: string;
}

export interface UserJourneyMap {
  persona: 'Recruiter' | 'Client' | 'General Visitor';
  steps: ConversionJourneyStep[];
  overallFriction: string;
  conversionOpportunity: string;
}

export interface RoadmapTask {
  title: string;
  priority: PriorityLevel;
  category: string;
  expectedImpact: string;
  successMetrics: string;
  owner: string;
  estimatedEffort: string;
}

export interface RoadmapPhase {
  timeframe: '0–2 weeks' | '2–5 weeks' | '5–8 weeks' | '8–12 weeks';
  phaseTitle: string;
  tasks: RoadmapTask[];
}

export interface ComponentPattern {
  name: string;
  description: string;
  currentIssues: string[];
  recommendedPattern: string;
  keyAccessibilityRule: string;
  bestPracticeSpec: string;
}

export interface EvidenceCodeSnippet {
  id: string;
  title: string;
  category: string;
  language: 'html' | 'css' | 'json';
  selector: string;
  xpath?: string;
  code: string;
  provenanceTag: string;
  confidence: number;
  status: 'FAIL' | 'WARN' | 'PASS';
  issueRef?: string;
  explanation: string;
}

export interface EvidenceComponentProof {
  id: string;
  title: string;
  componentName: string;
  page: string;
  selector: string;
  tag: string;
  status: 'FAIL' | 'WARN' | 'PASS';
  elementMockType: 'contrast' | 'cta' | 'focus' | 'alt';
  description: string;
  computedStyleProof?: string;
}

export interface EvidenceReconciliation {
  verifiedEvidence: string[];
  aiInterpretation: string[];
  requiresManualValidation: string[];
  limitations: string[];
  codeSnippets?: EvidenceCodeSnippet[];
  screenshotProofs?: EvidenceComponentProof[];
}

export interface UxAuditReport {
  audit: {
    id: string;
    url: string;
    domain: string;
    date: string;
    status: AuditStatus;
    crawlDepth: number;
    pagesCount: number;
    viewportSizes: string[];
  };

  website: {
    title: string;
    description: string;
    pagesAnalyzed: number;
    primaryCategory: string;
    heroHeadline?: string;
    heroSubheadline?: string;
  };

  scores: UxScorecard;

  executiveSummary: {
    overallAssessment: string;
    overallScore: number;
    strongestAreas: string[];
    biggestProblems: string[];
    primaryOpportunities: string[];
    p0Priorities: string[];
    finalRecommendation: 'Improve, do not redesign from scratch' | 'Strategic redesign recommended' | 'Minor UX polish required';
  };

  pages: DiscoveredPage[];

  findings: UxFinding[];

  firstImpression: {
    heroClarity: string;
    positioning: string;
    visualImpact: string;
    firstCTA: string;
    valueProposition: string;
    keyObservations: string[];
  };

  informationArchitecture: {
    currentIA: string[];
    recommendedIA: string[];
    decisionJourney: string[]; // e.g. ['Discover', 'Understand', 'Evaluate', 'Trust', 'Convert']
    navigationIssues: string[];
  };

  visualHierarchy: {
    typographyObservations: string[];
    spacingLayout: string[];
    ctaProminence: string[];
    cardConsistency: string[];
    interactionPatterns: string[];
  };

  contentAndTrust: {
    messagingClarity: string[];
    readabilityScore: string;
    trustSignals: string[];
    socialProof: string[];
    credibilityGaps: string[];
  };

  accessibility: {
    summary: string;
    checks: AccessibilityCheck[];
    wcagComplianceEstimate: string;
  };

  mobile: {
    viewports: ViewportAnalysis[];
    summary: string;
    keyIssues: string[];
  };

  conversion: {
    journeys: UserJourneyMap[];
    conversionFriction: string[];
    ctaHierarchyRecommendation: string[];
  };

  priorityMatrix: UxFinding[];

  roadmap: RoadmapPhase[];

  components: ComponentPattern[];

  evidence: EvidenceReconciliation;

  methodology: {
    crawlDepth: number;
    viewportSizes: string[];
    automatedCheckCount: number;
    aiModelUsed: string;
    scoringMethodology: string;
    disclaimer: string;
  };
}

export interface UxAuditSession {
  auditId: string;
  url: string;
  domain: string;
  createdAt: string;
  status: AuditStatus;
  progress: number;
  stage: string;
  report?: UxAuditReport;
  error?: string;
}
