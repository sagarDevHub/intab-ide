'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Code2, ShieldCheck, Sparkles, Terminal } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="relative min-h-screen w-full bg-neutral-50 dark:bg-[#060606] text-neutral-900 dark:text-white selection:bg-sky-500/30 overflow-x-hidden transition-colors duration-300 select-none">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#141414_1px,transparent_1px),linear-gradient(to_bottom,#141414_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-125 h-75 bg-linear-to-r from-sky-500/10 via-indigo-500/5 to-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

      <main className="mx-auto max-w-7xl px-6 pt-16 pb-24 flex flex-col items-center justify-start text-center relative z-20">
        <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 dark:border-neutral-800/80 bg-white/80 dark:bg-neutral-900/50 px-3.5 py-1.5 text-xs text-neutral-600 dark:text-neutral-400 backdrop-blur-sm shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-sky-500 dark:text-sky-400 animate-pulse" />
          <span className="font-semibold tracking-wide">
            Next-Generation Browser VFS Runtime Container
          </span>
        </div>

        <div className="mt-8 space-y-4 max-w-4xl">
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-linear-to-b from-neutral-900 via-neutral-800 to-neutral-600 dark:from-white dark:via-neutral-200 dark:to-neutral-500 leading-[1.15]">
            Code Editor Bounded With <br />
            <span className="bg-linear-to-r from-sky-600 via-indigo-600 to-purple-600 dark:from-sky-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text">
              Edge Intelligence
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-base sm:text-lg text-neutral-600 dark:text-neutral-400 font-medium leading-relaxed pt-2">
            InTabIDE orchestrates an ultra-fast, isolated development sandbox directly inside a
            single browser tab[cite: 744, 772]. Write, compile, and run applications on a secure
            virtual engine without setting up local configs[cite: 745, 773].
          </p>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <Link href="/dashboard">
            <Button
              size="lg"
              className="h-12 px-6 rounded-xl bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-semibold transition-all duration-300 shadow-xl group active:scale-[0.98]"
            >
              Open Workspace Shell
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </Link>
          <a href="https://github.com/sagarDevHub/intab-ide" target="_blank" rel="noreferrer">
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-6 rounded-xl border-neutral-200 dark:border-neutral-800 bg-white/40 dark:bg-neutral-900/40 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 dark:hover:text-white transition-all duration-300 backdrop-blur-md active:scale-[0.98]"
            >
              View Source Repository
            </Button>
          </a>
        </div>

        <div className="relative mt-20 w-full max-w-5xl rounded-2xl border border-neutral-200 dark:border-neutral-900/80 bg-white/30 dark:bg-neutral-950/40 p-2.5 backdrop-blur-md shadow-2xl dark:shadow-sky-500/5 group">
          <div className="absolute -inset-0.5 rounded-2xl bg-linear-to-r from-sky-500/10 to-purple-500/10 opacity-30 blur-xl group-hover:opacity-50 transition duration-700 pointer-events-none" />

          <div className="relative overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950 shadow-inner flex flex-col">
            <div className="flex h-10 w-full items-center justify-between bg-neutral-100/80 dark:bg-neutral-900/40 px-4 border-b border-neutral-200 dark:border-neutral-900/60">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-yellow-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
              </div>
              <div className="rounded bg-neutral-200 dark:bg-neutral-900 px-3 py-1 text-[10px] font-mono text-neutral-500 dark:text-neutral-500 tracking-wider">
                sandbox://vfs/main.tsx
              </div>
              <div className="w-12" />
            </div>

            <div className="flex items-center justify-center py-12 bg-neutral-50/50 dark:bg-[#0a0a0a]/60">
              <Image
                src="/hero.svg"
                alt="Interactive IDE Mockup Frame Illustration"
                height={460}
                width={460}
                className="opacity-80 dark:opacity-70 group-hover:opacity-100 transition-opacity duration-700 drop-shadow-[0_0_35px_rgba(56,189,248,0.05)]"
                priority
              />
            </div>
          </div>
        </div>

        <div className="mt-28 grid w-full max-w-5xl grid-cols-1 gap-6 sm:grid-cols-3 text-left">
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950/40 p-6 backdrop-blur-sm hover:border-neutral-300 dark:hover:border-neutral-800 shadow-sm dark:shadow-none transition-colors">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 text-sky-600 dark:text-sky-400 mb-4">
              <Code2 className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold tracking-wide text-neutral-800 dark:text-neutral-200 uppercase">
              Monaco Workspace
            </h3>
            <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">
              Full VS Code core compilation handling layout out-of-the-box with integrated
              intellisense syntax trees[cite: 748, 749].
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950/40 p-6 backdrop-blur-sm hover:border-neutral-300 dark:hover:border-neutral-800 shadow-sm dark:shadow-none transition-colors">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-200 dark:border-sky-500/20 text-indigo-600 dark:text-indigo-400 mb-4">
              <Terminal className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold tracking-wide text-neutral-800 dark:text-neutral-200 uppercase">
              Isolated Browser VFS
            </h3>
            <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">
              In-memory virtual key-value partitions route edits at maximum speed without hitting
              physical hardware[cite: 751, 752, 753].
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950/40 p-6 backdrop-blur-sm hover:border-neutral-300 dark:hover:border-neutral-800 shadow-sm dark:shadow-none transition-colors">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-200 dark:border-sky-500/20 text-purple-600 dark:text-purple-400 mb-4">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold tracking-wide text-neutral-800 dark:text-neutral-200 uppercase">
              Edge Security Shield
            </h3>
            <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">
              Upstash Redis token limiter buckets protect execution endpoints instantly from
              automated bot spam[cite: 1020, 1021].
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
