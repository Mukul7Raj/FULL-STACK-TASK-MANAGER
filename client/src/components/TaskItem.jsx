import React from 'react';
import { CheckCircle2, Circle, Trash2, Calendar, AlertCircle } from 'lucide-react';

export const TaskItem = ({ task, onToggleStatus, onDeleteTask }) => {
  const isCompleted = !!task.is_completed;

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <article className="task-item" id={`task-${task.id}`}>
      <div className="task-left">
        <button
          type="button"
          onClick={() => onToggleStatus(task.id, !isCompleted)}
          className={`checkbox-btn ${isCompleted ? 'checked' : ''}`}
          aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {isCompleted ? <CheckCircle2 size={20} /> : <Circle size={20} />}
        </button>

        <div className="task-content">
          <span className={`task-title ${isCompleted ? 'completed' : ''}`}>
            {task.title}
          </span>

          {task.description && (
            <p className="task-desc">{task.description}</p>
          )}

          <div className="task-meta">
            <span className={`priority-tag priority-${task.priority || 'medium'}`}>
              {task.priority || 'medium'}
            </span>

            {task.due_date && (
              <span className="date-tag">
                <Calendar size={13} />
                <span>{formatDate(task.due_date)}</span>
              </span>
            )}

            {task.isOptimistic && (
              <span style={{ fontSize: '0.7rem', color: '#818cf8', fontStyle: 'italic' }}>
                syncing...
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="task-actions">
        <button
          type="button"
          onClick={() => onDeleteTask(task.id)}
          className="action-icon-btn"
          title="Delete task"
          aria-label="Delete task"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </article>
  );
};
