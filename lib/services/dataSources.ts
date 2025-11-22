import {
  announcements as mockAnnouncements,
  careerSlots as mockCareerSlots,
  dataImportJobs as mockImportJobs,
  exchangeRequests as mockExchangeRequests,
  faqItems as mockFaqItems,
  monitorProfile as mockMonitorProfile,
  notificationTemplates as mockNotificationTemplates,
  pointTransactions as mockPointTransactions,
  policyDocuments as mockPolicyDocuments,
  referralStatus as mockReferralStatus,
  rewardItems as mockRewardItems,
  supportTickets as mockSupportTickets,
  surveys as mockSurveys
} from '@/lib/data/mock';
import type {
  Announcement,
  CareerConsultationSlot,
  DataImportJob,
  ExchangeRequest,
  FaqItem,
  MonitorProfile,
  NotificationTemplate,
  PointTransaction,
  PolicyDocument,
  ReferralStatus,
  RewardItem,
  SupportTicket,
  Survey,
  SurveyDetail,
  QuestionType
} from '@/lib/types';
import { getSupabaseServiceRole, isSupabaseConfigured } from '@/lib/services/supabaseServer';

export interface MonitorDashboardData {
  profile: MonitorProfile;
  surveys: Survey[];
  pointTransactions: PointTransaction[];
  rewardItems: RewardItem[];
  announcements: Announcement[];
  faqItems: FaqItem[];
  careerSlots: CareerConsultationSlot[];
  supportTickets: SupportTicket[];
  referralStatus: ReferralStatus;
  policyDocuments: PolicyDocument[];
}

export interface AdminDashboardData {
  announcements: Announcement[];
  faqItems: FaqItem[];
  notificationTemplates: NotificationTemplate[];
  dataImportJobs: DataImportJob[];
  exchangeRequests: ExchangeRequest[];
  policyDocuments: PolicyDocument[];
}

export interface ClientDashboardData {
  surveys: Survey[];
  totalSurveys: number;
  totalResponses: number;
  activeSurveys: number;
}

export interface SupportDashboardData {
  supportTickets: SupportTicket[];
  activeChats: number;
  pendingTickets: number;
}

const fallbackMonitor: MonitorDashboardData = {
  profile: mockMonitorProfile,
  surveys: mockSurveys,
  pointTransactions: mockPointTransactions,
  rewardItems: mockRewardItems,
  announcements: mockAnnouncements,
  faqItems: mockFaqItems,
  careerSlots: mockCareerSlots,
  supportTickets: mockSupportTickets,
  referralStatus: mockReferralStatus,
  policyDocuments: mockPolicyDocuments
};

const fallbackAdmin: AdminDashboardData = {
  announcements: mockAnnouncements,
  faqItems: mockFaqItems,
  notificationTemplates: mockNotificationTemplates,
  dataImportJobs: mockImportJobs,
  exchangeRequests: mockExchangeRequests,
  policyDocuments: mockPolicyDocuments
};

