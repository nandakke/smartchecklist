import type { Template, Checklist } from '../types';

// ローカルストレージキー
const TEMPLATES_KEY = 'smartchecklist_templates';
const CHECKLISTS_KEY = 'smartchecklist_checklists';

// テンプレート操作
export const templateStorage = {
  getAll: (): Template[] => {
    const stored = localStorage.getItem(TEMPLATES_KEY);
    if (!stored) return [];
    
    try {
      const templates = JSON.parse(stored);
      return templates.map((template: any) => ({
        ...template,
        createdAt: new Date(template.createdAt),
        updatedAt: new Date(template.updatedAt),
      }));
    } catch {
      return [];
    }
  },

  save: (templates: Template[]): void => {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
  },

  add: (template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>): Template => {
    const templates = templateStorage.getAll();
    const newTemplate: Template = {
      ...template,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    templates.push(newTemplate);
    templateStorage.save(templates);
    return newTemplate;
  },

  update: (id: string, updates: Partial<Omit<Template, 'id' | 'createdAt'>>): Template | null => {
    const templates = templateStorage.getAll();
    const index = templates.findIndex(t => t.id === id);
    
    if (index === -1) return null;
    
    templates[index] = {
      ...templates[index],
      ...updates,
      updatedAt: new Date(),
    };
    
    templateStorage.save(templates);
    return templates[index];
  },

  delete: (id: string): boolean => {
    const templates = templateStorage.getAll();
    const filteredTemplates = templates.filter(t => t.id !== id);
    
    if (filteredTemplates.length === templates.length) return false;
    
    templateStorage.save(filteredTemplates);
    return true;
  },
};

// チェックリスト操作
export const checklistStorage = {
  getAll: (): Checklist[] => {
    const stored = localStorage.getItem(CHECKLISTS_KEY);
    if (!stored) return [];
    
    try {
      const checklists = JSON.parse(stored);
      return checklists.map((checklist: any) => ({
        ...checklist,
        createdAt: new Date(checklist.createdAt),
        updatedAt: new Date(checklist.updatedAt),
        completedAt: checklist.completedAt ? new Date(checklist.completedAt) : undefined,
      }));
    } catch {
      return [];
    }
  },

  save: (checklists: Checklist[]): void => {
    localStorage.setItem(CHECKLISTS_KEY, JSON.stringify(checklists));
  },

  add: (checklist: Omit<Checklist, 'id' | 'createdAt' | 'updatedAt'>): Checklist => {
    const checklists = checklistStorage.getAll();
    const newChecklist: Checklist = {
      ...checklist,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    checklists.push(newChecklist);
    checklistStorage.save(checklists);
    return newChecklist;
  },

  update: (id: string, updates: Partial<Omit<Checklist, 'id' | 'createdAt'>>): Checklist | null => {
    const checklists = checklistStorage.getAll();
    const index = checklists.findIndex(c => c.id === id);
    
    if (index === -1) return null;
    
    checklists[index] = {
      ...checklists[index],
      ...updates,
      updatedAt: new Date(),
    };
    
    checklistStorage.save(checklists);
    return checklists[index];
  },

  delete: (id: string): boolean => {
    const checklists = checklistStorage.getAll();
    const filteredChecklists = checklists.filter(c => c.id !== id);
    
    if (filteredChecklists.length === checklists.length) return false;
    
    checklistStorage.save(filteredChecklists);
    return true;
  },

  createFromTemplate: (template: Template, name: string, description?: string): Checklist => {
    const checklistData = {
      name,
      description: description || template.description,
      templateId: template.id,
      items: template.items.map(item => ({
        ...item,
        id: crypto.randomUUID(),
        completed: false,
      })),
    };
    
    return checklistStorage.add(checklistData);
  },
};
