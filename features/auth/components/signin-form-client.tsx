'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FaGithub, FaGoogle } from 'react-icons/fa';
import { Loader2 } from 'lucide-react';
import { authClient } from '../client';
import { DEFAULT_LOGIN_REDIRECT } from '@/route';

const SignInFormClient = () => {
  const [activeLoading, setActiveLoading] = useState<'google' | 'github' | null>(null);

  const handleSocialSignIn = async (provider: 'google' | 'github') => {
    setActiveLoading(provider);
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: DEFAULT_LOGIN_REDIRECT,
      });
    } catch (error) {
      console.error(`${provider} auth initiation collapsed:`, error);
      setActiveLoading(null);
    }
  };

  return (
    <div className="relative group w-full max-w-md">
      <div className="absolute -inset-0.5 rounded-2xl bg-linear-to-r from-sky-500 via-indigo-500 to-purple-600 opacity-20 blur-xl group-hover:opacity-35 transition-all duration-700" />

      <Card className="relative w-full border-neutral-900/60 bg-neutral-950/80 backdrop-blur-xl rounded-2xl p-3 shadow-2xl">
        <CardHeader className="space-y-2 pt-6 pb-4">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-neutral-900 to-neutral-800 border border-neutral-800 text-sky-400 font-bold text-lg shadow-inner">
            ⚡
          </div>
          <CardTitle className="text-2xl font-extrabold text-center tracking-tight bg-linear-to-b from-white to-neutral-400 bg-clip-text text-transparent">
            Welcome to Intabide
          </CardTitle>
          <CardDescription className="text-center text-xs text-neutral-500 tracking-wide">
            Authenticate to sync your isolated VFS core cloud nodes
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-3 pt-2">
          <Button
            onClick={() => handleSocialSignIn('github')}
            disabled={activeLoading !== null}
            type="button"
            className="w-full h-11 justify-center rounded-xl border border-neutral-900 bg-neutral-900 text-neutral-200 shadow-md transition-all duration-300 hover:bg-neutral-800 hover:text-white active:scale-[0.98] disabled:opacity-50"
          >
            {activeLoading === 'github' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-sky-400" />
            ) : (
              <FaGithub className="mr-2.5 h-4 w-4 text-white" />
            )}
            <span className="text-xs font-semibold tracking-wide">Continue with GitHub</span>
          </Button>

          <Button
            onClick={() => handleSocialSignIn('google')}
            disabled={activeLoading !== null}
            type="button"
            className="w-full h-11 justify-center rounded-xl border border-neutral-900 bg-neutral-900 text-neutral-200 shadow-md transition-all duration-300 hover:bg-neutral-800 hover:text-white active:scale-[0.98] disabled:opacity-50"
          >
            {activeLoading === 'google' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-sky-400" />
            ) : (
              <FaGoogle className="mr-2.5 h-4 w-4 text-neutral-400 group-hover:text-red-400 transition-colors" />
            )}
            <span className="text-xs font-semibold tracking-wide">Continue with Google</span>
          </Button>
        </CardContent>

        <CardFooter className="pb-6 pt-2">
          <p className="text-[10px] text-center text-neutral-600 font-medium tracking-normal leading-relaxed w-full max-w-70 mx-auto">
            By accessing this IDE container, you affirm agreement to our{' '}
            <a
              href="#"
              className="text-neutral-400 underline hover:text-sky-400 transition-colors duration-200"
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a
              href="#"
              className="text-neutral-400 underline hover:text-sky-400 transition-colors duration-200"
            >
              Privacy Directives
            </a>
            .
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignInFormClient;
