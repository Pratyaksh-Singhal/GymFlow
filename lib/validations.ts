import { z } from 'zod';

// Authentication
export const signupSchema = z.object({
  gym_name: z.string().min(2, 'Gym name required').max(100),
  owner_name: z.string().min(2, 'Owner name required').max(100),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[0-9]/, 'Password must contain number'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password required'),
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const newPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[0-9]/, 'Password must contain number'),
  token: z.string().min(1, 'Reset token required'),
});

export const validateSignupInput = (data: unknown) => signupSchema.parse(data);
export const validateLoginInput = (data: unknown) => loginSchema.parse(data);
export const validateResetPasswordRequest = (data: unknown) => resetPasswordSchema.parse(data);
export const validateNewPasswordInput = (data: unknown) => newPasswordSchema.parse(data);

// Members
export const createMemberSchema = z.object({
  name: z.string().min(2, 'Name required').max(100),
  email: z.string().email('Invalid email'),
  phone: z.string().regex(/^\+?[\d\s-()]{10,}$/, 'Invalid phone number'),
  date_of_birth: z.string().datetime().optional(),
  package_id: z.string().uuid('Invalid package ID'),
  assigned_trainer_id: z.string().uuid('Invalid trainer ID').optional(),
});

export const updateMemberSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  status: z.enum(['active', 'paused', 'deactivated']).optional(),
  assigned_trainer_id: z.string().uuid().optional().nullable(),
});

// Packages
export const createPackageSchema = z.object({
  name: z.string().min(2, 'Package name required').max(100),
  duration_days: z.number().int().min(1),
  price: z.number().positive('Price must be positive'),
  description: z.string().max(500).optional(),
});

export const updatePackageSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  price: z.number().positive().optional(),
  description: z.string().max(500).optional(),
  is_active: z.boolean().optional(),
});

// Fees
export const markFeeAsPaidSchema = z.object({
  status: z.literal('paid'),
  payment_method: z.enum(['cash', 'upi', 'bank_transfer', 'other']).optional(),
  transaction_id: z.string().max(100).optional(),
  paid_date: z.string().datetime().optional(),
});

// Types (inferred from schemas)
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
export type CreatePackageInput = z.infer<typeof createPackageSchema>;
export type MarkFeeAsPaidInput = z.infer<typeof markFeeAsPaidSchema>;
