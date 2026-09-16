import React, { useState } from 'react';
import { Star, CheckCircle2, MessageSquareHeart, Send } from 'lucide-react';
import { FeedbackData } from '../types';

export const FeedbackSection: React.FC = () => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim() && rating === 0) return;

    const feedbackItem: FeedbackData = {
      id: `fb-${Date.now()}`,
      rating,
      notes,
      submittedAt: new Date().toISOString(),
    };

    // Store in localStorage for persistence
    try {
      const existing = JSON.parse(localStorage.getItem('fahem_feedbacks') || '[]');
      localStorage.setItem('fahem_feedbacks', JSON.stringify([feedbackItem, ...existing]));
    } catch {
      // ignore
    }

    setSubmitted(true);
    setTimeout(() => {
      setNotes('');
      setSubmitted(false);
    }, 4000);
  };

  return (
    <div className="w-full bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs" id="feedback-section">
      <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-neutral-100">
        <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-black">
          <MessageSquareHeart className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-black">تقييم التجربة وإبداء الملاحظات</h3>
          <p className="text-xs text-neutral-500">رأيك يساعدنا في تحسين دقة الشرح وتوليد الامتحانات</p>
        </div>
      </div>

      {submitted ? (
        <div className="py-6 px-4 text-center bg-neutral-50 rounded-xl border border-neutral-200 flex flex-col items-center justify-center gap-2">
          <CheckCircle2 className="w-8 h-8 text-black" />
          <h4 className="text-base font-bold text-black">شكراً لك على تقييمك!</h4>
          <p className="text-xs text-neutral-500">تم استلام ملاحظاتك بنجاح، ونعمل دائماً على تطوير منصة "فَهِم".</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-2">
              ما مدى رضاك عن مستوى التحليل والشروحات؟
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = (hoverRating !== null ? hoverRating : rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    id={`star-rating-${star}`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1 rounded-md text-neutral-300 hover:text-black transition-colors focus:outline-none"
                    title={`${star} من 5 نجوم`}
                  >
                    <Star
                      className={`w-6 h-6 transition-transform ${
                        isFilled ? 'fill-black text-black scale-110' : 'text-neutral-300'
                      }`}
                    />
                  </button>
                );
              })}
              <span className="text-xs text-neutral-500 mr-2 font-medium">
                {rating === 5 && 'ممتاز جداً'}
                {rating === 4 && 'جيد جداً'}
                {rating === 3 && 'جيد'}
                {rating === 2 && 'مقبول'}
                {rating === 1 && 'بحاجة لتحسين'}
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="feedback-notes" className="block text-xs font-semibold text-neutral-700 mb-1.5">
              ملاحظاتك أو مقترحاتك الإضافية
            </label>
            <textarea
              id="feedback-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="اكتب أي ملاحظة أو فكرة تود إضافتها في المنصة..."
              className="w-full text-sm p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-black focus:outline-none text-neutral-900 placeholder:text-neutral-400 resize-none transition-all"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              id="submit-feedback-btn"
              className="px-5 py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:bg-neutral-800 active:scale-95 transition-all flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>إرسال التقييم</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
