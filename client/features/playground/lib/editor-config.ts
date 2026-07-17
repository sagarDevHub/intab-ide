import type { Monaco } from '@monaco-editor/react';

export const getEditorLanguage = (fileExtension: string): string => {
  const extension = fileExtension.toLowerCase();
  const languageMap: Record<string, string> = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    mjs: 'javascript',
    cjs: 'javascript',
    json: 'json',
    html: 'html',
    htm: 'html',
    css: 'css',
    scss: 'scss',
    sass: 'scss',
    less: 'less',
    md: 'markdown',
    markdown: 'markdown',
    xml: 'xml',
    yaml: 'yaml',
    yml: 'yaml',
    py: 'python',
    python: 'python',
    java: 'java',
    c: 'c',
    cpp: 'cpp',
    cs: 'csharp',
    php: 'php',
    rb: 'ruby',
    go: 'go',
    rs: 'rust',
    sh: 'shell',
    bash: 'shell',
    sql: 'sql',
    toml: 'ini',
    ini: 'ini',
    conf: 'ini',
    dockerfile: 'dockerfile',
  };

  return languageMap[extension] || 'plaintext';
};

export const configureMonacoWorkspace = (monaco: Monaco) => {
  // Define a premium modern dark editor theme profile
  monaco.editor.defineTheme('modern-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '7C7C7C', fontStyle: 'italic' },
      { token: 'comment.line', foreground: '7C7C7C', fontStyle: 'italic' },
      { token: 'comment.block', foreground: '7C7C7C', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'C586C0', fontStyle: 'bold' },
      { token: 'keyword.control', foreground: 'C586C0', fontStyle: 'bold' },
      { token: 'string', foreground: 'CE9178' },
      { token: 'string.quoted', foreground: 'CE9178' },
      { token: 'string.template', foreground: 'CE9178' },
      { token: 'number', foreground: 'B5CEA8' },
      { token: 'number.hex', foreground: 'B5CEA8' },
      { token: 'number.float', foreground: 'B5CEA8' },
      { token: 'entity.name.function', foreground: 'DCDCAA' },
      { token: 'support.function', foreground: 'DCDCAA' },
      { token: 'variable', foreground: '9CDCFE' },
      { token: 'variable.parameter', foreground: '9CDCFE' },
      { token: 'variable.other', foreground: '9CDCFE' },
      { token: 'entity.name.type', foreground: '4EC9B0' },
      { token: 'support.type', foreground: '4EC9B0' },
      { token: 'storage.type', foreground: '569CD6' },
      { token: 'entity.name.class', foreground: '4EC9B0' },
      { token: 'support.class', foreground: '4EC9B0' },
      { token: 'constant', foreground: '4FC1FF' },
      { token: 'constant.language', foreground: '569CD6' },
      { token: 'constant.numeric', foreground: 'B5CEA8' },
      { token: 'keyword.operator', foreground: 'D4D4D4' },
      { token: 'punctuation', foreground: 'D4D4D4' },
      { token: 'tag', foreground: '569CD6' },
      { token: 'tag.id', foreground: '9CDCFE' },
      { token: 'tag.class', foreground: '92C5F8' },
      { token: 'attribute.name', foreground: '9CDCFE' },
      { token: 'attribute.value', foreground: 'CE9178' },
      { token: 'attribute.name.css', foreground: '9CDCFE' },
      { token: 'attribute.value.css', foreground: 'CE9178' },
      { token: 'property-name.css', foreground: '9CDCFE' },
      { token: 'property-value.css', foreground: 'CE9178' },
      { token: 'key', foreground: '9CDCFE' },
      { token: 'string.key', foreground: '9CDCFE' },
      { token: 'string.value', foreground: 'CE9178' },
      { token: 'invalid', foreground: 'F44747', fontStyle: 'underline' },
      { token: 'invalid.deprecated', foreground: 'D4D4D4', fontStyle: 'strikethrough' },
    ],
    colors: {
      'editor.background': '#0D1117',
      'editor.foreground': '#E6EDF3',
      'editorLineNumber.foreground': '#7D8590',
      'editorLineNumber.activeForeground': '#F0F6FC',
      'editorCursor.foreground': '#F0F6FC',
      'editor.selectionBackground': '#264F78',
      'editor.selectionHighlightBackground': '#ADD6FF26',
      'editor.inactiveSelectionBackground': '#3A3D41',
      'editor.lineHighlightBackground': '#21262D',
      'editor.lineHighlightBorder': '#30363D',
      'editorGutter.background': '#0D1117',
      'scrollbarSlider.background': '#6E768166',
      'scrollbarSlider.hoverBackground': '#6E768188',
      'scrollbarSlider.activeBackground': '#6E7681BB',
      'minimap.background': '#161B22',
      'editorSuggestWidget.background': '#161B22',
      'editorSuggestWidget.border': '#30363D',
      'editorSuggestWidget.foreground': '#E6EDF3',
      'editorSuggestWidget.selectedBackground': '#21262D',
      'editorHoverWidget.background': '#161B22',
      'editorHoverWidget.border': '#30363D',
    },
  });

  monaco.editor.setTheme('modern-dark');

  // ✅ Force-suppress background engine diagnostic noise layout underlines
  const diagnosticOverrides = {
    noSemanticValidation: true,
    noSyntaxValidation: false,
  };
  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions(diagnosticOverrides);
  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions(diagnosticOverrides);

  const compilerSettings = {
    target: monaco.languages.typescript.ScriptTarget.Latest,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.CommonJS,
    noEmit: true,
    esModuleInterop: true,
    allowSyntheticDefaultImports: true,
    jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
    allowJs: true,
  };
  monaco.languages.typescript.javascriptDefaults.setCompilerOptions(compilerSettings);
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions(compilerSettings);
};

export const defaultEditorOptions = {
  fontSize: 14,
  fontFamily: "Menlo, Monaco, Consolas, 'Courier New', monospace",
  fontWeight: '400',
  lineHeight: 20,
  minimap: { enabled: true, side: 'right' as const, showSlider: 'mouseover' as const },
  scrollBeyondLastLine: false,
  automaticLayout: true,
  padding: { top: 16, bottom: 16 },
  lineNumbers: 'on' as const,
  renderLineHighlight: 'all' as const,
  renderWhitespace: 'selection' as const,
  tabSize: 2,
  insertSpaces: true,
  wordWrap: 'on' as const,
  folding: true,
  smoothScrolling: true,
  suggestOnTriggerCharacters: true,
  acceptSuggestionOnEnter: 'on' as const,
  cursorBlinking: 'smooth' as const,
  cursorSmoothCaretAnimation: 'on' as const,
  cursorStyle: 'line' as const,
  cursorWidth: 2,
  renderLineHighlightOnlyWhenFocus: false,
  definitionLinkOpensInPeek: true,
};
