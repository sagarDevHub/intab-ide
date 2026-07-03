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
import { Loader2, Monitor, RefreshCw, Square } from 'lucide-react';
import { CommandPalette } from '@/features/playground/components/command-palette';
import { FileSearchPalette } from '@/features/playground/components/file-search-palette';
import { TerminalDock, TerminalDockRef } from '@/features/playground/components/terminal-dock';

const PlaygroundPage = () => {
  const { id } = useParams<{ id: string }>();
  const terminalDockRef = useRef<TerminalDockRef>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeKey, setIframeKey] = useState(0);

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
  } = usePlayground(id, handleTerminalStreamWrite);

  const [openTabs, setOpenTabs] = useState<OpenedTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [isRehydratingTabs, setIsRehydratingTabs] = useState(true);
  const [isAutoSaveEnabled, setIsAutoSaveEnabled] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);
  const [activeTerminalPanel, setActiveTerminalPanel] = useState<'console' | 'problems' | 'ai'>(
    'console'
  );

  const [modal, setModal] = useState<ModalContextState>({
    isOpen: false,
    type: 'createFile',
    isFolder: false,
    targetPath: '',
  });

  // Hard reload of the iframe
  const reloadPreview = useCallback(() => {
    setIframeKey(prev => prev + 1);
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.location.reload(true);
    }
  }, []);

  const handleKillServer = useCallback(async () => {
    await killDevServer();
    reloadPreview();
  }, [killDevServer, reloadPreview]);

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
      // Ctrl+Shift+S to kill server
      if (e.key === 'S' && (e.metaKey || e.ctrlKey) && e.shiftKey) {
        e.preventDefault();
        handleKillServer();
      }
    };
    window.addEventListener('keydown', handleToggleShortcut);
    return () => window.removeEventListener('keydown', handleToggleShortcut);
  }, [handleKillServer]);

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
          />

          <main className="flex-1 flex flex-col min-h-0 bg-white dark:bg-[#151515] overflow-hidden">
            <div className="flex-1 flex min-h-0 relative split-pane-row">
              <div className="flex-1 min-w-0 h-full relative border-r border-neutral-200 dark:border-neutral-800/70">
                <CodeEditorWorkspace
                  openTabs={openTabs}
                  activeTabId={activeTabId}
                  onSelectTab={tabId => setActiveTabId(tabId)}
                  onCloseTab={handleCloseTab}
                  onCodeChange={handleCodeChange}
                />
              </div>

              <div className="w-[420px] lg:w-[480px] shrink-0 h-full bg-neutral-50 dark:bg-neutral-950 flex flex-col select-none">
                <div className="h-9 border-b border-neutral-200 dark:border-neutral-800/60 bg-neutral-100/60 dark:bg-neutral-900/40 px-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-neutral-400 dark:text-neutral-500 text-xs font-semibold">
                    <Monitor size={13} className="text-neutral-400" />
                    <span>App Browser Preview</span>
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
                      onClick={handleKillServer}
                      className="p-1 rounded-md hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors"
                      title="Stop dev server"
                    >
                      <Square size={14} />
                    </button>
                    <div
                      className={`flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-md ${
                        previewUrl
                          ? 'text-emerald-500 bg-emerald-500/10'
                          : 'text-amber-500 bg-amber-500/10 animate-pulse'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${previewUrl ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      />
                      <span>{previewUrl ? 'Live Reload Active' : 'Starting Server...'}</span>
                    </div>
                  </div>
                </div>

                <div className="p-2 border-b border-neutral-200 dark:border-neutral-800/40 bg-neutral-50/50 dark:bg-neutral-950/40 flex items-center">
                  <div className="w-full h-6 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-2.5 flex items-center font-mono text-[11px] text-neutral-400 truncate">
                    <span>{previewUrl || 'http://localhost:3000/'}</span>
                  </div>
                </div>

                <div className="flex-1 bg-white relative">
                  {previewUrl ? (
                    <iframe
                      ref={iframeRef}
                      key={iframeKey}
                      src={`${previewUrl}?t=${Date.now()}`}
                      className="w-full h-full border-0 absolute inset-0 bg-white"
                      title="Sandbox Execution Port Viewport"
                      sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-same-origin allow-scripts"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-50/20 dark:bg-neutral-900/10 gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
                      <span className="text-[11px] font-medium text-neutral-400 tracking-tight">
                        Awaiting microcontainer deployment...
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

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
              />
            </div>
          </main>
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
