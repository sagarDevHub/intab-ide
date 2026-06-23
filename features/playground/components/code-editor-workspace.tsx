'use client';

import React from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import { OpenedTab } from '../types';
import { Terminal, X, FileCode } from 'lucide-react';

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

  const handleEditorWillMount = (monaco: Monaco) => {
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: false,
    });

    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
      allowJs: true,
    });
  };

  if (!activeTab || openTabs.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-neutral-50/30 dark:bg-neutral-950/20 h-full">
        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-900 text-neutral-400 dark:text-neutral-500 border border-neutral-200/50 dark:border-neutral-800/50 mb-4 shadow-2xs">
          <Terminal size={18} />
        </div>
        <h4 className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 tracking-wide">
          No Active Working Files
        </h4>
        <p className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 mt-1 max-w-xs">
          Select an asset node from your file explorer tree layout to open a concurrent editor tab.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full min-h-0 bg-white dark:bg-neutral-950">
      {/* Premium Multi-Tab Bar Layout */}
      <div className="h-9 flex items-center border-b border-neutral-200/60 dark:border-neutral-800/50 bg-neutral-50/50 dark:bg-neutral-950/40 overflow-x-auto select-none overflow-y-hidden scrollbar-none shrink-0">
        {openTabs.map(tab => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-2 px-3 h-full border-r border-neutral-200/60 dark:border-neutral-800/50 cursor-pointer relative group transition-all text-xs font-medium ${
                isActive
                  ? 'bg-white dark:bg-[#1e1e1e] text-neutral-900 dark:text-neutral-100 font-semibold'
                  : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 bg-transparent'
              }`}
            >
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-sky-500 dark:bg-sky-400" />
              )}

              {getFileIcon(tab.fileExtension)}
              <span className="font-mono text-[11px] tracking-tight">
                {tab.filename}.{tab.fileExtension}
              </span>

              <button
                onClick={e => {
                  e.stopPropagation();
                  onCloseTab(tab.id);
                }}
                className="p-0.5 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-800 opacity-60 group-hover:opacity-100 transition-all text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X size={11} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Clamped Monaco Editor Canvas Layer */}
      <div className="flex-1 w-full relative pt-1 bg-white dark:bg-[#1e1e1e]">
        <Editor
          height="100%"
          width="100%"
          theme="vs-dark"
          beforeMount={handleEditorWillMount}
          language={
            activeTab.fileExtension === 'tsx'
              ? 'typescript'
              : activeTab.fileExtension === 'jsx'
                ? 'javascript'
                : ['ts', 'js'].includes(activeTab.fileExtension)
                  ? 'typescript'
                  : activeTab.fileExtension === 'json'
                    ? 'json'
                    : 'html'
          }
          path={`file:///${activeTab.id}`}
          value={activeTab.content}
          onChange={onCodeChange}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineHeight: 21,
            automaticLayout: true,
            fontFamily: 'Menlo, Monaco, Consolas, monospace',
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            renderLineHighlight: 'all',
            padding: { top: 8 },
            wordWrap: 'on',
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: 'on',
            quickSuggestions: { other: true, comments: false, strings: true },
          }}
        />
      </div>
    </div>
  );
};
