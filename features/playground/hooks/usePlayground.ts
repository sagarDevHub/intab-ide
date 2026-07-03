'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { TemplateFolder, TemplateFile, TemplateItem } from '../types';
import { getPlaygroundById, saveUpdatedCode } from '../actions';
import { getWebContainer, transformTreeToVFS } from '../lib/webcontainer-core';
import { notify } from '@/lib/notifications';

interface PlaygroundData {
  id: string;
  title?: string;
  description?: string;
  [key: string]: any;
}

interface UsePlaygroundReturn {
  playgroundData: PlaygroundData | null;
  templateData: TemplateFolder | null;
  isLoading: boolean;
  error: string | null;
  previewUrl: string | null;
  loadPlayground: () => Promise<void>;
  saveTemplateData: (data: TemplateFolder) => Promise<void>;
  addNewFile: (parentPath: string, name: string, ext: string) => Promise<void>;
  addNewFolder: (parentPath: string, folderName: string) => Promise<void>;
  renameNodeItem: (
    targetPath: string,
    isFolder: boolean,
    newName: string,
    newExt?: string
  ) => Promise<void>;
  deleteNodeItem: (targetPath: string, isFolder: boolean) => Promise<void>;
  updateActiveFileContent: (targetPath: string, newContent: string) => void;
  killDevServer: () => Promise<void>;
}

// --- Tree helpers ---
const isFolderNode = (item: TemplateItem): item is TemplateFolder => {
  return item !== null && typeof item === 'object' && 'folderName' in item;
};

const addItemToTree = (
  folder: TemplateFolder,
  currentPath: string,
  targetPath: string,
  newItem: TemplateItem
): TemplateFolder => {
  if (currentPath === targetPath) {
    return { ...folder, items: [...folder.items, newItem] };
  }
  return {
    ...folder,
    items: folder.items.map((item): TemplateItem => {
      if (isFolderNode(item)) {
        const subPath =
          currentPath === 'Root' ? item.folderName : `${currentPath}/${item.folderName}`;
        if (targetPath === subPath || targetPath.startsWith(subPath + '/')) {
          return addItemToTree(item, subPath, targetPath, newItem);
        }
      }
      return item;
    }),
  };
};

const renameItemInTree = (
  folder: TemplateFolder,
  currentPath: string,
  targetPath: string,
  isTargetFolder: boolean,
  newName: string,
  newExt?: string
): TemplateFolder => {
  return {
    ...folder,
    items: folder.items.map((item): TemplateItem => {
      const itemIsFolder = isFolderNode(item);
      const itemPath =
        currentPath === 'Root'
          ? itemIsFolder
            ? item.folderName
            : `${item.filename}.${item.fileExtension}`
          : itemIsFolder
            ? `${currentPath}/${item.folderName}`
            : `${currentPath}/${item.filename}.${item.fileExtension}`;

      if (itemPath === targetPath && itemIsFolder === isTargetFolder) {
        if (itemIsFolder) {
          return { ...item, folderName: newName };
        } else {
          return { ...item, filename: newName, fileExtension: newExt || '' };
        }
      }

      if (itemIsFolder && (targetPath === itemPath || targetPath.startsWith(itemPath + '/'))) {
        return renameItemInTree(item, itemPath, targetPath, isTargetFolder, newName, newExt);
      }
      return item;
    }),
  };
};

const deleteItemFromTree = (
  folder: TemplateFolder,
  currentPath: string,
  targetPath: string,
  isTargetFolder: boolean
): TemplateFolder => {
  return {
    ...folder,
    items: folder.items
      .filter(item => {
        const itemIsFolder = isFolderNode(item);
        const itemPath =
          currentPath === 'Root'
            ? itemIsFolder
              ? item.folderName
              : `${item.filename}.${item.fileExtension}`
            : itemIsFolder
              ? `${currentPath}/${item.folderName}`
              : `${currentPath}/${item.filename}.${item.fileExtension}`;

        return !(itemPath === targetPath && itemIsFolder === isTargetFolder);
      })
      .map((item): TemplateItem => {
        if (isFolderNode(item)) {
          const itemPath =
            currentPath === 'Root' ? item.folderName : `${currentPath}/${item.folderName}`;
          if (targetPath === itemPath || targetPath.startsWith(itemPath + '/')) {
            return deleteItemFromTree(item, itemPath, targetPath, isTargetFolder);
          }
        }
        return item;
      }),
  };
};

