import React, { useState } from 'react';
import type { Template } from '../types';
import { useApp } from '../context/AppContext';
import { validatePath, openDirectory, formatPathForDisplay } from '../utils/pathUtils';

interface TemplateListProps {
  onEdit: (template: Template) => void;
}

const TemplateList: React.FC<TemplateListProps> = ({ onEdit }) => {
  const { state, actions } = useApp();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`テンプレート「${name}」を削除しますか？`)) {
      actions.deleteTemplate(id);
    }
  };

  const handleCreateFromTemplate = (template: Template) => {
    const name = window.prompt('チェックリスト名を入力してください:', template.name);
    if (name) {
      actions.createChecklistFromTemplate(template, name);
      actions.setView('checklists');
    }
  };

  if (showCreateForm) {
    return <TemplateForm onCancel={() => setShowCreateForm(false)} />;
  }

  return (
    <div className="template-list">
      <div className="list-header">
        <h2>📝 テンプレート一覧</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateForm(true)}
        >
          ➕ 新規作成
        </button>
      </div>

      {state.templates.length === 0 ? (
        <div className="empty-state">
          <p>テンプレートがありません</p>
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateForm(true)}
          >
            最初のテンプレートを作成
          </button>
        </div>
      ) : (
        <div className="template-grid">
          {state.templates.map(template => (
            <div key={template.id} className="template-card">
              <div className="card-header">
                <h3>{template.name}</h3>
                <div className="card-actions">
                  <button 
                    className="btn btn-sm btn-secondary"
                    onClick={() => onEdit(template)}
                    title="編集"
                  >
                    ✏️
                  </button>
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(template.id, template.name)}
                    title="削除"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              <div className="card-body">
                <p className="template-description">{template.description}</p>
                <div className="template-stats">
                  <span className="item-count">{template.items.length} 項目</span>
                  <span className="created-date">
                    作成: {template.createdAt.toLocaleDateString()}
                  </span>
                </div>
                
                {template.directoryPath && (
                  <div className="template-directory">
                    <button
                      className="directory-link"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDirectory(template.directoryPath!);
                      }}
                      title={`フォルダを開く: ${template.directoryPath}`}
                    >
                      📁 {formatPathForDisplay(template.directoryPath)}
                    </button>
                  </div>
                )}
                
                <div className="template-items-preview">
                  {template.items.slice(0, 3).map(item => (
                    <div key={item.id} className="preview-item">
                      • {item.content}
                    </div>
                  ))}
                  {template.items.length > 3 && (
                    <div className="more-items">
                      +{template.items.length - 3} 項目
                    </div>
                  )}
                </div>
              </div>
              
              <div className="card-footer">
                <button 
                  className="btn btn-primary btn-full"
                  onClick={() => handleCreateFromTemplate(template)}
                >
                  📋 チェックリスト作成
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// テンプレート作成・編集フォーム
interface TemplateFormProps {
  template?: Template;
  onCancel: () => void;
}

const TemplateForm: React.FC<TemplateFormProps> = ({ template, onCancel }) => {
  const { actions } = useApp();
  const [name, setName] = useState(template?.name || '');
  const [description, setDescription] = useState(template?.description || '');
  const [directoryPath, setDirectoryPath] = useState(template?.directoryPath || '');
  const [items, setItems] = useState(
    template?.items || [{ id: crypto.randomUUID(), content: '', order: 0 }]
  );

  const addItem = () => {
    setItems([...items, { 
      id: crypto.randomUUID(), 
      content: '', 
      order: items.length
    }]);
  };

  const updateItem = (id: string, content: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, content } : item
    ));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('テンプレート名を入力してください');
      return;
    }

    const validItems = items.filter(item => item.content.trim());
    if (validItems.length === 0) {
      alert('少なくとも1つの項目を入力してください');
      return;
    }

    const templateData = {
      name: name.trim(),
      description: description.trim(),
      directoryPath: directoryPath.trim() || undefined,
      items: validItems.map((item, index) => ({
        id: item.id,
        content: item.content.trim(),
        order: index,
      })),
    };

    if (template) {
      actions.updateTemplate(template.id, templateData);
    } else {
      actions.addTemplate(templateData);
    }

    onCancel();
  };

  return (
    <div className="template-form">
      <div className="form-header">
        <h2>{template ? '📝 テンプレート編集' : '📝 新規テンプレート作成'}</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">テンプレート名 *</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例: 旅行準備チェックリスト"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">説明</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="このテンプレートの説明を入力..."
            rows={3}
          />
        </div>

        <div className="form-group">
          <label htmlFor="directoryPath">ディレクトリパス（任意）</label>
          <div className="directory-path-input">
            <input
              id="directoryPath"
              type="text"
              value={directoryPath}
              onChange={(e) => setDirectoryPath(e.target.value)}
              placeholder="例: C:\Users\username\Projects\MyProject"
              className="directory-input"
            />
            {directoryPath && validatePath(directoryPath) && (
              <button
                type="button"
                className="test-path-btn"
                onClick={() => openDirectory(directoryPath)}
                title="フォルダを開いてテスト"
              >
                📁
              </button>
            )}
            {directoryPath && !validatePath(directoryPath) && (
              <span className="path-error" title="無効なパス形式です">
                ⚠️
              </span>
            )}
          </div>
          <small className="form-help">このテンプレートから作成されるチェックリストに自動的に設定されます</small>
        </div>

        <div className="form-group">
          <label>チェック項目 *</label>
          <div className="items-list">
            {items.map((item, index) => (
              <div key={item.id} className="item-input-group">
                <span className="item-number">{index + 1}.</span>
                <input
                  type="text"
                  value={item.content}
                  onChange={(e) => updateItem(item.id, e.target.value)}
                  placeholder="チェック項目を入力..."
                />
                {items.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={() => removeItem(item.id)}
                    title="削除"
                  >
                    ❌
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <button
            type="button"
            className="btn btn-secondary"
            onClick={addItem}
          >
            ➕ 項目を追加
          </button>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            キャンセル
          </button>
          <button type="submit" className="btn btn-primary">
            {template ? '更新' : '作成'}
          </button>
        </div>
      </form>
    </div>
  );
};

export { TemplateList, TemplateForm };
