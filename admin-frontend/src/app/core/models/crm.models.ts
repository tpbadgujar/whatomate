export type ThemeMode = 'dark' | 'light';
export type AccentPalette = 'ember' | 'cobalt' | 'emerald' | 'rose';
export type TimeframeKey = '7d' | '30d' | '90d' | '12m';
export type DealStage = 'Discovery' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Closed Won';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  workspace: string;
  initials: string;
  status: 'online' | 'focus' | 'away';
}

export interface NavItem {
  label: string;
  route: string;
  icon: string;
  badge?: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export interface KpiMetric {
  id: string;
  label: string;
  value: string;
  delta: string;
  comparison: string;
  trend: 'up' | 'down';
}

export interface AnalyticsPoint {
  label: string;
  revenue: number;
  pipeline: number;
  target: number;
}

export interface PipelineStageSummary {
  stage: DealStage;
  count: number;
  value: number;
  sharePercent: number;
  gradient: string;
}

export interface Deal {
  id: string;
  title: string;
  company: string;
  owner: string;
  ownerInitials: string;
  value: number;
  stage: DealStage;
  probability: number;
  closeDate: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  company: string;
  email: string;
  phone: string;
  status: 'Active' | 'Warm' | 'Lead';
  ltv: number;
  lastTouch: string;
  initials: string;
}

export interface ActivityItem {
  id: string;
  type: 'deal' | 'call' | 'email' | 'meeting';
  title: string;
  detail: string;
  actor: string;
  time: string;
}
