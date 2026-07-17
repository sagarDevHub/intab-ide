'use client';

import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { TemplateFolder, TemplateFile, TemplateItem } from '../types';
import { File, Search } from 'lucide-react';

interface FileSearchPaletteProps {
  templateData: TemplateFolder | null;
  onFileSelect: (file: TemplateFile) => void;
}

export const FileSearchPalette = ({ templateData, onFileSelect }: FileSearchPaletteProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [flatFiles, setFlatFiles] = useState<TemplateFile[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'p' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!templateData) {
      setFlatFiles([]);
      return;
    }

    const files: TemplateFile[] = [];
    const traverse = (item: TemplateItem) => {
      if ('folderName' in item && 'items' in item) {
        item.items.forEach(traverse);
      } else {
        files.push(item as TemplateFile);
      }
    };

    templateData.items.forEach(traverse);
    setFlatFiles(files);
  }, [templateData, isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-neutral-950/40 dark:bg-neutral-950/60 backdrop-blur-xs z-50 flex items-start justify-center pt-[15vh] p-4 animate-in fade-in duration-150"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="w-full max-w-(--size-md) bg-[#0D1117] border border-neutral-800 text-neutral-100 rounded-xl shadow-2xl overflow-hidden gap-0"
        onClick={e => e.stopPropagation()}
      >
        <Command label="Workspace File Search">
          <div className="flex items-center px-3 border-b border-neutral-800 gap-2.5">
            <Search size={14} className="text-neutral-500 shrink-0" />
            <Command.Input
              autoFocus
              placeholder="Search files by name... (e.g. page.tsx)"
              className="w-full h-11 bg-transparent border-none outline-hidden text-xs text-neutral-100 placeholder-neutral-500 font-mono"
            />
          </div>

          <Command.List className="max-h-65 overflow-y-auto p-2 space-y-0.5 scrollbar-none">
            <Command.Empty className="text-[11px] font-mono text-neutral-500 py-4 text-center">
              No files found matching your search parameter.
            </Command.Empty>

            <Command.Group
              heading="Files in project"
              className="text-[10px] uppercase tracking-wider font-bold text-neutral-500 px-2 py-1.5"
            >
              {flatFiles.map((file, idx) => {
                const fullName = `${file.filename}.${file.fileExtension}`;
                return (
                  <Command.Item
                    key={`${fullName}-${idx}`}
                    onSelect={() => {
                      onFileSelect(file);
                      setIsOpen(false);
                    }}
                    className="flex items-center justify-between px-2.5 py-2 text-xs font-mono rounded-lg text-neutral-400 hover:bg-neutral-800/60 data-[selected=true]:bg-neutral-800 data-[selected=true]:text-neutral-100 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <File size={13} className="text-neutral-500 shrink-0" />
                      <span className="truncate">{fullName}</span>
                    </div>
                    <span className="text-[10px] opacity-40 uppercase tracking-tight font-sans">
                      Open File
                    </span>
                  </Command.Item>
                );
              })}
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
};
