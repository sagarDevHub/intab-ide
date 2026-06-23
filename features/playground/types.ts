export interface TemplateFile {
  filename: string;
  fileExtension: string;
  content: string;
}

export interface TemplateFolder {
  folderName: string;
  items: (TemplateFile | TemplateFolder)[];
}

export type TemplateItem = TemplateFile | TemplateFolder;

export interface PlaygroundData {
  id: string;
  title?: string;
  description?: string;
  [key: string]: any;
}

export interface ModalContextState {
  isOpen: boolean;
  type: 'createFile' | 'createFolder' | 'rename' | 'delete';
  isFolder: boolean;
  targetPath: string;
  initialValue?: string;
}

export interface OpenedTab {
  id: string;
  filename: string;
  fileExtension: string;
  content: string;
  hasUnsavedChanges?: boolean;
}
