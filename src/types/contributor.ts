import { ExperienceLevel } from './cause';
import { CoordinationType } from './coordination';

export interface Contributor {
  id: string;
  githubUsername?: string;
  email?: string;
  name?: string;
  bio?: string;
  avatar?: string;
  location?: string;
  timezone?: string;
  languages?: string[];
  website?: string;
  socialLinks?: SocialLinks;
  causes: ContributorCause[];
  skills: Skill[];
  experience: ExperienceProfile;
  availability: AvailabilityProfile;
  preferences: ContributorPreferences;
  reputation: ReputationScore;
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt: Date;
}

export interface SocialLinks {
  twitter?: string;
  linkedin?: string;
  mastodon?: string;
  personalSite?: string;
}

export interface ContributorCause {
  causeId: string;
  experienceLevel: ExperienceLevel;
  startedAt: Date;
  contributionHours: number;
  projectsCompleted: number;
  mentorshipGiven: number;
  mentorshipReceived: number;
  primaryFocus: boolean;
}

export interface Skill {
  name: string;
  category: SkillCategory;
  level: ExperienceLevel;
  endorsements: number;
  projects: string[];
  yearsOfExperience: number;
}

export type SkillCategory = 
  | 'programming'
  | 'research'
  | 'design'
  | 'communication'
  | 'leadership'
  | 'domain-specific';

export interface ExperienceProfile {
  totalYears: number;
  primaryRole: string;
  roles: Role[];
  contributions: ContributionHistory;
  achievements: Achievement[];
  expertiseAreas: string[];
}

export interface Role {
  title: string;
  organization?: string;
  startDate: Date;
  endDate?: Date;
  description?: string;
  causeArea?: string;
}

export interface ContributionHistory {
  totalProjects: number;
  totalCommits: number;
  totalPRs: number;
  totalIssues: number;
  totalStars: number;
  primaryLanguages: string[];
  contributionStreak: number;
  mostActiveTime: string;
}

export interface Achievement {
  id: string;
  type: AchievementType;
  title: string;
  description: string;
  earnedAt: Date;
  causeId?: string;
  projectId?: string;
  verified: boolean;
}

export type AchievementType = 
  | 'first-contribution'
  | 'milestone-commits'
  | 'mentor-badge'
  | 'cause-champion'
  | 'collaboration-star'
  | 'impact-maker';

export interface AvailabilityProfile {
  status: AvailabilityStatus;
  hoursPerWeek: number;
  coordinationTypes: CoordinationType[];
  mentorshipCapacity: number;
  currentMentees: number;
  preferredSchedule: string;
  nextAvailable?: Date;
}

export type AvailabilityStatus = 
  | 'available'
  | 'busy'
  | 'limited'
  | 'unavailable';

export interface ContributorPreferences {
  coordinationTypes: CoordinationType[];
  communicationChannels: CommunicationChannel[];
  meetingPreferences: MeetingPreferences;
  causeInterests: string[];
  skillInterests: string[];
  learningGoals: string[];
  privacySettings: PrivacySettings;
}

export type CommunicationChannel = 
  | 'email'
  | 'slack'
  | 'discord'
  | 'github'
  | 'video';

export interface MeetingPreferences {
  preferredDuration: number; // minutes
  preferredFrequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'as-needed';
  preferredTools: string[];
  cameraPreference: 'always' | 'sometimes' | 'never';
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'community' | 'connections' | 'private';
  showEmail: boolean;
  showLocation: boolean;
  showAvailability: boolean;
  showProjects: boolean;
  allowDirectMessages: boolean;
}

export interface ReputationScore {
  overall: number; // 0-100
  mentorship: number;
  collaboration: number;
  expertise: number;
  reliability: number;
  communication: number;
  impact: number;
  endorsements: Endorsement[];
  badges: Badge[];
}

export interface Endorsement {
  id: string;
  fromContributorId: string;
  skill?: string;
  message: string;
  createdAt: Date;
}

export interface Badge {
  id: string;
  type: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
  expiresAt?: Date;
}