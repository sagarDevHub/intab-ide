'use client';

import React, { useState } from 'react';
import { Zap, Copy, Check, Loader2, Code2, ArrowRight } from 'lucide-react';

interface AIOptimizeProps {
  optimizedCode: string;
  isProcessing: boolean;
  onGenerate: () => void;
  onApply: (code: string) => void;
  originalCode?: string;
  fileName?: string;
}

export const AIOptimize = ({
  optimizedCode,
  isProcessing,
  onGenerate,
  onApply,
  originalCode,
  fileName,
}: AIOptimizeProps) => {
  const [copied, setCopied] = useState(false);
  const [showOriginal, setShowOriginal] = useState(true);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 bg-white dark:bg-neutral-950 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap size={18} className="text-yellow-400" />
          <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
            Code Optimization
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
              Optimizing...
            </>
          ) : (
            <>
              <Zap size={12} />
              Optimize
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

      {optimizedCode ? (
        <div className="flex-1 flex flex-col gap-3">
          {/* Toggle View */}
          {originalCode && (
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => setShowOriginal(true)}
                className={`px-2 py-1 rounded-md transition-colors ${
                  showOriginal
                    ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200'
                    : 'text-neutral-400 hover:text-neutral-600'
                }`}
              >
                Original
              </button>
              <ArrowRight size={12} className="text-neutral-400" />
              <button
                onClick={() => setShowOriginal(false)}
                className={`px-2 py-1 rounded-md transition-colors ${
                  !showOriginal
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    : 'text-neutral-400 hover:text-neutral-600'
                }`}
              >
                Optimized
              </button>
            </div>
          )}

          <div className="flex-1 p-4 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-auto">
            <pre className="text-xs font-mono whitespace-pre-wrap text-neutral-700 dark:text-neutral-200 leading-relaxed">
              {showOriginal && originalCode ? originalCode : optimizedCode}
            </pre>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onApply(optimizedCode)}
              className="px-4 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-all flex items-center gap-1.5"
            >
              Apply Optimization
            </button>
            <button
              onClick={() => copyToClipboard(optimizedCode)}
              className="px-4 py-1.5 rounded-md bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs font-medium transition-all flex items-center gap-1.5"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <Zap size={32} className="text-neutral-300 dark:text-neutral-600 mb-3" />
          <p className="text-sm text-neutral-500">No optimization yet</p>
          <p className="text-xs text-neutral-400 mt-1">
            Click "Optimize" to improve your code's performance and readability
          </p>
        </div>
      )}
    </div>
  );
};
