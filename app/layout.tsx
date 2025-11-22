import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '声キャン！プラットフォーム',
  description: '大学生向けアンケート・キャリア支援プラットフォーム（PWA対応）',
  manifest: '/manifest.json',
  icons: [
    { rel: 'icon', url: '/icon.svg' },
    { rel: 'apple-touch-icon', url: '/icon.svg' }
  ]
};

export const viewport: Viewport = {
  themeColor: '#0f172a'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
