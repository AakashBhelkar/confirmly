import { z } from 'zod';

// Common validation schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const idParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format'),
});

// Date range schema
export const dateRangeSchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

// Email validation
export const emailSchema = z.string().email('Invalid email format');

// Phone validation (Indian format)
export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format');

// Helper function to validate request
export const validateRequest = <T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): z.infer<T> => {
  return schema.parse(data);
};

