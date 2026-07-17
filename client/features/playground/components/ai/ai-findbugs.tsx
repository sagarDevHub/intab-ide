'use client';

import React, { useState } from 'react';
import { Bug, Copy, Check, Loader2, Code2, AlertTriangle } from 'lucide-react';

interface AIFindBugsProps {
  bugs: string;
  isProcessing: boolean;
  onGenerate: () => void;
  code?: string;
  fileName?: string;
}

export const AIFindBugs = ({ bugs, isProcessing, onGenerate, fileName }: AIFindBugsProps) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Parse bug report for structured display
  const parseBugReport = (text: string) => {
    const lines = text.split('\n');
    const issues: string[] = [];
    let currentIssue = '';

    lines.forEach(line => {
      if (line.match(/^\d+\.\s/)) {
        if (currentIssue) issues.push(currentIssue);
        currentIssue = line;
      } else if (currentIssue) {
        currentIssue += '\n' + line;
      }
    });
    if (currentIssue) issues.push(currentIssue);

    return issues;
  };

  const bugIssues = bugs ? parseBugReport(bugs) : [];

  return (
    <div className="p-4 bg-white dark:bg-neutral-950 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bug size={18} className="text-red-400" />
          <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
            Bug Analysis
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
              <Bug size={12} />
              Find Bugs
            </>
          )}
        </button>
      </div>

      {fileName && (
        <div className="mb-3 flex items-center gap-2 px-3 py-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <Code2 size={12} className="text-neutral-400" />
          <span className="text-xs font-mono text-neutral-600 dark:text-neutral-300">
            {fileName}
          </span>
        </div>
      )}

      {bugs ? (
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex-1 p-4 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-auto">
            {bugIssues.length > 0 ? (
              <div className="space-y-3">
                {bugIssues.map((issue, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/30"
                  >
                    <div className="flex items-start gap-2">
                      <AlertTriangle size={14} className="text-red-500 mt-0.5 shrink-0" />
                      <pre className="text-xs font-mono whitespace-pre-wrap text-neutral-700 dark:text-neutral-200 leading-relaxed">
                        {issue}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <pre className="text-xs font-mono whitespace-pre-wrap text-neutral-700 dark:text-neutral-200 leading-relaxed">
                {bugs}
              </pre>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => copyToClipboard(bugs)}
              className="px-4 py-1.5 rounded-md bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs font-medium transition-all flex items-center gap-1.5"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy Report'}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <Bug size={32} className="text-neutral-300 dark:text-neutral-600 mb-3" />
          <p className="text-sm text-neutral-500">No bugs found yet</p>
          <p className="text-xs text-neutral-400 mt-1">
            Click "Find Bugs" to analyze your code for potential issues
          </p>
        </div>
      )}
    </div>
  );
};
