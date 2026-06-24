'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { usePlayground } from '@/features/playground/hooks/usePlayground';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import TemplateFileTree from '@/features/playground/components/template-file-tree';
import { PlaygroundHeader } from '@/features/playground/components/playground-header';
import { CodeEditorWorkspace } from '@/features/playground/components/code-editor-workspace';
import { FileSystemModal } from '@/features/playground/components/file-system-modal';
import { TemplateFile, ModalContextState, OpenedTab } from '@/features/playground/types';
import { Loader2 } from 'lucide-react';
import { CommandPalette } from '@/features/playground/components/command-palette';
import { FileSearchPalette } from '@/features/playground/components/file-search-palette';

const PlaygroundPage = () => {
  const { id } = useParams<{ id: string }>();
  const {
    playgroundData,
    templateData,
    isLoading,
    saveTemplateData,
    addNewFile,
    addNewFolder,
    renameNodeItem,
    deleteNodeItem,
    updateActiveFileContent,
  } = usePlayground(id);

  const [openTabs, setOpenTabs] = useState<OpenedTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [isRehydratingTabs, setIsRehydratingTabs] = useState(true);
  const [isAutoSaveEnabled, setIsAutoSaveEnabled] = useState(false);

  const [modal, setModal] = useState<ModalContextState>({
    isOpen: false,
    type: 'createFile',
    isFolder: false,
    targetPath: '',
  });

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

  const handleFileSelect = (file: TemplateFile) => {
    const tabId = `${file.filename}.${file.fileExtension}`;
    const tabExists = openTabs.some(t => t.id === tabId);

    if (!tabExists) {
      const newTab: OpenedTab = {
        id: tabId,
        filename: file.filename,
        fileExtension: file.fileExtension,
        content: file.content,
        hasUnsavedChanges: false,
      };
      setOpenTabs(prev => [...prev, newTab]);
    }
    setActiveTabId(tabId);
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

  const handleCodeChange = (newValue: string | undefined) => {
    if (!activeTabId || newValue === undefined) return;

    setOpenTabs(prev =>
      prev.map(tab =>
        tab.id === activeTabId ? { ...tab, content: newValue, hasUnsavedChanges: true } : tab
      )
    );
    updateActiveFileContent(activeTabId, newValue);
  };

  const handleSaveActiveFile = async () => {
    if (!activeTabId || !templateData) return;
    await saveTemplateData(templateData);
    setOpenTabs(prev =>
      prev.map(tab => (tab.id === activeTabId ? { ...tab, hasUnsavedChanges: false } : tab))
    );
  };

  const handleSaveAllFiles = async () => {
    if (!templateData) return;
    await saveTemplateData(templateData);
    setOpenTabs(prev => prev.map(tab => ({ ...tab, hasUnsavedChanges: false })));
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
        console.log(`Background auto save stream execution success.`);
      } catch (error) {
        console.error('Background auto-save operation rejected:', error);
      }
    }, 2000);
    return () => clearTimeout(autoSaveTimer);
  }, [openTabs, templateData, saveTemplateData, isAutoSaveEnabled]);

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
          />

          <main className="flex-1 flex flex-col min-h-0 bg-white dark:bg-[#151515] overflow-hidden">
            <CodeEditorWorkspace
              openTabs={openTabs}
              activeTabId={activeTabId}
              onSelectTab={tabId => setActiveTabId(tabId)}
              onCloseTab={handleCloseTab}
              onCodeChange={handleCodeChange}
            />
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
