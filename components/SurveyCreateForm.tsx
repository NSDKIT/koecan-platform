'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { QuestionType } from '@/lib/types';
import { createSurvey } from '@/lib/actions/platformActions';

interface SurveyQuestion {
  id: string;
  questionText: string;
  questionType: QuestionType;
  isRequired: boolean;
  displayOrder: number;
  options: { id: string; optionText: string; isCorrect?: boolean }[];
  correctAnswerText?: string;
  correctAnswerNumber?: number;
}

interface SurveyCreateFormProps {
  userId: string;
}

export function SurveyCreateForm({ userId }: SurveyCreateFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'daily' | 'campaign' | 'career' | 'premium'>('daily');
  const [rewardPoints, setRewardPoints] = useState(30);
  const [deadline, setDeadline] = useState('');
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addQuestion = () => {
    const newQuestion: SurveyQuestion = {
      id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      questionText: '',
      questionType: 'single_choice',
      isRequired: true,
      displayOrder: questions.length,
      options: []
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (questionId: string) => {
    setQuestions(questions.filter((q) => q.id !== questionId).map((q, index) => ({ ...q, displayOrder: index })));
  };

  const updateQuestion = (questionId: string, updates: Partial<SurveyQuestion>) => {
    setQuestions(questions.map((q) => (q.id === questionId ? { ...q, ...updates } : q)));
  };

  const addOption = (questionId: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            options: [
              ...q.options,
              { id: `opt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, optionText: '' }
            ]
          };
        }
        return q;
      })
    );
  };

  const removeOption = (questionId: string, optionId: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            options: q.options.filter((opt) => opt.id !== optionId)
          };
        }
        return q;
      })
    );
  };

  const updateOption = (questionId: string, optionId: string, optionText: string, isCorrect?: boolean) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            options: q.options.map((opt) => {
              if (opt.id === optionId) {
                const updated = { ...opt, optionText };
                if (isCorrect !== undefined) {
                  updated.isCorrect = isCorrect;
                }
                return updated;
              }
              // single_choiceの場合は他の選択肢の正解を解除
              if (q.questionType === 'single_choice' && isCorrect === true) {
                return { ...opt, isCorrect: false };
              }
              return opt;
            })
          };
        }
        return q;
      })
    );
  };

  const toggleOptionCorrect = (questionId: string, optionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    const option = question.options.find(opt => opt.id === optionId);
    if (!option) return;

    const newIsCorrect = !option.isCorrect;
    updateOption(questionId, optionId, option.optionText, newIsCorrect);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // バリデーション
    if (!title.trim()) {
      setError('タイトルを入力してください');
      return;
    }

    if (questions.length === 0) {
      setError('少なくとも1つ質問を追加してください');
      return;
    }

    // 質問のバリデーション
    for (const question of questions) {
      if (!question.questionText.trim()) {
        setError(`質問${question.displayOrder + 1}の質問文を入力してください`);
        return;
      }

      if (
        (question.questionType === 'single_choice' || question.questionType === 'multiple_choice') &&
        question.options.length < 2
      ) {
        setError(`質問${question.displayOrder + 1}には少なくとも2つの選択肢が必要です`);
        return;
      }

      for (const option of question.options) {
        if (!option.optionText.trim()) {
          setError(`質問${question.displayOrder + 1}の選択肢が空です`);
          return;
        }
      }
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('rewardPoints', rewardPoints.toString());
      formData.append('deadline', deadline);
      formData.append('questions', JSON.stringify(questions));

      const result = await createSurvey(formData);

      if (!result.success) {
        setError(result.message || 'アンケートの作成に失敗しました');
        setIsSubmitting(false);
        return;
      }

      // 成功時はダッシュボードにリダイレクト
      router.push('/client?message=survey_created');
    } catch (err) {
      setError('アンケートの作成に失敗しました。もう一度お試しください。');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '2rem' }}>
      {error && (
        <div style={{ padding: '1rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '0.25rem' }}>
          {error}
        </div>
      )}

      <div className="card" style={{ display: 'grid', gap: '1rem' }}>
        <h4>基本情報</h4>
        <div className="form-group">
          <label htmlFor="title">
            タイトル <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: '100%' }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">説明文</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="form-group">
            <label htmlFor="category">
              カテゴリ <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              required
              style={{ width: '100%' }}
            >
              <option value="daily">デイリー</option>
              <option value="campaign">キャンペーン</option>
              <option value="career">キャリア</option>
              <option value="premium">プレミアム</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="rewardPoints">
              報酬ポイント <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              id="rewardPoints"
              type="number"
              value={rewardPoints}
              onChange={(e) => setRewardPoints(parseInt(e.target.value, 10) || 0)}
              required
              min={1}
              style={{ width: '100%' }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="deadline">
              回答期限 <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              id="deadline"
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>

      <div className="card" style={{ display: 'grid', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4>質問</h4>
          <button type="button" className="button secondary" onClick={addQuestion}>
            + 質問を追加
          </button>
        </div>

        {questions.length === 0 ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>
            質問がありません。質問を追加してください。
          </p>
        ) : (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {questions.map((question, index) => (
              <div key={question.id} className="card" style={{ border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h5 style={{ margin: 0 }}>質問 {index + 1}</h5>
                  <button
                    type="button"
                    className="button ghost"
                    onClick={() => removeQuestion(question.id)}
                    style={{ color: '#ef4444' }}
                  >
                    削除
                  </button>
                </div>

                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div className="form-group">
                    <label>
                      質問文 <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <textarea
                      value={question.questionText}
                      onChange={(e) => updateQuestion(question.id, { questionText: e.target.value })}
                      rows={2}
                      required
                      style={{ width: '100%' }}
                      placeholder="質問を入力してください"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div className="form-group">
                      <label>質問タイプ</label>
                      <select
                        value={question.questionType}
                        onChange={(e) => updateQuestion(question.id, { questionType: e.target.value as QuestionType })}
                        style={{ width: '100%' }}
                      >
                        <option value="single_choice">単一選択</option>
                        <option value="multiple_choice">複数選択</option>
                        <option value="text">自由記述</option>
                        <option value="number">数値入力</option>
                        <option value="rating">評価スケール（1-10）</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={question.isRequired}
                          onChange={(e) => updateQuestion(question.id, { isRequired: e.target.checked })}
                        />{' '}
                        必須
                      </label>
                    </div>
                  </div>

                  {(question.questionType === 'single_choice' || question.questionType === 'multiple_choice') && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <label>選択肢</label>
                        <button type="button" className="button ghost" onClick={() => addOption(question.id)}>
                          + 選択肢を追加
                        </button>
                      </div>
                      <div style={{ display: 'grid', gap: '0.5rem' }}>
                        {question.options.map((option, optIndex) => (
                          <div key={option.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span style={{ minWidth: '2rem' }}>{optIndex + 1}.</span>
                            <input
                              type="text"
                              value={option.optionText}
                              onChange={(e) => updateOption(question.id, option.id, e.target.value)}
                              placeholder="選択肢を入力"
                              style={{ flex: 1 }}
                            />
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                              <input
                                type={question.questionType === 'single_choice' ? 'radio' : 'checkbox'}
                                checked={option.isCorrect || false}
                                onChange={() => toggleOptionCorrect(question.id, option.id)}
                                name={question.questionType === 'single_choice' ? `correct-${question.id}` : undefined}
                              />
                              <span style={{ fontSize: '0.875rem', whiteSpace: 'nowrap' }}>正解</span>
                            </label>
                            <button
                              type="button"
                              className="button ghost"
                              onClick={() => removeOption(question.id, option.id)}
                              style={{ color: '#ef4444' }}
                            >
                              削除
                            </button>
                          </div>
                        ))}
                        {question.options.length < 2 && (
                          <p style={{ color: '#f59e0b', fontSize: '0.875rem', margin: 0 }}>
                            少なくとも2つの選択肢が必要です
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {question.questionType === 'text' && (
                    <div className="form-group">
                      <label>正解（テキスト回答）</label>
                      <input
                        type="text"
                        value={question.correctAnswerText || ''}
                        onChange={(e) => updateQuestion(question.id, { correctAnswerText: e.target.value })}
                        placeholder="正解のテキストを入力（クイズの場合）"
                        style={{ width: '100%' }}
                      />
                      <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
                        正解を設定すると、このアンケートはクイズとして扱われます（空欄の場合は通常のアンケート）
                      </p>
                    </div>
                  )}

                  {question.questionType === 'number' && (
                    <div className="form-group">
                      <label>正解（数値回答）</label>
                      <input
                        type="number"
                        value={question.correctAnswerNumber || ''}
                        onChange={(e) => updateQuestion(question.id, { correctAnswerNumber: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                        placeholder="正解の数値を入力（クイズの場合）"
                        style={{ width: '100%' }}
                      />
                      <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
                        正解を設定すると、このアンケートはクイズとして扱われます（空欄の場合は通常のアンケート）
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
        <button type="button" className="button ghost" onClick={() => router.back()}>
          キャンセル
        </button>
        <button type="submit" className="button primary" disabled={isSubmitting || questions.length === 0}>
          {isSubmitting ? '作成中...' : 'アンケートを作成'}
        </button>
      </div>
    </form>
  );
}

