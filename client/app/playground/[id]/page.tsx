'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { usePlayground } from '@/features/playground/hooks/usePlayground';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import TemplateFileTree from '@/features/playground/components/template-file-tree';
import { PlaygroundHeader } from '@/features/playground/components/playground-header';
import { CodeEditorWorkspace } from '@/features/playground/components/code-editor-workspace';
import { FileSystemModal } from '@/features/playground/components/file-system-modal';
import { TemplateFile, ModalContextState, OpenedTab } from '@/features/playground/types';
import { Loader2, Monitor, RefreshCw, Square, Play } from 'lucide-react';
import { CommandPalette } from '@/features/playground/components/command-palette';
import { FileSearchPalette } from '@/features/playground/components/file-search-palette';
import { TerminalDock, TerminalDockRef } from '@/features/playground/components/terminal-dock';
import { PlaygroundStatusBar } from '@/features/playground/components/playground-status-bar';
import { AIPanel } from '@/features/playground/components/ai/ai-panel';
import { useAI } from '@/hooks/ai/useAI';

export const dynamic = 'force-dynamic';
const PlaygroundPage = () => {
  const { id } = useParams<{ id: string }>();
  const terminalDockRef = useRef<TerminalDockRef>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeKey, setIframeKey] = useState(0);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isServerRunning, setIsServerRunning] = useState(true);
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);
  const [openTabs, setOpenTabs] = useState<OpenedTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  const handleTerminalStreamWrite = useCallback((text: string) => {
    if (terminalDockRef.current) {
      terminalDockRef.current.writeRawLog(text);
    }
  }, []);

  const {
    playgroundData,
    templateData,
    isLoading,
    previewUrl,
    saveTemplateData,
    addNewFile,
    addNewFolder,
    renameNodeItem,
    deleteNodeItem,
    updateActiveFileContent,
    killDevServer,
    startDevServer,
  } = usePlayground(id, handleTerminalStreamWrite);

  // Get active file content for AI
  const activeTab = openTabs.find(t => t.id === activeTabId);
  const activeFileContent = activeTab?.content || '';
  const activeFilePath = activeTabId || '';

  // Initialize AI hook
  const ai = useAI(templateData, activeFileContent, activeFilePath, id || 'anonymous');

  const [isRehydratingTabs, setIsRehydratingTabs] = useState(true);
  const [isAutoSaveEnabled, setIsAutoSaveEnabled] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);
  const [activeTerminalPanel, setActiveTerminalPanel] = useState<'console' | 'problems'>('console');

  const [modal, setModal] = useState<ModalContextState>({
    isOpen: false,
    type: 'createFile',
    isFolder: false,
    targetPath: '',
  });

  // Hard reload of the iframe
  const reloadPreview = useCallback(() => {
    setIframeKey(prev => prev + 1);
  }, []);

  const handleKillServer = useCallback(async () => {
    await killDevServer();
    setIsServerRunning(false);
    reloadPreview();
  }, [killDevServer, reloadPreview]);

  const handleStartServer = useCallback(async () => {
    await startDevServer();
    setIsServerRunning(true);
    reloadPreview();
  }, [startDevServer, reloadPreview]);

  const handleToggleSidebar = useCallback(() => {
    setIsSidebarCollapsed(prev => !prev);
  }, []);

  // Update server status when previewUrl changes
  useEffect(() => {
    setIsServerRunning(!!previewUrl);
  }, [previewUrl]);

  // AI handlers
  const handleAIFeatureSelect = (
    feature: 'chat' | 'suggestion' | 'summary' | 'explain' | 'optimize' | 'bugs'
  ) => {
    ai.setActiveFeature(feature);
    setIsAIPanelOpen(true);

    switch (feature) {
      case 'chat':
        break;
      case 'suggestion':
        ai.getInlineSuggestion();
        break;
      case 'summary':
        ai.getCodeSummary();
        break;
      case 'explain':
        ai.explainCode();
        break;
      case 'optimize':
        ai.optimizeCode();
        break;
      case 'bugs':
        ai.findBugs();
        break;
    }
  };

  const handleAIToggle = () => {
    ai.toggleAI();
    setIsAIPanelOpen(prev => !prev);
    if (!isAIPanelOpen) {
      ai.setActiveFeature('chat');
    }
  };

  const handleApplySuggestion = (suggestion: string) => {
    if (activeTabId) {
      handleCodeChange(suggestion);
      setIsAIPanelOpen(false);
      ai.toggleAI();
    }
  };

  const handleApplyOptimization = (code: string) => {
    if (activeTabId) {
      handleCodeChange(code);
      setIsAIPanelOpen(false);
      ai.toggleAI();
    }
  };

  useEffect(() => {
    if (!id) return;
    try {
      const savedTabsRaw = localStorage.getItem(`playground:tabs:${id}`);
      const savedActiveTabId = localStorage.getItem(`playground:active-tab:${id}`);

      if (savedTabsRaw) setOpenTabs(JSON.parse(savedTabsRaw));
      if (savedActiveTabId) setActiveTabId(savedActiveTabId);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRehydratingTabs(false);
    }
  }, [id]);

  useEffect(() => {
    if (isRehydratingTabs || !id) return;
    localStorage.setItem(`playground:tabs:${id}`, JSON.stringify(openTabs));
    if (activeTabId) {
      localStorage.setItem(`playground:active-tab:${id}`, activeTabId);
    } else {
      localStorage.removeItem(`playground:active-tab:${id}`);
    }
  }, [openTabs, activeTabId, id, isRehydratingTabs]);

  useEffect(() => {
    if (
      !isLoading &&
      !isRehydratingTabs &&
      openTabs.length === 0 &&
      templateData?.items &&
      templateData.items.length > 0
    ) {
      const firstItem = templateData.items[0];
      if (firstItem && !('folderName' in firstItem)) {
        handleFileSelect(firstItem as TemplateFile);
      }
    }
  }, [templateData, isLoading, isRehydratingTabs]);

  useEffect(() => {
    const handleToggleShortcut = (e: KeyboardEvent) => {
      if (e.key === '`' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsTerminalOpen(prev => !prev);
      }
      if (e.key === 'S' && (e.metaKey || e.ctrlKey) && e.shiftKey) {
        e.preventDefault();
        if (isServerRunning) {
          handleKillServer();
        } else {
          handleStartServer();
        }
      }
      if (e.key === 'B' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleToggleSidebar();
      }
      if (e.key === 'I' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleAIToggle();
      }
    };
    window.addEventListener('keydown', handleToggleShortcut);
    return () => window.removeEventListener('keydown', handleToggleShortcut);
  }, [handleKillServer, handleStartServer, handleToggleSidebar, isServerRunning, handleAIToggle]);

  const handleFileSelect = (file: TemplateFile, fullFilePath?: string) => {
    const rawPath = fullFilePath || `${file.filename}.${file.fileExtension}`;
    const cleanVFSPath = rawPath.startsWith('Root/') ? rawPath.replace('Root/', '') : rawPath;
    const tabId = cleanVFSPath;

    const tabExists = openTabs.some(t => (t as any).fullPath === tabId);

    if (!tabExists) {
      const newTab: OpenedTab = {
        id: tabId,
        filename: file.filename,
        fileExtension: file.fileExtension,
        content: file.content,
        hasUnsavedChanges: false,
      };
      (newTab as any).fullPath = tabId;
      setOpenTabs(prev => [...prev, newTab]);
    }
    setActiveTabId(tabId);
  };

  const handleCodeChange = (newValue: string | undefined) => {
    if (!activeTabId || newValue === undefined) return;

    setOpenTabs(prev =>
      prev.map(tab => {
        const currentPathKey = (tab as any).fullPath || tab.id;
        return currentPathKey === activeTabId
          ? { ...tab, content: newValue, hasUnsavedChanges: true }
          : tab;
      })
    );

    console.log(`✍️ Writing to path: ${activeTabId}`);
    updateActiveFileContent(activeTabId, newValue);

    if (isAutoSaveEnabled) {
      if ((window as any).__reloadTimeout) clearTimeout((window as any).__reloadTimeout);
      (window as any).__reloadTimeout = setTimeout(() => {
        reloadPreview();
      }, 500);
    }
  };

  const handleCloseTab = (tabIdToClose: string) => {
    const remainingTabs = openTabs.filter(t => t.id !== tabIdToClose);
    setOpenTabs(remainingTabs);

    if (activeTabId === tabIdToClose) {
      if (remainingTabs.length > 0) {
        setActiveTabId(remainingTabs[remainingTabs.length - 1].id);
      } else {
        setActiveTabId(null);
      }
    }
  };

  const handleSaveActiveFile = async () => {
    if (!activeTabId || !templateData) return;
    await saveTemplateData(templateData);
    setOpenTabs(prev =>
      prev.map(tab => (tab.id === activeTabId ? { ...tab, hasUnsavedChanges: false } : tab))
    );
    reloadPreview();
  };

  const handleSaveAllFiles = async () => {
    if (!templateData) return;
    await saveTemplateData(templateData);
    setOpenTabs(prev => prev.map(tab => ({ ...tab, hasUnsavedChanges: false })));
    reloadPreview();
  };

  const openModalContext = (
    type: ModalContextState['type'],
    isFolder: boolean,
    targetPath: string,
    currentName?: string
  ) => {
    setModal({ isOpen: true, type, isFolder, targetPath, initialValue: currentName });
  };

  const handleModalConfirm = async (value: string) => {
    const cleanValue = value.trim();
    if (modal.type === 'createFile') {
      const parts = cleanValue.split('.');
      await addNewFile(modal.targetPath, parts[0], parts.slice(1).join('.') || 'ts');
    } else if (modal.type === 'createFolder') {
      await addNewFolder(modal.targetPath, cleanValue);
    } else if (modal.type === 'rename') {
      const parts = cleanValue.split('.');
      await renameNodeItem(modal.targetPath, modal.isFolder, parts[0], parts.slice(1).join('.'));
      setOpenTabs([]);
      setActiveTabId(null);
    } else if (modal.type === 'delete') {
      await deleteNodeItem(modal.targetPath, modal.isFolder);
      setOpenTabs([]);
      setActiveTabId(null);
    }
  };

  const handleToggleAutoSave = async () => {
    setIsAutoSaveEnabled(prev => {
      const nextState = !prev;
      localStorage.setItem(`playground:autosave-config:${id}`, String(nextState));
      return nextState;
    });
  };

  useEffect(() => {
    if (!isAutoSaveEnabled || !templateData) return;
    const hasUnsavedStuff = openTabs.some(tab => tab.hasUnsavedChanges);
    if (!hasUnsavedStuff) return;

    const autoSaveTimer = setTimeout(async () => {
      try {
        await saveTemplateData(templateData);
        setOpenTabs(prev => prev.map(tab => ({ ...tab, hasUnsavedChanges: false })));
        reloadPreview();
      } catch (error) {
        console.error(error);
      }
    }, 2000);
    return () => clearTimeout(autoSaveTimer);
  }, [openTabs, templateData, saveTemplateData, isAutoSaveEnabled, reloadPreview]);

  if (isLoading || isRehydratingTabs) {
    return (
      <div className="fixed inset-0 flex flex-col gap-3.5 items-center justify-center bg-white dark:bg-neutral-950 text-neutral-500 dark:text-neutral-400 z-50 select-none animate-in fade-in duration-200">
        <div className="relative flex items-center justify-center">
          <div className="absolute h-10 w-10 rounded-full border border-sky-500/10 dark:border-sky-400/10 scale-125 animate-pulse" />
          <Loader2 className="h-5 w-5 animate-spin text-neutral-400 dark:text-neutral-500 relative z-10" />
        </div>
        <span className="font-mono tracking-widest text-[10px] uppercase text-neutral-400 dark:text-neutral-500 font-extrabold select-none">
          Assembling workspace node...
        </span>
      </div>
    );
  }

  const pseudoSelectedFile = activeTabId ? openTabs.find(t => t.id === activeTabId) : null;

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-white dark:bg-neutral-950 overflow-hidden text-neutral-900 dark:text-neutral-100">
        {/* File Tree - with collapse support */}
        <div
          className={`transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-0 overflow-hidden' : 'w-auto'}`}
        >
          <TemplateFileTree
            data={templateData}
            selectedFile={
              pseudoSelectedFile
                ? {
                    filename: pseudoSelectedFile.filename,
                    fileExtension: pseudoSelectedFile.fileExtension,
                    content: '',
                  }
                : null
            }
            onFileSelect={handleFileSelect}
            onAddFile={(path, name, ext) =>
              openModalContext('createFile', false, path, name && ext ? `${name}.${ext}` : '')
            }
            onAddFolder={(path, name) => openModalContext('createFolder', true, path, name)}
            onRename={(path, isFolder, name) => openModalContext('rename', isFolder, path, name)}
            onDelete={(path, isFolder) => openModalContext('delete', isFolder, path)}
          />
        </div>

        <SidebarInset className="flex flex-col flex-1 bg-white dark:bg-neutral-950 overflow-hidden min-w-0">
          <PlaygroundHeader
            id={id}
            playgroundData={playgroundData}
            openTabs={openTabs}
            activeTabId={activeTabId}
            onSaveActiveFile={handleSaveActiveFile}
            onSaveAllFiles={handleSaveAllFiles}
            isAutoSaveEnabled={isAutoSaveEnabled}
            onToggleAutoSave={handleToggleAutoSave}
            isTerminalOpen={isTerminalOpen}
            setIsTerminalOpen={setIsTerminalOpen}
            onReloadPreview={reloadPreview}
            onKillServer={handleKillServer}
            onStartServer={handleStartServer}
            isServerRunning={isServerRunning}
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleSidebar={handleToggleSidebar}
            isAIOpen={isAIPanelOpen}
            isAIProcessing={ai.state.isProcessing}
            onAIFeatureSelect={handleAIFeatureSelect}
            onAIToggle={handleAIToggle}
            aiRateLimitRemaining={ai.state.rateLimit?.remaining}
          />

          <main className="flex-1 flex flex-col min-h-0 bg-white dark:bg-[#151515] overflow-hidden">
            <div className="flex-1 flex min-h-0 relative split-pane-row">
              {/* Editor */}
              <div className="flex-1 min-w-0 h-full relative border-r border-neutral-200 dark:border-neutral-800/70">
                <CodeEditorWorkspace
                  openTabs={openTabs}
                  activeTabId={activeTabId}
                  onSelectTab={tabId => setActiveTabId(tabId)}
                  onCloseTab={handleCloseTab}
                  onCodeChange={handleCodeChange}
                />
              </div>

              {/* Preview + AI Panel */}
              <div className="w-[420px] lg:w-[480px] shrink-0 h-full flex">
                {/* Preview (hidden when AI panel is open) */}
                {!isAIPanelOpen && (
                  <div className="flex-1 bg-neutral-50 dark:bg-neutral-950 flex flex-col">
                    <div className="h-9 px-3 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800/60 bg-neutral-100/60 dark:bg-neutral-900/40">
                      <div className="flex items-center gap-2 text-neutral-400 dark:text-neutral-500 text-xs font-medium">
                        <Monitor size={13} />
                        <span>Preview</span>
                        <span className="text-neutral-300 dark:text-neutral-600">·</span>
                        <span className="font-mono truncate max-w-[120px] text-[10px]">
                          {previewUrl ? new URL(previewUrl).host : 'localhost:3000'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={reloadPreview}
                          className="p-1 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
                          title="Refresh preview"
                        >
                          <RefreshCw size={14} />
                        </button>
                        <button
                          onClick={isServerRunning ? handleKillServer : handleStartServer}
                          className={`p-1 rounded-md transition-colors ${
                            isServerRunning
                              ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
                              : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10'
                          }`}
                          title={isServerRunning ? 'Stop dev server' : 'Start dev server'}
                        >
                          {isServerRunning ? <Square size={14} /> : <Play size={14} />}
                        </button>
                        <div
                          className={`flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full ${
                            previewUrl && isServerRunning
                              ? 'text-emerald-500 bg-emerald-500/10'
                              : 'text-amber-500 bg-amber-500/10 animate-pulse'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${previewUrl && isServerRunning ? 'bg-emerald-500' : 'bg-amber-500'}`}
                          />
                          <span>{previewUrl && isServerRunning ? 'Live' : 'Starting...'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 bg-white relative">
                      {previewUrl && isServerRunning ? (
                        <iframe
                          ref={iframeRef}
                          key={iframeKey}
                          src={`${previewUrl}?t=${Date.now()}`}
                          className="w-full h-full border-0 absolute inset-0 bg-white"
                          title="Preview"
                          sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-same-origin allow-scripts"
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-50/20 dark:bg-neutral-900/10 gap-3">
                          <div className="text-neutral-400">
                            <Monitor size={32} className="opacity-40" />
                          </div>
                          <span className="text-sm font-medium text-neutral-500">
                            Server is stopped
                          </span>
                          <button
                            onClick={handleStartServer}
                            className="px-4 py-1.5 rounded-md bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium transition-all flex items-center gap-2"
                          >
                            <Play size={14} />
                            Start Server
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* AI Panel */}
                <AIPanel
                  isOpen={isAIPanelOpen}
                  onClose={() => {
                    setIsAIPanelOpen(false);
                    ai.toggleAI();
                  }}
                  activeFeature={ai.state.activeFeature}
                  isProcessing={ai.state.isProcessing}
                  messages={ai.state.messages}
                  suggestion={ai.state.suggestion}
                  summary={ai.state.summary}
                  explanation={ai.state.explanation}
                  optimizedCode={ai.state.optimizedCode}
                  bugs={ai.state.bugs}
                  rateLimit={ai.state.rateLimit}
                  onSendMessage={ai.sendChatMessage}
                  onApplySuggestion={handleApplySuggestion}
                  onApplyOptimization={handleApplyOptimization}
                  onClear={ai.clearState}
                />
              </div>
            </div>

            {/* Terminal */}
            <div className="relative shrink-0 z-30">
              <TerminalDock
                ref={terminalDockRef}
                openTabs={openTabs}
                templateData={templateData}
                activeTabId={activeTabId}
                isOpen={isTerminalOpen}
                activePanel={activeTerminalPanel}
                setIsOpen={setIsTerminalOpen}
                setActivePanel={setActiveTerminalPanel}
                onKillServer={handleKillServer}
                onStartServer={handleStartServer}
                isServerRunning={isServerRunning}
              />
            </div>
          </main>

          {/* Status Bar */}
          <PlaygroundStatusBar
            isAutoSaveEnabled={isAutoSaveEnabled}
            port={previewUrl ? new URL(previewUrl).port : '3000'}
            framework={playgroundData?.framework || 'Next.js'}
            isServerRunning={isServerRunning}
          />
        </SidebarInset>
      </div>

      <FileSystemModal
        modal={modal}
        onClose={() => setModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleModalConfirm}
      />
      <CommandPalette
        openTabs={openTabs}
        activeTabId={activeTabId}
        onSelectTab={tabId => setActiveTabId(tabId)}
        onSaveActiveFile={handleSaveActiveFile}
        onSaveAllFiles={handleSaveAllFiles}
      />
      <FileSearchPalette templateData={templateData} onFileSelect={handleFileSelect} />
    </SidebarProvider>
  );
};

export default PlaygroundPage;