export async function fetchMonitorDashboardData(userId?: string): Promise<MonitorDashboardData> {
  if (!isSupabaseConfigured() || !userId) {
    console.warn('Supabase未設定またはuserIdが未指定。モックデータを返します。', { userId, isConfigured: isSupabaseConfigured() });
    return fallbackMonitor;
  }

  try {
    const supabase = getSupabaseServiceRole();
    
    // まずプロフィールを取得（必須）
    const profileRes = await supabase.from('monitor_profiles').select('*').eq('user_id', userId).single();
    
    if (profileRes.error || !profileRes.data) {
      console.error('プロフィール取得エラー:', profileRes.error || 'データが見つかりません');
      
      // プロフィールが取得できない場合、認証ユーザー情報を取得して最小限のプロフィールを作成
      try {
        const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
        
        if (authError || !authUser?.user) {
          console.error('認証ユーザー情報の取得に失敗:', authError);
          // 認証情報も取得できない場合はモックデータを返す
          return fallbackMonitor;
        }

        // 認証情報から最小限のプロフィールを作成
        const minimalProfile: MonitorProfile = {
          id: authUser.user.id,
          name: authUser.user.email?.split('@')[0] || 'ユーザー',
          email: authUser.user.email || '',
          occupation: '',
          age: 0,
          points: 0,
          referralCode: `KOECAN-${userId.substring(0, 8).toUpperCase()}`,
          referralCount: 0,
          referralPoints: 0,
          isLineLinked: false,
          pushOptIn: false,
          tags: [],
          updatedAt: new Date().toISOString()
        };

        console.warn('プロフィールが見つかりません。最小限のプロフィールを作成しました:', minimalProfile);

        // プロフィールが見つからない場合でも、最小限のプロフィールでダッシュボードを表示
        // 他のデータは空配列で返す
        return {
          profile: minimalProfile,
          surveys: [],
          pointTransactions: [],
          rewardItems: [],
          announcements: [],
          faqItems: [],
          careerSlots: [],
          supportTickets: [],
          referralStatus: {
            code: minimalProfile.referralCode,
            totalReferrals: 0,
            successfulReferrals: 0,
            pendingReferrals: 0,
            rewardPoints: 0,
            lastUpdated: new Date().toISOString()
          },
          policyDocuments: []
        };
      } catch (fallbackError) {
        console.error('フォールバック処理エラー:', fallbackError);
        return fallbackMonitor;
      }
    }

    const profileData = profileRes.data as any;
    
    console.log('プロフィールデータ取得成功:', {
      userId,
      profileName: profileData.name,
      profileEmail: profileData.email,
      referralCode: profileData.referral_code,
      allFields: Object.keys(profileData),
      rawData: profileData
    });

    // プロフィールが取得できたので、他のデータも取得（エラーがあっても続行）
    const [surveyRes, pointRes, rewardsRes, announcementRes, faqRes, careerRes, supportRes, referralRes, policyRes] =
      await Promise.all([
        supabase.from('surveys').select('*').order('ai_matching_score', { ascending: false }).limit(20),
        supabase.from('point_history').select('*').eq('user_id', userId).order('happened_at', { ascending: false }).limit(10),
        supabase.from('reward_items').select('*').order('points_required'),
        supabase.from('announcements').select('*').order('published_at', { ascending: false }).limit(10),
        supabase.from('faqs').select('*').order('updated_at', { ascending: false }).limit(10),
        supabase.from('career_slots').select('*').order('starts_at'),
        supabase.from('chat_messages').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('referral_codes').select('*').eq('user_id', userId).single(),
        supabase.from('policy_documents').select('*').order('updated_at', { ascending: false })
      ]);

    // プロフィールから紹介コードを取得（referral_statusesが取得できない場合のフォールバック）
    const referralCode = profileData.referral_code || '';
    let referralStatus: ReferralStatus;
    const referralResData = referralRes.data as any;
    const referralResError = referralRes.error;
    if (referralResData && !referralResError) {
      referralStatus = mapReferral(referralResData);
    } else {
      // プロフィールから紹介コードを使用してステータスを作成
      referralStatus = {
        code: referralCode,
        totalReferrals: profileData.referral_count || 0,
        successfulReferrals: 0,
        pendingReferrals: 0,
        rewardPoints: profileData.referral_points || 0,
        lastUpdated: new Date().toISOString()
      };
    }

    // プロフィールマッピング結果を確認
    const mappedProfile = mapProfile(profileData);
    console.log('プロフィールマッピング後:', {
      id: mappedProfile.id,
      name: mappedProfile.name,
      email: mappedProfile.email,
      occupation: mappedProfile.occupation
    });
    console.log('最終的に返すプロフィール:', {
      id: mappedProfile.id,
      name: mappedProfile.name,
      email: mappedProfile.email
    });

    return {
      profile: mappedProfile,
      surveys: (surveyRes.data ?? []).map(mapSurvey),
      pointTransactions: (pointRes.data ?? []).map(mapPointTransaction),
      rewardItems: (rewardsRes.data ?? []).map(mapReward),
      announcements: (announcementRes.data ?? []).map(mapAnnouncement),
      faqItems: (faqRes.data ?? []).map(mapFaq),
      careerSlots: (careerRes.data ?? []).map(mapCareerSlot),
      supportTickets: (supportRes.data ?? []).map(mapSupportTicket),
      referralStatus,
      policyDocuments: (policyRes.data ?? []).map(mapPolicyDocument)
    };
  } catch (error) {
    console.error('Supabase fetch failed. Falling back to mock data.', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      userId
    });
    return fallbackMonitor;
  }
}

