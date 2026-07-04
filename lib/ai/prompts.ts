// lib/ai/prompts.ts
export const PROMPTS = {
  INLINE_SUGGESTION: (code: string, language: string, cursorPosition: number) => `
You are an expert ${language} developer. Provide inline code suggestions based on the context.

Current file content:
${code}

Cursor position: ${cursorPosition}

Rules:
1. Suggest the next logical code block
2. Maintain the existing coding style
3. Only return the code suggestion, no explanations
4. Keep suggestions concise and focused

Suggestion:
`,

  CODE_SUMMARY: (files: Array<{ path: string; content: string }>) => `
Analyze the following codebase and provide a comprehensive summary:

${files.map(f => `File: ${f.path}\n${f.content}\n---`).join('\n')}

Provide:
1. Project overview
2. Key features
3. Main technologies used
4. Architecture overview

Summary:
`,

  EXPLAIN_CODE: (code: string, language: string) => `
Explain the following ${language} code in detail:

${code}

Provide:
1. What this code does
2. Step-by-step breakdown
3. Key functions and their purposes

Explanation:
`,

  FIND_BUGS: (code: string, language: string) => `
Analyze the following ${language} code for bugs and issues:

${code}

Look for:
1. Syntax errors
2. Logic errors
3. Performance issues
4. Security vulnerabilities

Analysis:
`,

  OPTIMIZE_CODE: (code: string, language: string) => `
Optimize the following ${language} code:

${code}

Provide:
- Original code
- Optimized code
- Explanation of changes

Optimized version:
`,

  CHAT: (messages: Array<{ role: string; content: string }>, context: string) => `
You are an AI coding assistant. Help the user with their programming questions.

Context:
${context}

Chat history:
${messages.map(m => `${m.role}: ${m.content}`).join('\n')}

Response:
`,
};
