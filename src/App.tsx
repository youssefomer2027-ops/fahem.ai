/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthPage } from './components/AuthPage';
import { UserProfilePage } from './components/UserProfilePage';
import { ChatInterface } from './components/ChatInterface';
import { UserProfile } from './types';

type PageStep = 'auth' | 'profile' | 'chat';

export default function App() {
  const [currentStep, setCurrentStep] = useState<PageStep>('auth');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [tempIdentifier, setTempIdentifier] = useState<string>('');

  // Restore saved login state on initial mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('fahem_current_user');
      if (savedUser) {
        const parsed: UserProfile = JSON.parse(savedUser);
        if (parsed.isProfileCompleted) {
          setCurrentUser(parsed);
          setCurrentStep('chat');
        } else {
          setTempIdentifier(parsed.identifier);
          setCurrentStep('profile');
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // When user successfully signs in with an existing account
  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('fahem_current_user', JSON.stringify(user));
    } catch {
      // ignore
    }
    setCurrentStep('chat');
  };

  // When a new user signs up -> proceeds to Page 2 (Profile / Category & Birth Date)
  const handleSignUpStart = (tempUser: { identifier: string }) => {
    setTempIdentifier(tempUser.identifier);
    setCurrentStep('profile');
  };

  // When Page 2 profile is completed -> proceeds to Page 3 (Chat Interface)
  const handleProfileComplete = (completedUser: UserProfile) => {
    setCurrentUser(completedUser);
    try {
      localStorage.setItem('fahem_current_user', JSON.stringify(completedUser));
    } catch {
      // ignore
    }
    setCurrentStep('chat');
  };

  // Logout handler
  const handleLogout = () => {
    try {
      localStorage.removeItem('fahem_current_user');
    } catch {
      // ignore
    }
    setCurrentUser(null);
    setTempIdentifier('');
    setCurrentStep('auth');
  };

  return (
    <div className="min-h-screen w-full bg-[#fafafa] font-['Cairo',sans-serif] text-neutral-900 selection:bg-neutral-900 selection:text-white" dir="rtl">
      {currentStep === 'auth' && (
        <AuthPage
          onLoginSuccess={handleLoginSuccess}
          onSignUpStart={handleSignUpStart}
        />
      )}

      {currentStep === 'profile' && (
        <UserProfilePage
          initialIdentifier={tempIdentifier || 'طالب جديد'}
          onProfileComplete={handleProfileComplete}
          onBack={() => setCurrentStep('auth')}
        />
      )}

      {currentStep === 'chat' && currentUser && (
        <ChatInterface
          user={currentUser}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}
