'use client';

import React, { useState } from 'react';
import { Sparkles, Copy, Check, Loader2, Code2 } from 'lucide-react';

interface AIExplainProps {
  explanation: string;
  isProcessing: boolean;
  onGenerate: () => void;
  code?: string;
  fileName?: string;
}

export const AIExplain = ({
  explanation,
  isProcessing,
  onGenerate,
  code,
  fileName,
}: AIExplainProps) => {
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
          <Sparkles size={18} className="text-purple-400" />
          <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
            Code Explanation
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
              Explain
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

      {explanation ? (
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex-1 p-4 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-auto">
            <pre className="text-xs font-mono whitespace-pre-wrap text-neutral-700 dark:text-neutral-200 leading-relaxed">
              {explanation}
            </pre>
          </div>
          <button
            onClick={() => copyToClipboard(explanation)}
            className="self-end px-4 py-1.5 rounded-md bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs font-medium transition-all flex items-center gap-1.5"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copied' : 'Copy Explanation'}
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <Sparkles size={32} className="text-neutral-300 dark:text-neutral-600 mb-3" />
          <p className="text-sm text-neutral-500">No explanation yet</p>
          <p className="text-xs text-neutral-400 mt-1">
            Select a file and click "Explain" to get a detailed breakdown
          </p>
        </div>
      )}

      {code && (
        <div className="mt-3">
          <div className="text-xs font-medium text-neutral-500 mb-1">Original Code:</div>
          <div className="p-3 rounded-lg bg-neutral-900 text-white text-xs font-mono max-h-40 overflow-auto">
            <pre className="whitespace-pre-wrap">{code}</pre>
          </div>
        </div>
      )}
    </div>
  );
};
