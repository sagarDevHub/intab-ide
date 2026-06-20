import { SidebarProvider } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { getAllPlaygroundForUser } from '@/features/dashboard/actions';
import DashboardSidebar from '@/features/dashboard/components/dashboard-sidebar';
import type React from 'react';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const playgroundData = await getAllPlaygroundForUser();

  const technologyIconMap: Record<string, string> = {
    REACT: 'Zap',
    NEXTJS: 'Lightbulb',
    EXPRESS: 'Database',
    VUE: 'Compass',
    HONO: 'FlameIcon',
    ANGULAR: 'Terminal',
  };

  const formattedPlaygroundData =
    playgroundData?.map(item => ({
      id: item.id,
      name: item.title,
      starred: item.starmark?.[0]?.isMarked || false,
      icon: technologyIconMap[item.template] || 'Code2',
    })) || [];

  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider>
        <div className="relative flex min-h-screen w-full overflow-x-hidden bg-neutral-50 dark:bg-[#060606] text-neutral-900 dark:text-white transition-colors duration-300">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#141414_1px,transparent_1px),linear-gradient(to_bottom,#141414_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />

          <DashboardSidebar initialPlaygroundData={formattedPlaygroundData} />

          <main className="flex-1 relative z-10 w-full overflow-y-auto">{children}</main>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
