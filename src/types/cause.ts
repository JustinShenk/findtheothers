export interface Cause {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentId?: string;
  children?: Cause[];
  level: number;
  color: string;
  icon?: string;
  keywords: string[];
  impactScore: number;
  contributorCount: number;
  initiativeCount: number;
  coordinationOpportunities: number;
  learningPathways: LearningPathway[];
  metadata: CauseMetadata;
}

export interface CauseMetadata {
  urgency: 'critical' | 'high' | 'medium' | 'low';
  tractability: 'high' | 'medium' | 'low';
  neglectedness: number; // 0-1 scale
  timeHorizon: 'immediate' | 'short' | 'medium' | 'long';
  geographicScope: 'local' | 'regional' | 'national' | 'global';
  requiredExpertise: string[];
  fundingAvailable: boolean;
  activeProjects: number;
}

export interface CauseTaxonomy {
  version: string;
  lastUpdated: Date;
  rootCauses: Cause[];
  totalCauses: number;
}

export interface LearningPathway {
  id: string;
  causeId: string;
  name: string;
  description: string;
  experienceLevel: ExperienceLevel;
  estimatedDuration: string;
  milestones: LearningMilestone[];
  recommendedResources: Resource[];
  mentorsAvailable: number;
}

export interface LearningMilestone {
  id: string;
  name: string;
  description: string;
  skills: string[];
  projects: string[];
  order: number;
}

export interface Resource {
  id: string;
  type: 'article' | 'course' | 'book' | 'video' | 'project' | 'paper';
  title: string;
  url: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
}

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface CauseClassification {
  initiativeId: string;
  primaryCause: string;
  secondaryCauses: string[];
  confidence: number;
  classifiedAt: Date;
  classifiedBy: 'llm' | 'human' | 'hybrid';
  validationStatus: 'pending' | 'validated' | 'rejected';
  validatedBy?: string;
  validatedAt?: Date;
}