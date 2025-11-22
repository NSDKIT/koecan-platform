import {
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
  Survey
} from '@/lib/types';

export const monitorProfile: MonitorProfile = {
  id: 'user-001',
  name: '田中 未来',
  email: 'mirai@example.com',
  university: '声キャン大学',
  occupation: '大学4年生',
  age: 22,
  gender: '女性',
  location: '東京都',
  points: 1280,
  referralCode: 'KOECAN-9X2FJ7L3',
  referralCount: 12,
  referralPoints: 2400,
  isLineLinked: true,
  pushOptIn: true,
  tags: ['マーケティング', '首都圏', '23卒'],
  updatedAt: '2025-11-20T12:00:00+09:00'
};

export const surveys: Survey[] = [
  {
    id: 'survey-daily-001',
    title: 'デイリー：今日の気分チェック',
    category: 'daily',
    rewardPoints: 10,
    questions: 5,
    status: 'open',
    deadline: '2025-11-30T23:59:59+09:00',
    deliveryChannels: ['web', 'push'],
    targetTags: ['全体'],
    aiMatchingScore: 0.6
  },
  {
    id: 'survey-career-010',
    title: '就活の価値観アンケート',
    category: 'career',
    rewardPoints: 60,
    questions: 12,
    status: 'open',
    deadline: '2025-12-05T23:59:59+09:00',
    deliveryChannels: ['web', 'line', 'push'],
    targetTags: ['23卒', 'マーケティング'],
    aiMatchingScore: 0.92
  },
  {
    id: 'survey-premium-003',
    title: '新規サービス体験ヒアリング',
    category: 'premium',
    rewardPoints: 200,
    questions: 20,
    status: 'scheduled',
    deadline: '2025-12-15T23:59:59+09:00',
    deliveryChannels: ['web'],
    targetTags: ['ハイモチベ', '首都圏'],
    aiMatchingScore: 0.74
  }
];

export const pointTransactions: PointTransaction[] = [
  {
    id: 'ptx-001',
    happenedAt: '2025-11-22T10:12:00+09:00',
    amount: 60,
    reason: 'survey',
    description: '就活の価値観アンケート'
  },
  {
    id: 'ptx-002',
    happenedAt: '2025-11-21T21:00:00+09:00',
    amount: 200,
    reason: 'referral',
    description: '友達紹介成功（山田さん）'
  },
  {
    id: 'ptx-003',
    happenedAt: '2025-11-20T08:30:00+09:00',
    amount: -500,
    reason: 'exchange',
    description: 'PeX経由 500pt交換'
  }
];

export const rewardItems: RewardItem[] = [
  {
    id: 'reward-pex-001',
    name: 'PeXポイント 500pt',
    provider: 'PeX API',
    pointsRequired: 500,
    delivery: 'point'
  },
  {
    id: 'reward-amazon-1000',
    name: 'Amazonギフト券 1,000円分',
    provider: 'ドットマネー',
    pointsRequired: 1000,
    delivery: 'code'
  },
  {
    id: 'reward-bank-5000',
    name: '銀行振込 5,000円',
    provider: 'PeX API',
    pointsRequired: 5000,
    delivery: 'cash'
  }
];

export const announcements: Announcement[] = [
  {
    id: 'ann-001',
    title: '友達紹介キャンペーン2倍',
    body: '11/30まで紹介ポイントが2倍（400pt）になります。',
    category: 'campaign',
    publishedAt: '2025-11-20T09:00:00+09:00',
    audience: ['monitor']
  },
  {
    id: 'ann-002',
    title: 'メンテナンス予定',
    body: '12/1 3:00-5:00でシステムメンテナンスを実施します。',
    category: 'system',
    publishedAt: '2025-11-19T18:00:00+09:00',
    audience: ['monitor', 'client']
  }
];

