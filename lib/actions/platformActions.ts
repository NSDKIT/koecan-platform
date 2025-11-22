'use server';

import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { clientForServerAction } from '@/lib/services/supabaseAuth';
import { getSupabaseServiceRole, isSupabaseConfigured } from '@/lib/services/supabaseServer';
import { requestPexExchange } from '@/lib/integrations/pex';
import { sendLineNotification } from '@/lib/integrations/line';
import { sendPushNotification } from '@/lib/integrations/fcm';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  referralCode: z.string().min(5).optional()
});

const announcementSchema = z.object({
  title: z.string().min(3),
  body: z.string().min(10),
  category: z.enum(['survey', 'campaign', 'system', 'maintenance']).default('campaign'),
  audience: z.array(z.enum(['monitor', 'client', 'admin', 'support']))
});

const faqSchema = z.object({
  question: z.string().min(5),
  answer: z.string().min(5),
  category: z.enum(['account', 'survey', 'points', 'technical', 'referral'])
});

const notificationSchema = z.object({
  channel: z.enum(['line', 'push', 'email']),
  title: z.string().min(3),
  body: z.string().min(5),
  cta: z.string().optional()
});

export async function loginAction(formData: FormData) {
  const payload = loginSchema.parse({
    email: formData.get('email'),
    password: formData.get('password')
  });
  const supabase = clientForServerAction();
  const { data, error } = await supabase.auth.signInWithPassword(payload);
  if (error) {
    return { success: false, message: error.message };
  }
  
  // ユーザーのロールを取得（user_metadataから取得、なければデフォルトでmonitor）
  const role = (data.user.user_metadata?.role || 'monitor') as 'monitor' | 'client' | 'admin' | 'support';
  
  // ロールに応じてリダイレクト先を決定
  switch (role) {
    case 'admin':
      redirect('/admin');
      break;
    case 'client':
      redirect('/client');
      break;
    case 'support':
      redirect('/support');
      break;
    case 'monitor':
    default:
      redirect('/dashboard');
      break;
  }
}

export async function registerAction(formData: FormData) {
  const payload = registerSchema.parse({
    email: formData.get('email'),
    password: formData.get('password'),
    referralCode: formData.get('referralCode') ?? undefined
  });
  const supabase = clientForServerAction();
  const { error } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: {
      data: { referral_code: payload.referralCode }
    }
  });
  if (error) {
    return { success: false, message: error.message };
  }
  return { success: true, message: '仮登録完了。メールをご確認ください。' };
}

