import { useState, useCallback, useEffect } from 'react';
import { aiCache } from '@/lib/redis/cache';
import { CodeContextBuilder } from '@/lib/ai/context';
import { notify } from '@/lib/notifications';
import { TemplateFolder } from '@/features/playground/types';
import { PROMPTS } from '@/lib/ai/prompts';

interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface AIState {
  isOpen: boolean;
  isProcessing: boolean;
  messages: AIMessage[];
  activeFeature: 'chat' | 'suggestion' | 'summary' | 'explain' | 'optimize' | 'bugs' | null;
  suggestion: string;
  summary: string;
  explanation: string;
  optimizedCode: string;
  bugs: string;
  rateLimit: {
    remaining: number;
    reset: number;
  } | null;
}

export const useAI = (
  templateData: TemplateFolder | null,
  activeFileContent: string,
  activeFilePath: string,
  userId: string = 'anonymous'
) => {
  const [state, setState] = useState<AIState>({
    isOpen: false,
    isProcessing: false,
    messages: [],
    activeFeature: null,
    suggestion: '',
    summary: '',
    explanation: '',
    optimizedCode: '',
    bugs: '',
    rateLimit: null,
  });

  const [contextBuilder, setContextBuilder] = useState<CodeContextBuilder | null>(null);

  useEffect(() => {
    if (templateData) {
      setContextBuilder(new CodeContextBuilder(templateData));
    }
  }, [templateData]);

  // ✅ FIX: Check rate limit with proper error handling
  useEffect(() => {
    const checkRateLimit = async () => {
      try {
        // Skip rate limit check if Redis is not configured
        if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
          console.log('Redis not configured, skipping rate limit check');
          setState(prev => ({
            ...prev,
            rateLimit: {
              remaining: 100,
              reset: Math.floor(Date.now() / 1000) + 60,
            },
          }));
          return;
        }

        // Try to get rate limit info from API
        const response = await fetch('/api/ai/rate-limit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });

        if (response.ok) {
          const data = await response.json();
          setState(prev => ({
            ...prev,
            rateLimit: {
              remaining: data.remaining || 100,
              reset: data.reset || Math.floor(Date.now() / 1000) + 60,
            },
          }));
        } else {
          // Fallback values if API fails
          setState(prev => ({
            ...prev,
            rateLimit: {
              remaining: 100,
              reset: Math.floor(Date.now() / 1000) + 60,
            },
          }));
        }
      } catch (error) {
        // Silent fail - rate limiting is not critical
        console.warn('Rate limit check failed:', error);
        setState(prev => ({
          ...prev,
          rateLimit: {
            remaining: 100,
            reset: Math.floor(Date.now() / 1000) + 60,
          },
        }));
      }
    };

    checkRateLimit();
  }, [userId]);

  const toggleAI = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: !prev.isOpen }));
  }, []);

  const setActiveFeature = useCallback(
    (feature: AIState['activeFeature']) => {
      setState(prev => ({ ...prev, activeFeature: feature }));
      if (!state.isOpen) {
        setState(prev => ({ ...prev, isOpen: true }));
      }
    },
    [state.isOpen]
  );

  const makeAIRequest = useCallback(
    async (prompt: string, context?: string) => {
      try {
        const response = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            context,
            userId,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 429) {
            notify.error('Rate Limit', 'Too many requests. Please wait a moment.');
            throw new Error('Rate limit exceeded');
          }
          throw new Error(data.error || 'Failed to get AI response');
        }

        return data.response;
      } catch (error) {
        console.error('AI request error:', error);
        throw error;
      }
    },
    [userId]
  );

  const sendChatMessage = useCallback(
    async (message: string) => {
      if (!contextBuilder) {
        notify.error('Error', 'No project context available');
        return;
      }

      setState(prev => ({
        ...prev,
        isProcessing: true,
        messages: [...prev.messages, { role: 'user', content: message, timestamp: new Date() }],
      }));

      try {
        const context = contextBuilder.getAllFilesContent();
        const projectOverview = contextBuilder.getProjectOverview();
        const prompt = `${projectOverview}\n\n${context}\n\nUser question: ${message}`;

        const response = await makeAIRequest(prompt);

        setState(prev => ({
          ...prev,
          isProcessing: false,
          messages: [
            ...prev.messages,
            { role: 'assistant', content: response, timestamp: new Date() },
          ],
        }));

        notify.success('AI Response', 'Message received successfully');
      } catch (error) {
        console.error('Chat error:', error);
        setState(prev => ({ ...prev, isProcessing: false }));
      }
    },
    [contextBuilder, makeAIRequest]
  );

  // ✅ FIX: Move cacheKey declaration outside try block
  const getInlineSuggestion = useCallback(async () => {
    if (!contextBuilder || !activeFileContent) {
      notify.error('Error', 'No file content available');
      return;
    }

    // ✅ Declare cacheKey outside try block
    const cacheKey = aiCache.generateKey(
      'suggestion',
      activeFilePath,
      activeFileContent.slice(-200)
    );

    try {
      const cached = await aiCache.get<string>(cacheKey);
      if (cached) {
        setState(prev => ({ ...prev, suggestion: cached }));
        return;
      }
    } catch (error) {
      console.warn('Cache read failed:', error);
    }

    setState(prev => ({ ...prev, isProcessing: true, activeFeature: 'suggestion' }));

    try {
      const language = activeFilePath.split('.').pop() || 'javascript';
      const prompt = PROMPTS.INLINE_SUGGESTION(
        activeFileContent,
        language,
        activeFileContent.length
      );

      const suggestion = await makeAIRequest(prompt);

      try {
        await aiCache.set(cacheKey, suggestion, 300);
      } catch (error) {
        console.warn('Cache write failed:', error);
      }

      setState(prev => ({ ...prev, isProcessing: false, suggestion }));
      notify.success('Suggestion Ready', 'Inline suggestion generated successfully');
    } catch (error) {
      console.error('Suggestion error:', error);
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  }, [contextBuilder, activeFileContent, activeFilePath, makeAIRequest]);

  const getCodeSummary = useCallback(async () => {
    if (!contextBuilder) {
      notify.error('Error', 'No project context available');
      return;
    }

    const files = contextBuilder.getFilesForSummary();

    // ✅ Declare cacheKey outside try block
    const cacheKey = aiCache.generateKey('summary', ...files.map(f => f.path));

    try {
      const cached = await aiCache.get<string>(cacheKey);
      if (cached) {
        setState(prev => ({ ...prev, summary: cached }));
        return;
      }
    } catch (error) {
      console.warn('Cache read failed:', error);
    }

    setState(prev => ({ ...prev, isProcessing: true, activeFeature: 'summary' }));

    try {
      const prompt = PROMPTS.CODE_SUMMARY(files);
      const summary = await makeAIRequest(prompt);

      try {
        await aiCache.set(cacheKey, summary, 3600);
      } catch (error) {
        console.warn('Cache write failed:', error);
      }

      setState(prev => ({ ...prev, isProcessing: false, summary }));
      notify.success('Summary Ready', 'Code base summary generated successfully');
    } catch (error) {
      console.error('Summary error:', error);
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  }, [contextBuilder, makeAIRequest]);

  const explainCode = useCallback(async () => {
    if (!activeFileContent) {
      notify.error('Error', 'No file content available');
      return;
    }

    // ✅ Declare cacheKey outside try block
    const cacheKey = aiCache.generateKey('explain', activeFilePath, activeFileContent.slice(-100));

    try {
      const cached = await aiCache.get<string>(cacheKey);
      if (cached) {
        setState(prev => ({ ...prev, explanation: cached }));
        return;
      }
    } catch (error) {
      console.warn('Cache read failed:', error);
    }

    setState(prev => ({ ...prev, isProcessing: true, activeFeature: 'explain' }));

    try {
      const language = activeFilePath.split('.').pop() || 'javascript';
      const prompt = PROMPTS.EXPLAIN_CODE(activeFileContent, language);
      const explanation = await makeAIRequest(prompt);

      try {
        await aiCache.set(cacheKey, explanation, 1800);
      } catch (error) {
        console.warn('Cache write failed:', error);
      }

      setState(prev => ({ ...prev, isProcessing: false, explanation }));
      notify.success('Explanation Ready', 'Code explained successfully');
    } catch (error) {
      console.error('Explain error:', error);
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  }, [activeFileContent, activeFilePath, makeAIRequest]);

  const findBugs = useCallback(async () => {
    if (!activeFileContent) {
      notify.error('Error', 'No file content available');
      return;
    }

    setState(prev => ({ ...prev, isProcessing: true, activeFeature: 'bugs' }));

    try {
      const language = activeFilePath.split('.').pop() || 'javascript';
      const prompt = PROMPTS.FIND_BUGS(activeFileContent, language);
      const bugs = await makeAIRequest(prompt);

      setState(prev => ({ ...prev, isProcessing: false, bugs }));
      notify.success('Analysis Complete', 'Bug analysis finished');
    } catch (error) {
      console.error('Bugs error:', error);
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  }, [activeFileContent, activeFilePath, makeAIRequest]);

  const optimizeCode = useCallback(async () => {
    if (!activeFileContent) {
      notify.error('Error', 'No file content available');
      return;
    }

    setState(prev => ({ ...prev, isProcessing: true, activeFeature: 'optimize' }));

    try {
      const language = activeFilePath.split('.').pop() || 'javascript';
      const prompt = PROMPTS.OPTIMIZE_CODE(activeFileContent, language);
      const optimizedCode = await makeAIRequest(prompt);

      setState(prev => ({ ...prev, isProcessing: false, optimizedCode }));
      notify.success('Optimization Ready', 'Code optimized successfully');
    } catch (error) {
      console.error('Optimize error:', error);
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  }, [activeFileContent, activeFilePath, makeAIRequest]);

  const clearState = useCallback(() => {
    setState(prev => ({
      ...prev,
      suggestion: '',
      summary: '',
      explanation: '',
      optimizedCode: '',
      bugs: '',
      messages: [],
      activeFeature: null,
    }));
  }, []);

  return {
    state,
    toggleAI,
    setActiveFeature,
    sendChatMessage,
    getInlineSuggestion,
    getCodeSummary,
    explainCode,
    findBugs,
    optimizeCode,
    clearState,
    setState,
  };
};
