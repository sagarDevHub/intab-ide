'use client';

import { AlertCircle, Sparkles, TerminalSquare, X, Square } from 'lucide-react';
import { OpenedTab, TemplateFolder } from '../types';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { executeSimulatedCommand } from '../lib/terminal-engine';

interface TerminalDockProps {
  openTabs: OpenedTab[];
  templateData: TemplateFolder | null;
  activeTabId: string | null;
  isOpen: boolean;
  activePanel: 'console' | 'problems' | 'ai';
  setIsOpen: (open: boolean) => void;
  setActivePanel: (panel: 'console' | 'problems' | 'ai') => void;
  onKillServer?: () => Promise<void>;
}

export interface TerminalDockRef {
  writeRawLog: (text: string) => void;
}

export const TerminalDock = forwardRef<TerminalDockRef, TerminalDockProps>(
  (
    {
      openTabs,
      templateData,
      activeTabId,
      isOpen,
      activePanel,
      setIsOpen,
      setActivePanel,
      onKillServer,
    },
    ref
  ) => {
    const terminalRef = useRef<HTMLDivElement>(null);
    const xtermInstance = useRef<Terminal | null>(null);
    const currentLineInput = useRef<string>('');
    const fitAddonRef = useRef<FitAddon | null>(null);

    const stateRef = useRef({ openTabs, templateData, activeTabId });
    useEffect(() => {
      stateRef.current = { openTabs, templateData, activeTabId };
    }, [openTabs, templateData, activeTabId]);

    useImperativeHandle(ref, () => ({
      writeRawLog: (text: string) => {
        if (xtermInstance.current) {
          xtermInstance.current.write(text);
        }
      },
    }));

    useEffect(() => {
      if (isOpen && fitAddonRef.current) {
        setTimeout(() => fitAddonRef.current?.fit(), 50);
      }
    }, [isOpen, activePanel]);

    useEffect(() => {
      if (!terminalRef.current || xtermInstance.current) return;

      const term = new Terminal({
        cursorBlink: true,
        fontSize: 12,
        fontFamily: 'Menlo, Monaco, Consolas, monospace',
        theme: { background: '#0D1117', foreground: '#E6EDF3', cursor: '#F0F6FC' },
        rows: 12,
      });

      const fitAddon = new FitAddon();
      fitAddonRef.current = fitAddon;
      term.loadAddon(fitAddon);
      term.open(terminalRef.current);
      fitAddon.fit();

      xtermInstance.current = term;

      term.onData(data => {
        const code = data.charCodeAt(0);

        if (code === 13) {
          executeSimulatedCommand(currentLineInput.current, {
            openTabs: stateRef.current.openTabs,
            templateData: stateRef.current.templateData,
            activeTabId: stateRef.current.activeTabId,
            clearTerminal: () => term.clear(),
            writeLine: text => term.write(text),
          });
          currentLineInput.current = '';
        } else if (code === 127) {
          if (currentLineInput.current.length > 0) {
            currentLineInput.current = currentLineInput.current.slice(0, -1);
            term.write('\b \b');
          }
        } else if (code >= 32 && code <= 126) {
          currentLineInput.current += data;
          term.write(data);
        }
      });

      return () => {
        term.dispose();
        xtermInstance.current = null;
        fitAddonRef.current = null;
      };
    }, []);

    return (
      <div
        className={`border-t border-neutral-200/10 dark:border-neutral-800/40 bg-[#0D1117] flex flex-col shrink-0 z-20 ${
          isOpen ? 'block' : 'hidden'
        }`}
      >
        <div className="h-9 px-4 flex items-center justify-between border-b border-neutral-800/30 bg-neutral-950/40 select-none">
          <div className="flex items-center gap-4 h-full text-[11px] font-semibold uppercase tracking-wider font-mono">
            <button
              onClick={() => setActivePanel('console')}
              className={`flex items-center gap-1.5 h-full relative cursor-pointer transition-colors ${
                activePanel === 'console'
                  ? 'text-sky-400 border-b-2 border-sky-400'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <TerminalSquare size={13} />
              <span>Console Output</span>
            </button>

            <button
              onClick={() => setActivePanel('problems')}
              className={`flex items-center gap-1.5 h-full relative cursor-pointer transition-colors ${
                activePanel === 'problems'
                  ? 'text-sky-400 border-b-2 border-sky-400'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <AlertCircle size={13} />
              <span>Problems</span>
            </button>

            <button
              onClick={() => setActivePanel('ai')}
              className={`flex items-center gap-1.5 h-full relative cursor-pointer transition-colors ${
                activePanel === 'ai'
                  ? 'text-sky-400 border-b-2 border-sky-400'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <Sparkles size={13} />
              <span>AI Debugger</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onKillServer && (
              <button
                onClick={onKillServer}
                className="text-red-400 hover:text-red-300 transition-colors cursor-pointer p-1 rounded-md hover:bg-red-500/10"
                title="Stop Dev Server"
              >
                <Square size={14} />
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="text-neutral-500 hover:text-neutral-200 transition-colors cursor-pointer p-1 rounded-md hover:bg-neutral-800"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        <div
          className="p-2 bg-[#0D1117] overflow-hidden"
          style={{ minHeight: '260px', maxHeight: '360px' }}
        >
          <div className={`w-full h-full ${activePanel === 'console' ? 'block' : 'hidden'}`}>
            <div ref={terminalRef} className="w-full h-full" />
          </div>

          {activePanel === 'problems' && (
            <div className="text-xs font-mono text-neutral-400 p-2 flex flex-col gap-1 select-text overflow-y-auto h-full">
              <span className="text-emerald-500">
                No syntax compile diagnostic warnings resolved inside active environment workspace.
              </span>
            </div>
          )}

          {activePanel === 'ai' && (
            <div className="text-xs font-mono text-neutral-500 p-2 select-none animate-pulse overflow-y-auto h-full">
              AI Debugger session context pipeline sleeping... Ready for Phase 3 models.
            </div>
          )}
        </div>
      </div>
    );
  }
);

TerminalDock.displayName = 'TerminalDock';
