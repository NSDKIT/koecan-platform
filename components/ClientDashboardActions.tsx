'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MarkdownImportModal } from '@/components/MarkdownImportModal';
import { CsvImportModal } from '@/components/CsvImportModal';
import { importSurveysFromMarkdown, importSurveysFromCsv } from '@/lib/actions/platformActions';
import { useRouter } from 'next/navigation';

interface ClientDashboardActionsProps {
  userId: string;
}

export function ClientDashboardActions({ userId }: ClientDashboardActionsProps) {
  const router = useRouter();
  const [isMarkdownModalOpen, setIsMarkdownModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleMarkdownImport = async (content: string) => {
    setIsImporting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('content', content);

      const result = await importSurveysFromMarkdown(formData);

      if (!result.success) {
        setError(result.message || 'Markdownのインポートに失敗しました');
        setIsImporting(false);
        return;
      }

      router.refresh();
      router.push('/client?message=surveys_imported');
    } catch (err) {
      setError('Markdownのインポートに失敗しました。もう一度お試しください。');
      setIsImporting(false);
    }
  };

  const handleCsvImport = async (file: File) => {
    setIsImporting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('file', file);

      const result = await importSurveysFromCsv(formData);

      if (!result.success) {
        setError(result.message || 'CSVのインポートに失敗しました');
        setIsImporting(false);
        return;
      }

      router.refresh();
      router.push('/client?message=surveys_imported');
    } catch (err) {
      setError('CSVのインポートに失敗しました。もう一度お試しください。');
      setIsImporting(false);
    }
  };

  return (
    <>
      {error && (
        <div style={{ padding: '1rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '0.25rem', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <div className="two-column">
        <div className="card">
          <h4>手動作成</h4>
          <p>質問を1つずつ追加してアンケートを作成します。</p>
          <Link href="/client/surveys/create" className="button primary" style={{ width: '100%', marginTop: '1rem', textDecoration: 'none', display: 'block', textAlign: 'center' }}>
            手動で作成する
          </Link>
        </div>
        <div className="card">
          <h4>一括インポート</h4>
          <p>MarkdownまたはCSVファイルから一括でアンケートを作成します。</p>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button
              className="button secondary"
              type="button"
              style={{ flex: 1 }}
              onClick={() => setIsMarkdownModalOpen(true)}
              disabled={isImporting}
            >
              Markdown
            </button>
            <button
              className="button secondary"
              type="button"
              style={{ flex: 1 }}
              onClick={() => setIsCsvModalOpen(true)}
              disabled={isImporting}
            >
              CSV
            </button>
          </div>
        </div>
      </div>

      <MarkdownImportModal
        isOpen={isMarkdownModalOpen}
        onClose={() => setIsMarkdownModalOpen(false)}
        onImport={handleMarkdownImport}
      />
      <CsvImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onImport={handleCsvImport}
      />
    </>
  );
}

