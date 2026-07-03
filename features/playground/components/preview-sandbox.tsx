'use client';

import { useEffect, useRef } from 'react';
import { OpenedTab } from '../types';
import { Monitor, Play } from 'lucide-react';

interface PreviewSandboxProps {
  openTabs: OpenedTab[];
  activeTabId: string | null;
  onSandboxLog: (logText: string) => void;
}

const PreviewSandbox = ({ openTabs, activeTabId, onSandboxLog }: PreviewSandboxProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const activeTab = openTabs.find(t => t.id === activeTabId);

  const runCodeInSandbox = () => {
    if (!iframeRef.current || !activeTab) return;

    onSandboxLog(
      '\r\n\x1b[35m[sandbox]\x1b[0m Compiling script and assembling DOM instance...\r\n'
    );

    const logInterceptorScript = `
        <script>
        const _log = console.log
        const _error = console.error

        console.log = (...args) => {
        _log(...args)
        window.parent.postMessage({ type: 'SANDBOX_LOG', text: '\\r\\n' + args.join(' ') + '\\r\\n' }, '*');
        }
        window.onerror = (message, source, lineno, colno, error) => {
          window.parent.postMessage({ type: 'SANDBOX_ERROR', text: '\\r\\n\\x1b[31mRuntime Error: ' + message + ' (Line ' + lineno + ')\\x1b[0m\\r\\n' }, '*');
          return false;
        };
        </script>
        `;

    let srcDocContent = '';

    if (activeTab.fileExtension === 'html') {
      srcDocContent = `${logInterceptorScript}${activeTab.content}`;
    } else if (activeTab.fileExtension === 'js' || activeTab.fileExtension === 'ts') {
      srcDocContent = `
                <html>
          <head>${logInterceptorScript}</head>
          <body>
            <div style="font-family: monospace; color: #888; padding: 12px; font-size: 11px;">
              Console execution script running... Check terminal log panel.
            </div>
            <script>${activeTab.content}</script>
          </body>
        </html>
            `;
    } else {
      srcDocContent = `
        <html>
          <body>
            <div style="font-family: sans-serif; color: #ff9900; padding: 12px; font-size: 12px;">
              Preview display not configured for .${activeTab.fileExtension} files. Click Run to evaluate.
            </div>
          </body>
        </html>
      `;
    }
    iframeRef.current.srcdoc = srcDocContent;
  };

  useEffect(() => {
    const handleMessageEvent = (event: MessageEvent) => {
      if (event.data?.type === 'SANDBOX_LOG' || event.data?.type === 'SANDBOX_ERROR') {
        onSandboxLog(event.data.text);
      }
      if (event.data?.type === 'TRIGGER_SANDBOX_RUN') {
        runCodeInSandbox();
      }
    };
    window.addEventListener('message', handleMessageEvent);
    return () => window.removeEventListener('message', handleMessageEvent);
  }, [onSandboxLog, openTabs, activeTabId]);
  return (
    <div className="w-80 h-full border-l border-neutral-200/10 dark:border-neutral-800/50 flex flex-col bg-[#0D1117] shrink-0">
      {/* Tab bar header for preview area */}
      <div className="h-9 px-3 flex items-center justify-between border-b border-neutral-800/40 bg-neutral-950/40 select-none shrink-0">
        <div className="flex items-center gap-2 text-xs font-medium text-neutral-400">
          <Monitor size={13} className="text-sky-400" />
          <span>Live Display Window</span>
        </div>

        <button
          onClick={runCodeInSandbox}
          className="h-6 px-2.5 rounded-md bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-semibold flex items-center gap-1.5 transition-all shadow-2xs active:scale-95 cursor-pointer"
        >
          <Play size={10} fill="currentColor" />
          <span>Run Code</span>
        </button>
      </div>

      {/* Sandboxed iframe node container */}
      <div className="flex-1 bg-white dark:bg-neutral-900 relative">
        <iframe
          ref={iframeRef}
          title="Sandbox Workspace Preview Window"
          sandbox="allow-scripts"
          className="w-full h-full border-none bg-white dark:bg-neutral-950"
        />
      </div>
    </div>
  );
};

export default PreviewSandbox;
