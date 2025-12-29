/**
 * Centralized Type Definitions
 *
 * Shared types used across the frontend application.
 * Reduces duplication and ensures consistency.
 */

// ============================================================================
// User Types
// ============================================================================

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  role: 'player' | 'commissioner' | 'admin';
  avatar_url?: string;
  phone?: string;
  phone_verified?: boolean;
  notification_email?: boolean;
  notification_sms?: boolean;
  notification_push?: boolean;
  timezone?: string;
  created_at?: string;
}

// ============================================================================
// Season Types
// ============================================================================

export interface Season {
  id: string;
  number: number;
  name: string;
  is_active: boolean;
  registration_opens_at: string;
  registration_closes_at: string;
  draft_order_deadline: string;
  draft_deadline: string;
  premiere_at: string;
  finale_at?: string;
}

// ============================================================================
// Episode Types
// ============================================================================

export interface Episode {
  id: string;
  season_id: string;
  number: number;
  week_number: number;
  title: string | null;
  air_date: string;
  picks_lock_at: string;
  results_posted_at: string | null;
  waiver_opens_at: string | null;
  waiver_closes_at: string | null;
  is_finale: boolean | null;
  is_scored: boolean | null;
  results_released_at: string | null;
}

// ============================================================================
// Castaway Types
// ============================================================================

export type CastawayStatus = 'active' | 'eliminated' | 'winner';

export interface Castaway {
  id: string;
  season_id: string;
  name: string;
  age: number | null;
  hometown: string | null;
  occupation: string | null;
  photo_url: string | null;
  tribe_original: string | null;
  status: CastawayStatus;
  placement: number | null;
  eliminated_episode_id: string | null;
  previous_seasons: string[] | null;
  best_placement: number | null;
  fun_fact: string | null;
}

// ============================================================================
// League Types
// ============================================================================

export type LeagueStatus = 'forming' | 'drafting' | 'active' | 'completed';
export type DraftStatus = 'pending' | 'in_progress' | 'completed';

export interface League {
  id: string;
  season_id: string;
  name: string;
  code: string;
  status: LeagueStatus;
  is_global: boolean;
  is_public: boolean;
  is_closed?: boolean | null; // Optional, might be derived
  commissioner_id: string;
  max_players: number;
  require_donation: boolean;
  donation_amount?: number | null;
  donation_notes?: string | null;
  payout_method?: string | null;
  draft_status: DraftStatus | null;
  draft_order?: string[] | null; // Array of user IDs
  draft_started_at?: string | null;
  draft_completed_at?: string | null;
  password_hash?: string | null;
  created_at?: string;
  updated_at?: string;
  description?: string | null;
  photo_url?: string | null;
  // Join properties
  commissioner?: {
    id: string;
    display_name: string;
  };
  seasons?: Season;
}

export interface LeagueMembership {
  id: string;
  league_id: string;
  user_id: string;
  total_points: number;
  rank: number | null;
  draft_position?: number | null;
  is_eliminated?: boolean | null;
  joined_at?: string;
  league?: League;
  user?: UserProfile;
}

export interface LeagueWithSeason extends League {
  seasons?: Season;
}

// ============================================================================
// Roster & Pick Types
// ============================================================================

export interface RosterEntry {
  id: string;
  league_id: string;
  user_id: string;
  castaway_id: string;
  draft_round: number | null;
  draft_pick: number | null;
  acquired_via: string;
  acquired_at?: string;
  dropped_at?: string | null;
  castaways?: Castaway;
}

export type PickStatus = 'pending' | 'locked' | 'auto_picked';

export interface WeeklyPick {
  id: string;
  league_id: string;
  user_id: string;
  episode_id: string;
  castaway_id: string | null;
  status: PickStatus;
  points_earned?: number;
  picked_at?: string;
  locked_at?: string;
  created_at?: string;
  castaways?: Castaway;
  episode?: Episode;
}

// ============================================================================
// Scoring Types
// ============================================================================

export interface ScoringRule {
  id: string;
  season_id: string;
  code: string;
  name: string;
  description?: string | null;
  category: string;
  points: number;
  is_active: boolean | null;
  is_negative: boolean | null;
  sort_order?: number | null;
}

export interface EpisodeScore {
  id: string;
  episode_id: string;
  castaway_id: string;
  scoring_rule_id: string;
  quantity: number;
  points: number;
  notes?: string;
  entered_by?: string;
  created_at?: string;
}

export interface ScoringSession {
  id: string;
  episode_id: string;
  user_id: string;
  started_at: string;
  completed_at?: string;
  scores: Record<string, Record<string, number>>;
}

// ============================================================================
// Game Phase Types
// ============================================================================

export type GamePhase =
  | 'pre_registration'
  | 'registration'
  | 'pre_draft'
  | 'draft'
  | 'pre_season'
  | 'active'
  | 'post_season';

export type WeeklyPhase = 'make_pick' | 'picks_locked' | 'awaiting_results' | 'results_posted';

export interface WeeklyPhaseInfo {
  phase: WeeklyPhase;
  label: string;
  description: string;
  ctaLabel: string;
  ctaPath: string;
  color: 'burgundy' | 'orange' | 'amber' | 'green' | 'blue';
  countdown?: { label: string; targetTime: Date };
}

// ============================================================================
// Payment Types
// ============================================================================

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Payment {
  id: string;
  user_id: string;
  league_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  stripe_session_id?: string;
  stripe_payment_intent_id?: string;
  stripe_refund_id?: string;
  refunded_at?: string;
  created_at: string;
}

// ============================================================================
// Notification Types
// ============================================================================

export type NotificationType = 'email' | 'sms' | 'push';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  subject: string;
  body: string;
  sent_at?: string;
  created_at: string;
}

// ============================================================================
// Admin/Stats Types
// ============================================================================

export interface DashboardStats {
  totalUsers: number;
  activeLeagues: number;
  totalPicks: number;
  activeCastaways: number;
}

export interface SystemHealth {
  database: 'healthy' | 'degraded' | 'down';
  scheduler: 'running' | 'stopped';
  emailQueue: number;
  lastJobRun?: string;
}

// ============================================================================
// Notification Preferences Types
// ============================================================================

export interface NotificationPreferences {
  id: string;
  user_id: string;
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
  spoiler_delay_hours: number;
  created_at?: string;
  updated_at?: string;
}

// ============================================================================
// Legacy/Alias Types (for backward compatibility)
// ============================================================================

// Alias for components still using 'Roster' name
export type Roster = RosterEntry;

// Alias for LeagueMember
export type LeagueMember = LeagueMembership;
