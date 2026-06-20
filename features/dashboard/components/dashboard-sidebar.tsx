'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import {
  Code2,
  Compass,
  Database,
  FlameIcon,
  FolderPlus,
  History,
  Home,
  LayoutDashboard,
  Lightbulb,
  LucideIcon,
  Plus,
  Settings,
  Star,
  Terminal,
  Zap,
} from 'lucide-react';

interface PlaygroundDataProps {
  id: string;
  name: string;
  icon: string;
  starred: boolean;
}

const lucideIconMap: Record<string, LucideIcon> = {
  Zap,
  Lightbulb,
  Database,
  Compass,
  FlameIcon,
  Terminal,
  Code2,
};

export default function DashboardSidebar({
  initialPlaygroundData = [],
}: {
  initialPlaygroundData: PlaygroundDataProps[];
}) {
  const pathName = usePathname();

  const starredPlaygrounds = initialPlaygroundData.filter(p => p.starred);
  const recentPlaygrounds = initialPlaygroundData;

  const PlaygroundIcon = ({ iconName }: { iconName: string }) => {
    const ResolvedIcon = lucideIconMap[iconName] || Code2;
    return <ResolvedIcon className="h-4 w-4 transition-transform group-hover:scale-105" />;
  };

  return (
    <Sidebar
      variant="inset"
      collapsible="icon"
      // ✅ Unified Sky signature border and translucent glass background matching the core content cards
      className="border-r border-sky-500/20 dark:border-sky-400/20 bg-white/60 dark:bg-neutral-950/40 backdrop-blur-xl transition-colors duration-300 shadow-[2px_0_20px_-5px_rgba(14,165,233,0.05)] dark:shadow-none"
    >
      {/* ⚡ Sidebar Brand Header */}
      <SidebarHeader className="border-b border-sky-500/10 dark:border-neutral-900/40 py-2.5">
        <div className="flex items-center gap-2 px-3 py-1.5 justify-center">
          <Link
            href="/"
            className="flex items-center gap-2.5 outline-none group w-full justify-start"
          >
            {/* Logo box inherits soft border transitions */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-100 dark:bg-linear-to-br dark:from-neutral-900 dark:to-neutral-800 border border-neutral-200 dark:border-neutral-800 text-sky-500 dark:text-sky-400 font-bold shadow-sm dark:shadow-inner transition-all group-hover:border-sky-500/40">
              <Image src="/logo.svg" alt="InTabIDE Logo" height={22} width={22} priority />
            </div>
            <span className="font-extrabold text-sm tracking-wider text-neutral-800 dark:text-neutral-200 transition-colors group-hover:text-sky-500 truncate group-data-[collapsible=icon]:hidden">
              INTABIDE
            </span>
          </Link>
        </div>
      </SidebarHeader>

      {/* 🧭 Core Contents Panel */}
      <SidebarContent className="gap-2 px-2 pt-4">
        {/* Navigation Core Paths */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathName === '/'}
                tooltip="Home"
                className="rounded-xl h-10 data-[active=true]:bg-sky-500/10 data-[active=true]:text-sky-600 dark:data-[active=true]:text-sky-400 font-medium transition-colors"
              >
                <Link href="/" className="flex items-center gap-2.5">
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathName === '/dashboard'}
                tooltip="Dashboard"
                className="rounded-xl h-10 data-[active=true]:bg-sky-500/10 data-[active=true]:text-sky-600 dark:data-[active=true]:text-sky-400 font-medium transition-colors"
              >
                <Link href="/dashboard" className="flex items-center gap-2.5">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* ⭐ Starred Containers Registry */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-neutral-500 dark:text-neutral-400 font-bold tracking-wider text-[10px] uppercase">
            <Star className="h-3.5 w-3.5 mr-2 text-amber-500 fill-amber-500/20" />
            Starred
          </SidebarGroupLabel>
          <SidebarGroupAction
            title="Add starred playground"
            className="rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-900/60"
          >
            <Plus className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
          </SidebarGroupAction>
          <SidebarGroupContent className="mt-1">
            <SidebarMenu>
              {starredPlaygrounds.length === 0 ? (
                <div className="text-center font-semibold text-[10px] text-neutral-400 dark:text-neutral-500 py-3 rounded-xl border border-dashed border-sky-500/10 dark:border-neutral-900 bg-neutral-50/40 dark:bg-neutral-950/20">
                  No starred containers
                </div>
              ) : (
                starredPlaygrounds.map(playground => (
                  <SidebarMenuItem key={playground.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathName === `/playground/${playground.id}`}
                      tooltip={playground.name}
                      className="rounded-xl h-9 group data-[active=true]:bg-sky-500/10 data-[active=true]:text-sky-600 dark:data-[active=true]:text-sky-400"
                    >
                      <Link href={`/playground/${playground.id}`}>
                        <PlaygroundIcon iconName={playground.icon} />
                        <span className="truncate font-medium">{playground.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* 🕒 Recent Container Entries */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-neutral-500 dark:text-neutral-400 font-bold tracking-wider text-[10px] uppercase">
            <History className="h-3.5 w-3.5 mr-2 text-neutral-400 dark:text-neutral-500" />
            Recent Workspaces
          </SidebarGroupLabel>
          <SidebarGroupAction
            title="Create new playground"
            className="rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-900/60"
          >
            <FolderPlus className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
          </SidebarGroupAction>
          <SidebarGroupContent className="mt-1">
            <SidebarMenu>
              {recentPlaygrounds.length === 0 ? (
                <div className="text-center font-semibold text-[10px] text-neutral-400 dark:text-neutral-500 py-3 rounded-xl border border-dashed border-sky-500/10 dark:border-neutral-900 bg-neutral-50/40 dark:bg-neutral-950/20">
                  No active playgrounds
                </div>
              ) : (
                recentPlaygrounds.slice(0, 5).map(playground => (
                  <SidebarMenuItem key={playground.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathName === `/playground/${playground.id}`}
                      tooltip={playground.name}
                      className="rounded-xl h-9 group data-[active=true]:bg-sky-500/10 data-[active=true]:text-sky-600 dark:data-[active=true]:text-sky-400"
                    >
                      <Link href={`/playground/${playground.id}`}>
                        <PlaygroundIcon iconName={playground.icon} />
                        <span className="truncate font-medium">{playground.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}

              <SidebarMenuItem className="mt-1">
                <SidebarMenuButton
                  asChild
                  tooltip="View all environments"
                  className="rounded-xl hover:bg-transparent"
                >
                  <Link
                    href="/playgrounds"
                    className="group/btn flex items-center justify-center w-full"
                  >
                    <span className="text-xs font-bold text-sky-600 dark:text-sky-400 group-hover/btn:underline">
                      View all playgrounds &rarr;
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ⚙️ Configured Sidebar Footer Action */}
      <SidebarFooter className="p-3 border-t border-sky-500/10 dark:border-neutral-900/40">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Settings"
              className="rounded-xl h-10 data-[active=true]:bg-sky-500/10 data-[active=true]:text-sky-600 dark:data-[active=true]:text-sky-400"
            >
              <Link href="/settings" className="font-medium">
                <Settings className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