export async function fetchAdminDashboardData(): Promise<AdminDashboardData> {
  if (!isSupabaseConfigured()) {
    return fallbackAdmin;
  }

  try {
    const supabase = getSupabaseServiceRole();
    const [announcementRes, faqRes, templateRes, importRes, exchangeRes, policyRes] = await Promise.all([
      supabase.from('announcements').select('*').order('published_at', { ascending: false }),
      supabase.from('faq_items').select('*').order('updated_at', { ascending: false }),
      supabase.from('notification_templates').select('*'),
      supabase.from('data_import_jobs').select('*').order('submitted_at', { ascending: false }),
      supabase.from('exchange_requests').select('*').order('requested_at', { ascending: false }),
      supabase.from('policy_documents').select('*').order('updated_at', { ascending: false })
    ]);

    const erroredBucket = [announcementRes, faqRes, templateRes, importRes, exchangeRes, policyRes].find((res) => res.error);
    if (erroredBucket) {
      throw erroredBucket.error;
    }

    return {
      announcements: (announcementRes.data ?? []).map(mapAnnouncement),
      faqItems: (faqRes.data ?? []).map(mapFaq),
      notificationTemplates: (templateRes.data ?? []).map(mapNotificationTemplate),
      dataImportJobs: (importRes.data ?? []).map(mapDataImportJob),
      exchangeRequests: (exchangeRes.data ?? []).map(mapExchangeRequest),
      policyDocuments: (policyRes.data ?? []).map(mapPolicyDocument)
    };
  } catch (error) {
    console.warn('Supabase admin fetch failed. Falling back to mock data.', error);
    return fallbackAdmin;
  }
}

const fallbackClient: ClientDashboardData = {
  surveys: mockSurveys,
  totalSurveys: mockSurveys.length,
  totalResponses: 0,
  activeSurveys: mockSurveys.filter((s) => s.status === 'open').length
};

export async function fetchClientDashboardData(userId?: string): Promise<ClientDashboardData> {
  if (!isSupabaseConfigured() || !userId) {
    return fallbackClient;
  }

  try {
    const supabase = getSupabaseServiceRole();
    const surveyRes = await supabase.from('surveys').select('*').eq('client_id', userId).order('created_at', { ascending: false });

    if (surveyRes.error) {
      throw surveyRes.error;
    }

    const surveys = (surveyRes.data ?? []).map(mapSurvey);
    return {
      surveys,
      totalSurveys: surveys.length,
      totalResponses: 0, // TODO: survey_responsesテーブルから集計
      activeSurveys: surveys.filter((s) => s.status === 'open').length
    };
  } catch (error) {
    console.warn('Supabase client fetch failed. Falling back to mock data.', error);
    return fallbackClient;
  }
}

const fallbackSupport: SupportDashboardData = {
  supportTickets: mockSupportTickets,
  activeChats: 0,
  pendingTickets: mockSupportTickets.filter((t) => t.status === 'waiting').length
};

export async function fetchSupportDashboardData(): Promise<SupportDashboardData> {
  if (!isSupabaseConfigured()) {
    return fallbackSupport;
  }

  try {
    const supabase = getSupabaseServiceRole();
    const ticketRes = await supabase.from('support_tickets').select('*').order('created_at', { ascending: false });

    if (ticketRes.error) {
      throw ticketRes.error;
    }

    const supportTickets = (ticketRes.data ?? []).map(mapSupportTicket);
    return {
      supportTickets,
      activeChats: 0, // TODO: chat_roomsテーブルから集計
      pendingTickets: supportTickets.filter((t) => t.status === 'waiting').length
    };
  } catch (error) {
    console.warn('Supabase support fetch failed. Falling back to mock data.', error);
    return fallbackSupport;
  }
}

