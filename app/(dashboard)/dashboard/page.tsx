'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getBrowserSupabase } from '@/lib/supabaseClient';
import type { Survey, MonitorProfile, Advertisement, Question, Answer } from '@/lib/types';
import { 
  Star, 
  Gift, 
  MessageCircle, 
  LogOut, 
  User as UserIcon, 
  Clock, 
  CheckCircle,
  Sparkles,
  Target,
  Users,
  Menu,
  ExternalLink,
  X,
  History,
  FileText,
  Briefcase,
  ClipboardList,
  Building,
  Calendar,
  DollarSign,
  BarChart3
} from 'lucide-react';
import { ProfileModal } from '@/components/ProfileModal';
import { CareerConsultationModal } from '@/components/CareerConsultationModal';
import { ChatModal } from '@/components/ChatModal';
import { LineLinkButton } from '@/components/LineLinkButton';
import { SparklesCore } from '@/components/ui/sparkles';
import { PointExchangeModal } from '@/components/PointExchangeModal'; 
import { MonitorProfileSurveyModal } from '@/components/MonitorProfileSurveyModal'; 
import { MatchingFeature } from '@/components/MatchingFeature';

type ActiveTab = 'surveys' | 'recruitment' | 'career_consultation' | 'matching';

const SUPABASE_SUPPORT_USER_ID = process.env.NEXT_PUBLIC_SUPPORT_USER_ID || '39087559-d1da-4fd7-8ef9-4143de30d06d';
const C8_LINE_ADD_URL = 'https://lin.ee/f2zHhiB';

const formatBoolean = (val: boolean | null | undefined, yes: string = 'あり', no: string = 'なし') => {
    if (val === true) return yes;
    if (val === false) return no;
    return '';
};

const displayValue = (value: any): string => {
    if (value === null || value === undefined || value === 'N/A') return '';
    if (Array.isArray(value)) {
        return value.length > 0 ? value.join(', ') : '';
    }
    return String(value);
};

const getSecureImageUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=800&output=webp&q=85`;
    }
    
    return url;
};

export default function MonitorDashboard() {
  const { user, signOut, loading: authLoading } = useAuth();
  const router = useRouter();
  const [availableSurveys, setAvailableSurveys] = useState<Survey[]>([]); 
  const [answeredSurveys, setAnsweredSurveys] = useState<Survey[]>([]);   
  const [profile, setProfile] = useState<MonitorProfile | null>(null);
  const [dashboardDataLoading, setDashboardDataLoading] = useState(true); 
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showCareerModal, setShowCareerModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('surveys');
  const [isMenuOpen, setIsMenuOpen] = useState(false); 
  const menuButtonRef = useRef<HTMLButtonElement>(null); 

  const [selectedAdvertisement, setSelectedAdvertisement] = useState<Advertisement | null>(null);
  const [showPointExchangeModal, setShowPointExchangeModal] = useState(false);
  const [showProfileSurveyModal, setShowProfileSurveyModal] = useState(false); 
  const [showLineLinkModal, setShowLineLinkModal] = useState(false);

  useEffect(() => {
    console.log('useEffect [user, authLoading]:', {
      hasUser: !!user,
      userId: user?.id,
      authLoading,
      dashboardDataLoading
    });

    if (user && !authLoading) {
      console.log('ユーザー認証済み、ダッシュボードデータを読み込み開始:', { userId: user.id });
      loadAllDashboardData();
    } else if (!authLoading && !user) {
      // 認証が完了したがユーザーが存在しない場合はローディングを解除
      console.log('認証完了、ユーザーなし');
      console.log('ユーザーが存在しないため、ログインページにリダイレクト');
      console.log('認証完了、ユーザーなし');
      setDashboardDataLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  // タイムアウト処理：10秒後に強制的にローディングを解除
  useEffect(() => {
    if (!dashboardDataLoading) return;
    
    const timeout = setTimeout(() => {
      console.warn('ダッシュボードデータ読み込みがタイムアウトしました（10秒）。ローディングを強制的に解除します');
      setDashboardDataLoading(false);
    }, 10000);

    return () => clearTimeout(timeout);
  }, [dashboardDataLoading]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuButtonRef.current && menuButtonRef.current.contains(event.target as Node)) {
        return; 
      }
      const menuElement = document.getElementById('hamburger-menu-dropdown');
      if (menuElement && !menuElement.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []); 

  const loadAllDashboardData = async () => {
    if (!user?.id) {
      console.log('loadAllDashboardData: user.idが存在しません');
      setDashboardDataLoading(false);
      return;
    }

    console.log('loadAllDashboardData: 開始', { userId: user.id });
    setDashboardDataLoading(true);
    try {
      // 各データ取得を個別に実行し、エラーがあっても続行
      await Promise.allSettled([
        fetchProfile(),
        fetchSurveysAndResponses(),
        fetchAdvertisements()
      ]);
      console.log('loadAllDashboardData: 完了');
      setDashboardDataLoading(false);
    } catch (err) {
      console.error("ダッシュボードデータの読み込みに失敗:", err);
      setDashboardDataLoading(false);
    }
  };

  const fetchProfile = async () => {
    if (!user?.id) {
      console.log('fetchProfile: user.idが存在しません');
      return;
    }
    
    try {
      const supabase = getBrowserSupabase();
      const { data: profileData, error: profileError } = await (supabase as any)
        .from('monitor_profiles')
        .select('*') 
        .eq('user_id', user.id)
        .single();

      // プロフィールが見つからない場合（PGRST116）でもエラーをthrowしない
      if (profileError && profileError.code !== 'PGRST116') {
        console.error('プロフィール取得エラー:', profileError);
        throw profileError;
      }

      if (profileData) {
        const combinedProfile: MonitorProfile = {
          ...profileData,
          id: profileData.user_id || profileData.id,
          name: profileData.name || user.email?.split('@')[0] || 'ユーザー',
          email: profileData.email || user.email || '',
          occupation: profileData.occupation || '',
          age: profileData.age || 0,
          points: profileData.points || 0,
          referralCode: profileData.referral_code || '',
          referralCount: profileData.referral_count || 0,
          referralPoints: profileData.referral_points || 0,
          isLineLinked: profileData.is_line_linked || false,
          pushOptIn: profileData.push_opt_in || false,
          tags: profileData.tags || [],
          updatedAt: profileData.updated_at || new Date().toISOString()
        };
        setProfile(combinedProfile);
        console.log('プロフィール取得成功:', combinedProfile.name);
      } else {
        // プロフィールが見つからない場合は最小限のプロフィールを作成
        console.log('プロフィールが見つかりません。最小限のプロフィールを作成します');
        setProfile({ 
          id: user.id,
          name: user.email?.split('@')[0] || 'ユーザー',
          email: user.email || '',
          occupation: '',
          age: 0,
          points: 0,
          referralCode: '',
          referralCount: 0,
          referralPoints: 0,
          isLineLinked: false,
          pushOptIn: false,
          tags: [],
          updatedAt: new Date().toISOString()
        } as MonitorProfile);
      }
    } catch (error) {
      console.error('プロフィール取得エラー:', error);
      // エラーが発生しても最小限のプロフィールを設定して続行
      setProfile({ 
        id: user.id,
        name: user.email?.split('@')[0] || 'ユーザー',
        email: user.email || '',
        occupation: '',
        age: 0,
        points: 0,
        referralCode: '',
        referralCount: 0,
        referralPoints: 0,
        isLineLinked: false,
        pushOptIn: false,
        tags: [],
        updatedAt: new Date().toISOString()
      } as MonitorProfile);
    }
  };

  const fetchSurveysAndResponses = async () => {
    if (!user?.id) {
      console.log('fetchSurveysAndResponses: user.idが存在しません');
      return;
    }

    try {
      const supabase = getBrowserSupabase();
      const { data: allActiveSurveys, error: surveysError } = await (supabase as any)
        .from('surveys')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (surveysError) {
        console.error('アンケート取得エラー:', surveysError);
        // エラーがあっても空配列を設定して続行
        setAvailableSurveys([]);
        setAnsweredSurveys([]);
        return;
      }

      const { data: userResponses, error: responsesError } = await (supabase as any)
        .from('survey_responses')
        .select('survey_id')
        .eq('user_id', user.id);

      if (responsesError && responsesError.code !== 'PGRST116') {
        console.error('回答履歴取得エラー:', responsesError);
        // エラーがあっても続行
      }

      const answeredSurveyIds = new Set(userResponses?.map((res: {survey_id: string}) => res.survey_id) || []);

      const newAvailableSurveys: Survey[] = [];
      const newAnsweredSurveys: Survey[] = [];

      (allActiveSurveys || []).forEach((survey: any) => {
        const mappedSurvey: Survey & { description?: string } = {
          id: survey.id,
          title: survey.title,
          category: survey.category as any,
          rewardPoints: survey.reward_points || 0,
          questions: survey.questions || 0,
          status: survey.status as any,
          deadline: survey.deadline || new Date().toISOString(),
          deliveryChannels: survey.delivery_channels || [],
          targetTags: survey.target_tags || [],
          aiMatchingScore: survey.ai_matching_score || 0,
          description: survey.description || ''
        };

        if (answeredSurveyIds.has(survey.id)) {
          newAnsweredSurveys.push(mappedSurvey as Survey);
        } else {
          newAvailableSurveys.push(mappedSurvey as Survey);
        }
      });

      setAvailableSurveys(newAvailableSurveys);
      setAnsweredSurveys(newAnsweredSurveys);
      console.log('アンケート取得成功:', { available: newAvailableSurveys.length, answered: newAnsweredSurveys.length });
    } catch (error) {
      console.error('アンケートと回答の取得エラー:', error);
      // エラーがあっても空配列を設定して続行
      setAvailableSurveys([]);
      setAnsweredSurveys([]);
    }
  };

  const fetchAdvertisements = async () => {
    try {
      const supabase = getBrowserSupabase();
      const { data, error } = await (supabase as any)
        .from('advertisements')
        .select(`*`) 
        .eq('is_active', true)
        .order('priority', { ascending: false })
        .order('display_order', { ascending: true });

      if (error && error.code !== '42P01') { // テーブルが存在しない場合のエラーコード
        throw error;
      }
      setAdvertisements(data || []);
    } catch (error) {
      console.error('広告取得エラー:', error);
      // 広告テーブルが存在しない場合は空配列のまま
      setAdvertisements([]);
    }
  };

  const handleSurveyClick = (survey: Survey) => {
    router.push(`/dashboard/surveys/${survey.id}`);
  };

  // デバッグログ
  useEffect(() => {
    console.log('ダッシュボード状態:', {
      authLoading,
      dashboardDataLoading,
      hasUser: !!user,
      userId: user?.id,
      hasProfile: !!profile
    });
  }, [authLoading, dashboardDataLoading, user, profile]);

  // 認証ローディング中
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">認証情報を確認中...</p>
        </div>
      </div>
    );
  }

  // 認証が完了したがユーザーが存在しない場合
  if (!user) {
    console.log('ユーザーが存在しないため、ログインページにリダイレクト');
    router.push('/login');
    return null;
  }

  // データ読み込み中でプロフィールもまだ取得できていない場合のみローディング表示
  // ただし、タイムアウト（10秒）後は強制的にダッシュボードを表示

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <div className="w-full absolute inset-0 h-screen">
        <SparklesCore
          id="tsparticlesmonitor"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={60}
          className="w-full h-full"
          particleColor="#F97316"
          speed={0.5}
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-br from-orange-50/30 via-white to-orange-50/30"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-white/80"></div>

      <div className="relative z-20">
        <header className="bg-white/80 backdrop-blur-sm border-b border-orange-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-orange-500">
                  声キャン！
                </h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setShowLineLinkModal(true)}
                  className="flex items-center px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-full text-sm font-medium transition-colors"
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  LINE連携
                </button>
                
                <button
                  ref={menuButtonRef}
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-gray-700 hover:text-orange-600 transition-colors"
                >
                  <Menu className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {isMenuOpen && (
          <div
            id="hamburger-menu-dropdown" 
            className="fixed right-4 top-16 mt-2 w-48 bg-white rounded-lg py-2 z-[1000] border border-gray-100" 
            style={{ zIndex: 1000 }} 
          >
            <button
              onClick={() => {
                setShowProfileModal(true);
                setIsMenuOpen(false);
              }}
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
            >
              <UserIcon className="w-5 h-5 mr-2" />
              プロフィール設定
            </button>
            <button
              onClick={() => {
                setShowProfileSurveyModal(true); 
                setIsMenuOpen(false);
              }}
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
            >
              <FileText className="w-5 h-5 mr-2" /> 
              プロフィールアンケート
            </button>
            <button
              onClick={() => {
                signOut();
                setIsMenuOpen(false);
              }}
              className="flex items-center px-4 py-2 text-red-600 hover:bg-red-50 w-full text-left"
            >
              <LogOut className="w-5 h-5 mr-2" />
              ログアウト
            </button>
          </div>
        )}

        <main className={`mx-auto pb-20 ${
          activeTab === 'career_consultation' ? '' : 'max-w-7xl px-4 sm:px-6 lg:px-8 pt-8'
        }`}> 
          {activeTab !== 'career_consultation' && (
            <div
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 flex items-center space-x-4 cursor-pointer"
              onClick={() => setShowPointExchangeModal(true)} 
            >
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-full p-4 flex items-center justify-center w-20 h-20 shadow-lg">
                <Star className="w-10 h-10 text-white" />
              </div>
              <div>
                <p className="text-gray-600 text-lg">獲得ポイント</p>
                <p className="text-5xl font-bold text-orange-600">{profile?.points || 0}</p>
              </div>
            </div>
          )}

          <div 
            className={`
              transition-colors duration-300
              ${activeTab === 'career_consultation' ? 'bg-transparent p-0' : 'backdrop-blur-sm rounded-2xl bg-white/80 p-8'}
            `}
          > 
            {activeTab === 'surveys' && (
              <>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">利用可能なアンケート</h2>
                {availableSurveys.length === 0 ? (
                  <div className="text-center py-12 mb-8">
                    <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">現在利用可能な<br></br>アンケートはありません</h3>
                    <p className="text-gray-600">新しいアンケートに回答して<br></br>ポイントを獲得しましょう。</p>
                  </div>
                ) : (
                  <div className="grid gap-6 mb-8">
                    {availableSurveys.map((survey) => (
                      <div
                        key={survey.id}
                        className="border border-gray-200 rounded-xl p-6"
                      >
                        <div className="flex flex-col md:flex-row items-start justify-between">
                          <div className="flex-1 mb-4 md:mb-0">
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                              {survey.title}
                            </h3>
                            <p className="text-gray-600 mb-4 line-clamp-2">{(survey as any).description || '説明なし'}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center">
                                <Users className="w-4 h-4 mr-1" />
                                <span>対象者: 学生</span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                <span>質問数: {survey.questions}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-center md:items-end space-y-3 md:ml-6">
                            <div className="flex items-center bg-orange-50 rounded-full px-4 py-2 text-orange-700 font-semibold text-lg">
                              <Gift className="w-5 h-5 mr-2" />
                              <span>{survey.rewardPoints}pt</span>
                            </div>
                            <button
                              onClick={() => handleSurveyClick(survey)}
                              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-base font-semibold"
                            >
                              回答する
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-t pt-8">回答済みアンケート</h2>
                {answeredSurveys.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <History className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">まだ回答したアンケートはありません</h3>
                    <p className="text-gray-600">新しいアンケートに回答してポイントを獲得しましょう。</p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {answeredSurveys.map((survey) => (
                      <div
                        key={survey.id}
                        className="border border-gray-200 rounded-xl p-6 bg-gray-50 opacity-80" 
                      >
                        <div className="flex flex-col md:flex-row items-start justify-between">
                          <div className="flex-1 mb-4 md:mb-0">
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">
                              {survey.title}
                            </h3>
                            <p className="text-gray-500 mb-4 line-clamp-2">{(survey as any).description || '説明なし'}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-400">
                              <div className="flex items-center">
                                <Users className="w-4 h-4 mr-1" />
                                <span>対象者: 学生</span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                <span>質問数: {survey.questions}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-center md:items-end space-y-3 md:ml-6">
                            <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 text-gray-600 font-semibold text-lg">
                              <Gift className="w-5 h-5 mr-2" />
                              <span>{survey.rewardPoints}pt 獲得済み</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === 'matching' && (
              <MatchingFeature />
            )}

            {activeTab === 'recruitment' && ( 
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-0">
                {advertisements.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">現在、公開されている企業情報はありません。</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {advertisements.map((ad) => (
                      <div
                        key={ad.id}
                        className="border border-gray-200 rounded-xl overflow-hidden cursor-pointer group"
                        onClick={() => setSelectedAdvertisement(ad)} 
                      >
                        {ad.image_url && getSecureImageUrl(ad.image_url) ? (
                          <div className="aspect-video bg-gray-100 overflow-hidden">
                            <img
                              src={getSecureImageUrl(ad.image_url) || ''}
                              alt={ad.company_name || ad.title || '企業情報'} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                              referrerPolicy="no-referrer"
                              crossOrigin="anonymous"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          </div>
                        ) : (
                          <div className="aspect-video bg-gray-200 flex items-center justify-center">
                            <Briefcase className="w-12 h-12 text-gray-500" />
                          </div>
                        )}
                        
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-800 mb-2">
                            {displayValue(ad.company_name) || '企業名未設定'}
                          </h3>
                          <p className="text-gray-600 text-sm line-clamp-2">
                            {displayValue(ad.company_vision) || displayValue(ad.title) || displayValue(ad.description) || ''}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'career_consultation' && (
              <>
                <div className="flex flex-col items-center w-full">
                    <img 
                        src="https://raw.githubusercontent.com/NSDKIT/koecan_v0/refs/heads/main/img/c8_top_v2.png"
                        alt="キャリア相談 上部"
                        className="w-full h-auto object-cover"
                    />
                    
                    <div className="relative w-full">
                        <img 
                            src="https://raw.githubusercontent.com/NSDKIT/koecan_v0/refs/heads/main/img/c8_middle_v2.png"
                            alt="キャリア相談 中部"
                            className="w-full h-auto object-cover"
                        />
                        
                        <div className="absolute inset-0 flex items-center justify-center">
                            <a
                                href={C8_LINE_ADD_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex flex-col items-center"
                            >
                                <span className="text-sm mb-1">キャリア支援のプロ</span>
                                <span className="text-lg">シーエイトに相談</span>
                            </a>
                        </div>
                    </div>

                    <img 
                        src="https://raw.githubusercontent.com/NSDKIT/koecan_v0/refs/heads/main/img/c8_down_v2.png"
                        alt="キャリア相談 下部"
                        className="w-full h-auto object-cover"
                    />
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="max-w-7xl mx-auto flex justify-around h-20">
          <button
            onClick={() => setActiveTab('surveys')}
            className={`flex flex-col items-center justify-center w-full text-sm font-medium transition-colors ${
              activeTab === 'surveys' ? 'text-orange-600' : 'text-gray-500 hover:text-orange-500'
            }`}
          >
            <ClipboardList className="w-6 h-6 mb-1" />
            アンケート
          </button>
          <button
            onClick={() => setActiveTab('matching')}
            className={`flex flex-col items-center justify-center w-full text-sm font-medium transition-colors ${
              activeTab === 'matching' ? 'text-orange-600' : 'text-gray-500 hover:text-orange-500'
            }`}
          >
            <Sparkles className="w-6 h-6 mb-1" />
            キャリア診断
          </button>
          <button
            onClick={() => setActiveTab('recruitment')}
            className={`flex flex-col items-center justify-center w-full text-sm font-medium transition-colors ${
              activeTab === 'recruitment' ? 'text-orange-600' : 'text-gray-500 hover:text-orange-500'
            }`}
          >
            <Briefcase className="w-6 h-6 mb-1" />
            企業情報
          </button>
          <button
            onClick={() => setActiveTab('career_consultation')}
            className={`flex flex-col items-center justify-center w-full text-sm font-medium transition-colors ${
              activeTab === 'career_consultation' ? 'text-orange-600' : 'text-gray-500 hover:text-orange-500'
            }`}
          >
            <MessageCircle className="w-6 h-6 mb-1" />
            キャリア相談
          </button>
        </div>
      </div>

      {showProfileModal && profile && (
        <ProfileModal
          user={user}
          profile={profile}
          onClose={() => setShowProfileModal(false)}
          onUpdate={fetchProfile}
        />
      )}

      {showCareerModal && (
        <CareerConsultationModal
          onClose={() => setShowCareerModal(false)}
        />
      )}

      {showChatModal && user?.id && SUPABASE_SUPPORT_USER_ID && ( 
        <ChatModal
          user={user} 
          otherUserId={SUPABASE_SUPPORT_USER_ID} 
          onClose={() => setShowChatModal(false)}
        />
      )}

      {showPointExchangeModal && (
        <PointExchangeModal
          currentPoints={profile?.points || 0}
          onClose={() => setShowPointExchangeModal(false)}
          onExchangeSuccess={fetchProfile}
        />
      )}

      {showProfileSurveyModal && (
        <MonitorProfileSurveyModal
          onClose={() => setShowProfileSurveyModal(false)}
          onSaveSuccess={() => {}}
        />
      )}

      {showLineLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">LINE連携</h2>
              <button
                onClick={() => setShowLineLinkModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <LineLinkButton />
          </div>
        </div>
      )}

      {selectedAdvertisement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto my-8">
            <div className="relative">
              <button
                onClick={() => setSelectedAdvertisement(null)}
                className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all hover:scale-110 text-gray-600 hover:text-gray-800"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="bg-white rounded-t-3xl p-8 pb-6 border-b-2 border-orange-500">
                <h2 className="text-4xl font-bold text-orange-600">{displayValue(selectedAdvertisement.company_name) || '企業名未設定'}</h2>
              </div>

              {selectedAdvertisement.image_url && getSecureImageUrl(selectedAdvertisement.image_url) && (
                <div className="px-8 pt-6 relative z-10">
                  <div className="bg-white rounded-2xl overflow-hidden shadow-xl h-96 border-4 border-white">
                    <img
                      src={getSecureImageUrl(selectedAdvertisement.image_url) || undefined}
                      alt={displayValue(selectedAdvertisement.company_name) || '企業画像'}
                      className="w-auto h-full object-cover mx-auto"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="p-8">
                {displayValue(selectedAdvertisement.company_vision) && (
                  <div className="mb-8">
                    <div className="bg-orange-50 rounded-2xl p-6 border-l-4 border-orange-500">
                      <div className="flex items-start mb-2">
                        <Sparkles className="w-6 h-6 text-orange-600 mr-2 flex-shrink-0 mt-1" />
                        <h3 className="text-lg font-bold text-orange-600">目指す未来</h3>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed pl-8">{displayValue(selectedAdvertisement.company_vision)}</p>
                    </div>
                  </div>
                )}
              
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <Building className="w-6 h-6 text-orange-600 mr-2" />
                    <h3 className="text-2xl font-bold text-gray-800">企業概要</h3>
                  </div>
                  <div className="bg-white rounded-2xl overflow-hidden border border-gray-200">
                    <table className="w-full">
                      <tbody>
                        <tr className="border-b border-gray-200">
                          <td className="px-6 py-4 bg-gray-50 font-semibold text-gray-700 w-1/3">代表者名</td>
                          <td className="px-6 py-4 text-gray-700">{displayValue(selectedAdvertisement.representative_name)}</td>
                        </tr>
                        <tr className="border-b border-gray-200">
                          <td className="px-6 py-4 bg-gray-50 font-semibold text-gray-700">設立年</td>
                          <td className="px-6 py-4 text-gray-700">{displayValue(selectedAdvertisement.establishment_year)}</td>
                        </tr>
                        <tr className="border-b border-gray-200">
                          <td className="px-6 py-4 bg-gray-50 font-semibold text-gray-700">所在地（本社）</td>
                          <td className="px-6 py-4 text-gray-700">{displayValue(selectedAdvertisement.headquarters_location)}</td>
                        </tr>
                        <tr className="border-b border-gray-200">
                          <td className="px-6 py-4 bg-gray-50 font-semibold text-gray-700">従業員数</td>
                          <td className="px-6 py-4 text-gray-700">{displayValue(selectedAdvertisement.employee_count)}</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 bg-orange-50 font-semibold text-orange-700">イチオシポイント</td>
                          <td className="px-6 py-4 text-orange-800 font-medium">
                            {[
                              displayValue(selectedAdvertisement.highlight_point_1),
                              displayValue(selectedAdvertisement.highlight_point_2),
                              displayValue(selectedAdvertisement.highlight_point_3)
                            ].filter(Boolean).join(' / ') || ''}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* その他の詳細情報も同様に表示 */}
                {selectedAdvertisement.recruitment_info_page_url && (
                  <div className="mb-8">
                    <a 
                      href={selectedAdvertisement.recruitment_info_page_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-orange-600 hover:text-orange-700 font-semibold"
                    >
                      採用情報ページを見る
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
