'use client';

import { useState } from 'react';

interface MarkdownImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (content: string) => void;
}

export function MarkdownImportModal({ isOpen, onClose, onImport }: MarkdownImportModalProps) {
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleImport = () => {
    if (!content.trim()) {
      setError('Markdownコンテンツを入力してください');
      return;
    }

    onImport(content);
    setContent('');
    setError(null);
    onClose();
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
          maxWidth: '800px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
          backgroundColor: 'white',
          padding: '2rem'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>Markdownインポート</h3>
          <button className="button ghost" onClick={onClose} style={{ fontSize: '1.5rem' }}>
            ×
          </button>
        </div>

        {error && (
          <div style={{ padding: '1rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '0.25rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label htmlFor="markdown-content">
            Markdownコンテンツ <span style={{ color: '#64748b', fontSize: '0.875rem' }}>(例: # アンケートタイトル)</span>
          </label>
          <textarea
            id="markdown-content"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setError(null);
            }}
            rows={15}
            placeholder={`# アンケートタイトル

説明文（オプション）

## 質問1: 単一選択問題
- [x] 正解の選択肢
- [ ] 不正解の選択肢
- [ ] 不正解の選択肢

## 質問2: 複数選択問題
- [x] 正解1
- [ ] 不正解
- [x] 正解2
- [ ] 不正解

## 質問3: テキスト問題
正解: 正解のテキスト

## 質問4: 数値問題
正解: 42

## 質問5: 通常のアンケート（正解なし）
- 選択肢1
- 選択肢2`}
            style={{ width: '100%', fontFamily: 'monospace' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button className="button ghost" onClick={onClose}>
            キャンセル
          </button>
          <button className="button primary" onClick={handleImport}>
            インポート
          </button>
        </div>
      </div>
    </div>
  );
}