export async function fetchSurveyDetail(surveyId: string, userId?: string): Promise<SurveyDetail | null> {
  // Supabase未設定の場合はモックデータを返す
  if (!isSupabaseConfigured()) {
    const mockSurvey = mockSurveys.find((s) => s.id === surveyId);
    if (!mockSurvey) {
      console.warn(`アンケートが見つかりません: ${surveyId}`);
      return null;
    }
    
    return {
      ...mockSurvey,
      description: 'このアンケートはサンプルです。実際の質問データはデータベースに保存されていません。',
      questions: [
        {
          id: 'q1',
          surveyId: surveyId,
          questionText: 'サンプル質問1: 単一選択',
          questionType: 'single_choice',
          isRequired: true,
          displayOrder: 1,
          options: [
            { id: 'opt1', optionText: '選択肢1', displayOrder: 1 },
            { id: 'opt2', optionText: '選択肢2', displayOrder: 2 },
            { id: 'opt3', optionText: '選択肢3', displayOrder: 3 }
          ]
        }
      ],
      hasAnswered: false
    };
  }

  try {
    const supabase = getSupabaseServiceRole();
    
    // アンケート基本情報を取得
    const { data: surveyData, error: surveyError } = await supabase
      .from('surveys')
      .select('*')
      .eq('id', surveyId)
      .single();

    if (surveyError || !surveyData) {
      return null;
    }

    // 質問と選択肢を取得（survey_questions, survey_question_options が存在する場合）
    // 現時点では、これらのテーブルが存在しない可能性があるため、モックデータを返す
    const survey = mapSurvey(surveyData);
    
    // 回答済みかどうかをチェック
    let hasAnswered = false;
    if (userId) {
      try {
        const { data: responseData } = await (supabase as any)
          .from('survey_responses')
          .select('id')
          .eq('survey_id', surveyId)
          .eq('user_id', userId)
          .single();
        hasAnswered = !!responseData;
      } catch (err) {
        // テーブルが存在しない場合は未回答として扱う
        hasAnswered = false;
      }
    }

    // 質問データを取得（survey_questions テーブルが存在する場合）
    let questions: any[] = [];
    try {
      const { data: questionData, error: questionError } = await (supabase as any)
        .from('survey_questions')
        .select('*, survey_question_options(*)')
        .eq('survey_id', surveyId)
        .order('display_order', { ascending: true });

      if (!questionError && questionData) {
        questions = questionData.map((q: any) => ({
          id: q.id,
          surveyId: surveyId,
          questionText: q.question_text,
          questionType: q.question_type,
          isRequired: q.is_required,
          displayOrder: q.display_order,
          options: (q.survey_question_options || []).map((opt: any, index: number) => ({
            id: opt.id,
            optionText: opt.option_text,
            displayOrder: opt.display_order || index
          }))
        }));
      }
    } catch (err) {
      console.warn('質問データの取得に失敗（テーブルが存在しない可能性）:', err);
      // テーブルが存在しない場合は空配列のまま
    }

    // 質問が存在しない場合はモック質問を追加（フォールバック）
    if (questions.length === 0) {
      questions = [
        {
          id: `q-${surveyId}-1`,
          surveyId: surveyId,
          questionText: 'このアンケートには質問が設定されていません。',
          questionType: 'text' as QuestionType,
          isRequired: false,
          displayOrder: 1,
          options: []
        }
      ];
    }

    return {
      ...survey,
      description: (surveyData as any).description || '',
      questions,
      hasAnswered
    };
  } catch (error) {
    console.warn('Supabase survey detail fetch failed:', error);
    return null;
  }
}

export interface SurveyResponseData {
  totalResponses: number;
  responseRate: number;
  lastResponseAt: string | null;
  averageResponseTime: string | null;
  responses: Array<{
    id: string;
    userId: string;
    submittedAt: string;
    answers: Array<{
      questionId: string;
      questionText: string;
      answerText?: string;
      answerNumber?: number;
    }>;
  }>;
}

export async function fetchSurveyResponses(surveyId: string): Promise<SurveyResponseData> {
  if (!isSupabaseConfigured()) {
    return {
      totalResponses: 0,
      responseRate: 0,
      lastResponseAt: null,
      averageResponseTime: null,
      responses: []
    };
  }

  try {
    const supabase = getSupabaseServiceRole();

    // 回答を取得
    let responses: any[] = [];
    try {
      const { data: responseData, error: responseError } = await (supabase as any)
        .from('survey_responses')
        .select('*')
        .eq('survey_id', surveyId)
        .order('submitted_at', { ascending: false });

      if (!responseError && responseData) {
        responses = responseData;
      }
    } catch (err) {
      console.warn('survey_responsesテーブルからの取得に失敗:', err);
    }

    // 個別回答を取得
    const responseIds = responses.map((r) => r.id);
    let answers: any[] = [];
    
    if (responseIds.length > 0) {
      try {
        const { data: answerData, error: answerError } = await (supabase as any)
          .from('survey_answers')
          .select('*')
          .in('response_id', responseIds);

        if (!answerError && answerData) {
          answers = answerData;
        }
      } catch (err) {
        console.warn('survey_answersテーブルからの取得に失敗:', err);
      }
    }

    // 質問情報を取得
    let questions: any[] = [];
    try {
      const { data: questionData, error: questionError } = await (supabase as any)
        .from('survey_questions')
        .select('id, question_text')
        .eq('survey_id', surveyId);

      if (!questionError && questionData) {
        questions = questionData;
      }
    } catch (err) {
      console.warn('survey_questionsテーブルからの取得に失敗:', err);
    }

    // 回答データを整形
    const formattedResponses = responses.map((response) => {
      const responseAnswers = answers.filter((a) => a.response_id === response.id);
      
      return {
        id: response.id,
        userId: response.user_id,
        submittedAt: response.submitted_at,
        answers: responseAnswers.map((answer: any) => {
          const question = questions.find((q) => q.id === answer.question_id);
          return {
            questionId: answer.question_id,
            questionText: question?.question_text || '質問が見つかりません',
            answerText: answer.answer_text,
            answerNumber: answer.answer_number
          };
        })
      };
    });

    // 回答率を計算（仮の値、実際はモニター総数が必要）
    const responseRate = responses.length > 0 ? Math.min(100, Math.round((responses.length / 100) * 100)) : 0;
    const lastResponseAt = responses.length > 0 ? responses[0].submitted_at : null;
    const averageResponseTime = null; // TODO: 回答時間の計算

    return {
      totalResponses: responses.length,
      responseRate,
      lastResponseAt,
      averageResponseTime,
      responses: formattedResponses
    };
  } catch (error) {
    console.warn('回答データの取得に失敗:', error);
    return {
      totalResponses: 0,
      responseRate: 0,
      lastResponseAt: null,
      averageResponseTime: null,
      responses: []
    };
  }
}

