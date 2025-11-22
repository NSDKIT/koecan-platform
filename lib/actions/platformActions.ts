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
