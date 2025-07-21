export interface Initiative {
  id: string;
  type: InitiativeType;
  platform: Platform;
  externalId: string;
  name: string;
  description: string;
  url: string;
  owner: InitiativeOwner;
  causes: string[];
  primaryCause: string;
  tags: string[];
  languages?: string[];
  topics?: string[];
  stars?: number;
  forks?: number;
  contributors: number;
  activity: ActivityMetrics;
  impact: ImpactAssessment;
  coordinationNeeds: CoordinationNeed[];
  embedding?: number[];
  metadata: InitiativeMetadata;
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt: Date;
}

export type InitiativeType = 
  | 'repository'
  | 'research_paper'
  | 'organization'
  | 'project'
  | 'policy'
  | 'dataset'
  | 'tool';

export type Platform = 
  | 'github'
  | 'gitlab'
  | 'arxiv'
  | 'pubmed'
  | 'ssrn'
  | 'website'
  | 'other';

export interface InitiativeOwner {
  id: string;
  name: string;
  type: 'individual' | 'organization';
  avatar?: string;
  url?: string;
}

export interface ActivityMetrics {
  commits?: number;
  issues?: number;
  pullRequests?: number;
  discussions?: number;
  releases?: number;
  lastCommitAt?: Date;
  contributionFrequency: 'daily' | 'weekly' | 'monthly' | 'sporadic' | 'inactive';
  growthRate: number; // percentage
  engagementScore: number; // 0-100
}

export interface ImpactAssessment {
  score: number; // 0-100
  reach: 'local' | 'regional' | 'national' | 'global';
  beneficiaries: number;
  citationCount?: number;
  derivativeWorks?: number;
  communitySize: number;
  testimonials?: Testimonial[];
  metrics: CustomMetric[];
}

export interface Testimonial {
  id: string;
  author: string;
  content: string;
  date: Date;
  verified: boolean;
}

export interface CustomMetric {
  name: string;
  value: number;
  unit?: string;
  description?: string;
}

export interface CoordinationNeed {
  id: string;
  type: 'expertise' | 'mentorship' | 'collaboration' | 'funding' | 'resources' | 'advocacy';
  priority: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  skills?: string[];
  timeCommitment?: string;
  status: 'open' | 'in_progress' | 'fulfilled';
}

export interface InitiativeMetadata {
  license?: string;
  documentation?: DocumentationQuality;
  maintainability?: MaintainabilityScore;
  accessibility?: AccessibilityScore;
  sustainability?: SustainabilityIndicators;
  governanceModel?: string;
  fundingStatus?: FundingStatus;
  relatedInitiatives?: string[];
}

export interface DocumentationQuality {
  score: number; // 0-100
  hasReadme: boolean;
  hasContributing: boolean;
  hasCodeOfConduct: boolean;
  hasLicense: boolean;
  hasDocs: boolean;
  lastUpdated?: Date;
}

export interface MaintainabilityScore {
  overall: number; // 0-100
  codeQuality?: number;
  testCoverage?: number;
  dependencyHealth?: number;
  securityScore?: number;
  technicalDebt?: number;
}

export interface AccessibilityScore {
  overall: number; // 0-100
  languageSupport: string[];
  a11yCompliance?: boolean;
  mobileSupport?: boolean;
  offlineCapability?: boolean;
}

export interface SustainabilityIndicators {
  fundingDiversity: number; // 0-100
  contributorDiversity: number;
  busFactor: number; // number of key contributors
  governanceScore: number;
  communityHealth: number;
}

export interface FundingStatus {
  status: 'funded' | 'seeking' | 'bootstrapped' | 'sustainable';
  sources?: FundingSource[];
  runway?: string;
  seekingAmount?: number;
}

export interface FundingSource {
  type: 'grant' | 'donation' | 'sponsorship' | 'revenue' | 'crowdfunding';
  name?: string;
  amount?: number;
  currency?: string;
  date?: Date;
}

export interface InitiativeConnection {
  id: string;
  fromInitiativeId: string;
  toInitiativeId: string;
  type: ConnectionType;
  strength: number; // 0-1
  description?: string;
  createdAt: Date;
}

export type ConnectionType = 
  | 'dependency'
  | 'fork'
  | 'inspiration'
  | 'collaboration'
  | 'competition'
  | 'complement';