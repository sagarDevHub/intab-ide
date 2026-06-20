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
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
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
import { toast } from 'sonner';
// import { MarkedToggleButton } from "./toggle-star";

interface ProjectTableProps {
  project: Project[];
}

import React from 'react';

const ProjectTable = () => {
  return <div>ProjectTable</div>;
};

export default ProjectTable;
