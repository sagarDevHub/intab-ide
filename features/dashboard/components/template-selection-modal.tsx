import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Search, Star, Clock } from 'lucide-react';
import React, { useState } from 'react';
import { FaReact, FaNodeJs, FaVuejs, FaAngular } from 'react-icons/fa';
import { SiNextdotjs, SiHono } from 'react-icons/si';

type TemplateType = 'REACT' | 'NEXTJS' | 'EXPRESS' | 'VUE' | 'HONO' | 'ANGULAR';

type TemplateSelectionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; template: TemplateType; description?: string }) => void;
};

interface TemplateData {
  id: TemplateType;
  name: string;
  description: string;
  icon: React.ReactNode;
  rating: number;
  tags: string[];
  category: 'frontend' | 'backend' | 'fullstack';
  glowColor: string;
}

const TEMPLATE_LIST: TemplateData[] = [
  {
    id: 'REACT',
    name: 'React',
    description:
      'A JavaScript library for building user interfaces with component-based architecture.',
    icon: <FaReact className="h-6 w-6 text-[#61DAFB]" />,
    rating: 5,
    tags: ['UI', 'Frontend', 'JavaScript'],
    category: 'frontend',
    glowColor: 'group-hover:border-cyan-500/40 hover:shadow-cyan-500/5',
  },
  {
    id: 'NEXTJS',
    name: 'Next.js',
    description:
      'The React framework for production with server-side rendering and static site generation.',
    icon: <SiNextdotjs className="h-6 w-6 text-neutral-900 dark:text-neutral-50" />,
    rating: 4,
    tags: ['React', 'SSR', 'Fullstack'],
    category: 'fullstack',
    glowColor: 'group-hover:border-zinc-500/40 hover:shadow-zinc-500/5',
  },
  {
    id: 'EXPRESS',
    name: 'Express',
    description:
      'Fast, unopinionated, minimalist web framework for Node.js to build APIs and web applications.',
    icon: <FaNodeJs className="h-6 w-6 text-[#339933]" />,
    rating: 4,
    tags: ['Node.js', 'API', 'Backend'],
    category: 'backend',
    glowColor: 'group-hover:border-green-500/40 hover:shadow-green-500/5',
  },
  {
    id: 'VUE',
    name: 'Vue.js',
    description:
      'Progressive JavaScript framework for building user interfaces with an approachable learning curve.',
    icon: <FaVuejs className="h-6 w-6 text-[#4FC08D]" />,
    rating: 4,
    tags: ['UI', 'Frontend', 'JavaScript'],
    category: 'frontend',
    glowColor: 'group-hover:border-emerald-500/40 hover:shadow-emerald-500/5',
  },
  {
    id: 'HONO',
    name: 'Hono',
    description:
      'Fast, lightweight, built on Web Standards. Support for any JavaScript runtime ecosystem.',
    icon: <SiHono className="h-6 w-6 text-[#E36049]" />,
    rating: 4,
    tags: ['Node.js', 'TypeScript', 'Backend'],
    category: 'backend',
    glowColor: 'group-hover:border-orange-500/40 hover:shadow-orange-500/5',
  },
  {
    id: 'ANGULAR',
    name: 'Angular',
    description:
      'Angular is a development platform, built on TypeScript for building scalable web applications.',
    icon: <FaAngular className="h-6 w-6 text-[#DD0031]" />,
    rating: 3,
    tags: ['React', 'Fullstack', 'JavaScript'],
    category: 'frontend',
    glowColor: 'group-hover:border-red-500/40 hover:shadow-red-500/5',
  },
];

