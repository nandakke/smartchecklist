import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import { TemplateList, TemplateForm } from './components/TemplateList';
import { ChecklistList, ChecklistForm } from './components/ChecklistList';
import type { Template, Checklist } from './types';
import './App.css';

const AppContent: React.FC = () => {
  const { state } = useApp();
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [editingChecklist, setEditingChecklist] = useState<Checklist | null>(null);

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
  };

  const handleEditChecklist = (checklist: Checklist) => {
    setEditingChecklist(checklist);
  };

  const handleCancelEdit = () => {
    setEditingTemplate(null);
    setEditingChecklist(null);
  };

  return (
    <div className="app">
      <Navbar />
      
      <main className="main-content">
        {editingTemplate ? (
          <TemplateForm 
            template={editingTemplate} 
            onCancel={handleCancelEdit} 
          />
        ) : editingChecklist ? (
          <ChecklistForm 
            checklist={editingChecklist} 
            onCancel={handleCancelEdit} 
          />
        ) : (
          <>
            {state.currentView === 'templates' && (
              <TemplateList onEdit={handleEditTemplate} />
            )}
            {state.currentView === 'checklists' && (
              <ChecklistList onEdit={handleEditChecklist} />
            )}
          </>
        )}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
