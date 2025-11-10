import { z } from 'zod';

// Login Schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters long'),
});

// Sign Up Schema
export const signUpSchema = z.object({
  name: z
    .string()
    .min(1, 'Full name is required')
    .min(2, 'Name must be at least 2 characters long')
    .max(50, 'Name must be less than 50 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Forgot Password Schema
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
});

// Reset Password Schema
export const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(1, 'New password is required')
    .min(6, 'Password must be at least 6 characters long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Create Post Schema
export const createPostSchema = z.object({
  content: z
    .string()
    .min(1, 'Post content is required')
    .max(500, 'Post content must be less than 500 characters'),
});

// Profile Update Schema
export const profileUpdateSchema = z.object({
  displayName: z
    .string()
    .min(1, 'Display name is required')
    .min(2, 'Display name must be at least 2 characters long')
    .max(50, 'Display name must be less than 50 characters'),
  username: z
    .string()
    .min(1, 'Username is required')
    .min(3, 'Username must be at least 3 characters long')
    .max(30, 'Username must be less than 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  bio: z
    .string()
    .max(150, 'Bio must be less than 150 characters')
    .optional(),
  website: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
});

// Comment Schema
export const commentSchema = z.object({
  content: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(500, 'Comment must be less than 500 characters'),
});

// Message Schema
export const messageSchema = z.object({
  content: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(1000, 'Message must be less than 1000 characters'),
});

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type CreatePostFormData = z.infer<typeof createPostSchema>;
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
export type CommentFormData = z.infer<typeof commentSchema>;
export type MessageFormData = z.infer<typeof messageSchema>;