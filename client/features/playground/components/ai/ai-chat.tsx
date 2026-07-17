'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Send, Loader2, Sparkles, User, Copy, Check } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface AIChatProps {
  messages: Message[];
  isProcessing: boolean;
  onSendMessage: (message: string) => void;
  onClear?: () => void;
  placeholder?: string;
}

export const AIChat = ({
  messages,
  isProcessing,
  onSendMessage,
  onClear,
  placeholder = 'Ask about your code...',
}: AIChatProps) => {
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, []);

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
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-950">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-12 h-12 rounded-full bg-sky-500/10 flex items-center justify-center mb-4">
              <Sparkles size={24} className="text-sky-400" />
            </div>
            <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
              Chat with AI Assistant
            </h3>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1 max-w-xs">
              Ask questions about your code, get help debugging, or brainstorm ideas.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => onSendMessage('Explain this code to me')}
                className="px-3 py-1.5 text-xs rounded-full border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Explain code
              </button>
              <button
                onClick={() => onSendMessage('Find bugs in this file')}
                className="px-3 py-1.5 text-xs rounded-full border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Find bugs
              </button>
              <button
                onClick={() => onSendMessage('How can I optimize this?')}
                className="px-3 py-1.5 text-xs rounded-full border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Optimize code
              </button>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                  msg.role === 'user'
                    ? 'bg-sky-600 text-white rounded-br-none'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 rounded-bl-none'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-1.5">
                    <Sparkles size={12} className="text-sky-400" />
                    <span className="text-[10px] font-medium text-neutral-400 dark:text-neutral-500">
                      AI Assistant
                    </span>
                  </div>
                )}
                {msg.role === 'user' && (
                  <div className="flex items-center gap-2 mb-1.5 justify-end">
                    <span className="text-[10px] font-medium text-sky-200">You</span>
                    <User size={12} />
                  </div>
                )}
                <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed">
                  {msg.content}
                </pre>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[9px] opacity-50">{formatTime(msg.timestamp)}</span>
                  {msg.role === 'assistant' && (
                    <button
                      onClick={() => copyToClipboard(msg.content)}
                      className="text-[9px] opacity-50 hover:opacity-100 transition-opacity flex items-center gap-1"
                    >
                      {copied ? <Check size={10} /> : <Copy size={10} />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl px-4 py-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-bl-none">
              <div className="flex items-center gap-2">
                <Loader2 size={14} className="animate-spin text-sky-400" />
                <span className="text-xs text-neutral-400">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-neutral-200 dark:border-neutral-800 p-3">
        <div className="flex gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 text-xs rounded-lg bg-neutral-100 dark:bg-neutral-800 border-0 resize-none focus:ring-2 focus:ring-sky-500 outline-none min-h-10 max-h-30"
            rows={1}
            disabled={isProcessing}
          />
          <button
            onClick={handleSend}
            disabled={isProcessing || !input.trim()}
            className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 self-end"
          >
            <Send size={14} />
          </button>
        </div>
        {onClear && messages.length > 0 && (
          <button
            onClick={onClear}
            className="text-[10px] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 mt-1.5 transition-colors"
          >
            Clear conversation
          </button>
        )}
      </div>
    </div>
  );
};
