'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ChevronLeft, Save, Files, RefreshCw, TerminalSquare, Square } from 'lucide-react';
import { PlaygroundData, OpenedTab } from '../types';

interface PlaygroundHeaderProps {
  id: string;
  playgroundData: PlaygroundData | null;
  openTabs: OpenedTab[];
  activeTabId: string | null;
  isTerminalOpen: boolean;
  setIsTerminalOpen: (open: boolean) => void;
  isAutoSaveEnabled: boolean;
  onToggleAutoSave: () => void;
  onSaveActiveFile: () => Promise<void>;
  onSaveAllFiles: () => Promise<void>;
  onReloadPreview?: () => void;
  onKillServer?: () => Promise<void>;
}

export const PlaygroundHeader = ({
  id,
  playgroundData,
  openTabs,
  activeTabId,
  isTerminalOpen,
  setIsTerminalOpen,
  isAutoSaveEnabled,
  onToggleAutoSave,
  onSaveActiveFile,
  onSaveAllFiles,
  onReloadPreview,
  onKillServer,
}: PlaygroundHeaderProps) => {
  const router = useRouter();

  const activeTab = openTabs.find(t => t.id === activeTabId);
  const isActiveFileDirty = !!activeTab?.hasUnsavedChanges;
  const isAnyFileDirty = openTabs.some(t => t.hasUnsavedChanges);

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-neutral-200/60 dark:border-neutral-800/50 px-4 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md sticky top-0 z-50 select-none">
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

        <span className="text-xs font-semibold tracking-tight text-neutral-800 dark:text-neutral-200 truncate">
          {playgroundData?.title || 'Sandbox Space'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Stop Server Button */}
        {onKillServer && (
          <button
            onClick={onKillServer}
            className="h-7 px-2.5 rounded-lg text-[11px] font-medium flex items-center gap-1.5 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 text-red-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all cursor-pointer"
            title="Stop Dev Server (Ctrl+Shift+S)"
          >
            <Square size={13} />
            <span>Stop</span>
          </button>
        )}

        {/* Refresh Preview Button */}
        {onReloadPreview && (
          <button
            onClick={onReloadPreview}
            className="h-7 px-2.5 rounded-lg text-[11px] font-medium flex items-center gap-1.5 border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-all cursor-pointer"
            title="Refresh preview"
          >
            <RefreshCw size={13} />
            <span>Refresh</span>
          </button>
        )}

        {/* Auto-Save Toggle */}
        <button
          onClick={onToggleAutoSave}
          className={`h-7 px-2.5 rounded-lg text-[11px] font-medium flex items-center gap-1.5 border transition-all cursor-pointer ${
            isAutoSaveEnabled
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 shadow-xs'
              : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-400 border-neutral-200 dark:border-neutral-800'
          }`}
        >
          <RefreshCw
            size={11}
            className={isAutoSaveEnabled ? 'animate-spin animation-duration-[6s]' : ''}
          />
          <span>Auto-Save: {isAutoSaveEnabled ? 'ON' : 'OFF'}</span>
        </button>

        {/* Terminal Toggle */}
        <button
          onClick={() => setIsTerminalOpen(!isTerminalOpen)}
          className={`h-7 px-2.5 rounded-lg text-[11px] font-medium flex items-center gap-1.5 border transition-all cursor-pointer ${
            isTerminalOpen
              ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20 shadow-xs'
              : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-200'
          }`}
        >
          <TerminalSquare size={13} />
          <span>Terminal</span>
        </button>

        <Separator
          orientation="vertical"
          className="h-3.5 bg-neutral-200 dark:bg-neutral-800/80 mx-0.5"
        />

        {/* Save Active File */}
        <button
          disabled={!isActiveFileDirty || isAutoSaveEnabled}
          onClick={onSaveActiveFile}
          className={`h-7 rounded-lg text-xs font-medium transition-all gap-1.5 px-2.5 border shadow-2xs flex items-center justify-center ${
            isActiveFileDirty && !isAutoSaveEnabled
              ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-900 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:text-neutral-100 border-neutral-200 dark:border-neutral-800 cursor-pointer scale-100 active:scale-95'
              : 'opacity-40 pointer-events-none text-neutral-400 dark:text-neutral-600 bg-neutral-50/50 dark:bg-neutral-950/20 border-transparent'
          }`}
        >
          <Save size={12} />
          <span>Save</span>
        </button>

        {/* Save All */}
        <button
          disabled={!isAnyFileDirty || isAutoSaveEnabled}
          onClick={onSaveAllFiles}
          className={`h-7 rounded-lg text-xs font-medium transition-all gap-1.5 px-2.5 shadow-2xs flex items-center justify-center border border-transparent ${
            isAnyFileDirty && !isAutoSaveEnabled
              ? 'bg-sky-600 hover:bg-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400 text-white cursor-pointer scale-100 active:scale-95'
              : 'opacity-40 pointer-events-none text-neutral-400 dark:text-neutral-600 bg-neutral-50/50 dark:bg-neutral-950/20'
          }`}
        >
          <Files size={12} />
          <span>Save All</span>
        </button>
      </div>
    </header>
  );
};
