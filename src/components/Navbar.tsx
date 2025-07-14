import React from 'react';
import { useApp } from '../context/AppContext';

const Navbar: React.FC = () => {
  const { state, actions } = useApp();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>📋 Smart Checklist</h1>
      </div>
      
      <div className="navbar-nav">
        <button 
          className={`nav-button ${state.currentView === 'templates' ? 'active' : ''}`}
          onClick={() => actions.setView('templates')}
        >
          📝 テンプレート
        </button>
        <button 
          className={`nav-button ${state.currentView === 'checklists' ? 'active' : ''}`}
          onClick={() => actions.setView('checklists')}
        >
          ✅ チェックリスト
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
