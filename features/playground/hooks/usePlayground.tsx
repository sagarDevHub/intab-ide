'use client';

import { useCallback, useEffect, useState } from 'react';
import { TemplateFolder, TemplateFile, TemplateItem } from '../types';
import { getPlaygroundById, saveUpdatedCode } from '../actions';
import { notify } from '@/lib/notifications';

interface PlaygroundData {
  id: string;
  title?: string;
  [key: string]: any;
}

interface UsePlaygroundReturn {
  playgroundData: PlaygroundData | null;
  templateData: TemplateFolder | null;
  isLoading: boolean;
  error: string | null;
  loadPlayground: () => Promise<void>;
  saveTemplateData: (data: TemplateFolder) => Promise<void>;
  addNewFile: (parentPath: string, name: string, ext: string) => Promise<void>;
  addNewFolder: (parentPath: string, name: string) => Promise<void>;
  renameNodeItem: (
    targetPath: string,
    isFolder: boolean,
    newName: string,
    newExt?: string
  ) => Promise<void>;
  deleteNodeItem: (targetPath: string, isFolder: boolean) => Promise<void>;
}

// --- Recursive Pure Array Utility Mutators ---

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
    items: folder.items.map(item => {
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
    items: folder.items.map(item => {
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
      .map(item => {
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

// --- Main Hook Export ---

export const usePlayground = (id: string): UsePlaygroundReturn => {
  const [playgroundData, setPlaygroundData] = useState<PlaygroundData | null>(null);
  const [templateData, setTemplateData] = useState<TemplateFolder | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadPlayground = useCallback(async () => {
    if (!id || id === 'undefined') return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await getPlaygroundById(id);

      if (!data) {
        throw new Error('Workspace profile target could not be parsed.');
      }

      setPlaygroundData({
        id: id,
        title: data.title,
        description: data.description,
      });

      const rawContent = data?.templateFile?.[0]?.content;
      if (rawContent) {
        const parsedContent = typeof rawContent === 'string' ? JSON.parse(rawContent) : rawContent;
        setTemplateData(parsedContent as TemplateFolder);
        notify.success('Playground loaded', 'Virtual environment loaded successfully');
        return;
      }

      const res = await fetch(`/api/template/${encodeURIComponent(id)}`);
      if (!res.ok) throw new Error(`Failed to load template: ${res.status}`);
      const templateRes = await res.json();

      if (templateRes.templateJson && Array.isArray(templateRes.templateJson)) {
        setTemplateData({
          folderName: 'Root',
          items: templateRes.templateJson,
        });
      } else {
        setTemplateData(
          templateRes.templateJson || {
            folderName: 'Root',
            items: [],
          }
        );
      }
    } catch (err) {
      console.error('Error loading in playground', err);
      setError('Failed to load playground data');
      notify.error('Failed to load playground data');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const saveTemplateData = useCallback(
    async (data: TemplateFolder) => {
      try {
        await saveUpdatedCode(id, data);
        setTemplateData(data);
        notify.success('Playground updated', 'Changes saved successfully');
      } catch (err) {
        console.error('Error in saving template data:', err);
        notify.error('Failed to save changes');
        throw err;
      }
    },
    [id]
  );

  const addNewFile = useCallback(
    async (parentPath: string, name: string, ext: string) => {
      if (!templateData) return;
      const newFile: TemplateFile = { filename: name, fileExtension: ext, content: '\n' };
      const updated = addItemToTree(templateData, 'Root', parentPath, newFile);
      await saveTemplateData(updated);
    },
    [templateData, saveTemplateData]
  );

  const addNewFolder = useCallback(
    async (parentPath: string, folderName: string) => {
      if (!templateData) return;
      const newFolder: TemplateFolder = { folderName, items: [] };
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
      const updated = deleteItemFromTree(templateData, 'Root', targetPath, isFolder);
      await saveTemplateData(updated);
    },
    [templateData, saveTemplateData]
  );

  useEffect(() => {
    loadPlayground();
  }, [loadPlayground]);

  return {
    playgroundData,
    templateData,
    isLoading,
    error,
    loadPlayground,
    saveTemplateData,
    addNewFile,
    addNewFolder,
    renameNodeItem,
    deleteNodeItem,
  };
};
