// Hand-written types mirroring supabase/schema.sql. If you change the
// schema, update this file (or generate it with `supabase gen types`).

export type UserRole = 'user' | 'admin';

export type QuestionStatus = 'waiting_for_answer' | 'answered' | 'closed';

export type IssueStatus =
  | 'open'
  | 'in_review'
  | 'need_more_info'
  | 'confirmed'
  | 'working_on_fix'
  | 'fixed'
  | 'cannot_reproduce'
  | 'closed';

export type IssuePriority = 'low' | 'medium' | 'high' | 'critical';

export type FeatureStatus =
  | 'submitted'
  | 'under_review'
  | 'planned'
  | 'maybe_later'
  | 'added'
  | 'rejected';

export type CategoryType =
  | 'recording'
  | 'video'
  | 'encoder'
  | 'audio'
  | 'replay_buffer'
  | 'overlays'
  | 'performance'
  | 'compatibility'
  | 'installation'
  | 'other';

export type PostType = 'question' | 'issue' | 'feature_request';

export interface Profile {
  user_id: string;
  username: string;
  email: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  public_id: string;
  user_id: string | null;
  username: string;
  email: string | null;
  title: string;
  details: string;
  minecraft_version: string;
  xylemmobs_version: string;
  category: CategoryType;
  status: QuestionStatus;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface Issue {
  id: string;
  public_id: string;
  user_id: string | null;
  username: string;
  email: string | null;
  title: string;
  description: string;
  minecraft_version: string;
  xylemmobs_version: string;
  operating_system: string;
  gpu: string;
  cpu: string | null;
  error_message: string | null;
  steps_to_reproduce: string;
  expected_result: string;
  actual_result: string;
  priority: IssuePriority;
  status: IssueStatus;
  is_known_issue: boolean;
  is_duplicate_of: string | null;
  assigned_admin_id: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface FeatureRequest {
  id: string;
  public_id: string;
  user_id: string | null;
  username: string;
  title: string;
  description: string;
  usefulness: string;
  category: CategoryType;
  xylemmobs_version: string;
  status: FeatureStatus;
  upvote_count: number;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface Reply {
  id: string;
  post_type: PostType;
  question_id: string | null;
  issue_id: string | null;
  feature_request_id: string | null;
  user_id: string | null;
  username: string;
  body: string;
  is_official: boolean;
  is_deleted: boolean;
  created_at: string;
}

export interface Attachment {
  id: string;
  issue_id: string;
  file_name: string;
  storage_path: string;
  mime_type: string;
  file_size: number;
  kind: 'screenshot' | 'log';
  created_at: string;
}

export interface AdminNote {
  id: string;
  issue_id: string;
  admin_id: string;
  admin_username: string;
  note: string;
  created_at: string;
}

export interface Notification {
  id: string;
  target: 'admin' | 'user';
  recipient_id: string | null;
  title: string;
  body: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export interface IssueAssignment {
  id: string;
  issue_id: string;
  admin_id: string;
  admin_username: string;
  assigned_by: string | null;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  admin_id: string | null;
  admin_username: string;
  action: string;
  target_type: string;
  target_public_id: string | null;
  target_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

export const CATEGORY_LABELS: Record<CategoryType, string> = {
  recording: 'Recording',
  video: 'Video',
  encoder: 'Encoder',
  audio: 'Audio',
  replay_buffer: 'Replay Buffer',
  overlays: 'Overlays',
  performance: 'Performance',
  compatibility: 'Compatibility',
  installation: 'Installation',
  other: 'Other',
};

export const QUESTION_STATUS_LABELS: Record<QuestionStatus, string> = {
  waiting_for_answer: 'Waiting for Answer',
  answered: 'Answered',
  closed: 'Closed',
};

export const ISSUE_STATUS_LABELS: Record<IssueStatus, string> = {
  open: 'Open',
  in_review: 'In Review',
  need_more_info: 'Need More Information',
  confirmed: 'Confirmed',
  working_on_fix: 'Working on Fix',
  fixed: 'Fixed',
  cannot_reproduce: 'Cannot Reproduce',
  closed: 'Closed',
};

export const ISSUE_PRIORITY_LABELS: Record<IssuePriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export const FEATURE_STATUS_LABELS: Record<FeatureStatus, string> = {
  submitted: 'Submitted',
  under_review: 'Under Review',
  planned: 'Planned',
  maybe_later: 'Maybe Later',
  added: 'Added',
  rejected: 'Rejected',
};
