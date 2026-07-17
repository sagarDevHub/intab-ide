'use client';

import React, { useState } from 'react';
import { Lightbulb, Copy, Check, Sparkles, Loader2 } from 'lucide-react';

interface AISuggestionProps {
  suggestion: string;
  isProcessing: boolean;
  onApply: (suggestion: string) => void;
  onGenerate: () => void;
}

export const AISuggestion = ({
  suggestion,
  isProcessing,
  onApply,
  onGenerate,
}: AISuggestionProps) => {
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
          <Lightbulb size={18} className="text-amber-400" />
          <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
            Inline Suggestion
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
              Generating...
            </>
          ) : (
            <>
              <Sparkles size={12} />
              Generate
            </>
          )}
        </button>
      </div>

      {suggestion ? (
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex-1 p-4 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-auto">
            <pre className="text-xs font-mono whitespace-pre-wrap text-neutral-700 dark:text-neutral-200">
              {suggestion}
            </pre>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onApply(suggestion)}
              className="px-4 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-all flex items-center gap-1.5"
            >
              Apply Suggestion
            </button>
            <button
              onClick={() => copyToClipboard(suggestion)}
              className="px-4 py-1.5 rounded-md bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs font-medium transition-all flex items-center gap-1.5"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <Lightbulb size={32} className="text-neutral-300 dark:text-neutral-600 mb-3" />
          <p className="text-sm text-neutral-500">No suggestion yet</p>
          <p className="text-xs text-neutral-400 mt-1">
            Click "Generate" to get an inline code suggestion
          </p>
        </div>
      )}
    </div>
  );
};