export async function createAnnouncement(data: unknown) {
  const payload = announcementSchema.parse(data);
  if (!isSupabaseConfigured()) {
    return { success: false, message: 'Supabase未設定のため保存できません。' };
  }
  const supabase = getSupabaseServiceRole();
  const { error } = await supabase.from('announcements').insert({
    title: payload.title,
    body: payload.body,
    category: payload.category,
    audience: payload.audience,
    published_at: new Date().toISOString()
  });
  if (error) {
    return { success: false, message: error.message };
  }

  await Promise.all([
    sendLineNotification({
      to: ['monitor'],
      messages: [{ type: 'text', text: `${payload.title}\n${payload.body}` }]
    }).catch(() => undefined),
    sendPushNotification(['demo-token'], { title: payload.title, body: payload.body }).catch(() => undefined)
  ]);

  revalidatePath('/admin');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function createFaq(data: unknown) {
  const payload = faqSchema.parse(data);
  if (!isSupabaseConfigured()) {
    return { success: false, message: 'Supabase未設定のため保存できません。' };
  }
  const supabase = getSupabaseServiceRole();
  const { error } = await supabase.from('faq_items').insert({
    question: payload.question,
    answer: payload.answer,
    category: payload.category,
    updated_at: new Date().toISOString()
  });
  if (error) {
    return { success: false, message: error.message };
  }
  revalidatePath('/admin');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function scheduleNotification(data: unknown) {
  const payload = notificationSchema.parse(data);
  if (payload.channel === 'line') {
    await sendLineNotification({
      to: ['monitor'],
      messages: [{ type: 'text', text: `${payload.title}\n${payload.body}` }]
    }).catch((error) => console.error(error));
  }
  if (payload.channel === 'push') {
    await sendPushNotification(['demo-token'], { title: payload.title, body: payload.body }).catch((error) => console.error(error));
  }
  if (payload.channel === 'email') {
    console.info('Email通知（ダミー）:', payload.title);
  }
  return { success: true };
}

export async function submitExchangeRequest(formData: FormData) {
  const rewardId = formData.get('rewardId')?.toString();
  const amount = Number(formData.get('amount'));
  const userId = formData.get('userId')?.toString();
  const userName = formData.get('userName')?.toString();
  if (!rewardId || Number.isNaN(amount) || amount < 500 || !userId || !userName) {
    return { success: false, message: '500pt以上の交換が必要です。' };
  }

  if (!isSupabaseConfigured()) {
    return { success: false, message: 'Supabase未設定のため処理できません。' };
  }

  const supabase = getSupabaseServiceRole();
  const { error } = await supabase.from('exchange_requests').insert({
    id: randomUUID(),
    user_name: userName,
    reward_name: rewardId,
    points_used: amount,
    provider: 'PeX API',
    status: 'processing',
    requested_at: new Date().toISOString()
  });

  if (error) {
    return { success: false, message: error.message };
  }

  await requestPexExchange({ userId, rewardId, points: amount }).catch((pexError) => {
    console.error(pexError);
  });

  revalidatePath('/dashboard');
  revalidatePath('/admin');
  return { success: true, message: '外部APIと連携し、交換処理を開始しました。' };
}

export async function updateNotificationPreference(userId: string, patch: { isLineLinked?: boolean; pushOptIn?: boolean }) {
  if (!isSupabaseConfigured()) {
    return { success: false, message: 'Supabase未設定のため更新できません。' };
  }
  const supabase = getSupabaseServiceRole();
  const updates: Record<string, boolean> = {};
  if (typeof patch.isLineLinked === 'boolean') {
    updates.is_line_linked = patch.isLineLinked;
  }
  if (typeof patch.pushOptIn === 'boolean') {
    updates.push_opt_in = patch.pushOptIn;
  }
  const { error } = await supabase.from('monitor_profiles').update({ ...updates, updated_at: new Date().toISOString() }).eq('user_id', userId);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath('/dashboard');
  return { success: true };
}

export async function submitSurveyResponse(formData: FormData) {
  const surveyId = formData.get('surveyId')?.toString();
  const userId = formData.get('userId')?.toString();
  const answersJson = formData.get('answers')?.toString();

  if (!surveyId || !userId || !answersJson) {
    return { success: false, message: '必要な情報が不足しています。' };
  }

  if (!isSupabaseConfigured()) {
    return { success: false, message: 'Supabase未設定のため処理できません。' };
  }

  try {
    const answers = JSON.parse(answersJson) as Array<{ questionId: string; answerText?: string; answerNumber?: number; selectedOptionIds?: string[] }>;
    
    if (!Array.isArray(answers) || answers.length === 0) {
      return { success: false, message: '回答データが無効です。' };
    }

    const supabase = getSupabaseServiceRole();

    // 既に回答済みかチェック（テーブルが存在する場合）
    let existingResponse: any = null;
    try {
      const result = await (supabase as any)
        .from('survey_responses')
        .select('id')
        .eq('survey_id', surveyId)
        .eq('user_id', userId)
        .single();
      existingResponse = result.data;
    } catch (err) {
      // テーブルが存在しない場合はスキップ
    }

    if (existingResponse) {
      return { success: false, message: '既にこのアンケートに回答済みです。' };
    }

    // アンケート情報を取得
    const { data: survey, error: surveyError } = await supabase
      .from('surveys')
      .select('reward_points, deadline')
      .eq('id', surveyId)
      .single();

    if (surveyError || !survey) {
      return { success: false, message: 'アンケートが見つかりません。' };
    }

    // 期限チェック
    const deadline = new Date(survey.deadline);
    if (deadline < new Date()) {
      return { success: false, message: '回答期限を過ぎています。' };
    }

    // トランザクション開始（survey_responsesテーブルが存在する場合）
    // 回答を保存
    const responseId = randomUUID();
    
    // survey_responsesテーブルに回答を保存（テーブルが存在する場合）
    // 現時点では、テーブルが存在しない可能性があるため、エラーハンドリングを追加
    let responseError: any = null;
    try {
      // 型定義に存在しないテーブルのため、型アサーションを使用
      const { error } = await (supabase as any)
        .from('survey_responses')
        .insert({
          id: responseId,
          survey_id: surveyId,
          user_id: userId,
          submitted_at: new Date().toISOString()
        });
      responseError = error;
    } catch (err) {
      responseError = err;
    }

    if (responseError && !String(responseError).includes('does not exist')) {
      // テーブルが存在しない場合はスキップ（開発中のため）
      console.warn('survey_responsesテーブルへの保存に失敗:', responseError);
    }

    // survey_answersテーブルに個別回答を保存
    if (!responseError || String(responseError).includes('does not exist')) {
      const answerRecords = answers.map((answer) => {
        const record: any = {
          id: randomUUID(),
          response_id: responseId,
          question_id: answer.questionId,
          created_at: new Date().toISOString()
        };

        if (answer.answerText !== undefined) {
          record.answer_text = answer.answerText;
        }
        if (answer.answerNumber !== undefined) {
          record.answer_number = answer.answerNumber;
        }
        // selectedOptionIdsは複数選択の場合、複数レコードに分割して保存するか、JSONとして保存
        if (answer.selectedOptionIds && answer.selectedOptionIds.length > 0) {
          // シンプルに最初の選択肢のみ保存（本番では適切に設計する必要がある）
          record.answer_text = answer.selectedOptionIds.join(',');
        }

        return record;
      });

      try {
        const { error: answersError } = await (supabase as any)
          .from('survey_answers')
          .insert(answerRecords);

        if (answersError && !String(answersError).includes('does not exist')) {
          console.warn('survey_answersテーブルへの保存に失敗:', answersError);
        }
      } catch (err) {
        console.warn('survey_answersテーブルへの保存に失敗:', err);
      }
    }

    // ポイント付与
    const rewardPoints = survey.reward_points || 30;
    
    // monitor_profilesテーブルから現在のポイントを取得
    const { data: profile } = await supabase
      .from('monitor_profiles')
      .select('points')
      .eq('user_id', userId)
      .single();

    const currentPoints = profile?.points || 0;
    const newPoints = currentPoints + rewardPoints;

    // ポイントを更新
    const { error: pointsError } = await supabase
      .from('monitor_profiles')
      .update({ points: newPoints })
      .eq('user_id', userId);

    if (pointsError) {
      console.error('ポイント更新に失敗:', pointsError);
      // ポイント更新に失敗しても回答は保存済みなので、警告のみ
    }

    // ポイント履歴を記録
    const { error: historyError } = await supabase
      .from('point_transactions')
      .insert({
        id: randomUUID(),
        user_id: userId,
        happened_at: new Date().toISOString(),
        amount: rewardPoints,
        reason: 'survey',
        description: `アンケート回答: ${surveyId}`
      });

    if (historyError && !historyError.message.includes('does not exist')) {
      console.warn('ポイント履歴の記録に失敗:', historyError);
    }

    revalidatePath('/dashboard');
    return { success: true, message: `${rewardPoints}pt獲得しました！` };
  } catch (error) {
    console.error('アンケート回答送信エラー:', error);
    return { success: false, message: '回答の送信に失敗しました。もう一度お試しください。' };
  }
}

export async function regenerateReferralCode(userId: string) {
  const newCode = `KOECAN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseServiceRole();
    await supabase
      .from('monitor_profiles')
      .update({ referral_code: newCode, updated_at: new Date().toISOString() })
      .eq('user_id', userId);
    revalidatePath('/dashboard');
  }
  return { code: newCode };
}
