import React, { useState } from 'react';
import { FahemLogo } from './FahemLogo';
import { GraduationCap, BookOpenCheck, ArrowLeft, ArrowRight, Calendar } from 'lucide-react';
import { UserProfile, UserRole, BirthDate } from '../types';

interface UserProfilePageProps {
  initialIdentifier: string;
  onProfileComplete: (completedUser: UserProfile) => void;
  onBack: () => void;
}

export const UserProfilePage: React.FC<UserProfilePageProps> = ({
  initialIdentifier,
  onProfileComplete,
  onBack,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [day, setDay] = useState<string>('15');
  const [month, setMonth] = useState<string>('6');
  const [year, setYear] = useState<string>('2005');
  const [fullName, setFullName] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Months in Arabic
  const arabicMonths = [
    { value: '1', label: 'يناير (01)' },
    { value: '2', label: 'فبراير (02)' },
    { value: '3', label: 'مارس (03)' },
    { value: '4', label: 'أبريل (04)' },
    { value: '5', label: 'مايو (05)' },
    { value: '6', label: 'يونيو (06)' },
    { value: '7', label: 'يوليو (07)' },
    { value: '8', label: 'أغسطس (08)' },
    { value: '9', label: 'سبتمبر (09)' },
    { value: '10', label: 'أكتوبر (10)' },
    { value: '11', label: 'نوفمبر (11)' },
    { value: '12', label: 'ديسمبر (12)' },
  ];

  // Days 1 to 31
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1));

  // Years from 1950 to 2018
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 70 }, (_, i) => String(currentYear - 6 - i));

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!day || !month || !year) {
      setError('يرجى تحديد تاريخ الميلاد بالكامل');
      return;
    }

    const birthDate: BirthDate = { day, month, year };
    const userProfile: UserProfile = {
      id: `user-${Date.now()}`,
      identifier: initialIdentifier,
      role: selectedRole,
      birthDate,
      isProfileCompleted: true,
      createdAt: new Date().toISOString(),
    };

    // Save in localStorage
    try {
      localStorage.setItem(`fahem_user_${initialIdentifier}`, JSON.stringify(userProfile));
      localStorage.setItem('fahem_current_user', JSON.stringify(userProfile));
    } catch {
      // ignore
    }

    onProfileComplete(userProfile);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center px-4 py-12 bg-[#fafafa]" id="user-profile-page-root">
      <div className="w-full max-w-lg bg-white border border-neutral-200 rounded-3xl p-8 shadow-xs">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <FahemLogo size="md" className="mb-3" />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-100 rounded-full text-neutral-600 text-xs font-bold mb-2">
            <span>الخطوة الثانية: بيانات المستخدم</span>
          </div>
          <h2 className="text-2xl font-black text-black">تخصيص تجربتك التعليمية</h2>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm leading-relaxed">
            ساعدنا على تخصيص أسلوب الشرح ونوع الأسئلة بما يناسب دورك ومرحلتك
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-neutral-100 border border-neutral-300 text-neutral-900 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleContinue} className="space-y-6">
          {/* Role Selection Cards (طالب أو معلم) */}
          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-2.5">
              اختر فئتك التعليمية <span className="text-neutral-400 font-normal">(مطلوب)</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Student Card */}
              <button
                type="button"
                id="role-student-btn"
                onClick={() => setSelectedRole('student')}
                className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between h-36 cursor-pointer ${
                  selectedRole === 'student'
                    ? 'border-black bg-black text-white shadow-xs'
                    : 'border-neutral-200 bg-neutral-50 text-neutral-800 hover:bg-neutral-100'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      selectedRole === 'student'
                        ? 'bg-white/20 text-white'
                        : 'bg-neutral-200 text-neutral-800'
                    }`}
                  >
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <span
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      selectedRole === 'student'
                        ? 'border-white bg-white'
                        : 'border-neutral-400'
                    }`}
                  >
                    {selectedRole === 'student' && (
                      <span className="w-2 h-2 rounded-full bg-black" />
                    )}
                  </span>
                </div>
                <div>
                  <h4 className="text-base font-black">طالب</h4>
                  <p
                    className={`text-[11px] leading-tight mt-0.5 ${
                      selectedRole === 'student' ? 'text-neutral-300' : 'text-neutral-500'
                    }`}
                  >
                    شروحات مبسطة وتلخيص واختبارات لتقييم الفهم
                  </p>
                </div>
              </button>

              {/* Teacher Card */}
              <button
                type="button"
                id="role-teacher-btn"
                onClick={() => setSelectedRole('teacher')}
                className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between h-36 cursor-pointer ${
                  selectedRole === 'teacher'
                    ? 'border-black bg-black text-white shadow-xs'
                    : 'border-neutral-200 bg-neutral-50 text-neutral-800 hover:bg-neutral-100'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      selectedRole === 'teacher'
                        ? 'bg-white/20 text-white'
                        : 'bg-neutral-200 text-neutral-800'
                    }`}
                  >
                    <BookOpenCheck className="w-5 h-5" />
                  </div>
                  <span
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      selectedRole === 'teacher'
                        ? 'border-white bg-white'
                        : 'border-neutral-400'
                    }`}
                  >
                    {selectedRole === 'teacher' && (
                      <span className="w-2 h-2 rounded-full bg-black" />
                    )}
                  </span>
                </div>
                <div>
                  <h4 className="text-base font-black">معلم</h4>
                  <p
                    className={`text-[11px] leading-tight mt-0.5 ${
                      selectedRole === 'teacher' ? 'text-neutral-300' : 'text-neutral-500'
                    }`}
                  >
                    تحليل نواتج التعلم، خطط دراسية، وتوليد بنوك أسئلة
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Date of Birth: Day / Month / Year (3 Dropdowns) */}
          <div>
            <div className="flex items-center gap-1.5 mb-2.5">
              <Calendar className="w-3.5 h-3.5 text-neutral-500" />
              <label className="text-xs font-bold text-neutral-800">
                تاريخ الميلاد: يوم / شهر / سنة
              </label>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {/* Day */}
              <div>
                <span className="block text-[10px] font-semibold text-neutral-500 mb-1">اليوم</span>
                <select
                  id="dob-day-select"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className="w-full text-xs md:text-sm py-2.5 px-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-black focus:outline-none text-neutral-900 cursor-pointer font-medium"
                >
                  {days.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Month */}
              <div>
                <span className="block text-[10px] font-semibold text-neutral-500 mb-1">الشهر</span>
                <select
                  id="dob-month-select"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full text-xs md:text-sm py-2.5 px-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-black focus:outline-none text-neutral-900 cursor-pointer font-medium"
                >
                  {arabicMonths.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year */}
              <div>
                <span className="block text-[10px] font-semibold text-neutral-500 mb-1">السنة</span>
                <select
                  id="dob-year-select"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full text-xs md:text-sm py-2.5 px-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-black focus:outline-none text-neutral-900 cursor-pointer font-medium"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons: Continue to Page 3 */}
          <div className="pt-3 flex items-center justify-between gap-3 border-t border-neutral-100">
            <button
              type="button"
              id="back-to-auth-btn"
              onClick={onBack}
              className="px-4 py-3 text-xs font-bold text-neutral-600 hover:text-black rounded-xl hover:bg-neutral-100 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>رجوع</span>
            </button>

            <button
              type="submit"
              id="profile-continue-btn"
              className="flex-1 py-3 px-6 bg-black hover:bg-neutral-800 active:scale-[0.99] text-white text-sm font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>متابعة إلى واجهة المحادثة</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
