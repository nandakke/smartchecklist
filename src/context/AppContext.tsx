import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Template, Checklist, AppState } from '../types';
import { templateStorage, checklistStorage } from '../utils/storage';

// アクション型定義
type AppAction =
  | { type: 'SET_VIEW'; payload: 'templates' | 'checklists' }
  | { type: 'LOAD_DATA' }
  | { type: 'ADD_TEMPLATE'; payload: Template }
  | { type: 'UPDATE_TEMPLATE'; payload: Template }
  | { type: 'DELETE_TEMPLATE'; payload: string }
  | { type: 'ADD_CHECKLIST'; payload: Checklist }
  | { type: 'UPDATE_CHECKLIST'; payload: Checklist }
  | { type: 'DELETE_CHECKLIST'; payload: string };

// 初期状態
const initialState: AppState = {
  templates: [],
  checklists: [],
  currentView: 'templates',
};

// レデューサー
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, currentView: action.payload };
    
    case 'LOAD_DATA':
      return {
        ...state,
        templates: templateStorage.getAll(),
        checklists: checklistStorage.getAll(),
      };
    
    case 'ADD_TEMPLATE':
      return {
        ...state,
        templates: [...state.templates, action.payload],
      };
    
    case 'UPDATE_TEMPLATE':
      return {
        ...state,
        templates: state.templates.map(t => 
          t.id === action.payload.id ? action.payload : t
        ),
      };
    
    case 'DELETE_TEMPLATE':
      return {
        ...state,
        templates: state.templates.filter(t => t.id !== action.payload),
      };
    
    case 'ADD_CHECKLIST':
      return {
        ...state,
        checklists: [...state.checklists, action.payload],
      };
    
    case 'UPDATE_CHECKLIST':
      return {
        ...state,
        checklists: state.checklists.map(c => 
          c.id === action.payload.id ? action.payload : c
        ),
      };
    
    case 'DELETE_CHECKLIST':
      return {
        ...state,
        checklists: state.checklists.filter(c => c.id !== action.payload),
      };
    
    default:
      return state;
  }
};

// Context型定義
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  actions: {
    setView: (view: 'templates' | 'checklists') => void;
    addTemplate: (template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateTemplate: (id: string, updates: Partial<Omit<Template, 'id' | 'createdAt'>>) => void;
    deleteTemplate: (id: string) => void;
    addChecklist: (checklist: Omit<Checklist, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateChecklist: (id: string, updates: Partial<Omit<Checklist, 'id' | 'createdAt'>>) => void;
    deleteChecklist: (id: string) => void;
    createChecklistFromTemplate: (template: Template, name: string, description?: string) => void;
  };
}

// Context作成
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider Props
interface AppProviderProps {
  children: ReactNode;
}

// Provider コンポーネント
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // 初期データ読み込み
  useEffect(() => {
    dispatch({ type: 'LOAD_DATA' });
  }, []);

  // アクション関数
  const actions = {
    setView: (view: 'templates' | 'checklists') => {
      dispatch({ type: 'SET_VIEW', payload: view });
    },

    addTemplate: (templateData: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newTemplate = templateStorage.add(templateData);
      dispatch({ type: 'ADD_TEMPLATE', payload: newTemplate });
    },

    updateTemplate: (id: string, updates: Partial<Omit<Template, 'id' | 'createdAt'>>) => {
      const updatedTemplate = templateStorage.update(id, updates);
      if (updatedTemplate) {
        dispatch({ type: 'UPDATE_TEMPLATE', payload: updatedTemplate });
      }
    },

    deleteTemplate: (id: string) => {
      if (templateStorage.delete(id)) {
        dispatch({ type: 'DELETE_TEMPLATE', payload: id });
      }
    },

    addChecklist: (checklistData: Omit<Checklist, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newChecklist = checklistStorage.add(checklistData);
      dispatch({ type: 'ADD_CHECKLIST', payload: newChecklist });
    },

    updateChecklist: (id: string, updates: Partial<Omit<Checklist, 'id' | 'createdAt'>>) => {
      const updatedChecklist = checklistStorage.update(id, updates);
      if (updatedChecklist) {
        dispatch({ type: 'UPDATE_CHECKLIST', payload: updatedChecklist });
      }
    },

    deleteChecklist: (id: string) => {
      if (checklistStorage.delete(id)) {
        dispatch({ type: 'DELETE_CHECKLIST', payload: id });
      }
    },

    createChecklistFromTemplate: (template: Template, name: string, description?: string) => {
      const newChecklist = checklistStorage.createFromTemplate(template, name, description);
      dispatch({ type: 'ADD_CHECKLIST', payload: newChecklist });
    },
  };

  const contextValue: AppContextType = {
    state,
    dispatch,
    actions,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Custom Hook
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
