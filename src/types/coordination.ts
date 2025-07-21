import { ExperienceLevel } from './cause';

export interface CoordinationOpportunity {
  id: string;
  type: CoordinationType;
  title: string;
  description: string;
  causeId: string;
  initiativeId?: string;
  createdBy: string;
  createdAt: Date;
  status: OpportunityStatus;
  participants: CoordinationParticipant[];
  requirements: CoordinationRequirements;
  outcomes: CoordinationOutcome[];
  visibility: 'public' | 'cause' | 'private';
  tags: string[];
}

export type CoordinationType = 
  | 'mentorship'
  | 'collaboration'
  | 'guidance'
  | 'review'
  | 'brainstorming'
  | 'research'
  | 'project';

export type OpportunityStatus = 
  | 'open'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface CoordinationParticipant {
  contributorId: string;
  role: ParticipantRole;
  joinedAt: Date;
  contribution?: string;
  feedback?: ParticipantFeedback;
}

export type ParticipantRole = 
  | 'mentor'
  | 'mentee'
  | 'collaborator'
  | 'advisor'
  | 'reviewer'
  | 'observer';

export interface CoordinationRequirements {
  experienceLevel?: ExperienceLevel;
  skills?: string[];
  timeCommitment?: string;
  availability?: AvailabilitySchedule;
  location?: LocationRequirement;
  language?: string[];
}

export interface AvailabilitySchedule {
  timezone: string;
  weeklyHours: number;
  preferredTimes: TimeSlot[];
}

export interface TimeSlot {
  dayOfWeek: number; // 0-6
  startHour: number; // 0-23
  endHour: number; // 0-23
}

export interface LocationRequirement {
  type: 'remote' | 'in-person' | 'hybrid';
  location?: string;
}

export interface CoordinationOutcome {
  id: string;
  opportunityId: string;
  type: OutcomeType;
  description: string;
  impact: ImpactMetrics;
  artifacts: Artifact[];
  recordedAt: Date;
  recordedBy: string;
}

export type OutcomeType = 
  | 'skill_gained'
  | 'project_completed'
  | 'connection_made'
  | 'knowledge_shared'
  | 'problem_solved'
  | 'resource_created';

export interface ImpactMetrics {
  directBeneficiaries: number;
  indirectBeneficiaries?: number;
  timelineAcceleration?: string;
  resourcesSaved?: number;
  qualityImprovement?: number; // 0-100
}

export interface Artifact {
  id: string;
  type: 'code' | 'document' | 'design' | 'research' | 'other';
  title: string;
  url: string;
  description?: string;
}

export interface ParticipantFeedback {
  rating: number; // 1-5
  comment?: string;
  wouldRecommend: boolean;
  skillsGained?: string[];
  areasForImprovement?: string[];
}

export interface MentorshipRelationship {
  id: string;
  mentorId: string;
  menteeId: string;
  causeId: string;
  status: 'active' | 'completed' | 'paused' | 'ended';
  startedAt: Date;
  endedAt?: Date;
  goals: MentorshipGoal[];
  sessions: MentorshipSession[];
  progress: MentorshipProgress;
  feedback: RelationshipFeedback;
}

export interface MentorshipGoal {
  id: string;
  description: string;
  targetDate: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'revised';
  milestones: string[];
}

export interface MentorshipSession {
  id: string;
  scheduledAt: Date;
  duration: number; // minutes
  type: 'video' | 'audio' | 'chat' | 'in-person';
  topics: string[];
  notes?: string;
  actionItems: ActionItem[];
  attended: boolean;
}

export interface ActionItem {
  id: string;
  description: string;
  assignedTo: string;
  dueDate?: Date;
  completed: boolean;
  completedAt?: Date;
}

export interface MentorshipProgress {
  goalsCompleted: number;
  totalGoals: number;
  sessionsCompleted: number;
  skillsAcquired: string[];
  projectsCompleted: string[];
  nextMilestone?: string;
}

export interface RelationshipFeedback {
  mentorRating?: number;
  menteeRating?: number;
  mentorComments?: string;
  menteeComments?: string;
  successStories?: string[];
  challenges?: string[];
}