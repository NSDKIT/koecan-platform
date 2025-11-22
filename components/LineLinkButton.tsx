'use client';

import React, { useState } from 'react';
import { MessageSquare, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const LINE_CLIENT_ID = process.env.NEXT_PUBLIC_LINE_CLIENT_ID || 'YOUR_LINE_CHANNEL_ID';
const LINE_REDIRECT_URI = process.env.NEXT_PUBLIC_LINE_REDIRECT_URI || 'YOUR_GAS_WEB_APP_URL';

const SCOPE = 'profile openid'; 
const PROMPT = 'consent';
const BOT_PROMPT = 'aggressive';

const generateSecureRandomId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export function LineLinkButton() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLineLink = () => {
    if (!user?.id) {
      setError('ユーザーがログインしていません。');
      return;
    }
    
    if (LINE_CLIENT_ID === 'YOUR_LINE_CHANNEL_ID' || LINE_REDIRECT_URI === 'YOUR_GAS_WEB_APP_URL') {
         setError('環境変数(NEXT_PUBLIC_LINE_CLIENT_ID, NEXT_PUBLIC_LINE_REDIRECT_URI)を設定してください。');
         return;
    }

    setLoading(true);
    setError(null);

    try {
        const rawState = JSON.stringify({ userId: user.id, random: generateSecureRandomId() });
        const encodedState = btoa(rawState); 
        
        const encodedRedirectUri = encodeURIComponent(LINE_REDIRECT_URI); 

        const lineAuthUrl = `https://access.line.me/oauth2/v2.1/authorize?` +
            `response_type=code` +
            `&client_id=${LINE_CLIENT_ID}` +
            `&redirect_uri=${encodedRedirectUri}` +
            `&scope=${SCOPE}` +
            `&state=${encodedState}` +
            `&prompt=${PROMPT}` +
            `&bot_prompt=${BOT_PROMPT}`;
        
        window.location.href = lineAuthUrl;

    } catch (e) {
        console.error("LINE連携エラー:", e);
        setError('LINE連携を開始できませんでした。');
        setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-xl border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <MessageSquare className="w-5 h-5 mr-2 text-green-500" />
        LINE通知・連携
      </h3>
      <p className="text-gray-600 text-center mb-4">
        公式LINEと連携し、アンケート開始の通知を受け取りましょう。
      </p>
      
      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      <button
        onClick={handleLineLink}
        disabled={loading || !user?.id}
        className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            連携処理中...
          </>
        ) : (
          <>
            <img 
                src="https://scdn.line-apps.com/n/line_login/img/present/btn_text_login_on_c7885b5d.png" 
                alt="LINE" 
                className="w-5 h-5 mr-2" 
            /> 
            LINEアカウントと連携する
          </>
        )}
      </button>
      <p className="text-xs text-gray-500 mt-2">※通知はLINE公式アカウントから届きます</p>
    </div>
  );
}

