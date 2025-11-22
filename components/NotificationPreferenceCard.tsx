'use client';

import { useState, useTransition } from 'react';
import { updateNotificationPreference } from '@/lib/actions/platformActions';

interface NotificationPreferenceCardProps {
  userId: string;
  isLineLinked: boolean;
  pushOptIn: boolean;
}

export function NotificationPreferenceCard({ userId, isLineLinked, pushOptIn }: NotificationPreferenceCardProps) {
  const [lineLinked, setLineLinked] = useState(isLineLinked);
  const [pushEnabled, setPushEnabled] = useState(pushOptIn);
  const [isPending, startTransition] = useTransition();

  const toggleLine = () =>
    startTransition(async () => {
      const result = await updateNotificationPreference(userId, { isLineLinked: !lineLinked });
      if (result?.success) {
        setLineLinked((prev) => !prev);
      }
    });

  const togglePush = () =>
    startTransition(async () => {
      const result = await updateNotificationPreference(userId, { pushOptIn: !pushEnabled });
      if (result?.success) {
        setPushEnabled((prev) => !prev);
      }
    });

  return (
    <div className="card" style={{ display: 'grid', gap: '1rem' }}>
      <div>
        <h3 className="section-title" style={{ marginBottom: '0.25rem' }}>通知設定</h3>
        <p className="section-subtitle">LINEとブラウザプッシュのON/OFFを切り替え</p>
      </div>
      <div className="two-column">
        <div className="card" style={{ background: '#eef2ff' }}>
          <p style={{ margin: '0 0 0.5rem' }}>LINE連携</p>
          <strong>{lineLinked ? '連携済み' : '未連携'}</strong>
          <button className="button secondary" type="button" onClick={toggleLine} disabled={isPending} style={{ marginTop: '0.75rem' }}>
            {lineLinked ? '連携を解除する' : 'LINEと連携する'}
          </button>
        </div>
        <div className="card" style={{ background: '#ecfeff' }}>
          <p style={{ margin: '0 0 0.5rem' }}>ブラウザプッシュ</p>
          <strong>{pushEnabled ? '許可中' : '未許可'}</strong>
          <button className="button secondary" type="button" onClick={togglePush} disabled={isPending} style={{ marginTop: '0.75rem' }}>
            {pushEnabled ? '通知をオフにする' : '通知を許可する'}
          </button>
        </div>
      </div>
    </div>
  );
}
