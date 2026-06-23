'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ChevronLeft, CloudLightning, Save } from 'lucide-react';
import { PlaygroundData, TemplateFolder } from '../types';

interface PlaygroundHeaderProps {
  id: string;
  playgroundData: PlaygroundData | null;
  templateData: TemplateFolder | null;
  onSave: (data: TemplateFolder) => Promise<void>;
}

export const PlaygroundHeader = ({
  id,
  playgroundData,
  templateData,
  onSave,
}: PlaygroundHeaderProps) => {
  const router = useRouter();

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-neutral-200/60 dark:border-neutral-800/50 px-4 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-2.5 min-w-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/dashboard')}
          className="h-7 rounded-lg px-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200 text-xs font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-all gap-1"
        >
          <ChevronLeft size={14} />
          <span>Dashboard</span>
        </Button>

        <Separator orientation="vertical" className="h-3.5 bg-neutral-200 dark:bg-neutral-800/80" />
        <SidebarTrigger className="h-7 w-7 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors" />
        <Separator orientation="vertical" className="h-3.5 bg-neutral-200 dark:bg-neutral-800/80" />

        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-semibold tracking-tight text-neutral-800 dark:text-neutral-200 truncate">
            {playgroundData?.title || 'Sandbox Space'}
          </span>
          <span className="hidden sm:inline-flex items-center font-mono text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-900 text-neutral-400 border border-neutral-200/40 dark:border-neutral-800/50 select-none">
            id: {id.slice(0, 8)}...
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400/90 bg-emerald-500/5 px-2 py-0.5 rounded-lg border border-emerald-500/10">
          <CloudLightning size={11} className="animate-pulse" />
          <span>VFS Engine Online</span>
        </div>

        <Button
          size="sm"
          onClick={() => templateData && onSave(templateData)}
          className="h-7 rounded-lg text-xs font-medium bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-950 transition-all gap-1.5 shadow-xs"
        >
          <Save size={13} />
          <span>Save Changes</span>
        </Button>
      </div>
    </header>
  );
};
