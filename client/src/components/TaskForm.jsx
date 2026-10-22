import React, { useState } from 'react';
import { Plus, Calendar, Tag, ChevronDown, ChevronUp } from 'lucide-react';

export const TaskForm = ({ onAddTask, isCreating }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      title: title.trim(),
      description: description.trim() || null,
      priority,
      due_date: dueDate || null
    });

    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate('');
    setIsExpanded(false);
  };

  return (
    <section className="glass-card task-creator-card" aria-label="Create Task">
      <form onSubmit={handleSubmit}>
        <div className="creator-top-row">
          <input
            type="text"
            className="form-input"
            placeholder="Add a new task (e.g. Implement refresh token rotation)..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            required
          />

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsExpanded(!isExpanded)}
              title="Toggle additional task details"
              style={{ padding: '10px 12px' }}
            >
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isCreating || !title.trim()}
              style={{ whiteSpace: 'nowrap' }}
            >
              <Plus size={18} />
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="creator-details">
            <div style={{ flex: '2', minWidth: '220px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Optional description or acceptance criteria..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <label htmlFor="priority-select" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <Tag size={14} />
                <span>Priority:</span>
              </label>
              <select
                id="priority-select"
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                style={{ width: 'auto', padding: '6px 10px', fontSize: '0.85rem' }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <label htmlFor="due-date-input" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <Calendar size={14} />
                <span>Due:</span>
              </label>
              <input
                id="due-date-input"
                type="date"
                className="form-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={{ width: 'auto', padding: '6px 10px', fontSize: '0.85rem' }}
              />
            </div>
          </div>
        )}
      </form>
    </section>
  );
};
