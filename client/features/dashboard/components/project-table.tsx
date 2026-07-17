'use client';

import Image from 'next/image';
import { format } from 'date-fns';
import type { Project } from '../types';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { useState } from 'react';
import { MoreHorizontal, Edit3, Trash2, ExternalLink, Copy, Download, Eye } from 'lucide-react';
import { notify } from '@/lib/notifications';

interface ProjectTableProps {
  projects: Project[];
  onUpdateProject?: Function;
  onDeleteProject?: Function;
  onDuplicateProject?: Function;
}

interface EditProjectData {
  title: string;
  description: string;
}

const getTemplateBadgeStyle = (template: string) => {
  const normalized = template.toUpperCase();
  switch (normalized) {
    case 'REACT':
      return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20';
    case 'NEXTJS':
      return 'bg-zinc-500/10 text-zinc-800 dark:text-zinc-300 border-zinc-500/20';
    case 'EXPRESS':
      return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20';
    case 'VUE':
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    case 'HONO':
      return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20';
    default:
      return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20';
  }
};

const ProjectTable = ({
  projects,
  onDeleteProject,
  onUpdateProject,
  onDuplicateProject,
}: ProjectTableProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [editData, setEditData] = useState<EditProjectData>({ title: '', description: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleDuplicateProject = async (project: Project) => {
    if (!onDuplicateProject) return;
    try {
      const result = await onDuplicateProject(project.id);
      if (result?.success) {
        notify.success('Container cloned', 'Virtual environment branched successfully.');
      } else {
        notify.error('Cloning failed', result?.error);
      }
    } catch {
      notify.error('Error', 'An unexpected mutation error occurred.');
    }
  };

  const handleEditClick = async (project: Project) => {
    setSelectedProject(project);
    setEditData({ title: project.title, description: project.description || '' });
    setEditDialogOpen(true);
  };

  const copyProjectUrl = async (projectId: string) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(`${window.location.origin}/playground/${projectId}`);
      notify.info('URL Copied', 'Project link pinned to your clipboard.');
    }
  };

  const handleDeleteClick = async (project: Project) => {
    setSelectedProject(project);
    setDeleteDialogOpen(true);
  };

  const handleUpdateProject = async () => {
    if (!selectedProject || !onUpdateProject) return;
    setIsLoading(true);
    try {
      const result = await onUpdateProject(selectedProject.id, editData);
      if (result?.success) {
        notify.success('Workspace saved', `"${editData.title}" details successfully overwritten.`);
        setEditDialogOpen(false);
      } else {
        notify.error('Save failed', result?.error);
      }
    } catch {
      notify.error('Network failure', 'Could not establish connection link.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject || !onDeleteProject) return;
    setIsLoading(true);
    try {
      const result = await onDeleteProject(selectedProject.id);
      if (result?.success) {
        notify.success('Container purged', 'All serverless sandbox files successfully deleted.');
        setDeleteDialogOpen(false);
      } else {
        notify.error('Purge failed', result?.error);
      }
    } catch {
      notify.error('Network failure', 'Could not transmit database instruction.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="w-full max-h-110 overflow-y-auto overflow-x-auto custom-scrollbar rounded-xl border border-neutral-200/40 dark:border-neutral-800/60 bg-white/50 dark:bg-transparent">
        <Table className="min-w-175 relative border-collapse">
          <TableHeader className="sticky top-0 bg-neutral-50 dark:bg-[#09090b] z-20 shadow-[0_1px_0_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.05)]">
            <TableRow className="border-b border-neutral-100 dark:border-neutral-900 bg-neutral-50/50 dark:bg-neutral-950/20 hover:bg-transparent">
              <TableHead className="font-bold text-xs uppercase tracking-wider text-neutral-400 dark:text-neutral-500 h-11 py-3 pl-4">
                Project
              </TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider text-neutral-400 dark:text-neutral-500 h-11 py-3">
                Template
              </TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider text-neutral-400 dark:text-neutral-500 h-11 py-3">
                Created
              </TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider text-neutral-400 dark:text-neutral-500 h-11 py-3">
                User
              </TableHead>
              <TableHead className="w-12 text-right font-bold text-xs uppercase tracking-wider text-neutral-400 dark:text-neutral-500 h-11 py-3 pr-4">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {projects.map(project => (
              <TableRow
                key={project.id}
                className="border-b border-neutral-100 dark:border-neutral-900/60 transition-colors duration-150 hover:bg-neutral-50/30 dark:hover:bg-neutral-900/10 group"
              >
                <TableCell className="py-4 max-w-sm pl-4">
                  <div className="flex flex-col space-y-0.5">
                    <Link
                      href={`/playground/${project.id}`}
                      className="font-bold text-sm text-neutral-800 dark:text-neutral-100 hover:text-sky-500 dark:hover:text-sky-400 transition-colors inline-flex items-center gap-1.5"
                    >
                      <span>{project.title}</span>
                    </Link>
                    {project.description && (
                      <p className="text-xs text-neutral-400 dark:text-neutral-500 font-normal line-clamp-1 leading-relaxed">
                        {project.description}
                      </p>
                    )}
                  </div>
                </TableCell>

                <TableCell className="py-4">
                  <Badge
                    className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold tracking-wide shadow-none border uppercase ${getTemplateBadgeStyle(project.template)}`}
                    variant="outline"
                  >
                    {project.template}
                  </Badge>
                </TableCell>

                <TableCell className="py-4 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                  {format(new Date(project.createdAt), 'MMM d, yyyy')}
                </TableCell>

                <TableCell className="py-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg overflow-hidden border border-neutral-200/60 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 ring-2 ring-neutral-100 dark:ring-neutral-900 shadow-inner">
                      <Image
                        src={project.user.image || '/placeholder.svg'}
                        alt={project.user.name || 'User profile'}
                        width={28}
                        height={28}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                      {project.user.name}
                    </span>
                  </div>
                </TableCell>

                <TableCell className="py-4 text-right pr-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 border border-transparent hover:border-neutral-200/50 dark:hover:border-neutral-800/60 opacity-60 group-hover:opacity-100 transition-all"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open actions menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-52 rounded-xl p-1.5 shadow-xl border border-neutral-200 dark:border-neutral-800"
                    >
                      <DropdownMenuItem
                        asChild
                        className="rounded-lg text-xs font-medium cursor-pointer"
                      >
                        <Link href={`/playground/${project.id}`} className="flex items-center">
                          <Eye className="h-3.5 w-3.5 mr-2 text-neutral-400" />
                          Open Instance
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        asChild
                        className="rounded-lg text-xs font-medium cursor-pointer"
                      >
                        <Link
                          href={`/playground/${project.id}`}
                          target="_blank"
                          className="flex items-center"
                        >
                          <ExternalLink className="h-3.5 w-3.5 mr-2 text-neutral-400" />
                          Open in New Tab
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="my-1 border-neutral-100 dark:border-neutral-900" />
                      <DropdownMenuItem
                        onClick={() => handleEditClick(project)}
                        className="rounded-lg text-xs font-medium cursor-pointer"
                      >
                        <Edit3 className="h-3.5 w-3.5 mr-2 text-neutral-400" />
                        Edit Meta Specs
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDuplicateProject(project)}
                        className="rounded-lg text-xs font-medium cursor-pointer"
                      >
                        <Copy className="h-3.5 w-3.5 mr-2 text-neutral-400" />
                        Duplicate Container
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => copyProjectUrl(project.id)}
                        className="rounded-lg text-xs font-medium cursor-pointer"
                      >
                        <Download className="h-3.5 w-3.5 mr-2 text-neutral-400" />
                        Copy App URL
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="my-1 border-neutral-100 dark:border-neutral-900" />
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(project)}
                        className="rounded-lg text-xs font-medium text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-2" />
                        Terminate Container
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Editing Dialog Canvas */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-neutral-950 dark:text-neutral-50">
              Edit Sandbox Meta
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-500">
              Update variables identifying this serverless execution workspace container block.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-1.5">
              <Label
                htmlFor="title"
                className="text-xs font-bold uppercase tracking-wider text-neutral-400"
              >
                Project Title
              </Label>
              <Input
                id="title"
                value={editData.title}
                onChange={e => setEditData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter workspace name"
                className="h-10 rounded-xl"
              />
            </div>
            <div className="grid gap-1.5">
              <Label
                htmlFor="description"
                className="text-xs font-bold uppercase tracking-wider text-neutral-400"
              >
                Description
              </Label>
              <Textarea
                id="description"
                value={editData.description}
                onChange={e => setEditData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter description text string..."
                className="rounded-xl resize-none"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={isLoading}
              className="h-9 rounded-xl text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleUpdateProject}
              disabled={isLoading || !editData.title.trim()}
              className="h-9 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white dark:bg-sky-500 dark:hover:bg-sky-400"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md w-full rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#09090b] p-6 shadow-2xl">
          <AlertDialogHeader className="space-y-2">
            <AlertDialogTitle className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
              Confirm Container Termination
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Are you sure you want to terminate{' '}
              <span className="font-bold text-neutral-900 dark:text-neutral-200">
                “{selectedProject?.title}”
              </span>
              ? This action instantly purges all serverless asset blocks, storage directories, and
              system paths.
              <span className="block mt-2 font-semibold text-red-500 dark:text-red-400">
                This operation cannot be undone.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-center justify-end gap-3 mt-6 w-full">
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={() => setDeleteDialogOpen(false)}
              className="h-9 px-4 rounded-xl text-xs font-semibold bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isLoading}
              onClick={handleDeleteProject}
              className="h-9 px-4 rounded-xl text-xs font-semibold bg-red-600 dark:bg-red-600 text-white hover:bg-red-700 dark:hover:bg-red-500 border-none shadow-sm shadow-red-500/10"
            >
              {isLoading ? 'Terminating...' : 'Terminate Asset'}
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ProjectTable;
