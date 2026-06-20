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
  const playgrounds = await getAllPlaygroundForUser();

  return (
    <div className="flex flex-col justify-start items-start min-h-screen mx-auto max-w-7xl px-6 py-10 w-full">
      <div className="mb-8 space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
          Workspace Hub
        </h1>
        <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
          Manage, branch, and compile your isolated VFS serverless blocks.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
        <AddNewButton />
        <AddRepoButton />
      </div>

      <div className="mt-10 flex flex-col justify-center items-center w-full bg-white dark:bg-neutral-950/30 border border-sky-500/20 dark:border-sky-400/20 rounded-2xl p-4 shadow-[0_4px_20px_-2px_rgba(14,165,233,0.06)] dark:shadow-[0_4px_30px_-5px_rgba(14,165,233,0.1)] backdrop-blur-xs">
        {playgrounds && playgrounds.length === 0 ? (
          <EmptyState />
        ) : (
          <ProjectTable
            // @ts-expect-error: ignore
            // TODO: need to update the types of the playground
            projects={playgrounds || []}
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