const updateFileContentInTree = (
  folder: TemplateFolder,
  currentPath: string,
  targetPath: string,
  newContent: string
): TemplateFolder => {
  return {
    ...folder,
    items: folder.items.map((item): TemplateItem => {
      const itemIsFolder = isFolderNode(item);
      const itemPath =
        currentPath === 'Root'
          ? itemIsFolder
            ? item.folderName
            : `${item.filename}.${item.fileExtension}`
          : itemIsFolder
            ? `${currentPath}/${item.folderName}`
            : `${currentPath}/${item.filename}.${item.fileExtension}`;

      if (itemPath === targetPath && !itemIsFolder) {
        return { ...item, content: newContent };
      }

      if (itemIsFolder && (targetPath === itemPath || targetPath.startsWith(itemPath + '/'))) {
        return updateFileContentInTree(item, itemPath, targetPath, newContent);
      }
      return item;
    }),
  };
};

// --- Framework Detection ---
const detectFramework = (packageJson: any): string => {
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  const scripts = packageJson.scripts || {};

  if (deps.next) return 'nextjs';
  if (deps.vue) return 'vue';
  if (deps['@angular/core']) return 'angular';
  if (deps['react-scripts']) return 'react-cra';
  if (deps.react && deps['react-dom'] && deps.vite) return 'react-vite';
  if (deps.react && deps['react-dom']) return 'react';
  if (deps.hono) return 'hono';
  if (deps.express) return 'express';
  if (deps.fastify) return 'fastify';

  if (scripts.dev) return 'custom-dev';
  if (scripts.start) return 'custom-start';
  if (scripts.serve) return 'custom-serve';

  return 'unknown';
};

const getStartCommand = (framework: string, scripts: any): string => {
  switch (framework) {
    case 'nextjs':
      return 'dev';
    case 'vue':
      if (scripts.serve) return 'serve';
      if (scripts.dev) return 'dev';
      return 'serve';
    case 'angular':
      return 'start';
    case 'react-cra':
      return 'start';
    case 'react-vite':
      return 'dev';
    case 'react':
      if (scripts.start) return 'start';
      if (scripts.dev) return 'dev';
      return 'start';
    case 'hono':
      if (scripts.dev) return 'dev';
      if (scripts.start) return 'start';
      return 'dev';
    case 'express':
      if (scripts.start) return 'start';
      if (scripts.dev) return 'dev';
      return 'start';
    case 'fastify':
      if (scripts.start) return 'start';
      if (scripts.dev) return 'dev';
      return 'start';
    case 'custom-dev':
      return 'dev';
    case 'custom-start':
      return 'start';
    case 'custom-serve':
      return 'serve';
    default:
      if (scripts.dev) return 'dev';
      if (scripts.start) return 'start';
      if (scripts.serve) return 'serve';
      return 'dev';
  }
};

// --- Create React entry files if missing ---
const createReactEntryFiles = async (instance: any, templateData: TemplateFolder) => {
  const folderItems = templateData?.items || [];

  const srcFolder = folderItems.find(item => 'folderName' in item && item.folderName === 'src') as
    | TemplateFolder
    | undefined;

  if (!srcFolder) {
    await instance.fs.mkdir('src', { recursive: true });
  }

  try {
    await instance.fs.readFile('src/index.tsx');
  } catch {
    const indexContent = `
import React from 'react';
import ReactDOM from 'react-dom/client';
import './style.css';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;
    await instance.fs.writeFile('src/index.tsx', indexContent);
  }

  try {
    await instance.fs.readFile('src/App.tsx');
  } catch {
    const appContent = `
import React, { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-xl">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-500/10 text-sky-400 rounded-2xl mb-6 text-2xl font-bold animate-pulse">
          ⚡
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white mb-2">
          React + TypeScript
        </h1>
        <p className="text-xs text-slate-400 mb-6">
          Your React app is running in WebContainer!
        </p>
        <div className="bg-slate-950/50 border border-slate-800/60 rounded-xl p-4 mb-6">
          <p className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-2">
            Interactive Counter
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setCount(Math.max(0, count - 1))}
              className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 flex items-center justify-center text-xl font-bold transition-all"
            >
              -
            </button>
            <span className="text-4xl font-bold tabular-nums min-w-[60px]">
              {count}
            </span>
            <button
              onClick={() => setCount(count + 1)}
              className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 flex items-center justify-center text-xl font-bold transition-all"
            >
              +
            </button>
          </div>
        </div>
        <p className="text-[10px] text-slate-600">Edit src/App.tsx to start building</p>
      </div>
    </div>
  );
}

