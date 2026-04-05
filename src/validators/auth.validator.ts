import { z } from 'zod';

export const registerSchema = z.object({
  phone: z.string().regex(/^\+8801[3-9]\d{8}$/, 'Invalid Bangladesh phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required').optional(),
});

export const loginSchema = z.object({
  phone: z.string().regex(/^\+8801[3-9]\d{8}$/, 'Invalid Bangladesh phone number'),
  password: z.string().min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
