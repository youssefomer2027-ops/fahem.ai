import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { FaqItem } from '../types';

const FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'ما هي أنواع الملفات والكتب التي يدعمها "فَهِم"؟',
    answer:
      'يدعم النظام ملفات PDF، والمستندات النصية (TXT / Markdown / Word)، كما يمكنك سحب وإفلات أي كتاب أو منهج دراسي ليقوم النظام بفهرسته وتحليله فورياً.',
  },
  {
    id: 'faq-2',
    question: 'كيف يقوم النظام بتحليل واستيعاب محتوى الكتاب؟',
    answer:
      'يستخدم "فَهِم" محرك ذكاء اصطناعي متطور يقوم باستخراج النصوص، وتقسيم المنهج إلى وحدات ومفاهيم أساسية، ثم استخراج الأفكار المحورية، ليكون جاهزاً لشرحها أو تلخيصها أو وضع امتحانات عليها.',
  },
  {
    id: 'faq-3',
    question: 'ما هو الفرق بين تجربة "الطالب" وتجربة "المعلم"؟',
    answer:
      'حساب الطالب يُركز على التبسيط، وتقديم أمثلة تعليمية تفاعلية، واختبارات قياس الفهم مع تصحيح فوري. أما حساب المعلم فيقدم تحليلاً أكاديمياً لنواتج التعلم، وأدلة تدريس، وأسئلة تقييم تكويني وتشخيصي وفق المستويات المعرفية.',
  },
  {
    id: 'faq-4',
    question: 'هل يمكنني خوض امتحانات متعددة لنفس الكتاب؟',
    answer:
      'نعم بالتأكيد! يمكنك في أي وقت طلب امتحان جديد، وسيقوم النظام بتوليد مجموعة جديدة من الأسئلة المتنوعة التي تقيس الفهم، مع توضيح سبب صحة أو خطأ كل إجابة بعد التسليم.',
  },
  {
    id: 'faq-5',
    question: 'هل يتم حفظ ملفاتي ومحادثاتي السابقة؟',
    answer:
      'نعم، يحفظ النظام جلسة تسجيل الدخول وبيانات ملفك التعليمي تلقائياً في متصفحك حتى تتمكن من متابعة دراستك في أي وقت بدون فقدان تقدمك.',
  },
];

export const FaqSection: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleFaq = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="w-full bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs" id="faq-section">
      <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-neutral-100">
        <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-black">
          <HelpCircle className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-black">الأسئلة الشائعة (FAQ)</h3>
          <p className="text-xs text-neutral-500">إجابات سريعة حول كيفية استخدام المنصة وتحليل المناهج</p>
        </div>
      </div>

      <div className="divide-y divide-neutral-100">
        {FAQS.map((faq) => {
          const isOpen = openId === faq.id;
          return (
            <div key={faq.id} className="py-3.5 first:pt-0 last:pb-0">
              <button
                type="button"
                id={`faq-btn-${faq.id}`}
                onClick={() => toggleFaq(faq.id)}
                className="w-full flex items-center justify-between text-right gap-4 py-1 text-neutral-900 font-bold hover:text-black transition-colors focus:outline-none"
              >
                <span className="text-sm md:text-base leading-relaxed">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-neutral-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-black' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div
                  id={`faq-answer-${faq.id}`}
                  className="mt-2.5 text-sm text-neutral-600 leading-relaxed pr-2 pl-4 py-2 bg-neutral-50 rounded-xl border border-neutral-100"
                >
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
