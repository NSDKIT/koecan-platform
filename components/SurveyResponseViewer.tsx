'use client';

import { useState } from 'react';
import type { SurveyDetail } from '@/lib/types';
import type { SurveyResponseData } from '@/lib/services/dataSources';
interface SurveyResponseViewerProps {
  survey: SurveyDetail;
  responses: SurveyResponseData;
}

export function SurveyResponseViewer({ survey, responses }: SurveyResponseViewerProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCsv = () => {
    setIsExporting(true);
    try {
      // CSV形式でデータを整形
      let csvContent = '回答ID,回答日時';
      
      // 質問列を追加
      if (responses.responses.length > 0 && responses.responses[0].answers.length > 0) {
        responses.responses[0].answers.forEach((answer) => {
          csvContent += `,"${answer.questionText.replace(/"/g, '""')}"`;
        });
      }
      csvContent += '\n';

      // 回答データを追加
      responses.responses.forEach((response) => {
        csvContent += `"${response.id}","${new Date(response.submittedAt).toLocaleString('ja-JP')}"`;
        response.answers.forEach((answer) => {
          const value = answer.answerText || answer.answerNumber?.toString() || '';
          csvContent += `,"${value.replace(/"/g, '""')}"`;
        });
        csvContent += '\n';
      });

      // BOM付きUTF-8でエンコード
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `survey_responses_${survey.id.substring(0, 8)}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('CSVエクスポートエラー:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = () => {
    // Excel形式のエクスポートは、CSVとして実装（実際のExcel形式にはライブラリが必要）
    handleExportCsv();
  };

  if (responses.totalResponses === 0) {
    return (
      <div className="card">
        <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>
          まだ回答がありません。
        </p>
      </div>
    );
  }

  return (
    <div className="card" style={{ display: 'grid', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ margin: 0 }}>回答一覧</h4>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="button secondary"
            type="button"
            onClick={handleExportCsv}
            disabled={isExporting}
          >
            CSV形式でダウンロード
          </button>
          <button
            className="button secondary"
            type="button"
            onClick={handleExportExcel}
            disabled={isExporting}
          >
            Excel形式でダウンロード
          </button>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              <th>回答ID</th>
              <th>回答日時</th>
              {survey.questions.map((question) => (
                <th key={question.id}>{question.questionText}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {responses.responses.map((response) => (
              <tr key={response.id}>
                <td style={{ fontSize: '0.875rem', color: '#64748b' }}>
                  {response.id.substring(0, 8)}...
                </td>
                <td style={{ fontSize: '0.875rem' }}>
                  {new Date(response.submittedAt).toLocaleString('ja-JP')}
                </td>
                {survey.questions.map((question) => {
                  const answer = response.answers.find((a) => a.questionId === question.id);
                  return (
                    <td key={question.id} style={{ fontSize: '0.875rem', maxWidth: '200px', wordBreak: 'break-word' }}>
                      {answer?.answerText || answer?.answerNumber?.toString() || '-'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ marginTop: '1rem', backgroundColor: '#f8fafc' }}>
        <h5 style={{ marginBottom: '0.5rem' }}>集計データ</h5>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <strong>質問別集計</strong>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
              各質問の回答分布を表示（実装予定）
            </p>
          </div>
          <div>
            <strong>グラフ表示</strong>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
              円グラフ・棒グラフで表示（実装予定）
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

