'use client';

import React, { useRef, useEffect } from 'react';
import {
  X,
  Sparkles,
  Send,
  Loader2,
  Copy,
  Check,
  FileText,
  Lightbulb,
  Bug,
  Zap,
  AlertCircle,
} from 'lucide-react';
import { AIMessage } from '../../../../hooks/ai/useAI';

interface AIPanelProps {
  isOpen: boolean;
  onClose: () => void;
  activeFeature: 'chat' | 'suggestion' | 'summary' | 'explain' | 'optimize' | 'bugs' | null;
  isProcessing: boolean;
  messages: AIMessage[];
  suggestion: string;
  summary: string;
  explanation: string;
  optimizedCode: string;
  bugs: string;
  rateLimit?: { remaining: number; reset: number } | null;
  onSendMessage: (message: string) => void;
  onApplySuggestion?: (suggestion: string) => void;
  onApplyOptimization?: (code: string) => void;
  onClear: () => void;
}

export const AIPanel = ({
  isOpen,
  onClose,
  activeFeature,
  isProcessing,
  messages,
  suggestion,
  summary,
  explanation,
  optimizedCode,
  bugs,
  rateLimit,
  onSendMessage,
  onApplySuggestion,
  onApplyOptimization,
  onClear,
}: AIPanelProps) => {
  const [input, setInput] = React.useState('');
  const [copied, setCopied] = React.useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Show rate limit warning
  const showRateLimitWarning = rateLimit && rateLimit.remaining < 5;

  const renderContent = () => {
    if (isProcessing) {
      return (
        <div className="flex flex-col items-center justify-center h-48 gap-2">
          <Loader2 size={24} className="animate-spin text-sky-500" />
          <span className="text-xs text-neutral-400">AI is thinking...</span>
        </div>
      );
    }

    switch (activeFeature) {
      case 'chat':
        return (
          <div className="flex-1 flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center text-neutral-400 text-xs py-8">
                  <Sparkles size={24} className="mx-auto mb-2 opacity-40" />
                  <p>Start a conversation with AI</p>
                  <p className="text-[10px] mt-1 opacity-60">
                    Ask about your code, get help, or brainstorm
                  </p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg px-3 py-2 text-xs ${
                        msg.role === 'user'
                          ? 'bg-sky-600 text-white'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200'
                      }`}
                    >
                      <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
                      <div className="text-[9px] opacity-60 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="border-t border-neutral-200 dark:border-neutral-800 p-2 flex gap-2">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="flex-1 px-2 py-1.5 text-xs rounded-md bg-neutral-100 dark:bg-neutral-800 border-0 resize-none focus:ring-1 focus:ring-sky-500 outline-none"
                rows={1}
                style={{ minHeight: '32px', maxHeight: '80px' }}
              />
              <button
                onClick={handleSend}
                disabled={isProcessing || !input.trim()}
                className="px-3 py-1.5 rounded-md bg-sky-600 hover:bg-sky-500 text-white text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1"
              >
                <Send size={12} />
              </button>
            </div>
          </div>
        );

      case 'suggestion':
        return (
          <div className="p-3">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb size={16} className="text-amber-400" />
              <span className="text-xs font-medium">Inline Suggestion</span>
            </div>
            {suggestion ? (
              <div className="space-y-3">
                <pre className="p-3 rounded-md bg-neutral-100 dark:bg-neutral-800 text-xs font-mono whitespace-pre-wrap overflow-x-auto">
                  {suggestion}
                </pre>
                <div className="flex gap-2">
                  {onApplySuggestion && (
                    <button
                      onClick={() => onApplySuggestion(suggestion)}
                      className="px-3 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs transition-all"
                    >
                      Apply Suggestion
                    </button>
                  )}
                  <button
                    onClick={() => copyToClipboard(suggestion)}
                    className="px-3 py-1 rounded-md bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs transition-all flex items-center gap-1"
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-neutral-400 text-xs py-4">
                <Lightbulb size={20} className="mx-auto mb-2 opacity-40" />
                <p>No suggestion yet</p>
                <p className="text-[10px] mt-1">Click "Get Suggestion" to generate</p>
              </div>
            )}
          </div>
        );

      case 'summary':
        return (
          <div className="p-3">
            <div className="flex items-center gap-2 mb-3">
              <FileText size={16} className="text-sky-400" />
              <span className="text-xs font-medium">Code Base Summary</span>
            </div>
            {summary ? (
              <div className="space-y-3">
                <pre className="p-3 rounded-md bg-neutral-100 dark:bg-neutral-800 text-xs font-mono whitespace-pre-wrap overflow-x-auto max-h-96">
                  {summary}
                </pre>
                <button
                  onClick={() => copyToClipboard(summary)}
                  className="px-3 py-1 rounded-md bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs transition-all flex items-center gap-1"
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            ) : (
              <div className="text-center text-neutral-400 text-xs py-4">
                <FileText size={20} className="mx-auto mb-2 opacity-40" />
                <p>No summary available</p>
                <p className="text-[10px] mt-1">Click "Generate Summary" to analyze your project</p>
              </div>
            )}
          </div>
        );

      case 'explain':
        return (
          <div className="p-3">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-purple-400" />
              <span className="text-xs font-medium">Code Explanation</span>
            </div>
            {explanation ? (
              <div className="space-y-3">
                <pre className="p-3 rounded-md bg-neutral-100 dark:bg-neutral-800 text-xs font-mono whitespace-pre-wrap overflow-x-auto max-h-96">
                  {explanation}
                </pre>
                <button
                  onClick={() => copyToClipboard(explanation)}
                  className="px-3 py-1 rounded-md bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs transition-all flex items-center gap-1"
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            ) : (
              <div className="text-center text-neutral-400 text-xs py-4">
                <Sparkles size={20} className="mx-auto mb-2 opacity-40" />
                <p>No explanation yet</p>
                <p className="text-[10px] mt-1">Select a file and click "Explain Code"</p>
              </div>
            )}
          </div>
        );

      case 'bugs':
        return (
          <div className="p-3">
            <div className="flex items-center gap-2 mb-3">
              <Bug size={16} className="text-red-400" />
              <span className="text-xs font-medium">Bug Analysis</span>
            </div>
            {bugs ? (
              <div className="space-y-3">
                <pre className="p-3 rounded-md bg-neutral-100 dark:bg-neutral-800 text-xs font-mono whitespace-pre-wrap overflow-x-auto max-h-96">
                  {bugs}
                </pre>
                <button
                  onClick={() => copyToClipboard(bugs)}
                  className="px-3 py-1 rounded-md bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs transition-all flex items-center gap-1"
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            ) : (
              <div className="text-center text-neutral-400 text-xs py-4">
                <Bug size={20} className="mx-auto mb-2 opacity-40" />
                <p>No bugs found yet</p>
                <p className="text-[10px] mt-1">Click "Find Bugs" to analyze your code</p>
              </div>
            )}
          </div>
        );

      case 'optimize':
        return (
          <div className="p-3">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={16} className="text-yellow-400" />
              <span className="text-xs font-medium">Code Optimization</span>
            </div>
            {optimizedCode ? (
              <div className="space-y-3">
                <pre className="p-3 rounded-md bg-neutral-100 dark:bg-neutral-800 text-xs font-mono whitespace-pre-wrap overflow-x-auto max-h-96">
                  {optimizedCode}
                </pre>
                <div className="flex gap-2">
                  {onApplyOptimization && (
                    <button
                      onClick={() => onApplyOptimization(optimizedCode)}
                      className="px-3 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs transition-all"
                    >
                      Apply Optimization
                    </button>
                  )}
                  <button
                    onClick={() => copyToClipboard(optimizedCode)}
                    className="px-3 py-1 rounded-md bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs transition-all flex items-center gap-1"
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-neutral-400 text-xs py-4">
                <Zap size={20} className="mx-auto mb-2 opacity-40" />
                <p>No optimization suggestions yet</p>
                <p className="text-[10px] mt-1">Click "Optimize Code" to improve your code</p>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center h-48 text-center p-4">
            <Sparkles size={28} className="text-neutral-300 dark:text-neutral-600 mb-3" />
            <p className="text-xs font-medium text-neutral-500">AI Assistant</p>
            <p className="text-[10px] text-neutral-400 mt-1 max-w-xs">
              Select an AI feature from the dropdown to get started
            </p>
          </div>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="h-full w-[420px] lg:w-[480px] shrink-0 bg-white dark:bg-neutral-950 border-l border-neutral-200 dark:border-neutral-800 flex flex-col">
      {/* Header */}
      <div className="h-9 px-3 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800/60 bg-neutral-100/60 dark:bg-neutral-900/40">
        <div className="flex items-center gap-2 text-neutral-400 dark:text-neutral-500 text-xs font-medium">
          <Sparkles size={13} className="text-sky-400" />
          <span>AI Assistant</span>
          {activeFeature && (
            <>
              <span className="text-neutral-300 dark:text-neutral-600">·</span>
              <span className="text-[10px] capitalize text-neutral-500">
                {activeFeature === 'suggestion'
                  ? 'Inline Suggestion'
                  : activeFeature === 'summary'
                    ? 'Code Summary'
                    : activeFeature === 'explain'
                      ? 'Explain Code'
                      : activeFeature === 'bugs'
                        ? 'Bug Analysis'
                        : activeFeature === 'optimize'
                          ? 'Optimization'
                          : activeFeature}
              </span>
            </>
          )}
          {showRateLimitWarning && (
            <span className="flex items-center gap-1 text-amber-500 text-[10px]">
              <AlertCircle size={12} />
              <span>{rateLimit.remaining} requests left</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onClear}
            className="p-1 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
            title="Clear AI context"
          >
            <span className="text-xs">Clear</span>
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">{renderContent()}</div>
    </div>
  );
};
