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

export type QuestionType = 'single_choice' | 'multiple_choice' | 'text' | 'number' | 'rating' | 'ranking';

export interface SurveyQuestionOption {
  id: string;
  optionText: string;
  displayOrder: number;
}

export interface SurveyQuestion {
  id: string;
  surveyId: string;
  questionText: string;
  questionType: QuestionType;
  isRequired: boolean;
  displayOrder: number;
  options: SurveyQuestionOption[];
}

export interface SurveyDetail extends Omit<Survey, 'questions'> {
  description?: string;
  questions: SurveyQuestion[];
  hasAnswered: boolean;
}

export interface SurveyAnswer {
  questionId: string;
  answerText?: string;
  answerNumber?: number;
  selectedOptionIds?: string[];
}

// MonitorDashboard.tsxで使用される型定義
export interface Question {
  id: string;
  survey_id: string;
  question_text: string;
  question_type: 'text' | 'multiple_choice' | 'rating' | 'yes_no';
  is_multiple_select?: boolean;
  required: boolean;
  order_index: number;
  options?: string[];
}

export interface Answer {
  question_id: string;
  answer: string;
}

export interface Advertisement {
  id: string;
  company_name?: string;
  title?: string;
  description?: string;
  company_vision?: string;
  image_url?: string;
  representative_name?: string;
  establishment_year?: string;
  headquarters_location?: string;
  branch_office_location?: string;
  employee_count?: string;
  employee_gender_ratio?: string;
  employee_avg_age?: string;
  industries?: string;
  highlight_point_1?: string;
  highlight_point_2?: string;
  highlight_point_3?: string;
  starting_salary?: string;
  three_year_retention_rate?: string;
  avg_annual_income_20s?: string;
  avg_annual_income_30s?: string;
  promotion_model_case?: string;
  recruitment_roles_count?: string;
  selection_flow_steps?: string[];
  required_qualifications?: string;
  working_hours?: string;
  holidays?: string;
  annual_holidays?: string;
  remote_work_available?: boolean;
  side_job_allowed?: boolean;
  housing_allowance_available?: boolean;
  female_parental_leave_rate?: string;
  male_parental_leave_rate?: string;
  transfer_existence?: boolean;
  transfer_frequency?: string;
  internal_event_frequency?: string;
  health_management_practices?: string;
  must_tell_welfare?: string;
  recruitment_department?: string;
  recruitment_contact?: string;
  recruitment_info_page_url?: string;
  internship_scheduled?: boolean;
  internship_schedule?: string;
  internship_capacity?: string;
  internship_target_students?: string;
  internship_locations?: string;
  internship_content_types?: string;
  internship_paid_unpaid?: string;
  transport_lodging_stipend?: boolean;
  internship_application_url?: string;
  official_website_url?: string;
  official_line_url?: string;
  instagram_url?: string;
  tiktok_url?: string;
  other_sns_sites?: string;
  is_active?: boolean;
  priority?: number;
  display_order?: number;
}
