import React, { useState } from 'react';
import { CheckCircle2, XCircle, Award, RotateCcw, HelpCircle, ArrowRight } from 'lucide-react';
import { QuizData } from '../types';

interface ExamViewerProps {
  quiz: QuizData;
  onAskFollowup?: (prompt: string) => void;
  onResetExam?: () => void;
}

export const ExamViewer: React.FC<ExamViewerProps> = ({
  quiz,
  onAskFollowup,
  onResetExam,
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<{ [questionId: string]: number }>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const totalQuestions = quiz.questions.length;
  const isAllAnswered = answeredCount === totalQuestions;

  // Calculate score
  let correctCount = 0;
  if (isSubmitted) {
    quiz.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswerIndex) {
        correctCount += 1;
      }
    });
  }

  const scorePercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  const handleSubmitExam = () => {
    if (answeredCount === 0) return;
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    if (onResetExam) onResetExam();
  };

  return (
    <div className="w-full bg-white border border-neutral-200 rounded-2xl p-5 md:p-6 my-3 shadow-xs space-y-6" id="exam-viewer-card">
      {/* Exam Header */}
      <div className="border-b border-neutral-100 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-black text-white text-[11px] font-bold rounded-lg">
              اختبار تدريبي
            </span>
            <span className="text-xs text-neutral-500 font-medium">
              {totalQuestions} أسئلة اختيار من متعدد
            </span>
          </div>
          {!isSubmitted && (
            <span className="text-xs font-bold text-neutral-700 bg-neutral-100 px-2.5 py-1 rounded-md">
              تمت الإجابة: {answeredCount} من {totalQuestions}
            </span>
          )}
        </div>
        <h3 className="text-xl font-bold text-black">{quiz.title}</h3>
        {quiz.description && (
          <p className="text-xs text-neutral-500 mt-1">{quiz.description}</p>
        )}
      </div>

      {/* Score Summary Box (when submitted) */}
      {isSubmitted && (
        <div className="p-5 bg-neutral-50 border border-neutral-200 rounded-xl space-y-3" id="exam-results-summary">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-neutral-500 font-bold block">النتيجة النهائية</span>
                <div className="text-2xl font-black text-black">
                  {correctCount} / {totalQuestions}{' '}
                  <span className="text-sm font-semibold text-neutral-500">
                    ({scorePercentage}%)
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                id="retake-exam-btn"
                className="px-3 py-2 text-xs font-bold text-neutral-800 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-100 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إعادة الاختبار</span>
              </button>

              {correctCount < totalQuestions && onAskFollowup && (
                <button
                  type="button"
                  id="explain-mistakes-btn"
                  onClick={() =>
                    onAskFollowup(
                      'أرجو شرح الأسئلة التي أخطأت فيها في الاختبار وتوضيح كيفية استيعاب المفاهيم الصحيحة.'
                    )
                  }
                  className="px-3.5 py-2 text-xs font-bold text-white bg-black rounded-lg hover:bg-neutral-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>شرح الأسئلة الخاطئة في الشات</span>
                </button>
              )}
            </div>
          </div>

          <p className="text-xs text-neutral-600 pt-2 border-t border-neutral-200">
            {scorePercentage >= 80
              ? '🎉 أداء استثنائي! يدل على استيعاب عميق وفهم متميز لمحتوى المنهج.'
              : scorePercentage >= 60
              ? '👍 أداء جيد جداً! راجع الشروحات التفصيلية أدناه لتعزيز النقاط التي تحتاج تثبيتاً.'
              : '📖 تحتاج للمزيد من التركيز وقراءة الشروحات والتلاخيص، راجع تصحيح كل سؤال في الأسفل.'}
          </p>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-6">
        {quiz.questions.map((question, qIdx) => {
          const userAnswer = selectedAnswers[question.id];
          const hasAnswered = userAnswer !== undefined;
          const isCorrect = isSubmitted && userAnswer === question.correctAnswerIndex;
          const isWrong = isSubmitted && hasAnswered && !isCorrect;

          return (
            <div
              key={question.id}
              id={`question-box-${question.id}`}
              className={`p-4 rounded-xl border transition-all ${
                isSubmitted
                  ? isCorrect
                    ? 'border-neutral-400 bg-neutral-50/50'
                    : isWrong
                    ? 'border-neutral-400 bg-neutral-50/70'
                    : 'border-neutral-200'
                  : 'border-neutral-200 bg-white hover:border-neutral-300'
              }`}
            >
              {/* Question text */}
              <div className="flex items-start gap-3 mb-3.5">
                <span className="w-6 h-6 rounded-full bg-neutral-100 text-black text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                  {qIdx + 1}
                </span>
                <div className="flex-1">
                  <h4 className="text-sm md:text-base font-bold text-neutral-900 leading-relaxed">
                    {question.questionText}
                  </h4>
                </div>

                {isSubmitted && (
                  <div className="shrink-0 mr-2">
                    {isCorrect ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-black bg-neutral-200/80 px-2 py-1 rounded-md">
                        <CheckCircle2 className="w-4 h-4 text-black" />
                        <span>إجابة صحيحة</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-bold text-black bg-neutral-200 px-2 py-1 rounded-md">
                        <XCircle className="w-4 h-4 text-neutral-800" />
                        <span>إجابة خاطئة</span>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Options */}
              <div className="space-y-2 mr-9">
                {question.options.map((option, optIdx) => {
                  const isSelected = userAnswer === optIdx;
                  const isOptionCorrect = optIdx === question.correctAnswerIndex;

                  let optionStyle = 'bg-neutral-50 border-neutral-200 text-neutral-800 hover:bg-neutral-100 hover:border-neutral-300';

                  if (isSubmitted) {
                    if (isOptionCorrect) {
                      // Correct option always highlighted with clear black border and solid indicator
                      optionStyle = 'bg-neutral-900 text-white border-neutral-900 font-bold';
                    } else if (isSelected && !isOptionCorrect) {
                      // User's wrong option
                      optionStyle = 'bg-neutral-200 text-neutral-600 line-through border-neutral-400';
                    } else {
                      optionStyle = 'bg-neutral-50 text-neutral-400 border-neutral-200';
                    }
                  } else if (isSelected) {
                    optionStyle = 'bg-neutral-900 text-white border-neutral-900 font-bold shadow-xs';
                  }

                  const optionLetters = ['أ', 'ب', 'ج', 'د'];

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={isSubmitted}
                      onClick={() => handleSelectOption(question.id, optIdx)}
                      className={`w-full text-right p-3 rounded-xl border text-xs md:text-sm flex items-center justify-between gap-3 transition-all cursor-pointer ${optionStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold ${
                            isSelected || (isSubmitted && isOptionCorrect)
                              ? 'bg-white/20 text-white'
                              : 'bg-neutral-200 text-neutral-700'
                          }`}
                        >
                          {optionLetters[optIdx] || optIdx + 1}
                        </span>
                        <span className="leading-relaxed">{option}</span>
                      </div>

                      {isSubmitted && isOptionCorrect && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-white text-black">
                          الإجابة الصحيحة
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation (Shown upon submission) */}
              {isSubmitted && question.explanation && (
                <div className="mt-4 mr-9 p-3.5 bg-neutral-100 border border-neutral-200 rounded-xl text-xs text-neutral-700 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-black">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>شرح وتصحيح السؤال:</span>
                  </div>
                  <p className="leading-relaxed text-neutral-800 pr-5">
                    {question.explanation}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit Button */}
      {!isSubmitted && (
        <div className="pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-neutral-500">
            {isAllAnswered
              ? 'لقد أجبت عن جميع الأسئلة! اضغط تسليم لعرض النتيجة والشرح.'
              : `تبقى ${totalQuestions - answeredCount} أسئلة لم تُجب عنها بعد.`}
          </p>
          <button
            type="button"
            id="submit-exam-btn"
            disabled={answeredCount === 0}
            onClick={handleSubmitExam}
            className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              answeredCount > 0
                ? 'bg-black text-white hover:bg-neutral-800 shadow-xs'
                : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
            }`}
          >
            <span>تسليم الامتحان وعرض النتيجة</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
