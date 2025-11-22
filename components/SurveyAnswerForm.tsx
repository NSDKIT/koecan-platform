'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { SurveyDetail, SurveyAnswer, QuestionType } from '@/lib/types';
import { submitSurveyResponse } from '@/lib/actions/platformActions';

interface SurveyAnswerFormProps {
  survey: SurveyDetail;
  userId: string;
}

export function SurveyAnswerForm({ survey, userId }: SurveyAnswerFormProps) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, SurveyAnswer>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateAnswer = (questionId: string, answer: Partial<SurveyAnswer>) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        questionId,
        ...prev[questionId],
        ...answer
      }
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // 必須項目のチェック
    const requiredQuestions = survey.questions.filter((q) => q.isRequired);
    const missingAnswers = requiredQuestions.filter((q) => {
      const answer = answers[q.id];
      if (!answer) return true;
      if (q.questionType === 'single_choice' || q.questionType === 'multiple_choice') {
        return !answer.selectedOptionIds || answer.selectedOptionIds.length === 0;
      }
      if (q.questionType === 'text') {
        return !answer.answerText || answer.answerText.trim() === '';
      }
      if (q.questionType === 'number' || q.questionType === 'rating') {
        return answer.answerNumber === undefined;
      }
      return false;
    });

    if (missingAnswers.length > 0) {
      setError(`必須項目が未回答です: ${missingAnswers.map((q) => q.questionText).join(', ')}`);
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('surveyId', survey.id);
      formData.append('userId', userId);
      formData.append('answers', JSON.stringify(Object.values(answers)));

      const result = await submitSurveyResponse(formData);

      if (!result.success) {
        setError(result.message || '回答の送信に失敗しました');
        setIsSubmitting(false);
        return;
      }

      // 成功時はダッシュボードにリダイレクト
      router.push(`/dashboard?message=survey_completed&points=${survey.rewardPoints}`);
    } catch (err) {
      setError('回答の送信に失敗しました。もう一度お試しください。');
      setIsSubmitting(false);
    }
  };

  const renderQuestion = (question: SurveyDetail['questions'][0]) => {
    const answer = answers[question.id];

    switch (question.questionType) {
      case 'single_choice':
        return (
          <div key={question.id} style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
              {question.questionText}
              {question.isRequired && <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*</span>}
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {question.options.map((option) => (
                <label key={option.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={option.id}
                    checked={answer?.selectedOptionIds?.includes(option.id) || false}
                    onChange={() => updateAnswer(question.id, { selectedOptionIds: [option.id] })}
                    required={question.isRequired}
                  />
                  <span>{option.optionText}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'multiple_choice':
        return (
          <div key={question.id} style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
              {question.questionText}
              {question.isRequired && <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*</span>}
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {question.options.map((option) => (
                <label key={option.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={answer?.selectedOptionIds?.includes(option.id) || false}
                    onChange={(e) => {
                      const currentIds = answer?.selectedOptionIds || [];
                      const newIds = e.target.checked
                        ? [...currentIds, option.id]
                        : currentIds.filter((id) => id !== option.id);
                      updateAnswer(question.id, { selectedOptionIds: newIds });
                    }}
                  />
                  <span>{option.optionText}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'text':
        return (
          <div key={question.id} style={{ marginBottom: '2rem' }}>
            <label htmlFor={`question-${question.id}`} style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
              {question.questionText}
              {question.isRequired && <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*</span>}
            </label>
            <textarea
              id={`question-${question.id}`}
              rows={4}
              value={answer?.answerText || ''}
              onChange={(e) => updateAnswer(question.id, { answerText: e.target.value })}
              required={question.isRequired}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #cbd5e1' }}
            />
          </div>
        );

      case 'number':
        return (
          <div key={question.id} style={{ marginBottom: '2rem' }}>
            <label htmlFor={`question-${question.id}`} style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
              {question.questionText}
              {question.isRequired && <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*</span>}
            </label>
            <input
              id={`question-${question.id}`}
              type="number"
              value={answer?.answerNumber || ''}
              onChange={(e) => updateAnswer(question.id, { answerNumber: parseInt(e.target.value, 10) || undefined })}
              required={question.isRequired}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #cbd5e1' }}
            />
          </div>
        );

      case 'rating':
        return (
          <div key={question.id} style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
              {question.questionText}
              {question.isRequired && <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*</span>}
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                <label key={rating} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={rating}
                    checked={answer?.answerNumber === rating}
                    onChange={() => updateAnswer(question.id, { answerNumber: rating })}
                    required={question.isRequired}
                  />
                  <span>{rating}</span>
                </label>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div style={{ padding: '1rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '0.25rem', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {survey.questions.length === 0 ? (
        <p style={{ color: '#64748b' }}>このアンケートには質問がありません。</p>
      ) : (
        <>
          {survey.questions.sort((a, b) => a.displayOrder - b.displayOrder).map((question) => renderQuestion(question))}

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
            <button type="button" className="button ghost" onClick={() => router.back()}>
              キャンセル
            </button>
            <button type="submit" className="button primary" disabled={isSubmitting}>
              {isSubmitting ? '送信中...' : `回答を送信する（${survey.rewardPoints}pt獲得）`}
            </button>
          </div>
        </>
      )}
    </form>
  );
}

