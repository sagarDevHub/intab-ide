'use client';

import React, { useState } from 'react';
import {
  ChevronRight,
  File,
  Folder,
  MoreHorizontal,
  FileCode,
  Plus,
  Edit3,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { SidebarMenuItem } from '@/components/ui/sidebar';
import { TemplateFile, TemplateFolder, TemplateItem } from '../types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TemplateNodeProps {
  item: TemplateItem;
  level: number;
  currentPath: string;
  onFileSelect?: (file: TemplateFile) => void;
  selectedFile?: TemplateFile | null;
  onAddFile?: (parentPath: string, name: string, ext: string) => void;
  onAddFolder?: (parentPath: string, name: string) => void;
  onRename?: (targetPath: string, isFolder: boolean, currentName: string) => void;
  onDelete?: (targetPath: string, isFolder: boolean) => void;
}

const getFileIcon = (ext: string) => {
  const normalized = (ext || '').toLowerCase();
  switch (normalized) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
      return <FileCode className="h-4 w-4 text-amber-500 shrink-0" />;
    case 'json':
      return <FileCode className="h-4 w-4 text-sky-500 dark:text-sky-400 shrink-0" />;
    case 'html':
      return <FileCode className="h-4 w-4 text-orange-500 shrink-0" />;
    case 'css':
      return <FileCode className="h-4 w-4 text-teal-500 dark:text-teal-400 shrink-0" />;
    default:
      return <File className="h-4 w-4 text-neutral-400 dark:text-neutral-500 shrink-0" />;
  }
};

const TemplateNode = ({
  item,
  level,
  currentPath,
  onFileSelect,
  selectedFile,
  onAddFile,
  onAddFolder,
  onRename,
  onDelete,
}: TemplateNodeProps) => {
  const isFolder = 'folderName' in item && 'items' in item;
  const [isOpen, setIsOpen] = useState(level < 1);

  const itemPath = isFolder
    ? currentPath === 'Root'
      ? item.folderName
      : `${currentPath}/${item.folderName}`
    : currentPath === 'Root'
      ? `${item.filename}.${item.fileExtension}`
      : `${currentPath}/${item.filename}.${item.fileExtension}`;

  if (!isFolder) {
    const file = item as TemplateFile;
    const fullName = file.fileExtension ? `${file.filename}.${file.fileExtension}` : file.filename;
    const isSelected =
      selectedFile?.filename === file.filename &&
      selectedFile?.fileExtension === file.fileExtension;

    return (
      <SidebarMenuItem style={{ paddingLeft: `${level * 12}px` }}>
        <div
          className={cn(
            'group flex items-center justify-between w-full rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800/40 cursor-pointer text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200',
            isSelected &&
              'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-bold border border-neutral-200 dark:border-neutral-700/50 shadow-xs'
          )}
          onClick={() => onFileSelect?.(file)}
        >
          <div className="flex items-center min-w-0 gap-2">
            {getFileIcon(file.fileExtension)}
            <span className="truncate">{fullName}</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
              <button className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-opacity">
                <MoreHorizontal className="h-3.5 w-3.5 text-neutral-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-40 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-xl p-1 text-xs shadow-xl"
            >
              <DropdownMenuItem
                onClick={() => onRename?.(itemPath, false, fullName)}
                className="rounded-lg gap-2 focus:bg-neutral-100 dark:focus:bg-neutral-800 focus:text-neutral-900 dark:focus:text-neutral-50 cursor-pointer"
              >
                <Edit3 size={14} className="text-neutral-400" /> Rename File
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-neutral-100 dark:bg-neutral-800" />
              <DropdownMenuItem
                onClick={() => onDelete?.(itemPath, false)}
                className="rounded-lg gap-2 text-red-500 focus:text-red-500 focus:bg-red-500/10 cursor-pointer"
              >
                <Trash2 size={14} /> Purge File
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarMenuItem>
    );
  }

  const folder = item as TemplateFolder;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <SidebarMenuItem style={{ paddingLeft: `${level * 12}px` }}>
        <div
          className="group flex items-center justify-between w-full rounded-md px-2 py-1.5 text-sm font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/40 cursor-pointer transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center min-w-0 gap-1.5">
            <ChevronRight
              className={cn(
                'h-4 w-4 shrink-0 text-neutral-400 dark:text-neutral-500 transition-transform duration-200',
                isOpen && 'transform rotate-90'
              )}
            />
            <Folder
              className={cn(
                'h-4 w-4 shrink-0 text-sky-500/80 fill-none',
                isOpen && 'text-sky-500 dark:text-sky-400'
              )}
            />
            <span className="truncate font-semibold">{folder.folderName}</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
              <button className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-opacity">
                <MoreHorizontal className="h-3.5 w-3.5 text-neutral-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-40 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-xl p-1 text-xs shadow-xl"
            >
              <DropdownMenuItem
                onClick={() => onAddFile?.(itemPath, '', '')}
                className="rounded-lg gap-2 focus:bg-neutral-100 dark:focus:bg-neutral-800 focus:text-neutral-900 dark:focus:text-neutral-50 cursor-pointer"
              >
                <Plus size={14} className="text-neutral-400" /> New File
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onAddFolder?.(itemPath, '')}
                className="rounded-lg gap-2 focus:bg-neutral-100 dark:focus:bg-neutral-800 focus:text-neutral-900 dark:focus:text-neutral-50 cursor-pointer"
              >
                <Plus size={14} className="text-neutral-400" /> New Folder
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-neutral-100 dark:bg-neutral-800" />
              <DropdownMenuItem
                onClick={() => onRename?.(itemPath, true, folder.folderName)}
                className="rounded-lg gap-2 focus:bg-neutral-100 dark:focus:bg-neutral-800 focus:text-neutral-900 dark:focus:text-neutral-50 cursor-pointer"
              >
                <Edit3 size={14} className="text-neutral-400" /> Rename Folder
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete?.(itemPath, true)}
                className="rounded-lg gap-2 text-red-500 focus:text-red-500 focus:bg-red-500/10 cursor-pointer"
              >
                <Trash2 size={14} /> Remove Folder
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarMenuItem>

      <CollapsibleContent className="relative data-[state=open]:animate-none">
        {folder.items.length > 0 && (
          <div
            className="absolute left-3 top-0 bottom-2 w-px bg-neutral-200 dark:bg-neutral-800/80"
            style={{ left: `${level * 12 + 16}px` }}
          />
        )}
        <div className="flex flex-col gap-0.5 mt-0.5">
          {folder.items.map((child, idx) => {
            // ✅ FIX: Determine child item path title string dynamically to prevent property undefined crashes
            const childKey =
              'folderName' in child ? child.folderName : `${child.filename}.${child.fileExtension}`;

            return (
              <TemplateNode
                key={`${childKey}-${idx}`}
                item={child}
                level={level + 1}
                currentPath={itemPath}
                onFileSelect={onFileSelect}
                selectedFile={selectedFile}
                onAddFile={onAddFile}
                onAddFolder={onAddFolder}
                onRename={onRename}
                onDelete={onDelete}
              />
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default TemplateNode;
