import { TemplateFile, TemplateFolder, TemplateItem } from '@/features/playground/types';

export interface FileNode {
  path: string;
  name: string;
  extension?: string;
  content?: string;
  type: 'file' | 'folder';
  children?: FileNode[];
}

export class CodeContextBuilder {
  private files: TemplateFile[] = [];
  private fileTree: FileNode[] = [];
  private rootFolder: TemplateFolder | null = null;

  constructor(templateData: TemplateFolder | null) {
    if (templateData) {
      this.rootFolder = templateData;
      this.files = this.extractFiles(templateData);
      this.fileTree = this.buildFileTree(templateData);
    }
  }

  private isFolder(item: TemplateItem): item is TemplateFolder {
    return 'folderName' in item && 'items' in item && Array.isArray((item as TemplateFolder).items);
  }

  private extractFiles(folder: TemplateFolder): TemplateFile[] {
    let files: TemplateFile[] = [];

    folder.items.forEach((item: TemplateItem) => {
      if (this.isFolder(item)) {
        files = files.concat(this.extractFiles(item as TemplateFolder));
      } else {
        files.push(item as TemplateFile);
      }
    });

    return files;
  }

  private buildFileTree(folder: TemplateFolder, parentPath: string = ''): FileNode[] {
    const nodes: FileNode[] = [];

    folder.items.forEach((item: TemplateItem) => {
      let currentPath: string;
      let itemName: string;

      if (this.isFolder(item)) {
        itemName = (item as TemplateFolder).folderName;
        currentPath = parentPath ? `${parentPath}/${itemName}` : itemName;

        const folderNode: FileNode = {
          path: currentPath,
          name: itemName,
          type: 'folder',
          children: this.buildFileTree(item as TemplateFolder, currentPath),
        };
        nodes.push(folderNode);
      } else {
        const file = item as TemplateFile;
        itemName = file.filename;
        const fullName = `${file.filename}.${file.fileExtension}`;
        currentPath = parentPath ? `${parentPath}/${fullName}` : fullName;

        const fileNode: FileNode = {
          path: currentPath,
          name: itemName,
          extension: file.fileExtension,
          content: file.content,
          type: 'file',
        };
        nodes.push(fileNode);
      }
    });

    return nodes;
  }

  getFileContent(filePath: string): string | null {
    let file = this.files.find(
      f => `${f.filename}.${f.fileExtension}` === filePath || f.filename === filePath
    );

    if (file) {
      return file.content;
    }

    const pathParts = filePath.split('/');
    const fileName = pathParts[pathParts.length - 1];
    const ext = fileName.split('.').pop();
    const baseName = fileName.replace(`.${ext}`, '');

    file = this.files.find(f => f.filename === baseName && f.fileExtension === ext);

    return file?.content || null;
  }

  getAllFilesContent(): string {
    if (this.files.length === 0) {
      return 'No files found in workspace.';
    }

    return this.files
      .map(f => `File: ${f.filename}.${f.fileExtension}\n${f.content || ''}\n---`)
      .join('\n');
  }

  getFileContext(filePath?: string): string {
    if (filePath) {
      const content = this.getFileContent(filePath);
      if (content !== null) {
        return content;
      }

      return this.getAllFilesContent();
    }
    return this.getAllFilesContent();
  }

  getProjectOverview(): string {
    const pkgFile = this.files.find(f => f.filename === 'package' && f.fileExtension === 'json');

    if (pkgFile && pkgFile.content) {
      try {
        const parsed = JSON.parse(pkgFile.content);
        const deps = Object.keys(parsed.dependencies || {});
        const devDeps = Object.keys(parsed.devDependencies || {});
        const allDeps = [...deps, ...devDeps];

        let overview = `Project: ${parsed.name || 'Unknown'}\n`;
        overview += `Version: ${parsed.version || 'N/A'}\n`;
        overview += `Dependencies: ${allDeps.length > 0 ? allDeps.join(', ') : 'None'}\n`;

        const frameworks = ['next', 'react', 'vue', '@angular/core', 'express', 'hono'];
        const detected = frameworks.filter(f => allDeps.some(d => d.includes(f)));
        if (detected.length > 0) {
          overview += `Framework(s): ${detected.join(', ')}\n`;
        }

        const scripts = Object.keys(parsed.scripts || {});
        if (scripts.length > 0) {
          overview += `Scripts: ${scripts.join(', ')}\n`;
        }

        return overview;
      } catch (e) {
        console.error(e);
        return 'Project: Unknown (invalid package.json)';
      }
    }
    return 'Project: Unknown (no package.json found)';
  }

