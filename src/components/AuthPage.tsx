import React, { useState } from 'react';
import { FahemLogo } from './FahemLogo';
import { Mail, Phone, Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '../types';

interface AuthPageProps {
  onLoginSuccess: (user: UserProfile) => void;
  onSignUpStart: (tempUser: { identifier: string }) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onLoginSuccess,
  onSignUpStart,
}) => {
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [identifier, setIdentifier] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanIdentifier = identifier.trim();
    if (!cleanIdentifier) {
      setError('يرجى إدخال البريد الإلكتروني أو رقم الهاتف');
      return;
    }

    if (!password || password.length < 4) {
      setError('كلمة المرور يجب ألا تقل عن 4 خانات');
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (isSignUp) {
        // New user goes to Page 2 (User Profile / Category & DOB)
        onSignUpStart({ identifier: cleanIdentifier });
      } else {
        // Existing user logs in
        // Check if there is a saved user in localStorage with this identifier
        let existingUser: UserProfile | null = null;
        try {
          const stored = localStorage.getItem(`fahem_user_${cleanIdentifier}`);
          if (stored) {
            existingUser = JSON.parse(stored);
          }
        } catch {
          // ignore
        }

        if (existingUser && existingUser.isProfileCompleted) {
          onLoginSuccess(existingUser);
        } else {
          // If no profile data saved yet, initiate profile completion
          onSignUpStart({ identifier: cleanIdentifier });
        }
      }
    }, 400);
  };

  // Quick demo credentials shortcut for effortless testing
  const fillDemoAccount = (type: 'student' | 'teacher') => {
    if (type === 'student') {
      setIdentifier('student@fahem.edu');
      setPassword('123456');
    } else {
      setIdentifier('teacher@fahem.edu');
      setPassword('123456');
    }
    setIsSignUp(false);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center px-4 py-12 bg-[#fafafa]" id="auth-page-root">
      <div className="w-full max-w-md bg-white border border-neutral-200 rounded-3xl p-8 shadow-xs">
        {/* Header / Logo */}
        <div className="flex flex-col items-center text-center mb-8">
          <FahemLogo size="lg" className="mb-4" />
          <h1 className="text-2xl font-black text-black tracking-tight">
            {isSignUp ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
          </h1>
          <p className="text-xs text-neutral-500 mt-1 max-w-xs leading-relaxed">
            {isSignUp
              ? 'انضم إلى مجتمع "فَهِم" لتحليل المناهج والاستذكار الذكي'
              : 'مرحباً بك مجدداً! أدخل بياناتك للمتابعة إلى واجهة المحادثة'}
          </p>
        </div>

        {/* Error notice */}
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-neutral-100 border border-neutral-300 text-neutral-900 text-xs font-semibold flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="auth-identifier"
              className="block text-xs font-bold text-neutral-800 mb-1.5"
            >
              البريد الإلكتروني أو رقم الهاتف
            </label>
            <div className="relative">
              <input
                id="auth-identifier"
                type="text"
                dir="auto"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="example@mail.com أو 05xxxxxxxx"
                className="w-full text-sm py-3 px-4 pl-10 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-black focus:outline-none text-neutral-900 transition-all placeholder:text-neutral-400 font-medium"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                <Mail className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="auth-password"
              className="block text-xs font-bold text-neutral-800 mb-1.5"
            >
              كلمة المرور
            </label>
            <div className="relative">
              <input
                id="auth-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-sm py-3 px-4 pl-10 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-black focus:outline-none text-neutral-900 transition-all placeholder:text-neutral-400 font-medium"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                <Lock className="w-4 h-4" />
              </div>
            </div>
          </div>

          {isSignUp && (
            <div>
              <label
                htmlFor="auth-confirm-password"
                className="block text-xs font-bold text-neutral-800 mb-1.5"
              >
                تأكيد كلمة المرور
              </label>
              <div className="relative">
                <input
                  id="auth-confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-sm py-3 px-4 pl-10 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-black focus:outline-none text-neutral-900 transition-all placeholder:text-neutral-400 font-medium"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
            </div>
          )}

          {/* Primary Action Button */}
          <button
            type="submit"
            id="auth-submit-btn"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 bg-black hover:bg-neutral-800 active:scale-[0.99] text-white text-sm font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{isLoading ? 'جاري التحقق...' : isSignUp ? 'إنشاء حساب ومتابعة' : 'تسجيل الدخول'}</span>
            {!isLoading && <ArrowLeft className="w-4 h-4" />}
          </button>
        </form>

        {/* Toggle between Sign In and Sign Up */}
        <div className="mt-6 pt-5 border-t border-neutral-100 text-center">
          <p className="text-xs text-neutral-600">
            {isSignUp ? 'لديك حساب بالفعل؟' : 'ليس لديك حساب حتى الآن؟'}{' '}
            <button
              type="button"
              id="auth-toggle-mode-btn"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="text-black font-black underline underline-offset-4 hover:text-neutral-700 cursor-pointer mr-1"
            >
              {isSignUp ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
            </button>
          </p>
        </div>

        {/* Quick Demo Fillers for testing */}
        <div className="mt-6 pt-4 border-t border-neutral-100">
          <span className="block text-[11px] text-neutral-400 text-center font-medium mb-2">
            حسابات تجريبية سريعة بنقرة واحدة:
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fillDemoAccount('student')}
              className="flex-1 py-1.5 px-2 bg-neutral-100 hover:bg-neutral-200 text-[11px] font-bold text-neutral-800 rounded-lg transition-colors cursor-pointer text-center"
            >
              حساب طالب تجريبي
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('teacher')}
              className="flex-1 py-1.5 px-2 bg-neutral-100 hover:bg-neutral-200 text-[11px] font-bold text-neutral-800 rounded-lg transition-colors cursor-pointer text-center"
            >
              حساب معلم تجريبي
            </button>
          </div>
        </div>
      </div>

      {/* Trust mark */}
      <div className="mt-6 text-center text-xs text-neutral-400">
        فَهِم © 2026 — منصة التعلم الذاتي وتحليل المناهج
      </div>
    </div>
  );
};
