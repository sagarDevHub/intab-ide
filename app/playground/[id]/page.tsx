'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePlayground } from '@/features/playground/hooks/usePlayground';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import TemplateFileTree from '@/features/playground/components/template-file-tree';
import { TemplateFile } from '@/features/playground/types';
import {
  Save,
  RefreshCw,
  AlertCircle,
  ArrowLeft,
  FilePlus,
  FolderPlus,
  Edit3,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface ModalContextState {
  isOpen: boolean;
  type: 'createFile' | 'createFolder' | 'rename' | 'delete';
  isFolder: boolean;
  targetPath: string;
  initialValue?: string;
}

const PlaygroundPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const {
    playgroundData,
    templateData,
    isLoading,
    error,
    loadPlayground,
    saveTemplateData,
    addNewFile,
    addNewFolder,
    renameNodeItem,
    deleteNodeItem,
  } = usePlayground(id);

  const [selectedFile, setSelectedFile] = useState<TemplateFile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>('');

  const [modal, setModal] = useState<ModalContextState>({
    isOpen: false,
    type: 'createFile',
    isFolder: false,
    targetPath: '',
  });

  useEffect(() => {
    if (templateData?.items && templateData.items.length > 0 && !selectedFile) {
      const firstItem = templateData.items[0];
      if (firstItem && !('folderName' in firstItem)) {
        setSelectedFile(firstItem as TemplateFile);
      }
    }
  }, [templateData, selectedFile]);

  const openModalContext = (
    type: ModalContextState['type'],
    isFolder: boolean,
    targetPath: string,
    currentName?: string
  ) => {
    setInputValue(currentName || '');
    setModal({ isOpen: true, type, isFolder, targetPath, initialValue: currentName });
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() && modal.type !== 'delete') return;

    setIsSubmitting(true);
    try {
      if (modal.type === 'createFile') {
        const parts = inputValue.trim().split('.');
        const name = parts[0];
        const ext = parts.slice(1).join('.') || 'ts';
        await addNewFile(modal.targetPath, name, ext);
      } else if (modal.type === 'createFolder') {
        await addNewFolder(modal.targetPath, inputValue.trim());
      } else if (modal.type === 'rename') {
        if (modal.isFolder) {
          await renameNodeItem(modal.targetPath, true, inputValue.trim());
        } else {
          const parts = inputValue.trim().split('.');
          await renameNodeItem(modal.targetPath, false, parts[0], parts.slice(1).join('.'));
        }
        setSelectedFile(null);
      } else if (modal.type === 'delete') {
        await deleteNodeItem(modal.targetPath, modal.isFolder);
        setSelectedFile(null);
      }
      setModal(prev => ({ ...prev, isOpen: false }));
    } catch (err) {
      console.error('VFS UI operation failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col gap-3 items-center justify-center bg-white dark:bg-neutral-950 text-neutral-500 dark:text-neutral-400 text-sm">
        <RefreshCw className="h-5 w-5 animate-spin text-sky-500" />
        <span className="font-mono tracking-wider text-xs text-neutral-400 dark:text-neutral-500">
          Syncing sandbox dependencies...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-white dark:bg-neutral-950 text-center p-4">
        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 mb-4">
          <AlertCircle size={20} />
        </div>
        <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
          Workspace Hub Connection Drop
        </h3>
        <p className="text-xs text-neutral-500 mt-1 mb-4 max-w-xs">{error}</p>
        <Button
          variant="outline"
          onClick={loadPlayground}
          className="h-8 text-xs border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-xl"
        >
          Retry Initialization Sync
        </Button>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-white dark:bg-neutral-950 overflow-hidden text-neutral-900 dark:text-neutral-100">
        <TemplateFileTree
          data={templateData}
          selectedFile={selectedFile}
          onFileSelect={file => setSelectedFile(file)}
          onAddFile={(path, name, ext) =>
            openModalContext('createFile', false, path, name && ext ? `${name}.${ext}` : '')
          }
          onAddFolder={(path, name) => openModalContext('createFolder', true, path, name)}
          onRename={(path, isFolder, name) => openModalContext('rename', isFolder, path, name)}
          onDelete={(path, isFolder) => openModalContext('delete', isFolder, path)}
        />

        <SidebarInset className="flex flex-col flex-1 bg-neutral-50/50 dark:bg-neutral-900 overflow-hidden border-l border-neutral-200 dark:border-neutral-800">
          <header className="flex h-14 shrink-0 items-center justify-between border-b border-neutral-200 dark:border-neutral-800 px-4 bg-white dark:bg-neutral-950">
            <div className="flex items-center gap-2">
              {/* ✅ MODERN BACK TO DASHBOARD TRIGGER CONTAINER BUTTON */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="h-8 rounded-xl px-2.5 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200 gap-1.5 transition-all text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <ArrowLeft size={14} />
                <span>Dashboard</span>
              </Button>

              <Separator
                orientation="vertical"
                className="h-4 bg-neutral-200 dark:bg-neutral-800"
              />
              <SidebarTrigger className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200" />
              <Separator
                orientation="vertical"
                className="h-4 bg-neutral-200 dark:bg-neutral-800"
              />

              <span className="text-sm font-bold tracking-wide text-neutral-700 dark:text-neutral-300">
                {playgroundData?.title || 'Code playground'}
              </span>
            </div>

            <Button
              size="sm"
              onClick={() => templateData && saveTemplateData(templateData)}
              className="h-8 rounded-xl text-xs font-semibold bg-sky-600 text-white hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-400 transition-all gap-1.5"
            >
              <Save size={13} />
              <span>Save Changes</span>
            </Button>
          </header>

          <main className="flex-1 flex flex-col min-h-0 bg-neutral-100/30 dark:bg-[#0c0c0c] overflow-hidden">
            {selectedFile ? (
              <div className="flex flex-col h-full w-full min-h-0">
                <div className="h-9 px-4 flex items-center border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950/40 shrink-0">
                  <span className="text-xs font-mono font-bold text-neutral-500 dark:text-neutral-400">
                    {selectedFile.filename}.{selectedFile.fileExtension}
                  </span>
                </div>
                <div className="flex-1 p-4 overflow-auto font-mono text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed bg-white/50 dark:bg-[#0f0f0f]/40 custom-scrollbar">
                  <pre className="whitespace-pre-wrap">
                    {selectedFile.content || '// Empty workspace source document node'}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-neutral-400 dark:text-neutral-500">
                <p className="text-xs italic font-medium">
                  Select a filesystem document node from the sidebar map to view code content
                  streams.
                </p>
              </div>
            )}
          </main>
        </SidebarInset>
      </div>

      {/* Modern Overlay Modals Framework */}
      <Dialog
        open={modal.isOpen}
        onOpenChange={open => !open && setModal(prev => ({ ...prev, isOpen: false }))}
      >
        <DialogContent className="max-w-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-200 rounded-2xl shadow-2xl p-5 backdrop-blur-md">
          <form onSubmit={handleModalSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold flex items-center gap-2 text-neutral-800 dark:text-neutral-100">
                {modal.type === 'createFile' && <FilePlus size={16} className="text-sky-500" />}
                {modal.type === 'createFolder' && (
                  <FolderPlus size={16} className="text-emerald-500" />
                )}
                {modal.type === 'rename' && <Edit3 size={16} className="text-amber-500" />}
                {modal.type === 'delete' && <Trash2 size={16} className="text-red-500" />}
                <span>
                  {modal.type === 'createFile' && 'Create New File'}
                  {modal.type === 'createFolder' && 'Create New Folder'}
                  {modal.type === 'rename' && `Rename ${modal.isFolder ? 'Folder' : 'File'}`}
                  {modal.type === 'delete' && 'Confirm Structural Deletion'}
                </span>
              </DialogTitle>
              <DialogDescription className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                {modal.type === 'delete'
                  ? 'Warning: This action instantly purges this asset out of your storage cluster. This cannot be undone.'
                  : `Specify structural configuration parameters inside path: "${modal.targetPath}"`}
              </DialogDescription>
            </DialogHeader>

            {modal.type !== 'delete' && (
              <div className="space-y-1.5">
                <Label
                  htmlFor="modalInput"
                  className="text-[10px] uppercase font-bold text-neutral-400 dark:text-neutral-500 tracking-wider"
                >
                  Target Identity Designation Title
                </Label>
                <Input
                  id="modalInput"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  placeholder={modal.type === 'createFile' ? 'index.tsx' : 'components'}
                  autoFocus
                  className="h-10 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-xl focus-visible:ring-1 focus-visible:ring-sky-500 focus-visible:ring-offset-0 text-sm font-medium"
                />
              </div>
            )}

            <DialogFooter className="pt-2 flex items-center gap-2 justify-end">
              <Button
                type="button"
                variant="ghost"
                disabled={isSubmitting}
                onClick={() => setModal(prev => ({ ...prev, isOpen: false }))}
                className="h-9 px-4 rounded-xl text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || (modal.type !== 'delete' && !inputValue.trim())}
                className={cn(
                  'h-9 px-4 rounded-xl text-xs font-semibold text-white transition-all shadow-md',
                  modal.type === 'delete'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-sky-600 hover:bg-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400'
                )}
              >
                {isSubmitting ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    {modal.type === 'delete' && 'Purge Asset'}
                    {modal.type === 'rename' && 'Apply Changes'}
                    {(modal.type === 'createFile' || modal.type === 'createFolder') &&
                      'Provision Node'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default PlaygroundPage;
