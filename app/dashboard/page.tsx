// import {
//   deleteProjectById,
//   duplicateProjectById,
//   editProjectById,
//   getAllPlaygroundForUser,
// } from '@/features/dashboard/actions';
// import AddNewButton from '@/features/dashboard/components/add-new-button';
// import AddRepoButton from '@/features/dashboard/components/add-repo-button';
// import ProjectTable from '@/features/dashboard/components/project-table';
// import { Terminal } from 'lucide-react';

// const EmptyState = () => (
//   <div className="flex flex-col items-center justify-center py-16 px-4 rounded-2xl border border-dashed border-sky-500/20 dark:border-sky-400/20 bg-white/40 dark:bg-neutral-950/20 backdrop-blur-xs w-full max-w-xl text-center">
//     <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 text-sky-600 dark:text-sky-400 mb-4 animate-pulse">
//       <Terminal className="h-5 w-5" />
//     </div>
//     <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-200">
//       No active instances found
//     </h2>
//     <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mt-1">
//       Initialize a clean virtual development sandbox container to get started.
//     </p>
//   </div>
// );

// const DashboardMainPage = async () => {
//   const playgrounds = await getAllPlaygroundForUser();

//   return (
//     <div className="flex flex-col justify-start items-start h-full w-full mx-auto max-w-7xl px-6 py-8 overflow-hidden">
//       {/* Top Heading */}
//       <div className="mb-6 space-y-1 shrink-0">
//         <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
//           Workspace Hub
//         </h1>
//         <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
//           Manage, branch, and compile your isolated VFS serverless blocks.
//         </p>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full shrink-0">
//         <AddNewButton />
//         <AddRepoButton />
//       </div>

//       <div className="mt-8 flex flex-col w-full bg-white dark:bg-neutral-950/30 border border-sky-500/15 dark:border-sky-400/15 rounded-2xl shadow-[0_4px_20px_-2px_rgba(14,165,233,0.04)] dark:shadow-[0_4px_30px_-5px_rgba(14,165,233,0.08)] backdrop-blur-xs overflow-hidden">
//         {playgrounds && playgrounds.length === 0 ? (
//           <div className="w-full flex items-center justify-center p-8">
//             <EmptyState />
//           </div>
//         ) : (
//           <ProjectTable
//             projects={playgrounds || []}
//             onDeleteProject={deleteProjectById}
//             onUpdateProject={editProjectById}
//             onDuplicateProject={duplicateProjectById}
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// export default DashboardMainPage;

// app/dashboard/page.tsx
import {
  deleteProjectById,
  duplicateProjectById,
  editProjectById,
  getAllPlaygroundForUser,
} from '@/features/dashboard/actions';
import AddNewButton from '@/features/dashboard/components/add-new-button';
import AddRepoButton from '@/features/dashboard/components/add-repo-button';
import ProjectTable from '@/features/dashboard/components/project-table';
import { Terminal } from 'lucide-react';

// ✅ Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-16 px-4 rounded-2xl border border-dashed border-sky-500/20 dark:border-sky-400/20 bg-white/40 dark:bg-neutral-950/20 backdrop-blur-xs w-full max-w-xl text-center">
    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 text-sky-600 dark:text-sky-400 mb-4 animate-pulse">
      <Terminal className="h-5 w-5" />
    </div>
    <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-200">
      No active instances found
    </h2>
    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mt-1">
      Initialize a clean virtual development sandbox container to get started.
    </p>
  </div>
);

const DashboardMainPage = async () => {
  let playgrounds = [];
  let error = null;

  try {
    playgrounds = await getAllPlaygroundForUser();
  } catch (err) {
    console.error('Error fetching playgrounds:', err);
    error = err;
  }

  return (
    <div className="flex flex-col justify-start items-start h-full w-full mx-auto max-w-7xl px-6 py-8 overflow-hidden">
      {/* Top Heading */}
      <div className="mb-6 space-y-1 shrink-0">
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
          Workspace Hub
        </h1>
        <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
          Manage, branch, and compile your isolated VFS serverless blocks.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full shrink-0">
        <AddNewButton />
        <AddRepoButton />
      </div>

      <div className="mt-8 flex flex-col w-full bg-white dark:bg-neutral-950/30 border border-sky-500/15 dark:border-sky-400/15 rounded-2xl shadow-[0_4px_20px_-2px_rgba(14,165,233,0.04)] dark:shadow-[0_4px_30px_-5px_rgba(14,165,233,0.08)] backdrop-blur-xs overflow-hidden">
        {error ? (
          <div className="w-full flex items-center justify-center p-8">
            <div className="text-center">
              <p className="text-sm font-medium text-red-500 dark:text-red-400">
                Failed to load projects
              </p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                Please refresh the page
              </p>
            </div>
          </div>
        ) : !playgrounds || playgrounds.length === 0 ? (
          <div className="w-full flex items-center justify-center p-8">
            <EmptyState />
          </div>
        ) : (
          <ProjectTable
            projects={playgrounds}
            onDeleteProject={deleteProjectById}
            onUpdateProject={editProjectById}
            onDuplicateProject={duplicateProjectById}
          />
        )}
      </div>
    </div>
  );
};

export default DashboardMainPage;
