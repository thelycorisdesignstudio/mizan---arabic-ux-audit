export type IssueType = 'fail' | 'warn' | 'pass';

export interface Issue {
  type: IssueType;
  text: string;
  selector?: string;
  snippet?: string;
}

export interface Checkpoint {
  id: string;
  name: string;
  desc: string;
  weight: number;
  icon: any;
}

export interface Recommendation {
  priority: 'critical' | 'high' | 'medium';
  title: string;
  body: string;
}

export interface AuditResults {
  id: string;
  url: string;
  timestamp: string;
  scores: Record<string, number>;
  overallScore: number;
  issues: Record<string, Issue[]>;
  recommendations: Recommendation[];
  collaborators?: Collaborator[];
  comments?: Comment[];
}

export interface Collaborator {
  id: string;
  name: string;
  color: string;
  cursor?: { x: number; y: number };
}

export interface Comment {
  id: string;
  checkpointId: string;
  authorId: string;
  text: string;
  timestamp: string;
  status: 'open' | 'disputed' | 'acknowledged' | 'fixed';
  replies?: Comment[];
  reactions?: string[];
}

export interface Assertion {
  id: string;
  category: 'rtl' | 'typography' | 'a11y' | 'search' | 'governance' | 'localization';
  text: string;
  enabled: boolean;
}

export interface Pattern {
  id: string;
  name: string;
  desc: string;
  problem: string;
  solution: string;
  markets: string[];
  checkpointId: string;
  image?: string;
}

export interface Regulation {
  id: string;
  market: string;
  name: string;
  requirement: string;
  status: 'enforced' | 'pending' | 'draft';
  penalty: string;
  sourceUrl: string;
}

export interface BenchmarkProduct {
  id: string;
  name: string;
  category: string;
  market: string;
  score: number;
  delta: number;
  criticalIssues: string[];
}
