'use client';

import { useState } from 'react';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File) => void;
}

export function CsvImportModal({ isOpen, onClose, onImport }: CsvImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        setError('CSVファイルを選択してください');
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleImport = () => {
    if (!file) {
      setError('CSVファイルを選択してください');
      return;
    }

    onImport(file);
    setFile(null);
    setError(null);
    onClose();
  };

  const downloadTemplate = () => {
    const csvContent = `question_text,question_type,is_required,option_1,option_2,option_3,option_4
質問1のテキスト,single_choice,true,選択肢1,選択肢2,選択肢3,選択肢4
質問2のテキスト,multiple_choice,true,選択肢A,選択肢B,選択肢C,
質問3のテキスト,text,true,,,,
質問4のテキスト,number,false,,,,
質問5のテキスト,rating,true,,,,
`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'survey_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          maxWidth: '600px',
          width: '90%',
          backgroundColor: 'white',
          padding: '2rem'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>CSVインポート</h3>
          <button className="button ghost" onClick={onClose} style={{ fontSize: '1.5rem' }}>
            ×
          </button>
        </div>

        {error && (
          <div style={{ padding: '1rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '0.25rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '1rem' }}>
          <button className="button secondary" onClick={downloadTemplate} style={{ width: '100%', marginBottom: '1rem' }}>
            CSVテンプレートをダウンロード
          </button>
          <div className="form-group">
            <label htmlFor="csv-file">CSVファイルを選択</label>
            <input id="csv-file" type="file" accept=".csv" onChange={handleFileChange} style={{ width: '100%' }} />
            {file && (
              <p style={{ marginTop: '0.5rem', color: '#64748b', fontSize: '0.875rem' }}>
                選択中: {file.name}
              </p>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button className="button ghost" onClick={onClose}>
            キャンセル
          </button>
          <button className="button primary" onClick={handleImport} disabled={!file}>
            インポート
          </button>
        </div>
      </div>
    </div>
  );
}

