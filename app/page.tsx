'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const features = [
  {
    icon: '✨',
    text: '自分にマッチした企業に出会える'
  },
  {
    icon: '👤',
    text: '就活の専門家に相談できる'
  },
  {
    icon: '🏢',
    text: '企業情報GET'
  },
  {
    icon: '🎁',
    text: 'それでいて、ポイ活もできる'
  }
];

export default function WelcomePage() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    // PWAインストールプロンプトの処理
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowInstallButton(false);
    }

    setDeferredPrompt(null);
  };

  return (
    <main style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
      position: 'relative'
    }}>
      {/* 背景パターン */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.03) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        pointerEvents: 'none'
      }} />

      <div className="container" style={{ 
        maxWidth: '600px', 
        width: '90%',
        position: 'relative',
        zIndex: 1
      }}>
        <div className="card" style={{ 
          textAlign: 'center', 
          padding: '3rem 2rem',
          background: '#fff',
          borderRadius: '1rem',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
        }}>
          {/* タイトル */}
          <h1 style={{ 
            fontSize: '3.5rem', 
            margin: '0 0 2rem',
            fontWeight: 'bold',
            color: '#f97316',
            letterSpacing: '-0.02em'
          }}>
            声キャン！
          </h1>

          {/* 機能セクション */}
          <div style={{
            background: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)',
            borderRadius: '0.75rem',
            padding: '2rem 1.5rem',
            marginBottom: '2rem'
          }}>
            {features.map((feature, index) => (
              <div 
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 0',
                  fontSize: '1rem',
                  fontWeight: 500,
                  color: '#1f2937'
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>{feature.icon}</span>
                <span>{feature.text}</span>
              </div>
            ))}
          </div>

          {/* メインCTA */}
          <Link 
            href="/register" 
            className="button primary" 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '1.125rem',
              padding: '1rem 2rem',
              borderRadius: '0.5rem',
              fontWeight: 600,
              textDecoration: 'none',
              marginBottom: '1rem'
            }}
          >
            はじめる →
          </Link>

          {/* サブテキスト */}
          <p style={{
            fontSize: '0.875rem',
            color: '#64748b',
            margin: '0 0 1.5rem'
          }}>
            無料でアカウントを作成して、今すぐ始めましょう
          </p>

          {/* PWAインストールボタン */}
          {(showInstallButton || typeof window !== 'undefined' && 'serviceWorker' in navigator) && (
            <button
              onClick={handleInstallClick}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer',
                boxShadow: '0 4px 6px rgba(59, 130, 246, 0.2)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 8px rgba(59, 130, 246, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(59, 130, 246, 0.2)';
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>↓</span>
              ホーム画面にアプリを追加
            </button>
          )}

          {/* ログインリンク */}
          <p style={{
            marginTop: '2rem',
            fontSize: '0.875rem',
            color: '#64748b'
          }}>
            すでにアカウントをお持ちですか？{' '}
            <Link 
              href="/login" 
              style={{ 
                color: '#f97316',
                fontWeight: 500,
                textDecoration: 'underline'
              }}
            >
              ログイン
            </Link>
          </p>
          </div>
      </div>
    </main>
  );
}
