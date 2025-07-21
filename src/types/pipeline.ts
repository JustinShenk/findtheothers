export interface PipelineJob {
  id: string;
  type: JobType;
  status: JobStatus;
  priority: number;
  data: any;
  result?: any;
  error?: string;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  nextRunAt?: Date;
}

export type JobType = 
  | 'github_scrape'
  | 'cause_classification'
  | 'embedding_generation'
  | 'impact_calculation'
  | 'coordination_matching'
  | 'notification';

export type JobStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'scheduled';

export interface GithubScrapeJob {
  query?: string;
  owner?: string;
  repo?: string;
  since?: Date;
  language?: string;
  topic?: string;
  minStars?: number;
}

export interface ClassificationJob {
  initiativeId: string;
  content: string;
  metadata: any;
  modelVersion: string;
}

export interface EmbeddingJob {
  initiativeId: string;
  text: string;
  modelVersion: string;
}

export interface PipelineMetrics {
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  averageProcessingTime: number;
  throughput: number;
  queueDepth: number;
  errorRate: number;
  lastRunAt: Date;
}

export interface PipelineConfig {
  batchSize: number;
  rateLimit: number;
  concurrentJobs: number;
  retryAttempts: number;
  retryDelay: number;
  schedules: PipelineSchedule[];
}

export interface PipelineSchedule {
  name: string;
  jobType: JobType;
  cron: string;
  enabled: boolean;
  config?: any;
}

export interface DataSource {
  id: string;
  type: 'github' | 'arxiv' | 'pubmed' | 'custom';
  name: string;
  config: any;
  enabled: boolean;
  lastSync?: Date;
  nextSync?: Date;
  syncStatus: 'idle' | 'syncing' | 'error';
  metrics: DataSourceMetrics;
}

export interface DataSourceMetrics {
  totalItems: number;
  processedItems: number;
  failedItems: number;
  lastSuccessAt?: Date;
  lastErrorAt?: Date;
  errorMessage?: string;
}

export interface ValidationQueue {
  id: string;
  initiativeId: string;
  classification: any;
  priority: 'high' | 'medium' | 'low';
  assignedTo?: string;
  status: 'pending' | 'in_review' | 'approved' | 'rejected';
  createdAt: Date;
  reviewedAt?: Date;
  reviewNotes?: string;
}

export interface ProcessingError {
  id: string;
  jobId: string;
  jobType: JobType;
  error: string;
  stack?: string;
  context: any;
  occurredAt: Date;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
}