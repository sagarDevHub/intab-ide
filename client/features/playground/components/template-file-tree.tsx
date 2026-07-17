// 'use client';

// import React from 'react';
// import { Plus, FilePlus, FolderPlus } from 'lucide-react';
// import TemplateNode from './template-node';
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarMenu,
// } from '@/components/ui/sidebar';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';
// import { TemplateFile, TemplateFolder } from '../types';

// interface TemplateFileTreeProps {
//   data: TemplateFolder | null;
//   onFileSelect?: (file: TemplateFile, fullFilePath: string) => void; // ✅ Updated
//   selectedFile?: (TemplateFile & { fullPath?: string }) | null;
//   title?: string;
//   onAddFile?: (parentPath: string, name: string, ext: string) => void;
//   onAddFolder?: (parentPath: string, name: string) => void;
//   onRename?: (targetPath: string, isFolder: boolean, currentName: string) => void;
//   onDelete?: (targetPath: string, isFolder: boolean) => void;
// }

// const TemplateFileTree = ({
//   data,
//   onFileSelect,
//   selectedFile,
//   title = 'File Explorer',
//   onAddFile,
//   onAddFolder,
//   onRename,
//   onDelete,
// }: TemplateFileTreeProps) => {
//   return (
//     <Sidebar className="border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-700 dark:text-neutral-200 w-64 shrink-0">
//       <SidebarContent className="p-2">
//         <SidebarGroup>
//           <div className="flex items-center justify-between px-2 mb-4 mt-2">
//             <span className="text-xs font-bold tracking-wider uppercase text-neutral-400 dark:text-neutral-500">
//               {title}
//             </span>

//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <button className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors">
//                   <Plus className="h-4 w-4" />
//                 </button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent
//                 align="end"
//                 className="w-40 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-xl p-1 shadow-xl"
//               >
//                 <DropdownMenuItem
//                   onClick={() => onAddFile?.('Root', '', '')}
//                   className="focus:bg-neutral-100 dark:focus:bg-neutral-800 focus:text-neutral-900 dark:focus:text-neutral-50 cursor-pointer text-xs gap-2 rounded-lg"
//                 >
//                   <FilePlus className="h-4 w-4 text-neutral-400" /> New File
//                 </DropdownMenuItem>
//                 <DropdownMenuItem
//                   onClick={() => onAddFolder?.('Root', '')}
//                   className="focus:bg-neutral-100 dark:focus:bg-neutral-800 focus:text-neutral-900 dark:focus:text-neutral-50 cursor-pointer text-xs gap-2 rounded-lg"
//                 >
//                   <FolderPlus className="h-4 w-4 text-neutral-400" /> New Folder
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </div>

//           <SidebarGroupContent>
//             <SidebarMenu className="flex flex-col gap-0.5 max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar">
//               {data && data.items && data.items.length > 0 ? (
//                 data.items.map((childNode, index) => (
//                   <TemplateNode
//                     key={index}
//                     item={childNode}
//                     level={0}
//                     currentPath="Root"
//                     selectedFile={selectedFile}
//                     onFileSelect={onFileSelect}
//                     onAddFile={onAddFile}
//                     onAddFolder={onAddFolder}
//                     onRename={onRename}
//                     onDelete={onDelete}
//                   />
//                 ))
//               ) : (
//                 <div className="text-xs text-neutral-400 dark:text-neutral-600 px-2 italic mt-2">
//                   Empty workspace
//                 </div>
//               )}
//             </SidebarMenu>
//           </SidebarGroupContent>
//         </SidebarGroup>
//       </SidebarContent>
//     </Sidebar>
//   );
// };

// export default TemplateFileTree;

'use client';

import React from 'react';
import { Plus, FilePlus, FolderPlus, Folder } from 'lucide-react';
import TemplateNode from './template-node';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TemplateFile, TemplateFolder } from '../types';

interface TemplateFileTreeProps {
  data: TemplateFolder | null;
  onFileSelect?: (file: TemplateFile, fullFilePath: string) => void;
  selectedFile?: (TemplateFile & { fullPath?: string }) | null;
  title?: string;
  onAddFile?: (parentPath: string, name: string, ext: string) => void;
  onAddFolder?: (parentPath: string, name: string) => void;
  onRename?: (targetPath: string, isFolder: boolean, currentName: string) => void;
  onDelete?: (targetPath: string, isFolder: boolean) => void;
}

const TemplateFileTree = ({
  data,
  onFileSelect,
  selectedFile,
  title = 'Explorer',
  onAddFile,
  onAddFolder,
  onRename,
  onDelete,
}: TemplateFileTreeProps) => {
  return (
    <Sidebar className="border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-700 dark:text-neutral-200 w-56 shrink-0">
      <SidebarContent className="p-2">
        <SidebarGroup>
          <div className="flex items-center justify-between px-2 mb-3 mt-1">
            <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-400 dark:text-neutral-500">
              {title}
            </span>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors">
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-40 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg p-1 shadow-lg"
              >
                <DropdownMenuItem
                  onClick={() => onAddFile?.('Root', '', '')}
                  className="focus:bg-neutral-100 dark:focus:bg-neutral-800 cursor-pointer text-xs gap-2 rounded-md py-1.5"
                >
                  <FilePlus className="h-3.5 w-3.5 text-neutral-400" /> New File
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onAddFolder?.('Root', '')}
                  className="focus:bg-neutral-100 dark:focus:bg-neutral-800 cursor-pointer text-xs gap-2 rounded-md py-1.5"
                >
                  <FolderPlus className="h-3.5 w-3.5 text-neutral-400" /> New Folder
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <SidebarGroupContent>
            <SidebarMenu className="flex flex-col gap-0.5 max-h-[calc(100vh-120px)] overflow-y-auto">
              {data && data.items && data.items.length > 0 ? (
                data.items.map((childNode, index) => (
                  <TemplateNode
                    key={index}
                    item={childNode}
                    level={0}
                    currentPath="Root"
                    selectedFile={selectedFile}
                    onFileSelect={onFileSelect}
                    onAddFile={onAddFile}
                    onAddFolder={onAddFolder}
                    onRename={onRename}
                    onDelete={onDelete}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center py-8 text-neutral-500 dark:text-neutral-600">
                  <Folder size={24} className="mb-2 opacity-40" />
                  <span className="text-xs">Empty workspace</span>
                  <span className="text-[10px] mt-0.5 opacity-60">Click + to add files</span>
                </div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default TemplateFileTree;
