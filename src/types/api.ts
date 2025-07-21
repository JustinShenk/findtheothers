export interface APIResponse<T> {
  data?: T;
  error?: APIError;
  meta?: ResponseMeta;
}

export interface APIError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

export interface ResponseMeta {
  page?: number;
  pageSize?: number;
  total?: number;
  hasMore?: boolean;
  processingTime?: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchParams extends PaginationParams {
  query?: string;
  filters?: SearchFilter[];
  facets?: string[];
}

export interface SearchFilter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'in' | 'contains';
  value: any;
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  facets?: SearchFacet[];
  highlights?: { [key: string]: string[] };
}

export interface SearchFacet {
  field: string;
  values: FacetValue[];
}

export interface FacetValue {
  value: string;
  count: number;
  selected?: boolean;
}

export interface WebSocketMessage {
  type: MessageType;
  payload: any;
  timestamp: Date;
  correlationId?: string;
}

export type MessageType = 
  | 'initiative.created'
  | 'initiative.updated'
  | 'coordination.requested'
  | 'coordination.accepted'
  | 'mentorship.matched'
  | 'notification'
  | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export type NotificationType = 
  | 'coordination_request'
  | 'mentorship_match'
  | 'project_update'
  | 'achievement_earned'
  | 'system';

export interface BatchOperation<T> {
  operations: BatchItem<T>[];
  options?: BatchOptions;
}

export interface BatchItem<T> {
  id: string;
  operation: 'create' | 'update' | 'delete';
  data?: T;
}

export interface BatchOptions {
  stopOnError?: boolean;
  parallel?: boolean;
  chunkSize?: number;
}

export interface BatchResult<T> {
  successful: BatchItemResult<T>[];
  failed: BatchItemResult<T>[];
  totalProcessed: number;
  processingTime: number;
}

export interface BatchItemResult<T> {
  id: string;
  operation: string;
  result?: T;
  error?: APIError;
}

export interface ExportRequest {
  format: 'json' | 'csv' | 'xlsx';
  entities: ExportEntity[];
  filters?: SearchFilter[];
  fields?: string[];
  includeRelations?: boolean;
}

export type ExportEntity = 
  | 'initiatives'
  | 'contributors'
  | 'causes'
  | 'coordinations'
  | 'mentorships';

export interface ExportResult {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  url?: string;
  expiresAt?: Date;
  error?: string;
}

export interface WebhookConfig {
  id: string;
  url: string;
  events: MessageType[];
  secret?: string;
  active: boolean;
  headers?: { [key: string]: string };
  retryPolicy?: RetryPolicy;
}

export interface RetryPolicy {
  maxAttempts: number;
  backoffMultiplier: number;
  maxBackoffSeconds: number;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: Date;
  retryAfter?: number;
}