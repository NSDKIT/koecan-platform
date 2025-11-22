'use client';

import { useState, useTransition } from 'react';
import { regenerateReferralCode } from '@/lib/actions/platformActions';

interface ReferralCodeCardProps {
  userId: string;
  code: string;
  successful: number;
  pending: number;
  points: number;
}

export function ReferralCodeCard({ userId, code, successful, pending, points }: ReferralCodeCardProps) {
  const [currentCode, setCurrentCode] = useState(code);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleGenerate = () => {
    startTransition(async () => {
      const { code: newCode } = await regenerateReferralCode(userId);
      setCurrentCode(newCode);
      setCopied(false);
    });
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="card" style={{ display: 'grid', gap: '0.75rem' }}>
      <div>
        <p className="section-subtitle" style={{ marginBottom: '0.25rem' }}>紹介コード</p>
        <h3 style={{ margin: 0 }}>{currentCode}</h3>
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button className="button secondary" type="button" onClick={handleCopy}>
          {copied ? 'コピー済み' : 'コードをコピー'}
        </button>
        <button className="button ghost" type="button" onClick={handleGenerate} disabled={isPending}>
          {isPending ? '再発行中...' : '再発行する'}
        </button>
      </div>
      <div className="two-column">
        <div>
          <p className="section-subtitle">成功</p>
          <strong>{successful}人</strong>
        </div>
        <div>
          <p className="section-subtitle">審査中</p>
          <strong>{pending}人</strong>
        </div>
        <div>
          <p className="section-subtitle">紹介ポイント</p>
          <strong>{points}pt</strong>
        </div>
      </div>
    </div>
  );
}