function mapProfile(row: any): MonitorProfile {
  return {
    id: row.user_id,
    name: row.name ?? '',
    email: row.email ?? '',
    university: row.university ?? undefined,
    occupation: row.occupation ?? '',
    age: row.age ?? 0,
    gender: row.gender ?? undefined,
    location: row.location ?? undefined,
    points: row.points ?? 0,
    referralCode: row.referral_code ?? '',
    referralCount: row.referral_count ?? 0,
    referralPoints: row.referral_points ?? 0,
    isLineLinked: row.is_line_linked ?? false,
    pushOptIn: row.push_opt_in ?? false,
    tags: row.tags ?? [],
    updatedAt: row.updated_at ?? new Date().toISOString()
  };
}

function mapSurvey(row: any): Survey {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    rewardPoints: row.reward_points,
    questions: row.questions,
    status: row.status,
    deadline: row.deadline,
    deliveryChannels: row.delivery_channels ?? [],
    targetTags: row.target_tags ?? [],
    aiMatchingScore: row.ai_matching_score ?? 0
  } as Survey;
}

function mapPointTransaction(row: any): PointTransaction {
  return {
    id: row.id,
    happenedAt: row.happened_at,
    amount: row.amount,
    reason: row.reason,
    description: row.description
  } as PointTransaction;
}

function mapReward(row: any): RewardItem {
  return {
    id: row.id,
    name: row.name,
    provider: row.provider,
    pointsRequired: row.points_required,
    delivery: row.delivery
  } as RewardItem;
}

function mapAnnouncement(row: any): Announcement {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    category: row.category,
    publishedAt: row.published_at,
    audience: row.audience ?? ['monitor']
  } as Announcement;
}

function mapFaq(row: any): FaqItem {
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    category: row.category,
    updatedAt: row.updated_at
  } as FaqItem;
}

function mapCareerSlot(row: any): CareerConsultationSlot {
  return {
    id: row.id,
    mentor: row.mentor,
    topic: row.topic,
    startsAt: row.starts_at,
    mode: row.mode,
    availableSeats: row.available_seats
  } as CareerConsultationSlot;
}

function mapSupportTicket(row: any): SupportTicket {
  return {
    id: row.id,
    subject: row.subject,
    channel: row.channel,
    priority: row.priority,
    status: row.status,
    createdAt: row.created_at
  } as SupportTicket;
}

function mapReferral(row: any): ReferralStatus {
  return {
    code: row.code,
    totalReferrals: row.total_referrals ?? 0,
    successfulReferrals: row.successful_referrals ?? 0,
    pendingReferrals: row.pending_referrals ?? 0,
    rewardPoints: row.reward_points ?? 0,
    lastUpdated: row.last_updated ?? new Date().toISOString()
  } as ReferralStatus;
}

function mapPolicyDocument(row: any): PolicyDocument {
  return {
    id: row.id,
    title: row.title,
    version: row.version,
    updatedAt: row.updated_at,
    url: row.url
  } as PolicyDocument;
}

function mapNotificationTemplate(row: any): NotificationTemplate {
  return {
    id: row.id,
    channel: row.channel,
    title: row.title,
    body: row.body,
    cta: row.cta ?? undefined
  } as NotificationTemplate;
}

function mapDataImportJob(row: any): DataImportJob {
  return {
    id: row.id,
    type: row.type,
    entity: row.entity,
    status: row.status,
    submittedBy: row.submitted_by,
    submittedAt: row.submitted_at
  } as DataImportJob;
}

function mapExchangeRequest(row: any): ExchangeRequest {
  return {
    id: row.id,
    userName: row.user_name,
    rewardName: row.reward_name,
    pointsUsed: row.points_used,
    provider: row.provider,
    status: row.status,
    requestedAt: row.requested_at
  } as ExchangeRequest;
}
