import SignInFormClient from '@/features/auth/components/signin-form-client';
import React from 'react';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#060606] px-4 dark select-none overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.03),transparent_45%)] pointer-events-none" />

      <SignInFormClient />
    </div>
  );
}
