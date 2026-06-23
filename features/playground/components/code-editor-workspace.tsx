'use client';

import React from 'react';
import Editor from '@monaco-editor/react';
import { OpenedTab } from '../types';
import { Terminal, X, FileCode } from 'lucide-react';
import {
  getEditorLanguage,
  configureMonacoWorkspace,
  defaultEditorOptions,
} from '../lib/editor-config';

interface CodeEditorWorkspaceProps {
  openTabs: OpenedTab[];
  activeTabId: string | null;
  onSelectTab: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
  onCodeChange: (newValue: string | undefined) => void;
}

const getFileIcon = (ext: string) => {
  const normalized = (ext || '').toLowerCase();
  switch (normalized) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
      return <FileCode className="h-3.5 w-3.5 text-amber-500 shrink-0" />;
    case 'json':
      return <FileCode className="h-3.5 w-3.5 text-sky-400 shrink-0" />;
    case 'html':
      return <FileCode className="h-3.5 w-3.5 text-orange-500 shrink-0" />;
    case 'css':
      return <FileCode className="h-3.5 w-3.5 text-teal-400 shrink-0" />;
    default:
      return <FileCode className="h-3.5 w-3.5 text-neutral-400 shrink-0" />;
  }
};

export const CodeEditorWorkspace = ({
  openTabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onCodeChange,
}: CodeEditorWorkspaceProps) => {
  const activeTab = openTabs.find(t => t.id === activeTabId);

  if (!activeTab || openTabs.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#0D1117] h-full w-full">
        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-neutral-900 text-neutral-500 border border-neutral-800 mb-4 shadow-2xs">
          <Terminal size={18} />
        </div>
        <h4 className="text-xs font-semibold text-neutral-200 tracking-wide">
          No Active Working Files
        </h4>
        <p className="text-[11px] font-medium text-neutral-500 mt-1 max-w-xs">
          Select an asset node from your file explorer tree layout to open a concurrent editor tab.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full min-h-0 bg-[#0D1117]">
      <div className="h-9 flex items-center border-b border-neutral-800/40 bg-neutral-950/40 overflow-x-auto select-none overflow-y-hidden scrollbar-none shrink-0">
        {openTabs.map(tab => {
          const isActive = tab.id === activeTabId;
          const isDirty = !!tab.hasUnsavedChanges;

          return (
            <div
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-2.5 px-3 h-full border-r border-neutral-800/40 cursor-pointer relative group transition-all text-xs font-medium ${
                isActive
                  ? 'bg-[#0D1117] text-neutral-100 font-semibold'
                  : 'text-neutral-500 hover:text-neutral-300 bg-transparent'
              }`}
            >
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-sky-500 dark:bg-sky-400" />
              )}

              {getFileIcon(tab.fileExtension)}
              <span className="font-mono text-[11px] tracking-tight">
                {tab.filename}.{tab.fileExtension}
              </span>

              {/* ✅ INTERACTIVE TRACKING UNCURSED SYSTEM DOT CLOSER */}
              <div className="w-4 h-4 flex items-center justify-center relative">
                {isDirty ? (
                  <>
                    {/* Unsaved State Circle Dot Indicator Marker */}
                    <div className="h-2 w-2 rounded-full bg-neutral-400 dark:bg-neutral-500 group-hover:hidden transition-all scale-100" />
                    {/* Hover fall-through trigger close button action */}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onCloseTab(tab.id);
                      }}
                      className="hidden group-hover:flex p-0.5 rounded-md hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-all"
                    >
                      <X size={11} />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onCloseTab(tab.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded-md hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-all"
                  >
                    <X size={11} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex-1 w-full relative pt-1 bg-[#0D1117]">
        <Editor
          height="100%"
          width="100%"
          theme="modern-dark"
          beforeMount={configureMonacoWorkspace}
          language={getEditorLanguage(activeTab.fileExtension)}
          path={`file:///${activeTab.id}`}
          value={activeTab.content}
          onChange={onCodeChange}
          options={defaultEditorOptions}
          loading={
            <div className="absolute inset-0 flex items-center justify-center bg-[#0D1117] text-xs font-mono text-neutral-500">
              Loading theme buffers...
            </div>
          }
        />
      </div>
    </div>
  );
};
