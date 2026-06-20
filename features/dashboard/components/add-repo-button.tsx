import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowDown } from 'lucide-react';
import Image from 'next/image';

const AddRepo = () => {
  return (
    <div
      className="group p-6 flex flex-row justify-between items-center border border-sky-500/20 dark:border-sky-400/20 rounded-2xl bg-white dark:bg-neutral-950/40 cursor-pointer 
      transition-all duration-300 ease-in-out backdrop-blur-md
      hover:border-sky-500/50 hover:scale-[1.01]
      shadow-[0_4px_20px_-2px_rgba(14,165,233,0.08)] dark:shadow-[0_4px_30px_-5px_rgba(14,165,233,0.15)] relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-37.5 h-37.5 bg-sky-500/5 blur-[50px] rounded-full pointer-events-none group-hover:bg-sky-500/10 transition-colors" />

      <div className="flex flex-row justify-center items-start gap-4 relative z-10">
        <Button
          variant="outline"
          className="flex h-12 w-12 justify-center items-center bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 group-hover:bg-sky-50 dark:group-hover:bg-sky-950/30 group-hover:border-sky-500/40 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-all duration-300 rounded-xl"
          size="icon"
        >
          <ArrowDown
            size={18}
            className="transition-transform duration-500 group-hover:translate-y-0.5"
          />
        </Button>
        <div className="flex flex-col justify-center">
          <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
            Import Repository
          </h2>
          <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 max-w-50 mt-0.5 leading-relaxed">
            Clone remote repositories straight into your VFS view.
          </p>
        </div>
      </div>

      <div className="relative overflow-hidden opacity-80 dark:opacity-70 group-hover:opacity-100 group-hover:scale-105 dark:invert-0 invert group-hover:invert-0 group-hover:drop-shadow-[0_0_15px_rgba(99,102,241,0.15)] transition-all duration-300">
        <Image
          src="/github.svg"
          alt="Import project components directly via GitHub"
          width={100}
          height={100}
          className="object-contain"
        />
      </div>
    </div>
  );
};

export default AddRepo;
