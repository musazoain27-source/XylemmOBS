import { z } from 'zod';

const category = z.enum([
  'recording', 'video', 'encoder', 'audio', 'replay_buffer',
  'overlays', 'performance', 'compatibility', 'installation', 'other',
]);

export const questionSchema = z.object({
  username: z.string().trim().min(2, 'Username must be at least 2 characters').max(40),
  email: z.union([z.string().trim().email('Enter a valid email'), z.literal('')]).optional(),
  title: z.string().trim().min(5, 'Title must be at least 5 characters').max(150),
  details: z.string().trim().min(15, 'Please give a bit more detail').max(5000),
  minecraft_version: z.string().trim().min(1, 'Required').max(30),
  xylemmobs_version: z.string().trim().min(1, 'Required').max(30),
  category,
});
export type QuestionInput = z.infer<typeof questionSchema>;

export const issueSchema = z.object({
  username: z.string().trim().min(2).max(40),
  email: z.union([z.string().trim().email('Enter a valid email'), z.literal('')]).optional(),
  title: z.string().trim().min(5).max(150),
  description: z.string().trim().min(15).max(6000),
  minecraft_version: z.string().trim().min(1).max(30),
  xylemmobs_version: z.string().trim().min(1).max(30),
  operating_system: z.string().trim().min(1).max(80),
  gpu: z.string().trim().min(1).max(120),
  cpu: z.string().trim().max(120).optional(),
  error_message: z.string().trim().max(2000).optional(),
  steps_to_reproduce: z.string().trim().min(10).max(4000),
  expected_result: z.string().trim().min(5).max(2000),
  actual_result: z.string().trim().min(5).max(2000),
  priority: z.enum(['low', 'medium', 'high']),
});
export type IssueInput = z.infer<typeof issueSchema>;

export const featureRequestSchema = z.object({
  username: z.string().trim().min(2).max(40),
  title: z.string().trim().min(5).max(150),
  description: z.string().trim().min(15).max(5000),
  usefulness: z.string().trim().min(10).max(2000),
  category,
  xylemmobs_version: z.string().trim().min(1).max(30),
});
export type FeatureRequestInput = z.infer<typeof featureRequestSchema>;

export const replySchema = z.object({
  post_type: z.enum(['question', 'issue', 'feature_request']),
  post_id: z.string().uuid(),
  username: z.string().trim().min(2).max(40),
  body: z.string().trim().min(2, 'Reply cannot be empty').max(3000),
});
export type ReplyInput = z.infer<typeof replySchema>;

export const adminLoginSchema = z.object({
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;

export const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
export const ALLOWED_LOG_TYPES = ['text/plain', 'text/x-log', 'application/octet-stream'];
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB
export const MAX_LOG_BYTES = 15 * 1024 * 1024; // 15 MB
export const MAX_ATTACHMENTS_PER_ISSUE = 6;
