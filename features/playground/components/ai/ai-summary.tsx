'use client';

import React, { useState } from 'react';
import { FileText, Copy, Check, Sparkles, Loader2, FolderTree, FileCode } from 'lucide-react';

interface AISummaryProps {
  summary: string;
  isProcessing: boolean;
  onGenerate: () => void;
  fileCount?: number;
  folderCount?: number;
}

export const AISummary = ({
  summary,
  isProcessing,
  onGenerate,
  fileCount,
  folderCount,
}: AISummaryProps) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 bg-white dark:bg-neutral-950 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-emerald-400" />
          <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
            Code Base Summary
          </h3>
        </div>
        <button
          onClick={onGenerate}
          disabled={isProcessing}
          className="px-3 py-1.5 rounded-md bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
        >
          {isProcessing ? (
            <>
              <Loader2 size={12} className="animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles size={12} />
              Generate Summary
            </>
          )}
        </button>
      </div>

      {/* Project Stats */}
      {(fileCount !== undefined || folderCount !== undefined) && (
        <div className="flex gap-4 mb-4 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
          {fileCount !== undefined && (
            <div className="flex items-center gap-2">
              <FileCode size={14} className="text-neutral-400" />
              <span className="text-xs text-neutral-600 dark:text-neutral-300">
                {fileCount} files
              </span>
            </div>
          )}
          {folderCount !== undefined && (
            <div className="flex items-center gap-2">
              <FolderTree size={14} className="text-neutral-400" />
              <span className="text-xs text-neutral-600 dark:text-neutral-300">
                {folderCount} folders
              </span>
            </div>
          )}
        </div>
      )}

      {summary ? (
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex-1 p-4 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-auto">
            <pre className="text-xs font-mono whitespace-pre-wrap text-neutral-700 dark:text-neutral-200 leading-relaxed">
              {summary}
            </pre>
          </div>
          <button
            onClick={() => copyToClipboard(summary)}
            className="self-end px-4 py-1.5 rounded-md bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs font-medium transition-all flex items-center gap-1.5"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copied' : 'Copy Summary'}
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <FileText size={32} className="text-neutral-300 dark:text-neutral-600 mb-3" />
          <p className="text-sm text-neutral-500">No summary available</p>
          <p className="text-xs text-neutral-400 mt-1">
            Click "Generate Summary" to analyze your project
          </p>
        </div>
      )}
    </div>
  );
};
