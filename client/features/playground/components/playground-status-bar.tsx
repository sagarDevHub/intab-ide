'use client';

import React from 'react';

interface PlaygroundStatusBarProps {
  isAutoSaveEnabled: boolean;
  port: string;
  framework: string;
  isServerRunning: boolean;
}

export const PlaygroundStatusBar = ({
  isAutoSaveEnabled,
  port,
  framework,
  isServerRunning,
}: PlaygroundStatusBarProps) => {
  return (
    <div className="h-6 shrink-0 border-t border-neutral-200/60 dark:border-neutral-800/50 px-3 bg-neutral-50/80 dark:bg-neutral-950/80 flex items-center justify-between text-[10px] font-mono text-neutral-400 dark:text-neutral-500 select-none">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full ${isAutoSaveEnabled ? 'bg-emerald-500' : 'bg-neutral-400'}`}
          />
          Auto-Save: {isAutoSaveEnabled ? 'ON' : 'OFF'}
        </span>
        <span className="text-neutral-300 dark:text-neutral-600">|</span>
        <span>Port: {port}</span>
        <span className="text-neutral-300 dark:text-neutral-600">|</span>
        <span>Framework: {framework}</span>
        <span className="text-neutral-300 dark:text-neutral-600">|</span>
        <span className={`${isServerRunning ? 'text-emerald-500' : 'text-neutral-500'}`}>
          {isServerRunning ? '⚡ Running' : '⏸ Stopped'}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-neutral-300 dark:text-neutral-600">|</span>
        <span>{new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  );
};
