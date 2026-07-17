'use client';

import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { LogOut, User, Loader2 } from 'lucide-react';
import LogoutButton from './logout-button';
import { useCurrentUser } from '../hooks/use-current-user';

const UserButton = () => {
  const user = useCurrentUser();

  if (!user) {
    return (
      <div className="flex h-10 w-10 animate-pulse items-center justify-center rounded-full bg-neutral-900 border border-neutral-800">
        <Loader2 className="h-4 w-4 animate-spin text-neutral-600" />
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none">
        <div
          className={cn(
            'relative rounded-full cursor-pointer group transition-transform active:scale-95'
          )}
        >
          <div className="absolute -inset-0.5 rounded-full bg-linear-to-r from-sky-500 to-indigo-500 opacity-0 blur group-hover:opacity-40 transition duration-300" />

          <Avatar className="relative border border-neutral-800 h-10 w-10">
            <AvatarImage src={user.image ?? undefined} alt={user.name ?? 'Developer User'} />
            <AvatarFallback className="bg-neutral-900 text-neutral-400">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-56 mt-2 border-neutral-900 bg-neutral-950/95 backdrop-blur-md text-neutral-200 rounded-xl p-1.5 shadow-2xl dark"
      >
        <div className="px-2.5 py-2 text-xs">
          <p className="font-semibold text-neutral-400 truncate">Logged in as</p>
          <p className="font-mono text-[11px] text-sky-400/80 truncate mt-0.5">{user.email}</p>
        </div>

        <DropdownMenuSeparator className="bg-neutral-900" />

        <LogoutButton>
          <DropdownMenuItem className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-rose-400 focus:bg-rose-500/10 focus:text-rose-400 cursor-pointer transition-colors">
            <LogOut className="h-4 w-4" />
            <span>Log out workspace</span>
          </DropdownMenuItem>
        </LogoutButton>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserButton;
