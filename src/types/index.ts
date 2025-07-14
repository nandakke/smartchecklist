// 基本的な型定義

export interface ChecklistItem {
  id: string;
  content: string;
  completed: boolean;
  order: number;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  items: Omit<ChecklistItem, 'completed'>[];
  directoryPath?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Checklist {
  id: string;
  name: string;
  description: string;
  templateId?: string;
  items: ChecklistItem[];
  directoryPath?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface AppState {
  templates: Template[];
  checklists: Checklist[];
  currentView: 'templates' | 'checklists';
}