const TemplateSelectionModal = ({ isOpen, onClose, onSubmit }: TemplateSelectionModalProps) => {
  const [step, setStep] = useState<'select' | 'configure'>('select');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<'all' | 'frontend' | 'backend' | 'fullstack'>('all');
  const [projectName, setProjectName] = useState('');

  const handleResetModal = () => {
    onClose();
    setStep('select');
    setSelectedTemplate(null);
    setSearchQuery('');
    setCategory('all');
    setProjectName('');
  };

  const filteredTemplates = TEMPLATE_LIST.filter(t => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = category === 'all' || t.category === category;
    return matchesSearch && matchesCategory;
  });

  const handleContinue = () => {
    if (!selectedTemplate) return;
    setStep('configure');
  };

  const handleFinalSubmit = () => {
    const selectedData = TEMPLATE_LIST.find(t => t.id === selectedTemplate);
    onSubmit({
      title: projectName || `My ${selectedData?.name} Playground`,
      template: selectedTemplate!,
      description: selectedData?.description,
    });
    handleResetModal();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open) handleResetModal();
      }}
    >
      <DialogContent className="sm:max-w-[850px] p-0 overflow-hidden bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl shadow-2xl">
        {step === 'select' ? (
          <>
            {/* Header Block */}
            <div className="px-6 pt-6 pb-4 border-b border-neutral-100 dark:border-neutral-900/60 bg-neutral-50/50 dark:bg-neutral-950/50">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold flex items-center gap-2 text-neutral-900 dark:text-neutral-50">
                  <Plus size={20} className="text-sky-500" />
                  <span>Choose a template to create your new playground</span>
                </DialogTitle>
                <DialogDescription className="text-neutral-500 dark:text-neutral-400 text-sm">
                  Filter frameworks and libraries to instantly scaffold your custom development
                  sandboxes.
                </DialogDescription>
              </DialogHeader>

              {/* Filtering Controls */}
              <div className="flex flex-col sm:flex-row gap-4 mt-5 items-center justify-between">
                <div className="relative w-full sm:max-w-xs group">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 group-focus-within:text-sky-500 transition-colors"
                    size={16}
                  />
                  <Input
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 w-full bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-xl focus-visible:ring-1 focus-visible:ring-sky-500 focus-visible:ring-offset-0 text-sm"
                  />
                </div>

                <div className="flex p-0.5 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 rounded-xl overflow-x-auto w-full sm:w-auto">
                  {(['all', 'frontend', 'backend', 'fullstack'] as const).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-4 py-1.5 text-xs font-semibold capitalize rounded-lg transition-all duration-200 ${
                        category === cat
                          ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 shadow-sm font-bold'
                          : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Grid Workspace */}
            <div className="p-6 max-h-[50vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 bg-neutral-50/30 dark:bg-neutral-950/10">
              {filteredTemplates.length > 0 ? (
                filteredTemplates.map(template => {
                  const isSelected = selectedTemplate === template.id;
                  return (
                    <div
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`group p-5 flex flex-col justify-between border rounded-xl cursor-pointer bg-white dark:bg-neutral-900/40 transition-all duration-200 backdrop-blur-sm shadow-sm select-none ${
                        isSelected
                          ? 'border-sky-500 dark:border-sky-500 bg-sky-500/[0.01] ring-1 ring-sky-500 shadow-md shadow-sky-500/5'
                          : 'border-neutral-200 dark:border-neutral-800/80 hover:bg-neutral-50/50 dark:hover:bg-neutral-900/60 hover:scale-[1.005]'
                      } ${template.glowColor}`}
                    >
                      <div>
                        {/* Top Line: Icon + Star Array */}
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <div className="p-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 rounded-xl group-hover:scale-105 transition-transform duration-200">
                            {template.icon}
                          </div>
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={12}
                                className={`${
                                  i < template.rating
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-neutral-200 dark:text-neutral-800'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Title & Description */}
                        <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-50">
                          {template.name}
                        </h3>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 leading-relaxed font-normal min-h-[36px]">
                          {template.description}
                        </p>
                      </div>

                      {/* Framework Tag List */}
                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {template.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200/50 dark:border-neutral-700/40 text-neutral-500 dark:text-neutral-400"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full py-12 text-center text-sm font-medium text-neutral-400 dark:text-neutral-500">
                  No layout templates found matching your search values.
                </div>
              )}
            </div>

            {/* Footer Container */}
            <div className="px-6 py-4 flex flex-row items-center justify-between border-t border-neutral-100 dark:border-neutral-900/60 bg-neutral-50/50 dark:bg-neutral-950/50">
              <div className="flex items-center gap-1.5 text-xs text-neutral-400 dark:text-neutral-500 font-medium">
                <Clock size={13} />
                <span>Status: {selectedTemplate ? 'Ready to configure' : 'Select a template'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={handleResetModal}
                  className="h-9 px-4 rounded-xl text-xs font-semibold bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                >
                  Cancel
                </Button>
                <Button
                  disabled={!selectedTemplate}
                  onClick={handleContinue}
                  className={`h-9 px-5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    selectedTemplate
                      ? 'bg-sky-600 dark:bg-sky-500 text-white hover:bg-sky-700 dark:hover:bg-sky-400 active:scale-95 shadow-md shadow-sky-500/10'
                      : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-400 dark:text-neutral-600 cursor-not-allowed shadow-none'
                  }`}
                >
                  Continue
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* Configure Step View Workspace */
          <div className="p-6 flex flex-col gap-4 animate-in fade-in-40 duration-200">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
                Configure Project Playground
              </DialogTitle>
              <DialogDescription className="text-sm text-neutral-500 dark:text-neutral-400">
                Provide a descriptor identification title for your new sandbox environment.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2 py-4">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Project Name
              </label>
              <Input
                placeholder={`My ${TEMPLATE_LIST.find(t => t.id === selectedTemplate)?.name} Project`}
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
                className="h-10 w-full bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-xl text-sm"
              />
            </div>

            <div className="flex items-center justify-end gap-3 mt-4">
              <Button
                variant="ghost"
                onClick={() => setStep('select')}
                className="h-9 px-4 rounded-xl text-xs font-semibold"
              >
                Back
              </Button>
              <Button
                onClick={handleFinalSubmit}
                className="h-9 px-5 rounded-xl text-xs font-semibold bg-sky-600 dark:bg-sky-500 text-white hover:bg-sky-700 dark:hover:bg-sky-400 shadow-md shadow-sky-500/10 active:scale-95"
              >
                Create Playground
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TemplateSelectionModal;
