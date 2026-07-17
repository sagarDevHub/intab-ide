'use client';

import React, { useEffect, useState } from 'react';
import { FilePlus, FolderPlus, Edit3, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ModalContextState } from '../types';

interface FileSystemModalProps {
  modal: ModalContextState;
  onClose: () => void;
  onConfirm: (inputValue: string) => Promise<void>;
}

export const FileSystemModal = ({ modal, onClose, onConfirm }: FileSystemModalProps) => {
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (modal.isOpen) {
      setInputValue(modal.initialValue || '');
      setIsSubmitting(false);
    }
  }, [modal.isOpen, modal.initialValue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() && modal.type !== 'delete') return;

    setIsSubmitting(true);
    try {
      await onConfirm(inputValue);
      onClose();
    } catch (err) {
      console.error('Operation rejected:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={modal.isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-90 bg-white dark:bg-neutral-950 border border-neutral-200/80 dark:border-neutral-800/60 text-neutral-900 dark:text-neutral-200 rounded-2xl shadow-2xl p-5 gap-0 overflow-hidden">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="text-xs uppercase font-bold flex items-center gap-2 text-neutral-400 dark:text-neutral-500 tracking-wider">
              {modal.type === 'createFile' && <FilePlus size={14} className="text-sky-500" />}
              {modal.type === 'createFolder' && (
                <FolderPlus size={14} className="text-emerald-500" />
              )}
              {modal.type === 'rename' && <Edit3 size={14} className="text-amber-500" />}
              {modal.type === 'delete' && <Trash2 size={14} className="text-red-500" />}
              <span>
                {modal.type === 'createFile' && 'Provision File node'}
                {modal.type === 'createFolder' && 'Provision Folder node'}
                {modal.type === 'rename' && `Rename Workspace Asset`}
                {modal.type === 'delete' && 'Confirm Structural Purge'}
              </span>
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 font-medium leading-relaxed">
              {modal.type === 'delete'
                ? 'Warning: This action instantly purges this asset out of your VFS tree data layer. This execution cannot be reverted.'
                : `Target path context branch: /${modal.targetPath}`}
            </DialogDescription>
          </DialogHeader>

          {modal.type !== 'delete' && (
            <div className="space-y-1.5">
              <Label
                htmlFor="modalInput"
                className="text-[10px] uppercase font-bold text-neutral-400 dark:text-neutral-500 tracking-wider"
              >
                Name Designation Title
              </Label>
              <Input
                id="modalInput"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder={modal.type === 'createFile' ? 'index.tsx' : 'components'}
                autoFocus
                className="h-9 bg-neutral-50/50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-100 rounded-xl focus-visible:ring-1 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-700 focus-visible:ring-offset-0 text-xs font-mono font-semibold transition-all"
              />
            </div>
          )}

          <DialogFooter className="pt-2 flex items-center gap-2 justify-end sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              disabled={isSubmitting}
              onClick={onClose}
              className="h-8 px-3 rounded-lg text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || (modal.type !== 'delete' && !inputValue.trim())}
              className={cn(
                'h-8 px-3 rounded-lg text-xs font-medium text-white transition-all shadow-xs',
                modal.type === 'delete'
                  ? 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600'
                  : 'bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-950'
              )}
            >
              {isSubmitting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <>
                  {modal.type === 'delete' && 'Purge Node'}
                  {modal.type === 'rename' && 'Update Name'}
                  {(modal.type === 'createFile' || modal.type === 'createFolder') &&
                    'Provision Asset'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
