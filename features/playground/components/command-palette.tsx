'use client';

import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { OpenedTab } from '../types';
import { File, Save, Files } from 'lucide-react';

interface CommandPaletteProps {
  openTabs: OpenedTab[];
  activeTabId: string | null;
  onSelectTab: (tabId: string) => void;
  onSaveActiveFile: () => Promise<void>;
  onSaveAllFiles: () => Promise<void>;
}

export const CommandPalette = ({
  openTabs,
  activeTabId,
  onSelectTab,
  onSaveActiveFile,
  onSaveAllFiles,
}: CommandPaletteProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Toggle overlay on Ctrl+K / Cmd+K shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-neutral-950/40 dark:bg-neutral-950/60 backdrop-blur-xs z-50 flex items-start justify-center pt-[15vh] p-4 animate-in fade-in duration-150"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="w-full max-w-(--size-md) bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-xl shadow-2xl overflow-hidden gap-0"
        onClick={e => e.stopPropagation()}
      >
        <Command label="Global Workspace Command Palette">
          {/* Input Search Field */}
          <div className="flex items-center px-3 border-b border-neutral-200 dark:border-neutral-800">
            <Command.Input
              autoFocus
              placeholder="Type a command or file name..."
              className="w-full h-11 bg-transparent border-none outline-hidden text-xs text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 font-medium"
            />
          </div>

          <Command.List className="max-h-75 overflow-y-auto p-2 space-y-1 scrollbar-none">
            <Command.Empty className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 py-3 text-center">
              No matching assets or actions resolved.
            </Command.Empty>

            {/* SECTION 1: SYSTEM ACTIONS MAP */}
            <Command.Group
              heading="Workspace Actions"
              className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 dark:text-neutral-500 px-2 py-1.5"
            >
              <Command.Item
                onSelect={() => {
                  onSaveActiveFile();
                  setIsOpen(false);
                }}
                className="flex items-center justify-between px-2.5 py-2 text-xs font-medium rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 data-[selected=true]:bg-neutral-100 dark:data-[selected=true]:bg-neutral-800 data-[selected=true]:text-neutral-900 dark:data-[selected=true]:text-neutral-50 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-2">
                  <Save size={14} className="text-neutral-400" />
                  <span>Save Active File</span>
                </div>
                <span className="font-mono text-[10px] text-neutral-400 bg-neutral-100 dark:bg-neutral-950 px-1.5 py-0.5 rounded border border-neutral-200/50 dark:border-neutral-800/60">
                  Ctrl+S
                </span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  onSaveAllFiles();
                  setIsOpen(false);
                }}
                className="flex items-center justify-between px-2.5 py-2 text-xs font-medium rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 data-[selected=true]:bg-neutral-100 dark:data-[selected=true]:bg-neutral-800 data-[selected=true]:text-neutral-900 dark:data-[selected=true]:text-neutral-50 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-2">
                  <Files size={14} className="text-sky-500" />
                  <span>Save All Files</span>
                </div>
              </Command.Item>
            </Command.Group>

            {/* SECTION 2: FILE NAVIGATION NODES */}
            {openTabs.length > 0 && (
              <Command.Group
                heading="Switch Open Active Tabs"
                className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 dark:text-neutral-500 px-2 py-1.5 pt-2"
              >
                {openTabs.map(tab => (
                  <Command.Item
                    key={tab.id}
                    onSelect={() => {
                      onSelectTab(tab.id);
                      setIsOpen(false);
                    }}
                    className="flex items-center justify-between px-2.5 py-2 text-xs font-medium rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 data-[selected=true]:bg-neutral-100 dark:data-[selected=true]:bg-neutral-800 data-[selected=true]:text-neutral-900 dark:data-[selected=true]:text-neutral-50 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <File
                        size={14}
                        className={tab.id === activeTabId ? 'text-sky-500' : 'text-neutral-400'}
                      />
                      <span className="font-mono text-[11px] truncate">
                        {tab.filename}.{tab.fileExtension}
                      </span>
                    </div>
                    {tab.id === activeTabId && (
                      <span className="text-[10px] font-semibold text-sky-500 dark:text-sky-400 bg-sky-500/5 px-1.5 py-0.5 rounded border border-sky-500/10">
                        Active View
                      </span>
                    )}
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>
        </Command>
      </div>
    </div>
  );
};
