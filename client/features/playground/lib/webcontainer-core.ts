import { WebContainer } from '@webcontainer/api';
import { TemplateFolder, TemplateFile } from '../types';

let webContainerInstance: WebContainer | null = null;

// Booting web container on client side.
export async function getWebContainer(): Promise<WebContainer> {
  if (!webContainerInstance) {
    webContainerInstance = await WebContainer.boot();
  }

  return webContainerInstance;
}

export function transformTreeToVFS(folder: TemplateFolder): Record<string, any> {
  const vfs: Record<string, any> = {};

  folder.items.forEach(item => {
    if ('folderName' in item && item.folderName) {
      vfs[item.folderName] = {
        directory: transformTreeToVFS(item as TemplateFolder),
      };
    } else {
      const file = item as TemplateFile;

      const fullKey = `${file.filename}.${file.fileExtension}`;
      vfs[fullKey] = {
        file: {
          contents: file.content || '',
        },
      };
    }
  });
  return vfs;
}
