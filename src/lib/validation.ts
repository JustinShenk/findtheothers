import { z } from 'zod';

// Common validation schemas
export const paginationSchema = z.object({
  limit: z.coerce.number().min(1).max(1000).default(50),
  offset: z.coerce.number().min(0).default(0),
});

export const searchSchema = z.object({
  q: z.string().min(2).max(100),
  type: z.enum(['all', 'initiatives', 'causes', 'contributors']).default('all'),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export const visualizationSchema = z.object({
  causes: z.string().optional().default('').transform(val => val.split(',').filter(Boolean)),
  limit: z.coerce.number().min(1).max(5000).default(1000),
  auto: z.string().optional().default('true').transform(val => val !== 'false'),
  dimreduction: z.enum(['pca', 'trunc']).optional(),
});

export const initiativesSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),
  causeId: z.string().optional(),
});

export const coordinationSchema = z.object({
  causes: z.string().optional().transform(val => val?.split(',').filter(Boolean) || []),
  status: z.enum(['open', 'in_progress', 'completed']).default('open'),
  type: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).default(10),
});

// Helper function to validate request params
export function validateSearchParams<T extends z.ZodType>(
  searchParams: URLSearchParams,
  schema: T
): { data: z.infer<T> | null; error: string | null } {
  try {
    const params = Object.fromEntries(searchParams.entries());
    const data = schema.parse(params);
    return { data, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      return { data: null, error: messages.join(', ') };
    }
    return { data: null, error: 'Invalid parameters' };
  }
}