  getFilesForSummary(): Array<{ path: string; content: string }> {
    return this.files.map(f => ({
      path: `${f.filename}.${f.fileExtension}`,
      content: f.content || '',
    }));
  }

  getContextSize(): number {
    return this.files.reduce((acc, f) => acc + (f.content?.length || 0), 0);
  }

  getFileTreeString(): string {
    if (!this.rootFolder) {
      return 'No files in workspace';
    }
    return this.buildTreeString(this.rootFolder);
  }

  private buildTreeString(folder: TemplateFolder, prefix: string = ''): string {
    let result = '';
    const items = folder.items;

    items.forEach((item: TemplateItem, index: number) => {
      const isItemLast = index === items.length - 1;
      const connector = isItemLast ? '└── ' : '├── ';
      const newPrefix = prefix + (isItemLast ? '    ' : '│   ');

      if (this.isFolder(item)) {
        const folderItem = item as TemplateFolder;
        result += `${prefix}${connector}📁 ${folderItem.folderName}/\n`;
        result += this.buildTreeString(folderItem, newPrefix);
      } else {
        const file = item as TemplateFile;
        const icon = this.getFileIcon(file.fileExtension);
        result += `${prefix}${connector}${icon} ${file.filename}.${file.fileExtension}\n`;
      }
    });

    return result;
  }

  private getFileIcon(ext: string): string {
    const icons: Record<string, string> = {
      ts: '📘',
      tsx: '📘',
      js: '📜',
      jsx: '📜',
      json: '📋',
      html: '🌐',
      css: '🎨',
      md: '📝',
      yml: '⚙️',
      yaml: '⚙️',
      env: '🔐',
      gitignore: '🙈',
      png: '🖼️',
      jpg: '🖼️',
      jpeg: '🖼️',
      svg: '🎯',
      ico: '🖼️',
      xml: '📄',
      txt: '📄',
    };
    return icons[ext?.toLowerCase() || ''] || '📄';
  }

  getFileTree(): FileNode[] {
    return this.fileTree;
  }

  findFilesByExtension(ext: string): TemplateFile[] {
    return this.files.filter(f => f.fileExtension === ext);
  }

  findFilesByName(pattern: string): TemplateFile[] {
    const regex = new RegExp(pattern, 'i');
    return this.files.filter(f => regex.test(f.filename));
  }

  getFileCount(): number {
    return this.files.length;
  }

  getFolderCount(): number {
    let count = 0;
    const countFolders = (folder: TemplateFolder) => {
      folder.items.forEach((item: TemplateItem) => {
        if (this.isFolder(item)) {
          count++;
          countFolders(item as TemplateFolder);
        }
      });
    };
    if (this.rootFolder) {
      countFolders(this.rootFolder);
    }
    return count;
  }

  getStructureSummary(): string {
    const fileCount = this.getFileCount();
    const folderCount = this.getFolderCount();
    const overview = this.getProjectOverview();

    return `${overview}\nFiles: ${fileCount}\nFolders: ${folderCount}\n\n${this.getFileTreeString()}`;
  }

  getRootName(): string {
    return this.rootFolder?.folderName || 'Root';
  }

  isEmpty(): boolean {
    return this.files.length === 0;
  }

  getAllFilePaths(): string[] {
    return this.files.map(f => `${f.filename}.${f.fileExtension}`);
  }

  getFilesByDirectory(directoryPath: string): TemplateFile[] {
    const findFolder = (nodes: FileNode[], path: string): FileNode | null => {
      for (const node of nodes) {
        if (node.path === path && node.type === 'folder') {
          return node;
        }
        if (node.children) {
          const found = findFolder(node.children, path);
          if (found) return found;
        }
      }
      return null;
    };

    const folderNode = findFolder(this.fileTree, directoryPath);
    if (!folderNode || !folderNode.children) {
      return [];
    }

    const fileNodes = folderNode.children.filter((child: FileNode) => child.type === 'file');
    return fileNodes
      .map((node: FileNode) => {
        const ext = node.extension || '';
        const name = node.name;
        return this.files.find(f => f.filename === name && f.fileExtension === ext);
      })
      .filter((f): f is TemplateFile => f !== undefined);
  }
}

export const createContextBuilder = (
  templateData: TemplateFolder | null
): CodeContextBuilder | null => {
  if (!templateData) {
    return null;
  }
  return new CodeContextBuilder(templateData);
};

export const createEmptyContextBuilder = (): CodeContextBuilder => {
  const emptyFolder: TemplateFolder = {
    folderName: 'Root',
    items: [],
  };
  return new CodeContextBuilder(emptyFolder);
};