export default App;
`;
    await instance.fs.writeFile('src/App.tsx', appContent);
  }

  try {
    await instance.fs.readFile('src/style.css');
  } catch {
    const styleContent = `
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
`;
    await instance.fs.writeFile('src/style.css', styleContent);
  }

  try {
    await instance.fs.readFile('public/index.html');
  } catch {
    await instance.fs.mkdir('public', { recursive: true });
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="React App" />
    <title>React App</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
`;
    await instance.fs.writeFile('public/index.html', htmlContent);
  }
};

// --- Utility to wait for file to be ready ---
const waitForFile = async (
  instance: any,
  filePath: string,
  maxRetries: number = 5,
  delayMs: number = 500
): Promise<boolean> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await instance.fs.readFile(filePath);
      return true;
    } catch (e) {
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
  return false;
};

// --- Hook ---
export const usePlayground = (
  id: string,
  onTerminalWrite?: (text: string) => void
): UsePlaygroundReturn => {
  const [playgroundData, setPlaygroundData] = useState<PlaygroundData | null>(null);
  const [templateData, setTemplateData] = useState<TemplateFolder | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const isBootingRef = useRef<boolean>(false);
  const devProcessRef = useRef<any>(null);
  const installProcessRef = useRef<any>(null);
  const webContainerRef = useRef<any>(null);

  const loadPlayground = useCallback(async () => {
    if (!id || id === 'undefined') return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await getPlaygroundById(id);

      if (!data) throw new Error('Workspace profile target could not be parsed.');

      setPlaygroundData({ id, title: data.title, description: data.description });

      const rawContent = data?.templateFile?.[0]?.content;
      if (rawContent) {
        const parsedContent = typeof rawContent === 'string' ? JSON.parse(rawContent) : rawContent;
        setTemplateData(parsedContent as TemplateFolder);
        notify.success('Playground loaded', 'Virtual structure sync operational.');
        return;
      }

      const res = await fetch(`/api/template/${encodeURIComponent(id)}`);
      if (!res.ok) throw new Error(`Failed to load template: ${res.status}`);
      const templateRes = await res.json();

      if (templateRes.templateJson && Array.isArray(templateRes.templateJson)) {
        setTemplateData({ folderName: 'Root', items: templateRes.templateJson });
      } else {
        setTemplateData(templateRes.templateJson || { folderName: 'Root', items: [] });
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load playground data');
      notify.error('Failed to load playground data');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const killDevServer = useCallback(async () => {
    if (devProcessRef.current) {
      try {
        onTerminalWrite?.('\r\n\x1b[33m🛑 Stopping dev server...\x1b[0m\r\n');
        await devProcessRef.current.kill();
        devProcessRef.current = null;
        onTerminalWrite?.('\r\n\x1b[32m✅ Dev server stopped\x1b[0m\r\n');
        setPreviewUrl(null);
        return;
      } catch (err) {
        console.error('Failed to kill process:', err);
        onTerminalWrite?.('\r\n\x1b[31m❌ Failed to stop dev server\x1b[0m\r\n');
      }
    }
    if (installProcessRef.current) {
      try {
        await installProcessRef.current.kill();
        installProcessRef.current = null;
      } catch (e) {}
    }
  }, [onTerminalWrite]);

  // Initialize WebContainer and run dev server
  useEffect(() => {
    if (isLoading || !templateData || isBootingRef.current) return;
    isBootingRef.current = true;

    async function initializeContainerRuntime() {
      try {
        onTerminalWrite?.('\x1b[1;36m🔄 Instantiating WebAssembly Sandbox Kernel...\x1b[0m\r\n');
        const instance = await getWebContainer();
        webContainerRef.current = instance;

        onTerminalWrite?.('📂 Syncing local template files into workspace VFS...\r\n');
        const vfsStructure = transformTreeToVFS(templateData!);
        await instance.mount(vfsStructure);

        await new Promise(resolve => setTimeout(resolve, 1500));

        const folderItems = templateData?.items || [];

        const packageJsonExists = await waitForFile(instance, 'package.json', 10, 500);

        let startCommand = 'dev';
        let framework = 'unknown';

        if (packageJsonExists) {
          try {
            const packageJsonContent = await instance.fs.readFile('package.json', 'utf-8');
            const packageJson = JSON.parse(packageJsonContent);

            framework = detectFramework(packageJson);
            startCommand = getStartCommand(framework, packageJson.scripts || {});

            onTerminalWrite?.(`\x1b[32m🔍 Detected framework: ${framework}\x1b[0m\r\n`);
            onTerminalWrite?.(`\x1b[32m📦 Using start command: npm run ${startCommand}\x1b[0m\r\n`);

            if (framework === 'react-cra' || framework === 'react') {
              onTerminalWrite?.('⚙️ Setting up React entry files...\r\n');
              await createReactEntryFiles(instance, templateData!);
            }
          } catch (err) {
            onTerminalWrite?.(
              '\x1b[33m⚠️ Could not parse package.json, using default dev command\x1b[0m\r\n'
            );
            startCommand = 'dev';
          }
        } else {
          onTerminalWrite?.('⚠️ No package.json found. Setting up project...\r\n');

          const hasSrcFolder = folderItems.some(
            item => 'folderName' in item && item.folderName === 'src'
          );
          const hasAppDir = folderItems.some(
            item => 'folderName' in item && item.folderName === 'app'
          );

          if (hasAppDir) {
            framework = 'nextjs';
            await instance.fs.writeFile(
              'package.json',
              JSON.stringify(
                {
                  name: 'nextjs-app',
                  private: true,
                  scripts: { dev: 'next dev', build: 'next build', start: 'next start' },
                  dependencies: { next: '13.5.1', react: '18.2.0', 'react-dom': '18.2.0' },
                  devDependencies: {
                    '@types/react': '18.2.0',
                    '@types/react-dom': '18.2.0',
                    typescript: '5.0.0',
                  },
                },
                null,
                2
              )
            );
            startCommand = 'dev';
          } else if (hasSrcFolder) {
            framework = 'react-cra';
            await instance.fs.writeFile(
              'package.json',
              JSON.stringify(
                {
                  name: 'react-app',
                  private: true,
                  scripts: { start: 'react-scripts start', build: 'react-scripts build' },
                  dependencies: {
                    react: '^18.2.0',
                    'react-dom': '^18.2.0',
                    'react-scripts': '^5.0.1',
                  },
                  devDependencies: { '@types/react': '^18.2.0', '@types/react-dom': '^18.2.0' },
                },
                null,
                2
              )
            );
            startCommand = 'start';
            await createReactEntryFiles(instance, templateData!);
          } else {
            framework = 'vite';
            await instance.fs.writeFile(
              'package.json',
              JSON.stringify(
                {
                  name: 'sandbox-app',
                  private: true,
                  scripts: { dev: 'vite' },
                  dependencies: { vite: '^5.0.0' },
                },
                null,
                2
              )
            );
            startCommand = 'dev';
          }
        }

        onTerminalWrite?.('📦 Installing dependencies (this may take a moment)...\r\n');

        // For Angular, install @angular/cli globally and update package.json
        if (framework === 'angular') {
          onTerminalWrite?.('⚙️ Installing Angular CLI globally...\r\n');
          const ngInstall = await instance.spawn('npm', [
            'install',
            '-g',
            '@angular/cli',
            '--legacy-peer-deps',
          ]);
          ngInstall.output.pipeTo(
            new WritableStream({
              write(data) {
                onTerminalWrite?.(data);
              },
            })
          );
          await ngInstall.exit;

          // Ensure angular.json exists and is valid
          try {
            await instance.fs.readFile('angular.json');
          } catch {
            onTerminalWrite?.('⚙️ Creating angular.json...\r\n');
            // Create a minimal angular.json if it doesn't exist
            const angularJson = {
              $schema: './node_modules/@angular/cli/lib/config/schema.json',
              version: 1,
              newProjectRoot: 'projects',
              projects: {
                demo: {
                  projectType: 'application',
                  schematics: {},
                  root: '',
                  sourceRoot: 'src',
                  prefix: 'app',
                  architect: {
                    build: {
                      builder: '@angular-devkit/build-angular:browser',
                      options: {
                        outputPath: 'dist/demo',
                        index: 'src/index.html',
                        main: 'src/main.ts',
                        polyfills: 'src/polyfills.ts',
                        tsConfig: 'tsconfig.app.json',
                        assets: ['src/favicon.ico', 'src/assets'],
                        styles: ['src/styles.css'],
                        scripts: [],
                      },
                      configurations: {
                        production: {
                          fileReplacements: [
                            {
                              src: 'src/environments/environment.ts',
                              replace: 'src/environments/environment.prod.ts',
                            },
                          ],
                          optimization: true,
                          outputHashing: 'all',
                          sourceMap: false,
                          namedChunks: false,
                          extractLicenses: true,
                          vendorChunk: false,
                          buildOptimizer: true,
                          budgets: [
                            {
                              type: 'initial',
                              maximumWarning: '2mb',
                              maximumError: '5mb',
                            },
                          ],
                        },
                        development: {
                          optimization: false,
                          extractLicenses: false,
                          sourceMap: true,
                          namedChunks: true,
                        },
                      },
                      defaultConfiguration: 'production',
                    },
                    serve: {
                      builder: '@angular-devkit/build-angular:dev-server',
                      configurations: {
                        production: {
                          browserTarget: 'demo:build:production',
                        },
                        development: {
                          browserTarget: 'demo:build:development',
                        },
                      },
                      defaultConfiguration: 'development',
                    },
                  },
                },
              },
            };
            await instance.fs.writeFile('angular.json', JSON.stringify(angularJson, null, 2));
          }

          // Ensure src/main.ts exists
          try {
            await instance.fs.readFile('src/main.ts');
          } catch {
            await instance.fs.mkdir('src', { recursive: true });
            const mainContent = `
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
`;
            await instance.fs.writeFile('src/main.ts', mainContent);
          }

          // Ensure src/app/app.module.ts exists
          try {
            await instance.fs.readFile('src/app/app.module.ts');
          } catch {
            await instance.fs.mkdir('src/app', { recursive: true });
            const appModule = `
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
`;
            await instance.fs.writeFile('src/app/app.module.ts', appModule);
          }

          // Ensure src/app/app.component.ts exists
          try {
            await instance.fs.readFile('src/app/app.component.ts');
          } catch {
            const appComponent = `
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: \`
    <div style="min-height: 100vh; background: #0f172a; color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: sans-serif; padding: 24px;">
      <div style="max-width: 400px; width: 100%; background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 32px; text-align: center;">
        <div style="display: inline-flex; align-items: center; justify-content: center; width: 64px; height: 64px; background: rgba(56, 189, 248, 0.1); color: #38bdf8; border-radius: 16px; margin-bottom: 24px; font-size: 32px; font-weight: bold; animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;">
          ⚡
        </div>
        <h1 style="font-size: 24px; font-weight: 800; letter-spacing: -0.025em; color: white; margin-bottom: 8px;">
          Angular + TypeScript
        </h1>
        <p style="font-size: 12px; color: #94a3b8; margin-bottom: 24px;">
          Your Angular app is running in WebContainer!
        </p>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(51, 65, 85, 0.6); border-radius: 12px; padding: 16px; margin-bottom: 24px;">
          <p style="font-size: 11px; font-family: monospace; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">
            Interactive Counter
          </p>
          <p style="font-size: 14px; color: #e2e8f0;">
            Angular is ready! 🚀
          </p>
        </div>
        <p style="font-size: 10px; color: #475569;">Edit src/app/app.component.ts to start building</p>
      </div>
    </div>
    <style>
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    </style>
  \`
})
export class AppComponent {
  title = 'angular-demo';
}
`;
            await instance.fs.writeFile('src/app/app.component.ts', appComponent);
          }
        }

        const installProcess = await instance.spawn('npm', [
          'install',
          '--legacy-peer-deps',
          '--no-audit',
          '--no-fund',
        ]);
        installProcessRef.current = installProcess;

        installProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              onTerminalWrite?.(data);
            },
          })
        );

        const installCode = await installProcess.exit;
        if (installCode !== 0) {
          onTerminalWrite?.(
            '\x1b[33m⚠️ Some dependencies had issues. Trying fallback install...\x1b[0m\r\n'
          );
          const fallbackInstall = await instance.spawn('npm', ['install', '--force', '--no-audit']);
          await fallbackInstall.exit;
        }
        installProcessRef.current = null;

        // For Angular, use ng serve
        if (framework === 'angular') {
          onTerminalWrite?.('🚀 Starting Angular dev server with ng serve...\r\n');
          const devProcess = await instance.spawn('npx', [
            'ng',
            'serve',
            '--host=0.0.0.0',
            '--port=4200',
            '--disable-host-check',
          ]);
          devProcessRef.current = devProcess;

          devProcess.output.pipeTo(
            new WritableStream({
              write(data) {
                onTerminalWrite?.(data);
              },
            })
          );

          instance.on('server-ready', (port: number, url: string) => {
            setPreviewUrl(url);
            notify.success('Dev Port Online', `Angular server running on port ${port}`);
          });

          // For all other frameworks
        } else {
          onTerminalWrite?.(`\x1b[32m🚀 Starting dev server: npm run ${startCommand}\x1b[0m\r\n`);
          const devProcess = await instance.spawn('npm', ['run', startCommand]);
          devProcessRef.current = devProcess;

          devProcess.output.pipeTo(
            new WritableStream({
              write(data) {
                onTerminalWrite?.(data);
              },
            })
          );

          instance.on('server-ready', (port: number, url: string) => {
            setPreviewUrl(url);
            notify.success('Dev Port Online', `Server running on port ${port}`);
          });
        }
      } catch (err) {
        console.error('Container initialization error:', err);
        onTerminalWrite?.('\r\n\x1b[1;31m❌ Sandbox compiler instantiation failed.\x1b[0m\r\n');
        if (err instanceof Error) {
          onTerminalWrite?.(`\x1b[31mError: ${err.message}\x1b[0m\r\n`);
        }
      }
    }

    initializeContainerRuntime();

    return () => {
      if (devProcessRef.current) {
        devProcessRef.current.kill().catch(console.error);
      }
      if (installProcessRef.current) {
        installProcessRef.current.kill().catch(console.error);
      }
    };
  }, [isLoading, templateData, onTerminalWrite]);

  const saveTemplateData = useCallback(
    async (data: TemplateFolder) => {
      try {
        await saveUpdatedCode(id, data);
        setTemplateData(data);
      } catch (err) {
        console.error(err);
        notify.error('Failed to persist VFS modifications');
      }
    },
    [id]
  );

  const addNewFile = useCallback(
    async (parentPath: string, name: string, ext: string) => {
      if (!templateData) return;
      const newFile: TemplateFile = { filename: name, fileExtension: ext, content: '\n' };
      try {
        const instance = await getWebContainer();
        const relativeFilePath =
          parentPath === 'Root' ? `${name}.${ext}` : `${parentPath}/${name}.${ext}`;
        await instance.fs.writeFile(relativeFilePath, '\n');
      } catch (e) {
        console.error(e);
      }

      const updated = addItemToTree(templateData, 'Root', parentPath, newFile);
      await saveTemplateData(updated);
    },
    [templateData, saveTemplateData]
  );

  const addNewFolder = useCallback(
    async (parentPath: string, folderName: string) => {
      if (!templateData) return;
      const newFolder: TemplateFolder = { folderName, items: [] };
      try {
        const instance = await getWebContainer();
        const relativeFolderPath =
          parentPath === 'Root' ? folderName : `${parentPath}/${folderName}`;
        await instance.fs.mkdir(relativeFolderPath, { recursive: true });
      } catch (e) {
        console.error(e);
      }

      const updated = addItemToTree(templateData, 'Root', parentPath, newFolder);
      await saveTemplateData(updated);
    },
    [templateData, saveTemplateData]
  );

  const renameNodeItem = useCallback(
    async (targetPath: string, isFolder: boolean, newName: string, newExt?: string) => {
      if (!templateData) return;
      const updated = renameItemInTree(templateData, 'Root', targetPath, isFolder, newName, newExt);
      await saveTemplateData(updated);
    },
    [templateData, saveTemplateData]
  );

  const deleteNodeItem = useCallback(
    async (targetPath: string, isFolder: boolean) => {
      if (!templateData) return;
      try {
        const instance = await getWebContainer();
        await instance.fs.rm(targetPath, { recursive: true });
      } catch (e) {
        console.error(e);
      }

      const updated = deleteItemFromTree(templateData, 'Root', targetPath, isFolder);
      await saveTemplateData(updated);
    },
    [templateData, saveTemplateData]
  );

  const updateActiveFileContent = useCallback(
    async (targetPath: string, newContent: string) => {
      if (!templateData) return;

      const updated = updateFileContentInTree(templateData, 'Root', targetPath, newContent);
      setTemplateData(updated);

      try {
        const instance = await getWebContainer();
        await instance.fs.writeFile(targetPath, newContent);
        console.log(`✅ File updated: ${targetPath}`);
      } catch (err) {
        console.error(`Failed to write file ${targetPath}:`, err);
      }
    },
    [templateData]
  );

  useEffect(() => {
    loadPlayground();
  }, [loadPlayground]);

  return {
    playgroundData,
    templateData,
    isLoading,
    error,
    previewUrl,
    loadPlayground,
    saveTemplateData,
    addNewFile,
    addNewFolder,
    renameNodeItem,
    deleteNodeItem,
    updateActiveFileContent,
    killDevServer,
  };
};
