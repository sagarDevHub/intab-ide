'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  MessageSquare,
  FileText,
  Lightbulb,
  Bug,
  Zap,
  ChevronDown,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface AIDropdownProps {
  onFeatureSelect: (
    feature: 'chat' | 'suggestion' | 'summary' | 'explain' | 'optimize' | 'bugs'
  ) => void;
  isOpen: boolean;
  isProcessing: boolean;
  rateLimitRemaining?: number;
}

export const AIDropdown = ({
  onFeatureSelect,
  isOpen,
  isProcessing,
  rateLimitRemaining,
}: AIDropdownProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const features = [
    {
      id: 'chat',
      icon: MessageSquare,
      label: 'Chat with AI',
      description: 'Ask questions about your code',
      color: 'text-sky-400',
    },
    {
      id: 'suggestion',
      icon: Lightbulb,
      label: 'Inline Suggestion',
      description: 'Get code completion suggestions',
      color: 'text-amber-400',
    },
    {
      id: 'summary',
      icon: FileText,
      label: 'Code Base Summary',
      description: 'Understand your project structure',
      color: 'text-emerald-400',
    },
    {
      id: 'explain',
      icon: Sparkles,
      label: 'Explain Code',
      description: 'Get detailed code explanations',
      color: 'text-purple-400',
    },
    {
      id: 'bugs',
      icon: Bug,
      label: 'Find Bugs',
      description: 'Identify potential issues',
      color: 'text-red-400',
    },
    {
      id: 'optimize',
      icon: Zap,
      label: 'Optimize Code',
      description: 'Improve code performance',
      color: 'text-yellow-400',
    },
  ];

  const showRateLimitWarning = rateLimitRemaining !== undefined && rateLimitRemaining < 10;

  return (
    <div className="relative">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`h-7 px-2.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
          isOpen
            ? 'text-sky-600 dark:text-sky-400 bg-sky-500/10'
            : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
        }`}
        title="AI Assistant"
      >
        <Sparkles size={13} />
        <span className="hidden lg:inline">AI</span>
        <ChevronDown
          size={10}
          className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
        {isProcessing && <Loader2 size={10} className="animate-spin" />}
        {showRateLimitWarning && <AlertCircle size={10} className="text-amber-400" />}
      </button>

      {isExpanded && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsExpanded(false)} />
          <div className="absolute right-0 top-full mt-1 w-64 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-xl z-50 overflow-hidden">
            <div className="p-1">
              {features.map(feature => (
                <button
                  key={feature.id}
                  onClick={() => {
                    onFeatureSelect(feature.id as any);
                    setIsExpanded(false);
                  }}
                  className="w-full flex items-start gap-2.5 px-3 py-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-left"
                >
                  <feature.icon size={16} className={`${feature.color} mt-0.5 shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-neutral-700 dark:text-neutral-200">
                      {feature.label}
                    </div>
                    <div className="text-[10px] text-neutral-400 dark:text-neutral-500 truncate">
                      {feature.description}
                    </div>
                  </div>
                </button>
              ))}

              {showRateLimitWarning && (
                <div className="px-3 py-1.5 border-t border-neutral-200 dark:border-neutral-800">
                  <span className="text-[10px] text-amber-500 flex items-center gap-1">
                    <AlertCircle size={10} />
                    {rateLimitRemaining} requests remaining
                  </span>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
