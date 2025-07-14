import React, { useState } from 'react';
import type { Checklist, ChecklistItem } from '../types';
import { useApp } from '../context/AppContext';
import { openDirectory, validatePath, formatPathForDisplay } from '../utils/pathUtils';

interface ChecklistListProps {
  onEdit: (checklist: Checklist) => void;
}

const ChecklistList: React.FC<ChecklistListProps> = ({ onEdit }) => {
  const { state, actions } = useApp();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`チェックリスト「${name}」を削除しますか？`)) {
      actions.deleteChecklist(id);
    }
  };

  const getCompletionRate = (checklist: Checklist): number => {
    if (checklist.items.length === 0) return 0;
    const completed = checklist.items.filter(item => item.completed).length;
    return Math.round((completed / checklist.items.length) * 100);
  };

  const getStatusText = (checklist: Checklist): string => {
    const rate = getCompletionRate(checklist);
    if (rate === 100) return '完了';
    if (rate === 0) return '未開始';
    return '進行中';
  };

  const getStatusColor = (checklist: Checklist): string => {
    const rate = getCompletionRate(checklist);
    if (rate === 100) return 'success';
    if (rate === 0) return 'danger';
    return 'warning';
  };

  if (showCreateForm) {
    return <ChecklistForm onCancel={() => setShowCreateForm(false)} />;
  }

  return (
    <div className="checklist-list">
      <div className="list-header">
        <h2>✅ チェックリスト一覧</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateForm(true)}
        >
          ➕ 新規作成
        </button>
      </div>

      {state.checklists.length === 0 ? (
        <div className="empty-state">
          <p>チェックリストがありません</p>
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateForm(true)}
          >
            最初のチェックリストを作成
          </button>
        </div>
      ) : (
        <div className="checklist-grid">
          {state.checklists.map(checklist => (
            <div key={checklist.id} className="checklist-card">
              <div className="card-header">
                <h3>{checklist.name}</h3>
                <div className="card-actions">
                  <button 
                    className="btn btn-sm btn-secondary"
                    onClick={() => onEdit(checklist)}
                    title="編集"
                  >
                    ✏️
                  </button>
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(checklist.id, checklist.name)}
                    title="削除"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              <div className="card-body">
                <p className="checklist-description">{checklist.description}</p>
                
                <div className="progress-section">
                  <div className="progress-info">
                    <span className={`status status-${getStatusColor(checklist)}`}>
                      {getStatusText(checklist)}
                    </span>
                    <span className="progress-text">
                      {getCompletionRate(checklist)}% 
                      ({checklist.items.filter(item => item.completed).length}/{checklist.items.length})
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${getCompletionRate(checklist)}%` }}
                    />
                  </div>
                </div>

                <div className="checklist-stats">
                  <span className="item-count">{checklist.items.length} 項目</span>
                  <span className="created-date">
                    作成: {checklist.createdAt.toLocaleDateString()}
                  </span>
                </div>

                <div className="checklist-items-preview">
                  {checklist.items.slice(0, 3).map(item => (
                    <div key={item.id} className="preview-item">
                      <span className={`item-checkbox ${item.completed ? 'checked' : ''}`}>
                        {item.completed ? '✓' : '○'}
                      </span>
                      <span className={`item-text ${item.completed ? 'completed' : ''}`}>
                        {item.content}
                      </span>
                      {item.directoryPath && (
                        <button
                          className="directory-link"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDirectory(item.directoryPath!);
                          }}
                          title={`フォルダを開く: ${item.directoryPath}`}
                        >
                          📁 {formatPathForDisplay(item.directoryPath)}
                        </button>
                      )}
                    </div>
                  ))}
                  {checklist.items.length > 3 && (
                    <div className="more-items">
                      +{checklist.items.length - 3} 項目
                    </div>
                  )}
                </div>

                {checklist.templateId && (
                  <div className="template-info">
                    📝 テンプレートから作成
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// チェックリスト作成・編集フォーム
interface ChecklistFormProps {
  checklist?: Checklist;
  onCancel: () => void;
}

const ChecklistForm: React.FC<ChecklistFormProps> = ({ checklist, onCancel }) => {
  const { state, actions } = useApp();
  const [name, setName] = useState(checklist?.name || '');
  const [description, setDescription] = useState(checklist?.description || '');
  const [selectedTemplateId, setSelectedTemplateId] = useState(checklist?.templateId || '');
  const [items, setItems] = useState<ChecklistItem[]>(
    checklist?.items.map(item => ({
      ...item,
      directoryPath: item.directoryPath || ''
    })) || [{ 
      id: crypto.randomUUID(), 
      content: '', 
      completed: false, 
      order: 0,
      directoryPath: ''
    }]
  );

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    
    if (templateId) {
      const template = state.templates.find(t => t.id === templateId);
      if (template) {
        setItems(template.items.map(item => ({
          id: crypto.randomUUID(),
          content: item.content,
          completed: false,
          order: item.order,
          directoryPath: (item as any).directoryPath || '',
        })));
      }
    }
  };

  const addItem = () => {
    setItems([...items, { 
      id: crypto.randomUUID(), 
      content: '', 
      completed: false,
      order: items.length,
      directoryPath: ''
    }]);
  };

  const updateItem = (id: string, content: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, content } : item
    ));
  };

  const updateItemPath = (id: string, directoryPath: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, directoryPath } : item
    ));
  };

  const toggleItem = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('チェックリスト名を入力してください');
      return;
    }

    const validItems = items.filter(item => item.content.trim());
    if (validItems.length === 0) {
      alert('少なくとも1つの項目を入力してください');
      return;
    }

    const checklistData = {
      name: name.trim(),
      description: description.trim(),
      templateId: selectedTemplateId || undefined,
      items: validItems.map((item, index) => ({
        id: item.id,
        content: item.content.trim(),
        completed: item.completed,
        order: index,
        directoryPath: item.directoryPath || undefined,
      })),
    };

    if (checklist) {
      // 完了状態の更新
      const allCompleted = validItems.every(item => item.completed);
      const wasCompleted = checklist.completedAt !== undefined;
      
      actions.updateChecklist(checklist.id, {
        ...checklistData,
        completedAt: allCompleted && !wasCompleted ? new Date() : 
                    !allCompleted && wasCompleted ? undefined : 
                    checklist.completedAt,
      });
    } else {
      actions.addChecklist(checklistData);
    }

    onCancel();
  };

  return (
    <div className="checklist-form">
      <div className="form-header">
        <h2>{checklist ? '✅ チェックリスト編集' : '✅ 新規チェックリスト作成'}</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">チェックリスト名 *</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例: 今日のタスク"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">説明</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="チェックリストの説明を入力..."
            rows={3}
          />
        </div>

        {!checklist && state.templates.length > 0 && (
          <div className="form-group">
            <label htmlFor="template">テンプレートから作成</label>
            <select
              id="template"
              value={selectedTemplateId}
              onChange={(e) => handleTemplateChange(e.target.value)}
            >
              <option value="">テンプレートを選択...</option>
              {state.templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name} ({template.items.length} 項目)
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="form-group">
          <label>チェック項目 *</label>
          <div className="items-list">
            {items.map((item, index) => (
              <div key={item.id} className="item-input-group checklist-item">
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => toggleItem(item.id)}
                />
                <span className="item-number">{index + 1}.</span>
                <div className="item-inputs">
                  <input
                    type="text"
                    value={item.content}
                    onChange={(e) => updateItem(item.id, e.target.value)}
                    placeholder="チェック項目を入力..."
                    className={item.completed ? 'completed' : ''}
                  />
                  <input
                    type="text"
                    value={item.directoryPath || ''}
                    onChange={(e) => updateItemPath(item.id, e.target.value)}
                    placeholder="ディレクトリパス（任意）: C:\Users\..."
                    className="directory-input"
                  />
                  {item.directoryPath && validatePath(item.directoryPath) && (
                    <button
                      type="button"
                      className="test-path-btn"
                      onClick={() => openDirectory(item.directoryPath!)}
                      title="フォルダを開いてテスト"
                    >
                      📁
                    </button>
                  )}
                  {item.directoryPath && !validatePath(item.directoryPath) && (
                    <span className="path-error" title="無効なパス形式です">
                      ⚠️
                    </span>
                  )}
                </div>
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
            {checklist ? '更新' : '作成'}
          </button>
        </div>
      </form>
    </div>
  );
};

export { ChecklistList, ChecklistForm };
