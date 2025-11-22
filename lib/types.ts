export type UserRole = 'monitor' | 'client' | 'admin' | 'support';

export interface MonitorProfile {
  id: string;
  name: string;
  email: string;
  university?: string;
  occupation: string;
  age: number;
  gender?: string;
  location?: string;
  points: number;
  referralCode: string;
  referralCount: number;
  referralPoints: number;
  isLineLinked: boolean;
  pushOptIn: boolean;
  tags: string[];
  updatedAt: string;
}

export type SurveyCategory = 'daily' | 'campaign' | 'career' | 'premium';
export type SurveyStatus = 'open' | 'closed' | 'scheduled';

export interface Survey {
  id: string;
  title: string;
  category: SurveyCategory;
  rewardPoints: number;
  questions: number;
  status: SurveyStatus;
  deadline: string;
  deliveryChannels: ('web' | 'line' | 'push')[];
  targetTags: string[];
  aiMatchingScore: number;
}

export interface PointTransaction {
  id: string;
  happenedAt: string;
  amount: number;
  reason: 'survey' | 'referral' | 'exchange' | 'bonus';
  description: string;
}

export interface RewardItem {
  id: string;
  name: string;
  provider: string;
  pointsRequired: number;
  delivery: 'code' | 'cash' | 'point';
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  category: 'survey' | 'campaign' | 'system' | 'maintenance';
  publishedAt: string;
  audience: UserRole[];
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: 'account' | 'survey' | 'points' | 'technical' | 'referral';
  updatedAt: string;
}

export interface ReferralStatus {
  code: string;
  totalReferrals: number;
  successfulReferrals: number;
  pendingReferrals: number;
  rewardPoints: number;
  lastUpdated: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  channel: 'chat' | 'email';
  priority: 'low' | 'medium' | 'high';
  status: 'waiting' | 'responding' | 'resolved';
  createdAt: string;
}

export interface CareerConsultationSlot {
  id: string;
  mentor: string;
  topic: string;
  startsAt: string;
  mode: 'online' | 'offline';
  availableSeats: number;
}

export interface NotificationTemplate {
  id: string;
  channel: 'line' | 'push' | 'email';
  title: string;
  body: string;
  cta?: string;
}

export interface DataImportJob {
  id: string;
  type: 'markdown' | 'csv';
  entity: 'faq' | 'survey' | 'announcement' | 'reward';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  submittedBy: string;
  submittedAt: string;
}

export interface ExchangeRequest {
  id: string;
  userName: string;
  rewardName: string;
  pointsUsed: number;
  provider: string;
  status: 'processing' | 'fulfilled' | 'error';
  requestedAt: string;
}

export interface PolicyDocument {
  id: string;
  title: string;
  version: string;
  updatedAt: string;
  url: string;
}