export const faqItems: FaqItem[] = [
  {
    id: 'faq-001',
    question: '友達紹介ポイントはいつ反映されますか？',
    answer: '被紹介者のメール認証完了後、自動で200ptが付与されます。',
    category: 'referral',
    updatedAt: '2025-11-18T12:00:00+09:00'
  },
  {
    id: 'faq-002',
    question: 'LINE連携を解除したい。',
    answer: 'マイページ > 通知設定から解除できます。再連携も同じ画面から可能です。',
    category: 'technical',
    updatedAt: '2025-11-17T13:10:00+09:00'
  }
];

export const referralStatus: ReferralStatus = {
  code: monitorProfile.referralCode,
  totalReferrals: 15,
  successfulReferrals: 12,
  pendingReferrals: 3,
  rewardPoints: 2400,
  lastUpdated: '2025-11-22T09:00:00+09:00'
};

export const supportTickets: SupportTicket[] = [
  {
    id: 'ticket-001',
    subject: 'LINE通知が届かない',
    channel: 'chat',
    priority: 'medium',
    status: 'responding',
    createdAt: '2025-11-21T11:05:00+09:00'
  },
  {
    id: 'ticket-002',
    subject: '友達紹介の不正疑い',
    channel: 'email',
    priority: 'high',
    status: 'waiting',
    createdAt: '2025-11-20T22:10:00+09:00'
  }
];

export const careerSlots: CareerConsultationSlot[] = [
  {
    id: 'career-001',
    mentor: 'キャリアアドバイザー高橋',
    topic: 'マーケティング業界研究',
    startsAt: '2025-11-25T20:00:00+09:00',
    mode: 'online',
    availableSeats: 3
  },
  {
    id: 'career-002',
    mentor: 'OB訪問：佐藤',
    topic: '外資コンサルの働き方',
    startsAt: '2025-11-27T19:00:00+09:00',
    mode: 'online',
    availableSeats: 1
  }
];

export const notificationTemplates: NotificationTemplate[] = [
  {
    id: 'notify-line-001',
    channel: 'line',
    title: '新着アンケートのお知らせ',
    body: 'AIマッチング90%以上のアンケートが公開されました。',
    cta: '今すぐ回答'
  },
  {
    id: 'notify-push-001',
    channel: 'push',
    title: 'ポイント交換完了',
    body: 'PeX経由で500ptを交換しました。'
  }
];

export const dataImportJobs: DataImportJob[] = [
  {
    id: 'import-001',
    type: 'markdown',
    entity: 'faq',
    status: 'completed',
    submittedBy: 'admin@koekyan.example.com',
    submittedAt: '2025-11-18T14:00:00+09:00'
  },
  {
    id: 'import-002',
    type: 'csv',
    entity: 'survey',
    status: 'processing',
    submittedBy: 'client@koekyan.example.com',
    submittedAt: '2025-11-22T08:30:00+09:00'
  }
];

export const exchangeRequests: ExchangeRequest[] = [
  {
    id: 'exchange-001',
    userName: '田中 未来',
    rewardName: 'PeXポイント 500pt',
    pointsUsed: 500,
    provider: 'PeX API',
    status: 'fulfilled',
    requestedAt: '2025-11-20T08:30:00+09:00'
  },
  {
    id: 'exchange-002',
    userName: '鈴木 翔',
    rewardName: 'Amazonギフト券 1,000円分',
    pointsUsed: 1000,
    provider: 'ドットマネー',
    status: 'processing',
    requestedAt: '2025-11-22T11:30:00+09:00'
  }
];

export const policyDocuments: PolicyDocument[] = [
  {
    id: 'policy-terms',
    title: '利用規約',
    version: 'v2.0',
    updatedAt: '2025-11-15',
    url: '/docs/terms-v2.pdf'
  },
  {
    id: 'policy-privacy',
    title: 'プライバシーポリシー',
    version: 'v2.0',
    updatedAt: '2025-11-15',
    url: '/docs/privacy-v2.pdf'
  }
];
